-- PART 2 of 2 — does the payload the app sends NOW actually insert?
--
-- This file holds ONE statement on purpose. The previous version kept both
-- parts together, and Supabase showed the earlier SELECT's table instead of
-- this block's outcome, so the result was never visible.
--
-- Read the outcome like this:
--
--   "Success. No rows returned."  -> all five inserts were accepted
--   an error message              -> that one is still broken, and the message
--                                    names the exact column
--
-- Errors are deliberately not caught. A failure aborts the whole block, so
-- nothing is left behind; on success the block deletes its own rows.

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
