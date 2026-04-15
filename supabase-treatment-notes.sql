-- ============================================
-- TREATMENT NOTES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS treatment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES vet_profiles(id) ON DELETE SET NULL,
  treatment TEXT NOT NULL,
  prescription TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE treatment_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vets can view treatment notes" ON treatment_notes FOR SELECT USING (true);
CREATE POLICY "Vets can add treatment notes" ON treatment_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM vet_profiles WHERE vet_profiles.id = treatment_notes.vet_id AND vet_profiles.user_id = auth.uid())
);

CREATE INDEX idx_treatment_notes_pet ON treatment_notes(pet_id);
CREATE INDEX idx_treatment_notes_vet ON treatment_notes(vet_id);
