-- ==============================================================================
-- Migration: Create schemes table for SchemeBridge Government Scheme Catalog
-- Sourced directly from NSFDC & MoSJE official statutory guidelines
-- ==============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.schemes (
    id VARCHAR(100) PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    purpose_category VARCHAR(50) NOT NULL,
    max_loan_amount NUMERIC(15, 2) NOT NULL,
    income_limit NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    interest_rate_text TEXT NOT NULL,
    govt_coverage_percent NUMERIC(5, 2) NOT NULL,
    promoter_margin_percent NUMERIC(5, 2) NOT NULL,
    moratorium_available BOOLEAN NOT NULL DEFAULT FALSE,
    moratorium_details TEXT,
    repayment_period TEXT,
    target_beneficiaries TEXT NOT NULL,
    description TEXT NOT NULL,
    key_highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    semantic_description TEXT NOT NULL,
    official_source TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Indexes for efficient querying and filtering
CREATE INDEX IF NOT EXISTS idx_schemes_purpose_category ON public.schemes(purpose_category);
CREATE INDEX IF NOT EXISTS idx_schemes_is_active ON public.schemes(is_active);
CREATE INDEX IF NOT EXISTS idx_schemes_income_limit ON public.schemes(income_limit);
CREATE INDEX IF NOT EXISTS idx_schemes_max_loan ON public.schemes(max_loan_amount);

-- 3. Row Level Security (RLS) configuration
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

-- Grant required table SELECT privileges to anon and authenticated roles (governed by RLS below)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.schemes TO anon, authenticated;

-- 4. Policy: Allow public read-only access for active schemes (anon and authenticated users)
DROP POLICY IF EXISTS "Allow public read access for active schemes" ON public.schemes;
CREATE POLICY "Allow public read access for active schemes" 
ON public.schemes
FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- 5. Updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_schemes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_schemes_updated_at ON public.schemes;
CREATE TRIGGER trg_schemes_updated_at
BEFORE UPDATE ON public.schemes
FOR EACH ROW
EXECUTE FUNCTION update_schemes_updated_at();
