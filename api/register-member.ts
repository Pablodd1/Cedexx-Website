import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── GitHub DB Logic (inlined to avoid Vercel bundling issues) ───
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'Pablodd1';
const REPO_NAME = 'Cedexx-Website';
const FILE_PATH = 'data/members.json';

interface MemberRecord {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  dob?: string;
  plan?: string;
  status: string;
  registered_at?: string;
  paid_at?: string | null;
  checkout_started_at?: string | null;
  checkout_expired_at?: string | null;
  payment_failed_at?: string | null;
  stripe_session_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  consent_tos?: boolean;
  consent_analytics?: boolean;
  consent_version?: string;
  consent_timestamp?: string;
  form_started_at?: string;
  form_field?: string;
  page_url?: string;
  ip_address?: string;
  updated_at?: string;
}

async function getFileSha(): Promise<{ sha: string; content: any } | null> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=main`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GitHub GET failed: ${res.status}`);
  }
  const data = await res.json();
  const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  return { sha: data.sha, content: decoded };
}

async function readMembers(): Promise<MemberRecord[]> {
  const file = await getFileSha();
  if (!file) return [];
  return file.content.members || [];
}

async function writeMembers(members: MemberRecord[]): Promise<void> {
  const file = await getFileSha();
  const sha = file?.sha;
  const existing = file?.content?.members || [];

  const byId = new Map(existing.map((m: MemberRecord) => [m.id, m]));
  for (const m of members) {
    byId.set(m.id, { ...(byId.get(m.id) || {}), ...m, updated_at: new Date().toISOString() });
  }
  const merged = Array.from(byId.values());

  const payload = {
    members: merged,
    created_at: file?.content?.created_at || new Date().toISOString(),
    version: '1.0',
  };

  const body = {
    message: `Update members DB — ${members.length} change(s)`,
    content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
    sha,
    branch: 'main',
  };

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub PUT failed: ${res.status} — ${err.message || ''}`);
  }
}

async function addMember(member: MemberRecord): Promise<void> {
  const members = await readMembers();
  const existing = members.find((m) => m.id === member.id);
  if (existing) {
    Object.assign(existing, member, { updated_at: new Date().toISOString() });
  } else {
    members.push({ ...member, updated_at: new Date().toISOString() });
  }
  await writeMembers(members);
}

async function updateMember(id: string, updates: Partial<MemberRecord>): Promise<void> {
  const members = await readMembers();
  const m = members.find((x) => x.id === id);
  if (!m) throw new Error(`Member ${id} not found`);
  Object.assign(m, updates, { updated_at: new Date().toISOString() });
  await writeMembers(members);
}

// ─── Main Handler ───
function sanitize(s: string) {
  return (s || '').replace(/[<>]/g, '').trim().substring(0, 200);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { first_name, last_name, email, phone, dob, plan, status = 'registered',
          consent_analytics, consent_tos, consent_version, consent_timestamp,
          stripe_session_id, is_checkout } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date().toISOString();

  try {
    const members = await readMembers();
    const existingMember = members.find((m) => m.email === normalizedEmail);

    if (existingMember) {
      const updates: any = { updated_at: now };
      if (is_checkout) {
        updates.status = 'checkout_started';
        updates.checkout_started_at = now;
        updates.stripe_session_id = stripe_session_id || existingMember.stripe_session_id;
      } else {
        if (first_name) updates.first_name = sanitize(first_name);
        if (last_name) updates.last_name = sanitize(last_name);
        if (phone) updates.phone = sanitize(phone);
        if (dob) updates.dob = dob;
        if (plan) updates.plan = plan;
        if (status) updates.status = status;
        if (consent_tos !== undefined) updates.consent_tos = consent_tos;
        if (consent_analytics !== undefined) updates.consent_analytics = consent_analytics;
        if (consent_version) updates.consent_version = consent_version;
        if (consent_timestamp) updates.consent_timestamp = consent_timestamp;
      }
      await updateMember(existingMember.id, updates);
      return res.status(200).json({
        success: true, message: 'Member updated', member_id: existingMember.id,
        status: updates.status || existingMember.status,
      });
    }

    const newMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      first_name: first_name ? sanitize(first_name) : '',
      last_name: last_name ? sanitize(last_name) : '',
      email: normalizedEmail,
      phone: phone ? sanitize(phone) : '',
      dob: dob || '', plan: plan || '',
      status: is_checkout ? 'checkout_started' : (status || 'registered'),
      registered_at: now,
      checkout_started_at: is_checkout ? now : null,
      stripe_session_id: stripe_session_id || null,
      consent_tos: consent_tos || false,
      consent_analytics: consent_analytics || false,
      consent_version: consent_version || '1.0',
      consent_timestamp: consent_timestamp || now,
    };

    await addMember(newMember);

    return res.status(200).json({
      success: true, message: is_checkout ? 'Checkout started' : 'Member registered',
      member_id: newMember.id, status: newMember.status,
    });

  } catch (err: any) {
    console.error('[REGISTER ERROR]', err);
    return res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
}
