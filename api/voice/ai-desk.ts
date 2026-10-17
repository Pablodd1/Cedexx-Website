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

const XAI_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const TYPESAFE_API_KEY = process.env.TYPESAFE_API_KEY || '';
const JEV_MODEL = process.env.JEV_MODEL || 'jev-1.13.0';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+17544322201';
const STAFF_PHONE = process.env.STAFF_PHONE || process.env.DAISY_PHONE || '';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${xml}\n</Response>`;
}

// Speaks via Deepgram Flux Hannah / Grok Voice 3.0
function hannah(text: string): string {
  const url = `https://www.cedexx.net/api/voice/speak?text=${encodeURIComponent(text.trim())}`;
  return `<Play>${url}</Play>`;
}

// ─── Ceedex Public Knowledge Base ───
const CEDEXX_KNOWLEDGE = `
You are Hannah, the warm, friendly, and enthusiastic virtual front desk receptionist for Ceedex Healthcare, powered by Lyric Health.
You are on a live phone call with a patient, institutional partner, or prospective member.

STRICT PRIVACY & PUBLIC-ONLY BOUNDARY:
- You are trained ONLY on public Ceedex website information.
- You have ZERO access to the private Admin Dashboard, patient/member databases, enrollment records, billing records, or confidential internal company operations.
- NEVER disclose, guess, or collect private patient records (PHI) or internal company information.

CRITICAL PRONUNCIATION & RULES:
1. Company Name: Always pronounce and spell as "Ceedex" (sounds like "See-dex").
2. Staff Referrals: NEVER mention individual employee names like Daisy when transferring a caller. Always say "our staff", "a team member", or "our office team".
3. Receptionist Buffer: Answer caller questions quickly, accurately, and naturally based ONLY on the website facts below so staff only takes calls when human assistance is specifically requested.
4. Keep answers concise: 2 spoken sentences maximum. This is a voice phone conversation.
5. NEVER provide medical advice, diagnosis, or write prescriptions. For medical emergencies, advise dialing 911 immediately.
6. Follow-up: Ask "Would you like to enroll online at ceedex dot net slash enroll, or can I connect you with our staff?"

CEEDEX PUBLIC WEBSITE FACTS:
- Tagline: "Better Care. Here. Now. — A modern wellness amenity designed for individuals, families, institutions, and residential communities."
- Partnership: Ceedex is powered by Lyric Health, delivering 24/7 integrated virtual primary care, urgent care, pediatrics, and mental health therapy across all 50 states.
- Contact: Toll-Free line is (888) 260-0585, Local desk line is (754) 432-2201. Support email is support@cedexx.net. Website is ceedex.net.
- Four Homepage Pillars:
  1. Family & Individual Wellness (Explore Memberships at ceedex.net/pricing)
  2. Community & Housing Solutions (Multifamily, affordable, student, senior, and residential communities)
  3. Workforce & Institutional Wellness (School districts, educational institutions, employers, counties, municipalities, and public agencies)
  4. Affiliate & Strategic Partnerships (Associations, credit unions, nonprofits, faith-based organizations, and community networks)
- Retail Plans & Pricing (No insurance needed, $0 visit fees, $0 co-pays):
  * CareNow™ Individual: $16.99/mo | CareNow™ Family (up to 7 members): $24.99/mo (24/7 virtual urgent care)
  * CarePlus™ Individual: $24.99/mo | CarePlus™ Family (up to 7 members): $32.99/mo (24/7 urgent care + mental health counseling)
  * CareComplete™ Individual: $37.99/mo | CareComplete™ Family (up to 7 members): $52.99/mo (Dedicated virtual primary care + urgent care + mental health + preventive labs)
- Enterprise, Community, Workforce & Institutional Pricing:
  * Custom Community, Workforce & Institutional Pricing (Custom Quote) with flexible volume-based per-door, per-member, or organization-sponsored pricing.
  * Ideal For: School Districts & Educational Institutions, Counties/Municipalities/Public Agencies, Multifamily & Build-to-Rent, Student/Senior Housing, Employers, Health-Sharing & Transportation Networks, REALTOR®/Trade Associations, HOAs/Credit Unions/Faith-Based Organizations, and Nonprofits.
- Partner With Ceedex (5 Partnership Tracks at ceedex.net/partners):
  1. Housing & Residential Communities
  2. Hospitality & Wellness Concierge Solutions (for hotel guests)
  3. Workforce & Institutional Partnerships (employers, school districts, public agencies)
  4. Affiliate & Community Partners
  5. Physician Opportunities (through our partner network)
- CRITICAL ACTIVATION RULE: Lyric Health communication and account activation is NOT immediate; it takes 24 to 48 hours. Lyric Health sends welcome and activation instructions from noreply@getlyric.com within 24 to 48 hours.
- Member ID: The head of household Member ID is the 10-digit phone number entered at registration.
- Health Blogs (ceedex.net/blog): Features Founder & CEO Daisy Gonzalez's reflection "True Wellness: Caring for Body, Mind, and Spirit" (Faith & Wholeness, 3 John 1:2, Romans 12:2, Matthew 11:28, Psalm 23:3), plus clinical articles on pediatric AI respiratory diagnostics (94% accuracy), telehealth cost savings, chronic asthma care, and Miami heat hydration tips.
`;

// ─── Intent Detection (Heuristic / Regex Pre-filter & Fallback) ───
function detectIntentRegex(speech: string, digit: string): string {
  if (digit === '0' || digit === '9' || digit === '3') return 'transfer_staff';
  if (digit === '1') return 'enroll';
  if (digit === '2') return 'pricing';
  if (digit === '4') return 'voicemail';

  const lower = speech.toLowerCase().trim();

  // Emergency
  if (/emergency|911|heart attack|chest pain|stroke|severe bleeding|unconscious|cant breathe|cannot breathe|suicid|overdose/i.test(lower)) {
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

  // Institutional / School District / Enterprise / Partner
  if (/school|district|institution|municipality|county|public agency|enterprise|custom quote|partner|property|multifamily|hotel|hospitality|employer|workforce/i.test(lower)) {
    return 'institutional_partners';
  }

  // Pricing
  if (/price|cost|how much|pricing|fee|charge|rate|monthly|afford/i.test(lower)) {
    return 'pricing';
  }

  // Insurance / Coverage
  if (/insurance|copay|co-pay|deductible|family|dependents|coverage|who is covered/i.test(lower)) {
    return 'insurance_coverage';
  }

  // Blog / Articles / Faith reflection
  if (/blog|article|pediatric ai|research|hydration|heat exhaustion|faith|scripture|true wellness/i.test(lower)) {
    return 'blog';
  }

  // Member ID
  if (/member id|member number|my id|identification number|external id/i.test(lower)) {
    return 'member_id';
  }

  // How it works / general Lyric overview
  if (/how does (it|ceedex|cedexx|lyric|this) work|how do i (use|access) (it|lyric|ceedex)|what is (ceedex|cedexx|lyric)|four pillars|pillars/i.test(lower)) {
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

// ─── Jev System-1 Classifier (Ultra-fast calibrated triage + regex fallback) ───
async function detectIntent(speech: string, digit: string): Promise<string> {
  // Always honor keypad digits or explicit regex matches first (0ms latency)
  const regexIntent = detectIntentRegex(speech, digit);
  if (digit || (regexIntent !== 'ai_fallback' && !TYPESAFE_API_KEY)) {
    return regexIntent;
  }

  // Hard safety: if regex immediately spots an emergency or goodbye, return immediately
  if (regexIntent === 'emergency' || regexIntent === 'goodbye') {
    return regexIntent;
  }

  // If TYPESAFE_API_KEY is configured, use Jev System-1 to classify natural/indirect speech
  if (TYPESAFE_API_KEY && speech.length > 2) {
    try {
      const state = JSON.stringify({
        caller_speech: speech,
        service: 'Ceedex Telehealth Front Desk (powered by Lyric Health)',
      });

      const questions = {
        is_medical_emergency: {
          type: 'noul',
          instructions: 'Is the caller describing an acute, life-threatening medical emergency (e.g., chest pain, difficulty breathing, stroke symptoms, severe bleeding, self-harm) that requires dialing 911 immediately?',
        },
        intent: {
          type: 'choice',
          instructions: 'Classify the caller speech into the best matching front-desk intent.',
          criteria: {
            emergency: 'Life-threatening medical emergency requiring 911',
            transfer_staff: 'Caller explicitly asks to speak with a human, staff member, representative, operator, or office team',
            voicemail: 'Caller wants to leave a voicemail or recorded message',
            goodbye: 'Caller says no thank you, nothing else, goodbye, or is finished with the call',
            institutional_partners: 'Caller asks about school districts, educational institutions, public agencies, employers, residential communities, hospitality, or custom partnership quotes',
            pricing: 'Caller asks about plan prices, monthly cost, how much memberships cost, or affordability',
            insurance_coverage: 'Caller asks if insurance is required, co-pays, deductibles, or how many family members are covered',
            member_id: 'Caller asks what their Member ID number is or how to find their identification number',
            how_it_works: 'Caller asks what Ceedex or Lyric Health is, the four pillars, or how the virtual telehealth service works',
            enroll: 'Caller asks how to sign up, enroll, register, or start a membership',
            billing: 'Caller asks about a charge, payment, receipt, billing issue, or canceling a subscription',
            blog: 'Caller asks about health blog articles, faith and wellness reflections, pediatric AI diagnostics, or hydration articles',
            contact_phone: 'Caller asks for the phone number or email address to contact Ceedex',
            ai_fallback: 'Nuanced or multi-part question best answered by the conversational AI assistant',
          },
        },
      };

      const res = await fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TYPESAFE_API_KEY}`,
        },
        body: JSON.stringify({ model: JEV_MODEL, state, questions }),
        signal: AbortSignal.timeout(1200),
      });

      if (res.ok) {
        const data = await res.json();
        const a = data.answers || {};
        if (a.is_medical_emergency?.noul > 0.65) {
          return 'emergency';
        }
        if (a.intent?.choice) {
          return a.intent.choice;
        }
      }
    } catch (err) {
      console.warn('[AI DESK] Jev System-1 classification timed out or failed, using regex fallback:', err);
    }
  }

  return regexIntent;
}

// ─── Quick Natural Spoken Responses ───
function getQuickResponse(intent: string): string | null {
  switch (intent) {
    case 'member_id':
      return "Your Member ID number is simply the 10-digit phone number you entered when you registered. Whenever you need to verify your account or speak with pharmacy support, just provide your registered phone number.";

    case 'institutional_partners':
      return "Ceedex offers Custom Community, Workforce, and Institutional Pricing for school districts, educational institutions, public agencies, employers, and residential communities. You can request a custom volume quote online at ceedex dot net slash partners, or I can connect you directly with our staff.";

    case 'pricing':
      return "Our individual plans start at 16 dollars and 99 cents a month for CareNow urgent care, 24 dollars and 99 cents for CarePlus with mental wellness, and 37 dollars and 99 cents for CareComplete primary care. Family plans covering up to 7 members are 24.99, 32.99, and 52 dollars and 99 cents a month, plus custom volume quotes for institutions and communities.";
    
    case 'insurance_coverage':
      return "You do not need health insurance at all. There are zero co-pays, zero deductibles, and no surprise charges, and our family plans cover up to 7 household members under one subscription.";
    
    case 'how_it_works':
      return "Ceedex is a modern wellness platform for individuals, families, institutions, and residential communities, powered by Lyric Health. After you enroll at ceedex dot net slash enroll, Lyric Health account activation takes 24 to 48 hours, and then you have 24/7 access to board-certified doctors and therapists.";

    case 'enroll':
      return "Enrolling is quick and simple online at ceedex dot net slash enroll. Please keep in mind that Lyric Health communication and account activation takes 24 to 48 hours before you can log in, so welcome communication is not immediate.";

    case 'blog':
      return "Our blog at ceedex dot net slash blog features True Wellness: Caring for Body, Mind, and Spirit, alongside clinical articles on pediatric AI respiratory analysis, healthcare cost savings, and summer heat hydration tips.";

    case 'billing':
      return "You can manage your account and billing anytime at ceedex dot net, or email us at support at cedexx dot net. I can also connect you with our staff if you need direct billing assistance.";

    case 'contact_phone':
      return "You can reach Ceedex toll-free at 8 8 8, 2 6 0, 0 5 8 5, or at our local desk at 7 5 4, 4 3 2, 2 2 0 1, or by email at support at cedexx dot net.";

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

  // Detect intent (Regex + Jev System-1 Classifier)
  const intent = await detectIntent(speech, digit);
  console.log('[AI DESK] Detected intent:', intent, 'speech:', speech, 'digit:', digit);

  // Send Telegram event notification (HIPAA-compliant phone masking)
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    const fromDigits = (From || '').replace(/\D/g, '');
    const maskedFrom = fromDigits.length >= 4 ? `***-***-${fromDigits.slice(-4)}` : 'Unknown Caller';
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `🗣️ <b>FRONT DESK INTERACTION</b>\n👤 Caller: <code>${maskedFrom}</code>\n💬 Said: "<i>${speech || 'Keypad: ' + digit}</i>"\n🏷️ Intent: <b>${intent}</b>\n🕒 ${new Date().toLocaleString()}`,
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
      const fromDigits = (From || '').replace(/\D/g, '');
      const maskedFrom = fromDigits.length >= 4 ? `***-***-${fromDigits.slice(-4)}` : 'Unknown Caller';
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT,
          text: `📲 <b>TRANSFERRING CALL TO STAFF</b>\n👤 Caller: <code>${maskedFrom}</code>\n📞 Routing to staff\n🕒 ${new Date().toLocaleString()}`,
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

  if (!spokenText) {
    try {
      spokenText = await getAIResponse(speech);
    } catch (err) {
      console.error('[AI DESK] AI generation error:', err);
    }
  }

  if (!spokenText) {
    spokenText = "Ceedex offers 24/7 virtual urgent care, primary care, and mental wellness powered by Lyric Health, starting at 16 dollars and 99 cents a month with no insurance needed.";
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

// ─── Call Multi-Provider AI (Grok 3.0 → DeepSeek → OpenAI → Gemini 2.0 Flash) ───
async function getAIResponse(userSpeech: string): Promise<string> {
  const promptInstruction = `Respond as Hannah at Ceedex, the front desk receptionist. Keep it to 2 friendly, spoken sentences (no markdown or bullet points). Never mention employee names like Daisy when transferring calls; refer to "our staff". Offer to help enroll at ceedex dot net slash enroll or connect with staff if relevant.`;

  if (XAI_KEY) {
    for (const gModel of ['grok-3', 'grok-3-fast', 'grok-3-mini-fast']) {
      try {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${XAI_KEY}`,
          },
          body: JSON.stringify({
            model: gModel,
            messages: [
              { role: 'system', content: `${CEDEXX_KNOWLEDGE}\n\n${promptInstruction}` },
              { role: 'user', content: userSpeech },
            ],
            temperature: 0.3,
            max_tokens: 120,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content?.replace(/[*#_~`]/g, '').trim();
          if (text) return text;
        }
      } catch (e) {
        console.warn(`[AI DESK] Grok (${gModel}) failed:`, e);
      }
    }
  }

  if (DEEPSEEK_KEY) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: `${CEDEXX_KNOWLEDGE}\n\n${promptInstruction}` },
            { role: 'user', content: userSpeech },
          ],
          temperature: 0.3,
          max_tokens: 120,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.replace(/[*#_~`]/g, '').trim();
        if (text) return text;
      }
    } catch (e) {
      console.warn('[AI DESK] DeepSeek failed:', e);
    }
  }

  if (OPENAI_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `${CEDEXX_KNOWLEDGE}\n\n${promptInstruction}` },
            { role: 'user', content: userSpeech },
          ],
          temperature: 0.3,
          max_tokens: 120,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.replace(/[*#_~`]/g, '').trim();
        if (text) return text;
      }
    } catch (e) {
      console.warn('[AI DESK] OpenAI failed:', e);
    }
  }

  if (GEMINI_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `${CEDEXX_KNOWLEDGE}\n\nCaller said: "${userSpeech}"\n\n${promptInstruction}`
              }]
            }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 120 },
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/[*#_~`]/g, '').trim();
        if (text) return text;
      }
    } catch (e) {
      console.warn('[AI DESK] Gemini failed:', e);
    }
  }

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
