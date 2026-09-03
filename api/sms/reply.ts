import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/sms/reply
 * Handles incoming SMS replies from users
 * 
 * Twilio webhook: Configure in Twilio Console → Phone Number → Messaging →
 * "A message comes in" → Webhook → POST https://cedexx.net/api/sms/reply
 * 
 * Keywords:
 * - STOP / UNSUBSCRIBE / CANCEL / QUIT / END → Unsubscribe
 * - START / YES / UNSTOP → Re-subscribe
 * - HELP / INFO → Support info
 * - Anything else → Forward to admin + auto-reply
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+18555033371';

// Simple in-memory opt-out list (resets on deploy; use DB for production)
// In production, store this in GitHub DB or a proper database
const optOutList = new Set<string>();

function twiml(message: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Twilio sends POST with form data
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const from = req.body?.From || '';
  const to = req.body?.To || '';
  const body = (req.body?.Body || '').trim().toUpperCase();
  const rawBody = req.body?.Body || '';

  console.log(`[SMS REPLY] From: ${from} | To: ${to} | Body: "${rawBody}"`);

  // ─── STOP / UNSUBSCRIBE ───
  if (['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END', 'STOPALL'].includes(body)) {
    optOutList.add(from);
    console.log(`[SMS OPT-OUT] ${from} unsubscribed`);
    
    // Notify admin
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY || ''}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'CEDEXX SMS <support@cedexx.net>',
          to: ADMIN_EMAIL,
          subject: 'SMS Opt-Out: ' + from,
          text: `User ${from} has opted out of SMS messages.\n\nReply: "${rawBody}"\nTimestamp: ${new Date().toISOString()}`,
        }),
      });
    } catch { /* silent fail */ }

    return res.status(200).setHeader('Content-Type', 'text/xml').send(twiml(
      `You have been unsubscribed from CEDEXX SMS messages. You will no longer receive texts. To re-subscribe, reply START. For help: support@cedexx.net or (855) 503-3371.`
    ));
  }

  // ─── START / UNSTOP / YES ───
  if (['START', 'UNSTOP', 'YES', 'SUBSCRIBE'].includes(body)) {
    optOutList.delete(from);
    console.log(`[SMS OPT-IN] ${from} re-subscribed`);
    return res.status(200).setHeader('Content-Type', 'text/xml').send(twiml(
      `Welcome back! You are now re-subscribed to CEDEXX. Reply HELP for support or visit cedexx.net.`
    ));
  }

  // ─── HELP / INFO ───
  if (['HELP', 'INFO', 'SUPPORT', 'ASSISTANCE'].includes(body)) {
    return res.status(200).setHeader('Content-Type', 'text/xml').send(twiml(
      `CEDEXX Support:\n📞 (855) 503-3371\n✉️ support@cedexx.net\n🌐 cedexx.net\n\nReply STOP to unsubscribe. Msg&data rates may apply.`
    ));
  }

  // ─── General Reply → Forward to Admin + Auto-Reply ───
  // Forward the message to admin via email
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY || ''}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'CEDEXX SMS <support@cedexx.net>',
        to: ADMIN_EMAIL,
        subject: `SMS Reply from ${from}`,
        text: `Incoming SMS from ${from}:\n\n"${rawBody}"\n\nTo reply, call or text back from your admin dashboard.`,
      }),
    });
  } catch { /* silent fail */ }

  return res.status(200).setHeader('Content-Type', 'text/xml').send(twiml(
    `Thanks for your message! Our team has been notified and will follow up if needed.\n\nFor immediate help: (855) 503-3371 or support@cedexx.net\nReply HELP for options. Reply STOP to unsubscribe.`
  ));
}
