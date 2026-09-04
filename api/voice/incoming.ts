import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/incoming
 * AI Front Desk Assistant — Main Twilio webhook
 * 
 * Handles incoming calls with:
 * 1. Professional greeting
 * 2. Speech-enabled AI assistant (no WebSocket needed)
 * 3. Direct enrollment via phone
 * 4. Voicemail fallback
 * 5. SMS follow-up
 * 
 * Phone: (754) 432-2201
 */

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+17544322201';

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${xml}</Response>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { From, To, CallSid, Direction } = req.body;

  console.log('[VOICE] Incoming call:', {
    from: From,
    to: To,
    callSid: CallSid,
    direction: Direction,
    timestamp: new Date().toISOString(),
  });

  // Log call (fire-and-forget)
  logCall({
    callSid: CallSid,
    from: From,
    to: To,
    direction: Direction || 'inbound',
    status: 'answered',
    startedAt: new Date().toISOString(),
  }).catch(() => {});

  // Main greeting + AI assistant prompt
  const greeting = `
    <Say voice="Polly.Joanna">
      Thank you for calling CEDEXX, powered by Lyric Health. Your health, simplified.
    </Say>
    <Say voice="Polly.Joanna">
      I'm Cedex, your AI front desk assistant. I can help you enroll, answer questions about our plans, or connect you with our team.
    </Say>
    <Gather input="speech dtmf" action="/api/voice/ai-desk" speechTimeout="auto" speechModel="phone_call" language="en-US" numDigits="1">
      <Say voice="Polly.Joanna">
        What can I help you with today? You can say things like: "I want to enroll," "How much does it cost," or "I have a billing question." You can also press 1 to enroll, 2 for pricing, 3 for billing, or 4 to leave a voicemail.
      </Say>
    </Gather>
    <Say voice="Polly.Joanna">I didn't hear a response. Let me send you a text with our enrollment link. Goodbye!</Say>
    <Sms from="${TWILIO_PHONE}" to="${From}">CEDEXX — Enroll now: https://cedexx.net/enroll | Questions? Reply here or call back. We're here 24/7.</Sms>
    <Hangup/>
  `;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml(greeting));
}

// ─── Call Logging ───
async function logCall(callData: any) {
  try {
    await fetch('https://cedexx.net/api/voice/call-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callData),
    });
  } catch (err) {
    console.error('[CALL LOG ERROR]', err);
  }
}
