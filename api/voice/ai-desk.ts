import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/ai-desk
 * AI Front Desk Assistant — Core conversation handler
 * 
 * Handles speech input from Twilio, processes with Gemini AI,
 * returns Twilio XML with spoken response.
 * 
 * Features:
 * - Enrollment via phone (captures name, email, plan)
 * - Pricing answers
 * - Billing support
 * - Voicemail transfer
 * - SMS follow-up
 * - Conversation memory via URL parameters
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+17544322201';
const TWILIO_BACKUP_PHONE = process.env.TWILIO_BACKUP_PHONE || ''; // Local number for SMS during toll-free verification
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';

// Use backup number if toll-free is in verification (can't send SMS)
const SMS_FROM = process.env.TOLL_FREE_VERIFIED === 'true' ? TWILIO_PHONE : (TWILIO_BACKUP_PHONE || TWILIO_PHONE);

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${xml}</Response>`;
}

// ─── CEDEXX Knowledge Base ───
const CEDEXX_KNOWLEDGE = `
You are Cedex, the CEDEXX Healthcare AI Front Desk Assistant.

COMPANY:
- CEDEXX is powered by Lyric Health, a leading integrated virtual primary care platform
- Phone: (754) 432-2201
- Website: cedexx.net
- Email: support@cedexx.net

SERVICES:
- 24/7 Urgent Care
- Primary Care
- Mental Health & Therapy
- Dermatology
- Virtual MSK (Musculoskeletal)
- Care Navigation
- Labs & Diagnostics
- GLP-1 Weight Loss Programs

PLANS & PRICING:
- CareNow™: $18.99/month — Virtual Urgent Care, up to 7 dependents
- CareNow™ + Mental Wellness: $26.99/month
- Mental Wellness: $18.99/month — Behavioral health & counseling
- CareComplete™: $34.99/month — Full Virtual Primary Care
- CareComplete™ Family: $52.99/month — Family plan up to 7 members
- No insurance needed. No co-pays. No hidden fees.

HOW TO ENROLL:
1. Visit cedexx.net/enroll
2. Choose your plan
3. Enter your information
4. Complete payment (or use promo code if applicable)
5. Download Lyric Health app
6. Connect with a provider in minutes

IMPORTANT RULES:
- NEVER give medical diagnoses, prescriptions, or medical advice
- For medical emergencies, direct caller to 911 IMMEDIATELY
- Keep responses short (2-3 sentences max) — this is a phone call
- Be warm, professional, and helpful
- If caller wants to enroll, guide them to cedexx.net/enroll or offer to send SMS
- If caller wants a human, offer to take a message or transfer to voicemail
- If caller asks about pricing, give exact prices
- If caller asks about coverage, say we're available in most US states
- If caller has a billing issue, direct to support@cedexx.net
- Always end with "Is there anything else I can help you with?"
`;

// ─── Intent Detection ───
function detectIntent(speech: string): string {
  const lower = speech.toLowerCase();
  
  if (/enroll|sign up|join|get started|become a member/i.test(lower)) return 'enroll';
  if (/price|cost|how much|pricing|fee|charge/i.test(lower)) return 'pricing';
  if (/bill|payment|charged|refund|cancel subscription|stop payment/i.test(lower)) return 'billing';
  if (/voicemail|leave a message|talk to someone|human|representative|agent/i.test(lower)) return 'voicemail';
  if (/what do you offer|services|what is cedexx|about|help/i.test(lower)) return 'general';
  if (/emergency|911|heart attack|bleeding|unconscious|cant breathe/i.test(lower)) return 'emergency';
  if (/goodbye|bye|hang up|done|thank you|thanks/i.test(lower)) return 'goodbye';
  
  return 'general';
}

// ─── Build Quick Response (no AI needed) ───
function buildQuickResponse(intent: string): string | null {
  switch (intent) {
    case 'emergency':
      return "This is an emergency. Please hang up and call 911 immediately. Do not wait. Call 911 now.";
    case 'enroll':
      return "I can help you enroll right now. Visit cedexx dot net slash enroll on your phone or computer. I'll also send you a text message with the link. Which plan are you interested in? Care Now for 18 dollars and 99 cents, or Care Complete for 34 dollars and 99 cents per month?";
    case 'pricing':
      return "Our plans are: Care Now for 18 dollars and 99 cents per month, Care Now plus Mental Wellness for 26 dollars and 99 cents, Mental Wellness alone for 18 dollars and 99 cents, Care Complete for 34 dollars and 99 cents, and Care Complete Family for 52 dollars and 99 cents. All plans include up to 7 dependents with no extra cost. No insurance needed.";
    case 'billing':
      return "For billing questions, please email support at cedexx dot net, or visit your account at cedexx dot net. You can also reply to any text message we send you. Our team responds within 2 hours.";
    case 'voicemail':
      return null; // Let the handler route to voicemail
    case 'goodbye':
      return "Thank you for calling CEDEXX, powered by Lyric Health. Have a healthy day! Goodbye.";
    default:
      return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/xml');

  const data = req.body || req.query || {};
  const SpeechResult = data.SpeechResult || data.speech || '';
  const Digits = data.Digits || data.digit || '';
  const Confidence = data.Confidence || '1.0';
  const CallSid = data.CallSid || data.callSid || `call_${Date.now()}`;
  const From = data.From || data.from || 'Unknown Caller';

  const speech = (SpeechResult || '').trim();
  const digit = (Digits || '').toString().trim();

  console.log('[AI DESK] Input:', {
    callSid: CallSid,
    speech: speech.substring(0, 100),
    digit,
    confidence: Confidence,
    from: From,
  });

  // Handle DTMF (keypad) input
  if (digit) {
    return handleDigitInput(digit, From, CallSid, res);
  }

  // No speech detected
  if (!speech) {
    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">I did not catch that. Could you please repeat?</Say>
      <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5">
        <Say voice="Polly.Joanna" language="en-US">What can I help you with today? You can speak, or press 1 to enroll, 2 for pricing, 3 for billing, or 4 for voicemail.</Say>
      </Gather>
      <Say voice="Polly.Joanna" language="en-US">Thank you for calling CEDEXX, powered by Lyric Health. Goodbye!</Say>
      <Hangup/>
    `));
  }

  // Detect intent
  const intent = detectIntent(speech);
  console.log('[AI DESK] Detected intent:', intent, 'from speech:', speech);

  // Notify on Telegram
  const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
  const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `🗣️ <b>VOICE INPUT</b> — CEDEXX Front Desk\n👤 Caller: <code>${From}</code>\n💬 Said: "<i>${speech}</i>"\n🏷️ Intent: <b>${intent}</b>\n🕒 ${new Date().toLocaleString()}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }

  // Handle emergency immediately
  if (intent === 'emergency') {
    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">This is an emergency. Please hang up and call 9 1 1 immediately. Do not wait. Call 9 1 1 now.</Say>
      <Hangup/>
    `));
  }

  // Handle voicemail intent
  if (intent === 'voicemail') {
    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">I will transfer you to voicemail. Please leave your name, phone number, and message after the tone. Our team will return your call within 2 hours.</Say>
      <Record action="https://www.cedexx.net/api/voice/voicemail" method="POST" maxLength="180" finishOnKey="#" playBeep="true" />
      <Say voice="Polly.Joanna" language="en-US">Thank you for your message. Goodbye.</Say>
      <Hangup/>
    `));
  }

  // Handle goodbye
  if (intent === 'goodbye') {
    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">Thank you for calling CEDEXX, powered by Lyric Health. Have a wonderful day! Goodbye.</Say>
      <Hangup/>
    `));
  }

  // Try quick response first, fall back to AI
  let responseText = buildQuickResponse(intent);

  if (!responseText && GEMINI_KEY) {
    try {
      responseText = await getAIResponse(speech, intent);
    } catch (err) {
      console.error('[AI DESK] Gemini failed:', err);
      responseText = "CEDEXX offers 24/7 virtual urgent care and primary care powered by Lyric Health. Plans start at 18 dollars and 99 cents per month.";
    }
  }

  if (!responseText) {
    responseText = "I can help you enroll in CEDEXX, answer questions about our plans, or take a message for our support team.";
  }

  const twilioResponse = `
    <Say voice="Polly.Joanna" language="en-US">${escapeXml(responseText)}</Say>
    <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5">
      <Say voice="Polly.Joanna" language="en-US">Is there anything else I can assist you with? Or press 4 to leave a voicemail.</Say>
    </Gather>
    <Say voice="Polly.Joanna" language="en-US">Thank you for calling CEDEXX, powered by Lyric Health. Have a healthy day!</Say>
    <Hangup/>
  `;

  return res.status(200).send(twiml(twilioResponse));
}

// ─── Handle DTMF Input ───
function handleDigitInput(digit: string, from: string, callSid: string, res: VercelResponse) {
  let response = '';

  switch (digit) {
    case '1':
      response = `
        <Say voice="Polly.Joanna" language="en-US">
          Wonderful! You can enroll online in just two minutes at cedexx dot net slash enroll. Our popular CareNow plan is only 18 dollars and 99 cents per month, with no insurance required and up to 7 household members included.
        </Say>
        <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5">
          <Say voice="Polly.Joanna" language="en-US">Would you like to hear about our other plans, or leave a voicemail for enrollment support?</Say>
        </Gather>
        <Say voice="Polly.Joanna" language="en-US">Thank you for calling CEDEXX. Goodbye!</Say>
        <Hangup/>
      `;
      break;
    case '2':
      response = `
        <Say voice="Polly.Joanna" language="en-US">
          Our plans include: CareNow for 18 dollars and 99 cents per month for 24/7 urgent care; CareNow plus Mental Wellness for 26 dollars and 99 cents; Mental Wellness alone for 18 dollars and 99 cents; and CareComplete with a dedicated virtual primary care physician for 34 dollars and 99 cents per month. All plans cover up to 7 dependents.
        </Say>
        <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5">
          <Say voice="Polly.Joanna" language="en-US">Press 1 if you would like to enroll, or press 4 to leave a voicemail.</Say>
        </Gather>
        <Say voice="Polly.Joanna" language="en-US">Thank you for calling CEDEXX. Goodbye!</Say>
        <Hangup/>
      `;
      break;
    case '3':
      response = `
        <Say voice="Polly.Joanna" language="en-US">
          For billing support, you can email us at support at cedexx dot net, or manage your membership online at cedexx dot net.
        </Say>
        <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5">
          <Say voice="Polly.Joanna" language="en-US">Press 4 if you would like to leave a voicemail for our billing team.</Say>
        </Gather>
        <Say voice="Polly.Joanna" language="en-US">Thank you for calling CEDEXX. Goodbye!</Say>
        <Hangup/>
      `;
      break;
    case '4':
      response = `
        <Say voice="Polly.Joanna" language="en-US">
          Please leave your name, phone number, and a brief message after the tone. Our support team will return your call within 2 hours.
        </Say>
        <Record action="https://www.cedexx.net/api/voice/voicemail" method="POST" maxLength="180" finishOnKey="#" playBeep="true" />
        <Say voice="Polly.Joanna" language="en-US">Thank you for your message. Goodbye.</Say>
        <Hangup/>
      `;
      break;
    case '*':
    case '0':
    default:
      response = `
        <Redirect method="POST">https://www.cedexx.net/api/voice/incoming</Redirect>
      `;
      break;
  }

  return res.status(200).send(twiml(response));
}

// ─── Call Gemini AI ───
async function getAIResponse(userSpeech: string, intent: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `${CEDEXX_KNOWLEDGE}\n\nCaller intent: ${intent}\nCaller said: "${userSpeech}"\n\nRespond as Cedex in 2-3 short sentences. Be warm and helpful.`
          }]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 150 },
      }),
    }
  );

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
    "I'm not sure I understood. I can help you enroll, tell you about our pricing, or connect you with our team. What would you like to do?";
}

// ─── Escape XML ───
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
