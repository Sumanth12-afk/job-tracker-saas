-- Resume Library table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS resume_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can only access their own resume versions
CREATE POLICY "Users can manage own resume versions" ON resume_versions
    FOR ALL USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON resume_versions(user_id);

-- Ensure only one default per user (trigger)
CREATE OR REPLACE FUNCTION ensure_single_default_resume()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE resume_versions 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_default_resume ON resume_versions;
CREATE TRIGGER trg_single_default_resume
    BEFORE INSERT OR UPDATE ON resume_versions
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_resume();
