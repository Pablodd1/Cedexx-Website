import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil' as any,
      appInfo: { name: 'CEDEXX', version: '1.0.0' },
    })
  : null;

// Price map for calculating discounted amounts
const PRICE_CENTS: Record<string, number> = {
  'carenow': 1899,
  'carenow-mental': 2699,
  'mental-wellness': 1899,
  'carecomplete': 3499,
  'carecomplete-family': 5299,
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Stripe not configured' });
  }

  const { code, plan_id } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'Promo code required' });
  }

  const normalizedCode = code.toUpperCase().trim();

  try {
    // DEBUG: Show which Stripe account this key belongs to
    const account = await stripe.accounts.retrieve();
    console.log('[PROMO DEBUG] Stripe account:', account.id, account.email);

    let coupon: Stripe.Coupon | null = null;
    let promoCodeId: string | null = null;

    // ─── Strategy 1: Look up as a Promotion Code (customer-facing code) ───
    const promoList = await stripe.promotionCodes.list({
      code: normalizedCode,
      active: true,
      limit: 1,
    });

    console.log('[PROMO DEBUG] PromotionCodes.search for', normalizedCode, 'found', promoList.data.length);

    if (promoList.data.length > 0) {
      const promo = promoList.data[0];
      coupon = promo.coupon;
      promoCodeId = promo.id;
      console.log('[PROMO DEBUG] Found via PromotionCode:', promo.id, '→ coupon:', coupon?.id);
    }

    // ─── Strategy 2: Look up as a Coupon (direct coupon ID) ───
    if (!coupon) {
      try {
        const couponResult = await stripe.coupons.retrieve(normalizedCode.toLowerCase());
        if (couponResult && !couponResult.deleted) {
          coupon = couponResult;
          console.log('[PROMO DEBUG] Found via Coupon ID:', coupon.id);
        }
      } catch (err) {
        console.log('[PROMO DEBUG] Coupon lookup failed (expected if not a coupon):', (err as Error).message);
      }
    }

    if (!coupon) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired promo code',
        debug: `Checked account ${account.id}. No promotion code or coupon found for "${normalizedCode}".`,
      });
    }

    // Calculate discount
    const planCents = plan_id ? (PRICE_CENTS[plan_id] || 0) : 0;
    let discountedCents = planCents;

    if (coupon.percent_off) {
      discountedCents = Math.round(planCents * (1 - coupon.percent_off / 100));
    } else if (coupon.amount_off) {
      discountedCents = Math.max(0, planCents - coupon.amount_off);
    }

    return res.status(200).json({
      success: true,
      valid: true,
      code: normalizedCode,
      promo_code_id: promoCodeId,
      coupon_id: coupon.id,
      percent_off: coupon.percent_off || null,
      amount_off: coupon.amount_off || null,
      original_price: planCents > 0 ? formatPrice(planCents) : null,
      discounted_price: planCents > 0 ? formatPrice(discountedCents) : null,
    });
  } catch (err: any) {
    console.error('[PROMO VALIDATION ERROR]', err);
    return res.status(500).json({ success: false, error: 'Unable to validate promo code', detail: err.message });
  }
}
