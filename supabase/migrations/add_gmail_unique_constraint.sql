-- Add unique constraint to prevent duplicate email imports
-- This ensures the same Gmail message can never be imported twice for a user

-- Add unique constraint on user_id + gmail_message_id combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_applications_user_gmail_unique 
ON public.job_applications (user_id, gmail_message_id) 
WHERE gmail_message_id IS NOT NULL;

-- Add index on gmail_message_id for faster lookups during deduplication
CREATE INDEX IF NOT EXISTS idx_job_applications_gmail_message_id 
ON public.job_applications (gmail_message_id) 
WHERE gmail_message_id IS NOT NULL;

-- Add index on user_id + created_at for efficient user job queries
CREATE INDEX IF NOT EXISTS idx_job_applications_user_created 
ON public.job_applications (user_id, created_at DESC);
