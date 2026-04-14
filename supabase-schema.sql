-- ============================================
-- PetCare Platform - Complete Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (linked to Supabase Auth)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('pet_owner', 'veterinarian', 'clinic', 'seller', 'company', 'shelter', 'admin')),
  is_approved BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  address TEXT,
  city TEXT,
  country TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'pet_owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. PETS (owned by pet owners)
-- ============================================
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'fish', 'other')),
  breed TEXT,
  age_years INTEGER,
  age_months INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  weight_kg DECIMAL,
  color TEXT,
  description TEXT,
  image_url TEXT,
  images TEXT[],
  is_neutered BOOLEAN DEFAULT FALSE,
  vaccination_status TEXT DEFAULT 'unknown' CHECK (vaccination_status IN ('up_to_date', 'partial', 'none', 'unknown')),
  medical_notes TEXT,
  microchip_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. VET PROFILES
-- ============================================
CREATE TABLE vet_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  specialization TEXT,
  experience_years INTEGER,
  qualification TEXT,
  languages_spoken TEXT[],
  consultation_fee DECIMAL,
  contact_phone TEXT,
  contact_email TEXT,
  services_offered TEXT[],
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PET VACCINATION RECORDS
-- ============================================
CREATE TABLE pet_vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  date_given DATE NOT NULL,
  next_due_date DATE,
  administered_by TEXT,
  vet_id UUID REFERENCES vet_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PET PHOTOS (multiple per pet)
-- ============================================
CREATE TABLE pet_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. PREFERRED VETS (pet owner <-> vet)
-- ============================================
CREATE TABLE preferred_vets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES vet_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, vet_id)
);

-- ============================================
-- 7. VACCINE REMINDERS
-- ============================================
CREATE TABLE vaccine_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_via TEXT[] DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. CLINICS / VETERINARY HOSPITALS
-- ============================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',
  image_url TEXT,
  opening_time TIME,
  closing_time TIME,
  working_days TEXT[],
  is_approved BOOLEAN DEFAULT FALSE,
  is_emergency_available BOOLEAN DEFAULT FALSE,
  rating DECIMAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. CLINIC <-> VET RELATIONSHIP
-- ============================================
CREATE TABLE clinic_vets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES vet_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinic_id, vet_id)
);

-- ============================================
-- 10. CLINIC SERVICES
-- ============================================
CREATE TABLE clinic_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. VET AVAILABILITY SCHEDULE
-- ============================================
CREATE TABLE vet_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vet_id UUID REFERENCES vet_profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 12. APPOINTMENTS / BOOKINGS
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES vet_profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  reason TEXT,
  notes TEXT,
  fee DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. SELLER VERIFICATION (onboarding)
-- ============================================
CREATE TABLE seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  cnic_number TEXT,
  business_name TEXT,
  business_registration_number TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_title TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================
-- 14. STORES (sellers, companies, vets, clinics)
-- ============================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  store_type TEXT NOT NULL CHECK (store_type IN ('individual', 'company', 'vet', 'clinic')),
  store_category TEXT,
  location_type TEXT DEFAULT 'online' CHECK (location_type IN ('physical', 'online', 'both')),
  delivery_options TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. PRODUCT CATEGORIES
-- ============================================
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  price DECIMAL NOT NULL,
  sale_price DECIMAL,
  image_url TEXT,
  images TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT,
  delivery_options TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_medicine BOOLEAN DEFAULT FALSE,
  medicine_approved BOOLEAN DEFAULT FALSE,
  rating DECIMAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_country TEXT,
  phone TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 18. ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL NOT NULL,
  total_price DECIMAL NOT NULL,
  delivery_method TEXT CHECK (delivery_method IN ('platform_rider', 'self_delivery')),
  item_status TEXT DEFAULT 'pending' CHECK (item_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 19. SHELTERS
-- ============================================
CREATE TABLE shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  opening_time TIME,
  closing_time TIME,
  working_days TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  accepts_donations BOOLEAN DEFAULT TRUE,
  accepts_surrender BOOLEAN DEFAULT TRUE,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 20. DONATION PACKAGES (shelter-defined)
-- ============================================
CREATE TABLE donation_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 21. PET SURRENDER REQUESTS
-- ============================================
CREATE TABLE surrender_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age_years INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  reason TEXT NOT NULL,
  health_info TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 22. SHELTER ANIMALS (available for adoption)
-- ============================================
CREATE TABLE shelter_animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'fish', 'other')),
  breed TEXT,
  age_years INTEGER,
  age_months INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  description TEXT,
  image_url TEXT,
  health_status TEXT,
  is_neutered BOOLEAN DEFAULT FALSE,
  vaccination_status TEXT DEFAULT 'unknown',
  adoption_status TEXT DEFAULT 'available' CHECK (adoption_status IN ('available', 'pending', 'adopted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 23. ADOPTION REQUESTS
-- ============================================
CREATE TABLE adoption_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID REFERENCES shelter_animals(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 24. DONATIONS
-- ============================================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  package_id UUID REFERENCES donation_packages(id) ON DELETE SET NULL,
  amount DECIMAL,
  donation_type TEXT CHECK (donation_type IN ('money', 'food', 'supplies', 'package', 'other')),
  description TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 25. LOST & FOUND PETS
-- ============================================
CREATE TABLE lost_found_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  pet_name TEXT,
  species TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  description TEXT,
  image_url TEXT,
  last_seen_location TEXT,
  last_seen_date DATE,
  city TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'reunited', 'closed')),
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 26. REVIEWS (for vets, clinics, products, stores)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('vet', 'clinic', 'product', 'store', 'shelter')),
  target_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  reply TEXT,
  reply_at TIMESTAMPTZ,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 27. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('appointment', 'vaccine_reminder', 'order', 'adoption', 'lost_found', 'system', 'review', 'approval', 'ban')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 28. COMPANY PETS (only company can sell pets)
-- ============================================
CREATE TABLE company_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'fish', 'other')),
  breed TEXT,
  age_years INTEGER,
  age_months INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  price DECIMAL NOT NULL,
  description TEXT,
  image_url TEXT,
  images TEXT[],
  health_status TEXT,
  is_neutered BOOLEAN DEFAULT FALSE,
  vaccination_status TEXT DEFAULT 'up_to_date',
  is_available BOOLEAN DEFAULT TRUE,
  delivery_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 29. PET DELIVERY ORDERS (company pets only)
-- ============================================
CREATE TABLE pet_delivery_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES company_pets(id) ON DELETE SET NULL,
  total_amount DECIMAL NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT,
  delivery_country TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 30. ADMIN AUDIT LOG
-- ============================================
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 31. USER BANS
-- ============================================
CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 32. REPORTS / FLAGS (moderation)
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('vet', 'clinic', 'store', 'product', 'review', 'user', 'listing', 'shelter')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('fake_profile', 'scam', 'abusive', 'illegal_medicine', 'spam', 'inappropriate', 'fraud', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferred_vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE surrender_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelter_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- ADMIN TABLES
CREATE POLICY "Only admins can view audit log" ON admin_audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Only admins can create audit entries" ON admin_audit_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can view all bans" ON user_bans FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Users can view own bans" ON user_bans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only admins can create bans" ON user_bans FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Only admins can update bans" ON user_bans FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- PETS
CREATE POLICY "Pets are viewable by everyone" ON pets FOR SELECT USING (true);
CREATE POLICY "Owners can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own pets" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- PET VACCINATIONS
CREATE POLICY "Vaccination records viewable by pet owner" ON pet_vaccinations FOR SELECT USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_vaccinations.pet_id AND pets.owner_id = auth.uid())
);
CREATE POLICY "Pet owners can add vaccination records" ON pet_vaccinations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_vaccinations.pet_id AND pets.owner_id = auth.uid())
);
CREATE POLICY "Pet owners can update vaccination records" ON pet_vaccinations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_vaccinations.pet_id AND pets.owner_id = auth.uid())
);

-- PET PHOTOS
CREATE POLICY "Pet photos viewable by everyone" ON pet_photos FOR SELECT USING (true);
CREATE POLICY "Pet owners can add photos" ON pet_photos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_photos.pet_id AND pets.owner_id = auth.uid())
);
CREATE POLICY "Pet owners can delete photos" ON pet_photos FOR DELETE USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_photos.pet_id AND pets.owner_id = auth.uid())
);

-- PREFERRED VETS
CREATE POLICY "Users can view own preferred vets" ON preferred_vets FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can add preferred vets" ON preferred_vets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can remove preferred vets" ON preferred_vets FOR DELETE USING (auth.uid() = owner_id);

-- VACCINE REMINDERS
CREATE POLICY "Users can view own reminders" ON vaccine_reminders FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "System can manage reminders" ON vaccine_reminders FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- VET PROFILES
CREATE POLICY "Vet profiles are viewable by everyone" ON vet_profiles FOR SELECT USING (true);
CREATE POLICY "Vets can insert own profile" ON vet_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vets can update own profile" ON vet_profiles FOR UPDATE USING (auth.uid() = user_id);

-- CLINICS
CREATE POLICY "Clinics are viewable by everyone" ON clinics FOR SELECT USING (true);
CREATE POLICY "Owners can insert clinics" ON clinics FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own clinics" ON clinics FOR UPDATE USING (auth.uid() = owner_id);

-- CLINIC VETS
CREATE POLICY "Clinic vets viewable by everyone" ON clinic_vets FOR SELECT USING (true);
CREATE POLICY "Vets can request to join" ON clinic_vets FOR INSERT WITH CHECK (auth.uid() = vet_id);
CREATE POLICY "Clinic owner can update status" ON clinic_vets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_vets.clinic_id AND clinics.owner_id = auth.uid())
);

-- CLINIC SERVICES
CREATE POLICY "Clinic services viewable by everyone" ON clinic_services FOR SELECT USING (true);
CREATE POLICY "Clinic owner can manage services" ON clinic_services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_services.clinic_id AND clinics.owner_id = auth.uid())
);
CREATE POLICY "Clinic owner can update services" ON clinic_services FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_services.clinic_id AND clinics.owner_id = auth.uid())
);

-- VET AVAILABILITY
CREATE POLICY "Vet availability viewable by everyone" ON vet_availability FOR SELECT USING (true);
CREATE POLICY "Vets can manage own availability" ON vet_availability FOR INSERT WITH CHECK (auth.uid() = vet_id);
CREATE POLICY "Vets can update own availability" ON vet_availability FOR UPDATE USING (auth.uid() = vet_id);

-- APPOINTMENTS
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (
  auth.uid() = pet_owner_id OR auth.uid() IN (SELECT user_id FROM vet_profiles WHERE id = appointments.vet_id)
);
CREATE POLICY "Pet owners can create appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = pet_owner_id);
CREATE POLICY "Involved parties can update appointments" ON appointments FOR UPDATE USING (
  auth.uid() = pet_owner_id OR auth.uid() IN (SELECT user_id FROM vet_profiles WHERE id = appointments.vet_id)
);

-- SELLER VERIFICATIONS
CREATE POLICY "Users can view own verification" ON seller_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit verification" ON seller_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own verification" ON seller_verifications FOR UPDATE USING (auth.uid() = user_id);

-- STORES
CREATE POLICY "Stores viewable by everyone" ON stores FOR SELECT USING (true);
CREATE POLICY "Owners can create stores" ON stores FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own stores" ON stores FOR UPDATE USING (auth.uid() = owner_id);

-- PRODUCT CATEGORIES
CREATE POLICY "Categories viewable by everyone" ON product_categories FOR SELECT USING (true);

-- PRODUCTS
CREATE POLICY "Products viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Store owners can add products" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
);
CREATE POLICY "Store owners can update products" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
);

-- ORDERS
CREATE POLICY "Buyers can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- ORDER ITEMS
CREATE POLICY "Buyers can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);
CREATE POLICY "Buyers can create order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

-- SHELTERS
CREATE POLICY "Shelters viewable by everyone" ON shelters FOR SELECT USING (true);
CREATE POLICY "Owners can create shelters" ON shelters FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own shelters" ON shelters FOR UPDATE USING (auth.uid() = owner_id);

-- DONATION PACKAGES
CREATE POLICY "Donation packages viewable by everyone" ON donation_packages FOR SELECT USING (true);
CREATE POLICY "Shelter owners can create packages" ON donation_packages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM shelters WHERE shelters.id = donation_packages.shelter_id AND shelters.owner_id = auth.uid())
);
CREATE POLICY "Shelter owners can update packages" ON donation_packages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM shelters WHERE shelters.id = donation_packages.shelter_id AND shelters.owner_id = auth.uid())
);
CREATE POLICY "Shelter owners can delete packages" ON donation_packages FOR DELETE USING (
  EXISTS (SELECT 1 FROM shelters WHERE shelters.id = donation_packages.shelter_id AND shelters.owner_id = auth.uid())
);

-- SURRENDER REQUESTS
CREATE POLICY "Surrender requests viewable by involved parties" ON surrender_requests FOR SELECT USING (
  auth.uid() = owner_id OR EXISTS (SELECT 1 FROM shelters WHERE shelters.id = surrender_requests.shelter_id AND shelters.owner_id = auth.uid())
);
CREATE POLICY "Users can submit surrender requests" ON surrender_requests FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Shelter owners can update surrender requests" ON surrender_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM shelters WHERE shelters.id = surrender_requests.shelter_id AND shelters.owner_id = auth.uid())
);

-- SHELTER ANIMALS
CREATE POLICY "Shelter animals viewable by everyone" ON shelter_animals FOR SELECT USING (true);
CREATE POLICY "Shelter owners can manage animals" ON shelter_animals FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM shelters WHERE shelters.id = shelter_animals.shelter_id AND shelters.owner_id = auth.uid())
);
CREATE POLICY "Shelter owners can update animals" ON shelter_animals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM shelters WHERE shelters.id = shelter_animals.shelter_id AND shelters.owner_id = auth.uid())
);

-- ADOPTION REQUESTS
CREATE POLICY "Users can view own adoption requests" ON adoption_requests FOR SELECT USING (
  auth.uid() = requester_id OR EXISTS (SELECT 1 FROM shelters WHERE shelters.id = adoption_requests.shelter_id AND shelters.owner_id = auth.uid())
);
CREATE POLICY "Users can create adoption requests" ON adoption_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Shelter owners can update requests" ON adoption_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM shelters WHERE shelters.id = adoption_requests.shelter_id AND shelters.owner_id = auth.uid())
);

-- DONATIONS
CREATE POLICY "Donations viewable by involved parties" ON donations FOR SELECT USING (
  auth.uid() = donor_id OR EXISTS (SELECT 1 FROM shelters WHERE shelters.id = donations.shelter_id AND shelters.owner_id = auth.uid())
);
CREATE POLICY "Users can create donations" ON donations FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- LOST & FOUND
CREATE POLICY "Lost found pets viewable by everyone" ON lost_found_pets FOR SELECT USING (true);
CREATE POLICY "Users can report lost found" ON lost_found_pets FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporters can update own posts" ON lost_found_pets FOR UPDATE USING (auth.uid() = reporter_id);

-- REVIEWS
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- COMPANY PETS
CREATE POLICY "Company pets viewable by everyone" ON company_pets FOR SELECT USING (true);

-- PET DELIVERY ORDERS
CREATE POLICY "Buyers can view own pet orders" ON pet_delivery_orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can create pet orders" ON pet_delivery_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_pet_vaccinations_pet ON pet_vaccinations(pet_id);
CREATE INDEX idx_pet_vaccinations_due ON pet_vaccinations(next_due_date);
CREATE INDEX idx_pet_photos_pet ON pet_photos(pet_id);
CREATE INDEX idx_preferred_vets_owner ON preferred_vets(owner_id);
CREATE INDEX idx_vaccine_reminders_owner ON vaccine_reminders(owner_id);
CREATE INDEX idx_vaccine_reminders_due ON vaccine_reminders(due_date);
CREATE INDEX idx_vet_profiles_user ON vet_profiles(user_id);
CREATE INDEX idx_clinics_city ON clinics(city);
CREATE INDEX idx_clinics_owner ON clinics(owner_id);
CREATE INDEX idx_clinic_vets_clinic ON clinic_vets(clinic_id);
CREATE INDEX idx_clinic_vets_vet ON clinic_vets(vet_id);
CREATE INDEX idx_appointments_owner ON appointments(pet_owner_id);
CREATE INDEX idx_appointments_vet ON appointments(vet_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_seller_verifications_user ON seller_verifications(user_id);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_type ON stores(store_type);
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_shelters_city ON shelters(city);
CREATE INDEX idx_donation_packages_shelter ON donation_packages(shelter_id);
CREATE INDEX idx_surrender_requests_shelter ON surrender_requests(shelter_id);
CREATE INDEX idx_surrender_requests_owner ON surrender_requests(owner_id);
CREATE INDEX idx_shelter_animals_shelter ON shelter_animals(shelter_id);
CREATE INDEX idx_shelter_animals_status ON shelter_animals(adoption_status);
CREATE INDEX idx_lost_found_city ON lost_found_pets(city);
CREATE INDEX idx_lost_found_type ON lost_found_pets(type);
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_admin_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_target ON admin_audit_log(target_type, target_id);
CREATE INDEX idx_user_bans_user ON user_bans(user_id);
CREATE INDEX idx_user_bans_active ON user_bans(is_active);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_company_pets_available ON company_pets(is_available);
CREATE INDEX idx_pet_delivery_buyer ON pet_delivery_orders(buyer_id);

-- ============================================
-- DONE! All 32 tables created successfully.
-- ============================================
