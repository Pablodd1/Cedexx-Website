import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/menu-choice
 * Handles IVR digit selection from incoming call
 */

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${xml}</Response>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { Digits, CallSid, From } = req.body;
  const digit = Digits?.toString() || '';

  console.log('[VOICE] Menu choice:', { callSid: CallSid, digit, from: From });

  let response = '';

  switch (digit) {
    case '1':
      // Enrollment - Send SMS with link, offer to connect
      response = `
        <Say voice="Polly.Joanna">
          Great choice! You can enroll right now at cedexx dot net slash enroll. 
          I'll also send you a text message with the link.
        </Say>
        <Sms>Enroll in CEDEXX powered by Lyric Health: https://cedexx.net/enroll\n\nQuestions? Reply here or call back.</Sms>
        <Say voice="Polly.Joanna">
          We offer Care Now for 18 dollars and 99 cents per month, and Care Complete for 34 dollars and 99 cents per month. 
          No insurance needed. Thank you for calling CEDEXX!
        </Say>
        <Hangup/>
      `;
      break;

    case '2':
      // AI Assistant
      response = `
        <Say voice="Polly.Joanna">
          Connecting you to our AI assistant. You can ask about our services, pricing, or how CEDEXX works.
        </Say>
        <Connect>
          <Stream url="wss://cedexx.net/api/voice/ai-stream" />
        </Connect>
      `;
      break;

    case '3':
      // Billing
      response = `
        <Say voice="Polly.Joanna">
          For billing questions, please email support at cedexx dot net, or visit your account at cedexx dot net.
          You can also reply to any text message we send you.
        </Say>
        <Sms>CEDEXX Billing Support:\nEmail: support@cedexx.net\nAccount: https://cedexx.net\n\nHow can we help?</Sms>
        <Hangup/>
      `;
      break;

    case '4':
      // Voicemail
      response = `
        <Say voice="Polly.Joanna">
          Please leave a detailed message after the tone. Include your name, phone number, and how we can help. 
          Our team will respond within 2 hours.
        </Say>
        <Record 
          action="/api/voice/voicemail" 
          maxLength="300" 
          transcribe="true"
          transcribeCallback="/api/voice/voicemail"
          finishOnKey="#"
          playBeep="true"
        />
        <Say voice="Polly.Joanna">We didn't receive a message. Please call back or text us. Goodbye.</Say>
        <Hangup/>
      `;
      break;

    case '0':
    default:
      // Repeat menu
      response = `
        <Redirect>/api/voice/incoming</Redirect>
      `;
      break;
  }

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml(response));
}
