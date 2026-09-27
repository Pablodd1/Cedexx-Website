import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const JASMEL_EMAIL = process.env.JASMEL_EMAIL || 'jasmelacosta@gmail.com';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil' as any,
      appInfo: { name: 'CEDEXX', version: '1.0.0' },
    })
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  if (!stripe) {
    return res.status(500).json({ success: false, error: 'Stripe is not configured on this server.' });
  }

  const { email } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email address is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const baseUrl = req.headers.origin || 'https://cedexx.net';

  try {
    // 1. Search for customer in Stripe by email
    const customerList = await stripe.customers.list({
      email: cleanEmail,
      limit: 1,
    });

    if (customerList.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No active billing account found for ${cleanEmail}. Please verify the email used at checkout, or contact support@cedexx.net.`,
      });
    }

    const customerId = customerList.data[0].id;

    // 2. Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/faq`,
    });

    return res.status(200).json({
      success: true,
      url: portalSession.url,
    });
  } catch (err: any) {
    console.error('[STRIPE CUSTOMER PORTAL ERROR]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unable to open Stripe Customer Portal at this moment.',
    });
  }
}
