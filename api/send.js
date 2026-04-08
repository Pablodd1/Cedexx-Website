import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from_name, from_email, company_name, message, subject } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Cedexx <onboarding@resend.dev>', // Update to your domain in Resend dashboard
      to: ['info@cedexx.net'],
      subject: subject || `New Message from ${from_name}`,
      reply_to: from_email,
      html: `
        <div style="font-family: inherit; font-size: 14px; padding: 20px; border: 1px solid #f1f1f1; border-radius: 12px;">
          <h2 style="color: #050249;">New Inquiry Received</h2>
          <hr />
          <p><strong>Name:</strong> ${from_name}</p>
          <p><strong>Email:</strong> ${from_email}</p>
          <p><strong>Company/Type:</strong> ${company_name || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
          <hr />
          <p style="font-size: 10px; color: #999;">Sent via Cedexx Platform AI Gateway</p>
        </div>
      `,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
}
