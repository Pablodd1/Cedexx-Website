import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/voicemail
 * Handles voicemail recording and transcription
 * Also handles Twilio's transcribeCallback
 */

const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${xml}</Response>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Twilio sends different data depending on whether it's the Record action or transcribeCallback
  const isTranscriptionCallback = !!req.body.TranscriptionText;
  
  const callSid = req.body.CallSid || req.body.CallSid;
  const from = req.body.From || req.body.Caller;
  const recordingUrl = req.body.RecordingUrl;
  const recordingDuration = req.body.RecordingDuration;
  const transcriptionText = req.body.TranscriptionText;
  const transcriptionStatus = req.body.TranscriptionStatus;

  console.log('[VOICE] Voicemail received:', {
    callSid,
    from,
    isTranscription: isTranscriptionCallback,
    hasTranscription: !!transcriptionText,
    duration: recordingDuration,
    timestamp: new Date().toISOString(),
  });

  // If this is the initial Record callback (no transcription yet)
  if (!isTranscriptionCallback && recordingUrl) {
    // Thank the caller
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml(`
      <Say voice="Polly.Joanna">
        Thank you for your message. Our team will review it and respond within 2 hours. 
        You can also text us at this number for faster response. Have a great day!
      </Say>
      <Hangup/>
    `));

    // Send immediate notification (without transcription yet)
    await notifyVoicemail({
      callSid,
      from,
      recordingUrl,
      duration: recordingDuration,
      transcription: null,
      timestamp: new Date().toISOString(),
    });

    return;
  }

  // If this is the transcribeCallback (has transcription)
  if (isTranscriptionCallback && transcriptionText) {
    // Update the voicemail record with transcription
    await updateVoicemailWithTranscription({
      callSid,
      from,
      recordingUrl,
      transcription: transcriptionText,
      transcriptionStatus,
      timestamp: new Date().toISOString(),
    });

    // Send updated notification with transcription
    await notifyVoicemail({
      callSid,
      from,
      recordingUrl,
      duration: recordingDuration,
      transcription: transcriptionText,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ received: true });
    return;
  }

  // Fallback
  res.status(200).json({ received: true });
}

// ─── Notifications ───
async function notifyVoicemail(data: any) {
  const { from, recordingUrl, duration, transcription, timestamp } = data;

  const transcriptPreview = transcription 
    ? `\n\n📝 Transcription:\n${transcription.substring(0, 500)}${transcription.length > 500 ? '...' : ''}`
    : '\n\n⏳ Transcription processing...';

  // Telegram notification
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    try {
      const text = [
        '📞 <b>NEW VOICEMAIL</b> — CEDEXX',
        `📱 From: ${from}`,
        `⏱️ Duration: ${duration || '?'} seconds`,
        transcriptPreview,
        `🔗 Recording: ${recordingUrl || 'N/A'}`,
        `🕒 ${new Date(timestamp).toLocaleString()}`,
      ].join('\n');

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
      console.error('[TELEGRAM VOICEMAIL ERROR]', err);
    }
  }

  // Email notification
  if (RESEND_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({
          from: 'CEDEXX Voicemail <support@cedexx.net>',
          to: [ADMIN_EMAIL],
          subject: `📞 New Voicemail from ${from}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;border:1px solid #e0e0e0;border-radius:16px;overflow:hidden">
              <div style="background:#050249;color:#fff;padding:20px">
                <h2 style="margin:0;font-size:18px">📞 New Voicemail</h2>
              </div>
              <div style="padding:20px">
                <p><strong>From:</strong> ${from}</p>
                <p><strong>Duration:</strong> ${duration || '?'} seconds</p>
                <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
                ${recordingUrl ? `<p><a href="${recordingUrl}" style="color:#050249;font-weight:700">Listen to Recording</a></p>` : ''}
                ${transcription ? `
                  <div style="background:#f8fafc;padding:16px;border-radius:8px;margin-top:16px">
                    <h3 style="margin:0 0 8px 0;font-size:14px">Transcription</h3>
                    <p style="margin:0;color:#374151">${transcription}</p>
                  </div>
                ` : '<p style="color:#94a3b8">Transcription pending...</p>'}
              </div>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.error('[EMAIL VOICEMAIL ERROR]', err);
    }
  }
}

// ─── Update voicemail record with transcription ───
async function updateVoicemailWithTranscription(data: any) {
  // This would update a database record
  // For now, we'll just log it
  console.log('[VOICE] Transcription received:', {
    callSid: data.callSid,
    transcription: data.transcription?.substring(0, 100) + '...',
  });
}
