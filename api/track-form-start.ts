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

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0].split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { first_name, last_name, email, phone, plan, field, url, session_id } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const clientIp = getClientIp(req);
  const normalizedEmail = email.toLowerCase().trim();
  const members = loadMembers();

  // Check if this email already has any record (form_started, registered, or paid)
  const existingIdx = members.findIndex((m) => m.email === normalizedEmail);

  const lead = {
    id: `mbr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    first_name: sanitize(first_name || ''),
    last_name: sanitize(last_name || ''),
    email: normalizedEmail,
    phone: sanitize(phone || ''),
    plan: sanitize(plan || ''),
    status: 'form_started' as const,
    form_started_at: new Date().toISOString(),
    registered_at: null as string | null,
    paid_at: null as string | null,
    stripe_session_id: sanitize(session_id || ''),
    ip_address: clientIp,
    form_field: sanitize(field || ''),
    page_url: sanitize(url || ''),
    consent_tos: false,
    consent_analytics: false,
    consent_version: '1.0',
    consent_timestamp: null as string | null,
  };

  if (existingIdx >= 0) {
    // Don't overwrite if already registered or paid — just keep existing record
    // But update form_started_at if it was a previous form start
    const existing = members[existingIdx];
    if (existing.status === 'form_started') {
      members[existingIdx] = {
        ...existing,
        form_started_at: new Date().toISOString(),
        form_field: lead.form_field,
        page_url: lead.page_url,
        ip_address: clientIp,
      };
    }
    // For registered/paid — do nothing, they already have a better record
    return res.status(200).json({ success: true, id: existing.id, existing: true });
  }

  members.push(lead);
  saveMembers(members);

  // Notify admin via all channels
  await notifyAdmin({
    type: 'form_started',
    first_name: lead.first_name || 'Unknown',
    last_name: lead.last_name || 'Lead',
    email: lead.email,
    phone: lead.phone,
    plan: lead.plan,
    field: lead.form_field,
    url: lead.page_url,
    ip: clientIp,
  });

  return res.status(200).json({ success: true, id: lead.id });
}
