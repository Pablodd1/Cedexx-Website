-- Create members table for Cedexx registrations
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  dob TEXT,
  plan TEXT,
  status TEXT DEFAULT 'registered',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  stripe_session_id TEXT,
  consent_tos BOOLEAN DEFAULT FALSE,
  consent_analytics BOOLEAN DEFAULT FALSE,
  consent_version TEXT DEFAULT '1.0',
  consent_timestamp TIMESTAMPTZ,
  form_started_at TIMESTAMPTZ,
  form_field TEXT,
  page_url TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_plan ON members(plan);
CREATE INDEX IF NOT EXISTS idx_members_registered_at ON members(registered_at DESC);

-- Enable Row Level Security (open for now since we use API key auth)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Allow anon insert/select/update (protected by dashboard password/API key)
CREATE POLICY "Allow all" ON members
  FOR ALL TO anon USING (true) WITH CHECK (true);
