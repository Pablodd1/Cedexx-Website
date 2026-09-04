import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';
const DATA_FILE = '/tmp/cedexx-members.json';

function loadMembers(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (_) {}
  return [];
}

function saveMembers(members: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), 'utf8');
  } catch (_) {}
}

async function sendNotifications(email: string, reason: string) {
  if (RESEND_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Notifications <support@cedexx.net>',
        to: [ADMIN_EMAIL],
        subject: `🗑️ Data Deletion Request — ${email}`,
        html: `<h2>Data Deletion Request</h2><p><strong>Email:</strong> ${email}</p><p><strong>Reason:</strong> ${reason || 'None specified'}</p>`,
      }),
    }).catch(() => {});
  }
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `🗑️ <b>DATA DELETION REQUEST</b>\n📧 ${email}\n📝 Reason: ${reason || 'None'}\n🕒 ${new Date().toLocaleString()}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, reason } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const members = loadMembers();
  const beforeCount = members.length;
  const filtered = members.filter((m) => m.email !== normalizedEmail);
  const deletedCount = beforeCount - filtered.length;

  saveMembers(filtered);
  await sendNotifications(normalizedEmail, reason || '');

  return res.status(200).json({
    success: true,
    message: deletedCount > 0
      ? `Your data has been queued for deletion. ${deletedCount} record(s) matching your email will be permanently removed within 72 hours.`
      : `We received your request. No active records were found for this email, but we will confirm via email if any archived data exists.`,
    deleted_count: deletedCount,
  });
}
