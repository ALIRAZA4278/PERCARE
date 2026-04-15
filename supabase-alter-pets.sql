-- ============================================
-- ADD PERSONALITY FIELDS TO PETS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE pets ADD COLUMN IF NOT EXISTS talents TEXT[] DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS favourite_foods TEXT[] DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT '{}';
