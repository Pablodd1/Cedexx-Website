import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendCustomerEnrollmentEmails } from '../client-email.js';
import { callLyricApi, getMemberId } from '../bridge/lyric.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const JASMEL_EMAIL = process.env.JASMEL_EMAIL || 'jasmelacosta@gmail.com';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '8834617573:AAGANwBh_xp-MIZpqukctS2OAuJ2zxJOnrU';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '7838956683';

const REVERSE_PRICE_MAP: Record<string, string> = {
  'price_1U6wRRRPzCKs3jKTR9VQCVeS': 'carenow',
  'price_1U6wRSRPzCKs3jKTq0wKVKZU': 'carenow-mental',
  'price_1U6wRSRPzCKs3jKT5P4ibSrd': 'mental-wellness',
  'price_1TrKOuRPzCKs3jKTNjuqOOsF': 'carecomplete',
  'price_1TrKOuRPzCKs3jKTU8UdSLC2': 'carecomplete-family',
};

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  'carenow': 'CareNow™',
  'carenow-mental': 'CareNow™ + Mental Wellness',
  'mental-wellness': 'Mental Wellness',
  'carecomplete': 'CareComplete™',
  'carecomplete-family': 'CareComplete™ Family',
};

let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (stripeClient) return stripeClient;
  if (process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil' as any,
      appInfo: { name: 'CEDEXX', version: '1.0.0' },
    });
  }
  return stripeClient;
}

async function readMembers(): Promise<any[]> {
  if (!GITHUB_TOKEN) return [];
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.content ? JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')).members || [] : [];
  } catch (e) {
    console.error('[VERIFY SESSION DB READ ERROR]', e);
    return [];
  }
}

async function writeMembers(members: any[]): Promise<boolean> {
  if (!GITHUB_TOKEN) return false;
  let attempts = 0;
  const maxAttempts = 3;
  let delayMs = 300;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      let sha: string | undefined;
      let created_at = new Date().toISOString();
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
        if (fileData.content) {
          try {
            const parsed = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
            if (parsed.created_at) created_at = parsed.created_at;
          } catch (_) {}
        }
      }

      const payload = { members, created_at, version: '1.0' };
      const putRes = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Verify & activate member payment status (session verification)`,
            content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
            sha,
            branch: 'main',
          }),
        }
      );

      if (putRes.ok) {
        return true;
      }

      if (putRes.status === 409 && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
        continue;
      }
      break;
    } catch (e) {
      console.error(`[VERIFY SESSION DB WRITE ERROR attempt ${attempts}]`, e);
      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
      }
    }
  }
  return false;
}

async function sendPaymentConfirmation(data: any) {
  if (!RESEND_KEY) return;
  const planKey = data.plan || 'carenow';
  const planName = PLAN_DISPLAY_NAMES[planKey] || planKey;
  const amountStr = data.amount ? `$${(data.amount / 100).toFixed(2)}` : '$18.99/mo';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F8FAFC;color:#1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <tr>
                <td style="background:#050249;padding:36px 32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;font-style:italic;">CEDEXX</h1>
                  <p style="margin:8px 0 0;color:#23d9b0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Membership Confirmed & Active</p>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 32px;">
                  <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#050249;">Welcome, ${data.first_name}!</h2>
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
                    Thank you for enrolling with CEDEXX. Your payment of <strong>${amountStr}</strong> for <strong>${planName}</strong> has been processed successfully.
                  </p>
                  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:20px;margin-bottom:28px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                      <span style="font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">✓ Membership Status</span>
                      <span style="background:#166534;color:#ffffff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;text-transform:uppercase;">Active</span>
                    </div>
                    <p style="margin:4px 0 0;font-size:14px;color:#15803d;">
                      Plan: <strong>${planName}</strong> • Rate: <strong>${amountStr}</strong>
                    </p>
                  </div>
                  <div style="background:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0;font-size:13px;color:#475569;line-height:1.6;">
                    <p style="margin:0 0 8px;font-weight:700;color:#050249;">Need Assistance?</p>
                    <p style="margin:0 0 6px;">
                      • <strong>Lyric Health Member Services:</strong> <a href="tel:18662238831" style="color:#050249;font-weight:700;text-decoration:none;">1-866-223-8831</a> (24/7 care & app help)
                    </p>
                    <p style="margin:0;">
                      • <strong>CEDEXX Support:</strong> <a href="mailto:support@cedexx.net" style="color:#050249;font-weight:700;text-decoration:none;">support@cedexx.net</a> • (754) 432-2201
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_KEY}`,
    },
    body: JSON.stringify({
      from: 'CEDEXX Support <support@cedexx.net>',
      to: [data.email],
      subject: `✓ Payment Confirmed — Your ${planName} Membership is Active`,
      html,
    }),
  }).catch(() => {});
}

async function notifyAdmin(data: any) {
  if (RESEND_KEY) {
    const adminRecipients = ['support@cedexx.net', 'daisy@cedexx.net', 'jasmelacosta@gmail.com'];
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Notifications <support@cedexx.net>',
        to: adminRecipients,
        subject: `💳 Payment Verified & Enrolled — ${data.first_name} ${data.last_name}`,
        html: `<h2>Payment Confirmed via Session Verification</h2><p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Plan:</strong> ${data.plan}</p><p><strong>Lyric User ID:</strong> ${data.lyric_user_id || 'Pending sync'}</p>`,
      }),
    }).catch(() => {});
  }
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    const maskedName = `${(data.first_name || '').charAt(0)}. ${(data.last_name || '').charAt(0)}.`;
    const text = `💳 <b>PAYMENT CONFIRMED (AUTO-VERIFIED)</b> — CEDEXX\n👤 Member: <code>${maskedName}</code>\n📦 Plan: ${data.plan}\n🏥 Lyric User ID: <code>${data.lyric_user_id || 'Synced'}</code>\n🕒 ${new Date().toLocaleString()}`;
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const sessionId = (req.body?.session_id || req.query.session_id || '').toString().trim();

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Session ID is required' });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured' });
  }

  try {
    // 1. Retrieve session from Stripe directly
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'subscription'],
    });

    if (session.payment_status !== 'paid') {
      return res.status(200).json({
        success: false,
        status: session.payment_status,
        message: 'Checkout session is not marked as paid yet',
      });
    }

    const rawEmail = session.customer_email || session.customer_details?.email;
    const email = rawEmail ? rawEmail.toLowerCase().trim() : '';
    const metadata = session.metadata || {};

    if (!email) {
      return res.status(400).json({ success: false, error: 'No customer email found on Stripe session' });
    }

    // 2. Lookup member in database
    const members = await readMembers();
    let member = members.find((m: any) => 
      (m.email && m.email.toLowerCase() === email) ||
      (m.stripe_session_id && m.stripe_session_id === session.id)
    );

    // If member already exists and is already marked paid AND already synced to Lyric:
    if (member && member.status === 'paid' && member.lyric_synced) {
      return res.status(200).json({
        success: true,
        already_active: true,
        member_id: member.id,
        lyric_user_id: member.lyric_user_id || null,
        plan: member.plan,
        name: `${member.first_name} ${member.last_name}`,
      });
    }

    // Determine plan
    let exactPlan = metadata.plan;
    if (!exactPlan && session.line_items?.data?.[0]?.price?.id) {
      exactPlan = REVERSE_PRICE_MAP[session.line_items.data[0].price.id];
    }
    if (!exactPlan) {
      exactPlan = member?.plan || 'carenow';
    }

    if (!member) {
      const rawPhone = metadata.phone || '';
      const phoneDigits = rawPhone.replace(/\D/g, '').slice(-10);
      const memberId = (phoneDigits.length === 10)
        ? phoneDigits
        : `mem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      member = {
        id: memberId,
        email,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        phone: metadata.phone || '',
        dob: metadata.dob || '',
        address: metadata.address || '',
        city: metadata.city || '',
        state: metadata.state || '',
        zipcode: metadata.zipcode || '',
        registered_at: new Date().toISOString(),
      };
      members.push(member);
    }

    // Update member record to paid
    member.plan = exactPlan;
    member.status = 'paid';
    member.paid_at = member.paid_at || new Date().toISOString();
    member.stripe_session_id = session.id;
    member.stripe_customer_id = typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id;
    member.stripe_subscription_id = typeof session.subscription === 'string' ? session.subscription : (session.subscription as any)?.id;

    if (metadata.address) member.address = metadata.address;
    if (metadata.city) member.city = metadata.city;
    if (metadata.state) member.state = metadata.state;
    if (metadata.zipcode) member.zipcode = metadata.zipcode;
    if (metadata.first_name && !member.first_name) member.first_name = metadata.first_name;
    if (metadata.last_name && !member.last_name) member.last_name = metadata.last_name;
    if (metadata.phone && !member.phone) member.phone = metadata.phone;
    if (metadata.dob && !member.dob) member.dob = metadata.dob;

    // 3. Sync to Lyric Health if not already synced
    let lyricUserId = member.lyric_user_id || null;
    if (!member.lyric_synced) {
      try {
        const lyricResult = await callLyricApi({
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          email: member.email,
          phone: member.phone || '',
          dob: member.dob || '',
          plan: member.plan,
          address: member.address || '',
          city: member.city || '',
          state: member.state || '',
          zipcode: member.zipcode || '',
          paid_at: member.paid_at,
          stripe_customer_id: member.stripe_customer_id,
          stripe_subscription_id: member.stripe_subscription_id,
        });

        if (lyricResult && (lyricResult.success || lyricResult.alreadyExists)) {
          member.lyric_synced = true;
          member.lyric_synced_at = new Date().toISOString();
          if (lyricResult.lyricUserId) {
            member.lyric_user_id = lyricResult.lyricUserId;
            lyricUserId = lyricResult.lyricUserId;
          }
        }
      } catch (lyricErr) {
        console.error('[VERIFY SESSION LYRIC SYNC ERROR]', lyricErr);
      }
    }

    // 4. Save to members DB
    await writeMembers(members);

    // 5. Send confirmation emails and admin notification
    await Promise.allSettled([
      sendPaymentConfirmation({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        plan: member.plan,
        amount: session.amount_total,
      }),
      sendCustomerEnrollmentEmails({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        zipcode: member.zipcode,
        member_id: member.id,
        plan: member.plan,
        dob: member.dob,
      }),
      notifyAdmin({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        plan: member.plan,
        lyric_user_id: lyricUserId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      activated: true,
      member_id: member.id,
      lyric_user_id: lyricUserId,
      plan: member.plan,
      name: `${member.first_name} ${member.last_name}`,
    });

  } catch (err: any) {
    console.error('[VERIFY SESSION ERROR]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
