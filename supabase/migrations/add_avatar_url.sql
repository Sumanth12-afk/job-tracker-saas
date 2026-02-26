-- Add avatar_url column to user_profiles
-- Run this in Supabase SQL Editor

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
