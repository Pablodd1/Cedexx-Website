import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';

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

async function sendTelegramPaidAlert(data: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = `
💳 PAYMENT CONFIRMED — CEDEXX
👤 ${data.first_name} ${data.last_name}
📧 ${data.email}
📦 Plan: ${data.plan}
💰 Amount: $${(data.amount / 100).toFixed(2)}
🆔 Session: ${data.stripe_session_id}
🕒 ${new Date().toLocaleString()}
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (_) {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'Webhook secret not configured' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil' as any,
  });

  let event: Stripe.Event;
  const sig = req.headers['stripe-signature'] as string;

  try {
    // req.body is raw buffer when using bodyParser: false
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    const memberData = {
      first_name: meta.first_name || '',
      last_name: meta.last_name || '',
      email: session.customer_email || meta.email || '',
      plan: meta.plan || '',
      stripe_session_id: session.id,
      stripe_customer_id: session.customer as string || '',
      amount: session.amount_total || 0,
      status: 'paid',
      paid_at: new Date().toISOString(),
    };

    // Upsert into local store
    const members = loadMembers();
    const idx = members.findIndex((m) => m.email === memberData.email);
    if (idx >= 0) {
      members[idx] = {
        ...members[idx],
        ...memberData,
      };
    } else {
      members.push({
        id: `mbr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...memberData,
        registered_at: new Date().toISOString(),
        phone: '',
        dob: '',
      });
    }
    saveMembers(members);
    await sendTelegramPaidAlert(memberData);
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false, // Required: Stripe needs raw body for signature verification
  },
};
