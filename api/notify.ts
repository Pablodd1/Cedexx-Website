import { Resend } from 'resend';
import { sendAdminNotification } from './lib/client-email';

interface NotifyData {
  type: 'registration' | 'payment' | 'deletion' | 'form_started' | 'checkout_started';
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

export async function notifyAdmin(data: NotifyData) {
  // Fire all channels in parallel, ignore failures
  await Promise.allSettled([
    sendAdminNotification({
      type: data.type,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      plan: data.plan,
      amount: data.amount,
      stripe_session_id: data.stripe_session_id,
      reason: data.reason,
    }),
    sendTelegramNotification(data),
    sendSMSNotification(data),
  ]);
}

// ─── Telegram ───
async function sendTelegramNotification(data: NotifyData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const isPayment = data.type === 'payment';
  const isDeletion = data.type === 'deletion';
  const isFormStart = data.type === 'form_started';
  const isCheckoutStart = data.type === 'checkout_started';

  const lines = [
    isPayment ? '💳 <b>NEW PAYMENT</b> — CEDEXX' : 
    isDeletion ? '🗑️ <b>DATA DELETION</b> — CEDEXX' : 
    isFormStart ? '📝 <b>LEAD STARTED FORM</b> — CEDEXX' :
    isCheckoutStart ? '💳 <b>CHECKOUT STARTED</b> — CEDEXX' :
    '📋 <b>NEW REGISTRATION</b> — CEDEXX',
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

// ─── SMS / Text ───
// Supports: TextBelt (free: key=textbelt, 1/day), or custom webhook
async function sendSMSNotification(data: NotifyData) {
  const number = process.env.ADMIN_SMS_NUMBER;
  if (!number) return;

  const isPayment = data.type === 'payment';
  const isFormStart = data.type === 'form_started';
  const isCheckoutStart = data.type === 'checkout_started';
  const planInfo = data.plan ? ` (${data.plan})` : '';
  const amountInfo = isPayment && data.amount ? ` $${(data.amount / 100).toFixed(2)}` : '';
  
  const text = isPayment
    ? `CEDEXX PAYMENT: ${data.first_name} ${data.last_name}${planInfo}${amountInfo}`
    : data.type === 'deletion'
      ? `CEDEXX: Deletion request for ${data.email}`
      : isCheckoutStart
        ? `CEDEXX CHECKOUT: ${data.first_name} ${data.last_name}, ${data.email}${planInfo}`
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
