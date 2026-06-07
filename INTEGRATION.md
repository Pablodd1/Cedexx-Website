# CEDEXX Frontend → Backend Integration Guide

## API Endpoints

All endpoints accept JSON and return `{ success: boolean, ... }`.

### 1. Contact Form (`src/pages/Contact.tsx`)

**Endpoint:** `POST /api/contact`

**Fields:**
| Frontend Field | API Field | Required | Validation |
|----------------|-----------|----------|------------|
| name | name | ✅ | 2-100 chars |
| email | email | ✅ | Valid email |
| company | company | ❌ | Max 100 chars |
| message | message | ✅ | 10-3000 chars |

**Example:**
```javascript
const res = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    company: formData.company || null,
    message: formData.message,
    source: 'website'
  })
});
```

---

### 2. Schedule Demo (`src/pages/ScheduleDemo.tsx`)

**Endpoint:** `POST /api/demo`

**Fields:**
| Frontend Field | API Field | Required | Notes |
|----------------|-----------|----------|-------|
| name | name | ✅ | 2-100 chars |
| email | email | ✅ | Valid email |
| company | company | ❌ | Max 100 chars |
| facility_type | facility_type | ❌ | From dropdown |
| preferred_date | preferred_date | ❌ | ISO 8601 date |
| preferred_time | preferred_time | ❌ | e.g. "10:00 AM – 11:00 AM EST" |
| notes | notes | ❌ | Max 2000 chars |

---

### 3. Enrollment (`src/pages/Enroll.tsx`)

**Endpoint:** `POST /api/enroll`

**Fields:**
| Frontend Field | API Field | Required | Validation |
|----------------|-----------|----------|------------|
| first_name | first_name | ✅ | Max 50 chars |
| last_name | last_name | ✅ | Max 50 chars |
| email | email | ✅ | Valid email |
| phone | phone | ❌ | Max 30 chars |
| date_of_birth | date_of_birth | ❌ | ISO 8601 date |
| role | role | ✅ | `individual`/`hospitality`/`housing`/`affiliate` |
| plan | plan | ✅ | `family`/`individual` |

**Response includes:**
```json
{
  "success": true,
  "id": "uuid",
  "next_step": "payment",
  "plan_details": {
    "name": "Family Plan",
    "price": "$27.99/month",
    "members": "Up to 4"
  }
}
```

---

### 4. Partner Inquiry (`src/pages/Partners.tsx` + `PartnerForm.tsx`)

**Endpoint:** `POST /api/partner`

**Fields:**
| Frontend Field | API Field | Required | Notes |
|----------------|-----------|----------|-------|
| name | name | ✅ | 2-100 chars |
| email | email | ✅ | Valid email |
| phone | phone | ❌ | Max 30 chars |
| role | role | ✅ | From dropdown (Physician, Hospitality, etc.) |
| organization | organization | ❌ | Max 100 chars |
| message | message | ✅ | 10-3000 chars |

---

### 5. Analytics (Agentic Engine)

**Endpoint:** `POST /api/analytics`

**Payload:**
```json
{
  "site_id": "cedexx",
  "events": [
    {
      "type": "click",
      "data": { "tag": "A", "text": "Start Membership", "is_cta": true },
      "url": "https://cedexx.net/",
      "referrer": "https://google.com",
      "timestamp": "2026-06-07T12:00:00Z",
      "session_id": "sess_abc123"
    }
  ]
}
```

**Batch size:** Max 50 events per request. Flushed every 5 seconds or 20 events.

---

## Admin Dashboard

Open `backend/admin-dashboard.html` in a browser. Set your `ADMIN_TOKEN` from `.env` in the top-right input field.

**Endpoints used:**
- `GET /api/admin/dashboard` — Overview stats
- `GET /api/admin/:table` — List records (contacts, demo_requests, enrollments, partner_inquiries, analytics_events)
- `PATCH /api/admin/:table/:id` — Update status
- `DELETE /api/admin/:table/:id` — Delete record
- `GET /api/admin/analytics/summary?days=30` — Analytics summary

All admin endpoints require `X-Admin-Token` header.

---

## SEO Integration

After building the frontend:

```bash
npm run build
node scripts/post-build.js
```

This injects Schema.org markup into all `dist/*.html` files:
- `MedicalBusiness` — Primary entity
- `LocalBusiness` — Miami location + hours
- `FAQPage` — Homepage FAQ section
- `HowTo` — Enrollment process
- `WebSite` — SearchAction
- `BreadcrumbList` — Navigation structure
- `VideoObject` — Hero video

The script is **non-destructive** — it does not modify React source code.

---

## Agentic Engine Upgrade

Replace the existing `public/agentic-engine.js` and `public/agentic-config.js` with the v2 versions from `seo/`:

```bash
cp seo/agentic-engine-v2.js public/agentic-engine.js
cp seo/agentic-config-v2.js public/agentic-config.js
```

The v2 engine:
- Tracks clicks, scroll depth, form interactions, video plays, session duration
- Batches events to `/api/analytics`
- A/B tests CTA text variants
- Auto-optimizes meta titles, descriptions, and content priority
- Provides real-time engagement scoring
- Prefetches popular pages
- Generates self-reporting dashboard data

---

## Environment Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase and Resend credentials
npm install
npm run dev
```

## Database Setup

1. Create a Supabase project
2. Run `schema.sql` in the SQL Editor
3. Run `seed.sql` for sample data (optional)
4. Enable Row Level Security (already configured in schema)

## Fallback Mode

If Supabase or Resend are not configured, the backend runs in **fallback mode**:
- Form submissions are logged to console
- No database persistence
- No email notifications
- Admin dashboard shows `fallback: true`

This is useful for local development and testing.
