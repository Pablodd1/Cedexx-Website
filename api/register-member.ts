import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail, sendAdminNotification } from './lib/client-email';

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

async function sendNotifications(member: any, isCheckout = false) {
  const type = isCheckout ? 'checkout_started' : 'registration';
  const subject = isCheckout ? '💳 CHECKOUT STARTED' : '📋 NEW REGISTRATION';
  
  // Email to admin
  await Promise.allSettled([
    sendAdminNotification({
      type,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      plan: member.plan,
      stripe_session_id: member.stripe_session_id,
    }),
    // Telegram notification
    (async () => {
      try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (token && chatId) {
          const lines = [
            `${subject} — CEDEXX`,
            `👤 ${member.first_name} ${member.last_name}`,
            `📧 ${member.email}`,
            member.phone ? `📞 ${member.phone}` : null,
            `📦 Plan: ${member.plan || 'N/A'}`,
            member.stripe_session_id ? `🆔 Stripe Session: ${member.stripe_session_id}` : null,
            `⏳ Status: ${member.status}`,
            `🕒 ${new Date().toLocaleString()}`,
          ].filter(Boolean);
          
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'HTML' }),
          });
        }
      } catch (err) {
        console.error('[TELEGRAM ERROR]', err);
      }
    })(),
  ]);
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

  // Try to find existing member first
  let existingMember: any = null;
  let existingSource: 'supabase' | 'file' | null = null;

  if (supabase) {
    try {
      const { data } = await supabase.from('members').select('*').eq('email', normalizedEmail).single();
      if (data) {
        existingMember = data;
        existingSource = 'supabase';
      }
    } catch (_) {}
  }

  if (!existingMember) {
    const members = loadMembers();
    const idx = members.findIndex((m) => m.email === normalizedEmail);
    if (idx >= 0) {
      existingMember = members[idx];
      existingSource = 'file';
    }
  }

  // Build update payload
  const updatePayload: any = {
    first_name: sanitize(first_name || existingMember?.first_name || ''),
    last_name: sanitize(last_name || existingMember?.last_name || ''),
    email: normalizedEmail,
    phone: sanitize(phone || existingMember?.phone || ''),
    dob: sanitize(dob || existingMember?.dob || ''),
    plan: sanitize(plan || existingMember?.plan || ''),
    status: status || existingMember?.status || 'registered',
    updated_at: now,
  };

  if (stripe_session_id) {
    updatePayload.stripe_session_id = sanitize(stripe_session_id);
  }
  if (consent_tos !== undefined) {
    updatePayload.consent_tos = !!consent_tos;
    updatePayload.consent_version = sanitize(consent_version || '2.0');
    updatePayload.consent_timestamp = consent_timestamp || now;
  }
  if (consent_analytics !== undefined) {
    updatePayload.consent_analytics = !!consent_analytics;
  }

  // If this is a checkout update (user clicked "Complete Enrollment")
  if (is_checkout) {
    updatePayload.status = 'checkout_started';
    updatePayload.checkout_started_at = now;
  } else if (!existingMember) {
    // New registration from step 1
    updatePayload.id = `mbr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    updatePayload.registered_at = now;
    updatePayload.paid_at = null;
  }

  let savedToSupabase = false;

  // Upsert to Supabase
  if (supabase) {
    try {
      if (existingMember?.id) {
        const { error } = await supabase.from('members').update(updatePayload).eq('id', existingMember.id);
        if (!error) savedToSupabase = true;
      } else {
        const { error } = await supabase.from('members').insert(updatePayload);
        if (!error) savedToSupabase = true;
      }
    } catch (err) {
      console.error('[SUPABASE ERROR]', err);
    }
  }

  // Fallback to file
  if (!savedToSupabase) {
    const members = loadMembers();
    if (existingMember) {
      const idx = members.findIndex((m) => m.email === normalizedEmail);
      if (idx >= 0) {
        members[idx] = { ...members[idx], ...updatePayload };
      }
    } else {
      members.push(updatePayload);
    }
    saveMembers(members);
    console.log('[FALLBACK] Saved to local file (WARNING: /tmp is ephemeral on Vercel)');
  } else {
    console.log('[SUPABASE] Saved to database');
  }

  // Send notifications
  await sendNotifications(updatePayload, is_checkout);

  // Send welcome email only on initial registration (not checkout update)
  if (!is_checkout && !existingMember) {
    try {
      await sendWelcomeEmail({
        first_name: updatePayload.first_name,
        last_name: updatePayload.last_name,
        email: updatePayload.email,
        plan: updatePayload.plan,
      });
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send welcome email:', err);
    }
  }

  return res.status(200).json({ 
    success: true, 
    id: updatePayload.id || existingMember?.id, 
    source: savedToSupabase ? 'supabase' : 'file',
    status: updatePayload.status,
  });
}
