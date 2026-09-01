-- Cedexx Members Table — Updated September 2026
-- Run this in Supabase SQL Editor to add missing columns

-- Add missing columns for payment tracking
ALTER TABLE members ADD COLUMN IF NOT EXISTS checkout_started_at TIMESTAMPTZ;
ALTER TABLE members ADD COLUMN IF NOT EXISTS checkout_expired_at TIMESTAMPTZ;
ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_members_stripe_session ON members(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_members_stripe_customer ON members(stripe_customer_id);

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;
