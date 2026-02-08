-- Migration: Add contact_email column to job_applications table
-- This stores the sender email for follow-up functionality

ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add comment for documentation
COMMENT ON COLUMN job_applications.contact_email IS 'Email address from the original job application email, used for follow-up';
