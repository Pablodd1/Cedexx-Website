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
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+18555033371';
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
- Phone: (855) 503-3371
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
  if (req.method !== 'POST') return res.status(405).end();

  const { SpeechResult, Digits, Confidence, CallSid, From } = req.body;
  const speech = SpeechResult || '';
  const digit = Digits || '';

  console.log('[AI DESK] Input:', {
    callSid: CallSid,
    speech: speech.substring(0, 100),
    digit,
    confidence: Confidence,
    from: From,
  });

  // Handle DTMF (keypad) input
  if (digit) {
    return handleDigitInput(digit, From, res);
  }

  // No speech detected
  if (!speech) {
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml(`
      <Say voice="Polly.Joanna">I didn't catch that. Could you please repeat?</Say>
      <Gather input="speech dtmf" action="/api/voice/ai-desk" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1">
        <Say voice="Polly.Joanna">What can I help you with today?</Say>
      </Gather>
      <Say voice="Polly.Joanna">Let me send you a text with our information. Goodbye!</Say>
      <Sms from="${SMS_FROM}" to="${From}">CEDEXX — Enroll: https://cedexx.net/enroll | Support: support@cedexx.net | Call: (855) 503-3371</Sms>
      <Hangup/>
    `));
    return;
  }

  // Detect intent
  const intent = detectIntent(speech);
  console.log('[AI DESK] Detected intent:', intent);

  // Handle emergency immediately
  if (intent === 'emergency') {
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml(`
      <Say voice="Polly.Joanna">This is an emergency. Please hang up and call 9 1 1 immediately. Do not wait. Call 9 1 1 now.</Say>
      <Hangup/>
    `));
    return;
  }

  // Handle voicemail intent
  if (intent === 'voicemail') {
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml(`
      <Say voice="Polly.Joanna">I'll transfer you to voicemail. Please leave your name, phone number, and how we can help after the tone. Our team will respond within 2 hours.</Say>
      <Record action="/api/voice/voicemail" maxLength="300" transcribe="true" transcribeCallback="/api/voice/voicemail" finishOnKey="#" playBeep="true" />
      <Say voice="Polly.Joanna">We didn't receive a message. Please call back or text us. Goodbye.</Say>
      <Hangup/>
    `));
    return;
  }

  // Handle goodbye
  if (intent === 'goodbye') {
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml(`
      <Say voice="Polly.Joanna">Thank you for calling CEDEXX, powered by Lyric Health. Have a healthy day! Goodbye.</Say>
      <Hangup/>
    `));
    return;
  }

  // Try quick response first, fall back to AI
  let responseText = buildQuickResponse(intent);

  if (!responseText && GEMINI_KEY) {
    try {
      responseText = await getAIResponse(speech, intent);
    } catch (err) {
      console.error('[AI DESK] Gemini failed:', err);
      responseText = "I'm sorry, I'm having trouble right now. Please visit cedexx dot net or call back later.";
    }
  }

  if (!responseText) {
    responseText = "I can help you enroll, answer questions about pricing, or connect you with our team. What would you like to do?";
  }

  // Build Twilio response with follow-up gather
  const isEnrollIntent = intent === 'enroll';
  
  const twilioResponse = `
    <Say voice="Polly.Joanna">${escapeXml(responseText)}</Say>
    ${isEnrollIntent ? `<Sms from="${SMS_FROM}" to="${From}">CEDEXX Enrollment: https://cedexx.net/enroll | Plans from $18.99/mo | Questions? Reply here.</Sms>` : ''}
    <Gather input="speech dtmf" action="/api/voice/ai-desk" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1">
      <Say voice="Polly.Joanna">Is there anything else I can help you with? Or press 4 to leave a voicemail.</Say>
    </Gather>
    <Say voice="Polly.Joanna">Thank you for calling CEDEXX powered by Lyric Health. Have a healthy day!</Say>
    <Hangup/>
  `;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml(twilioResponse));
}

// ─── Handle DTMF Input ───
function handleDigitInput(digit: string, from: string, res: VercelResponse) {
  let response = '';

  switch (digit) {
    case '1':
      response = `
        <Say voice="Polly.Joanna">Perfect! You can enroll right now at cedexx dot net slash enroll. I'll send you a text with the link.</Say>
        <Sms from="${SMS_FROM}" to="${from}">CEDEXX Enrollment: https://cedexx.net/enroll | Plans: CareNow™ $18.99/mo | CareComplete™ $34.99/mo | No insurance needed!</Sms>
        <Gather input="speech dtmf" action="/api/voice/ai-desk" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1">
          <Say voice="Polly.Joanna">Is there anything else I can help you with?</Say>
        </Gather>
        <Hangup/>
      `;
      break;
    case '2':
      response = `
        <Say voice="Polly.Joanna">Our plans are: Care Now for 18 dollars and 99 cents per month, Care Now plus Mental Wellness for 26 dollars and 99 cents, Mental Wellness alone for 18 dollars and 99 cents, Care Complete for 34 dollars and 99 cents, and Care Complete Family for 52 dollars and 99 cents. All plans include up to 7 dependents.</Say>
        <Gather input="speech dtmf" action="/api/voice/ai-desk" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1">
          <Say voice="Polly.Joanna">Would you like to enroll? Just say yes, or press 1.</Say>
        </Gather>
        <Hangup/>
      `;
      break;
    case '3':
      response = `
        <Say voice="Polly.Joanna">For billing questions, please email support at cedexx dot net, or visit your account at cedexx dot net. I'll send you our support email via text.</Say>
        <Sms from="${SMS_FROM}" to="${from}">CEDEXX Billing Support: support@cedexx.net | Account: https://cedexx.net | Reply here for help.</Sms>
        <Gather input="speech dtmf" action="/api/voice/ai-desk" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1">
          <Say voice="Polly.Joanna">Is there anything else I can help you with?</Say>
        </Gather>
        <Hangup/>
      `;
      break;
    case '4':
      response = `
        <Say voice="Polly.Joanna">I'll transfer you to voicemail. Please leave your name, phone number, and how we can help after the tone. Our team will respond within 2 hours.</Say>
        <Record action="/api/voice/voicemail" maxLength="300" transcribe="true" transcribeCallback="/api/voice/voicemail" finishOnKey="#" playBeep="true" />
        <Say voice="Polly.Joanna">We didn't receive a message. Please call back or text us. Goodbye.</Say>
        <Hangup/>
      `;
      break;
    case '*':
    case '0':
    default:
      response = `
        <Redirect>/api/voice/incoming</Redirect>
      `;
      break;
  }

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml(response));
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
