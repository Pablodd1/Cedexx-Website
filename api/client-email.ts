const RESEND_KEY = process.env.RESEND_API_KEY || '';

async function sendViaResend({
  from,
  to,
  subject,
  html,
  replyTo,
}: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!RESEND_KEY) {
    console.log('[CLIENT EMAIL] No RESEND_API_KEY configured');
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[CLIENT EMAIL ERROR]', res.status, err);
    } else {
      console.log('[CLIENT EMAIL] Sent to', to);
    }
  } catch (err) {
    console.error('[CLIENT EMAIL FAILED]', err);
  }
}

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
  phone?: string;
  member_id?: string;
  zipcode?: string;
  dob?: string;
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

// ─── 1. Welcome Email (After Registration & Direct Enrollment) ───
export async function sendWelcomeEmail(data: ClientEmailData) {
  const planName = planDisplayName(data.plan);
  const cleanPhone = (data.phone || '').replace(/\D/g, '').slice(-10);
  const memberId = data.member_id || (cleanPhone.length === 10 ? cleanPhone : data.phone || 'Your Phone Number');

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px 0;color:#050249;font-size:22px;font-weight:700;">Hi ${data.first_name},</h2>
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">
      Welcome to <strong>CEDEXX</strong>! You've taken the first step towards better health. Please download the Lyric Health app from your app store.
    </p>

    <!-- Registration Details -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:0 0 24px 0;">
      <h3 style="margin:0 0 14px 0;color:#050249;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Your Registration Details</h3>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Member Name</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#0f172a;">${data.first_name} ${data.last_name}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Member ID / Phone</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#050249;">${memberId}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Email Address</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#0f172a;">${data.email}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Selected Plan</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#0f172a;">${planName}</td></tr>
      </table>
    </div>

    <!-- Download App Links -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:0 0 24px 0;text-align:center;">
      <h3 style="margin:0 0 8px 0;color:#1e40af;font-size:15px;font-weight:700;">Download the Lyric Health App</h3>
      <p style="margin:0 0 16px 0;color:#3b82f6;font-size:13px;line-height:1.5;">
        Telehealth consultations and prescriptions are powered by Lyric Health.
      </p>
      <div style="margin:0 auto;">
        <a href="https://play.google.com/store/apps/details?id=com.lyric.app" target="_blank" style="display:inline-block;background:#050249;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;margin:4px 6px;">
          🤖 Google Play Store
        </a>
        <a href="https://apps.apple.com/us/app/lyric-health/id1607146169" target="_blank" style="display:inline-block;background:#050249;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;margin:4px 6px;">
          🍏 Apple App Store
        </a>
      </div>
    </div>

    <!-- What Happens Next -->
    <div style="margin:0 0 24px 0;">
      <h3 style="margin:0 0 12px 0;color:#050249;font-size:16px;font-weight:700;">What Happens Next?</h3>
      <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.6;">
        You can locate your membership within the Lyric Health app upon receipt of your welcome email from Lyric Health. Be sure to select the <strong>"First-Time User?"</strong> link on the bottom right of the app, and if you have any questions please refer to the "What Happens Next" steps below:
      </p>
      <ol style="margin:0 0 16px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
        <li><strong>Wait for Activation Email:</strong> You will receive setup instructions from <a href="mailto:noreply@getlyric.com" style="color:#050249;text-decoration:underline;">noreply@getlyric.com</a> within 24–48 hours. Please check your Inbox and spam/junk folder.</li>
        <li><strong>Select First-Time User:</strong> Open the Lyric Health app and tap <em>"First Time User?"</em> at the bottom right.</li>
        <li><strong>Verify Your Account:</strong> Enter your Last Name, Date of Birth, and ZIP Code ${data.zipcode ? `(<strong>${data.zipcode}</strong>)` : ''} to link your membership.</li>
        <li><strong>Access 24/7 Care:</strong> Connect with board-certified doctors anytime via phone or secure video.</li>
      </ol>
    </div>

    <!-- FAQ & Support -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px 0;text-align:center;">
      <p style="margin:0 0 12px 0;color:#166534;font-size:14px;font-weight:600;">
        Have questions? We're here to help!
      </p>
      <a href="${CEDEXX_URL}/#faq" style="display:inline-block;background:#166534;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
        View CEDEXX FAQs →
      </a>
      <p style="margin:12px 0 0 0;color:#4b5563;font-size:12px;">
        Feel free to visit our website for additional support or email us at <a href="mailto:support@cedexx.net" style="color:#050249;text-decoration:underline;">support@cedexx.net</a>.
      </p>
    </div>

    <p style="margin:0;color:#050249;font-size:14px;line-height:1.6;font-weight:700;">
      CEDEXX Healthcare Team — Better Care. Here. Now.
    </p>
  `);

  await sendViaResend({
    from: FROM_CLIENT,
    to: [data.email],
    subject: `Welcome to CEDEXX — Your ${planName} Membership`,
    html,
    replyTo: 'support@cedexx.net',
  });
}

// ─── 2. Payment Confirmation & "What Happens Next" Email (Immediate Upon Purchasing) ───
export async function sendPaymentConfirmation(data: ClientEmailData & { amount?: number; stripe_session_id?: string }) {
  const planName = planDisplayName(data.plan);
  const price = data.plan_price || planPrice(data.plan);
  const amountText = data.amount ? `$${(data.amount / 100).toFixed(2)}` : price;
  const cleanPhone = (data.phone || '').replace(/\D/g, '').slice(-10);
  const memberId = data.member_id || (cleanPhone.length === 10 ? cleanPhone : data.phone || 'Your Phone Number');

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px 0;color:#050249;font-size:22px;font-weight:700;">Hi ${data.first_name},</h2>
    <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">
      Welcome to <strong>CEDEXX</strong>! You've taken the first step towards better health. Please download the Lyric Health app from your app store.
    </p>

    <!-- Registration & Payment Details -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:0 0 24px 0;">
      <h3 style="margin:0 0 14px 0;color:#050249;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Your Registration Details</h3>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Member Name</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#0f172a;">${data.first_name} ${data.last_name}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Member ID / Phone</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#050249;">${memberId}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Email Address</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#0f172a;">${data.email}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Selected Plan</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#0f172a;">${planName}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Amount Paid</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#166534;">${amountText}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Status</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#166534;">✓ Active / Paid</td></tr>
      </table>
    </div>

    <!-- Download App Links -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:0 0 24px 0;text-align:center;">
      <h3 style="margin:0 0 8px 0;color:#1e40af;font-size:15px;font-weight:700;">Download the Lyric Health App</h3>
      <p style="margin:0 0 16px 0;color:#3b82f6;font-size:13px;line-height:1.5;">
        Telehealth consultations and prescriptions are powered by Lyric Health.
      </p>
      <div style="margin:0 auto;">
        <a href="https://play.google.com/store/apps/details?id=com.lyric.app" target="_blank" style="display:inline-block;background:#050249;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;margin:4px 6px;">
          🤖 Google Play Store
        </a>
        <a href="https://apps.apple.com/us/app/lyric-health/id1607146169" target="_blank" style="display:inline-block;background:#050249;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;margin:4px 6px;">
          🍏 Apple App Store
        </a>
      </div>
    </div>

    <!-- What Happens Next -->
    <div style="margin:0 0 24px 0;">
      <h3 style="margin:0 0 12px 0;color:#050249;font-size:16px;font-weight:700;">What Happens Next?</h3>
      <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.6;">
        You can locate your membership within the Lyric Health app upon receipt of your welcome email from Lyric Health. Be sure to select the <strong>"First-Time User?"</strong> link on the bottom right of the app, and if you have any questions please refer to your "What Happens Next" steps below:
      </p>
      <ol style="margin:0 0 16px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
        <li><strong>Wait for Activation Email:</strong> Please allow 24–48 hours for Lyric Health to provision your membership. You'll receive an email from <a href="mailto:noreply@getlyric.com" style="color:#050249;text-decoration:underline;">noreply@getlyric.com</a> (be sure to check spam/junk).</li>
        <li><strong>Open the Lyric Health App:</strong> Launch the app and select the link at the bottom right next to <em>"First Time User?"</em>.</li>
        <li><strong>Verify Your Account:</strong> Enter your Last Name, Date of Birth, and ZIP Code ${data.zipcode ? `(<strong>${data.zipcode}</strong>)` : ''}.</li>
        <li><strong>Enjoy 24/7 Access:</strong> Once verified, consult with board-certified physicians, request prescription refills, or access mental health services with $0 copay.</li>
      </ol>
    </div>

    <!-- FAQ & Support -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px 0;text-align:center;">
      <p style="margin:0 0 12px 0;color:#166534;font-size:14px;font-weight:600;">
        Have questions? Check our FAQ or reach out anytime!
      </p>
      <a href="${CEDEXX_URL}/#faq" style="display:inline-block;background:#166534;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
        View CEDEXX FAQs →
      </a>
      <p style="margin:12px 0 0 0;color:#4b5563;font-size:12px;">
        Feel free to visit our website for additional support or email us at <a href="mailto:support@cedexx.net" style="color:#050249;text-decoration:underline;">support@cedexx.net</a>.
      </p>
    </div>

    <p style="margin:0;color:#050249;font-size:14px;line-height:1.6;font-weight:700;">
      CEDEXX Healthcare Team — Better Care. Here. Now.
    </p>
  `);

  await sendViaResend({
    from: FROM_CLIENT,
    to: [data.email],
    subject: `✓ Welcome to CEDEXX — What Happens Next & Your ${planName} Details`,
    html,
    replyTo: 'support@cedexx.net',
  });
}

// ─── 3. Promo / Discount Applied Email ───
export async function sendPromoAppliedEmail(data: ClientEmailData & { promo_code: string; discount_amount?: string; original_price?: string; discounted_price?: string }) {
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

  await sendViaResend({
    from: FROM_DAISY,
    to: [data.email],
    subject: `🎉 Promo Code ${data.promo_code} Applied — ${planName}`,
    html,
    replyTo: 'daisy@cedexx.net',
  });
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

  await sendViaResend({
    from: FROM_NOTIFICATIONS,
    to: adminEmails,
    subject,
    html,
  });
}

// ─── 5. Membership Activation Email ───
export async function sendActivationEmail(data: ClientEmailData) {
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

  await sendViaResend({
    from: FROM_CLIENT,
    to: [data.email],
    subject: `✓ Your ${planName} Membership is Now Active`,
    html,
    replyTo: 'support@cedexx.net',
  });
}
