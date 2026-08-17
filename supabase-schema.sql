-- CEDEXX Database Schema
-- Run this in Supabase SQL Editor

-- 1. ENROLLMENTS TABLE (for Stripe payments)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  plan_type TEXT,
  status TEXT DEFAULT 'pending',
  payment_provider TEXT,
  payment_reference TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CONTACTS TABLE (for contact form)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DEMO REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  company TEXT,
  facility_type TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PARTNER INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.partner_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  organization TEXT,
  inquiry_type TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  page_path TEXT,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for service_role (backend access)
CREATE POLICY "Service role can do all on enrollments" ON public.enrollments
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do all on contacts" ON public.contacts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do all on demo_requests" ON public.demo_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do all on partner_inquiries" ON public.partner_inquiries
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do all on analytics_events" ON public.analytics_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON public.enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_stripe_session ON public.enrollments(stripe_checkout_session_id);
