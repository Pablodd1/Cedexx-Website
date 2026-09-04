import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const JASMEL_EMAIL = process.env.JASMEL_EMAIL || 'jasmelacosta@gmail.com';
const FROM_EMAIL = 'CEDEXX <support@cedexx.net>';

async function readMembers() {
  if (!GITHUB_TOKEN) return [];
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.content ? JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')).members || [] : [];
  } catch (e) {
    console.error('[FREE ENROLLMENT DB READ ERROR]', e);
    return [];
  }
}

async function writeMembers(members: any[]) {
  if (!GITHUB_TOKEN) return;
  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    let sha: string | undefined;
    let created_at = new Date().toISOString();
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
      if (fileData.content) {
        try {
          const parsed = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
          if (parsed.created_at) created_at = parsed.created_at;
        } catch (_) {}
      }
    }

    const payload = { members, created_at, version: '1.0' };
    await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update free enrollment member`,
          content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
          sha,
          branch: 'main',
        }),
      }
    );
  } catch (e) {
    console.error('[FREE ENROLLMENT DB WRITE ERROR]', e);
  }
}

async function alertCritical(error: any, context: any) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('[CRITICAL ALERT]', msg, context);
  if (RESEND_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Alerts <alerts@cedexx.net>',
        to: [JASMEL_EMAIL, ADMIN_EMAIL],
        subject: `🚨 CRITICAL ERROR — /api/free-enrollment`,
        html: `<p>Error: ${msg}</p><p>Context: ${JSON.stringify(context)}</p>`,
        text: `Error: ${msg}\nContext: ${JSON.stringify(context)}`,
      }),
    }).catch(() => {});
  }
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `🚨 <b>CRITICAL ERROR</b>\n${msg}\n📍 Endpoint: /api/free-enrollment`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }
}

// ─── FREE ENROLLMENT CODES ───
const FREE_CODES = ['WELCOME1'];

// ─── Plan Info ───
const PLAN_MAP: Record<string, string> = {
  'carenow': 'CareNow™',
  'carenow-mental': 'CareNow™ + Mental Wellness',
  'mental-wellness': 'Mental Wellness',
  'carecomplete': 'CareComplete™',
  'carecomplete-family': 'CareComplete™ Family',
};

// ─── Email Helper ───
async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!RESEND_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, text }),
    });
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
  }
}

async function sendWelcomeEmail(member: any) {
  const planName = PLAN_MAP[member.plan] || member.plan;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#050249;padding:40px 20px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:28px;">Welcome to CEDEXX</h1>
        <p style="color:#23d9b0;margin:10px 0 0;font-size:16px;">Complimentary Enrollment — Resident Housing Partner</p>
      </div>
      <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;">
        <p style="font-size:18px;margin-bottom:20px;">Hi <strong>${member.first_name}</strong>,</p>
        <p>Welcome to CEDEXX! Your complimentary membership through our Resident Housing Partnership is now active.</p>
        
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;">
          <h3 style="margin:0 0 12px 0;color:#166534;font-size:14px;font-weight:700;">✓ Your Complimentary Plan</h3>
          <p style="margin:5px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin:5px 0;"><strong>Cost:</strong> $0.00 — Covered by your housing partnership</p>
          <p style="margin:5px 0;"><strong>Status:</strong> Active</p>
        </div>

        <h3 style="margin:0 0 12px 0;color:#111827;font-size:16px;font-weight:700;">How to Access Care</h3>
        <ol style="margin:0 0 24px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
          <li>Download the <strong>Lyric Health</strong> app (App Store or Google Play)</li>
          <li>Open the app and tap "First Time User?" at the bottom right</li>
          <li>Enter your Last Name, Date of Birth, and ZIP Code</li>
          <li>Your membership will be located and activated</li>
        </ol>

        <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;color:#92400e;font-size:14px;"><strong>Note:</strong> Please allow 24-48 hours for activation. Check spam for emails from noreply@getlyric.com.</p>
        </div>

        <p style="margin-top:30px;color:#6b7280;font-size:14px;">Questions? Contact us at <a href="mailto:support@cedexx.net">support@cedexx.net</a></p>
      </div>
    </div>
  `;
  await sendEmail(member.email, `Welcome to CEDEXX — ${planName} (Complimentary)`, html, `Welcome to CEDEXX, ${member.first_name}! Your complimentary membership is active.`);
}

async function sendAdminNotification(member: any) {
  const subject = `🏠 Free Enrollment — ${member.first_name} ${member.last_name} (Welcome1)`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#166534;">🏠 Free Enrollment — Resident Housing Partner</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Name</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.first_name} ${member.last_name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Email</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Phone</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.phone || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">DOB</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.dob || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Plan</td><td style="padding:8px;border:1px solid #e5e7eb;">${PLAN_MAP[member.plan] || member.plan}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Promo Code</td><td style="padding:8px;border:1px solid #e5e7eb;">Welcome1</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Amount</td><td style="padding:8px;border:1px solid #e5e7eb;color:#166534;font-weight:600;">$0.00 — Complimentary</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Status</td><td style="padding:8px;border:1px solid #e5e7eb;">Active</td></tr>
      </table>
      <p style="margin-top:20px;"><a href="https://cedexx.net/admin.html" style="background:#050249;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">View Dashboard</a></p>
    </div>
  `;
  await sendEmail(ADMIN_EMAIL, subject, html, `Free enrollment: ${member.first_name} ${member.last_name}`);
}

// ─── Telegram ───
async function sendTelegram(member: any) {
  if (!TELEGRAM_BOT || !TELEGRAM_CHAT) return;
  const text = [
    '🏠 <b>FREE ENROLLMENT — CEDEXX</b>',
    `👤 ${member.first_name} ${member.last_name}`,
    `📧 ${member.email}`,
    member.phone ? `📞 ${member.phone}` : null,
    `📦 Plan: ${PLAN_MAP[member.plan] || member.plan}`,
    '🎟️ Promo: Welcome1',
    '💰 Amount: $0.00 (Complimentary)',
    '✅ Status: Active',
    `🕒 ${new Date().toLocaleString()}`,
  ].filter(Boolean).join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('[TELEGRAM ERROR]', err);
  }
}

// ─── Lyric Bridge ───
async function sendToLyric(member: any) {
  try {
    const res = await fetch('https://cedexx.net/api/bridge/lyric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: member.id,
        patient: {
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          email: member.email,
          phone: member.phone || '',
          dob: member.dob || '',
          plan: member.plan,
          paid_at: member.activated_at,
          stripe_customer_id: null,
          stripe_subscription_id: null,
        }
      }),
    });

    if (!res.ok) throw new Error(`Lyric bridge returned ${res.status}`);
    console.log('[FREE ENROLLMENT] Lyric bridge success');
  } catch (err: any) {
    console.error('[FREE ENROLLMENT] Lyric bridge failed:', err);
    await alertCritical(err, {
      endpoint: '/api/free-enrollment → /api/bridge/lyric',
      patientEmail: member.email,
      patientName: `${member.first_name} ${member.last_name}`,
      plan: member.plan,
    });
  }
}

// ─── MAIN HANDLER ───
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, promo_code, plan_id, first_name, last_name, phone, dob } = req.body;

  // Validate
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email required' });
  }

  const normalizedCode = (promo_code || '').toUpperCase().trim();
  
  if (!FREE_CODES.includes(normalizedCode)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid free enrollment code. This endpoint only accepts: ' + FREE_CODES.join(', ')
    });
  }

  if (!plan_id || !PLAN_MAP[plan_id]) {
    return res.status(400).json({ success: false, error: 'Valid plan required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date().toISOString();

  try {
    // Read existing members
    const members = await readMembers();
    const existing = members.find((m: any) => m.email === normalizedEmail);

    if (existing) {
      // Update existing member to active
      Object.assign(existing, {
        first_name: first_name || existing.first_name,
        last_name: last_name || existing.last_name,
        phone: phone || existing.phone,
        dob: dob || existing.dob,
        plan: plan_id,
        status: 'active',
        promo_code: normalizedCode,
        activated_at: now,
        updated_at: now,
        payment_method: 'complimentary',
      });
      await writeMembers(members);

      // Send notifications
      Promise.allSettled([
        sendWelcomeEmail(existing),
        sendAdminNotification(existing),
        sendTelegram(existing),
        sendToLyric(existing),
      ]).catch(() => {});

      return res.status(200).json({
        success: true,
        message: 'Complimentary enrollment activated',
        member_id: existing.id,
        status: 'active',
        plan: plan_id,
        amount: 0,
      });
    }

    // Create new member
    const newMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      first_name: first_name || '',
      last_name: last_name || '',
      email: normalizedEmail,
      phone: phone || '',
      dob: dob || '',
      plan: plan_id,
      status: 'active',
      promo_code: normalizedCode,
      registered_at: now,
      activated_at: now,
      updated_at: now,
      payment_method: 'complimentary',
      stripe_customer_id: null,
      stripe_subscription_id: null,
    };

    members.push(newMember);
    await writeMembers(members);

    // Send all notifications
    Promise.allSettled([
      sendWelcomeEmail(newMember),
      sendAdminNotification(newMember),
      sendTelegram(newMember),
      sendToLyric(newMember),
    ]).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Complimentary enrollment successful',
      member_id: newMember.id,
      status: 'active',
      plan: plan_id,
      amount: 0,
    });

  } catch (err: any) {
    console.error('[FREE ENROLLMENT ERROR]', err);
    await alertCritical(err, {
      endpoint: '/api/free-enrollment',
      patientEmail: normalizedEmail,
      patientName: `${first_name || ''} ${last_name || ''}`.trim(),
      plan: plan_id,
    });

    return res.status(500).json({
      success: false,
      error: 'Free enrollment failed',
      detail: err.message,
    });
  }
}
