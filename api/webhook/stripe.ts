import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendPaymentConfirmation, sendAdminNotification } from './client-email';
import { notifyAdmin } from './notify';
import { alertCritical } from './critical-alert';
import { readMembers, writeMembers } from './github-db';

/**
 * POST /api/webhook/stripe
 * Stripe webhook handler for payment events
 * 
 * Flow:
 * 1. Receives Stripe event (checkout completed, payment failed, subscription cancelled)
 * 2. Updates member status in GitHub DB
 * 3. Sends confirmation email to patient
 * 4. Sends admin notification (email + Telegram)
 * 5. Triggers Lyric Health bridge
 * 
 * Critical errors alert Jasmel immediately
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  const event = req.body;

  // Log webhook received
  console.log('[STRIPE WEBHOOK] Event received:', {
    type: event?.type,
    id: event?.id,
    timestamp: new Date().toISOString(),
  });

  try {
    const members = await readMembers();
    let updated = false;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_email || session.customer_details?.email;
        const metadata = session.metadata || {};
        
        if (!email) {
          console.error('[STRIPE WEBHOOK] No email in session');
          break;
        }

        const member = members.find((m: any) => m.email === email);
        if (!member) {
          console.error('[STRIPE WEBHOOK] Member not found for email:', email);
          // Alert but don't fail — member might register after payment
          await alertCritical(
            new Error(`Payment received but member not found: ${email}`),
            {
              endpoint: '/api/webhook/stripe',
              patientEmail: email,
              stripeSessionId: session.id,
            }
          );
          break;
        }

        // Update member status
        member.status = 'paid';
        member.paid_at = new Date().toISOString();
        member.stripe_session_id = session.id;
        member.stripe_customer_id = session.customer;
        member.stripe_subscription_id = session.subscription;
        member.plan = member.plan || metadata.plan || '';
        updated = true;

        console.log('[STRIPE WEBHOOK] Member paid:', {
          email: member.email,
          plan: member.plan,
          amount: session.amount_total,
        });

        // ─── SEND NOTIFICATIONS (fire-and-forget) ───
        const notifyPayload = {
          type: 'payment' as const,
          first_name: member.first_name || metadata.first_name || '',
          last_name: member.last_name || metadata.last_name || '',
          email: member.email,
          phone: member.phone || '',
          plan: member.plan,
          amount: session.amount_total || 0,
          stripe_session_id: session.id,
        };

        // Run all notifications in parallel, catch errors
        Promise.allSettled([
          // 1. Send payment confirmation to patient
          sendPaymentConfirmation({
            first_name: member.first_name || metadata.first_name || '',
            last_name: member.last_name || metadata.last_name || '',
            email: member.email,
            plan: member.plan,
            amount: session.amount_total,
            stripe_session_id: session.id,
          }),

          // 2. Notify admin (email + Telegram + SMS)
          notifyAdmin(notifyPayload),

          // 3. Send to Lyric Health enrollment team
          sendToLyric(member, session),
        ]).then((results) => {
          // Log any failures
          results.forEach((result, idx) => {
            if (result.status === 'rejected') {
              console.error(`[STRIPE WEBHOOK] Notification ${idx} failed:`, result.reason);
            }
          });
        }).catch(() => {});

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const email = invoice.customer_email;
        
        if (!email) break;

        const member = members.find((m: any) => m.email === email);
        if (member) {
          member.status = 'payment_failed';
          member.payment_failed_at = new Date().toISOString();
          updated = true;

          // Notify admin of payment failure
          Promise.allSettled([
            notifyAdmin({
              type: 'payment' as const,
              first_name: member.first_name,
              last_name: member.last_name,
              email: member.email,
              phone: member.phone || '',
              plan: member.plan || '',
              amount: invoice.amount_due || 0,
              stripe_session_id: invoice.id,
            }),
            alertCritical(
              new Error(`Payment failed for ${member.email}`),
              {
                endpoint: '/api/webhook/stripe',
                patientEmail: member.email,
                patientName: `${member.first_name} ${member.last_name}`,
                plan: member.plan,
                stripeSessionId: invoice.id,
              }
            ),
          ]).catch(() => {});
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const member = members.find((m: any) => m.stripe_customer_id === customerId);
        
        if (member) {
          member.status = 'cancelled';
          member.cancelled_at = new Date().toISOString();
          updated = true;

          // Notify admin of cancellation
          Promise.allSettled([
            notifyAdmin({
              type: 'registration' as const,
              first_name: member.first_name,
              last_name: member.last_name,
              email: member.email,
              phone: member.phone || '',
              plan: member.plan || '',
            }),
          ]).catch(() => {});
        }
        break;
      }
    }

    if (updated) {
      await writeMembers(members);
      console.log('[STRIPE WEBHOOK] Members DB updated');
    }

    res.status(200).json({ received: true });

  } catch (err: any) {
    console.error('[STRIPE WEBHOOK ERROR]', err);

    // CRITICAL: Alert Jasmel immediately
    await alertCritical(err, {
      endpoint: '/api/webhook/stripe',
      originalError: err,
    });

    // Still return 200 to Stripe to prevent retries
    // (we've already alerted, so manual intervention needed)
    res.status(200).json({ 
      received: true, 
      warning: 'Processing error occurred — admin alerted' 
    });
  }
}

// ─── Send to Lyric Health ───
async function sendToLyric(member: any, session: any) {
  try {
    const res = await fetch('https://cedexx.net/api/bridge/lyric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patient_id: member.id,
        patient: {
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          email: member.email,
          phone: member.phone || '',
          dob: member.dob || '',
          plan: member.plan,
          paid_at: member.paid_at,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        }
      }),
    });

    if (!res.ok) {
      throw new Error(`Lyric bridge returned ${res.status}`);
    }

    console.log('[STRIPE WEBHOOK] Lyric bridge success');
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK] Lyric bridge failed:', err);
    
    // Alert but don't fail the webhook
    await alertCritical(
      new Error(`Lyric bridge failed: ${err.message}`),
      {
        endpoint: '/api/webhook/stripe → /api/bridge/lyric',
        patientEmail: member.email,
        patientName: `${member.first_name} ${member.last_name}`,
        plan: member.plan,
        stripeSessionId: session.id,
      }
    );
  }
}
