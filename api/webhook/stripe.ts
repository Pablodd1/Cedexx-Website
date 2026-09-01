import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readMembers, updateMember } from '../lib/github-db';
import { notifyAdmin } from '../notify';

async function sendNotifications(member: any, eventType: string) {
  const isPaid = eventType === 'checkout.session.completed';
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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-06-30.basil' as any });
  const sig = req.headers['stripe-signature'] || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK]', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    const members = await readMembers();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = (session.customer_details?.email || '').toLowerCase().trim();
      const sessionId = session.id;

      let member = members.find((m) => m.stripe_session_id === sessionId);
      if (!member && customerEmail) member = members.find((m) => m.email === customerEmail);

      if (member) {
        const amount = (session.amount_total || 0) / 100;
        await updateMember(member.id, {
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
          stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
          amount,
        });
        await sendNotifications({ ...member, amount }, 'checkout.session.completed');
      }
    }
    else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const member = members.find((m) => m.stripe_session_id === session.id);
      if (member) {
        await updateMember(member.id, { status: 'expired', checkout_expired_at: new Date().toISOString() });
        await sendNotifications(member, 'checkout.session.expired');
      }
    }
    else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
      const member = members.find((m) => m.stripe_customer_id === customerId);
      if (member) {
        await updateMember(member.id, { status: 'failed', payment_failed_at: new Date().toISOString() });
        await sendNotifications(member, 'invoice.payment_failed');
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[WEBHOOK PROCESSING ERROR]', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
