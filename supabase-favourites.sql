-- ============================================
-- FAVOURITES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('vet', 'clinic', 'product', 'store', 'shelter', 'animal')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favourites" ON favourites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favourites" ON favourites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favourites" ON favourites FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_favourites_user ON favourites(user_id);
CREATE INDEX idx_favourites_target ON favourites(target_type, target_id);
