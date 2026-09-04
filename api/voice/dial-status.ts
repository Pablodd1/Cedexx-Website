import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/dial-status
 * Twilio Dial action callback when call to Daisy finishes or is unanswered.
 * 
 * DialCallStatus values:
 * - 'completed': Daisy answered and call completed normally.
 * - 'busy', 'no-answer', 'failed', 'canceled': Daisy was unavailable.
 */

const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${xml}\n</Response>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/xml');

  const data = req.body || req.query || {};
  const DialCallStatus = (data.DialCallStatus || data.dialCallStatus || '').toLowerCase();
  const From = data.From || data.from || 'Unknown Caller';
  const CallSid = data.CallSid || data.callSid || `call_${Date.now()}`;

  console.log('[DIAL STATUS] Call transfer result:', { from: From, dialCallStatus: DialCallStatus, callSid: CallSid });

  // If the call was successfully answered and completed by Daisy, hang up normally
  if (DialCallStatus === 'completed' || DialCallStatus === 'answered') {
    return res.status(200).send(twiml('<Hangup/>'));
  }

  // Staff did not answer (busy, no-answer, failed, canceled)
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `⚠️ <b>STAFF UNAVAILABLE (${DialCallStatus.toUpperCase()})</b>\n👤 Caller: <code>${From}</code>\n📍 Routing to voicemail...\n🕒 ${new Date().toLocaleString()}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }

  // Gracefully transition to voicemail — no employee names spoken
  const fallback = `
    <Say voice="Polly.Joanna" language="en-US">
      Our staff is currently assisting other patients or away from the desk. Please leave your name, phone number, and a brief message after the beep, and a team member will call you right back!
    </Say>
    <Record action="https://www.cedexx.net/api/voice/voicemail" method="POST" maxLength="180" finishOnKey="#" playBeep="true" />
    <Say voice="Polly.Joanna" language="en-US">
      Thank you for your message. We have alerted our staff, and a team member will follow up with you promptly. Have a wonderful day!
    </Say>
    <Hangup/>
  `;

  return res.status(200).send(twiml(fallback));
}
