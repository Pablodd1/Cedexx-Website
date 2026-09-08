import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/ai-desk
 * AI Front Desk Receptionist — Core Conversation & Routing Handler
 * 
 * Features:
 * 1. Warm, coherent front desk assistant (Ceedex)
 * 2. Company name pronounced "Ceedex" (See-dex)
 * 3. Strict grounding in website knowledge (pricing, telehealth, enrollment)
 * 4. Transfer to staff when requested without mentioning personal names
 * 5. Loop prevention for staff calling in from their own line
 * 6. bargeIn="false" on prompts to prevent line noise and crossed speech
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+17544322201';
const STAFF_PHONE = process.env.STAFF_PHONE || process.env.DAISY_PHONE || '';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '8834617573:AAGANwBh_xp-MIZpqukctS2OAuJ2zxJOnrU';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '7838956683';

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${xml}\n</Response>`;
}

// Speaks via Deepgram Flux Hannah (American Feminine, 1x speed, 1 expressivity)
function hannah(text: string): string {
  const url = `https://www.cedexx.net/api/voice/speak?text=${encodeURIComponent(text.trim())}`;
  return `<Play>${url}</Play>`;
}

// ─── Ceedex Knowledge Base ───
const CEDEXX_KNOWLEDGE = `
You are Hannah, the warm, friendly, and enthusiastic virtual front desk receptionist for Ceedex Healthcare, powered by Lyric Health.
You are on a live phone call with a patient or prospective member.

CRITICAL PRONUNCIATION & RULES:
1. Company Name: Always pronounce and spell as "Ceedex" (sounds like "See-dex").
2. Staff Referrals: NEVER mention individual employee names like Daisy to the caller. Always say "our staff", "a team member", or "our office team".
3. Receptionist Buffer: Answer caller questions quickly, accurately, and naturally based ONLY on the website facts below so staff only takes calls when human assistance is specifically requested.
4. Keep answers concise: 2 spoken sentences maximum. This is a voice phone conversation.
5. NEVER provide medical advice, diagnosis, or write prescriptions. For medical emergencies, advise dialing 911 immediately.
6. Follow-up: Ask "Would you like to enroll online at ceedex dot net slash enroll, or can I connect you with our staff?"

CEEDEX FACTS:
- Partnership: Ceedex is powered by Lyric Health, delivering 24/7 integrated virtual primary care, urgent care, and mental health therapy.
- Contact: Front desk line is (754) 432-2201. Support email is support@cedexx.net. Website is ceedex.net. All CEDEXX phone references are (754) 432-2201.
- Plans & Pricing:
  * CareNow™: $18.99/mo (24/7 virtual urgent care, up to 7 household members included, no co-pays)
  * CareNow™ + Mental Wellness: $26.99/mo (Urgent care + therapy & behavioral health)
  * Mental Wellness: $18.99/mo (Therapy, counseling, mental health sessions)
  * CareComplete™: $34.99/mo (Full virtual primary care physician + urgent care)
  * CareComplete™ Family: $52.99/mo (Primary care for large families, up to 7 members)
- Key Benefits: No insurance needed, no co-pays, no deductibles. Family coverage covers up to 7 household members at no extra cost.
- Prescriptions: Lyric doctors can send prescriptions directly to any local pharmacy.
- How to enroll: Visit ceedex.net/enroll to choose your plan.
- CRITICAL ACTIVATION RULE: Lyric Health communication and account activation is NOT immediate; it takes 24 to 48 hours. Lyric Health sends welcome and activation instructions from noreply@getlyric.com within 24 to 48 hours.
- Health Blogs: We publish clinical insights on pediatric AI diagnostics, healthcare economics, heat hydration, and chronic care management at ceedex.net/blog.
`;

// ─── Intent Detection ───
function detectIntent(speech: string, digit: string): string {
  if (digit === '0' || digit === '9' || digit === '3') return 'transfer_staff';
  if (digit === '1') return 'enroll';
  if (digit === '2') return 'pricing';
  if (digit === '4') return 'voicemail';

  const lower = speech.toLowerCase().trim();

  // Emergency
  if (/emergency|911|heart attack|chest pain|stroke|severe bleeding|unconscious|cant breathe|cannot breathe/i.test(lower)) {
    return 'emergency';
  }

  // Transfer to staff or human (understands 'daisy' in caller speech, but routes to staff)
  if (/daisy|staff|team|transfer|speak to (a )?(human|person|agent|representative|someone|staff)|talk to (a )?(human|person|agent|representative|someone|staff)|connect me|operator|real person|front desk|office/i.test(lower)) {
    return 'transfer_staff';
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

  // Blog / Articles
  if (/blog|article|pediatric ai|research|hydration|heat exhaustion/i.test(lower)) {
    return 'blog';
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

  // Contact phone
  if (/phone|telephone|number|call (you|cedex|ceedex|support|desk)|reach (you|cedex|ceedex)|contact (you|cedex|ceedex|number|phone)/i.test(lower)) {
    return 'contact_phone';
  }

  return 'ai_fallback';
}

// ─── Quick Natural Spoken Responses ───
function getQuickResponse(intent: string): string | null {
  switch (intent) {
    case 'pricing':
      return "Our plans are very affordable. CareNow is 18 dollars and 99 cents a month for 24/7 virtual urgent care. CareNow plus Mental Wellness is 26 dollars and 99 cents. And CareComplete, with your own dedicated primary care doctor, is 34 dollars and 99 cents a month. All plans cover up to 7 family members with zero insurance needed.";
    
    case 'insurance_coverage':
      return "You do not need health insurance at all. There are no co-pays, no deductibles, and no surprise charges. Best of all, our plans cover up to 7 household members under one subscription at no extra cost.";
    
    case 'how_it_works':
      return "Ceedex is powered by Lyric Health. You enroll online at ceedex dot net slash enroll. Please note that Lyric Health communication and account activation takes 24 to 48 hours. Once active, you can consult with licensed doctors and therapists 24/7.";

    case 'enroll':
      return "Enrolling is quick and simple online at ceedex dot net slash enroll. Please keep in mind that Lyric Health communication and account activation takes 24 to 48 hours before you can log in, so welcome communication is not immediate.";

    case 'blog':
      return "Our health blog covers pediatric AI respiratory analysis, healthcare savings that eliminate urgent care co-pays, and summer heat hydration tips. You can read all articles at ceedex dot net slash blog.";

    case 'billing':
      return "You can manage your account and billing anytime at ceedex dot net, or email us at support at cedexx dot net. I can also connect you with our staff if you need direct billing assistance.";

    case 'contact_phone':
      return "You can reach Ceedex by phone anytime at 7 5 4, 4 3 2, 2 2 0 1, or by email at support at cedexx dot net.";

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
      ${hannah("I didn't quite catch that. How can I help you today?")}
      <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5" bargeIn="false">
        ${hannah("You can ask about our pricing, how our Lyric doctors work, or ask to speak with our staff.")}
      </Gather>
      ${hannah("Thank you for calling Ceedex, powered by Lyric Health. Have a wonderful day!")}
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
      ${hannah("If you are experiencing a medical emergency, please hang up and call 9 1 1 immediately. Do not wait. Please dial 9 1 1 now.")}
      <Hangup/>
    `));
  }

  // 2. TRANSFER TO STAFF
  if (intent === 'transfer_staff') {
    if (!STAFF_PHONE || STAFF_PHONE === TWILIO_PHONE) {
      console.log('[AI DESK] No separate staff forwarding line configured. Routing to voicemail.');
      return res.status(200).send(twiml(`
        ${hannah("Our office staff is currently assisting other members. Please leave your name, phone number, and a brief message after the beep, and a team member will call you right back! You can also reach our main desk at 7 5 4, 4 3 2, 2 2 0 1.")}
        <Record action="https://www.cedexx.net/api/voice/voicemail" method="POST" maxLength="180" finishOnKey="#" playBeep="true" />
        ${hannah("Thank you for your message. We have alerted our staff. Have a wonderful day!")}
        <Hangup/>
      `));
    }

    // Loop prevention: check if caller IS the staff line calling in
    const cleanFrom = From.replace(/\D/g, '');
    const cleanStaff = STAFF_PHONE.replace(/\D/g, '');
    const isFromStaff = cleanFrom.length >= 10 && cleanStaff.length >= 10 && cleanFrom.endsWith(cleanStaff.slice(-10));

    if (isFromStaff) {
      console.log('[AI DESK] Staff line called in. Preventing self-dial loop.');
      return res.status(200).send(twiml(`
        ${hannah("You are currently calling from the office staff line. How can I assist you with Ceedex services today?")}
        <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5" bargeIn="false">
        </Gather>
        ${hannah("Thank you for calling Ceedex. Goodbye!")}
        <Hangup/>
      `));
    }

    console.log('[AI DESK] Transferring caller to staff at', STAFF_PHONE);
    
    if (TELEGRAM_BOT && TELEGRAM_CHAT) {
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT,
          text: `📲 <b>TRANSFERRING CALL TO STAFF</b>\n👤 Caller: <code>${From}</code>\n📞 Dialing: <code>${STAFF_PHONE}</code>\n🕒 ${new Date().toLocaleString()}`,
          parse_mode: 'HTML',
        }),
      }).catch(() => {});
    }

    return res.status(200).send(twiml(`
      ${hannah("Certainly! Let me transfer you directly to our staff. Please hold for just a moment while I connect your call.")}
      <Dial action="https://www.cedexx.net/api/voice/dial-status" timeout="20" callerId="${TWILIO_PHONE}">
        ${STAFF_PHONE}
      </Dial>
    `));
  }

  // 3. DIRECT VOICEMAIL
  if (intent === 'voicemail') {
    return res.status(200).send(twiml(`
      ${hannah("Certainly. Please leave your name, phone number, and a brief message after the beep, and our team will call you right back! You can also reach our main desk at 7 5 4, 4 3 2, 2 2 0 1.")}
      <Record action="https://www.cedexx.net/api/voice/voicemail" method="POST" maxLength="180" finishOnKey="#" playBeep="true" />
      ${hannah("Thank you for your message. We have alerted our staff. Have a wonderful day!")}
      <Hangup/>
    `));
  }

  // 4. GOODBYE
  if (intent === 'goodbye') {
    return res.status(200).send(twiml(`
      ${hannah("You're very welcome! Thank you for calling Ceedex, powered by Lyric Health. Have a wonderful and healthy day! Goodbye.")}
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
    spokenText = "Ceedex offers 24/7 virtual urgent care and primary care powered by Lyric Health, starting at 18 dollars and 99 cents a month with no insurance needed.";
  }

  // Coherent delivery: play answer in full, then prompt with bargeIn="false" to prevent line cutoffs
  const followUpResponse = `
    ${hannah(spokenText)}
    <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5" bargeIn="false">
      ${hannah("Can I help you with anything else today, or would you like to speak with our staff?")}
    </Gather>
    ${hannah("Thank you for calling Ceedex, powered by Lyric Health. Have a wonderful day!")}
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
            text: `${CEDEXX_KNOWLEDGE}\n\nCaller said: "${userSpeech}"\n\nRespond as Ceedex, the front desk receptionist. Keep it to 2 friendly, spoken sentences. Never mention employee names like Daisy; refer to "our staff". Offer to help enroll or connect with staff if relevant.`
          }]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 120 },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (text) return text;
  
  return "I'd be happy to help with that. You can enroll online at ceedex dot net slash enroll, or I can connect you directly with our staff.";
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
