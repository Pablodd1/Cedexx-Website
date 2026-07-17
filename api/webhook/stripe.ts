import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import { notifyAdmin } from './notify';

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

async function sendNotifications(member: any) {
  await notifyAdmin({
    type: 'payment',
    first_name: member.first_name,
    last_name: member.last_name,
    email: member.email,
    plan: member.plan,
    amount: member.amount,
    stripe_session_id: member.stripe_session_id,
  });
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
    await sendNotifications(memberData);
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false, // Required: Stripe needs raw body for signature verification
  },
};
