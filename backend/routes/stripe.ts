/**
 * CEDEXX Stripe Integration
 * - Checkout session creation
 * - Webhook handling for payment completion
 * - Post-payment email notifications (patient + admin)
 */

import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ──────────────────────────────────────────────
// ENVIRONMENT
// ──────────────────────────────────────────────
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'jasmelacosta@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://cedexx.net';

// ──────────────────────────────────────────────
// INITIALIZE CLIENTS
// ──────────────────────────────────────────────
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' }) : null;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const router = express.Router();

// ──────────────────────────────────────────────
// PLAN CONFIGURATION
// ──────────────────────────────────────────────
const PLANS: Record<string, { name: string; price: number; description: string }> = {
  family: {
    name: 'CEDEXX Family Plan',
    price: 3499, // $34.99 in cents
    description: 'Household coverage for up to 7 members — 24/7 unlimited consults, $0 copays'
  },
  individual: {
    name: 'CEDEXX Individual Plan',
    price: 1499, // $14.99 in cents
    description: 'Single member 24/7 access — Board-certified physicians, instant pharmacy delivery'
  }
};

// ──────────────────────────────────────────────
// EMAIL TEMPLATES
// ──────────────────────────────────────────────
function buildPatientWelcomeEmail(data: {
  firstName: string;
  plan: string;
  amount: string;
  enrollmentId: string;
  email: string;
}): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#ffffff">
      <div style="background:#050249;color:white;padding:32px 24px;text-align:center">
        <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px">Welcome to CEDEXX</h1>
        <p style="margin:8px 0 0 0;opacity:0.8;font-size:14px">Your wellness membership is being prepared</p>
      </div>
      <div style="padding:32px 24px">
        <p style="font-size:16px;color:#1e293b;margin-bottom:24px">Hi <strong>${data.firstName}</strong>,</p>
        <p style="font-size:15px;color:#334155;line-height:1.6;margin-bottom:24px">
          Thank you for choosing <strong>CEDEXX — Better Care. Here. Now.</strong>, powered by Lyric Health. Your wellness membership is being prepared for activation.
        </p>
        
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px">
          <h3 style="margin:0 0 16px 0;font-size:14px;font-weight:900;color:#050249;text-transform:uppercase;letter-spacing:0.05em">Enrollment Summary</h3>
          <table style="width:100%;font-size:14px;color:#334155">
            <tr><td style="padding:8px 0;font-weight:600">Plan</td><td style="padding:8px 0;text-align:right">${PLANS[data.plan]?.name || data.plan}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600">Amount Paid</td><td style="padding:8px 0;text-align:right;color:#23d9b0;font-weight:700">${data.amount}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600">Enrollment ID</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px">${data.enrollmentId}</td></tr>
          </table>
        </div>
        
        <div style="background:#EBF3FB;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #050249">
          <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:900;color:#050249">What Happens Next?</h3>
          <p style="margin:0 0 16px 0;color:#334155;font-size:14px;line-height:1.6">Follow these simple steps to access your benefits:</p>
          <ol style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.8">
            <li><strong>Allow 24–48 Hours for Activation</strong><br>Please allow 24–48 hours for your membership to become accessible through the Lyric Health app.</li>
            <li><strong>Download the Lyric Health App</strong><br>Download the Lyric Health app on your mobile device.</li>
            <li><strong>Locate Your Membership</strong><br>Open the app and select the link at the bottom right, next to "First Time User?" to locate your membership.</li>
            <li><strong>Verify Your Account</strong><br>Enter your:
              <ul style="margin:8px 0;padding-left:20px">
                <li>Last Name</li>
                <li>Date of Birth</li>
                <li>ZIP Code</li>
              </ul>
            </li>
            <li><strong>Check Your Email</strong><br>Once your account is located and verified, you will receive an email with additional instructions to complete your registration and access your CEDEXX Powered by Lyric Health wellness membership.</li>
          </ol>
          <p style="margin:16px 0 0 0;color:#334155;font-size:14px;line-height:1.6;font-weight:600">That's it! Once activated, you'll be ready to access your CEDEXX wellness benefits through Lyric Health.</p>
        </div>
        
        <p style="font-size:13px;color:#64748b;text-align:center;margin-top:24px">
          Need help? Contact us at <a href="mailto:info@cedexx.net" style="color:#050249">info@cedexx.net</a> or call <strong>954-624-6744</strong>
        </p>
      </div>
      <div style="background:#f8fafc;padding:20px 24px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0">
        <p style="margin:0"><strong>CEDEXX — Better Care. Here. Now.</strong></p>
        <p style="margin:16px 0 0 0;font-size:12px;color:#334155">
          Thanks,<br><br>
          <strong>Daisy Gonzalez</strong><br>
          Founder & CEO<br>
          Direct: 954-624-6744<br>
          Website: www.cedexx.net
        </p>
      </div>
    </div>
  `;
}

function buildAdminNotificationEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  role: string;
  plan: string;
  amount: string;
  enrollmentId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  enrollmentDate: string;
}): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#050249;color:white;padding:20px 24px">
        <h2 style="margin:0;font-size:18px">🎉 New Paid Enrollment</h2>
        <p style="margin:8px 0 0 0;opacity:0.8;font-size:12px">CEDEXX Platform — ${data.enrollmentDate}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc;width:30%">Name</td><td style="padding:8px;border:1px solid #e2e8f0">${data.firstName} ${data.lastName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Email</td><td style="padding:8px;border:1px solid #e2e8f0"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Phone</td><td style="padding:8px;border:1px solid #e2e8f0">${data.phone || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Date of Birth</td><td style="padding:8px;border:1px solid #e2e8f0">${data.dob || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Plan</td><td style="padding:8px;border:1px solid #e2e8f0">${PLANS[data.plan]?.name || data.plan}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Amount</td><td style="padding:8px;border:1px solid #e2e8f0;color:#23d9b0;font-weight:700">${data.amount}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Role</td><td style="padding:8px;border:1px solid #e2e8f0">${data.role}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Enrollment ID</td><td style="padding:8px;border:1px solid #e2e8f0;font-family:monospace;font-size:12px">${data.enrollmentId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Stripe Customer</td><td style="padding:8px;border:1px solid #e2e8f0;font-family:monospace;font-size:12px">${data.stripeCustomerId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc">Stripe Subscription</td><td style="padding:8px;border:1px solid #e2e8f0;font-family:monospace;font-size:12px">${data.stripeSubscriptionId}</td></tr>
      </table>
      <div style="padding:16px 24px;background:#f8fafc;font-size:11px;color:#64748b">
        <p><strong>Action Required:</strong> Verify member identity in admin dashboard.</p>
        <p style="margin-top:8px">HIPAA Notice: Do not share member health information via unsecured channels.</p>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// CHECKOUT SESSION CREATION
// ──────────────────────────────────────────────
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, error: 'Stripe not configured' });
    }

    const { first_name, last_name, email, phone, date_of_birth, role, plan } = req.body;

    // Validate
    if (!first_name || !last_name || !email || !plan) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return res.status(400).json({ success: false, error: 'Invalid plan' });
    }

    // Save enrollment to Supabase (pending_payment status)
    let enrollmentId: string | null = null;
    if (supabase) {
      const { data: inserted, error } = await supabase
        .from('enrollments')
        .insert({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone || null,
          date_of_birth: date_of_birth || null,
          role: role || 'individual',
          plan: plan,
          status: 'pending_payment',
          source: 'website',
        })
        .select()
        .single();

      if (error) {
        console.error('[ENROLL INSERT ERROR]', error);
        return res.status(500).json({ success: false, error: 'Failed to create enrollment' });
      }
      enrollmentId = inserted.id;
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: email.toLowerCase().trim(),
      name: `${first_name} ${last_name}`,
      phone: phone || undefined,
      metadata: {
        enrollment_id: enrollmentId || 'unknown',
        role: role || 'individual',
        plan: plan,
      }
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
            },
            unit_amount: planConfig.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${FRONTEND_URL}/enroll/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/enroll?canceled=true`,
      metadata: {
        enrollment_id: enrollmentId || '',
        first_name: first_name,
        last_name: last_name,
        email: email,
        plan: plan,
        role: role || 'individual',
      },
      subscription_data: {
        metadata: {
          enrollment_id: enrollmentId || '',
        }
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      enrollmentId,
    });
  } catch (err: any) {
    console.error('[STRIPE CHECKOUT ERROR]', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// ──────────────────────────────────────────────
// WEBHOOK HANDLER (Stripe sends events here)
// ──────────────────────────────────────────────
// IMPORTANT: This must use express.raw() body parser, not express.json()
// The route is registered in server.ts with raw body parser
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      console.error('[WEBHOOK] Stripe not configured');
      return res.status(500).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'] as string;
    const payload = req.body as Buffer;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('[WEBHOOK] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    console.log(`[WEBHOOK] Received event: ${event.type}`);

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
    }

    // Handle subscription updates (cancellations, etc.)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancellation(subscription);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('[WEBHOOK ERROR]', err);
    res.status(500).send('Webhook processing error');
  }
});

// ──────────────────────────────────────────────
// PAYMENT SUCCESS HANDLER
// ──────────────────────────────────────────────
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const enrollmentId = metadata.enrollment_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!enrollmentId) {
    console.error('[WEBHOOK] No enrollment_id in session metadata');
    return;
  }

  // Fetch subscription details
  let subscription: Stripe.Subscription | null = null;
  if (subscriptionId && stripe) {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  }

  // Update enrollment in Supabase
  if (supabase) {
    const { data: enrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (fetchError || !enrollment) {
      console.error('[WEBHOOK] Enrollment not found:', enrollmentId);
      return;
    }

    // Update enrollment status to active
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        status: 'active',
        payment_provider: 'stripe',
        payment_reference: session.payment_intent as string,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId);

    if (updateError) {
      console.error('[WEBHOOK] Failed to update enrollment:', updateError);
    }

    // ── SEND CONFIRMATION EMAIL TO PATIENT ──
    if (resend) {
      try {
        await resend.emails.send({
          from: 'CEDEXX <hello@cedexx.net>',
          to: [enrollment.email],
          subject: 'Welcome to CEDEXX — Your wellness membership is being prepared',
          html: buildPatientWelcomeEmail({
            firstName: enrollment.first_name,
            plan: enrollment.plan,
            amount: subscription?.items?.data[0]?.plan?.amount
              ? `$${(subscription.items.data[0].plan.amount / 100).toFixed(2)}/month`
              : PLANS[enrollment.plan]?.price
                ? `$${(PLANS[enrollment.plan].price / 100).toFixed(2)}/month`
                : 'See subscription details',
            enrollmentId: enrollmentId,
            email: enrollment.email,
          }),
        });
        console.log(`[EMAIL] Patient welcome email sent to ${enrollment.email}`);
      } catch (emailErr) {
        console.error('[EMAIL ERROR] Failed to send patient welcome email:', emailErr);
      }
    }

    // ── SEND ADMIN NOTIFICATION TO JASMEL ──
    if (resend) {
      try {
        await resend.emails.send({
          from: 'CEDEXX Notifications <notifications@cedexx.net>',
          to: [ADMIN_NOTIFICATION_EMAIL],
          subject: `🎉 New CEDEXX Enrollment — ${enrollment.first_name} ${enrollment.last_name}`,
          html: buildAdminNotificationEmail({
            firstName: enrollment.first_name,
            lastName: enrollment.last_name,
            email: enrollment.email,
            phone: enrollment.phone || 'N/A',
            dob: enrollment.date_of_birth || 'N/A',
            role: enrollment.role,
            plan: enrollment.plan,
            amount: subscription?.items?.data[0]?.plan?.amount
              ? `$${(subscription.items.data[0].plan.amount / 100).toFixed(2)}/month`
              : PLANS[enrollment.plan]?.price
                ? `$${(PLANS[enrollment.plan].price / 100).toFixed(2)}/month`
                : 'Unknown',
            enrollmentId: enrollmentId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            enrollmentDate: new Date().toLocaleString(),
          }),
        });
        console.log(`[EMAIL] Admin notification sent to ${ADMIN_NOTIFICATION_EMAIL}`);
      } catch (emailErr) {
        console.error('[EMAIL ERROR] Failed to send admin notification:', emailErr);
      }
    }

    console.log(`[WEBHOOK] Enrollment ${enrollmentId} activated and emails sent`);
  }
}

// ──────────────────────────────────────────────
// SUBSCRIPTION UPDATE HANDLER
// ──────────────────────────────────────────────
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const enrollmentId = subscription.metadata?.enrollment_id;
  if (!enrollmentId || !supabase) return;

  const status = subscription.status;
  let enrollmentStatus: string;

  switch (status) {
    case 'active':
    case 'trialing':
      enrollmentStatus = 'active';
      break;
    case 'past_due':
    case 'unpaid':
      enrollmentStatus = 'suspended';
      break;
    case 'canceled':
      enrollmentStatus = 'cancelled';
      break;
    default:
      enrollmentStatus = 'suspended';
  }

  const { error } = await supabase
    .from('enrollments')
    .update({
      status: enrollmentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);

  if (error) {
    console.error('[WEBHOOK] Failed to update subscription status:', error);
  } else {
    console.log(`[WEBHOOK] Enrollment ${enrollmentId} status updated to ${enrollmentStatus}`);
  }
}

// ──────────────────────────────────────────────
// SUBSCRIPTION CANCELLATION HANDLER
// ──────────────────────────────────────────────
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const enrollmentId = subscription.metadata?.enrollment_id;
  if (!enrollmentId || !supabase) return;

  const { error } = await supabase
    .from('enrollments')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);

  if (error) {
    console.error('[WEBHOOK] Failed to cancel enrollment:', error);
  } else {
    console.log(`[WEBHOOK] Enrollment ${enrollmentId} cancelled`);
  }
}

// ──────────────────────────────────────────────
// CHECKOUT STATUS (for success page)
// ──────────────────────────────────────────────
router.get('/checkout-status', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, error: 'Stripe not configured' });
    }

    const { session_id } = req.query;
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ success: false, error: 'Session ID required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      success: true,
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      plan: session.metadata?.plan,
      enrollment_id: session.metadata?.enrollment_id,
    });
  } catch (err: any) {
    console.error('[CHECKOUT STATUS ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve session status' });
  }
});

// ──────────────────────────────────────────────
// CONFIG (for frontend)
// ──────────────────────────────────────────────
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    plans: Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: `$${(plan.price / 100).toFixed(2)}`,
      priceCents: plan.price,
      description: plan.description,
    })),
  });
});

export default router;
export { PLANS };
