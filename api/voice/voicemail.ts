import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || 'b0e085008baa62122bb769ac64c4dbaf2f49831b';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const JASMEL_EMAIL = process.env.JASMEL_EMAIL || 'jasmelacosta@gmail.com';
const DAISY_EMAIL = process.env.DAISY_EMAIL || 'daisy@cedexx.net';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';

async function transcribeAudio(audioUrl: string): Promise<{ transcript: string; confidence: number } | null> {
  try {
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?punctuate=true&utterances=true&diarize=true&model=nova-2&smart_format=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: audioUrl }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const result = data.results?.channels?.[0]?.alternatives?.[0];
    if (!result) return null;
    return {
      transcript: result.transcript || '',
      confidence: result.confidence || 0,
    };
  } catch (err) {
    console.error('[DEEPGRAM ERROR]', err);
    return null;
  }
}

async function alertCritical(error: any, context: any) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('[CRITICAL ALERT]', msg, context);
  if (RESEND_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Alerts <alerts@cedexx.net>',
        to: [JASMEL_EMAIL, ADMIN_EMAIL],
        subject: `🚨 CRITICAL ERROR — /api/voice/voicemail`,
        html: `<p>Error: ${msg}</p><p>Context: ${JSON.stringify(context)}</p>`,
        text: `Error: ${msg}\nContext: ${JSON.stringify(context)}`,
      }),
    }).catch(() => {});
  }
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `🚨 <b>CRITICAL ERROR</b>\n${msg}\n📍 Endpoint: /api/voice/voicemail`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    CallSid,
    From,
    RecordingUrl,
    RecordingDuration,
    TranscriptionText,
    TranscriptionStatus,
  } = req.body;

  console.log('[VOICEMAIL] Received:', {
    callSid: CallSid,
    from: From,
    recordingUrl: RecordingUrl,
    duration: RecordingDuration,
    twilioTranscription: TranscriptionText?.substring(0, 100),
    status: TranscriptionStatus,
  });

  // Always respond with 200 to Twilio immediately
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);

  // ─── Deepgram Transcription (High Accuracy) ───
  let deepgramTranscript: string | null = null;
  let deepgramConfidence: number = 0;

  if (RecordingUrl) {
    try {
      console.log('[VOICEMAIL] Sending to Deepgram for transcription...');
      const deepgramResult = await transcribeAudio(RecordingUrl);
      
      if (deepgramResult && deepgramResult.transcript) {
        deepgramTranscript = deepgramResult.transcript;
        deepgramConfidence = deepgramResult.confidence;
        console.log('[VOICEMAIL] Deepgram transcript:', deepgramTranscript.substring(0, 100));
        console.log('[VOICEMAIL] Deepgram confidence:', deepgramConfidence);
      }
    } catch (err) {
      console.error('[VOICEMAIL] Deepgram transcription failed:', err);
    }
  }

  // Use best available transcription
  const bestTranscription = deepgramTranscript || TranscriptionText || null;
  const transcriptionSource = deepgramTranscript ? 'Deepgram AI' : (TranscriptionText ? 'Twilio' : 'Pending');

  // Send notifications (fire-and-forget)
  try {
    await Promise.allSettled([
      sendEmailNotification(From, RecordingUrl, RecordingDuration, bestTranscription, transcriptionSource),
      sendTelegramNotification(From, RecordingDuration, bestTranscription, transcriptionSource),
      logVoicemail(CallSid, From, RecordingUrl, RecordingDuration, bestTranscription, deepgramConfidence),
    ]);
  } catch (err) {
    console.error('[VOICEMAIL] Notification error:', err);
  }
}

// ─── Email Notification ───
async function sendEmailNotification(
  from: string,
  recordingUrl: string,
  duration: string,
  transcription: string | null,
  source: string
) {
  if (!RESEND_KEY) return;

  const subject = `🎙️ New Voicemail — CEDEXX Front Desk`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#050249;padding:40px 20px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:24px;">🎙️ New Voicemail</h1>
        <p style="color:#23d9b0;margin:10px 0 0;font-size:14px;">CEDEXX AI Front Desk</p>
      </div>
      <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">From</td><td style="padding:8px;border:1px solid #e5e7eb;">${from}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Duration</td><td style="padding:8px;border:1px solid #e5e7eb;">${duration || 'N/A'} seconds</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Received</td><td style="padding:8px;border:1px solid #e5e7eb;">${new Date().toLocaleString()}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Transcription</td><td style="padding:8px;border:1px solid #e5e7eb;color:#166534;font-weight:600;">${source}</td></tr>
        </table>
        
        ${recordingUrl ? `<p style="margin-bottom:20px;"><a href="${recordingUrl}" style="background:#050249;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">🎧 Listen to Recording</a></p>` : ''}
        
        ${transcription ? `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;">
            <h3 style="margin:0 0 12px 0;color:#166534;font-size:14px;font-weight:700;">📝 Transcription (${source})</h3>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${transcription}</p>
          </div>
        ` : '<p style="color:#6b7280;font-size:14px;">⏳ Transcription processing...</p>'}
        
        <p style="margin-top:20px;color:#6b7280;font-size:12px;">Reply to this email to respond to the caller.</p>
      </div>
    </div>
  `;

  const toEmails = [ADMIN_EMAIL, DAISY_EMAIL];
  if (JASMEL_EMAIL && !toEmails.includes(JASMEL_EMAIL)) toEmails.push(JASMEL_EMAIL);

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Front Desk <support@cedexx.net>',
        to: toEmails,
        subject,
        html,
        text: `New voicemail from ${from}\nDuration: ${duration}s\nTranscription (${source}): ${transcription || 'Processing...'}\nRecording: ${recordingUrl || 'N/A'}`,
      }),
    });
  } catch (err) {
    console.error('[VOICEMAIL EMAIL ERROR]', err);
  }
}

// ─── Telegram Notification ───
async function sendTelegramNotification(
  from: string,
  duration: string,
  transcription: string | null,
  source: string
) {
  if (!TELEGRAM_BOT || !TELEGRAM_CHAT) return;

  const text = [
    '🎙️ <b>NEW VOICEMAIL — CEDEXX Front Desk</b>',
    `📞 From: ${from}`,
    `⏱️ Duration: ${duration || 'N/A'}s`,
    `🤖 Transcription: ${source}`,
    transcription ? `📝 "${transcription.substring(0, 800)}"` : '⏳ Processing...',
    `🕒 ${new Date().toLocaleString()}`,
  ].filter(Boolean).join('\n\n');

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('[VOICEMAIL TELEGRAM ERROR]', err);
  }
}

// ─── Log to GitHub DB ───
async function logVoicemail(
  callSid: string,
  from: string,
  recordingUrl: string,
  duration: string,
  transcription: string | null,
  confidence: number
) {
  try {
    await fetch('https://cedexx.net/api/voice/call-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callSid,
        from,
        type: 'voicemail',
        recordingUrl,
        duration,
        transcription,
        transcriptionConfidence: confidence,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error('[VOICEMAIL LOG ERROR]', err);
  }
}
