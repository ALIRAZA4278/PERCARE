-- ============================================
-- SEED TEST USERS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PET OWNER
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'owner@petcare.com',
  crypt('Owner@123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Pet Owner", "role": "pet_owner"}',
  NOW(), NOW(), '', '', '', ''
);

-- 2. VETERINARIAN
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'vet@petcare.com',
  crypt('Vet@123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Dr. Veterinarian", "role": "veterinarian"}',
  NOW(), NOW(), '', '', '', ''
);

-- 3. SELLER
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'store@petcare.com',
  crypt('Store@123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Store Seller", "role": "seller"}',
  NOW(), NOW(), '', '', '', ''
);

-- 4. SHELTER
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'shelter@petcare.com',
  crypt('Shelter@123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Animal Shelter", "role": "shelter"}',
  NOW(), NOW(), '', '', '', ''
);

-- 5. CREATE IDENTITIES (required for email login)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT id, id, email, jsonb_build_object('sub', id, 'email', email), 'email', NOW(), NOW(), NOW()
FROM auth.users
WHERE email IN ('owner@petcare.com', 'vet@petcare.com', 'store@petcare.com', 'shelter@petcare.com');
