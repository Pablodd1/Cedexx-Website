import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/bridge/lyric
 * Bridge to send paid patient data to Lyric Health
 * 
 * Triggers:
 * - Called from webhook/stripe.ts on payment success
 * - Can be called manually from dashboard
 * 
 * Sends:
 * - Formatted enrollment data via email (immediate)
 * - API call (when Lyric provides endpoint)
 * - Logs sync status to GitHub DB
 */

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const LYRIC_EMAIL = process.env.LYRIC_ENROLLMENT_EMAIL || 'enrollment@getlyric.com';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';

interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  plan: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  gender?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  paid_at: string;
}

// ─── Read/Write Members (shared logic) ───
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
        message: `Lyric sync: ${new Date().toISOString()}`,
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

// ─── Main Handler ───
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { patient_id, patient, dry_run } = req.body;

  // Support both passing patient data directly or looking up by ID
  let patientData: PatientData | null = patient || null;

  if (!patientData && patient_id) {
    try {
      const members = await readMembers();
      const member = members.find((m: any) => m.id === patient_id || m.email === patient_id);
      if (member) {
        patientData = {
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          email: member.email,
          phone: member.phone || '',
          dob: member.dob || '',
          plan: member.plan || '',
          address: member.address || '',
          city: member.city || '',
          state: member.state || '',
          zipcode: member.zipcode || '',
          gender: member.gender || '',
          stripe_customer_id: member.stripe_customer_id || '',
          stripe_subscription_id: member.stripe_subscription_id || '',
          paid_at: member.paid_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('[LYRIC BRIDGE] Lookup error:', err);
    }
  }

  if (!patientData) {
    return res.status(400).json({ error: 'Patient data or patient_id required' });
  }

  // Validate required fields
  const required = ['first_name', 'last_name', 'email', 'phone', 'dob', 'plan'];
  const missing = required.filter(f => !patientData![f as keyof PatientData]);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  // ─── DRY RUN: Just return what would be sent ───
  if (dry_run) {
    return res.status(200).json({
      success: true,
      dry_run: true,
      patient: patientData,
      email_preview: buildLyricEmail(patientData),
      api_payload: buildApiPayload(patientData),
    });
  }

  // ─── SYNC TO LYRIC ───
  const results: any = { email: null, api: null };

  try {
    // 1. Send enrollment email to Lyric
    if (RESEND_KEY) {
      results.email = await sendLyricEnrollmentEmail(patientData);
    }

    // 2. Call Lyric API (when available)
    // const apiResult = await callLyricApi(patientData);
    // results.api = apiResult;

    // 3. Update member record with sync status
    await updateMemberSyncStatus(patientData.id, {
      lyric_synced: true,
      lyric_synced_at: new Date().toISOString(),
      lyric_sync_method: 'email',
      lyric_sync_attempts: 1,
    });

    // 4. Notify admin
    await notifyAdminOfLyricSync(patientData, results);

    res.status(200).json({
      success: true,
      message: 'Patient data sent to Lyric Health',
      patient_id: patientData.id,
      sync_results: results,
    });

  } catch (err: any) {
    console.error('[LYRIC BRIDGE ERROR]', err);

    // Update member with failed status
    await updateMemberSyncStatus(patientData.id, {
      lyric_synced: false,
      lyric_sync_error: err.message,
      lyric_sync_attempts: (patientData as any).lyric_sync_attempts || 0 + 1,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to sync with Lyric Health',
      detail: err.message,
    });
  }
}

// ─── Build Lyric Enrollment Email ───
function buildLyricEmail(patient: PatientData): string {
  const planMap: Record<string, string> = {
    'carenow': 'CareNow™',
    'carenow-mental': 'CareNow™ + Mental Wellness',
    'mental-wellness': 'Mental Wellness',
    'carecomplete': 'CareComplete™',
    'carecomplete-family': 'CareComplete™ Family',
  };

  return `
NEW CEDEXX ENROLLMENT — ACTION REQUIRED

Patient Information:
-------------------
Name: ${patient.first_name} ${patient.last_name}
Email: ${patient.email}
Phone: ${patient.phone}
Date of Birth: ${patient.dob}
Gender: ${patient.gender || 'Not provided'}

Address:
${patient.address || 'Not provided'}
${patient.city || ''}, ${patient.state || ''} ${patient.zipcode || ''}

Plan: ${planMap[patient.plan] || patient.plan}
Enrollment Date: ${new Date(patient.paid_at).toLocaleString()}

Stripe Information:
Customer ID: ${patient.stripe_customer_id || 'N/A'}
Subscription ID: ${patient.stripe_subscription_id || 'N/A'}

Please activate this membership within 24-48 hours.
Contact CEDEXX at support@cedexx.net if you have questions.

---
Sent automatically from CEDEXX Enrollment System
  `.trim();
}

// ─── Send Email to Lyric ───
async function sendLyricEnrollmentEmail(patient: PatientData) {
  if (!RESEND_KEY) {
    return { sent: false, error: 'No Resend API key' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Enrollments <enrollments@cedexx.net>',
        to: [LYRIC_EMAIL, ADMIN_EMAIL],
        subject: `NEW ENROLLMENT: ${patient.first_name} ${patient.last_name} — ${patient.plan}`,
        text: buildLyricEmail(patient),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;">
            <h2 style="color:#050249;">New CEDEXX Enrollment</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.first_name} ${patient.last_name}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.email}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.phone}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">DOB</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.dob}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Plan</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.plan}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Stripe Customer</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.stripe_customer_id || 'N/A'}</td></tr>
            </table>
            <p style="margin-top:20px;color:#666;font-size:13px;">Please activate within 24-48 hours.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { sent: false, error: err.message || `HTTP ${res.status}` };
    }

    return { sent: true, timestamp: new Date().toISOString() };

  } catch (err: any) {
    return { sent: false, error: err.message };
  }
}

// ─── Build API Payload (for when Lyric has an API) ───
function buildApiPayload(patient: PatientData) {
  return {
    source: 'cedexx',
    enrollment_type: 'direct',
    patient: {
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.dob,
      gender: patient.gender,
      address: {
        street: patient.address,
        city: patient.city,
        state: patient.state,
        zip: patient.zipcode,
      },
    },
    plan: {
      name: patient.plan,
      stripe_customer_id: patient.stripe_customer_id,
      stripe_subscription_id: patient.stripe_subscription_id,
      activated_at: patient.paid_at,
    },
    metadata: {
      sent_at: new Date().toISOString(),
      source_url: 'https://cedexx.net',
    },
  };
}

// ─── Update Member Sync Status ───
async function updateMemberSyncStatus(memberId: string, syncData: any) {
  try {
    const members = await readMembers();
    const member = members.find((m: any) => m.id === memberId);
    if (member) {
      Object.assign(member, syncData);
      await writeMembers(members);
    }
  } catch (err) {
    console.error('[LYRIC SYNC STATUS ERROR]', err);
  }
}

// ─── Notify Admin ───
async function notifyAdminOfLyricSync(patient: PatientData, results: any) {
  const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
  const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';

  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    try {
      const text = [
        '🏥 <b>LYRIC SYNC</b> — CEDEXX',
        `👤 ${patient.first_name} ${patient.last_name}`,
        `📧 ${patient.email}`,
        `📦 Plan: ${patient.plan}`,
        `✉️ Email: ${results.email?.sent ? '✅ Sent' : '❌ Failed'}`,
        `🕒 ${new Date().toLocaleString()}`,
      ].join('\n');

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
      console.error('[TELEGRAM LYRIC ERROR]', err);
    }
  }
}
