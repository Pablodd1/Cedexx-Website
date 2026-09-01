import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── CONFIG ───
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const FROM_EMAIL = 'CEDEXX <support@cedexx.net>';

// ─── GITHUB DB ───
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

// ─── EMAIL (Resend API) ───
async function sendResendEmail(to: string, subject: string, html: string, text: string) {
  if (!RESEND_KEY) {
    console.log('[EMAIL] No RESEND_API_KEY configured');
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[RESEND ERROR]', res.status, err);
    } else {
      console.log('[EMAIL] Sent to', to);
    }
  } catch (err) {
    console.error('[RESEND ERROR]', err);
  }
}

async function sendWelcomeEmail(member: any) {
  const subject = 'Welcome to CEDEXX — Your Health, Simplified';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e;">
      <div style="background:linear-gradient(135deg,#00D4FF,#7B2FF7);padding:40px 20px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:28px;">Welcome to CEDEXX</h1>
        <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Your Health, Simplified</p>
      </div>
      <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <p style="font-size:18px;margin-bottom:20px;">Hi <strong>${member.first_name}</strong>,</p>
        <p>Welcome to CEDEXX! You've taken the first step toward better health.</p>
        <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="margin:0 0 10px;font-weight:600;">Your Registration Details:</p>
          <p style="margin:5px 0;"><strong>Name:</strong> ${member.first_name} ${member.last_name}</p>
          <p style="margin:5px 0;"><strong>Email:</strong> ${member.email}</p>
          <p style="margin:5px 0;"><strong>Plan:</strong> ${member.plan || 'CareNow™'}</p>
        </div>
        <p>You'll receive another email when your account is fully activated.</p>
        <p style="margin-top:30px;color:#6b7280;font-size:14px;">Questions? Reply to this email or contact us at <a href="mailto:support@cedexx.net">support@cedexx.net</a></p>
      </div>
    </div>
  `;
  const text = `Welcome to CEDEXX, ${member.first_name}!\n\nYour registration is confirmed.\nName: ${member.first_name} ${member.last_name}\nEmail: ${member.email}\nPlan: ${member.plan || 'CareNow™'}\n\nYou'll receive another email when your account is fully activated.`;
  await sendResendEmail(member.email, subject, html, text);
}

async function sendAdminNotification(member: any) {
  const subject = `📋 New CEDEXX Registration — ${member.first_name} ${member.last_name}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#7B2FF7;">New Patient Registration</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Name</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.first_name} ${member.last_name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Email</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Phone</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.phone || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">DOB</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.dob || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Plan</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.plan || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Status</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.status}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Time</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.registered_at}</td></tr>
      </table>
      <p style="margin-top:20px;"><a href="https://cedexx.net/admin.html" style="background:#7B2FF7;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">View Dashboard</a></p>
    </div>
  `;
  const text = `New CEDEXX Registration:\n\nName: ${member.first_name} ${member.last_name}\nEmail: ${member.email}\nPhone: ${member.phone || '—'}\nPlan: ${member.plan || '—'}\nStatus: ${member.status}\nTime: ${member.registered_at}`;
  await sendResendEmail(ADMIN_EMAIL, subject, html, text);
}

// ─── TELEGRAM ───
async function sendTelegramNotification(member: any) {
  if (!TELEGRAM_BOT || !TELEGRAM_CHAT) return;
  const text = [
    '📋 <b>NEW REGISTRATION</b> — CEDEXX',
    `👤 ${member.first_name} ${member.last_name}`,
    `📧 ${member.email}`,
    member.phone ? `📞 ${member.phone}` : null,
    member.plan ? `📦 Plan: ${member.plan}` : null,
    `🕒 ${new Date().toLocaleString()}`,
  ].filter(Boolean).join('\n');

  try {
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
    console.error('[TELEGRAM ERROR]', err);
  }
}

// ─── UTILS ───
function sanitize(s: string) {
  return (s || '').replace(/[<>]/g, '').trim().substring(0, 200);
}

// ─── MAIN HANDLER ───
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

    // Send notifications (fire-and-forget)
    Promise.allSettled([
      sendWelcomeEmail(newMember),
      sendAdminNotification(newMember),
      sendTelegramNotification(newMember),
    ]).catch(() => {});

    return res.status(200).json({
      success: true, message: is_checkout ? 'Checkout started' : 'Member registered',
      member_id: newMember.id, status: newMember.status,
    });

  } catch (err: any) {
    console.error('[REGISTER ERROR]', err);
    return res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
}
