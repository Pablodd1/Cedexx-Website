# CEDEXX + Lyric Health Partnership — Modification Plan

## Executive Summary
CEDEXX has contracted with **Lyric Health** (Integrated Virtual Primary Care | Telehealth Services) as its sole telehealth provider. All references to "independent telemedicine providers," "third-party providers," or generic provider networks must be replaced with Lyric Health branding.

## What Lyric Health Offers
- 24/7 Urgent Care
- Primary Care
- Mental Health
- Dermatology
- Virtual MSK (Musculoskeletal)
- Care Navigation
- Labs
- GLP-1 Weight Loss Program
- Nationwide network of licensed physicians, pediatricians, dermatologists, psychiatrists, and therapists
- Average 10+ years provider experience
- Phone and video consultations
- Prescriptions sent to local pharmacy
- Digital work/school notes

## Critical Rule
**NO other company should be mentioned for telehealth services.** CEDEXX = powered by Lyric Health. Period.

---

## Files to Modify (in order)

### 1. Chatbot/Voice Assistant (HIGHEST PRIORITY — customer-facing AI)
- **Files:** `src/components/Chatbot.tsx`, `src/components/VoiceAssistant.tsx`, `src/components/SmartChat.tsx`, `public/cedexx-chatbot-widget.js`
- **Changes:**
  - Replace "independent telemedicine providers" → "Lyric Health"
  - Replace "independent licensed providers" → "Lyric Health's licensed providers"
  - Replace "independent contractor" language → "Lyric Health provider"
  - Update system prompts for all AI assistants
  - Update FAQ answers

### 2. Terms of Service (Legal — must be accurate)
- **File:** `src/pages/Terms.tsx`
- **Changes:**
  - Update Section 1: "We operate as a technology platform connecting users with Lyric Health, our exclusive telehealth partner"
  - Replace "independent third-party telemedicine providers" → "Lyric Health"
  - Replace "independent contractors" → "Lyric Health providers" (or keep legal language but specify Lyric)
  - Update prescription policy to mention Lyric
  - Update liability sections

### 3. Privacy Policy (Legal — must be accurate)
- **File:** `src/pages/Privacy.tsx`
- **Changes:**
  - Replace "independent telemedicine providers" → "Lyric Health"
  - Update data sharing section: "Healthcare Providers: With Lyric Health providers and pharmacies directly involved in your care"

### 4. About Page
- **File:** `src/pages/About.tsx`
- **Changes:**
  - Replace "Connecting families to healthcare" → "Connecting families to Lyric Health's integrated virtual care"
  - Replace "independent licensed providers" → "Lyric Health's licensed providers"

### 5. Home Page
- **File:** `src/pages/Home.tsx`
- **Changes:**
  - Update hero section to mention Lyric Health partnership
  - Replace "Physician Opportunities" / "independent provider model" → Remove or reframe as "Join Lyric Health's Provider Network"
  - Update any provider-related CTAs

### 6. Services Page
- **File:** `src/pages/Services.tsx`
- **Changes:**
  - Update service descriptions to match Lyric's offerings (Urgent Care, Primary Care, Mental Health, Dermatology, Virtual MSK, Care Navigation, Labs, GLP-1)
  - Replace "National Network" / "Independent board-certified providers" → "Lyric Health's nationwide network"

### 7. Corporate Page
- **File:** `src/pages/Corporate.tsx`
- **Changes:**
  - Update "Strategic Partnerships" section to feature Lyric Health prominently
  - Update telemedicine package descriptions

### 8. Video Library / FAQ
- **File:** `src/pages/VideoLibrary.tsx`
- **Changes:**
  - Update FAQ answers to reference Lyric Health
  - Replace "provider" with "Lyric Health provider" or "Lyric provider"
  - Update video titles if needed

### 9. Translations (LanguageContext)
- **File:** `src/context/LanguageContext.tsx`
- **Changes:**
  - Update all EN/ES/HT/RU translations
  - Replace "independent board-certified providers" → "Lyric Health providers"
  - Update hero description, SEO description, disclaimer text

### 10. SEO Injection Script
- **File:** `seo/inject-schema.js`
- **Changes:**
  - Update meta descriptions to mention Lyric Health
  - Update Schema.org to include Lyric Health as the provider organization
  - Add MedicalOrganization schema for Lyric Health

### 11. Backend API
- **Files:** `backend/server.ts`, `backend/routes/index.ts`, `backend/schema.sql`, `backend/seed.sql`
- **Changes:**
  - Update system prompts in API
  - Update seed data testimonials to mention Lyric
  - Update partner inquiry references

### 12. Investor Pitch
- **File:** `src/pages/InvestorPitch.tsx` (if exists)
- **Changes:** Update partnership slides

### 13. Enrollment Page
- **File:** `src/pages/Enroll.tsx` (if exists)
- **Changes:** Update to mention Lyric Health enrollment

### 14. Partners Page
- **File:** `src/pages/Partners.tsx`
- **Changes:** Add Lyric Health as featured partner

---

## Specific Text Replacements (Global)

| Old Text | New Text |
|----------|----------|
| "independent telemedicine providers" | "Lyric Health" |
| "independent licensed providers" | "Lyric Health's licensed providers" |
| "independent board-certified providers" | "Lyric Health's board-certified providers" |
| "independent third-party" | "Lyric Health" |
| "third-party telemedicine providers" | "Lyric Health" |
| "independent contractors" | "Lyric Health providers" (or keep legal phrasing) |
| "providers are independent" | "providers are part of Lyric Health's network" |
| "platform connecting families to" | "platform connecting families to Lyric Health's" |
| "connecting residents to independent" | "connecting residents to Lyric Health's" |
| "connecting members to independent" | "connecting members to Lyric Health's" |
| "national network of independent" | "Lyric Health's nationwide network of" |
| "We do not employ, control, or supervise healthcare providers" | "Healthcare services are provided by Lyric Health, our exclusive telehealth partner" |
| "No insurance needed" | "No insurance required" (keep if still true) |
| "$14.99/mo individual, $27.99/mo family" | VERIFY WITH LYRIC — update if different |

---

## Pricing Verification Needed
Current CEDEXX pricing: $14.99/mo individual, $27.99/mo family
Need to verify if this matches Lyric Health's pricing structure or if we need to adjust.

---

## Services Update (Match Lyric's Offerings)
CEDEXX should now offer exactly what Lyric offers:
1. 24/7 Urgent Care
2. Primary Care
3. Mental Health
4. Dermatology
5. Virtual MSK
6. Care Navigation
7. Labs
8. GLP-1 Weight Loss

Remove any services not offered by Lyric. Add any missing ones.

---

## Schema.org Updates
- Add `MedicalOrganization` schema for Lyric Health
- Add `Physician` schema for Lyric's provider network
- Update `LocalBusiness` to reflect partnership
- Add `Organization` → `partner` → `MedicalOrganization` (Lyric)

---

## Action Plan

### Phase 1 (Immediate — customer-facing AI)
1. Update Chatbot.tsx system prompt
2. Update VoiceAssistant.tsx system prompt
3. Update SmartChat.tsx responses
4. Update public widget script

### Phase 2 (Same day — legal and main pages)
5. Update Terms.tsx
6. Update Privacy.tsx
7. Update About.tsx
8. Update Home.tsx hero

### Phase 3 (Next — services and content)
9. Update Services.tsx
10. Update Corporate.tsx
11. Update VideoLibrary.tsx
12. Update Partners.tsx

### Phase 4 (Backend and SEO)
13. Update LanguageContext.tsx (all translations)
14. Update backend API prompts
15. Update seed.sql
16. Update seo/inject-schema.js
17. Regenerate sitemap with updated content

### Phase 5 (Deploy)
18. Git commit and push
19. Deploy to Vercel
20. Test all chatbot responses
21. Verify Schema.org injection

---

## Estimated Time: 4-6 hours
## Impact: CRITICAL — All customer-facing content must reflect Lyric partnership
