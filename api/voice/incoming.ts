import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/incoming
 * AI Front Desk Assistant — Main Twilio webhook
 * 
 * Handles incoming calls with:
 * 1. Professional Polly.Joanna voice greeting
 * 2. Speech recognition & DTMF keypad gather
 * 3. Direct routing to AI Desk
 * 4. Automatic call logging & Telegram notification
 * 
 * Phone: (754) 432-2201
 */

const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${xml}\n</Response>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/xml');

  // Accept both POST and GET from Twilio
  const data = req.body || req.query || {};
  const From = data.From || data.from || 'Unknown Caller';
  const To = data.To || data.to || '+17544322201';
  const CallSid = data.CallSid || data.callSid || `call_${Date.now()}`;
  const Direction = data.Direction || data.direction || 'inbound';

  console.log('[VOICE] Incoming call:', { from: From, to: To, callSid: CallSid, direction: Direction });

  // Fire-and-forget notification to Telegram
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `📞 <b>INCOMING CALL</b> — CEDEXX Front Desk\n👤 From: <code>${From}</code>\n📍 To: <code>${To}</code>\n🆔 SID: ${CallSid}\n🕒 ${new Date().toLocaleString()}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }

  // Pure Voice TwiML — 100% compliant with Twilio Voice standards
  const greeting = `
    <Say voice="Polly.Joanna" language="en-US">
      Thank you for calling CEDEXX, powered by Lyric Health. Your health, simplified.
    </Say>
    <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5">
      <Say voice="Polly.Joanna" language="en-US">
        I am Cedex, your AI receptionist. How can I help you today? You can say things like, I want to enroll, tell me about pricing, or speak to support. Or press 1 to enroll, 2 for pricing, 3 for billing, or 4 to leave a voicemail.
      </Say>
    </Gather>
    <Say voice="Polly.Joanna" language="en-US">
      I did not hear a response. To explore our plans or enroll online anytime, visit cedexx dot net slash enroll. Thank you for calling CEDEXX. Goodbye!
    </Say>
    <Hangup/>
  `;

  return res.status(200).send(twiml(greeting));
}
