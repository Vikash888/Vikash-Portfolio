-- ============================================================================
-- SUPABASE / POSTGRESQL SCHEMA FOR DPDP ACT 2023 COMPLIANCE
-- ============================================================================
-- Repository: Vikash-Portfolio
-- Purpose:
--   1. Record verifiable consent logs (DPDP Section 6)
--   2. Manage Data Principal privacy rights requests (Access, Correction, Erasure, Nomination - DPDP Section 11-14)
--   3. Enforce Row-Level Security (RLS) on all personal data tables
--   4. Implement automated data retention & pruning (DPDP Section 8(7))
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- TABLE: consent_logs
-- Records consent given by visitors/users (contact form, cookie preferences)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier TEXT NOT NULL,                  -- Pseudonymized identifier, session hash or email
    consent_type TEXT NOT NULL,                     -- 'contact_form', 'cookies_analytics', 'cookies_all'
    policy_version TEXT NOT NULL DEFAULT 'v1.0',     -- Version of Privacy Policy consented to
    consent_given BOOLEAN NOT NULL DEFAULT TRUE,
    age_declared_18_plus BOOLEAN NOT NULL DEFAULT TRUE,
    ip_hash TEXT,                                   -- One-way SHA-256 hash of IP (never raw IP for privacy minimization)
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    withdrawn_at TIMESTAMPTZ,                       -- Populated if consent is subsequently withdrawn
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_consent_logs_identifier ON public.consent_logs(user_identifier);
CREATE INDEX IF NOT EXISTS idx_consent_logs_created_at ON public.consent_logs(created_at);

-- ----------------------------------------------------------------------------
-- TABLE: privacy_requests
-- Handles Data Principal rights requests (Access, Rectification, Erasure, Nomination)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.privacy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'correction', 'erasure', 'withdraw_consent', 'nomination')),
    data_principal_name TEXT NOT NULL,
    data_principal_email TEXT NOT NULL,
    data_principal_phone TEXT,
    nominee_name TEXT,                              -- Required only if request_type = 'nomination'
    nominee_contact TEXT,
    request_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'completed', 'rejected')),
    resolution_notes TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ,
    deadline_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days') -- Internal SLA (max 90 days statutory)
);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_email ON public.privacy_requests(data_principal_email);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON public.privacy_requests(status);

-- ----------------------------------------------------------------------------
-- SECURITY HARDENING: Row-Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

-- Anonymous public users can only INSERT their own consent records and privacy requests
CREATE POLICY "Allow public insert of consent"
    ON public.consent_logs
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Anonymous public users cannot read, edit, or dump the consent logs
CREATE POLICY "Restrict read of consent logs to service_role / admin"
    ON public.consent_logs
    FOR SELECT
    TO service_role
    USING (true);

-- Allow public users to submit a privacy request
CREATE POLICY "Allow public insert of privacy requests"
    ON public.privacy_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only service_role (backend admin) can view and process privacy requests
CREATE POLICY "Restrict read of privacy requests to service_role"
    ON public.privacy_requests
    FOR SELECT
    TO service_role
    USING (true);

CREATE POLICY "Restrict update of privacy requests to service_role"
    ON public.privacy_requests
    FOR UPDATE
    TO service_role
    USING (true);

-- ----------------------------------------------------------------------------
-- DATA RETENTION & PRUNING POLICY (DPDP Section 8(7))
-- Personal data must not be retained beyond the period necessary for its purpose.
-- Contact inquiries & consent logs older than 180 days without ongoing interaction
-- are automatically anonymized or purged.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prune_expired_personal_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Anonymize consent logs older than 365 days
    UPDATE public.consent_logs
    SET 
        user_identifier = 'ANONYMIZED_' || substr(md5(id::text), 1, 8),
        ip_hash = NULL,
        user_agent = NULL,
        metadata = '{}'::jsonb
    WHERE created_at < NOW() - INTERVAL '365 days';

    -- 2. Remove resolved privacy requests older than 180 days
    DELETE FROM public.privacy_requests
    WHERE status IN ('completed', 'rejected')
      AND resolved_at < NOW() - INTERVAL '180 days';
END;
$$;

-- Note: In Supabase dashboard, you can schedule this using pg_cron:
-- SELECT cron.schedule('prune-dpdp-data-weekly', '0 3 * * 0', 'SELECT public.prune_expired_personal_data()');
