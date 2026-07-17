import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

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

function sanitize(s: string) {
  return (s || '').replace(/[<>]/g, '').trim().substring(0, 200);
}

async function sendTelegramAlert(member: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const statusIcon = member.status === 'paid' ? '💳 PAID' : '📋 REGISTERED';
  const text = `
${statusIcon} — CEDEXX Member
👤 ${member.first_name} ${member.last_name}
📧 ${member.email}
📞 ${member.phone || 'N/A'}
🎂 DOB: ${member.dob || 'N/A'}
📦 Plan: ${member.plan}
🕒 ${new Date(member.registered_at).toLocaleString()}
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

  const { first_name, last_name, email, phone, dob, plan, status = 'registered', consent_analytics, consent_tos, consent_version, consent_timestamp } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const member = {
    id: `mbr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    first_name: sanitize(first_name || ''),
    last_name: sanitize(last_name || ''),
    email: email.toLowerCase().trim(),
    phone: sanitize(phone || ''),
    dob: sanitize(dob || ''),
    plan: sanitize(plan || ''),
    status, // 'registered' | 'paid'
    registered_at: new Date().toISOString(),
    paid_at: status === 'paid' ? new Date().toISOString() : null,
    stripe_session_id: sanitize(req.body.stripe_session_id || ''),
    consent_tos: !!consent_tos,
    consent_analytics: !!consent_analytics,
    consent_version: sanitize(consent_version || '1.0'),
    consent_timestamp: consent_timestamp || new Date().toISOString(),
  };

  const members = loadMembers();

  // Upsert: update existing by email if already registered
  const existingIdx = members.findIndex((m) => m.email === member.email);
  if (existingIdx >= 0) {
    members[existingIdx] = {
      ...members[existingIdx],
      ...member,
      id: members[existingIdx].id, // keep original id
      registered_at: members[existingIdx].registered_at, // keep original reg date
    };
  } else {
    members.push(member);
  }

  saveMembers(members);
  await sendTelegramAlert(member);

  return res.status(200).json({ success: true, id: member.id });
}
