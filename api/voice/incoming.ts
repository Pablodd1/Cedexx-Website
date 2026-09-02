import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/incoming
 * Main Twilio webhook for incoming calls
 * Handles IVR menu and routes to appropriate handler
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '';

// Simple Twilio XML response builder
function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${xml}</Response>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST from Twilio
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { From, To, CallSid, Direction } = req.body;

  console.log('[VOICE] Incoming call:', {
    from: From,
    to: To,
    callSid: CallSid,
    direction: Direction,
    timestamp: new Date().toISOString(),
  });

  // Log the call (fire-and-forget)
  logCall({
    callSid,
    from: From,
    to: To,
    direction: Direction || 'inbound',
    status: 'answered',
    startedAt: new Date().toISOString(),
  }).catch(() => {});

  // IVR Menu
  const greeting = `
    <Say voice="Polly.Joanna">
      Thank you for calling CEDEXX, powered by Lyric Health. 
      Your health, simplified.
    </Say>
    <Gather action="/api/voice/menu-choice" numDigits="1" timeout="5">
      <Say voice="Polly.Joanna">
        Press 1 to learn about our membership plans and enroll.
        Press 2 to speak with our AI assistant about services and pricing.
        Press 3 for billing and account questions.
        Press 4 to leave a voicemail for our team.
        Press 0 to hear this menu again.
      </Say>
    </Gather>
    <Say voice="Polly.Joanna">We didn't receive a selection. Please call back or visit cedexx dot net. Goodbye.</Say>
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
