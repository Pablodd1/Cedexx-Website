import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';

async function readMembers() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`GitHub read failed: ${res.status}`);
  }
  const data = await res.json();
  return data.content ? JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')).members || [] : [];
}

async function writeMembers(members: any[]) {
  // Get current SHA
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!getRes.ok) throw new Error(`GitHub read for SHA failed: ${getRes.status}`);
  const fileData = await getRes.json();
  const sha = fileData.sha;

  const payload = {
    members,
    created_at: fileData.content ? JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8')).created_at : new Date().toISOString(),
    version: '1.0',
  };

  const putRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update members DB`,
        content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
        sha,
        branch: 'main',
      }),
    }
  );
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(`GitHub write failed: ${putRes.status} — ${err.message || ''}`);
  }
}

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
    const existing = members.find((m: any) => m.email === normalizedEmail);

    if (existing) {
      const updates: any = { updated_at: now };
      if (is_checkout) {
        updates.status = 'checkout_started';
        updates.checkout_started_at = now;
        updates.stripe_session_id = stripe_session_id || existing.stripe_session_id;
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
      Object.assign(existing, updates);
      await writeMembers(members);
      return res.status(200).json({
        success: true, message: 'Member updated', member_id: existing.id,
        status: updates.status || existing.status,
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

    members.push(newMember);
    await writeMembers(members);

    return res.status(200).json({
      success: true, message: is_checkout ? 'Checkout started' : 'Member registered',
      member_id: newMember.id, status: newMember.status,
    });

  } catch (err: any) {
    console.error('[REGISTER ERROR]', err);
    return res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
}
