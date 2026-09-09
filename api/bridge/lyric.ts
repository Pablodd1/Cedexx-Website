import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const JASMEL_EMAIL = process.env.JASMEL_EMAIL || 'jasmelacosta@gmail.com';
const LYRIC_EMAIL = process.env.LYRIC_ENROLLMENT_EMAIL || 'enrollment@getlyric.com';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '8834617573:AAGANwBh_xp-MIZpqukctS2OAuJ2zxJOnrU';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '7838956683';

export const LYRIC_PLAN_CONFIG: Record<string, { planId: string; planDetailsId: string; name: string }> = {
  'carenow': { planId: '2662', planDetailsId: '1', name: 'CareNow™' },
  'carenow-mental': { planId: '2664', planDetailsId: '1', name: 'CareNow™ + Mental Wellness' },
  'mental-wellness': { planId: '2665', planDetailsId: '1', name: 'Mental Wellness' },
  'carecomplete': { planId: '2666', planDetailsId: '1', name: 'CareComplete™' },
  'carecomplete-family': { planId: '2667', planDetailsId: '3', name: 'CareComplete™ Family' },
};

export const LYRIC_STATE_IDS: Record<string, string> = {
  'AL': '1', 'AK': '2', 'AZ': '3', 'AR': '4', 'CA': '5', 'CO': '6', 'CT': '7', 'DE': '8',
  'DC': '9', 'FL': '10', 'GA': '11', 'HI': '12', 'ID': '13', 'IL': '14', 'IN': '15', 'IA': '16',
  'KS': '17', 'KY': '18', 'LA': '19', 'ME': '20', 'MD': '21', 'MA': '22', 'MI': '23', 'MN': '24',
  'MS': '25', 'MO': '26', 'MT': '27', 'NE': '28', 'NV': '29', 'NH': '30', 'NJ': '31', 'NM': '32',
  'NY': '33', 'NC': '34', 'ND': '35', 'OH': '36', 'OK': '37', 'OR': '38', 'PA': '39', 'RI': '40',
  'SC': '41', 'SD': '42', 'TN': '43', 'TX': '44', 'UT': '45', 'VT': '46', 'VA': '47', 'WA': '48',
  'WV': '49', 'WI': '50', 'WY': '51', 'PR': '52', 'AS': '53', 'FM': '54', 'GU': '55', 'MH': '56',
  'MP': '57', 'PW': '58', 'VI': '59',
};

const planMap: Record<string, string> = {
  'carenow': 'CareNow™',
  'carenow-mental': 'CareNow™ + Mental Wellness',
  'mental-wellness': 'Mental Wellness',
  'carecomplete': 'CareComplete™',
  'carecomplete-family': 'CareComplete™ Family',
};

function getLyricPlanInfo(plan: string) {
  const normalized = (plan || '').toLowerCase().replace(/[^a-z-]/g, '');
  for (const [key, cfg] of Object.entries(LYRIC_PLAN_CONFIG)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return cfg;
    }
  }
  return LYRIC_PLAN_CONFIG['carenow'] || { planId: '2662', planDetailsId: '1', name: plan || 'CareNow™' };
}

function formatLyricDob(dob: string): string {
  if (!dob) return '';
  const parts = dob.trim().split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  }
  return dob;
}

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
    console.error('[LYRIC DB READ ERROR]', e);
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
          message: `Update Lyric sync status`,
          content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
          sha,
          branch: 'main',
        }),
      }
    );
  } catch (e) {
    console.error('[LYRIC DB WRITE ERROR]', e);
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
        subject: `🚨 CRITICAL ERROR — /api/bridge/lyric`,
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
        text: `🚨 <b>CRITICAL ERROR</b>\n${msg}\n📍 Endpoint: /api/bridge/lyric`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }
}

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
    } catch (err: any) {
      console.error('[LYRIC BRIDGE] Lookup error:', err);
      await alertCritical(err, {
        endpoint: '/api/bridge/lyric',
        patientEmail: patient_id,
      });
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
  const results: any = { email: null, api: null, error: null };

  try {
    // 1. Send enrollment email to Lyric
    if (RESEND_KEY) {
      results.email = await sendLyricEnrollmentEmail(patientData);
    } else {
      throw new Error('RESEND_API_KEY not configured — cannot send enrollment email');
    }

    // 2. Call Lyric API (when available)
    // TODO: Uncomment when Lyric provides API endpoint
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

    // CRITICAL: Alert Jasmel immediately
    await alertCritical(err, {
      endpoint: '/api/bridge/lyric',
      patientEmail: patientData.email,
      patientName: `${patientData.first_name} ${patientData.last_name}`,
      plan: patientData.plan,
    });

    // Update member with failed status
    await updateMemberSyncStatus(patientData.id, {
      lyric_synced: false,
      lyric_sync_error: err.message,
      lyric_sync_attempts: ((patientData as any).lyric_sync_attempts || 0) + 1,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to sync with Lyric Health',
      detail: err.message,
    });
  }
}

function getMemberId(patient: PatientData): string {
  const cleanPhone = (patient.phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length === 10) return cleanPhone;
  return patient.id || cleanPhone || 'N/A';
}

// ─── Build Lyric Enrollment Email ───
function buildLyricEmail(patient: PatientData): string {
  const memberId = getMemberId(patient);
  const planInfo = getLyricPlanInfo(patient.plan);

  return `
NEW CEDEXX ENROLLMENT — ACTION REQUIRED

Patient Information:
-------------------
Member ID / External ID: ${memberId}
Name: ${patient.first_name} ${patient.last_name}
Email: ${patient.email}
Phone: ${patient.phone}
Date of Birth: ${formatLyricDob(patient.dob)}
Gender: ${patient.gender || 'Not provided'}

Address:
${patient.address || 'Not provided'}
${patient.city || ''}, ${patient.state || ''} ${patient.zipcode || ''}

Lyric Plan Mapping:
-------------------
Plan Name: ${planInfo.name}
Lyric Plan ID: ${planInfo.planId}
Lyric Plan Details ID: ${planInfo.planDetailsId} (${planInfo.planDetailsId === '3' ? 'Family Tier' : 'Individual Tier'})
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

  const memberId = getMemberId(patient);
  const planInfo = getLyricPlanInfo(patient.plan);

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
        subject: `NEW ENROLLMENT: ${patient.first_name} ${patient.last_name} (Member ID: ${memberId}) — ${planInfo.name} [Plan ID: ${planInfo.planId}]`,
        text: buildLyricEmail(patient),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;">
            <h2 style="color:#050249;">New CEDEXX Enrollment</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Member ID / External ID</td><td style="padding:8px;border-bottom:1px solid #eee;"><strong style="font-size:15px;color:#050249;">${memberId}</strong></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.first_name} ${patient.last_name}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.email}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.phone}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">DOB</td><td style="padding:8px;border-bottom:1px solid #eee;">${formatLyricDob(patient.dob)}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Street Address</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.address || 'Not provided'}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">City, State ZIP</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.city || ''}, ${patient.state || ''} <strong>${patient.zipcode || ''}</strong></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Plan</td><td style="padding:8px;border-bottom:1px solid #eee;"><strong>${planInfo.name}</strong></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Lyric Plan ID</td><td style="padding:8px;border-bottom:1px solid #eee;"><code style="background:#eef;padding:2px 6px;border-radius:4px;color:#050249;">${planInfo.planId}</code></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Plan Details ID</td><td style="padding:8px;border-bottom:1px solid #eee;"><code style="background:#eef;padding:2px 6px;border-radius:4px;color:#050249;">${planInfo.planDetailsId}</code> (${planInfo.planDetailsId === '3' ? 'Family' : 'Single'})</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Stripe Customer</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.stripe_customer_id || 'N/A'}</td></tr>
            </table>
            <p style="margin-top:20px;color:#666;font-size:13px;">Please activate within 24-48 hours. Member activates app using ZIP: <strong>${patient.zipcode || 'N/A'}</strong> and Member ID: <strong>${memberId}</strong>.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return { sent: true, timestamp: new Date().toISOString() };

  } catch (err: any) {
    return { sent: false, error: err.message };
  }
}

// ─── Build API Payload (POST https://staging.getlyric.com/go/api/census/createMember) ───
function buildApiPayload(patient: PatientData) {
  const memberId = getMemberId(patient);
  const planInfo = getLyricPlanInfo(patient.plan);
  const stateUpper = (patient.state || '').trim().toUpperCase();
  const stateId = LYRIC_STATE_IDS[stateUpper] || '';

  return {
    endpoint: 'https://staging.getlyric.com/go/api/census/createMember',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer <LYRIC_API_TOKEN>',
    },
    body: {
      primaryExternalId: memberId,
      groupCode: process.env.LYRIC_GROUP_CODE || 'CEDEXX',
      planId: planInfo.planId,
      planDetailsId: planInfo.planDetailsId,
      firstName: patient.first_name,
      lastName: patient.last_name,
      dob: formatLyricDob(patient.dob),
      email: patient.email,
      primaryPhone: memberId,
      gender: (patient.gender || 'u').toLowerCase().charAt(0) || 'u',
      address: patient.address || '',
      city: patient.city || '',
      stateId: stateId,
      zipCode: patient.zipcode || '',
      sendRegistrationNotification: '1',
      numAllowedDependents: planInfo.planDetailsId === '3' ? '7' : '0',
    },
    metadata: {
      source: 'cedexx',
      member_id: memberId,
      plan_name: planInfo.name,
      stripe_customer_id: patient.stripe_customer_id || null,
      stripe_subscription_id: patient.stripe_subscription_id || null,
      paid_at: patient.paid_at,
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
  // 1. Telegram
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

  // 2. Email to admin
  if (RESEND_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({
          from: 'CEDEXX Alerts <alerts@cedexx.net>',
          to: [ADMIN_EMAIL],
          subject: `Lyric Sync: ${patient.first_name} ${patient.last_name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;">
              <h2 style="color:#050249;">Lyric Health Sync Completed</h2>
              <p>Patient enrollment data sent to Lyric Health.</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Patient</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.first_name} ${patient.last_name}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.email}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Plan</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.plan}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Status</td><td style="padding:8px;border-bottom:1px solid #eee;">✅ Sent</td></tr>
              </table>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.error('[ADMIN EMAIL LYRIC ERROR]', err);
    }
  }
}
