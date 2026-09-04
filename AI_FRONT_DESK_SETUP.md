# CEDEXX AI Front Desk Assistant — Setup Guide

## Phone Number
**📞 (754) 432-2201**

---

## What It Does

The AI Front Desk Assistant handles incoming calls to CEDEXX with:

1. **Professional greeting** — "Thank you for calling CEDEXX, powered by Lyric Health"
2. **AI-powered conversations** — Answers questions about plans, pricing, enrollment
3. **Speech recognition** — Uses Twilio's native speech-to-text (no WebSocket needed)
4. **SMS follow-up** — Sends enrollment links via text automatically
5. **Voicemail** — Records messages and emails them to admin with transcription
6. **Emergency detection** — Immediately routes emergency calls to 911
7. **Call logging** — All calls logged to GitHub DB for tracking

---

## Call Flow

```
Caller dials (754) 432-2201
  │
  ▼
AI: "Thank you for calling CEDEXX... I'm Cedex, your AI assistant."
  │
  ▼
AI: "What can I help you with? Press 1 to enroll, 2 for pricing, 3 for billing, 4 for voicemail. Or just speak."
  │
  ├──→ "I want to enroll" / Press 1
  │      AI: "Visit cedexx.net/enroll. I'll send you a text."
  │      SMS sent with enrollment link
  │
  ├──→ "How much does it cost" / Press 2
  │      AI: "CareNow is $18.99/mo, CareComplete is $34.99/mo..."
  │
  ├──→ "Billing question" / Press 3
  │      AI: "Email support@cedexx.net. I'll send you the address via text."
  │      SMS sent with support info
  │
  ├──→ "Leave a message" / Press 4
  │      AI: "Please leave a message after the tone."
  │      → Recording saved
  │      → Email sent to admin + Jasmel with transcription
  │      → Telegram alert sent
  │
  └──→ "Goodbye" / No response
         AI: "Thank you for calling CEDEXX. Have a healthy day!"
         SMS sent with enrollment link (if no response)
```

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/voice/incoming` | Main Twilio webhook — greeting + first prompt |
| `POST /api/voice/ai-desk` | AI conversation handler — speech processing |
| `POST /api/voice/voicemail` | Voicemail recording + transcription |
| `POST /api/voice/call-log` | Call data logging to GitHub DB |

---

## Twilio Configuration

### 1. Buy a Phone Number
- Go to Twilio Console → Phone Numbers → Buy a Number
- Choose a US toll-free or local number
- **Active Line: (754) 432-2201**

### 2. Configure Webhook URL
In Twilio Console → Phone Numbers → Manage → Active Numbers → [Your Number]:

**Voice & Fax → A Call Comes In:**
```
Webhook: https://cedexx.net/api/voice/incoming
HTTP Method: POST
```

### 3. Enable Voice Features
- **Accept Incoming:** Voice Calls
- **Configure With:** Webhooks, TwiML Bins, Functions, Studio, or Flex
- **A Call Comes In:** Webhook → `https://cedexx.net/api/voice/incoming`

### 4. Enable Recording (for voicemail)
- **Recording:** Enable if needed
- **Status Callback:** `https://cedexx.net/api/voice/voicemail`

---

## Environment Variables

Add these to Vercel:

| Variable | Value | Required |
|----------|-------|----------|
| `TWILIO_ACCOUNT_SID` | `AC...` from Twilio Console | ✅ Yes |
| `TWILIO_AUTH_TOKEN` | `...` from Twilio Console | ✅ Yes |
| `TWILIO_PHONE_NUMBER` | `+17544322201` | ✅ Yes |
| `GEMINI_API_KEY` | Your Gemini API key | ✅ Yes |
| `RESEND_API_KEY` | Your Resend API key | ✅ Yes |
| `GITHUB_TOKEN` | GitHub token for DB | ✅ Yes |
| `ADMIN_EMAIL` | support@cedexx.net | ✅ Yes |
| `JASMEL_EMAIL` | jasmelacosta@gmail.com | ✅ Yes |
| `DEEPGRAM_API_KEY` | `...` from Deepgram Console | ❌ Optional |
| `TELEGRAM_BOT_TOKEN` | Your bot token | ❌ Optional |
| `TELEGRAM_CHAT_ID` | Your chat ID | ❌ Optional |

---

## Testing

### Test 1: Simulate Incoming Call
```bash
curl -X POST https://cedexx.net/api/voice/incoming \
  -d "From=+15551234567" \
  -d "To=+17544322201" \
  -d "CallSid=test123" \
  -d "Direction=inbound"
```

### Test 2: Simulate Speech Input
```bash
curl -X POST https://cedexx.net/api/voice/ai-desk \
  -d "From=+15551234567" \
  -d "CallSid=test123" \
  -d "SpeechResult=I want to enroll" \
  -d "Confidence=0.95"
```

### Test 3: Simulate Voicemail
```bash
curl -X POST https://cedexx.net/api/voice/voicemail \
  -d "From=+15551234567" \
  -d "CallSid=test123" \
  -d "RecordingUrl=https://api.twilio.com/recording.mp3" \
  -d "RecordingDuration=30" \
  -d "TranscriptionText=Hi this is John, I have a billing question"
```

### Test 4: Simulate Emergency
```bash
curl -X POST https://cedexx.net/api/voice/ai-desk \
  -d "From=+15551234567" \
  -d "CallSid=test123" \
  -d "SpeechResult=I can't breathe help me"
```

---

## Features

### ✅ What's Working
- Professional greeting with CEDEXX branding
- AI-powered speech recognition and response
- Intent detection (enroll, pricing, billing, voicemail, emergency)
- **Deepgram AI transcription** for high-accuracy voicemail transcription
- Emergency detection → immediate 911 redirect
- SMS follow-up with enrollment links
- Voicemail recording with email + Telegram notifications
- Call logging to GitHub DB
- Admin email notifications for voicemails
- DTMF keypad support (press 1, 2, 3, 4)

### 🎯 Key Behaviors
- **Enrollment intent:** Sends SMS with enrollment link + asks about plan
- **Pricing intent:** Gives exact prices for all plans
- **Billing intent:** Provides support email + sends SMS
- **Voicemail intent:** Records message, emails admin with transcription
- **Emergency intent:** Immediately says "Call 911" and hangs up
- **No response:** Sends SMS with enrollment link before hanging up

---

## Files

| File | Purpose |
|------|---------|
| `api/voice/incoming.ts` | Main webhook — greeting + first prompt |
| `api/voice/ai-desk.ts` | AI conversation handler |
| `api/voice/voicemail.ts` | Voicemail recording + notifications |
| `api/voice/call-log.ts` | Call data logging |
| `data/calls.json` | Call log storage |

---

## Next Steps

1. ✅ **Deploy** — Push to GitHub, deploy to Vercel
2. ✅ **Configure Twilio** — Set webhook URL to `https://cedexx.net/api/voice/incoming`
3. ✅ **Test** — Call (754) 432-2201 and test all flows
4. ⏳ **Train AI** — Review call logs, improve responses
5. ⏳ **Add outbound** — Schedule follow-up calls to leads

---

## Troubleshooting

### Calls not coming through?
- Check Twilio webhook URL is correct
- Verify Vercel function is deployed
- Check Twilio error logs

### AI not responding?
- Check `GEMINI_API_KEY` is set
- Verify API endpoint is accessible
- Check Vercel function logs

### Voicemail not sending emails?
- Check `RESEND_API_KEY` is valid
- Verify `ADMIN_EMAIL` and `JASMEL_EMAIL` are set
- Check Resend dashboard for delivery status

---

**Your AI Front Desk is ready to answer calls 24/7!**
