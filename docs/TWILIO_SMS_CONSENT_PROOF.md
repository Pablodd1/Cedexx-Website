# CEDEXX — Proof of Consent for SMS/Text Messaging

**Submitted to:** Twilio Toll-Free Verification Team  
**Date:** September 3, 2026  
**Business Name:** CEDEXX, Inc.  
**Toll-Free Number:** +1 (855) 503-3371  
**Website:** https://cedexx.net  
**Support Email:** support@cedexx.net  

---

## 1. How Users Opt In to Receive SMS

CEDEXX obtains explicit consent before sending any text messages. We use **two opt-in methods**:

### Method A: Verbal Consent (Primary — Phone Call)
When a user calls our AI front desk at **(855) 503-3371**, the AI assistant asks:

> **"Would you like me to text you the enrollment link?"**

The user must provide an **affirmative verbal response** ("yes," "sure," "please," etc.) before any SMS is sent. This is recorded in our call logs with intent classification.

**Call Flow:**
1. User dials (855) 503-3371
2. AI greets user and answers questions
3. AI asks: *"Would you like me to text you the enrollment link?"*
4. If user says "yes" → SMS is sent immediately
5. If user says "no" or hangs up → no SMS is sent
6. All interactions are logged with caller ID, timestamp, and intent

### Method B: Web Form Consent (Online Enrollment)
During online enrollment at https://cedexx.net/enroll, users must check a consent box:

> **"I authorize CEDEXX to submit this information to Lyric Health for membership enrollment and consent to receive SMS/text messages for enrollment-related communications."**

The checkbox is **required** — the form cannot be submitted without it. The text includes a link to our Privacy Policy.

---

## 2. What Messages Users Receive

CEDEXX only sends **transactional/service messages** related to membership:

| Message Type | Example | Frequency |
|-------------|---------|-----------|
| Enrollment confirmation | "Welcome to CEDEXX! Your CareNow™ plan is active. Login: https://cedexx.net/login" | Once per enrollment |
| Plan information | "CEDEXX Enrollment: https://cedexx.net/enroll | Plans from $18.99/mo | Questions? Reply here." | Only when requested |
| Billing reminder | "Your CEDEXX subscription renews in 3 days. Manage: https://cedexx.net/account" | As needed |
| Appointment notification | "Your virtual visit is confirmed for tomorrow at 2 PM. Join: [link]" | Per appointment |

**We do NOT send:**
- Marketing or promotional texts (unless user separately opts in)
- Third-party advertisements
- Messages to users who have not explicitly consented

---

## 3. Privacy Policy & Terms of Service

- **Privacy Policy:** https://cedexx.net/privacy  
  - Section 13: "SMS/Text Messaging Consent" explicitly documents our opt-in process, message types, and opt-out instructions
- **Terms of Service:** https://cedexx.net/terms  
  - Section 16: "Analytics, Member Tracking & Consent" covers data collection and consent requirements

Both documents are linked from every page of our website and referenced in the enrollment form.

---

## 4. How Users Opt Out

Users can stop receiving SMS at any time:

- **Reply STOP** to any text message → immediate unsubscribe + confirmation text
- **Reply HELP** to any text message → support instructions
- **Contact support:** support@cedexx.net or call (855) 503-3371
- **Online:** Users can manage communication preferences in their CEDEXX account dashboard

Once opted out, the user's phone number is flagged in our system and no further SMS will be sent.

---

## 5. Message Sample (Enrollment Link)

Below is a representative example of the only SMS sent after verbal opt-in:

> **From:** +1 (855) 503-3371  
> **To:** [User's phone number]  
> **Body:** CEDEXX Enrollment: https://cedexx.net/enroll | Plans: CareNow™ $18.99/mo | CareComplete™ $34.99/mo | No insurance needed!  

This message includes:
- Clear sender identification (CEDEXX)
- Relevant link to enrollment
- Pricing transparency
- Opt-out implicit (users know they can reply STOP)

---

## 6. Contact Information

| Channel | Details |
|---------|---------|
| **Business Name** | CEDEXX, Inc. |
| **Website** | https://cedexx.net |
| **Support Email** | support@cedexx.net |
| **Phone** | (855) 503-3371 |
| **Privacy Officer** | Daisy@Cedexx.net |
| **Physical Address** | Miami, FL (virtual-first platform) |

---

## 7. Supporting Evidence

### A. Call Log System
All calls to (855) 503-3371 are logged with:
- Caller phone number (masked in storage for privacy)
- Call timestamp
- Call duration
- Intent classification (enrollment, support, general)
- Recording URL (if voicemail left)
- Transcription (if voicemail)

**API Endpoint:** `GET https://cedexx.net/api/dashboard/calls` (password-protected admin access)

### B. Enrollment Form Consent
The enrollment form at https://cedexx.net/enroll requires:
1. Checkbox: Explicit consent for SMS + enrollment
2. Link to Privacy Policy (opens in new tab)
3. Form validation: Cannot submit without checking the box

### C. Privacy Policy — SMS Section
Direct link to SMS consent documentation:  
https://cedexx.net/privacy (Section 13: SMS/Text Messaging Consent)

---

## 8. Compliance Statement

CEDEXX complies with:
- **TCPA** (Telephone Consumer Protection Act)
- **CTIA Messaging Principles and Best Practices**
- **Twilio Messaging Policy**
- **CAN-SPAM Act** (for email; SMS follows TCPA)

We maintain records of all consent for a minimum of 4 years and can provide call logs upon request for compliance audits.

---

**Prepared by:** CEDEXX Technical Team  
**Contact:** support@cedexx.net  
**Date:** September 3, 2026
