-- Migration: Add resume_version column to job_applications table
-- Run this in Supabase SQL Editor

ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS resume_version TEXT;

COMMENT ON COLUMN job_applications.resume_version IS 'Track which resume version was used for this application';
