import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const LOGO_URL = 'https://www.cedexx.net/images/lyric-logo.webp';
const CEDEXX_URL = 'https://www.cedexx.net';

// ─── Sender Addresses ───
const FROM_CLIENT = 'CEDEXX Support <support@cedexx.net>';
const FROM_DAISY = 'Daisy @ CEDEXX <daisy@cedexx.net>';
const FROM_NOTIFICATIONS = 'CEDEXX Notifications <support@cedexx.net>';

// ─── Admin Recipients ───
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || 'support@cedexx.net';
  const emails = raw.split(/[,;]/).map(e => e.trim()).filter(Boolean);
  // Always include support and daisy
  if (!emails.includes('support@cedexx.net')) emails.push('support@cedexx.net');
  if (!emails.includes('daisy@cedexx.net')) emails.push('daisy@cedexx.net');
  return emails;
}

export interface ClientEmailData {
  first_name: string;
  last_name: string;
  email: string;
  plan: string;
  plan_price?: string;
}

// ─── Plan Info ───
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

function planFeatures(plan: string): string[] {
  const map: Record<string, string[]> = {
    carenow: [
      '24/7 Virtual Urgent Care',
      'Same-Day Appointments',
      'Acute Prescription Coverage',
      'Licensed Physicians in Your State',
      'Unlimited Virtual Visits',
      'Family Coverage (Up to 7)',
      'No Insurance Required',
    ],
    'carenow-mental': [
      'Everything in CareNow™',
      'Everything in Mental Wellness',
      'Behavioral Health Support',
      'Individual Therapy Sessions',
      'Family Therapy & Counseling',
      'Anxiety & Depression Care',
      '24/7 Crisis Support Line',
    ],
    'mental-wellness': [
      'Unlimited Licensed Therapists',
      'Family Therapy & Counseling',
      'Behavioral Health Support',
      'Anxiety, Stress & Depression Care',
      '24/7 Crisis Support Line',
      'Online Therapy Sessions',
      'No Insurance Required',
    ],
    carecomplete: [
      'Everything in CareNow™',
      'Everything in Mental Wellness',
      'Dedicated Virtual Primary Care Physician',
      'Unlimited Virtual Primary Care Visits',
      'Preventive Care & Screenings',
      'Chronic Condition Management',
      'Prescription Savings Program',
      'Annual Wellness Review',
      'Lab Order Management',
    ],
    'carecomplete-family': [
      'Everything in CareComplete™',
      'Full Family Coverage (Up to 7)',
      'Dedicated Family Care Coordinator',
      'Priority Scheduling for Family',
      'Shared Health Records Access',
      'Family Wellness Planning',
    ],
  };
  return map[plan] || [];
}

// ─── Email Base Template ───
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
              <p style="margin:8px 0 4px 0;color:#a5b4fc;font-size:13px;">Better Care. Here. Now.</p>
              <p style="margin:0;color:#23d9b0;font-size:12px;font-weight:500;">powered by Lyric Health</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- FAQ Section -->
          <tr>
            <td style="padding:0 40px 32px 40px;">
              <div style="background:#f8fafc;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
                <h3 style="margin:0 0 16px 0;color:#050249;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Common Questions</h3>
                <div style="margin-bottom:12px;">
                  <p style="margin:0 0 4px 0;color:#111827;font-size:13px;font-weight:600;">When can I start using my membership?</p>
                  <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">Your membership activates within 24–48 hours. You'll receive an email from Lyric Health with activation instructions.</p>
                </div>
                <div style="margin-bottom:12px;">
                  <p style="margin:0 0 4px 0;color:#111827;font-size:13px;font-weight:600;">Do I need insurance?</p>
                  <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">No insurance is required. CEDEXX memberships are designed to work alongside or independently of traditional insurance.</p>
                </div>
                <div style="margin-bottom:12px;">
                  <p style="margin:0 0 4px 0;color:#111827;font-size:13px;font-weight:600;">How do I download the Lyric Health app?</p>
                  <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">Search "Lyric Health" in the App Store (iOS) or Google Play Store (Android). It's free to download.</p>
                </div>
                <div style="margin-bottom:12px;">
                  <p style="margin:0 0 4px 0;color:#111827;font-size:13px;font-weight:600;">Can I add family members?</p>
                  <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">CareNow™ and CareComplete™ plans include coverage for up to 7 household members at no extra cost.</p>
                </div>
                <div>
                  <p style="margin:0 0 4px 0;color:#111827;font-size:13px;font-weight:600;">How do I contact support?</p>
                  <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">Email us anytime at <a href="mailto:support@cedexx.net" style="color:#050249;text-decoration:underline;">support@cedexx.net</a> or visit <a href="${CEDEXX_URL}/contact" style="color:#050249;text-decoration:underline;">cedexx.net/contact</a>.</p>
                </div>
              </div>
            </td>
          </tr>
          <!-- Powered By -->
          <tr>
            <td style="padding:0 40px 32px 40px;text-align:center;border-top:1px solid #f0f0f0;">
              <p style="margin:24px 0 12px 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Healthcare services provided by</p>
              <img src="${LOGO_URL}" alt="Lyric Health" width="140" style="display:block;margin:0 auto;border:0;" />
              <p style="margin:16px 0 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Your enrollment is now complete! You're on your way to immediate access to care. Thank you for your business, and enjoy your new layer of care.
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

// ─── 1. Welcome Email (After Registration) ───
export async function sendWelcomeEmail(data: ClientEmailData) {
  if (!resend) {
    console.log('[CLIENT EMAIL] No Resend API key, skipping welcome email');
    return;
  }

  const planName = planDisplayName(data.plan);
  const features = planFeatures(data.plan);
  const featureList = features.map(f => `<li style="margin-bottom:6px;">${f}</li>`).join('');

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px 0;color:#111827;font-size:20px;font-weight:700;">Welcome to CEDEXX, ${data.first_name}!</h2>
    <p style="margin:0 0 20px 0;color:#374151;font-size:14px;line-height:1.6;">
      Thank you for enrolling in <strong>${planName}</strong>. Your membership is being processed and you'll have access to care within 24–48 hours.
    </p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:0 0 24px 0;">
      <h3 style="margin:0 0 12px 0;color:#1e40af;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Your Plan Includes</h3>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.7;">
        ${featureList}
      </ul>
    </div>

    <h3 style="margin:0 0 12px 0;color:#111827;font-size:16px;font-weight:700;">Next Steps</h3>
    <ol style="margin:0 0 24px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
      <li><strong>Wait for Activation Email</strong><br>You'll receive instructions from <a href="mailto:noreply@getlyric.com" style="color:#050249;text-decoration:underline;">noreply@getlyric.com</a> within 24–48 hours. Check your spam folder.</li>
      <li><strong>Download the Lyric Health App</strong><br>Available on the App Store and Google Play. Search "Lyric Health".</li>
      <li><strong>Locate Your Membership</strong><br>Open the app and tap "First Time User?" at the bottom right. Enter your Last Name, Date of Birth, and ZIP Code.</li>
      <li><strong>Start Using Your Benefits</strong><br>Once verified, you can book virtual visits, message providers, and access your health records.</li>
    </ol>

    <p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;">
      If you have any questions, reply to this email or contact us at <a href="mailto:support@cedexx.net" style="color:#050249;text-decoration:underline;">support@cedexx.net</a>.
    </p>
    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;font-weight:600;">
      CEDEXX — Better Care. Here. Now.
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_CLIENT,
      to: [data.email],
      subject: `Welcome to CEDEXX — Your ${planName} Membership`,
      html,
      replyTo: 'support@cedexx.net',
    });
    console.log('[CLIENT EMAIL] Welcome email sent to', data.email);
  } catch (err) {
    console.error('[CLIENT EMAIL] Failed to send welcome email:', err);
  }
}

// ─── 2. Payment Confirmation ───
export async function sendPaymentConfirmation(data: ClientEmailData & { amount?: number; stripe_session_id?: string }) {
  if (!resend) {
    console.log('[CLIENT EMAIL] No Resend API key, skipping payment confirmation');
    return;
  }

  const planName = planDisplayName(data.plan);
  const price = data.plan_price || planPrice(data.plan);
  const amountText = data.amount ? `$${(data.amount / 100).toFixed(2)}` : price;
  const features = planFeatures(data.plan);
  const featureList = features.slice(0, 6).map(f => `<li style="margin-bottom:6px;">${f}</li>`).join('');

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px 0;color:#111827;font-size:20px;font-weight:700;">Payment Confirmed, ${data.first_name}!</h2>
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">
      Thank you for your business! You're on your way to immediate access to care. Please follow the instructions below for your membership access.
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

    <h3 style="margin:0 0 12px 0;color:#111827;font-size:16px;font-weight:700;">What Happens Next?</h3>
    <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.6;">
      Follow these simple steps to access your benefits:
    </p>

    <div style="margin:0 0 16px 0;">
      <p style="margin:0 0 8px 0;color:#111827;font-size:14px;font-weight:700;">1. Allow 24–48 Hours for Activation</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
        Please allow 24–48 hours for your membership to become accessible through the Lyric Health app.
      </p>
    </div>

    <div style="margin:0 0 16px 0;">
      <p style="margin:0 0 8px 0;color:#111827;font-size:14px;font-weight:700;">2. Download the Lyric Health App from your App Store</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
        Download the Lyric Health app on your mobile device.<br><br>
        Open the app and select the link at the bottom right, next to "First Time User?" to locate your membership.
      </p>
    </div>

    <div style="margin:0 0 16px 0;">
      <p style="margin:0 0 8px 0;color:#111827;font-size:14px;font-weight:700;">3. Verify Your Account</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
        Enter your:<br>
        • Last Name<br>
        • Date of Birth<br>
        • ZIP Code
      </p>
    </div>

    <div style="margin:0 0 24px 0;">
      <p style="margin:0 0 8px 0;color:#111827;font-size:14px;font-weight:700;">4. Check Your Email</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
        Once your account is located and verified, you will receive an email with additional information. Be sure to check spam for an email from noreply@getlyric.com.
      </p>
    </div>

    <p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;">
      That's it! Once activated, you'll be ready to access your CEDEXX wellness benefits through Lyric Health. Upon completion of steps 1-4, please contact Lyric Health Member Services for assistance accessing your available services at <strong>1-866-223-8831</strong>. If you have waited at least 48 hours and are still unable to locate or access your membership, please contact <a href="mailto:support@cedexx.net" style="color:#050249;text-decoration:underline;">support@cedexx.net</a> for assistance.
    </p>

    <p style="margin:0;color:#050249;font-size:14px;font-weight:700;">
      CEDEXX — Better Care. Here. Now.
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_CLIENT,
      to: [data.email],
      subject: `✓ Payment Confirmed — ${planName} is Active`,
      html,
      replyTo: 'support@cedexx.net',
    });
    console.log('[CLIENT EMAIL] Payment confirmation sent to', data.email);
  } catch (err) {
    console.error('[CLIENT EMAIL] Failed to send payment confirmation:', err);
  }
}

// ─── 3. Promo / Discount Applied Email ───
export async function sendPromoAppliedEmail(data: ClientEmailData & { promo_code: string; discount_amount?: string; original_price?: string; discounted_price?: string }) {
  if (!resend) {
    console.log('[CLIENT EMAIL] No Resend API key, skipping promo email');
    return;
  }

  const planName = planDisplayName(data.plan);

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px 0;color:#111827;font-size:20px;font-weight:700;">🎉 Promo Applied, ${data.first_name}!</h2>
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">
      Great news! Your promo code <strong style="color:#166534;">${data.promo_code}</strong> has been applied to your <strong>${planName}</strong> membership.
    </p>

    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:20px;margin:0 0 24px 0;">
      <h3 style="margin:0 0 12px 0;color:#92400e;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Savings Summary</h3>
      <table style="width:100%;font-size:14px;color:#374151;">
        ${data.original_price ? `<tr><td style="padding:4px 0;">Original Price</td><td style="padding:4px 0;text-align:right;text-decoration:line-through;color:#9ca3af;">${data.original_price}</td></tr>` : ''}
        ${data.discounted_price ? `<tr><td style="padding:4px 0;">Your Price</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#166534;">${data.discounted_price}</td></tr>` : ''}
        ${data.discount_amount ? `<tr><td style="padding:4px 0;">You Save</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#166534;">${data.discount_amount}</td></tr>` : ''}
        <tr><td style="padding:4px 0;">Promo Code</td><td style="padding:4px 0;text-align:right;font-weight:600;">${data.promo_code}</td></tr>
      </table>
    </div>

    <p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.6;">
      Complete your enrollment to lock in this special rate. This promo code is valid for a limited time.
    </p>

    <a href="${CEDEXX_URL}/enroll?plan=${data.plan}&promo=${data.promo_code}" style="display:inline-block;background:#050249;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;">Complete Enrollment</a>

    <p style="margin:24px 0 0 0;color:#374151;font-size:14px;line-height:1.6;">
      Questions? Reply to this email or contact <a href="mailto:support@cedexx.net" style="color:#050249;text-decoration:underline;">support@cedexx.net</a>.
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_DAISY,
      to: [data.email],
      subject: `🎉 Promo Code ${data.promo_code} Applied — ${planName}`,
      html,
      replyTo: 'daisy@cedexx.net',
    });
    console.log('[CLIENT EMAIL] Promo email sent to', data.email);
  } catch (err) {
    console.error('[CLIENT EMAIL] Failed to send promo email:', err);
  }
}

// ─── 4. Admin Notification Email ───
export async function sendAdminNotification(data: {
  type: 'registration' | 'payment' | 'contact' | 'deletion' | 'form_started' | 'checkout_started';
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  plan?: string;
  amount?: number;
  message?: string;
  subject?: string;
  company_name?: string;
  stripe_session_id?: string;
  reason?: string;
}) {
  if (!resend) {
    console.log('[ADMIN EMAIL] No Resend API key, skipping');
    return;
  }

  const adminEmails = getAdminEmails();
  const isPayment = data.type === 'payment';
  const isContact = data.type === 'contact';
  const isFormStart = data.type === 'form_started';
  const isCheckout = data.type === 'checkout_started';

  const subject = isPayment
    ? `💳 New CEDEXX Payment — ${data.first_name} ${data.last_name}`
    : isContact
      ? `📨 New Contact Form — ${data.first_name}`
      : isFormStart
        ? `📝 Lead Started Form — ${data.first_name} ${data.last_name}`
        : isCheckout
          ? `💳 Checkout Started — ${data.first_name} ${data.last_name}`
          : data.type === 'deletion'
            ? `🗑️ Data Deletion Request — ${data.email}`
            : `📋 New CEDEXX Registration — ${data.first_name} ${data.last_name}`;

  const rows = [
    ['Name', `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'N/A'],
    ['Email', data.email],
    data.phone ? ['Phone', data.phone] : null,
    data.plan ? ['Plan', planDisplayName(data.plan)] : null,
    isPayment && data.amount ? ['Amount', `$${(data.amount / 100).toFixed(2)}`] : null,
    data.stripe_session_id ? ['Session ID', data.stripe_session_id] : null,
    data.company_name ? ['Company', data.company_name] : null,
    data.subject ? ['Subject', data.subject] : null,
    data.message ? ['Message', data.message] : null,
    ['Time', new Date().toLocaleString()],
  ].filter(Boolean) as [string, string][];

  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:700;width:140px;background:#fafafa">${k}</td><td style="padding:10px;border-bottom:1px solid #f0f0f0">${v}</td></tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;border:1px solid #e0e0e0;border-radius:16px;overflow:hidden">
      <div style="background:#050249;color:#fff;padding:20px">
        <h2 style="margin:0;font-size:18px">${isPayment ? '💳 New Payment' : isContact ? '📨 Contact Form' : isFormStart ? '📝 Lead Started Form' : isCheckout ? '💳 Checkout Started' : data.type === 'deletion' ? '🗑️ Deletion Request' : '📋 New Registration'}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${htmlRows}
      </table>
      <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#666">
        View dashboard: <a href="https://cedexx.net/admin" style="color:#050249;font-weight:700">cedexx.net/admin</a>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_NOTIFICATIONS,
      to: adminEmails,
      subject,
      html,
    });
    console.log('[ADMIN EMAIL] Sent to', adminEmails);
  } catch (err) {
    console.error('[ADMIN EMAIL ERROR]', err);
  }
}

// ─── 5. Membership Activation Email ───
export async function sendActivationEmail(data: ClientEmailData) {
  if (!resend) {
    console.log('[CLIENT EMAIL] No Resend API key, skipping activation email');
    return;
  }

  const planName = planDisplayName(data.plan);
  const features = planFeatures(data.plan);
  const featureList = features.map(f => `<li style="margin-bottom:6px;">${f}</li>`).join('');

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px 0;color:#111827;font-size:20px;font-weight:700;">Your Membership is Active, ${data.first_name}!</h2>
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">
      Your <strong>${planName}</strong> membership is now fully activated. You can start using your benefits immediately.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px 0;">
      <h3 style="margin:0 0 12px 0;color:#166534;font-size:14px;font-weight:700;">✓ Your Membership Includes</h3>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.7;">
        ${featureList}
      </ul>
    </div>

    <h3 style="margin:0 0 12px 0;color:#111827;font-size:16px;font-weight:700;">How to Access Care</h3>
    <ol style="margin:0 0 24px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
      <li>Open the <strong>Lyric Health</strong> app</li>
      <li>Sign in with your verified account</li>
      <li>Tap "Book Visit" to schedule a virtual consultation</li>
      <li>Choose your provider and time — same-day appointments available</li>
    </ol>

    <a href="${CEDEXX_URL}" style="display:inline-block;background:#050249;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;">Access Your Account</a>

    <p style="margin:24px 0 0 0;color:#374151;font-size:14px;line-height:1.6;">
      We're here if you need anything. Reply to this email or contact <a href="mailto:support@cedexx.net" style="color:#050249;text-decoration:underline;">support@cedexx.net</a>.
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_CLIENT,
      to: [data.email],
      subject: `✓ Your ${planName} Membership is Now Active`,
      html,
      replyTo: 'support@cedexx.net',
    });
    console.log('[CLIENT EMAIL] Activation email sent to', data.email);
  } catch (err) {
    console.error('[CLIENT EMAIL] Failed to send activation email:', err);
  }
}
