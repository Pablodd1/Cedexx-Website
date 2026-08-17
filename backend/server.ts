/**
 * CEDEXX Backend API Server
 * Express.js + TypeScript with Supabase PostgreSQL + Stripe Payments
 * Endpoints: contact, demo-schedule, enroll, partner-inquiry, admin dashboard, analytics,
 *            create-checkout-session, stripe-webhook
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { createChatRouter } from './routes/chat';

// ──────────────────────────────────────────────
// 1. ENVIRONMENT & CONFIG
// ──────────────────────────────────────────────
dotenv.config();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Resend Email
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_PRICE_FAMILY = process.env.STRIPE_PRICE_FAMILY || '';
const STRIPE_PRICE_INDIVIDUAL = process.env.STRIPE_PRICE_INDIVIDUAL || '';

// Admin Auth
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cedexx-admin-secret-2026';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Rate Limits
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '30');

// Frontend URL (for checkout redirects)
const FRONTEND_URL = process.env.FRONTEND_URL || (
  NODE_ENV === 'production' ? 'https://cedexx.net' : 'http://localhost:5173'
);

// Admin notification recipients
const ADMIN_EMAILS = ['info@cedexx.net', 'jasmelacosta@gmail.com'];

// ──────────────────────────────────────────────
// 2. INITIALIZE CLIENTS
// ──────────────────────────────────────────────
const app = express();
let supabase: SupabaseClient | null = null;
let resend: Resend | null = null;
let stripe: Stripe | null = null;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
} else {
  console.warn('[WARN] Supabase not configured - running in fallback mode');
}

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn('[WARN] Resend not configured - emails will be logged only');
}

if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });
} else {
  console.warn('[WARN] Stripe not configured - payment features disabled');
}

// ──────────────────────────────────────────────
// 3. MIDDLEWARE
// ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: [
    'https://cedexx.net',
    'https://www.cedexx.net',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'],
}));

// ── STRIPE WEBHOOK — must use raw body before express.json() ──
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Global body parsers (everything after webhook)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }
});
app.use('/api/', limiter);

// ── CHAT API ─────────────────────────────────
app.use('/api/chat', createChatRouter());

// ── STRIPE PAYMENT API ───────────────────────
// Import AFTER dotenv.config() so env vars are loaded
import stripeRouter from './routes/stripe';

// Webhook route needs RAW body for Stripe signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRouter);

// All other Stripe routes use JSON
app.use('/api/stripe', express.json({ limit: '10kb' }), stripeRouter);

// Stricter rate limits for form submissions
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// ──────────────────────────────────────────────
// 4. TYPES & INTERFACES
// ──────────────────────────────────────────────
interface ContactForm {
  name: string;
  email: string;
  company?: string | null;
  message: string;
  source?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

interface DemoRequest {
  name: string;
  email: string;
  company?: string | null;
  facility_type?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  notes?: string | null;
  source?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

interface Enrollment {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  role: string;
  plan: string;
  cardholder_name?: string | null;
  billing_address?: string | null;
  status?: string | null;
  source?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

interface PartnerInquiry {
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  message: string;
  organization?: string | null;
  source?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

interface AnalyticsEvent {
  session_id: string;
  event_type: string;
  event_data: Record<string, any>;
  url: string;
  referrer?: string;
  user_agent?: string | null;
  ip_address?: string | null;
}

interface CheckoutSessionRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  role: string;
  plan: 'family' | 'individual';
  cardholder_name?: string | null;
  billing_address?: string | null;
  source?: string | null;
}

// ──────────────────────────────────────────────
// 5. HELPER FUNCTIONS
// ──────────────────────────────────────────────
function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 5000);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

async function sendNotificationEmail(
  subject: string,
  htmlBody: string,
  recipients: string[] = ['info@cedexx.net']
): Promise<boolean> {
  try {
    if (resend) {
      await resend.emails.send({
        from: 'CEDEXX Notifications <notifications@cedexx.net>',
        to: recipients,
        subject,
        html: htmlBody,
      });
      return true;
    }
    console.log('[EMAIL FALLBACK]', { subject, recipients, htmlBody: htmlBody.substring(0, 200) });
    return false;
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
    return false;
  }
}

function buildNotificationHtml(title: string, fields: Record<string, string>): string {
  const rows = Object.entries(fields)
    .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc;width:30%">${k}</td><td style="padding:8px;border:1px solid #e2e8f0">${v || 'N/A'}</td></tr>`)
    .join('');
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#050249;color:white;padding:20px 24px">
        <h2 style="margin:0;font-size:18px">${title}</h2>
        <p style="margin:8px 0 0 0;opacity:0.8;font-size:12px">CEDEXX Platform — ${new Date().toLocaleString()}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <div style="padding:16px 24px;background:#f8fafc;font-size:11px;color:#64748b">
        <p>Reply directly to this email to follow up with the submitter.</p>
        <p>HIPAA Notice: This email contains non-PHI contact information only. Do not include medical details in email replies.</p>
      </div>
    </div>
  `;
}

function buildPatientConfirmationHtml(enrollment: any): string {
  const planName = enrollment.plan === 'family' ? 'Family Plan' : 'Individual Plan';
  const planPrice = enrollment.plan === 'family' ? '$34.99/month' : '$14.99/month';
  const planMembers = enrollment.plan === 'family' ? 'Up to 7 members' : '1 member';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="background:#050249;color:white;padding:32px 24px;text-align:center">
        <h1 style="margin:0;font-size:24px;font-weight:800">Welcome to CEDEXX</h1>
        <p style="margin:8px 0 0 0;opacity:0.9;font-size:14px">Your membership is now active</p>
      </div>
      <div style="padding:32px 24px">
        <p style="font-size:16px;color:#1e293b;margin-bottom:24px">Hi ${enrollment.first_name},</p>
        <p style="font-size:15px;color:#334155;line-height:1.6;margin-bottom:24px">
          Thank you for joining CEDEXX! Your membership has been activated and you now have <strong>24/7 access</strong> to board-certified care.
        </p>

        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px">
          <h3 style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#050249;text-transform:uppercase;letter-spacing:0.05em">Plan Details</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748b">Plan</td><td style="padding:6px 0;font-weight:600;text-align:right">${planName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Price</td><td style="padding:6px 0;font-weight:600;text-align:right">${planPrice}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Coverage</td><td style="padding:6px 0;font-weight:600;text-align:right">${planMembers}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Member ID</td><td style="padding:6px 0;font-weight:600;text-align:right;font-family:monospace;font-size:12px">${enrollment.id}</td></tr>
          </table>
        </div>

        <div style="background:#ebf3fb;border-radius:12px;padding:20px;margin-bottom:24px">
          <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#050249;text-transform:uppercase;letter-spacing:0.05em">What's Next?</h3>
          <ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.8">
            <li>Download the CEDEXX app to access care anytime</li>
            <li>Complete your health profile for personalized care</li>
            <li>Save your Member ID — you'll need it for support</li>
          </ul>
        </div>

        <p style="font-size:14px;color:#64748b;line-height:1.6;margin-bottom:24px">
          Have questions? Contact us anytime:<br>
          📧 <a href="mailto:info@cedexx.net" style="color:#050249;text-decoration:none;font-weight:600">info@cedexx.net</a><br>
          📞 <a href="tel:954-624-6744" style="color:#050249;text-decoration:none;font-weight:600">954-624-6744</a>
        </p>

        <p style="font-size:12px;color:#94a3b8;text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0">
          CEDEXX — Better Care. Here. Now.<br>
          <em>This email confirms your active membership. Keep it for your records.</em>
        </p>
      </div>
    </div>
  `;
}

function buildAdminEnrollmentHtml(enrollment: any, stripeData?: { customerId?: string; subscriptionId?: string; sessionId?: string; paymentIntentId?: string }): string {
  const fields: Record<string, string> = {
    'First Name': enrollment.first_name,
    'Last Name': enrollment.last_name,
    Email: enrollment.email,
    Phone: enrollment.phone || '—',
    'Date of Birth': enrollment.date_of_birth || '—',
    Role: enrollment.role,
    Plan: enrollment.plan,
    'Enrollment ID': enrollment.id,
    Status: enrollment.status || 'pending_payment',
    Source: enrollment.source || 'website',
    'Created At': new Date(enrollment.created_at).toLocaleString(),
  };

  if (stripeData) {
    fields['Stripe Customer ID'] = stripeData.customerId || '—';
    fields['Stripe Subscription ID'] = stripeData.subscriptionId || '—';
    fields['Stripe Session ID'] = stripeData.sessionId || '—';
    fields['Stripe Payment Intent'] = stripeData.paymentIntentId || '—';
  }

  const rows = Object.entries(fields)
    .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc;width:30%">${k}</td><td style="padding:8px;border:1px solid #e2e8f0">${v || 'N/A'}</td></tr>`)
    .join('');

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#23d9b0;color:#050249;padding:20px 24px">
        <h2 style="margin:0;font-size:18px">🎉 New CEDEXX Enrollment — ${enrollment.first_name} ${enrollment.last_name}</h2>
        <p style="margin:8px 0 0 0;font-size:12px;opacity:0.8">${stripeData ? 'Payment confirmed via Stripe' : 'Enrollment submitted — awaiting payment'}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <div style="padding:16px 24px;background:#f8fafc;font-size:11px;color:#64748b">
        <p><a href="${FRONTEND_URL}/admin" style="color:#050249;font-weight:600">View in Admin Dashboard →</a></p>
        <p>HIPAA Notice: This email contains non-PHI contact information only.</p>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// 6. AUTH MIDDLEWARE
// ──────────────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Admin token required' });
  }
  if (token !== ADMIN_TOKEN && token !== ADMIN_SECRET) {
    return res.status(403).json({ success: false, error: 'Invalid admin token' });
  }
  next();
}

// ──────────────────────────────────────────────
// 7. STRIPE WEBHOOK HANDLER
// ──────────────────────────────────────────────
async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  const payload = req.body as Buffer;

  if (!stripe) {
    console.error('[STRIPE WEBHOOK] Stripe not configured');
    return res.status(500).send('Stripe not configured');
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[STRIPE WEBHOOK] Webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[STRIPE WEBHOOK] Received event: ${event.type}`);

  // Handle checkout session completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const enrollmentId = session.metadata?.enrollment_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const sessionId = session.id;
      const paymentIntentId = session.payment_intent as string;

      if (!enrollmentId) {
        console.error('[STRIPE WEBHOOK] No enrollment_id in session metadata');
        return res.status(400).send('Missing enrollment_id');
      }

      // Update enrollment in Supabase
      if (supabase) {
        const { data: enrollment, error: updateError } = await supabase
          .from('enrollments')
          .update({
            status: 'active',
            payment_provider: 'stripe',
            payment_reference: subscriptionId || paymentIntentId || sessionId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_checkout_session_id: sessionId,
            stripe_payment_intent_id: paymentIntentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollmentId)
          .select()
          .single();

        if (updateError) {
          console.error('[STRIPE WEBHOOK] Failed to update enrollment:', updateError);
          // Still return 200 so Stripe doesn't retry indefinitely
          // Log for manual recovery
        }

        if (enrollment) {
          // Send patient confirmation email
          if (resend && isValidEmail(enrollment.email)) {
            await resend.emails.send({
              from: 'CEDEXX <hello@cedexx.net>',
              to: [enrollment.email],
              subject: 'Welcome to CEDEXX — Your membership is active',
              html: buildPatientConfirmationHtml(enrollment),
            }).catch((err: any) => console.error('[EMAIL ERROR] Patient confirmation:', err));
          }

          // Send admin notification
          await sendNotificationEmail(
            `🎉 New CEDEXX Enrollment — ${enrollment.first_name} ${enrollment.last_name}`,
            buildAdminEnrollmentHtml(enrollment, {
              customerId,
              subscriptionId,
              sessionId,
              paymentIntentId,
            }),
            ADMIN_EMAILS
          );
        }
      }
    } catch (err: any) {
      console.error('[STRIPE WEBHOOK] Error processing checkout.session.completed:', err);
      // Return 200 to prevent Stripe retries — log for manual recovery
    }
  }

  // Acknowledge receipt
  res.status(200).json({ received: true });
}

// ──────────────────────────────────────────────
// 8. API ROUTES — PUBLIC
// ──────────────────────────────────────────────

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    services: {
      supabase: !!supabase,
      resend: !!resend,
      stripe: !!stripe,
    }
  });
});

// ── CONTACT FORM ─────────────────────────────
app.post('/api/contact',
  formLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('company').optional().trim().isLength({ max: 100 }),
    body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Message must be 10-3000 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const data: ContactForm = {
      name: sanitizeText(req.body.name),
      email: req.body.email.toLowerCase().trim(),
      company: req.body.company ? sanitizeText(req.body.company) : null,
      message: sanitizeText(req.body.message),
      source: req.body.source || 'website',
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']?.substring(0, 500) || null,
    };

    try {
      // Save to Supabase
      let dbResult = null;
      if (supabase) {
        const { data: inserted, error } = await supabase
          .from('contacts')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        dbResult = inserted;
      }

      // Send notification email
      await sendNotificationEmail(
        `New Contact Form Submission — ${data.name}`,
        buildNotificationHtml('Contact Form Submission', {
          Name: data.name,
          Email: data.email,
          Company: data.company || '—',
          Message: data.message.replace(/\n/g, '<br>'),
          Source: data.source || 'website',
          'Submission ID': dbResult?.id || 'fallback',
        })
      );

      // Send auto-reply to user
      if (resend && isValidEmail(data.email)) {
        await resend.emails.send({
          from: 'CEDEXX <hello@cedexx.net>',
          to: [data.email],
          subject: 'We received your message — CEDEXX',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
              <h2 style="color:#050249">Thank you for reaching out, ${data.name}!</h2>
              <p>We've received your message and will respond within <strong>1 business day</strong>.</p>
              <p style="color:#64748b;font-size:12px">If this is a medical emergency, please call 911 immediately.</p>
              <hr style="border:0;border-top:1px solid #e2e8f0;margin:20px 0">
              <p style="font-size:11px;color:#94a3b8">CEDEXX — Better Care. Here. Now.</p>
            </div>
          `
        });
      }

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        id: dbResult?.id || null,
      });
    } catch (err: any) {
      console.error('[CONTACT ERROR]', err);
      res.status(500).json({
        success: false,
        error: 'Failed to process contact form. Please try again later.',
        detail: NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

// ── DEMO SCHEDULE ────────────────────────────
app.post('/api/demo',
  formLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('company').optional().trim().isLength({ max: 100 }),
    body('facility_type').optional().trim().isLength({ max: 100 }),
    body('preferred_date').optional().isISO8601().toDate(),
    body('preferred_time').optional().trim().isLength({ max: 50 }),
    body('notes').optional().trim().isLength({ max: 2000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const data: DemoRequest = {
      name: sanitizeText(req.body.name),
      email: req.body.email.toLowerCase().trim(),
      company: req.body.company ? sanitizeText(req.body.company) : null,
      facility_type: req.body.facility_type ? sanitizeText(req.body.facility_type) : null,
      preferred_date: req.body.preferred_date || null,
      preferred_time: req.body.preferred_time ? sanitizeText(req.body.preferred_time) : null,
      notes: req.body.notes ? sanitizeText(req.body.notes) : null,
      source: req.body.source || 'website',
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']?.substring(0, 500) || null,
    };

    try {
      let dbResult = null;
      if (supabase) {
        const { data: inserted, error } = await supabase
          .from('demo_requests')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        dbResult = inserted;
      }

      await sendNotificationEmail(
        `New Demo Request — ${data.name}`,
        buildNotificationHtml('Demo Schedule Request', {
          Name: data.name,
          Email: data.email,
          Company: data.company || '—',
          'Facility Type': data.facility_type || '—',
          'Preferred Date': data.preferred_date || '—',
          'Preferred Time': data.preferred_time || '—',
          Notes: (data.notes || '—').replace(/\n/g, '<br>'),
          'Request ID': dbResult?.id || 'fallback',
        })
      );

      res.status(201).json({
        success: true,
        message: 'Demo request submitted. We will confirm within 1 business day.',
        id: dbResult?.id || null,
      });
    } catch (err: any) {
      console.error('[DEMO ERROR]', err);
      res.status(500).json({
        success: false,
        error: 'Failed to process demo request.',
        detail: NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

// ── CREATE CHECKOUT SESSION (Stripe) ──────────
app.post('/api/create-checkout-session',
  formLimiter,
  [
    body('first_name').trim().isLength({ min: 1, max: 50 }).withMessage('First name required'),
    body('last_name').trim().isLength({ min: 1, max: 50 }).withMessage('Last name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').optional().trim().isLength({ max: 30 }),
    body('date_of_birth').optional().isISO8601().toDate(),
    body('role').trim().isIn(['individual', 'hospitality', 'housing', 'affiliate']).withMessage('Invalid role'),
    body('plan').trim().isIn(['family', 'individual']).withMessage('Invalid plan'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Payment service unavailable' });
    }

    if (!STRIPE_PRICE_FAMILY || !STRIPE_PRICE_INDIVIDUAL) {
      return res.status(503).json({ success: false, error: 'Payment pricing not configured' });
    }

    const plan = req.body.plan as 'family' | 'individual';
    const priceId = plan === 'family' ? STRIPE_PRICE_FAMILY : STRIPE_PRICE_INDIVIDUAL;

    const enrollmentData: Enrollment = {
      first_name: sanitizeText(req.body.first_name),
      last_name: sanitizeText(req.body.last_name),
      email: req.body.email.toLowerCase().trim(),
      phone: req.body.phone ? sanitizeText(req.body.phone) : null,
      date_of_birth: req.body.date_of_birth || null,
      role: req.body.role,
      plan: plan,
      cardholder_name: req.body.cardholder_name ? sanitizeText(req.body.cardholder_name) : null,
      billing_address: req.body.billing_address ? sanitizeText(req.body.billing_address) : null,
      status: 'pending_payment',
      source: req.body.source || 'website',
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']?.substring(0, 500) || null,
    };

    try {
      // Save enrollment to Supabase
      let enrollmentRecord: any = null;
      if (supabase) {
        const { data: inserted, error } = await supabase
          .from('enrollments')
          .insert(enrollmentData)
          .select()
          .single();
        if (error) throw error;
        enrollmentRecord = inserted;
      } else {
        return res.status(503).json({ success: false, error: 'Database unavailable' });
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: enrollmentData.email,
        name: `${enrollmentData.first_name} ${enrollmentData.last_name}`,
        phone: enrollmentData.phone || undefined,
        metadata: {
          enrollment_id: enrollmentRecord.id,
          plan: enrollmentData.plan,
        },
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&enrollment_id=${enrollmentRecord.id}`,
        cancel_url: `${FRONTEND_URL}/enroll?canceled=true`,
        metadata: {
          enrollment_id: enrollmentRecord.id,
          plan: enrollmentData.plan,
        },
        subscription_data: {
          metadata: {
            enrollment_id: enrollmentRecord.id,
          },
        },
        customer_email: enrollmentData.email,
      });

      // Update enrollment with checkout session ID
      await supabase
        .from('enrollments')
        .update({
          stripe_checkout_session_id: session.id,
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', enrollmentRecord.id);

      // Send admin notification (payment pending)
      await sendNotificationEmail(
        `New Enrollment (Pending Payment) — ${enrollmentData.first_name} ${enrollmentData.last_name}`,
        buildAdminEnrollmentHtml(enrollmentRecord),
        ADMIN_EMAILS
      );

      res.status(200).json({
        success: true,
        url: session.url,
        enrollment_id: enrollmentRecord.id,
      });
    } catch (err: any) {
      console.error('[CHECKOUT ERROR]', err);
      res.status(500).json({
        success: false,
        error: 'Failed to create checkout session. Please try again.',
        detail: NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

// ── ENROLLMENT (legacy — still available for direct enroll) ──
app.post('/api/enroll',
  formLimiter,
  [
    body('first_name').trim().isLength({ min: 1, max: 50 }).withMessage('First name required'),
    body('last_name').trim().isLength({ min: 1, max: 50 }).withMessage('Last name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').optional().trim().isLength({ max: 30 }),
    body('date_of_birth').optional().isISO8601().toDate(),
    body('role').trim().isIn(['individual', 'hospitality', 'housing', 'affiliate']).withMessage('Invalid role'),
    body('plan').trim().isIn(['family', 'individual']).withMessage('Invalid plan'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const data: Enrollment = {
      first_name: sanitizeText(req.body.first_name),
      last_name: sanitizeText(req.body.last_name),
      email: req.body.email.toLowerCase().trim(),
      phone: req.body.phone ? sanitizeText(req.body.phone) : null,
      date_of_birth: req.body.date_of_birth || null,
      role: req.body.role,
      plan: req.body.plan,
      cardholder_name: req.body.cardholder_name ? sanitizeText(req.body.cardholder_name) : null,
      billing_address: req.body.billing_address ? sanitizeText(req.body.billing_address) : null,
      status: 'pending_payment',
      source: req.body.source || 'website',
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']?.substring(0, 500) || null,
    };

    try {
      let dbResult = null;
      if (supabase) {
        const { data: inserted, error } = await supabase
          .from('enrollments')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        dbResult = inserted;
      }

      // Send notification to ALL admin emails
      await sendNotificationEmail(
        `New Enrollment — ${data.first_name} ${data.last_name}`,
        buildNotificationHtml('New Enrollment Submission', {
          'First Name': data.first_name,
          'Last Name': data.last_name,
          Email: data.email,
          Phone: data.phone || '—',
          'Date of Birth': data.date_of_birth || '—',
          Role: data.role,
          Plan: data.plan,
          'Enrollment ID': dbResult?.id || 'fallback',
        }),
        ADMIN_EMAILS
      );

      res.status(201).json({
        success: true,
        message: 'Enrollment initiated. Please complete payment to activate your membership.',
        id: dbResult?.id || null,
        next_step: 'payment',
        plan_details: {
          family: { name: 'Family Plan', price: '$34.99/month', members: 'Up to 7' },
          individual: { name: 'Individual Plan', price: '$14.99/month', members: '1' },
        }[data.plan],
      });
    } catch (err: any) {
      console.error('[ENROLL ERROR]', err);
      res.status(500).json({
        success: false,
        error: 'Failed to process enrollment.',
        detail: NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

// ── PARTNER INQUIRY ──────────────────────────
app.post('/api/partner',
  formLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').optional().trim().isLength({ max: 30 }),
    body('role').trim().isLength({ min: 1, max: 50 }).withMessage('Role is required'),
    body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Message must be 10-3000 characters'),
    body('organization').optional().trim().isLength({ max: 100 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const data: PartnerInquiry = {
      name: sanitizeText(req.body.name),
      email: req.body.email.toLowerCase().trim(),
      phone: req.body.phone ? sanitizeText(req.body.phone) : null,
      role: sanitizeText(req.body.role),
      message: sanitizeText(req.body.message),
      organization: req.body.organization ? sanitizeText(req.body.organization) : null,
      source: req.body.source || 'website',
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']?.substring(0, 500) || null,
    };

    try {
      let dbResult = null;
      if (supabase) {
        const { data: inserted, error } = await supabase
          .from('partner_inquiries')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        dbResult = inserted;
      }

      await sendNotificationEmail(
        `New Partnership Inquiry — ${data.name}`,
        buildNotificationHtml('Partnership Inquiry', {
          Name: data.name,
          Email: data.email,
          Phone: data.phone || '—',
          Role: data.role,
          Organization: data.organization || '—',
          Message: data.message.replace(/\n/g, '<br>'),
          'Inquiry ID': dbResult?.id || 'fallback',
        })
      );

      res.status(201).json({
        success: true,
        message: 'Partnership inquiry submitted. Our team will contact you within 1 business day.',
        id: dbResult?.id || null,
      });
    } catch (err: any) {
      console.error('[PARTNER ERROR]', err);
      res.status(500).json({
        success: false,
        error: 'Failed to process partner inquiry.',
        detail: NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

// ── ANALYTICS EVENTS ─────────────────────────
app.post('/api/analytics',
  rateLimit({ windowMs: 60000, max: 100 }),
  async (req: Request, res: Response) => {
    const { site_id, events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, error: 'Events array required' });
    }

    const sanitized = events.slice(0, 50).map((e: any) => ({
      site_id: site_id || 'cedexx',
      session_id: (e.session_id || 'unknown').toString().substring(0, 50),
      event_type: (e.type || 'unknown').toString().substring(0, 50),
      event_data: e.data || {},
      url: (e.url || req.headers.referer || '').toString().substring(0, 500),
      referrer: (e.referrer || req.headers.referer || '').toString().substring(0, 500),
      user_agent: req.headers['user-agent']?.substring(0, 500) || null,
      ip_address: getClientIp(req),
      created_at: e.timestamp ? new Date(e.timestamp).toISOString() : new Date().toISOString(),
    }));

    try {
      if (supabase) {
        const { error } = await supabase.from('analytics_events').insert(sanitized);
        if (error) throw error;
      }
      res.status(202).json({ success: true, received: sanitized.length });
    } catch (err: any) {
      console.error('[ANALYTICS ERROR]', err);
      res.status(500).json({ success: false, error: 'Failed to log analytics' });
    }
  }
);

// ──────────────────────────────────────────────
// 9. API ROUTES — ADMIN (PROTECTED)
// ──────────────────────────────────────────────

// Admin overview stats
app.get('/api/admin/dashboard', requireAdmin, async (_req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.json({
        success: true,
        data: { fallback: true, message: 'Supabase not connected' }
      });
    }

    const tables = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries', 'analytics_events'];
    const counts: Record<string, number> = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table as string)
        .select('*', { count: 'exact', head: true });
      counts[table] = error ? 0 : (count || 0);
    }

    // Recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysIso = sevenDaysAgo.toISOString();

    const recentPromises = tables.filter(t => t !== 'analytics_events').map(async (table) => {
      const { data, error } = await supabase
        .from(table as string)
        .select('*')
        .gte('created_at', sevenDaysIso)
        .order('created_at', { ascending: false })
        .limit(5);
      return { table, data: error ? [] : data };
    });

    const recent = await Promise.all(recentPromises);

    res.json({
      success: true,
      data: {
        counts,
        recent_submissions: Object.fromEntries(recent.map(r => [r.table, r.data])),
        today_submissions: counts,
        last_updated: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generic table list endpoint
app.get('/api/admin/:table', requireAdmin, async (req: Request, res: Response) => {
  const allowedTables = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries', 'analytics_events'];
  const table = req.params.table;

  if (!allowedTables.includes(table as string)) {
    return res.status(400).json({ success: false, error: 'Invalid table name' });
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  try {
    if (!supabase) {
      return res.json({ success: true, data: [], fallback: true });
    }

    let query = supabase
      .from(table as string)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update record status
app.patch('/api/admin/:table/:id', requireAdmin, async (req: Request, res: Response) => {
  const allowedTables = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries'];
  const table = req.params.table;
  const id = req.params.id;

  if (!allowedTables.includes(table as string)) {
    return res.status(400).json({ success: false, error: 'Invalid table name' });
  }

  const { status, notes } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status field required' });
  }

  try {
    if (!supabase) {
      return res.json({ success: true, message: 'Fallback mode — no database update' });
    }

    const { data, error } = await supabase
      .from(table as string)
      .update({ status, notes, updated_at: new Date().toISOString() })
      .eq('id', id as string)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete record
app.delete('/api/admin/:table/:id', requireAdmin, async (req: Request, res: Response) => {
  const allowedTables = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries'];
  const table = req.params.table;
  const id = req.params.id;

  if (!allowedTables.includes(table as string)) {
    return res.status(400).json({ success: false, error: 'Invalid table name' });
  }

  try {
    if (!supabase) {
      return res.json({ success: true, message: 'Fallback mode — no database delete' });
    }

    const { error } = await supabase.from(table as string).delete().eq('id', id as string);
    if (error) throw error;

    res.json({ success: true, message: 'Record deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Analytics dashboard
app.get('/api/admin/analytics/summary', requireAdmin, async (req: Request, res: Response) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days as string) || 30));

  try {
    if (!supabase) {
      return res.json({ success: true, data: [], fallback: true });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily event counts
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Aggregate
    const daily: Record<string, Record<string, number>> = {};
    const eventTypes: Record<string, number> = {};

    (events || []).forEach((e: any) => {
      const day = e.created_at.split('T')[0];
      if (!daily[day]) daily[day] = {};
      if (!daily[day][e.event_type]) daily[day][e.event_type] = 0;
      daily[day][e.event_type]++;

      if (!eventTypes[e.event_type]) eventTypes[e.event_type] = 0;
      eventTypes[e.event_type]++;
    });

    // Conversion funnel (form_submit events)
    const { data: conversions } = await supabase
      .from('analytics_events')
      .select('event_data, created_at')
      .eq('event_type', 'form_submit')
      .gte('created_at', startDate.toISOString());

    const formTypes: Record<string, number> = {};
    (conversions || []).forEach((c: any) => {
      const formId = c.event_data?.form_id || 'unknown';
      formTypes[formId] = (formTypes[formId] || 0) + 1;
    });

    // Popular pages
    const { data: pageViews } = await supabase
      .from('analytics_events')
      .select('url')
      .eq('event_type', 'click')
      .gte('created_at', startDate.toISOString());

    const pageCounts: Record<string, number> = {};
    (pageViews || []).forEach((p: any) => {
      const url = p.url?.replace(/^https?:\/\/[^\/]+/, '') || '/';
      pageCounts[url] = (pageCounts[url] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        period_days: days,
        daily_breakdown: daily,
        event_type_summary: eventTypes,
        conversion_funnel: formTypes,
        popular_pages: Object.entries(pageCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20),
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────
// 10. ERROR HANDLING
// ──────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ──────────────────────────────────────────────
// 11. START SERVER
// ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║  CEDEXX Backend API                           ║
║  Port: ${PORT.toString().padEnd(38, ' ')}║
║  Environment: ${NODE_ENV.padEnd(30, ' ')}║
║  Supabase: ${(!!supabase ? 'connected' : 'fallback').padEnd(32, ' ')}║
║  Resend: ${(!!resend ? 'connected' : 'fallback').padEnd(34, ' ')}║
║  Stripe: ${(!!stripe ? 'connected' : 'disabled').padEnd(34, ' ')}║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;
