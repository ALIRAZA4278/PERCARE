-- Verifies the four "create does nothing" fixes. No login needed, nothing left behind.
--
-- Run the two parts separately in the Supabase SQL editor.

-- ==================================================================
-- PART A — are these columns really required?
-- Run this on its own. Every row marked "required" is a column the old
-- code either omitted or sent NULL for, which is why those creates failed.
-- ==================================================================
SELECT
  c.table_name,
  c.column_name,
  c.is_nullable,
  CASE WHEN c.is_nullable = 'NO' THEN 'required' ELSE '' END AS note
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND (
    (c.table_name = 'shelter_animals'   AND c.column_name IN ('species','gender','adoption_status','age_years','name'))
 OR (c.table_name = 'stores'            AND c.column_name = 'store_type')
 OR (c.table_name = 'user_bans'         AND c.column_name = 'ban_type')
 OR (c.table_name = 'donation_packages' AND c.column_name = 'amount')
 OR (c.table_name = 'admin_audit_log'   AND c.column_name = 'target_id')
  )
ORDER BY c.table_name, c.column_name;


-- ==================================================================
-- PART B — do the payloads the app sends NOW actually insert?
--
-- Run this block on its own. It deliberately does NOT catch errors, so:
--
--   "Success. No rows returned."  -> all four creates work
--   an error message              -> that is the one still broken, and the
--                                    message names the exact column
--
-- A failure aborts the whole block, so nothing is left behind either way;
-- on success the block deletes its own rows before finishing.
-- ==================================================================
DO $$
DECLARE
  pid uuid;
  sid uuid;
BEGIN
  SELECT id INTO pid FROM profiles LIMIT 1;
  IF pid IS NULL THEN
    RAISE EXCEPTION 'No rows in profiles — create any account in the app first, then re-run.';
  END IF;

  INSERT INTO shelters (owner_id, name, address, city)
  VALUES (pid, 'VERIFY shelter', 'addr', 'Lahore')
  RETURNING id INTO sid;

  -- 1. shelter animals: lowercase enums and the real column names
  INSERT INTO shelter_animals (shelter_id, name, species, gender, adoption_status, age_years)
  VALUES (sid, 'VERIFY Rex', 'dog', 'male', 'available', 2);

  -- 2. seller store: store_type now derived from the account role
  INSERT INTO stores (owner_id, name, store_type)
  VALUES (pid, 'VERIFY store', 'individual');

  -- 3. admin ban: ban_type now supplied
  INSERT INTO user_bans (user_id, banned_by, reason, is_active, ban_type)
  VALUES (pid, pid, 'VERIFY', true, 'permanent');

  -- 4. custom donation package: amount 0 instead of NULL
  INSERT INTO donation_packages (shelter_id, name, amount)
  VALUES (sid, 'VERIFY custom', 0);

  -- 5. feature-flag audit entry: target_id no longer NULL
  INSERT INTO admin_audit_log (admin_id, action, target_type, target_id)
  VALUES (pid, 'VERIFY', 'site_settings', pid);

  -- cleanup
  DELETE FROM donation_packages WHERE shelter_id = sid;
  DELETE FROM shelter_animals   WHERE shelter_id = sid;
  DELETE FROM shelters          WHERE id = sid;
  DELETE FROM stores            WHERE owner_id = pid AND name = 'VERIFY store';
  DELETE FROM user_bans         WHERE reason = 'VERIFY';
  DELETE FROM admin_audit_log   WHERE action = 'VERIFY';
END $$;
