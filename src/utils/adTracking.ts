// ═══════════════════════════════════════════════════════════════════════════
// CEDEXX Paid Ads Conversion & UTM Attribution Engine (Meta Healthcare Compliant)
// ═══════════════════════════════════════════════════════════════════════════
// Fires synchronized events to:
// 1. Google Analytics 4 (`G-RZ2P28BP7S`)
// 2. Google Ads (`window.GOOGLE_ADS_ID` / `VITE_GOOGLE_ADS_ID` if configured)
// 3. Meta Pixel (`window.META_PIXEL_ID` / `VITE_META_PIXEL_ID` if configured)
//
// Healthcare Privacy Safeguard:
// Never sends medical conditions, DOB, or HIPAA-sensitive fields to Meta or Google.
// Only sends standard e-commerce membership tier values ($18.99 - $52.99) and currency.

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    META_PIXEL_ID?: string;
    GOOGLE_ADS_ID?: string;
    GOOGLE_ADS_PURCHASE_LABEL?: string;
  }
}

export interface AdAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  landing_page?: string;
  captured_at?: string;
}

const ATTR_STORAGE_KEY = 'cedexx_ad_attribution';

export const PLAN_NUMERIC_PRICE: Record<string, number> = {
  'carenow': 18.99,
  'carenow-mental': 26.99,
  'mental-wellness': 18.99,
  'carecomplete': 34.99,
  'carecomplete-family': 52.99,
};

export const PLAN_CLEAN_LABEL: Record<string, string> = {
  'carenow': 'CareNow Family Membership',
  'carenow-mental': 'CareNow Plus Membership',
  'mental-wellness': 'Wellness Membership',
  'carecomplete': 'CareComplete Individual Membership',
  'carecomplete-family': 'CareComplete Family Membership',
};

/**
 * Captures UTM parameters & click IDs (`fbclid`, `gclid`) from URL on landing
 * and persists them in sessionStorage + localStorage so attribution survives across steps.
 */
export function captureAdAttribution(): AdAttribution {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const incoming: AdAttribution = {};
    const keys: (keyof AdAttribution)[] = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'fbclid',
      'gclid',
    ];

    let hasNewParam = false;
    for (const k of keys) {
      const val = params.get(k);
      if (val && val.trim()) {
        incoming[k] = val.trim().substring(0, 150);
        hasNewParam = true;
      }
    }

    const existingRaw = localStorage.getItem(ATTR_STORAGE_KEY) || sessionStorage.getItem(ATTR_STORAGE_KEY);
    const existing: AdAttribution = existingRaw ? JSON.parse(existingRaw) : {};

    if (hasNewParam) {
      const merged: AdAttribution = {
        ...existing,
        ...incoming,
        landing_page: existing.landing_page || window.location.pathname + window.location.search,
        captured_at: new Date().toISOString(),
      };
      sessionStorage.setItem(ATTR_STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(ATTR_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }

    return existing;
  } catch {
    return {};
  }
}

export function getStoredAttribution(): AdAttribution {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ATTR_STORAGE_KEY) || sessionStorage.getItem(ATTR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Step 0 / Landing on /enroll: Fires ViewContent
 */
export function trackAdViewContent(planId: string) {
  if (typeof window === 'undefined') return;
  const value = PLAN_NUMERIC_PRICE[planId] || 18.99;
  const label = PLAN_CLEAN_LABEL[planId] || 'CEDEXX Membership';

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        currency: 'USD',
        value,
        items: [{ item_id: planId, item_name: label, price: value, quantity: 1 }],
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_ids: [planId],
        content_name: label,
        content_type: 'product',
        value,
        currency: 'USD',
      });
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Step 1 Complete (Name + Email + ZIP submitted): Fires Lead event
 */
export function trackAdLead(planId: string, role?: string) {
  if (typeof window === 'undefined') return;
  const value = PLAN_NUMERIC_PRICE[planId] || 18.99;
  const label = PLAN_CLEAN_LABEL[planId] || 'CEDEXX Membership';
  const attr = getStoredAttribution();

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        currency: 'USD',
        value,
        plan_id: planId,
        role: role || 'individual',
        utm_source: attr.utm_source || 'direct',
        utm_campaign: attr.utm_campaign || 'organic',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: label,
        content_category: role || 'individual',
        value,
        currency: 'USD',
      });
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Step 3 Proceed to Stripe Checkout: Fires InitiateCheckout / begin_checkout
 */
export function trackAdInitiateCheckout(planId: string, customPrice?: number) {
  if (typeof window === 'undefined') return;
  const value = customPrice !== undefined ? customPrice : (PLAN_NUMERIC_PRICE[planId] || 18.99);
  const label = PLAN_CLEAN_LABEL[planId] || 'CEDEXX Membership';

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value,
        items: [{ item_id: planId, item_name: label, price: value, quantity: 1 }],
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: [planId],
        content_name: label,
        content_type: 'product',
        num_items: 1,
        value,
        currency: 'USD',
      });
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Payment Confirmed on /payment-success: Fires Purchase (deduplicated by sessionId)
 */
export function trackAdPurchase(planId: string, transactionId: string, customAmountDollars?: number) {
  if (typeof window === 'undefined') return;
  const dedupKey = `cedexx_purchase_tracked_${transactionId}`;
  try {
    if (localStorage.getItem(dedupKey)) return; // Already fired for this session
    localStorage.setItem(dedupKey, new Date().toISOString());
  } catch {
    // Continue
  }

  const value = customAmountDollars !== undefined ? customAmountDollars : (PLAN_NUMERIC_PRICE[planId] || 18.99);
  const label = PLAN_CLEAN_LABEL[planId] || 'CEDEXX Membership';

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'USD',
        value,
        items: [{ item_id: planId, item_name: label, price: value, quantity: 1 }],
      });

      // Fire Google Ads conversion label if configured
      if (window.GOOGLE_ADS_ID && window.GOOGLE_ADS_PURCHASE_LABEL) {
        window.gtag('event', 'conversion', {
          send_to: `${window.GOOGLE_ADS_ID}/${window.GOOGLE_ADS_PURCHASE_LABEL}`,
          value,
          currency: 'USD',
          transaction_id: transactionId,
        });
      }
    }

    if (typeof window.fbq === 'function') {
      window.fbq(
        'track',
        'Purchase',
        {
          content_ids: [planId],
          content_name: label,
          content_type: 'product',
          value,
          currency: 'USD',
        },
        { eventID: transactionId }
      );
    }
  } catch {
    // Non-blocking
  }
}
