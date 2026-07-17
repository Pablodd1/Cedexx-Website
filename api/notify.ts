import { Resend } from 'resend';

interface NotifyData {
  type: 'registration' | 'payment' | 'deletion';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  plan?: string;
  amount?: number;
  stripe_session_id?: string;
  reason?: string;
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
  const adminEmail = process.env.ADMIN_EMAIL || 'info@cedexx.net';

  const isPayment = data.type === 'payment';
  const isDeletion = data.type === 'deletion';

  const subject = isPayment
    ? `💳 New CEDEXX Payment — ${data.first_name} ${data.last_name}`
    : isDeletion
      ? `🗑️ Data Deletion Request — ${data.email}`
      : `📋 New CEDEXX Registration — ${data.first_name} ${data.last_name}`;

  const rows = [
    ['Name', `${data.first_name} ${data.last_name}`],
    ['Email', data.email],
    data.phone ? ['Phone', data.phone] : null,
    data.plan ? ['Plan', data.plan] : null,
    isPayment && data.amount ? ['Amount', `$${(data.amount / 100).toFixed(2)}`] : null,
    data.stripe_session_id ? ['Session ID', data.stripe_session_id] : null,
    data.reason ? ['Reason', data.reason] : null,
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
          ${isPayment ? '💳 New Payment Received' : isDeletion ? '🗑️ Data Deletion Request' : '📋 New Member Registration'}
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
      to: [adminEmail],
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

  const text = isPayment
    ? `💳 <b>NEW PAYMENT</b> — CEDEXX
👤 ${data.first_name} ${data.last_name}
📧 ${data.email}
📦 Plan: ${data.plan || 'N/A'}
💰 Amount: $${data.amount ? (data.amount / 100).toFixed(2) : 'N/A'}
🆔 Session: ${data.stripe_session_id || 'N/A'}
🕒 ${new Date().toLocaleString()}`
    : isDeletion
      ? `🗑️ <b>DATA DELETION REQUEST</b> — CEDEXX
📧 ${data.email}
📝 Reason: ${data.reason || 'Not provided'}
🕒 ${new Date().toLocaleString()}`
      : `📋 <b>NEW REGISTRATION</b> — CEDEXX
👤 ${data.first_name} ${data.last_name}
📧 ${data.email}
📞 ${data.phone || 'N/A'}
📦 Plan: ${data.plan || 'N/A'}
🕒 ${new Date().toLocaleString()}`;

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
  const text = isPayment
    ? `CEDEXX: Payment from ${data.first_name} ${data.last_name} — ${data.plan} $${data.amount ? (data.amount / 100).toFixed(2) : 'N/A'}`
    : data.type === 'deletion'
      ? `CEDEXX: Deletion request for ${data.email}`
      : `CEDEXX: New registration from ${data.first_name} ${data.last_name} — ${data.plan || 'N/A'}`;

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
