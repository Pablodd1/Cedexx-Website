import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendCustomerEnrollmentEmails, getAdminEmails } from './client-email.js';
import { readMembers, writeMembers } from './github-db.js';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const JASMEL_EMAIL = process.env.JASMEL_EMAIL || 'jasmelacosta@gmail.com';
const FROM_EMAIL = 'CEDEXX <support@cedexx.net>';

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
        subject: `🚨 CRITICAL ERROR — ${context.endpoint || '/api/register-member'}`,
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
        text: `🚨 <b>CRITICAL ERROR</b>\n${msg}\n📍 Endpoint: ${context.endpoint || '/api/register-member'}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }
}

// ─── EMAIL (Resend API) ───
async function sendResendEmail(to: string | string[], subject: string, html: string, text: string, cc?: string | string[]) {
  if (!RESEND_KEY) {
    console.log('[EMAIL] No RESEND_API_KEY configured');
    return;
  }
  const toList = Array.isArray(to) ? to : [to];
  const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : undefined;
  try {
    const body: any = {
      from: FROM_EMAIL,
      to: toList,
      subject,
      html,
      text,
    };
    if (ccList) body.cc = ccList;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[RESEND ERROR]', res.status, err);
    } else {
      console.log('[EMAIL] Sent to', toList, ccList ? `CC: ${ccList}` : '');
    }
  } catch (err) {
    console.error('[RESEND ERROR]', err);
  }
}

const PLAN_NAMES: Record<string, string> = {
  'carenow': 'CareNow™ ($18.99/mo — Up to 7 Family Members)',
  'carenow-mental': 'CareNow™ + Mental Wellness ($26.99/mo — Best Value)',
  'mental-wellness': 'Mental Wellness ($18.99/mo)',
  'carecomplete': 'CareComplete™ ($34.99/mo)',
  'carecomplete-family': 'CareComplete™ Family ($52.99/mo — Up to 7 Family Members)',
};

function buildResumeUrl(member: any): string {
  const params = new URLSearchParams();
  params.set('fast', '1');
  if (member.plan) params.set('plan', member.plan);
  if (member.email) params.set('email', member.email);
  if (member.first_name) params.set('first_name', member.first_name);
  if (member.last_name) params.set('last_name', member.last_name);
  if (member.zipcode) params.set('zipcode', member.zipcode);
  return `https://www.cedexx.net/enroll?${params.toString()}`;
}

async function sendCheckoutStartedEmail(member: any) {
  const planDisplay = PLAN_NAMES[member.plan] || 'CareNow™ ($18.99/mo)';
  const resumeUrl = buildResumeUrl(member);
  const subject = `Finish Activating Your CEDEXX ${planDisplay.split(' (')[0]} Membership`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#050249;padding:36px 24px;text-align:center;">
        <span style="display:inline-block;background:rgba(35,217,176,0.18);color:#23d9b0;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:8px;">
          Step 2 of 2 · Complete Payment
        </span>
        <h1 style="color:#fff;margin:0;font-size:23px;font-weight:900;">Your CEDEXX Plan Is Reserved</h1>
      </div>
      <div style="padding:32px;background:#fff;">
        <p style="font-size:16px;color:#0f172a;margin:0 0 14px 0;">Hi <strong>${member.first_name || 'there'}</strong>,</p>
        <p style="font-size:15px;line-height:1.65;color:#334155;margin:0 0 18px 0;">
          We saved your enrollment details for <strong>${planDisplay}</strong> (powered by Lyric Health). Complete your secure checkout below to activate 24/7 virtual doctor visits with <strong>$0 visit fees and $0 copays</strong>:
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin:20px 0;text-align:center;">
          <p style="margin:0;font-size:16px;font-weight:800;color:#166534;">✓ ${planDisplay} Reserved</p>
          <p style="margin:6px 0 16px 0;font-size:13px;color:#374151;">No insurance required • Cancel anytime with $0 fees</p>
          <a href="${resumeUrl}" style="display:inline-block;background:#050249;color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;padding:14px 28px;border-radius:10px;">
            Resume &amp; Complete Enrollment &rarr;
          </a>
        </div>
        <p style="margin-top:20px;color:#64748b;font-size:13px;line-height:1.6;">
          Have a question before joining? Reply directly to this email or call our support desk at <strong>(754) 432-2201</strong> (<a href="mailto:support@cedexx.net" style="color:#050249;font-weight:700;">support@cedexx.net</a>).
        </p>
      </div>
    </div>
  `;
  await sendResendEmail(
    member.email,
    subject,
    html,
    `Hi ${member.first_name || 'there'}, your CEDEXX plan (${planDisplay}) is reserved. Complete your enrollment here: ${resumeUrl}`
  );
}

/**
 * Schedules a 15-minute delayed abandoned-checkout recovery email from Daisy Gonzalez via Resend's scheduled_at parameter.
 * Returns the Resend email ID so we can automatically cancel it in Stripe webhook/verify-session if the user pays within 15 minutes!
 */
async function schedule15MinAbandonedRecoveryEmail(member: any): Promise<string | null> {
  if (!RESEND_KEY || !member.email) return null;
  // Don't schedule if already paid or if we already scheduled one for this member
  if (member.status === 'paid' || member.abandoned_recovery_email_id) return member.abandoned_recovery_email_id || null;

  const planDisplay = PLAN_NAMES[member.plan] || 'CareNow™ ($18.99/mo — Up to 7 Family Members)';
  const resumeUrl = buildResumeUrl(member);
  const scheduledAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes from now

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#050249;padding:26px 30px;">
        <span style="display:inline-block;background:rgba(35,217,176,0.18);color:#23d9b0;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:6px;">
          Quick Check-In · CEDEXX Member Support
        </span>
        <h2 style="margin:0;color:#ffffff;font-size:20px;font-weight:900;">Did you have a question about your CEDEXX plan?</h2>
      </div>
      <div style="padding:30px;color:#334155;font-size:15px;line-height:1.68;">
        <p style="margin:0 0 14px 0;">Hi <strong>${member.first_name || 'there'}</strong>,</p>
        <p style="margin:0 0 14px 0;">
          I noticed you started setting up your <strong>${planDisplay}</strong> membership on CEDEXX a few minutes ago, but didn’t finish the final checkout step.
        </p>
        <p style="margin:0 0 16px 0;">
          Because Lyric Health takes <strong>24 to 48 hours to provision your family's account</strong> after you enroll, finishing your setup today ensures your 24/7 doctors, pediatric care, and prescription benefits are already active before someone wakes up sick.
        </p>
        <div style="background:#f8fafc;border-left:4px solid #23d9b0;padding:14px 18px;border-radius:0 10px 10px 0;margin:18px 0;">
          <p style="margin:0 0 6px 0;font-size:13px;color:#050249;"><strong>✓ $0 Visit Fees &amp; $0 Co-Pays:</strong> Unlimited 24/7 virtual consultations.</p>
          <p style="margin:0 0 6px 0;font-size:13px;color:#050249;"><strong>✓ No Contracts or Cancellation Fees:</strong> Stay only as long as your household loves the care.</p>
          <p style="margin:0;font-size:13px;color:#050249;"><strong>✓ Direct Fast-Track Link:</strong> We pre-filled your information so you can finish in 60 seconds.</p>
        </div>
        <div style="margin:24px 0;text-align:left;">
          <a href="${resumeUrl}" style="display:inline-block;background:#050249;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:14px 26px;border-radius:12px;">
            Resume Your Enrollment Here &rarr;
          </a>
        </div>
        <p style="margin:18px 0 0 0;font-size:14px;color:#475569;">
          If you ran into any issue with the checkout page or want help choosing between plans, just reply directly to this email or call us at <strong>(754) 432-2201</strong>.<br/><br/>
          With intention &amp; care,<br/>
          <strong>Daisy Gonzalez</strong><br/>
          <span style="font-size:12px;color:#64748b;">Founder &amp; CEO, CEDEXX | daisy@cedexx.net</span>
        </p>
      </div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'Daisy Gonzalez — CEDEXX <daisy@cedexx.net>',
        to: [member.email],
        reply_to: 'daisy@cedexx.net',
        subject: `${member.first_name ? member.first_name + ', did' : 'Did'} you have a question about your CEDEXX plan?`,
        scheduled_at: scheduledAt,
        html,
        text: `Hi ${member.first_name || 'there'}, I noticed you started setting up your ${planDisplay} membership on CEDEXX a few minutes ago. You can resume your enrollment in 60 seconds here: ${resumeUrl} — Or reply to this email / call (754) 432-2201 if you have any questions! - Daisy Gonzalez, Founder & CEO, CEDEXX`,
      }),
    });
    if (res.ok) {
      const data: any = await res.json().catch(() => ({}));
      console.log('[15-MIN RECOVERY SCHEDULED]', member.email, 'for', scheduledAt, 'id:', data.id);
      return data.id || null;
    }
  } catch (err) {
    console.warn('[15-MIN RECOVERY SCHEDULE WARN]', err);
  }
  return null;
}

async function sendAdminNotification(member: any, type: 'registration' | 'checkout') {
  const subject = type === 'checkout' 
    ? `💳 Checkout Started — ${member.first_name} ${member.last_name}`
    : `📋 New CEDEXX Registration — ${member.first_name} ${member.last_name}`;
  
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#7B2FF7;">${type === 'checkout' ? 'Checkout Started' : 'New Registration'}</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Name</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.first_name} ${member.last_name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Email</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Phone</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.phone || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">DOB</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.dob || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Plan</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.plan || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Status</td><td style="padding:8px;border:1px solid #e5e7eb;">${member.status}</td></tr>
      </table>
      <p style="margin-top:20px;"><a href="https://cedexx.net/admin.html" style="background:#7B2FF7;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">View Dashboard</a></p>
    </div>
  `;
  // Send to ALL admins as TO (not CC) so reply-all includes everyone
  const adminEmails = getAdminEmails();
  await sendResendEmail(adminEmails, subject, html, `New ${type}: ${member.first_name} ${member.last_name}`);
}

// ─── TELEGRAM ───
async function sendTelegramNotification(member: any, type: 'registration' | 'checkout') {
  if (!TELEGRAM_BOT || !TELEGRAM_CHAT) return;
  
  const maskedName = `${(member.first_name || '').charAt(0)}. ${(member.last_name || '').charAt(0)}.`;
  const maskedEmail = member.email ? `${member.email.charAt(0)}***@${member.email.split('@')[1] || '***'}` : '***';
  const phoneDigits = (member.phone || '').replace(/\D/g, '');
  const maskedPhone = phoneDigits.length >= 4 ? `***-***-${phoneDigits.slice(-4)}` : null;

  const text = [
    type === 'checkout' ? '💳 <b>CHECKOUT STARTED</b> — CEDEXX' : '📋 <b>NEW REGISTRATION</b> — CEDEXX',
    `👤 Member: <code>${maskedName}</code>`,
    `📧 Contact: <code>${maskedEmail}</code>`,
    maskedPhone ? `📞 Phone: <code>${maskedPhone}</code>` : null,
    member.plan ? `📦 Plan: ${member.plan}` : null,
    '🔒 Protected in Admin Dashboard',
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

  const { 
    first_name, last_name, email, phone, dob, plan,
    address, city, state, zipcode,
    status = 'registered',
    consent_analytics, consent_tos, consent_version, consent_timestamp,
    stripe_session_id, is_checkout, ad_attribution
  } = req.body;

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
      
      // Always update member contact & plan details
      if (plan) updates.plan = sanitize(plan);
      if (first_name) updates.first_name = sanitize(first_name);
      if (last_name) updates.last_name = sanitize(last_name);
      if (phone) {
        updates.phone = sanitize(phone);
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length === 10) existing.id = cleanPhone;
      }
      if (dob) updates.dob = dob;
      if (address) updates.address = sanitize(address);
      if (city) updates.city = sanitize(city);
      if (state) updates.state = sanitize(state).toUpperCase();
      if (zipcode) updates.zipcode = sanitize(zipcode);
      if (ad_attribution && typeof ad_attribution === 'object' && Object.keys(ad_attribution).length > 0) {
        updates.ad_attribution = { ...(existing.ad_attribution || {}), ...ad_attribution };
      }

      if (is_checkout) {
        if (existing.status !== 'paid') {
          updates.status = 'checkout_started';
        }
        updates.checkout_started_at = now;
        updates.stripe_session_id = stripe_session_id || existing.stripe_session_id;
      } else {
        if (status && existing.status !== 'paid') updates.status = status;
        if (consent_tos !== undefined) updates.consent_tos = consent_tos;
        if (consent_analytics !== undefined) updates.consent_analytics = consent_analytics;
        if (consent_version) updates.consent_version = consent_version;
        if (consent_timestamp) updates.consent_timestamp = consent_timestamp;
      }
      
      Object.assign(existing, updates);

      // Schedule 15-minute abandoned checkout recovery if not already paid and not already scheduled
      if (existing.status !== 'paid' && !existing.abandoned_recovery_email_id) {
        const scheduledId = await schedule15MinAbandonedRecoveryEmail(existing);
        if (scheduledId) {
          existing.abandoned_recovery_email_id = scheduledId;
          existing.abandoned_recovery_scheduled_at = now;
        }
      }

      await writeMembers(members);

      // Send checkout notification if applicable
      if (is_checkout) {
        await Promise.allSettled([
          sendCheckoutStartedEmail(existing),
          sendAdminNotification(existing, 'checkout'),
          sendTelegramNotification(existing, 'checkout'),
        ]);
      }

      return res.status(200).json({
        success: true,
        message: is_checkout ? 'Checkout started' : 'Member updated',
        member_id: existing.id,
        status: updates.status || existing.status,
      });
    }

    // Create new member with phone-based Member ID
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const memberId = (cleanPhone.length === 10)
      ? cleanPhone
      : `mem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newMember: any = {
      id: memberId,
      first_name: first_name ? sanitize(first_name) : '',
      last_name: last_name ? sanitize(last_name) : '',
      email: normalizedEmail,
      phone: phone ? sanitize(phone) : '',
      dob: dob || '',
      address: address ? sanitize(address) : '',
      city: city ? sanitize(city) : '',
      state: state ? sanitize(state).toUpperCase() : '',
      zipcode: zipcode ? sanitize(zipcode) : '',
      plan: plan || 'carenow',
      status: is_checkout ? 'checkout_started' : (status || 'registered'),
      registered_at: now,
      checkout_started_at: is_checkout ? now : null,
      stripe_session_id: stripe_session_id || null,
      consent_tos: consent_tos || false,
      consent_analytics: consent_analytics || false,
      consent_version: consent_version || '1.0',
      consent_timestamp: consent_timestamp || now,
      ...(ad_attribution && typeof ad_attribution === 'object' && Object.keys(ad_attribution).length > 0
        ? { ad_attribution }
        : {}),
    };

    // Schedule 15-minute abandoned checkout recovery email via Resend
    const scheduledId = await schedule15MinAbandonedRecoveryEmail(newMember);
    if (scheduledId) {
      newMember.abandoned_recovery_email_id = scheduledId;
      newMember.abandoned_recovery_scheduled_at = now;
    }

    members.push(newMember);
    await writeMembers(members);

    // Send notifications (await so serverless function doesn't terminate early)
    const notificationType = is_checkout ? 'checkout' : 'registration';
    await Promise.allSettled([
      is_checkout ? sendCheckoutStartedEmail(newMember) : Promise.resolve(),
      sendAdminNotification(newMember, notificationType),
      sendTelegramNotification(newMember, notificationType),
    ]);

    return res.status(200).json({
      success: true,
      message: is_checkout ? 'Checkout started' : 'Member registered',
      member_id: newMember.id,
      status: newMember.status,
    });

  } catch (err: any) {
    console.error('[REGISTER ERROR]', err);

    // CRITICAL: Alert Jasmel immediately
    await alertCritical(err, {
      endpoint: '/api/register-member',
      patientEmail: normalizedEmail,
      patientName: `${first_name || ''} ${last_name || ''}`.trim(),
      plan: plan,
    });

    return res.status(500).json({ 
      error: 'Registration failed', 
      detail: err.message,
      alert_sent: true,
    });
  }
}
