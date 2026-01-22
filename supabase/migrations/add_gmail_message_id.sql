-- Migration: Add gmail_message_id to track imported emails
-- This prevents duplicates when re-scanning Gmail

-- Add gmail_message_id column
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS gmail_message_id TEXT;

-- Create index for fast lookups during Gmail scanning
CREATE INDEX IF NOT EXISTS idx_job_applications_gmail_message_id 
ON job_applications(gmail_message_id);

-- Add unique constraint per user (same email can't be added twice by same user)
-- First, we need to create a unique constraint
ALTER TABLE job_applications
ADD CONSTRAINT unique_gmail_message_per_user 
UNIQUE (user_id, gmail_message_id);

-- Note: If you get an error about the constraint, existing duplicates may exist
-- In that case, run this query first to see duplicates:
-- SELECT gmail_message_id, user_id, COUNT(*) FROM job_applications 
-- WHERE gmail_message_id IS NOT NULL GROUP BY gmail_message_id, user_id HAVING COUNT(*) > 1;
