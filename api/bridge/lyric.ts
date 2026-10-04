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

// ─── Lyric Group & Auth Credentials ───
export const LYRIC_PROD_GROUP_CODE = process.env.LYRIC_GROUP_CODE || 'MTMCOONR01';
export const LYRIC_STAGING_GROUP_CODE = 'MTMSTGCEDEXXO1';

export const LYRIC_AUTH_USER = process.env.LYRIC_API_USER || 'MTMCOONR01@mytelemedicine.com';
export const LYRIC_AUTH_PASS = process.env.LYRIC_API_PASS || 'YCc25aLkB&Fj5xZL';

export const LYRIC_LOGIN_URL = 'https://portal.getlyric.com/go/api/login';
export const LYRIC_CENSUS_URL = 'https://portal.getlyric.com/go/api/census/createMember';

// Production Plan IDs confirmed by Emma
export const LYRIC_PROD_PLAN_CONFIG: Record<string, { planId: string; planDetailsId: string; name: string }> = {
  'carenow': { planId: '6283', planDetailsId: '1', name: 'CareNow™' },
  'carenow-mental': { planId: '6306', planDetailsId: '1', name: 'CareNow™ + Mental Wellness' },
  'mental-wellness': { planId: '6307', planDetailsId: '1', name: 'Mental Wellness' },
  'carecomplete': { planId: '6308', planDetailsId: '1', name: 'CareComplete™' },
  'carecomplete-family': { planId: '6309', planDetailsId: '3', name: 'CareComplete™ Family' },
};

// Staging Plan IDs
export const LYRIC_STAGING_PLAN_CONFIG: Record<string, { planId: string; planDetailsId: string; name: string }> = {
  'carenow': { planId: '2662', planDetailsId: '1', name: 'CareNow™' },
  'carenow-mental': { planId: '2664', planDetailsId: '1', name: 'CareNow™ + Mental Wellness' },
  'mental-wellness': { planId: '2665', planDetailsId: '1', name: 'Mental Wellness' },
  'carecomplete': { planId: '2666', planDetailsId: '1', name: 'CareComplete™' },
  'carecomplete-family': { planId: '2667', planDetailsId: '3', name: 'CareComplete™ Family' },
};

// Default export uses production mappings
export const LYRIC_PLAN_CONFIG = LYRIC_PROD_PLAN_CONFIG;

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

function getLyricPlanInfo(plan: string, isStaging: boolean = false) {
  const normalized = (plan || '').toLowerCase().replace(/[^a-z-]/g, '');
  const config = isStaging ? LYRIC_STAGING_PLAN_CONFIG : LYRIC_PROD_PLAN_CONFIG;
  for (const [key, cfg] of Object.entries(config)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return cfg;
    }
  }
  return config['carenow'] || { planId: isStaging ? '2662' : '6283', planDetailsId: '1', name: plan || 'CareNow™' };
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

// Token cache for fast reuse across calls (tokens valid for 24h)
let cachedBearerToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getLyricBearerToken(): Promise<string> {
  const now = Date.now();
  if (cachedBearerToken && now < tokenExpiresAt) {
    return cachedBearerToken;
  }

  const res = await fetch(LYRIC_LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      email: LYRIC_AUTH_USER,
      password: LYRIC_AUTH_PASS,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Failed to authenticate with Lyric Health API (${res.status}): ${errorText}`);
  }

  const token = res.headers.get('authorization');
  if (!token) {
    throw new Error('Lyric Health API authenticated, but no Authorization header returned');
  }

  cachedBearerToken = token;
  // Cache for 6 hours
  tokenExpiresAt = now + 6 * 60 * 60 * 1000;
  return token;
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
  let attempts = 0;
  const maxAttempts = 3;
  let delayMs = 300;

  while (attempts < maxAttempts) {
    attempts++;
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
            message: `Update Lyric sync status`,
            content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
            sha,
            branch: 'main',
          }),
        }
      );

      if (putRes.ok) {
        return;
      }

      if (putRes.status === 409 && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
        continue;
      }
      break;
    } catch (e) {
      console.error(`[LYRIC DB WRITE ERROR attempt ${attempts}]`, e);
      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
      }
    }
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

export interface PatientData {
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

export function getMemberId(patient: PatientData): string {
  const cleanPhone = (patient.phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length === 10) return cleanPhone;
  return patient.id || cleanPhone || 'N/A';
}

// ─── Call Lyric Census API ───
export async function callLyricApi(patient: PatientData, isStaging: boolean = false) {
  const token = await getLyricBearerToken();
  const memberId = getMemberId(patient);
  const planInfo = getLyricPlanInfo(patient.plan, isStaging);
  const stateUpper = (patient.state || 'FL').trim().toUpperCase();
  const stateId = LYRIC_STATE_IDS[stateUpper] || '10'; // default FL
  const groupCode = isStaging ? LYRIC_STAGING_GROUP_CODE : LYRIC_PROD_GROUP_CODE;

  const payload = new URLSearchParams({
    primaryExternalId: memberId,
    groupCode: groupCode,
    planId: planInfo.planId,
    planDetailsId: planInfo.planDetailsId,
    firstName: patient.first_name,
    lastName: patient.last_name,
    dob: formatLyricDob(patient.dob),
    email: patient.email,
    primaryPhone: memberId,
    gender: (patient.gender || 'u').toLowerCase().charAt(0) || 'u',
    address: patient.address || 'Not provided',
    address2: '',
    city: patient.city || 'Miami',
    stateId: stateId,
    zipCode: patient.zipcode || '33101',
    sendRegistrationNotification: '1',
    numAllowedDependents: (
      planInfo.planDetailsId === '3' ||
      ['carenow', 'carenow-mental', 'carecomplete-family'].some(p => (patient.plan || '').toLowerCase().includes(p))
    ) ? '7' : '0',
    heightFeet: '5',
    heightInches: '9',
    weight: '160',
    timezoneId: '1', // Eastern Time
  });

  const res = await fetch(LYRIC_CENSUS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': token,
    },
    body: payload,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok && !data.success) {
    // If already exists, treat as non-fatal warning
    if (data.message && data.message.includes('already exists')) {
      return { success: true, alreadyExists: true, detail: data };
    }
    throw new Error(data.message || `Lyric API error HTTP ${res.status}`);
  }

  return { success: true, lyricUserId: data.userid, detail: data };
}

// ─── Main Handler ───
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { patient_id, patient, dry_run, use_staging } = req.body || {};

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

  const required = ['first_name', 'last_name', 'email', 'phone', 'dob', 'plan'];
  const missing = required.filter(f => !patientData![f as keyof PatientData]);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  // DRY RUN
  if (dry_run) {
    return res.status(200).json({
      success: true,
      dry_run: true,
      patient: patientData,
      email_preview: buildLyricEmail(patientData, !!use_staging),
      api_payload: buildApiPayload(patientData, !!use_staging),
    });
  }

  // LIVE SYNC TO LYRIC
  const results: any = { email: null, api: null, error: null };

  try {
    // 1. Direct API call to Lyric Census
    try {
      results.api = await callLyricApi(patientData, !!use_staging);
    } catch (apiErr: any) {
      console.error('[LYRIC API CALL FAILED, FALLING BACK TO EMAIL]', apiErr);
      results.api = { success: false, error: apiErr.message };
    }

    // 2. Email notification dispatch to Lyric enrollment desk as backup/verification
    if (RESEND_KEY) {
      results.email = await sendLyricEnrollmentEmail(patientData, !!use_staging);
    }

    // 3. Update member record with sync status
    await updateMemberSyncStatus(patientData.id, {
      lyric_synced: results.api?.success || results.email?.sent || false,
      lyric_synced_at: new Date().toISOString(),
      lyric_sync_method: results.api?.success ? 'api' : 'email',
      lyric_user_id: results.api?.lyricUserId || null,
      lyric_sync_attempts: 1,
    });

    // 4. Notify admin via Telegram & Email
    await notifyAdminOfLyricSync(patientData, results);

    res.status(200).json({
      success: true,
      message: 'Patient data sent to Lyric Health',
      patient_id: patientData.id,
      sync_results: results,
    });

  } catch (err: any) {
    console.error('[LYRIC BRIDGE ERROR]', err);

    await alertCritical(err, {
      endpoint: '/api/bridge/lyric',
      patientEmail: patientData.email,
      patientName: `${patientData.first_name} ${patientData.last_name}`,
      plan: patientData.plan,
    });

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

// ─── Build Lyric Enrollment Email ───
function buildLyricEmail(patient: PatientData, isStaging: boolean = false): string {
  const memberId = getMemberId(patient);
  const planInfo = getLyricPlanInfo(patient.plan, isStaging);
  const groupCode = isStaging ? LYRIC_STAGING_GROUP_CODE : LYRIC_PROD_GROUP_CODE;

  return `
NEW CEDEXX ENROLLMENT — ACTION REQUIRED

Patient Information:
-------------------
Group Code: ${groupCode}
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
async function sendLyricEnrollmentEmail(patient: PatientData, isStaging: boolean = false) {
  if (!RESEND_KEY) {
    return { sent: false, error: 'No Resend API key' };
  }

  const memberId = getMemberId(patient);
  const planInfo = getLyricPlanInfo(patient.plan, isStaging);
  const groupCode = isStaging ? LYRIC_STAGING_GROUP_CODE : LYRIC_PROD_GROUP_CODE;

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
        subject: `NEW ENROLLMENT [Group: ${groupCode}]: ${patient.first_name} ${patient.last_name} (Member ID: ${memberId}) — ${planInfo.name} [Plan ID: ${planInfo.planId}]`,
        text: buildLyricEmail(patient, isStaging),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;">
            <h2 style="color:#050249;">New CEDEXX Enrollment</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Group Code</td><td style="padding:8px;border-bottom:1px solid #eee;"><strong style="color:#050249;">${groupCode}</strong></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Member ID / External ID</td><td style="padding:8px;border-bottom:1px solid #eee;"><strong style="font-size:15px;color:#050249;">${memberId}</strong></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.first_name} ${patient.last_name}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.email}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.phone}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">DOB</td><td style="padding:8px;border-bottom:1px solid #eee;">${formatLyricDob(patient.dob)}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">City, State ZIP</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.city || ''}, ${patient.state || ''} <strong>${patient.zipcode || ''}</strong></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Plan</td><td style="padding:8px;border-bottom:1px solid #eee;"><strong>${planInfo.name}</strong></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Lyric Plan ID</td><td style="padding:8px;border-bottom:1px solid #eee;"><code style="background:#eef;padding:2px 6px;border-radius:4px;color:#050249;">${planInfo.planId}</code></td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Plan Details ID</td><td style="padding:8px;border-bottom:1px solid #eee;"><code style="background:#eef;padding:2px 6px;border-radius:4px;color:#050249;">${planInfo.planDetailsId}</code> (${planInfo.planDetailsId === '3' ? 'Family' : 'Single'})</td></tr>
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

// ─── Build API Payload for Preview ───
function buildApiPayload(patient: PatientData, isStaging: boolean = false) {
  const memberId = getMemberId(patient);
  const planInfo = getLyricPlanInfo(patient.plan, isStaging);
  const stateUpper = (patient.state || 'FL').trim().toUpperCase();
  const stateId = LYRIC_STATE_IDS[stateUpper] || '10';
  const groupCode = isStaging ? LYRIC_STAGING_GROUP_CODE : LYRIC_PROD_GROUP_CODE;

  return {
    endpoint: LYRIC_CENSUS_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer <AUTOMATIC_JWT_TOKEN>',
    },
    body: {
      primaryExternalId: memberId,
      groupCode: groupCode,
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
      numAllowedDependents: (
        planInfo.planDetailsId === '3' ||
        ['carenow', 'carenow-mental', 'carecomplete-family'].some(p => (patient.plan || '').toLowerCase().includes(p))
      ) ? '7' : '0',
      heightFeet: '5',
      heightInches: '9',
      weight: '160',
      timezoneId: '1',
    },
    metadata: {
      source: 'cedexx',
      member_id: memberId,
      group_code: groupCode,
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
  // Telegram alert
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    try {
      const maskedName = `${(patient.first_name || '').charAt(0)}. ${(patient.last_name || '').charAt(0)}.`;
      const phoneDigits = (patient.phone || '').replace(/\D/g, '');
      const maskedPhone = phoneDigits.length >= 4 ? `***-***-${phoneDigits.slice(-4)}` : '***';
      const text = [
        '🏥 <b>LYRIC HEALTH SYNC</b> — CEDEXX',
        `👤 Member: <code>${maskedName}</code>`,
        `📱 ID/Phone: <code>${maskedPhone}</code>`,
        `📦 Plan: ${patient.plan}`,
        `⚡ API Status: ${results.api?.success ? '✅ Registered (User #' + results.api.lyricUserId + ')' : '⚠️ ' + (results.api?.error || 'Skipped')}`,
        `✉️ Email Dispatch: ${results.email?.sent ? '✅ Dispatched' : '❌ Failed'}`,
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

  // Email to admin
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
          subject: `Lyric Sync: ${patient.first_name} ${patient.last_name} (${results.api?.success ? 'Success' : 'Email Only'})`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;">
              <h2 style="color:#050249;">Lyric Health Sync Completed</h2>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Patient</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.first_name} ${patient.last_name}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.email}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Plan</td><td style="padding:8px;border-bottom:1px solid #eee;">${patient.plan}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">API Registration</td><td style="padding:8px;border-bottom:1px solid #eee;">${results.api?.success ? '✅ Success (ID: ' + results.api.lyricUserId + ')' : '⚠️ ' + (results.api?.error || 'N/A')}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Email Notification</td><td style="padding:8px;border-bottom:1px solid #eee;">${results.email?.sent ? '✅ Sent' : '❌ Failed'}</td></tr>
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
