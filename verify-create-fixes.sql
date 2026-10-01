-- Verifies the four "create does nothing" fixes. No login needed, nothing left behind.
--
-- Paste into the Supabase SQL editor and Run, then read the NOTICE output
-- under the results panel.
--
-- Each check runs the payload the app USED to send and the one it sends NOW.
-- Expected for every check:   OLD -> rejected      NEW -> created OK
-- Anything else means that fix did not land.
--
-- Everything is one DO block (Supabase pools connections, so temp tables and
-- multi-statement transactions are not reliable here) and it deletes its own
-- test rows at the end.

-- ------------------------------------------------------------------
-- PART A — read-only: show the constraints these fixes depend on
-- ------------------------------------------------------------------
SELECT
  c.table_name,
  c.column_name,
  c.is_nullable,
  CASE WHEN c.is_nullable = 'NO' THEN 'required' ELSE '' END AS note
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND (
    (c.table_name = 'shelter_animals'  AND c.column_name IN ('species','gender','adoption_status','age_years','name'))
 OR (c.table_name = 'stores'           AND c.column_name = 'store_type')
 OR (c.table_name = 'user_bans'        AND c.column_name = 'ban_type')
 OR (c.table_name = 'donation_packages' AND c.column_name = 'amount')
 OR (c.table_name = 'admin_audit_log'  AND c.column_name = 'target_id')
  )
ORDER BY c.table_name, c.column_name;

-- ------------------------------------------------------------------
-- PART B — behavioural: old payload vs new payload
-- ------------------------------------------------------------------
DO $$
DECLARE
  pid uuid;
  sid uuid;
BEGIN
  SELECT id INTO pid FROM profiles LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'No rows in profiles — create any account in the app first, then re-run.';
    RETURN;
  END IF;

  INSERT INTO shelters (owner_id, name, address, city)
  VALUES (pid, 'VERIFY shelter', 'addr', 'Lahore')
  RETURNING id INTO sid;

  -- 1. shelter_animals — the reported bug ---------------------------
  BEGIN
    -- `status` and `age` are not columns, and the enums are lowercase-only.
    EXECUTE format(
      'INSERT INTO shelter_animals (shelter_id, name, species, gender, status, age)
       VALUES (%L,%L,%L,%L,%L,%L)', sid, 'Rex', 'Dog', 'Male', 'available', '2');
    RAISE NOTICE '1. shelter_animals  OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '1. shelter_animals  OLD -> rejected: %', SQLERRM;
  END;

  BEGIN
    INSERT INTO shelter_animals (shelter_id, name, species, gender, adoption_status, age_years)
    VALUES (sid, 'Rex', 'dog', 'male', 'available', 2);
    RAISE NOTICE '1. shelter_animals  NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '1. shelter_animals  NEW -> STILL FAILING: %', SQLERRM;
  END;

  -- 2. stores.store_type -------------------------------------------
  BEGIN
    INSERT INTO stores (owner_id, name) VALUES (pid, 'VERIFY store');
    RAISE NOTICE '2. stores           OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '2. stores           OLD -> rejected: %', SQLERRM;
  END;

  BEGIN
    INSERT INTO stores (owner_id, name, store_type) VALUES (pid, 'VERIFY store', 'individual');
    RAISE NOTICE '2. stores           NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '2. stores           NEW -> STILL FAILING: %', SQLERRM;
  END;

  -- 3. user_bans.ban_type ------------------------------------------
  BEGIN
    INSERT INTO user_bans (user_id, banned_by, reason, is_active)
    VALUES (pid, pid, 'VERIFY', true);
    RAISE NOTICE '3. user_bans        OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '3. user_bans        OLD -> rejected: %', SQLERRM;
  END;

  BEGIN
    INSERT INTO user_bans (user_id, banned_by, reason, is_active, ban_type)
    VALUES (pid, pid, 'VERIFY', true, 'permanent');
    RAISE NOTICE '3. user_bans        NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '3. user_bans        NEW -> STILL FAILING: %', SQLERRM;
  END;

  -- 4. donation_packages.amount (the "Custom" package) --------------
  BEGIN
    INSERT INTO donation_packages (shelter_id, name, amount)
    VALUES (sid, 'VERIFY custom', NULL);
    RAISE NOTICE '4. donation_pkgs    OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '4. donation_pkgs    OLD -> rejected: %', SQLERRM;
  END;

  BEGIN
    INSERT INTO donation_packages (shelter_id, name, amount)
    VALUES (sid, 'VERIFY custom', 0);
    RAISE NOTICE '4. donation_pkgs    NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '4. donation_pkgs    NEW -> STILL FAILING: %', SQLERRM;
  END;

  -- 5. admin_audit_log.target_id (feature-flag logging) -------------
  BEGIN
    INSERT INTO admin_audit_log (admin_id, action, target_type, target_id)
    VALUES (pid, 'VERIFY', 'site_settings', NULL);
    RAISE NOTICE '5. admin_audit_log  OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '5. admin_audit_log  OLD -> rejected: %', SQLERRM;
  END;

  BEGIN
    INSERT INTO admin_audit_log (admin_id, action, target_type, target_id)
    VALUES (pid, 'VERIFY', 'site_settings', pid);
    RAISE NOTICE '5. admin_audit_log  NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '5. admin_audit_log  NEW -> STILL FAILING: %', SQLERRM;
  END;

  -- cleanup: remove everything this script created -------------------
  DELETE FROM donation_packages WHERE shelter_id = sid;
  DELETE FROM shelter_animals   WHERE shelter_id = sid;
  DELETE FROM shelters          WHERE id = sid;
  DELETE FROM stores            WHERE owner_id = pid AND name = 'VERIFY store';
  DELETE FROM user_bans         WHERE reason = 'VERIFY';
  DELETE FROM admin_audit_log   WHERE action = 'VERIFY';

  RAISE NOTICE '--- done, all VERIFY rows removed ---';
END $$;
