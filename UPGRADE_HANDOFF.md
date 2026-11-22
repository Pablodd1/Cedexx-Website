# AI Developer Upgrade Handoff — CEDEXX Website

## What Was Changed (Branch: `main`, Commit `2915597`)
- **Updated `index.html` & `seo/inject-schema.js`**:
  - Unified 50-state Lyric Health `$18.99–$52.99` `@graph` Schema.org JSON-LD.
  - Removed non-compliant/fake `aggregateRating` schema and duplicate `robots` meta tag.
  - Added HIPAA-safe PostHog funnel loader (no-op unless configured).

## Live Test Verification
- `https://cedexx.net`: HTTP `200`, `robots.txt` `200`, `llms.txt` `200`, `aggregateRating` removed (`0` occurrences).

## Developer Actions Needed
- If enabling analytics, set your PostHog key/host (or connect the live Railway Umami instance at `https://umami-production-92f6d421.up.railway.app` — default admin login should be changed first). Keep PHI/form inputs strictly excluded from tracking.
