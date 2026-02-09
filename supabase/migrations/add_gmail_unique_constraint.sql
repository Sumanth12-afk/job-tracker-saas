-- Add unique constraint to prevent duplicate email imports
-- This ensures the same Gmail message can never be imported twice for a user

-- Add unique constraint on user_id + gmail_message_id combination
-- Using CREATE UNIQUE INDEX which handles NULLs correctly
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_user_gmail_unique 
ON public.jobs (user_id, gmail_message_id) 
WHERE gmail_message_id IS NOT NULL;

-- Add index on gmail_message_id for faster lookups during deduplication
CREATE INDEX IF NOT EXISTS idx_jobs_gmail_message_id 
ON public.jobs (gmail_message_id) 
WHERE gmail_message_id IS NOT NULL;

-- Add index on user_id + created_at for efficient user job queries
CREATE INDEX IF NOT EXISTS idx_jobs_user_created 
ON public.jobs (user_id, created_at DESC);
