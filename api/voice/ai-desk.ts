import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/ai-desk
 * AI Front Desk Receptionist — Core Conversation & Routing Handler
 * 
 * Features:
 * 1. Warm, conversational front desk assistant (Cedex)
 * 2. Strict grounding in CEDEXX & Lyric Health website knowledge
 * 3. Autonomous front desk buffer so staff doesn't take routine calls
 * 4. Transfer ("trumpet") to Daisy (+1 954-624-6744) on explicit request or '0'/'9'
 * 5. Instant fallback to voicemail if Daisy is away
 * 6. Live Telegram alerts for visibility
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+17544322201';
const DAISY_PHONE = process.env.DAISY_PHONE || '+19546246744';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${xml}\n</Response>`;
}

// ─── CEDEXX Knowledge Base ───
const CEDEXX_KNOWLEDGE = `
You are Cedex, the warm, friendly, and professional virtual front desk receptionist for CEDEXX Healthcare, powered by Lyric Health.
You are on a live phone call with a patient or prospective member.

CRITICAL ROLE & RULES:
1. Act as a helpful front desk buffer: answer caller questions quickly, accurately, and naturally based ONLY on the website information below.
2. If the caller asks to speak to Daisy, a person, a human, an agent, or a representative, politely tell them you will connect them with Daisy immediately.
3. Keep answers concise: 2 to 3 spoken sentences maximum. This is a voice phone conversation.
4. Speak warmly, naturally, and conversationally. Avoid robotic menu lists or technical jargon.
5. NEVER provide medical advice, diagnosis, or write prescriptions. For medical emergencies, advise dialing 911 immediately.
6. Always conclude with a natural, friendly follow-up, such as "Would you like to enroll online at cedexx dot net slash enroll, or can I connect you with Daisy?"

CEDEXX FACTS:
- Partnership: CEDEXX is powered by Lyric Health, delivering 24/7 integrated virtual primary care, urgent care, and mental health therapy.
- Contact: Front desk phone is (754) 432-2201. Daisy Gonzalez is Founder / Office Lead at (954) 624-6744, email Daisy@Cedexx.net. Support email is support@cedexx.net. Website is cedexx.net.
- Plans & Pricing:
  * CareNow™: $18.99/mo (24/7 virtual urgent care, up to 7 household members included, no co-pays)
  * CareNow™ + Mental Wellness: $26.99/mo (Urgent care + therapy & behavioral health)
  * Mental Wellness: $18.99/mo (Therapy, counseling, mental health sessions)
  * CareComplete™: $34.99/mo (Full virtual primary care physician + urgent care)
  * CareComplete™ Family: $52.99/mo (Primary care for large families, up to 7 members)
- Key Benefits: No insurance needed, no co-pays, no deductibles, no waiting periods. Family coverage covers up to 7 household members at no extra cost.
- Prescriptions: Lyric doctors can send prescriptions directly to any local pharmacy.
- How to enroll: Visit cedexx.net/enroll, pick a plan, and get instant access in under 2 minutes.
`;

// ─── Intent Detection ───
function detectIntent(speech: string, digit: string): string {
  if (digit === '0' || digit === '9' || digit === '3') return 'transfer_daisy';
  if (digit === '1') return 'enroll';
  if (digit === '2') return 'pricing';
  if (digit === '4') return 'voicemail';

  const lower = speech.toLowerCase().trim();

  // Emergency
  if (/emergency|911|heart attack|chest pain|stroke|severe bleeding|unconscious|cant breathe|cannot breathe/i.test(lower)) {
    return 'emergency';
  }

  // Transfer to Daisy or human
  if (/daisy|transfer|speak to (a )?(human|person|agent|representative|someone|daisy)|talk to (a )?(human|person|agent|representative|someone|daisy)|connect me|operator|real person|front desk|office/i.test(lower)) {
    return 'transfer_daisy';
  }

  // Goodbye / Done
  if (/^(no|nope|that's all|thats all|that is all|nothing else|no thank you|no thanks|goodbye|bye|bye bye|have a good day|all set|done)$/i.test(lower) ||
      /^(thank you|thanks|thank you so much)$/i.test(lower)) {
    return 'goodbye';
  }

  // Voicemail
  if (/voicemail|leave a message|leave message|record a message/i.test(lower)) {
    return 'voicemail';
  }

  // Pricing
  if (/price|cost|how much|pricing|fee|charge|rate|monthly|afford/i.test(lower)) {
    return 'pricing';
  }

  // Insurance / Coverage
  if (/insurance|copay|co-pay|deductible|family|dependents|coverage|who is covered/i.test(lower)) {
    return 'insurance_coverage';
  }

  // How it works / Lyric Health / Doctors
  if (/how does it work|lyric|doctor|appointment|telehealth|telemedicine|prescription|pharmacy|urgent care/i.test(lower)) {
    return 'how_it_works';
  }

  // Enroll
  if (/enroll|sign up|join|register|get started|become a member/i.test(lower)) {
    return 'enroll';
  }

  // Billing
  if (/bill|payment|card|charged|receipt|cancel subscription/i.test(lower)) {
    return 'billing';
  }

  return 'ai_fallback';
}

// ─── Quick Natural Spoken Responses ───
function getQuickResponse(intent: string): string | null {
  switch (intent) {
    case 'pricing':
      return "Our plans are very affordable. CareNow is 18 dollars and 99 cents a month for 24/7 virtual urgent care. CareNow plus Mental Wellness is 26 dollars and 99 cents. And CareComplete, with your own dedicated primary care doctor, is 34 dollars and 99 cents a month. All plans cover up to 7 family members with zero insurance needed.";
    
    case 'insurance_coverage':
      return "You do not need health insurance at all! There are no co-pays, no deductibles, and no surprise charges. Best of all, our plans cover up to 7 household members under one subscription at no extra cost.";
    
    case 'how_it_works':
      return "CEDEXX is powered by Lyric Health to connect you directly with licensed doctors and therapists 24/7 from your phone. You can have a virtual visit in minutes, and any necessary prescriptions are sent straight to your local pharmacy.";

    case 'enroll':
      return "Enrolling is quick and simple! You can sign up online in under two minutes at cedexx dot net slash enroll. Your membership activates right away with no waiting period.";

    case 'billing':
      return "You can manage your account and billing anytime at cedexx dot net, or email us at support at cedexx dot net. I can also connect you with Daisy if you need direct billing assistance.";

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

  console.log('[AI DESK] Incoming turn:', {
    callSid: CallSid,
    from: From,
    speech: speech.substring(0, 100),
    digit,
    confidence: Confidence,
  });

  // No speech and no keypad digit
  if (!speech && !digit) {
    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">
        I didn't quite catch that. How can I help you today?
      </Say>
      <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5">
        <Say voice="Polly.Joanna" language="en-US">
          You can ask about our pricing, how our Lyric doctors work, or ask to speak with Daisy.
        </Say>
      </Gather>
      <Say voice="Polly.Joanna" language="en-US">
        Thank you for calling CEDEXX, powered by Lyric Health. Have a wonderful day!
      </Say>
      <Hangup/>
    `));
  }

  // Detect intent
  const intent = detectIntent(speech, digit);
  console.log('[AI DESK] Detected intent:', intent, 'speech:', speech, 'digit:', digit);

  // Send Telegram event notification
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `🗣️ <b>FRONT DESK INTERACTION</b>\n👤 Caller: <code>${From}</code>\n💬 Said: "<i>${speech || 'Keypad: ' + digit}</i>"\n🏷️ Intent: <b>${intent}</b>\n🕒 ${new Date().toLocaleString()}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }

  // 1. EMERGENCY
  if (intent === 'emergency') {
    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">
        If you are experiencing a medical emergency, please hang up and call 9 1 1 immediately. Do not wait. Please dial 9 1 1 now.
      </Say>
      <Hangup/>
    `));
  }

  // 2. TRANSFER TO DAISY
  if (intent === 'transfer_daisy') {
    console.log('[AI DESK] Transferring caller to Daisy at', DAISY_PHONE);
    
    if (TELEGRAM_BOT && TELEGRAM_CHAT) {
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT,
          text: `📲 <b>TRANSFERRING CALL TO DAISY</b>\n👤 Caller: <code>${From}</code>\n📞 Dialing: <code>${DAISY_PHONE}</code>\n🕒 ${new Date().toLocaleString()}`,
          parse_mode: 'HTML',
        }),
      }).catch(() => {});
    }

    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">
        Certainly! Let me transfer you directly to Daisy. Please hold for just a moment while I connect your call.
      </Say>
      <Dial action="https://www.cedexx.net/api/voice/dial-status" timeout="20" callerId="${TWILIO_PHONE}">
        ${DAISY_PHONE}
      </Dial>
    `));
  }

  // 3. DIRECT VOICEMAIL
  if (intent === 'voicemail') {
    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">
        Certainly. Please leave your name, phone number, and a brief message after the beep, and Daisy or our front desk team will call you right back!
      </Say>
      <Record action="https://www.cedexx.net/api/voice/voicemail" method="POST" maxLength="180" finishOnKey="#" playBeep="true" />
      <Say voice="Polly.Joanna" language="en-US">
        Thank you for your message. We have forwarded it to Daisy. Have a wonderful day!
      </Say>
      <Hangup/>
    `));
  }

  // 4. GOODBYE
  if (intent === 'goodbye') {
    return res.status(200).send(twiml(`
      <Say voice="Polly.Joanna" language="en-US">
        You're very welcome! Thank you for calling CEDEXX, powered by Lyric Health. Have a wonderful and healthy day! Goodbye.
      </Say>
      <Hangup/>
    `));
  }

  // 5. QUICK RESPONSE OR AI-GENERATED CONVERSATIONAL RESPONSE
  let spokenText = getQuickResponse(intent);

  if (!spokenText && GEMINI_KEY) {
    try {
      spokenText = await getAIResponse(speech);
    } catch (err) {
      console.error('[AI DESK] Gemini error:', err);
    }
  }

  if (!spokenText) {
    spokenText = "CEDEXX offers 24/7 virtual urgent care and primary care powered by Lyric Health, starting at 18 dollars and 99 cents a month with no insurance needed.";
  }

  // Smooth conversational response + gather next question
  const followUpResponse = `
    <Say voice="Polly.Joanna" language="en-US">
      ${escapeXml(spokenText)}
    </Say>
    <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5">
      <Say voice="Polly.Joanna" language="en-US">
        Can I help you with anything else today, or would you like me to connect you with Daisy?
      </Say>
    </Gather>
    <Say voice="Polly.Joanna" language="en-US">
      Thank you for calling CEDEXX, powered by Lyric Health. Have a wonderful day!
    </Say>
    <Hangup/>
  `;

  return res.status(200).send(twiml(followUpResponse));
}

// ─── Call Gemini AI ───
async function getAIResponse(userSpeech: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `${CEDEXX_KNOWLEDGE}\n\nCaller said: "${userSpeech}"\n\nRespond as Cedex, the front desk receptionist. Keep it to 2-3 friendly, spoken sentences. Offer to help enroll or connect with Daisy if relevant.`
          }]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 120 },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (text) return text;
  
  return "I'd be happy to help with that. You can enroll online at cedexx dot net slash enroll, or I can connect you directly with Daisy.";
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
