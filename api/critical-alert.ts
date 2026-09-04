/**
 * CRITICAL ERROR ALERT SYSTEM
 * Sends immediate email + Telegram when critical errors occur
 * Fully self-contained with zero external dependencies
 */

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';
const JASMEL_EMAIL = process.env.JASMEL_EMAIL || 'jasmelacosta@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';

interface ErrorContext {
  endpoint: string;
  patientEmail?: string;
  patientName?: string;
  plan?: string;
  stripeSessionId?: string;
  originalError?: any;
}

/**
 * Send critical error alert to Jasmel + Telegram
 * Call this in every catch block
 */
export async function alertCritical(error: Error | string, context: ErrorContext) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  const timestamp = new Date().toISOString();

  console.error('[CRITICAL ALERT]', { timestamp, error: errorMessage, context });

  // 1. Send email to Jasmel
  await sendCriticalEmail(errorMessage, errorStack, context, timestamp);

  // 2. Send Telegram alert
  await sendCriticalTelegram(errorMessage, context, timestamp);

  // 3. Persist error to GitHub DB
  await persistError(errorMessage, context, timestamp);
}

async function sendCriticalEmail(
  errorMessage: string,
  errorStack: string,
  context: ErrorContext,
  timestamp: string
) {
  if (!RESEND_KEY) {
    console.error('[CRITICAL EMAIL] No Resend API key configured');
    return;
  }

  const subject = `🚨 CEDEXX CRITICAL ERROR — ${context.endpoint}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;border:2px solid #dc2626;border-radius:16px;overflow:hidden">
      <div style="background:#dc2626;color:#fff;padding:20px">
        <h2 style="margin:0;font-size:20px">🚨 CRITICAL ERROR — CEDEXX</h2>
        <p style="margin:8px 0 0;font-size:14px;opacity:0.9">Action required immediately</p>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;width:140px">Endpoint</td><td style="padding:8px;border-bottom:1px solid #eee">${context.endpoint}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">Error</td><td style="padding:8px;border-bottom:1px solid #eee;color:#dc2626">${errorMessage}</td></tr>
          ${context.patientName ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">Patient</td><td style="padding:8px;border-bottom:1px solid #eee">${context.patientName}</td></tr>` : ''}
          ${context.patientEmail ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${context.patientEmail}</td></tr>` : ''}
          ${context.plan ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">Plan</td><td style="padding:8px;border-bottom:1px solid #eee">${context.plan}</td></tr>` : ''}
          ${context.stripeSessionId ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">Stripe Session</td><td style="padding:8px;border-bottom:1px solid #eee">${context.stripeSessionId}</td></tr>` : ''}
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">Time</td><td style="padding:8px;border-bottom:1px solid #eee">${timestamp}</td></tr>
        </table>
        ${errorStack ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px"><p style="margin:0 0 8px;font-weight:700;color:#991b1b;font-size:12px;text-transform:uppercase">Stack Trace</p><pre style="margin:0;font-size:11px;color:#7f1d1d;overflow-x:auto">${errorStack}</pre></div>` : ''}
        <p style="margin:0;color:#6b7280;font-size:13px">
          This is an automated critical error alert. Please investigate immediately.
          <br><br>
          <a href="https://cedexx.net/admin" style="color:#dc2626;font-weight:700">View Dashboard →</a>
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
        from: 'CEDEXX Alerts <alerts@cedexx.net>',
        to: [JASMEL_EMAIL, ADMIN_EMAIL],
        subject,
        html,
        text: `CRITICAL ERROR: ${errorMessage}\n\nEndpoint: ${context.endpoint}\nTime: ${timestamp}\n\nPatient: ${context.patientName || 'N/A'}\nEmail: ${context.patientEmail || 'N/A'}\nPlan: ${context.plan || 'N/A'}\n\nStack: ${errorStack || 'N/A'}`,
      }),
    });
    if (res.ok) {
      console.log('[CRITICAL EMAIL] Sent to', JASMEL_EMAIL, ADMIN_EMAIL);
    } else {
      console.error('[CRITICAL EMAIL FAILED]', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[CRITICAL EMAIL FAILED]', err);
  }
}

async function sendCriticalTelegram(errorMessage: string, context: ErrorContext, timestamp: string) {
  if (!TELEGRAM_BOT || !TELEGRAM_CHAT) return;

  const lines = [
    '🚨 <b>CRITICAL ERROR — CEDEXX</b>',
    `⚠️ ${errorMessage.substring(0, 200)}`,
    `📍 Endpoint: ${context.endpoint}`,
    context.patientName ? `👤 Patient: ${context.patientName}` : null,
    context.patientEmail ? `📧 ${context.patientEmail}` : null,
    context.plan ? `📦 Plan: ${context.plan}` : null,
    `🕒 ${timestamp}`,
    '',
    '⚡ Action required immediately',
  ].filter(Boolean);

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: lines.join('\n'),
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('[CRITICAL TELEGRAM FAILED]', err);
  }
}

async function persistError(errorMessage: string, context: ErrorContext, timestamp: string) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
  const REPO = 'Pablodd1/Cedexx-Website';
  const FILE_PATH = 'data/errors.json';

  try {
    // Read existing errors
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    let errors: any[] = [];
    let sha: string | undefined;

    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
      if (data.content) {
        const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
        errors = decoded.errors || [];
      }
    }

    // Add new error
    errors.push({
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      message: errorMessage,
      endpoint: context.endpoint,
      patient_email: context.patientEmail,
      patient_name: context.patientName,
      plan: context.plan,
      stripe_session_id: context.stripeSessionId,
      timestamp,
      resolved: false,
    });

    // Keep only last 100 errors
    if (errors.length > 100) errors = errors.slice(-100);

    const payload = {
      errors,
      updated_at: timestamp,
      version: '1.0',
    };

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
          message: `Critical error: ${errorMessage.substring(0, 50)}`,
          content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
          sha,
          branch: 'main',
        }),
      }
    );
  } catch (err) {
    console.error('[ERROR PERSISTENCE FAILED]', err);
  }
}

/**
 * Wrapper for async functions — auto-catches and alerts
 */
export function withCriticalAlert<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      await alertCritical(error as Error, context);
      throw error;
    }
  }) as T;
}
