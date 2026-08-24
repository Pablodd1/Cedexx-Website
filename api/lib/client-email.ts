import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const LOGO_URL = 'https://www.cedexx.net/images/lyric-logo.webp';
const CEDEXX_URL = 'https://www.cedexx.net';

interface ClientEmailData {
  first_name: string;
  last_name: string;
  email: string;
  plan: string;
  plan_price?: string;
}

function planDisplayName(plan: string): string {
  const map: Record<string, string> = {
    carenow: 'CareNow™',
    'carenow-mental': 'CareNow™ + Mental Wellness',
    'mental-wellness': 'Mental Wellness',
    carecomplete: 'CareComplete™',
    'carecomplete-family': 'CareComplete™ Family',
  };
  return map[plan] || plan;
}

function planPrice(plan: string): string {
  const map: Record<string, string> = {
    carenow: '$18.99/mo',
    'carenow-mental': '$26.99/mo',
    'mental-wellness': '$18.99/mo',
    carecomplete: '$34.99/mo',
    'carecomplete-family': '$52.99/mo',
  };
  return map[plan] || '';
}

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#050249;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">CEDEXX</h1>
              <p style="margin:8px 0 0 0;color:#a5b4fc;font-size:13px;">Better Care. Here. Now.</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Powered By -->
          <tr>
            <td style="padding:0 40px 32px 40px;text-align:center;border-top:1px solid #f0f0f0;">
              <p style="margin:24px 0 12px 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Healthcare services provided by</p>
              <img src="${LOGO_URL}" alt="Lyric Health" width="140" style="display:block;margin:0 auto;border:0;" />
              <p style="margin:16px 0 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Your enrollment is now complete! You're on your way to immediate access to care. Please follow the instructions below for your membership access. Thank you for your business, and enjoy your new layer of care.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;color:#6b7280;font-size:12px;">
                <a href="${CEDEXX_URL}" style="color:#050249;text-decoration:none;font-weight:600;">cedexx.net</a> · 
                <a href="${CEDEXX_URL}/contact" style="color:#050249;text-decoration:none;">Support</a> · 
                <a href="${CEDEXX_URL}/privacy" style="color:#050249;text-decoration:none;">Privacy</a>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">© 2026 Cedexx. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendWelcomeEmail(data: ClientEmailData) {
  if (!resend) {
    console.log('[CLIENT EMAIL] No Resend API key, skipping welcome email');
    return;
  }

  const planName = planDisplayName(data.plan);
  const price = data.plan_price || planPrice(data.plan);

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px 0;color:#111827;font-size:20px;font-weight:700;">What Happens Next?</h2>
    <p style="margin:0 0 20px 0;color:#374151;font-size:14px;line-height:1.6;">
      Follow these simple steps to access your benefits:
    </p>
    <ol style="margin:0 0 24px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
      <li><strong>Allow 24–48 Hours for Activation</strong><br>Please allow 24–48 hours for your membership to become accessible through the Lyric Health app. You will get instructions directly from Lyrics email <a href="mailto:noreply@getlyric.com" style="color:#050249;text-decoration:underline;">noreply@getlyric.com</a>.</li>
      <li><strong>Download the Lyric Health App from your App Store</strong><br>Download the Lyric Health app on your mobile device.<br><br>Open the app and select the link at the bottom right, next to "First Time User?" to locate your membership.</li>
      <li><strong>Verify Your Account</strong><br>You will enter your:<br><br>Last Name<br>Date of Birth<br>ZIP Code</li>
      <li><strong>Check Your Email</strong><br>Once your account is located and verified, you will receive an email with additional information. Be sure to check spam for an email from <a href="mailto:noreply@getlyric.com" style="color:#050249;text-decoration:underline;">noreply@getlyric.com</a>.</li>
    </ol>
    <p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;">
      That's it! Once activated, you'll be ready to access your CEDEXX wellness benefits through <a href="https://getlyric.com/" style="color:#050249;text-decoration:underline;">Lyric Health</a>.
    </p>
    <p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;font-weight:600;">
      CEDEXX — Better Care. Here. Now.
    </p>
  `);

  try {
    await resend.emails.send({
      from: 'CEDEXX <notifications@cedexx.net>',
      to: [data.email],
      subject: `CEDEXX — Better Care. Here. Now.`,
      html,
    });
    console.log('[CLIENT EMAIL] Welcome email sent to', data.email);
  } catch (err) {
    console.error('[CLIENT EMAIL] Failed to send welcome email:', err);
  }
}

export async function sendPaymentConfirmation(data: ClientEmailData & { amount?: number; stripe_session_id?: string }) {
  if (!resend) {
    console.log('[CLIENT EMAIL] No Resend API key, skipping payment confirmation');
    return;
  }

  const planName = planDisplayName(data.plan);
  const price = data.plan_price || planPrice(data.plan);
  const amountText = data.amount ? `$${(data.amount / 100).toFixed(2)}` : price;

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px 0;color:#111827;font-size:20px;font-weight:700;">Payment Confirmed, ${data.first_name}!</h2>
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">
      Thank you for joining CEDEXX. Your payment has been processed successfully and your membership is now fully active.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px 0;">
      <h3 style="margin:0 0 12px 0;color:#166534;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Payment Details</h3>
      <table style="width:100%;font-size:14px;color:#374151;">
        <tr><td style="padding:4px 0;">Plan</td><td style="padding:4px 0;text-align:right;font-weight:600;">${planName}</td></tr>
        <tr><td style="padding:4px 0;">Amount</td><td style="padding:4px 0;text-align:right;font-weight:600;">${amountText}</td></tr>
        <tr><td style="padding:4px 0;">Status</td><td style="padding:4px 0;text-align:right;color:#166534;font-weight:600;">✓ Paid</td></tr>
        ${data.stripe_session_id ? `<tr><td style="padding:4px 0;font-size:11px;color:#9ca3af;">Ref</td><td style="padding:4px 0;text-align:right;font-size:11px;color:#9ca3af;">${data.stripe_session_id.slice(0, 20)}...</td></tr>` : ''}
      </table>
    </div>

    <h3 style="margin:0 0 12px 0;color:#111827;font-size:16px;font-weight:700;">You're All Set</h3>
    <ul style="margin:0 0 24px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
      <li>24/7 unlimited virtual consultations — start now</li>
      <li>$0 co-pays on all covered services</li>
      <li>Board-certified physicians, no appointments needed</li>
      <li>Digital school & work notes available</li>
    </ul>

    <p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;">
      Your member ID and app access details will arrive in a separate email within the next few hours.
    </p>

    <a href="${CEDEXX_URL}" style="display:inline-block;background:#050249;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;">Access Your Account</a>
  `);

  try {
    await resend.emails.send({
      from: 'CEDEXX <notifications@cedexx.net>',
      to: [data.email],
      subject: `✓ Payment Confirmed — ${planName} is Active`,
      html,
    });
    console.log('[CLIENT EMAIL] Payment confirmation sent to', data.email);
  } catch (err) {
    console.error('[CLIENT EMAIL] Failed to send payment confirmation:', err);
  }
}
