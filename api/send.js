const RESEND_KEY = process.env.RESEND_API_KEY || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from_name, from_email, company_name, message, subject } = req.body;

  // Send to both support and daisy
  const adminEmails = ['support@cedexx.net', 'daisy@cedexx.net'];

  try {
    if (!RESEND_KEY) {
      return res.status(200).json({ success: true, warning: 'RESEND_API_KEY not configured' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEDEXX Contact <support@cedexx.net>',
        to: adminEmails,
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
            <p style="font-size: 10px; color: #999;">Sent via Cedexx Platform</p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    res.status(response.ok ? 200 : 400).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
