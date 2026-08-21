import { Resend } from 'resend';

interface NotifyData {
  type: 'registration' | 'payment' | 'deletion' | 'form_started';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string;
  role?: string;
  plan?: string;
  amount?: number;
  stripe_session_id?: string;
  reason?: string;
  field?: string;
  url?: string;
  ip?: string;
  consent_tos?: boolean;
  consent_analytics?: boolean;
  consent_version?: string;
  consent_timestamp?: string;
  cardholder_name?: string;
  billing_address?: string;
  user_agent?: string;
}

// Shared Resend instance (safe if no key — falls back gracefully)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function notifyAdmin(data: NotifyData) {
  // Fire all channels in parallel, ignore failures
  await Promise.allSettled([
    sendEmailNotification(data),
    sendTelegramNotification(data),
    sendSMSNotification(data),
  ]);
}

// ─── 1. Email via Resend ───
async function sendEmailNotification(data: NotifyData) {
  if (!resend) return;
  
  // Support multiple admin emails: comma or semicolon separated
  const adminEmailsRaw = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || 'info@cedexx.net';
  const adminEmails = adminEmailsRaw.split(/[,;]/).map(e => e.trim()).filter(Boolean);

  const isPayment = data.type === 'payment';
  const isDeletion = data.type === 'deletion';
  const isFormStart = data.type === 'form_started';
  const isRegistration = data.type === 'registration';

  const subject = isPayment
    ? `💳 New CEDEXX Payment — ${data.first_name} ${data.last_name}`
    : isDeletion
      ? `🗑️ Data Deletion Request — ${data.email}`
      : isFormStart
        ? `📝 Lead Started Form — ${data.first_name} ${data.last_name}`
        : `📋 New CEDEXX Registration — ${data.first_name} ${data.last_name}`;

  const rows = [
    ['Name', `${data.first_name} ${data.last_name}`],
    ['Email', data.email],
    data.phone ? ['Phone', data.phone] : null,
    data.dob ? ['Date of Birth', data.dob] : null,
    data.role ? ['Role', data.role] : null,
    data.plan ? ['Plan', data.plan] : null,
    isPayment && data.amount ? ['Amount', `$${(data.amount / 100).toFixed(2)}`] : null,
    data.cardholder_name ? ['Cardholder', data.cardholder_name] : null,
    data.billing_address ? ['Billing Address', data.billing_address] : null,
    data.consent_tos !== undefined ? ['TOS Consent', data.consent_tos ? 'Yes' : 'No'] : null,
    data.consent_analytics !== undefined ? ['Analytics Consent', data.consent_analytics ? 'Yes' : 'No'] : null,
    data.consent_version ? ['Consent Version', data.consent_version] : null,
    data.consent_timestamp ? ['Consent Time', new Date(data.consent_timestamp).toLocaleString()] : null,
    data.stripe_session_id ? ['Session ID', data.stripe_session_id] : null,
    data.reason ? ['Reason', data.reason] : null,
    data.field ? ['First Field', data.field] : null,
    data.url ? ['Page URL', data.url] : null,
    data.ip ? ['IP Address', data.ip] : null,
    data.user_agent ? ['User Agent', data.user_agent.substring(0, 100)] : null,
    ['Time', new Date().toLocaleString()],
  ].filter(Boolean) as [string, string][];

  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:700;width:140px;background:#fafafa">${k}</td><td style="padding:10px;border-bottom:1px solid #f0f0f0">${v}</td></tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;border:1px solid #e0e0e0;border-radius:16px;overflow:hidden">
      <div style="background:#050249;color:#fff;padding:20px">
        <h2 style="margin:0;font-size:18px">
          ${isPayment ? '💳 New Payment Received' : isDeletion ? '🗑️ Data Deletion Request' : isFormStart ? '📝 Lead Started Enrollment Form' : '📋 New Member Registration'}
        </h2>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${htmlRows}
      </table>
      <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#666">
        View dashboard: <a href="https://cedexx.net/admin" style="color:#050249;font-weight:700">cedexx.net/admin</a>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'CEDEXX Notifications <onboarding@resend.dev>',
      to: adminEmails,
      subject,
      html,
    });
  } catch (err) {
    console.error('[EMAIL NOTIFY ERROR]', err);
  }
}

// ─── 2. Telegram ───
async function sendTelegramNotification(data: NotifyData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const isPayment = data.type === 'payment';
  const isDeletion = data.type === 'deletion';
  const isFormStart = data.type === 'form_started';

  const lines = [
    isPayment ? '💳 <b>NEW PAYMENT</b> — CEDEXX' : isDeletion ? '🗑️ <b>DATA DELETION</b> — CEDEXX' : isFormStart ? '📝 <b>LEAD STARTED FORM</b> — CEDEXX' : '📋 <b>NEW REGISTRATION</b> — CEDEXX',
    `👤 ${data.first_name} ${data.last_name}`,
    `📧 ${data.email}`,
    data.phone ? `📞 ${data.phone}` : null,
    data.dob ? `🎂 DOB: ${data.dob}` : null,
    data.role ? `🏷️ Role: ${data.role}` : null,
    data.plan ? `📦 Plan: ${data.plan}` : null,
    isPayment && data.amount ? `💰 Amount: $${(data.amount / 100).toFixed(2)}` : null,
    data.stripe_session_id ? `🆔 Session: ${data.stripe_session_id}` : null,
    data.field ? `🖊️ First Field: ${data.field}` : null,
    data.url ? `🌐 URL: ${data.url}` : null,
    data.ip ? `📍 IP: ${data.ip}` : null,
    `🕒 ${new Date().toLocaleString()}`,
  ].filter(Boolean);

  const text = lines.join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('[TELEGRAM NOTIFY ERROR]', err);
  }
}

// ─── 3. SMS / Text ───
// Supports: TextBelt (free: key=textbelt, 1/day), or custom webhook
async function sendSMSNotification(data: NotifyData) {
  const number = process.env.ADMIN_SMS_NUMBER;
  if (!number) return;

  const isPayment = data.type === 'payment';
  const isFormStart = data.type === 'form_started';
  const planInfo = data.plan ? ` (${data.plan})` : '';
  const amountInfo = isPayment && data.amount ? ` $${(data.amount / 100).toFixed(2)}` : '';
  
  const text = isPayment
    ? `CEDEXX PAYMENT: ${data.first_name} ${data.last_name}${planInfo}${amountInfo}`
    : data.type === 'deletion'
      ? `CEDEXX: Deletion request for ${data.email}`
      : isFormStart
        ? `CEDEXX LEAD: ${data.first_name} ${data.last_name}, ${data.email}${planInfo}`
        : `CEDEXX REG: ${data.first_name} ${data.last_name}, ${data.email}${planInfo}`;

  // Try TextBelt first (free 1 SMS/day with key=textbelt)
  try {
    const tbKey = process.env.TEXTBELT_KEY || 'textbelt';
    await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: number, message: text, key: tbKey }),
    });
  } catch (err) {
    console.error('[SMS NOTIFY ERROR]', err);
  }
}
