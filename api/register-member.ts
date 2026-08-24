import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const text = `📋 NEW CEDEXX REGISTRATION\n👤 ${member.first_name} ${member.last_name}\n📧 ${member.email}\n📦 Plan: ${member.plan || 'N/A'}`;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
    }
  } catch (err) {
    console.error('[NOTIFY ERROR]', err);
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

  const memberId = `mbr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const member = {
    id: memberId,
    first_name: sanitize(first_name || ''),
    last_name: sanitize(last_name || ''),
    email: email.toLowerCase().trim(),
    phone: sanitize(phone || ''),
    dob: sanitize(dob || ''),
    plan: sanitize(plan || ''),
    status,
    registered_at: now,
    paid_at: status === 'paid' ? now : null,
    stripe_session_id: sanitize(req.body.stripe_session_id || ''),
    consent_tos: !!consent_tos,
    consent_analytics: !!consent_analytics,
    consent_version: sanitize(consent_version || '1.0'),
    consent_timestamp: consent_timestamp || now,
  };

  // Try Supabase first
  let savedToSupabase = false;
  if (supabase) {
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('members')
        .select('id')
        .eq('email', member.email)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('members')
          .update(member)
          .eq('id', existing.id);
        if (!error) savedToSupabase = true;
      } else {
        // Insert new
        const { error } = await supabase.from('members').insert(member);
        if (!error) savedToSupabase = true;
      }
    } catch (err) {
      console.error('[SUPABASE ERROR]', err);
    }
  }

  // Fallback to file if Supabase fails or not configured
  if (!savedToSupabase) {
    const members = loadMembers();
    const existingIdx = members.findIndex((m) => m.email === member.email);
    if (existingIdx >= 0) {
      members[existingIdx] = { ...members[existingIdx], ...member };
    } else {
      members.push(member);
    }
    saveMembers(members);
    console.log('[FALLBACK] Saved to local file');
  } else {
    console.log('[SUPABASE] Saved to database');
  }

  await sendNotifications(member);

  // Send client welcome email (fire-and-forget, don't crash on failure)
  try {
    const planName = (member.plan || '').replace('carenow', 'CareNow™').replace('carecomplete', 'CareComplete™');
    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
<tr><td style="background:#050249;padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">CEDEXX</h1>
<p style="margin:8px 0 0 0;color:#a5b4fc;font-size:13px;">Better Care. Here. Now.</p>
</td></tr>
<tr><td style="padding:40px;">
<h2 style="margin:0 0 16px 0;color:#111827;font-size:20px;font-weight:700;">What Happens Next?</h2>
<p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">Thank you for choosing CEDEXX — Better Care. Here. Now., powered by Lyric Health. Your wellness membership is being prepared for activation. Follow these simple steps to access your benefits:</p>
<ol style="margin:0 0 24px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
<li><strong>Allow 24–48 Hours for Activation</strong><br>Please allow 24–48 hours for your membership to become accessible through the Lyric Health app.</li>
<li><strong>Download the Lyric Health App</strong><br>Download the Lyric Health app on your mobile device.</li>
<li><strong>Locate Your Membership</strong><br>Open the app and select the link at the bottom right, next to "First Time User?" to locate your membership.</li>
<li><strong>Verify Your Account</strong><br>Enter your:<br>• Last Name<br>• Date of Birth<br>• ZIP Code</li>
<li><strong>Check Your Email</strong><br>Once your account is located and verified, you will receive an email with additional instructions to complete your registration and access your CEDEXX Powered by Lyric Health wellness membership.</li>
</ol>
<p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;">That's it! Once activated, you'll be ready to access your CEDEXX wellness benefits through Lyric Health.</p>
<p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;font-weight:600;">CEDEXX — Better Care. Here. Now.</p>
</td></tr>
<tr><td style="padding:0 40px 32px 40px;text-align:center;border-top:1px solid #f0f0f0;">
<p style="margin:24px 0 12px 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Healthcare services provided by</p>
<img src="https://www.cedexx.net/images/lyric-logo.webp" alt="Lyric Health" width="140" style="display:block;margin:0 auto;" />
<p style="margin:16px 0 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">Your enrollment is now complete. You're on your way to immediate access to care.<br>Please follow the instructions below for your membership access.</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;">
<p style="margin:0 0 8px 0;color:#6b7280;font-size:12px;"><a href="https://www.cedexx.net" style="color:#050249;text-decoration:none;font-weight:600;">cedexx.net</a> · <a href="https://www.cedexx.net/contact" style="color:#050249;text-decoration:none;">Support</a></p>
<p style="margin:0;color:#9ca3af;font-size:11px;">© 2026 Cedexx. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table></body></html>`;

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'CEDEXX <onboarding@resend.dev>',
      to: [member.email],
      subject: `CEDEXX — Better Care. Here. Now.`,
      html: emailHtml,
    });
    console.log('[CLIENT EMAIL] Welcome email sent to', member.email);
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
  }

  return res.status(200).json({ success: true, id: member.id, source: savedToSupabase ? 'supabase' : 'file' });
}
