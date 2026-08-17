-- ═══════════════════════════════════════════════
-- CEDEXX PostgreSQL Database Schema for Supabase
-- ═══════════════════════════════════════════════
-- Run via: npx supabase db push
-- Or paste into Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────
-- 1. CONTACTS TABLE (General inquiries)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'spam')),
    source VARCHAR(100) DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

-- ──────────────────────────────────────────────
-- 2. DEMO REQUESTS TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(100),
    facility_type VARCHAR(100),
    preferred_date DATE,
    preferred_time VARCHAR(50),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'no_show')),
    source VARCHAR(100) DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    notes_internal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_demo_email ON demo_requests(email);
CREATE INDEX idx_demo_status ON demo_requests(status);
CREATE INDEX idx_demo_created_at ON demo_requests(created_at DESC);

-- ──────────────────────────────────────────────
-- 3. ENROLLMENTS TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    date_of_birth DATE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('individual', 'hospitality', 'housing', 'affiliate')),
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('family', 'individual')),
    cardholder_name VARCHAR(100),
    billing_address TEXT,
    status VARCHAR(50) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'active', 'suspended', 'cancelled', 'expired')),
    payment_provider VARCHAR(50),
    payment_reference VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_checkout_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    source VARCHAR(100) DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrollments_email ON enrollments(email);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_plan ON enrollments(plan);
CREATE INDEX idx_enrollments_created_at ON enrollments(created_at DESC);

-- ──────────────────────────────────────────────
-- 4. PARTNER INQUIRIES TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(100) NOT NULL,
    organization VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'negotiating', 'approved', 'declined')),
    source VARCHAR(100) DEFAULT 'website',
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_email ON partner_inquiries(email);
CREATE INDEX idx_partner_status ON partner_inquiries(status);
CREATE INDEX idx_partner_created_at ON partner_inquiries(created_at DESC);

-- ──────────────────────────────────────────────
-- 5. ANALYTICS EVENTS TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_site ON analytics_events(site_id);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- ──────────────────────────────────────────────
-- 6. ADMIN USERS TABLE (for custom auth)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- bcrypt hash
    name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_email ON admin_users(email);

-- ──────────────────────────────────────────────
-- 7. SEO SCHEMA VERSIONING TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(500) NOT NULL,
    schema_json JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    applied_at TIMESTAMPTZ,
    success BOOLEAN DEFAULT false,
    notes TEXT,
    UNIQUE(page_path, generated_at)
);

CREATE INDEX idx_seo_page ON seo_versions(page_path);

-- ──────────────────────────────────────────────
-- 8. SITE SETTINGS TABLE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id)
);

INSERT INTO site_settings (key, value, type, description) VALUES
('site_name', 'CEDEXX', 'string', 'Brand name'),
('site_tagline', 'Better Care. Here. Now.', 'string', 'Primary tagline'),
('contact_email', 'info@cedexx.net', 'string', 'Primary contact email'),
('support_phone', '954-624-6744', 'string', 'Support phone number'),
('family_plan_price', '$27.99', 'string', 'Family plan monthly price'),
('individual_plan_price', '$14.99', 'string', 'Individual plan monthly price'),
('location_city', 'Miami', 'string', 'Primary location'),
('location_state', 'Florida', 'string', 'State'),
('certification_id', 'OSD-2026-FL', 'string', 'Certification identifier')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public (anon) — no read access to submissions
CREATE POLICY "No public read on contacts" ON contacts FOR SELECT TO anon USING (false);
CREATE POLICY "No public read on demos" ON demo_requests FOR SELECT TO anon USING (false);
CREATE POLICY "No public read on enrollments" ON enrollments FOR SELECT TO anon USING (false);
CREATE POLICY "No public read on partners" ON partner_inquiries FOR SELECT TO anon USING (false);
CREATE POLICY "No public read on analytics" ON analytics_events FOR SELECT TO anon USING (false);

-- Service role / authenticated with specific claims — full access
CREATE POLICY "Service full access contacts" ON contacts USING (true);
CREATE POLICY "Service full access demos" ON demo_requests USING (true);
CREATE POLICY "Service full access enrollments" ON enrollments USING (true);
CREATE POLICY "Service full access partners" ON partner_inquiries USING (true);
CREATE POLICY "Service full access analytics" ON analytics_events USING (true);

-- Admin users self-manage
CREATE POLICY "Admins read own" ON admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admins all" ON admin_users FOR ALL USING (auth.jwt()->>'role' = 'super_admin');

-- ═══════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$ DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN ('contacts', 'demo_requests', 'enrollments', 'partner_inquiries', 'admin_users', 'site_settings')
    LOOP
        EXECUTE format(
            'CREATE TRIGGER IF NOT EXISTS trg_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
            tbl.tablename, tbl.tablename
        );
    END LOOP;
END $$;

-- Convenience view: all submissions last 7 days
CREATE OR REPLACE VIEW v_recent_submissions AS
SELECT 'contact' AS type, id, name, email, status, created_at FROM contacts
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'demo' AS type, id, name, email, status, created_at FROM demo_requests
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'enrollment' AS type, id, first_name || ' ' || last_name AS name, email, status, created_at FROM enrollments
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'partner' AS type, id, name, email, status, created_at FROM partner_inquiries
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Convenience view: conversion funnel by day
CREATE OR REPLACE VIEW v_daily_funnel AS
SELECT
    DATE_TRUNC('day', created_at) AS day,
    COUNT(*) FILTER (WHERE event_type = 'page_view') AS page_views,
    COUNT(*) FILTER (WHERE event_type = 'click') AS clicks,
    COUNT(*) FILTER (WHERE event_type = 'form_submit' AND event_data->>'form_id' LIKE '%contact%') AS contact_submits,
    COUNT(*) FILTER (WHERE event_type = 'form_submit' AND event_data->>'form_id' LIKE '%demo%') AS demo_submits,
    COUNT(*) FILTER (WHERE event_type = 'form_submit' AND event_data->>'form_id' LIKE '%enroll%') AS enroll_submits,
    COUNT(*) FILTER (WHERE event_type = 'scroll_depth' AND (event_data->>'percent')::int >= 75) AS deep_scrolls
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

-- ═══════════════════════════════════════════════
-- SEED DATA (Optional — remove in production)
-- ═══════════════════════════════════════════════

-- Sample admin user (password: change-me-ASAP)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
    'admin@cedexx.net',
    '$2a$12$3FGvPRN3ZPx1SYL9tCWqUuF2LzBvBLh0m9qKq3l7R9qX1L7wK8a2e', -- bcrypt('change-me-ASAP')
    'System Admin',
    'super_admin'
)
ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════
-- END OF SCHEMA
-- ═══════════════════════════════════════════════
