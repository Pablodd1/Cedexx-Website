# CEDEXX Backend API

## Overview

Full-stack backend for the CEDEXX telemedicine platform with Supabase PostgreSQL, Resend email, and an admin dashboard.

## Quick Start

```bash
cd backend
npm install
# Copy .env.example to .env and fill in your credentials
cp .env.example .env
npm run dev        # Development with hot reload (tsx watch)
npm run build      # Compile TypeScript to dist/
npm start          # Production server
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check + service status |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/demo` | Schedule a demo |
| POST | `/api/enroll` | Initiate enrollment |
| POST | `/api/partner` | Submit partner inquiry |
| POST | `/api/analytics` | Log analytics events |

### Admin Endpoints (requires `X-Admin-Token` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Overview stats + recent submissions |
| GET | `/api/admin/:table` | List records (contacts, demo_requests, enrollments, partner_inquiries, analytics_events) |
| PATCH | `/api/admin/:table/:id` | Update record status |
| DELETE | `/api/admin/:table/:id` | Delete record |
| GET | `/api/admin/analytics/summary?days=30` | Analytics summary |

## Database Tables

- `contacts` — General inquiries
- `demo_requests` — Demo scheduling requests
- `enrollments` — Enrollment applications
- `partner_inquiries` — Partnership inquiries
- `analytics_events` — Visitor behavior events
- `admin_users` — Dashboard users
- `site_settings` — Configurable site values
- `seo_versions` — Schema.org versioning

## Environment Variables

```
SUPABASE_URL=          # Your Supabase project URL
SUPABASE_SERVICE_KEY=  # Service role key (NOT anon key)
RESEND_API_KEY=        # Resend email API key
ADMIN_TOKEN=           # Token for /api/admin/* access
ADMIN_SECRET=          # Fallback secret for development
PORT=3001
```

## Admin Dashboard

Open `admin-dashboard.html` in a browser. Set your admin token in the top-right input. This is a standalone HTML file that calls the backend API.

## Rate Limits

- General API: 30 requests/minute
- Form submissions: 10 requests/15 minutes

## Security

- Helmet.js for security headers
- CORS restricted to known origins
- Input sanitization (HTML entities stripped)
- Email validation
- Admin token authentication
- Row-Level Security (RLS) on all Supabase tables
