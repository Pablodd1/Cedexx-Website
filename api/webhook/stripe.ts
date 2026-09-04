import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@cedexx.net';
const JASMEL_EMAIL = process.env.JASMEL_EMAIL || 'jasmelacosta@gmail.com';
const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '';

async function readMembers() {
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
    console.error('[STRIPE WEBHOOK DB READ ERROR]', e);
    return [];
  }
}

async function writeMembers(members: any[]) {
  if (!GITHUB_TOKEN) return;
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
    await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update member payment status`,
          content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
          sha,
          branch: 'main',
        }),
      }
    );
  } catch (e) {
    console.error('[STRIPE WEBHOOK DB WRITE ERROR]', e);
  }
}

async function alertCritical(error: any, context: any) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('[CRITICAL ALERT]', msg, context);
  if (RESEND_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Alerts <alerts@cedexx.net>',
        to: [JASMEL_EMAIL, ADMIN_EMAIL],
        subject: `🚨 CRITICAL ERROR — /api/webhook/stripe`,
        html: `<p>Error: ${msg}</p><p>Context: ${JSON.stringify(context)}</p>`,
        text: `Error: ${msg}\nContext: ${JSON.stringify(context)}`,
      }),
    }).catch(() => {});
  }
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT,
        text: `🚨 <b>CRITICAL ERROR</b>\n${msg}\n📍 Endpoint: /api/webhook/stripe`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }
}

async function sendPaymentConfirmation(data: any) {
  if (!RESEND_KEY) return;
  const amountStr = data.amount ? `$${(data.amount / 100).toFixed(2)}` : '$18.99/mo';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e;">
      <div style="background:linear-gradient(135deg,#00D4FF,#7B2FF7);padding:40px 20px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:26px;">Payment Confirmed</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">Your CEDEXX membership is now active!</p>
      </div>
      <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <p style="font-size:16px;">Hi <strong>${data.first_name}</strong>,</p>
        <p>Thank you for your payment of <strong>${amountStr}</strong> for the <strong>${data.plan}</strong> plan.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;font-size:16px;font-weight:600;color:#166534;">✓ Membership Active</p>
          <p style="margin:6px 0 0;color:#374151;font-size:14px;">Download the Lyric Health app from the App Store or Google Play and tap "First Time User?" to connect your account.</p>
        </div>
        <p style="color:#6b7280;font-size:14px;">Questions? Contact us anytime at <a href="mailto:support@cedexx.net">support@cedexx.net</a> or call (754) 432-2201.</p>
      </div>
    </div>
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
      subject: `✓ Payment Confirmed — Your ${data.plan} Membership is Active`,
      html,
    }),
  }).catch(() => {});
}

async function notifyAdmin(data: any) {
  if (RESEND_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Notifications <support@cedexx.net>',
        to: [ADMIN_EMAIL],
        subject: `💳 Payment Received — ${data.first_name} ${data.last_name}`,
        html: `<h2>New Payment</h2><p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Plan:</strong> ${data.plan}</p><p><strong>Amount:</strong> $${((data.amount || 0) / 100).toFixed(2)}</p>`,
      }),
    }).catch(() => {});
  }
  if (TELEGRAM_BOT && TELEGRAM_CHAT) {
    const text = `💳 <b>NEW PAYMENT</b> — CEDEXX\n👤 ${data.first_name} ${data.last_name}\n📧 ${data.email}\n📦 Plan: ${data.plan}\n💰 Amount: $${((data.amount || 0) / 100).toFixed(2)}\n🕒 ${new Date().toLocaleString()}`;
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
