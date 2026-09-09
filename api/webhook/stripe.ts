import type { VercelRequest, VercelResponse } from '@vercel/node';

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
              
              <!-- Header -->
              <tr>
                <td style="background:#050249;padding:36px 32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;font-style:italic;">CEDEXX</h1>
                  <p style="margin:8px 0 0;color:#23d9b0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Membership Confirmed & Active</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 32px;">
                  <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#050249;">Welcome, ${data.first_name}!</h2>
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
                    Thank you for enrolling with CEDEXX. Your payment of <strong>${amountStr}</strong> for <strong>${planName}</strong> has been processed successfully.
                  </p>

                  <!-- Payment Summary Box -->
                  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:20px;margin-bottom:28px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                      <span style="font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">✓ Membership Status</span>
                      <span style="background:#166534;color:#ffffff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;text-transform:uppercase;">Active</span>
                    </div>
                    <p style="margin:4px 0 0;font-size:14px;color:#15803d;">
                      Plan: <strong>${planName}</strong> • Rate: <strong>${amountStr}</strong>
                    </p>
                    ${data.stripe_session_id ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">Ref: ${data.stripe_session_id.slice(0, 24)}...</p>` : ''}
                  </div>

                  <!-- WHAT HAPPENS NEXT SECTION -->
                  <div style="border-top:2px solid #f1f5f9;padding-top:24px;margin-bottom:28px;">
                    <h3 style="margin:0 0 8px;font-size:18px;font-weight:900;color:#050249;text-transform:uppercase;letter-spacing:-0.5px;font-style:italic;">
                      What Happens Next?
                    </h3>
                    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">
                      Follow these 4 simple steps to access your 24/7 care benefits:
                    </p>

                    <!-- Step 1 -->
                    <div style="margin-bottom:18px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                      <div style="font-weight:800;font-size:14px;color:#050249;margin-bottom:4px;">
                        1. Allow 24–48 Hours for Activation
                      </div>
                      <div style="font-size:13px;color:#475569;line-height:1.5;">
                        Lyric Health requires 24 to 48 hours to complete credentialing and establish your member record in the clinical system.
                      </div>
                    </div>

                    <!-- Step 2 -->
                    <div style="margin-bottom:18px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                      <div style="font-weight:800;font-size:14px;color:#050249;margin-bottom:4px;">
                        2. Download the Lyric Health App
                      </div>
                      <div style="font-size:13px;color:#475569;line-height:1.5;">
                        Download the <strong>Lyric Health</strong> app from the Apple App Store or Google Play Store.
                      </div>
                    </div>

                    <!-- Step 3 -->
                    <div style="margin-bottom:18px;padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
                      <div style="font-weight:800;font-size:14px;color:#166534;margin-bottom:4px;">
                        3. Verify Your Account with ZIP Code
                      </div>
                      <div style="font-size:13px;color:#334155;line-height:1.5;">
                        Open the app and tap <strong>"First Time User?"</strong> at the bottom right. Enter your:<br>
                        • <strong>Last Name</strong><br>
                        • <strong>Date of Birth</strong><br>
                        • <strong>ZIP Code</strong> (as entered on your CEDEXX registration)
                      </div>
                    </div>

                    <!-- Step 4 -->
                    <div style="margin-bottom:18px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                      <div style="font-weight:800;font-size:14px;color:#050249;margin-bottom:4px;">
                        4. Watch for Your Welcome Email
                      </div>
                      <div style="font-size:13px;color:#475569;line-height:1.5;">
                        Lyric will send a setup confirmation from <strong>noreply@getlyric.com</strong>. Please check your Inbox and Spam/Junk folder.
                      </div>
                    </div>
                  </div>

                  <!-- Member Services & Support -->
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

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:12px;color:#94a3b8;">
                    © ${new Date().getFullYear()} CEDEXX. Telehealth technology platform powered by Lyric Health.<br>
                    CEDEXX is not an insurance provider.
                  </p>
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
        const rawEmail = session.customer_email || session.customer_details?.email;
        const email = rawEmail ? rawEmail.toLowerCase().trim() : '';
        const metadata = session.metadata || {};
        
        if (!email) {
          console.error('[STRIPE WEBHOOK] No email in session');
          break;
        }

        let member = members.find((m: any) => m.email && m.email.toLowerCase() === email);
        if (!member) {
          console.log('[STRIPE WEBHOOK] Creating new member from checkout:', email);
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

        // Determine EXACT purchased plan:
        // Priority 1: session.metadata.plan (set at checkout creation from user's selection)
        // Priority 2: line item price ID lookup from REVERSE_PRICE_MAP
        // Priority 3: member.plan fallback
        let exactPlan = metadata.plan;
        if (!exactPlan && session.line_items?.data?.[0]?.price?.id) {
          exactPlan = REVERSE_PRICE_MAP[session.line_items.data[0].price.id];
        }
        if (!exactPlan) {
          exactPlan = member.plan || 'carenow';
        }

        member.plan = exactPlan;
        member.status = 'paid';
        member.paid_at = new Date().toISOString();
        member.stripe_session_id = session.id;
        member.stripe_customer_id = session.customer;
        member.stripe_subscription_id = session.subscription;

        // Persist address fields from session metadata
        if (metadata.address) member.address = metadata.address;
        if (metadata.city) member.city = metadata.city;
        if (metadata.state) member.state = metadata.state;
        if (metadata.zipcode) member.zipcode = metadata.zipcode;
        if (metadata.first_name && !member.first_name) member.first_name = metadata.first_name;
        if (metadata.last_name && !member.last_name) member.last_name = metadata.last_name;
        if (metadata.phone) {
          member.phone = metadata.phone;
          const phoneDigits = metadata.phone.replace(/\D/g, '').slice(-10);
          if (phoneDigits.length === 10) member.id = phoneDigits;
        } else if (member.phone) {
          const phoneDigits = member.phone.replace(/\D/g, '').slice(-10);
          if (phoneDigits.length === 10) member.id = phoneDigits;
        }
        if (metadata.dob && !member.dob) member.dob = metadata.dob;

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
          address: member.address || '',
          city: member.city || '',
          state: member.state || '',
          zipcode: member.zipcode || '',
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
