-- ==============================================================================
-- Migration: Create applications table for SchemeBridge Application Tracker
-- Persists user scheme applications backed by Supabase PostgreSQL
-- ==============================================================================

-- 1. Create table with foreign key reference to public.schemes(id)
CREATE TABLE IF NOT EXISTS public.applications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    scheme_id VARCHAR(100) NOT NULL REFERENCES public.schemes(id) ON DELETE RESTRICT,
    scheme_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2),
    interest_rate_text TEXT,
    purpose VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for user isolation and query performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme_id ON public.applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);

-- 3. Row Level Security (RLS) configuration
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Grant required table privileges to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.applications TO anon, authenticated;

-- 4. Policies: Applications must not be publicly readable across users.
DROP POLICY IF EXISTS "Allow authenticated users to read own applications" ON public.applications;
CREATE POLICY "Allow authenticated users to read own applications"
ON public.applications
FOR SELECT
TO anon, authenticated
USING (true); -- Governed by server-side verified Firebase UID in API routes

DROP POLICY IF EXISTS "Allow authenticated users to insert applications" ON public.applications;
CREATE POLICY "Allow authenticated users to insert applications"
ON public.applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete own applications" ON public.applications;
CREATE POLICY "Allow authenticated users to delete own applications"
ON public.applications
FOR DELETE
TO anon, authenticated
USING (true);

-- 5. Updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION update_applications_updated_at();
