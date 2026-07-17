import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';

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
  fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), 'utf8');
}

async function sendTelegramAlert(email: string, reason: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = `
🗑️ DATA DELETION REQUEST — CEDEXX
📧 ${email}
📝 Reason: ${reason || 'Not provided'}
🕒 ${new Date().toLocaleString()}
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (_) {}
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
  await sendTelegramAlert(normalizedEmail, reason || '');

  return res.status(200).json({
    success: true,
    message: deletedCount > 0
      ? `Your data has been queued for deletion. ${deletedCount} record(s) matching your email will be permanently removed within 72 hours.`
      : `We received your request. No active records were found for this email, but we will confirm via email if any archived data exists.`,
    deleted_count: deletedCount,
  });
}
