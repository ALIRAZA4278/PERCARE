-- Phase 1 scope: site-wide feature flags for Marketplace / Shelters
-- Lets admins hide/show these modules everywhere without a rebuild.

CREATE TABLE IF NOT EXISTS site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE), -- singleton row
  marketplace_enabled BOOLEAN DEFAULT FALSE,
  shelters_enabled BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (id, marketplace_enabled, shelters_enabled)
VALUES (TRUE, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update site settings" ON site_settings
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Admin moderation for Lost & Found posts (delete spam, close/resolve listings)
CREATE POLICY "Admins can update lost found posts" ON lost_found_pets
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can delete lost found posts" ON lost_found_pets
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Admin management for clinic/hospital listings
CREATE POLICY "Admins can update clinics" ON clinics
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can insert clinics" ON clinics
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );
