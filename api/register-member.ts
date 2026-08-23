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
    const { sendWelcomeEmail } = await import('./lib/client-email');
    await sendWelcomeEmail({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      plan: member.plan,
    });
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
  }

  return res.status(200).json({ success: true, id: member.id, source: savedToSupabase ? 'supabase' : 'file' });
}
