# CEDEXX Payment Workflow — Complete Audit & Fixes

## Date: 2026-09-03
## Status: CRITICAL — Multiple gaps found in error handling and notifications

---

## 🎯 Current Workflow (What Exists)

### Step 1: Registration
**File:** `src/pages/Enroll.tsx` → `POST /api/register-member`
- ✅ User fills form (personal info, plan selection)
- ✅ Saves to GitHub DB with status `registered`
- ✅ Sends welcome email to patient
- ✅ Sends admin notification email (support@cedexx.net, daisy@cedexx.net)
- ✅ Sends Telegram notification

### Step 2: Checkout
**File:** `src/pages/Enroll.tsx` → `POST /api/stripe/create-checkout`
- ✅ Creates Stripe checkout session with plan price mapping
- ✅ Supports promo codes (validates via `/api/stripe/validate-promo`)
- ✅ Returns Stripe checkout URL
- ❌ **GAP:** No email sent to patient saying "checkout started"
- ❌ **GAP:** No notification to admin that checkout started (only in webhook)

### Step 3: Payment Webhook
**File:** `/api/webhook/stripe.ts`
- ✅ Receives `checkout.session.completed`
- ✅ Updates member status to `paid`
- ✅ Saves Stripe customer/subscription IDs
- ✅ Sends payment confirmation email to patient
- ✅ Sends admin notification (email + Telegram + SMS)
- ✅ Calls `/api/bridge/lyric` to notify Lyric Health

### Step 4: Lyric Bridge
**File:** `/api/bridge/lyric.ts`
- ✅ Receives patient data
- ✅ Sends enrollment email to Lyric (enrollment@getlyric.com)
- ✅ Copies admin (support@cedexx.net)
- ✅ Sends Telegram notification about Lyric sync
- ✅ Updates member record with sync status
- ❌ **GAP:** Direct API call to Lyric is commented out (waiting for endpoint)

---

## 🚨 CRITICAL GAPS FOUND

### Gap 1: NO Critical Error Alerts to Jasmel
**Severity: CRITICAL**

When ANY error happens in:
- `/api/webhook/stripe.ts`
- `/api/bridge/lyric.ts`
- `/api/register-member.ts`
- `/api/stripe/create-checkout.ts`

**Current behavior:** Logs to console only
**Required behavior:** Send email to `jasmelacosta@gmail.com` + Telegram alert

### Gap 2: NO "Checkout Started" Email to Patient
**Severity: MEDIUM**

When patient clicks "Proceed to Checkout" and Stripe session is created, no confirmation email is sent saying "your checkout is ready, complete payment here".

### Gap 3: NO Promo Code Applied Confirmation
**Severity: LOW**

The `sendPromoAppliedEmail` function exists in `client-email.ts` but is NEVER called.

### Gap 4: Daisy Notification Incomplete
**Severity: MEDIUM**

Daisy should receive:
- ✅ New registration email
- ✅ New payment email
- ❌ Checkout started email
- ❌ Lyric sync confirmation

### Gap 5: Error Persistence
**Severity: HIGH**

Errors are only `console.error()` — they disappear when the serverless function ends. No persistent error log.

---

## ✅ REQUIRED FIXES

### Fix 1: Critical Error Alert System
Add to ALL API endpoints:
```typescript
async function alertCritical(error: Error, context: string) {
  // Send email to jasmelacosta@gmail.com
  // Send Telegram notification
  // Persist error to GitHub DB
}
```

### Fix 2: Checkout Started Notification
When `is_checkout` flag is set in `/api/register-member`, send:
- Email to patient: "Complete your enrollment"
- Email to admin: "Checkout started"
- Telegram notification

### Fix 3: Daisy Gets All Notifications
Ensure Daisy (daisy@cedexx.net) is in ALL admin notification emails.

### Fix 4: Error Persistence
Create `data/errors.json` in GitHub repo to log all critical errors with timestamps.

---

## 📋 TEST PLAN

1. **Test Registration Flow:**
   - Fill form → Verify GitHub DB update
   - Verify welcome email sent
   - Verify admin notification sent
   - Verify Telegram alert sent

2. **Test Checkout Flow:**
   - Select plan + promo code
   - Verify Stripe session created
   - Verify checkout started notification

3. **Test Payment Webhook:**
   - Simulate Stripe webhook
   - Verify member status = `paid`
   - Verify payment confirmation email
   - Verify admin notification
   - Verify Lyric bridge triggered

4. **Test Error Handling:**
   - Break Stripe key → Verify critical alert sent
   - Break GitHub token → Verify critical alert sent
   - Verify error persisted to DB

---

## 🔧 ENVIRONMENT VARIABLES REQUIRED

| Variable | Status | Purpose |
|----------|--------|---------|
| `STRIPE_SECRET_KEY` | ✅ | Stripe checkout |
| `STRIPE_WEBHOOK_SECRET` | ❓ | Webhook verification |
| `RESEND_API_KEY` | ✅ | Email sending |
| `GITHUB_TOKEN` | ✅ | Member DB |
| `TELEGRAM_BOT_TOKEN` | ✅ | Telegram alerts |
| `TELEGRAM_CHAT_ID` | ✅ | Telegram chat |
| `ADMIN_EMAIL` | ✅ | Admin notifications |
| `LYRIC_ENROLLMENT_EMAIL` | ✅ | Lyric enrollment |
| `JASMEL_EMAIL` | ❌ | Critical error alerts |

**Action:** Add `JASMEL_EMAIL=jasmelacosta@gmail.com` to Vercel env vars.

---

## 🎯 RECOMMENDATION

1. **Immediate (Today):** Implement critical error alerts
2. **This Week:** Add checkout started notifications
3. **Before Launch:** Full end-to-end test with Stripe test mode
