-- ============================================================
-- TEST ACCOUNTS — run in the Supabase SQL Editor
-- ============================================================
--
-- Creates one account per role, approves them, and gives the shelter
-- account a shelter row so its dashboard has something to work with.
--
-- Safe to re-run: existing accounts are left alone, only the approval
-- flags are refreshed. (supabase-seed-users.sql fails on a second run
-- because the emails already exist.)
--
-- Logins, all with password  Test@1234
--
--   owner@test.com     Pet Owner
--   vet@test.com       Veterinarian   (approved)
--   seller@test.com    Seller         (approved, NO store yet — so the
--                                      "Create Store" modal can be tested)
--   shelter@test.com   Shelter        (approved, shelter row created — so
--                                      "Add Animal" can be tested)
--   admin@test.com     Admin
--
-- Change the password below before running if you prefer.
-- ============================================================

DO $$
DECLARE
  pw    text := 'Test@1234';
  rec   record;
  uid   uuid;
  sid   uuid;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('owner@test.com',   'Test Owner',    'pet_owner'),
      ('vet@test.com',     'Test Vet',      'veterinarian'),
      ('seller@test.com',  'Test Seller',   'seller'),
      ('shelter@test.com', 'Test Shelter',  'shelter'),
      ('admin@test.com',   'Test Admin',    'admin')
    ) AS v(email, full_name, role)
  LOOP
    SELECT id INTO uid FROM auth.users WHERE email = rec.email;

    IF uid IS NULL THEN
      uid := gen_random_uuid();

      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        uid,
        'authenticated', 'authenticated',
        rec.email,
        crypt(pw, gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', rec.full_name, 'role', rec.role),
        NOW(), NOW(), '', '', '', ''
      );

      -- Required for email/password sign-in to work.
      INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        uid, uid, rec.email,
        jsonb_build_object('sub', uid, 'email', rec.email),
        'email', NOW(), NOW(), NOW()
      );

      RAISE NOTICE 'created %', rec.email;
    ELSE
      RAISE NOTICE 'already exists, reusing %', rec.email;
    END IF;

    -- The handle_new_user trigger inserts the profile, but is_approved
    -- defaults to false and the vet/seller/shelter dashboards check it.
    UPDATE profiles
       SET role        = rec.role,
           full_name   = rec.full_name,
           is_approved = true,
           is_verified = true,
           is_banned   = false,
           city        = COALESCE(city, 'Lahore')
     WHERE id = uid;

    -- Give the shelter account a shelter, so Add Animal has a parent row.
    IF rec.role = 'shelter' THEN
      SELECT id INTO sid FROM shelters WHERE owner_id = uid;
      IF sid IS NULL THEN
        INSERT INTO shelters (owner_id, name, address, city)
        VALUES (uid, 'Test Shelter', '123 Test Street', 'Lahore');
        RAISE NOTICE 'created shelter for %', rec.email;
      END IF;
    END IF;

    -- Deliberately no store for the seller: leaving it empty is what makes
    -- the "Create Store" modal testable.
  END LOOP;
END $$;

-- Confirm what exists now.
SELECT p.email, p.role, p.is_approved,
       EXISTS (SELECT 1 FROM shelters s WHERE s.owner_id = p.id) AS has_shelter,
       EXISTS (SELECT 1 FROM stores  st WHERE st.owner_id = p.id) AS has_store
FROM profiles p
WHERE p.email LIKE '%@test.com'
ORDER BY p.role;
