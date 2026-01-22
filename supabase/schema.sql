-- Job Applications Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_link TEXT,
  date_applied DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Applied' 
    CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected')),
  interview_date TIMESTAMPTZ,
  notes TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'gmail')),
  followed_up BOOLEAN DEFAULT FALSE,
  last_reminder_sent TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own applications
CREATE POLICY "Users can view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own applications
CREATE POLICY "Users can insert own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own applications
CREATE POLICY "Users can update own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own applications
CREATE POLICY "Users can delete own applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_date_applied ON job_applications(date_applied);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
