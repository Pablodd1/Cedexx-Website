-- ═══════════════════════════════════════════════
-- CEDEXX Database Seed Script
-- Insert sample data for testing/admin preview
-- ═══════════════════════════════════════════════
-- Run after schema.sql is applied

-- Seed: sample contact submissions
INSERT INTO contacts (name, email, company, message, status, source)
VALUES
  ('Jane Smith', 'jane.smith@example.com', 'Smith Family LLC', 'I am interested in enrolling my family of 4 in the CEDEXX plan. Can someone reach out to discuss the details?', 'new', 'website'),
  ('Dr. Robert Chen', 'rchen@medgroup.com', 'Miami Medical Group', 'We are a multi-specialty clinic in Miami Beach looking to partner with CEDEXX for our patient referral network. Please send partnership details.', 'contacted', 'website'),
  ('Maria Garcia', 'mgarcia@resort.com', 'Oceanfront Resorts', 'We operate 3 boutique hotels in South Beach and would like to offer CEDEXX as a guest amenity. Interested in hospitality partnership terms.', 'new', 'website'),
  ('David Park', 'dpark@studenthousing.com', 'Campus Living Solutions', 'Looking to integrate healthcare access into our student housing complexes. We have 2,500 units across Miami-Dade. Can we schedule a demo?', 'resolved', 'website'),
  ('Sarah Johnson', 'sjohnson@gmail.com', NULL, 'My son had a fever last night and I used Lyric Health through CEDEXX. The doctor was amazing and the prescription was ready in 30 minutes. Thank you CEDEXX + Lyric Health!', 'resolved', 'website');

-- Seed: sample demo requests
INSERT INTO demo_requests (name, email, company, facility_type, preferred_date, preferred_time, notes, status, source)
VALUES
  ('James Wilson', 'jwilson@browardhealth.com', 'Broward Health System', 'Healthcare Facility (Hospital/Nursing Home)', '2026-06-15', '10:00 AM – 11:00 AM EST', 'We are evaluating Lyric Health virtual care integration for our 12-bed pediatric wing. Need to understand integration requirements.', 'pending', 'website'),
  ('Lisa Martinez', 'lmartinez@palmbeachliving.com', 'Palm Beach Living', 'Housing / REIT Partner', '2026-06-18', '2:00 PM – 3:00 PM EST', 'Managing 850+ multifamily units. Interested in "rent-included" healthcare amenity model.', 'scheduled', 'website'),
  ('Ahmed Hassan', 'ahassan@royalpalms.com', 'Royal Palms Hotels', 'Hospitality Partner', '2026-06-20', '11:00 AM – 12:00 PM EST', '5-star boutique hotel chain (3 properties). Want to offer virtual concierge healthcare to guests.', 'pending', 'website');

-- Seed: sample enrollments
INSERT INTO enrollments (first_name, last_name, email, phone, date_of_birth, role, plan, status, source)
VALUES
  ('Emily', 'Rodriguez', 'emily.r@email.com', '+1 (305) 555-0101', '1988-03-15', 'individual', 'family', 'active', 'website'),
  ('Michael', 'Thompson', 'mthompson@family.net', '+1 (954) 555-0202', '1990-07-22', 'individual', 'individual', 'active', 'website'),
  ('Patricia', 'Lee', 'plee@corporate.com', '+1 (786) 555-0303', '1975-11-08', 'hospitality', 'family', 'pending_payment', 'website'),
  ('Carlos', 'Fernandez', 'cfernandez@housing.org', '+1 (561) 555-0404', '1982-01-30', 'housing', 'family', 'active', 'website');

-- Seed: sample partner inquiries
INSERT INTO partner_inquiries (name, email, phone, role, organization, message, status, source)
VALUES
  ('Dr. Angela Wright', 'awright@pediatriccare.net', '+1 (305) 555-0505', 'Physician', 'Wright Pediatric Associates', 'Board-certified pediatrician with 15 years experience. Interested in joining Lyric Health provider network through CEDEXX platform. Available for scheduled blocks.', 'reviewing', 'website'),
  ('Kevin O''Brien', 'kobrien@affiliatemedia.com', '+1 (407) 555-0606', 'Affiliate Partner', 'Affiliate Media Network', 'Healthcare marketing affiliate with 200K+ email list focused on Florida families. Interested in revenue-share partnership for CEDEXX referrals.', 'negotiating', 'website'),
  ('Natalie Brooks', 'nbrooks@seniorcare.org', '+1 (954) 555-0707', 'Hospitality Partner', 'Senior Care Alliance', 'Non-profit operating assisted living facilities across South Florida. Looking for healthcare access solution for 340 residents.', 'contacted', 'website');

-- Seed: sample analytics events (last 7 days)
INSERT INTO analytics_events (site_id, session_id, event_type, event_data, url, referrer)
VALUES
  ('cedexx', 'sess_abc123', 'page_view', '{"path":"/"}', 'https://cedexx.net/', 'https://google.com'),
  ('cedexx', 'sess_abc123', 'scroll_depth', '{"percent":25}', 'https://cedexx.net/', NULL),
  ('cedexx', 'sess_abc123', 'click', '{"tag":"A","text":"Start Membership","is_cta":true,"section":"hero"}', 'https://cedexx.net/', NULL),
  ('cedexx', 'sess_abc123', 'scroll_depth', '{"percent":75}', 'https://cedexx.net/', NULL),
  ('cedexx', 'sess_abc123', 'form_start', '{"form_id":"partner"}', 'https://cedexx.net/partners', NULL),
  ('cedexx', 'sess_def456', 'page_view', '{"path":"/services"}', 'https://cedexx.net/services', 'https://cedexx.net/'),
  ('cedexx', 'sess_def456', 'click', '{"tag":"A","text":"Learn More","is_cta":false,"section":"services"}', 'https://cedexx.net/services', NULL),
  ('cedexx', 'sess_def456', 'scroll_depth', '{"percent":50}', 'https://cedexx.net/services', NULL),
  ('cedexx', 'sess_ghi789', 'page_view', '{"path":"/enroll"}', 'https://cedexx.net/enroll', 'https://facebook.com'),
  ('cedexx', 'sess_ghi789', 'form_start', '{"form_id":"enroll"}', 'https://cedexx.net/enroll', NULL),
  ('cedexx', 'sess_ghi789', 'form_submit', '{"form_id":"enroll","fields":["first_name","last_name","email"]}', 'https://cedexx.net/enroll', NULL),
  ('cedexx', 'sess_ghi789', 'session_end', '{"duration_seconds":184,"max_scroll_percent":100,"click_count":3,"bounce":false}', 'https://cedexx.net/enroll', NULL);

-- ═══════════════════════════════════════════════
-- END OF SEED
-- ═══════════════════════════════════════════════
