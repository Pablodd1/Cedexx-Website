import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Stripe Price Map (live mode)
const PRICE_MAP: Record<string, string> = {
  'carenow': 'price_1U6wRRRPzCKs3jKTR9VQCVeS',
  'carenow-mental': 'price_1U6wRSRPzCKs3jKTq0wKVKZU',
  'mental-wellness': 'price_1U6wRSRPzCKs3jKT5P4ibSrd',
  'carecomplete': 'price_1TrKOuRPzCKs3jKTNjuqOOsF',
  'carecomplete-family': 'price_1TrKOuRPzCKs3jKTU8UdSLC2',
};

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil' as any,
      appInfo: { name: 'CEDEXX', version: '1.0.0' },
    })
  : null;

function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, '').trim().substring(0, 500);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Check Stripe is configured
  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured.' });
  }

  const { plan_id, plan, email, first_name, last_name, promo_code } = req.body;

  // Accept plan_id or plan (frontend sends plan_id)
  const selectedPlan = plan_id || plan;

  // Validate
  if (!selectedPlan || !Object.keys(PRICE_MAP).includes(selectedPlan)) {
    return res.status(400).json({ success: false, error: 'Invalid plan selected.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email is required.' });
  }
  if (!first_name || !first_name.trim()) {
    return res.status(400).json({ success: false, error: 'First name is required.' });
  }
  if (!last_name || !last_name.trim()) {
    return res.status(400).json({ success: false, error: 'Last name is required.' });
  }

  const priceId = PRICE_MAP[selectedPlan];
  if (!priceId) {
    return res.status(400).json({ success: false, error: 'Unknown plan.' });
  }

  const baseUrl = req.headers.origin || 'https://cedexx.net';

  try {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer_email: email.toLowerCase().trim(),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment-cancel`,
      metadata: {
        plan: selectedPlan,
        first_name: sanitizeText(first_name),
        last_name: sanitizeText(last_name),
        email: email.toLowerCase().trim(),
        promo_code: promo_code ? sanitizeText(promo_code) : '',
      },
      subscription_data: {
        metadata: {
          plan: selectedPlan,
          first_name: sanitizeText(first_name),
          last_name: sanitizeText(last_name),
        },
      },
    };

    // Apply promo code if provided
    if (promo_code) {
      // Lookup the promotion code
      const promoList = await stripe.promotionCodes.list({
        code: promo_code.toUpperCase().trim(),
        active: true,
        limit: 1,
      });

      if (promoList.data.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid or expired promo code.' });
      }

      sessionConfig.discounts = [{ promotion_code: promoList.data[0].id }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json({ success: true, url: session.url });
  } catch (err: any) {
    console.error('[STRIPE CHECKOUT ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to create checkout session.',
    });
  }
}
