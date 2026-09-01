import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import { notifyAdmin } from '../notify';

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

function findMemberByEmail(email: string): { member: any; index: number; members: any[] } | null {
  const members = loadMembers();
  const idx = members.findIndex((m) => m.email === email.toLowerCase().trim());
  if (idx >= 0) return { member: members[idx], index: idx, members };
  return null;
}

function findMemberByStripeSession(sessionId: string): { member: any; index: number; members: any[] } | null {
  const members = loadMembers();
  const idx = members.findIndex((m) => m.stripe_session_id === sessionId);
  if (idx >= 0) return { member: members[idx], index: idx, members };
  return null;
}

async function sendNotifications(member: any, eventType: string) {
  const isPaid = eventType === 'checkout.session.completed';
  const isExpired = eventType === 'checkout.session.expired';
  const isFailed = eventType === 'invoice.payment_failed';
  
  await notifyAdmin({
    type: isPaid ? 'payment' : 'registration',
    first_name: member.first_name || 'Unknown',
    last_name: member.last_name || 'User',
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
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature error: ${err.message}` });
  }

  console.log(`[STRIPE WEBHOOK] Event: ${event.type}, ID: ${event.id}`);

  // ─── CHECKOUT SESSION COMPLETED ───
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};
    const email = session.customer_email || meta.email || '';

    const memberData = {
      first_name: meta.first_name || '',
      last_name: meta.last_name || '',
      email: email.toLowerCase().trim(),
      plan: meta.plan || '',
      stripe_session_id: session.id,
      stripe_customer_id: session.customer as string || '',
      stripe_subscription_id: session.subscription as string || '',
      amount: session.amount_total || 0,
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert into local store
    const found = findMemberByEmail(memberData.email) || findMemberByStripeSession(session.id);
    const members = found?.members || loadMembers();
    
    if (found) {
      members[found.index] = {
        ...members[found.index],
        ...memberData,
        // Preserve existing fields
        registered_at: members[found.index].registered_at || memberData.paid_at,
      };
    } else {
      members.push({
        id: `mbr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...memberData,
        registered_at: memberData.paid_at,
        phone: '',
        dob: '',
      });
    }
    saveMembers(members);
    await sendNotifications(memberData, event.type);

    // Send client confirmation email
    try {
      const { sendPaymentConfirmation } = await import('../lib/client-email');
      await sendPaymentConfirmation({
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email: memberData.email,
        plan: memberData.plan,
        amount: memberData.amount,
        stripe_session_id: memberData.stripe_session_id,
      });
    } catch (err) {
      console.error('[EMAIL ERROR]', err);
    }
  }

  // ─── CHECKOUT SESSION EXPIRED ───
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const found = findMemberByStripeSession(session.id);
    
    if (found) {
      found.members[found.index] = {
        ...found.members[found.index],
        status: 'checkout_expired',
        checkout_expired_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveMembers(found.members);
      await sendNotifications(found.members[found.index], event.type);
      console.log(`[STRIPE WEBHOOK] Checkout expired for ${found.member.email}`);
    }
  }

  // ─── INVOICE PAYMENT FAILED ───
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;
    
    // Find member by subscription ID
    const members = loadMembers();
    const idx = members.findIndex((m) => m.stripe_subscription_id === subscriptionId);
    
    if (idx >= 0) {
      members[idx] = {
        ...members[idx],
        status: 'payment_failed',
        payment_failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveMembers(members);
      await sendNotifications(members[idx], event.type);
      console.log(`[STRIPE WEBHOOK] Payment failed for ${members[idx].email}`);
    }
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
