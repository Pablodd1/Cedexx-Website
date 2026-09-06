import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/incoming
 * AI Front Desk Receptionist — Main Twilio Webhook
 * 
 * Flow:
 * 1. Warm, natural receptionist greeting (Polly.Joanna)
 * 2. Speech recognition & DTMF keypad gather
 * 3. Answers questions quickly & acts as front-desk buffer
 * 4. Transfers to Daisy (+1 954-624-6744) when requested
 * 5. Instant Telegram alert on incoming call
 * 
 * Front Desk Line: (754) 432-2201
 * Daisy's Line: (954) 624-6744
 */

const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';

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

  console.log('[VOICE] Incoming front desk call:', { from: From, to: To, callSid: CallSid, direction: Direction });

  // Instant notification to Telegram
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `📞 <b>INCOMING CALL — FRONT DESK</b>\n👤 Caller: <code>${From}</code>\n📍 Line: <code>${To}</code>\n🆔 SID: <code>${CallSid}</code>\n🕒 ${new Date().toLocaleString()}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }

  // Pure Voice TwiML — Friendly front desk receptionist (Hannah - Deepgram Flux / Expressivity 1)
  const greetingText = "Hi! Thank you for calling Ceedex, powered by Lyric Health. My name is Hannah, your virtual front desk receptionist. How can I help you today?";
  const reminderText = "I'm still here! I can answer questions about our plans, pricing, virtual doctor visits, or connect you with our staff. What can I do for you?";
  const goodbyeText = "I didn't catch a response. You can visit us online anytime at ceedex dot net slash enroll, or call back whenever you're ready. Thank you for calling Ceedex. Have a wonderful day!";

  const greetingUrl = `https://www.cedexx.net/api/voice/speak?text=${encodeURIComponent(greetingText)}`;
  const reminderUrl = `https://www.cedexx.net/api/voice/speak?text=${encodeURIComponent(reminderText)}`;
  const goodbyeUrl = `https://www.cedexx.net/api/voice/speak?text=${encodeURIComponent(goodbyeText)}`;

  const greeting = `
    <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="5" bargeIn="false">
      <Play>${greetingUrl}</Play>
    </Gather>
    <Gather input="speech dtmf" action="https://www.cedexx.net/api/voice/ai-desk" method="POST" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1" timeout="6" bargeIn="false">
      <Play>${reminderUrl}</Play>
    </Gather>
    <Play>${goodbyeUrl}</Play>
    <Hangup/>
  `;

  return res.status(200).send(twiml(greeting));
}
