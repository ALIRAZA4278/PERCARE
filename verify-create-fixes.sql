-- Verifies the four "create does nothing" fixes, with no login and no data left behind.
--
-- Paste into the Supabase SQL editor and Run. Everything happens inside one
-- transaction that ROLLBACKs at the end, so nothing is actually written.
--
-- Each block runs the payload the app USED to send and the one it sends NOW.
-- The old payload is expected to raise an error; the new one is expected to
-- succeed. Any block that does not behave that way is a fix that did not land.

BEGIN;

-- Borrow an existing profile so the foreign keys resolve. If this returns no
-- rows, create any account in the app first and re-run.
CREATE TEMP TABLE t AS
SELECT id AS profile_id FROM profiles LIMIT 1;

CREATE TEMP TABLE s AS
WITH ins AS (
  INSERT INTO shelters (owner_id, name, address, city)
  SELECT profile_id, 'VERIFY shelter', 'addr', 'Lahore' FROM t
  RETURNING id
)
SELECT id AS shelter_id FROM ins;

-- ============================================================
-- 1. shelter_animals  (the reported bug)
-- ============================================================
DO $$
DECLARE sid uuid;
BEGIN
  SELECT shelter_id INTO sid FROM s;

  -- OLD payload: capitalised species/gender, plus columns that do not exist.
  BEGIN
    EXECUTE format(
      'INSERT INTO shelter_animals (shelter_id, name, species, gender, status, age)
       VALUES (%L, %L, %L, %L, %L, %L)',
      sid, 'Rex', 'Dog', 'Male', 'available', '2');
    RAISE NOTICE '1. shelter_animals OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '1. shelter_animals OLD -> rejected as expected (%)', SQLERRM;
  END;

  -- NEW payload: lowercase enums, real column names.
  BEGIN
    INSERT INTO shelter_animals (shelter_id, name, species, gender, adoption_status, age_years)
    VALUES (sid, 'Rex', 'dog', 'male', 'available', 2);
    RAISE NOTICE '1. shelter_animals NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '1. shelter_animals NEW -> STILL FAILING (%)', SQLERRM;
  END;
END $$;

-- ============================================================
-- 2. stores.store_type is NOT NULL
-- ============================================================
DO $$
DECLARE pid uuid;
BEGIN
  SELECT profile_id INTO pid FROM t;

  BEGIN
    INSERT INTO stores (owner_id, name) VALUES (pid, 'VERIFY store');
    RAISE NOTICE '2. stores OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '2. stores OLD -> rejected as expected (%)', SQLERRM;
  END;

  BEGIN
    INSERT INTO stores (owner_id, name, store_type) VALUES (pid, 'VERIFY store', 'individual');
    RAISE NOTICE '2. stores NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '2. stores NEW -> STILL FAILING (%)', SQLERRM;
  END;
END $$;

-- ============================================================
-- 3. user_bans.ban_type is NOT NULL
-- ============================================================
DO $$
DECLARE pid uuid;
BEGIN
  SELECT profile_id INTO pid FROM t;

  BEGIN
    INSERT INTO user_bans (user_id, banned_by, reason, is_active)
    VALUES (pid, pid, 'VERIFY', true);
    RAISE NOTICE '3. user_bans OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '3. user_bans OLD -> rejected as expected (%)', SQLERRM;
  END;

  BEGIN
    INSERT INTO user_bans (user_id, banned_by, reason, is_active, ban_type)
    VALUES (pid, pid, 'VERIFY', true, 'permanent');
    RAISE NOTICE '3. user_bans NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '3. user_bans NEW -> STILL FAILING (%)', SQLERRM;
  END;
END $$;

-- ============================================================
-- 4. donation_packages.amount is NOT NULL (the "Custom" package)
-- ============================================================
DO $$
DECLARE sid uuid;
BEGIN
  SELECT shelter_id INTO sid FROM s;

  BEGIN
    INSERT INTO donation_packages (shelter_id, name, amount)
    VALUES (sid, 'VERIFY custom', NULL);
    RAISE NOTICE '4. donation_packages OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '4. donation_packages OLD -> rejected as expected (%)', SQLERRM;
  END;

  BEGIN
    INSERT INTO donation_packages (shelter_id, name, amount)
    VALUES (sid, 'VERIFY custom', 0);
    RAISE NOTICE '4. donation_packages NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '4. donation_packages NEW -> STILL FAILING (%)', SQLERRM;
  END;
END $$;

-- ============================================================
-- 5. admin_audit_log.target_id is NOT NULL (feature-flag logging)
-- ============================================================
DO $$
DECLARE pid uuid;
BEGIN
  SELECT profile_id INTO pid FROM t;

  BEGIN
    INSERT INTO admin_audit_log (admin_id, action, target_type, target_id)
    VALUES (pid, 'VERIFY', 'site_settings', NULL);
    RAISE NOTICE '5. admin_audit_log OLD -> UNEXPECTEDLY SUCCEEDED';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '5. admin_audit_log OLD -> rejected as expected (%)', SQLERRM;
  END;

  BEGIN
    INSERT INTO admin_audit_log (admin_id, action, target_type, target_id)
    VALUES (pid, 'VERIFY', 'site_settings', pid);
    RAISE NOTICE '5. admin_audit_log NEW -> created OK';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '5. admin_audit_log NEW -> STILL FAILING (%)', SQLERRM;
  END;
END $$;

-- Nothing above is kept.
ROLLBACK;
