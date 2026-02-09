-- ============================================
-- ADMIN DASHBOARD DATABASE SCHEMA
-- ============================================

-- 1. Admin Users Table
-- Stores which users have admin access
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(email)
);

-- 2. Scan Logs Table
-- Tracks every Gmail scan for analytics
CREATE TABLE IF NOT EXISTS public.scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scanned_count INT DEFAULT 0,
    found_count INT DEFAULT 0,
    already_imported INT DEFAULT 0,
    rule_classified INT DEFAULT 0,
    ml_classified INT DEFAULT 0,
    fallback_used INT DEFAULT 0,
    avg_confidence DECIMAL(5,4),
    model_version TEXT,
    duration_ms INT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Error Logs Table
-- Tracks API errors for debugging
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    endpoint TEXT NOT NULL,
    error_type TEXT,
    error_message TEXT,
    stack_trace TEXT,
    request_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Activity Table
-- Tracks last activity for DAU/WAU/MAU
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'login', 'scan', 'add_job', 'update_job'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_scan_logs_user_id ON public.scan_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_created_at ON public.scan_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Admin users can read admin_users table
CREATE POLICY "Admins can read admin_users" ON public.admin_users
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM public.admin_users)
    );

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access to scan_logs" ON public.scan_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to error_logs" ON public.error_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to user_activity" ON public.user_activity
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- INSERT DEFAULT ADMINS
-- Note: Run this after users sign up, or update user_id manually
-- ============================================

-- Insert admin emails (user_id will be updated when they sign in)
INSERT INTO public.admin_users (email, role) VALUES
    ('krushi.krishh@gmail.com', 'super_admin'),
    ('nallandhigalsumanth@gmail.com', 'super_admin')
ON CONFLICT (email) DO NOTHING;
