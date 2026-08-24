import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, first_name } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Send notification to admin
    await resend.emails.send({
      from: 'Cedexx <notifications@cedexx.net>',
      to: ['info@cedexx.net'],
      subject: 'New Guide Download Request',
      html: `
        <div style="font-family: inherit; font-size: 14px; padding: 20px; border: 1px solid #f1f1f1; border-radius: 12px;">
          <h2 style="color: #050249;">New Guide Request</h2>
          <hr />
          <p><strong>Name:</strong> ${first_name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Source:</strong> Cedexx Website — Home Page</p>
          <hr />
          <p style="font-size: 10px; color: #999;">Sent via Cedexx Guide Capture</p>
        </div>
      `,
    });

    // Send welcome email to subscriber with guide
    await resend.emails.send({
      from: 'Cedexx <notifications@cedexx.net>',
      to: [email],
      subject: 'Your Cedexx Guide is Here!',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #050249; font-size: 28px; margin: 0;">Welcome to Cedexx!</h1>
            <p style="color: #666; font-size: 16px; margin-top: 10px;">Your guide to getting started with virtual healthcare</p>
          </div>
          
          <div style="background: #EBF3FB; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #050249; font-size: 20px; margin: 0 0 16px 0;">What's Inside</h2>
            <ul style="color: #444; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li>How to book your first virtual visit in under 5 minutes</li>
              <li>Understanding your membership options (CareNow™ $18.99, CareComplete™ $34.99)</li>
              <li>Tips for families: adding up to 7 members</li>
              <li>What to expect during your consultation</li>
              <li>24/7 support and prescription delivery</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://cedexx.net/enroll" style="display: inline-block; background: #050249; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">Enroll Now</a>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 24px; text-align: center; color: #888; font-size: 12px;">
            <p>Cedexx | Better Care. Here. Now.</p>
            <p><a href="mailto:info@cedexx.net" style="color: #00D4FF;">info@cedexx.net</a></p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'Guide sent! Check your email.' });
  } catch (error) {
    console.error('Guide subscribe error:', error);
    res.status(500).json({ error: 'Failed to send guide. Please try again.' });
  }
}
