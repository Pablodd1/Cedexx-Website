---
name: b2b-local-lead-scraper
description: Extract and enrich local B2B prospect lists (Multifamily Property Managers, Student Housing, School Districts, Restaurants, and SMB Employers) using Google Maps lead discovery workflows (inspired by gosom/google-maps-scraper) for CEDEXX institutional outreach.
---

# B2B Local Lead Discovery & Enrichment (CEDEXX Institutional Growth)

Use this skill when building targeted B2B prospect lists for **CEDEXX Institutional & Community Partnerships** (`/partners` and `/api/b2b-campaign`).

## Target B2B Verticals for CEDEXX
1. **Multifamily Communities & Property Management Groups** (Resident Wellness Amenities, Lease Retention)
2. **University & Off-Campus Student Housing** ($26.99/mo All-In-One CareNow + Mental Wellness, No ID Required)
3. **Private Schools, Charter Networks & School Districts** (24/7 Pediatrics, Digital School Excuse Notes, Family Counseling)
4. **Hospitality, Restaurants, Retail & Hourly Employers** (Affordable Group Telehealth for Part-Time & Full-Time Staff)

## Workflow
1. **Define Geography & Category:** Specify city/metro (e.g., Miami-Dade, Broward, Houston, Dallas, Orlando) and business category.
2. **Extract Core Fields:** Business Name, Decision-Maker/Role, Phone Number, Public Email, Website URL, Address, Google Rating, and Review Count.
3. **Format for CEDEXX B2B Campaign Engine:** Output clean CSV lines (`email@company.com, First Name, Organization Name`) compatible with `api/b2b-campaign.ts` and `src/data/b2b-email-campaigns.ts`.
