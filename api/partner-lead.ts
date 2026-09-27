import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminEmails } from './client-email.js';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '8834617573:AAGANwBh_xp-MIZpqukctS2OAuJ2zxJOnrU';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '7838956683';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const { name, email, phone, role, message } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  // 1. Send Email Notification to Admins
  if (RESEND_KEY) {
    const adminRecipients = getAdminEmails();
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({
          from: 'CEDEXX Partnerships <support@cedexx.net>',
          to: adminRecipients,
          reply_to: email,
          subject: `🤝 New Partner/Broker Lead: ${name} (${role || 'Partner'})`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #050249; margin-bottom: 4px;">🤝 New Partner Lead Received</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 0;">A new partner or broker inquiry was submitted via the CEDEXX Partners portal.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Name:</strong></td><td>${name}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td>${phone || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Role / Type:</strong></td><td><span style="background: #ebf3fb; color: #050249; padding: 3px 8px; border-radius: 6px; font-weight: bold;">${role || 'Partner'}</span></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Message:</strong></td><td style="white-space: pre-wrap;">${message || 'N/A'}</td></tr>
              </table>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8;">CEDEXX Partner Program • Powered by Lyric Health</p>
            </div>
          `,
        }),
      });
    } catch (e) {
      console.error('[PARTNER LEAD EMAIL ERROR]', e);
    }
  }

  // 2. Telegram Alert
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    try {
      const text = [
        '🤝 <b>NEW PARTNER / BROKER LEAD</b> — CEDEXX',
        `👤 <b>Name:</b> ${name}`,
        `📧 <b>Email:</b> ${email}`,
        phone ? `📞 <b>Phone:</b> ${phone}` : null,
        role ? `🏷️ <b>Role:</b> ${role}` : null,
        message ? `💬 <b>Message:</b> ${message}` : null,
      ].filter(Boolean).join('\n');

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT,
          text,
          parse_mode: 'HTML',
        }),
      });
    } catch (e) {
      console.error('[PARTNER TELEGRAM ERROR]', e);
    }
  }

  return res.status(200).json({ success: true, message: 'Partner inquiry received successfully.' });
}
