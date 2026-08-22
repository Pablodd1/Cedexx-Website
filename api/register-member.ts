import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import { notifyAdmin } from './notify';

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

async function sendNotifications(member: any) {
  try {
    await notifyAdmin({
      type: member.status === 'paid' ? 'payment' : 'registration',
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      dob: member.dob,
      plan: member.plan,
      stripe_session_id: member.stripe_session_id,
      consent_tos: member.consent_tos,
      consent_analytics: member.consent_analytics,
      consent_version: member.consent_version,
      consent_timestamp: member.consent_timestamp,
    });
  } catch (err) {
    console.error('[NOTIFY ERROR]', err);
    // Don't crash the API if notifications fail
  }
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

  // Upsert: update existing by email if already registered or was a form-started lead
  const existingIdx = members.findIndex((m) => m.email === member.email);
  if (existingIdx >= 0) {
    const existing = members[existingIdx];
    members[existingIdx] = {
      ...existing,
      ...member,
      id: existing.id, // keep original id
      // Preserve form-started tracking fields
      form_started_at: existing.form_started_at || null,
      form_field: existing.form_field || '',
      page_url: existing.page_url || '',
      ip_address: existing.ip_address || '',
      // If this was previously form_started, now mark registered_at
      registered_at: existing.registered_at || new Date().toISOString(),
    };
  } else {
    members.push(member);
  }

  saveMembers(members);
  await sendNotifications(member);

  return res.status(200).json({ success: true, id: member.id });
}
