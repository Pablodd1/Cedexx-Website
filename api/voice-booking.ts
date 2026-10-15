import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice-booking
 * Handle voice-initiated bookings from JasDex Voice Assistant
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, service, preferredDate, preferredTime } = req.body || {};

    // Validation
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and email are required' 
      });
    }

    console.log('Voice booking received:', {
      name,
      email,
      phone,
      service,
      preferredDate,
      preferredTime,
      source: 'jasdex-voice',
      timestamp: new Date().toISOString(),
    });

    // Send Telegram notification (HIPAA-masked)
    try {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
      
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const parts = String(name).trim().split(/\s+/);
        const maskedName = parts.map(p => `${p.charAt(0)}.`).join(' ');
        const maskedEmail = String(email).includes('@') ? `${email.charAt(0)}***@${email.split('@')[1]}` : '***';
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `🎙️ <b>VOICE BOOKING — CEDEXX</b>\n👤 ${maskedName}\n📧 ${maskedEmail}\n${service ? `🏥 Service: ${service}\n` : ''}${preferredDate ? `📅 ${preferredDate}` : ''}${preferredTime ? ` ⏰ ${preferredTime}` : ''}\n🤖 Booked via JasDex Voice Assistant`,
            parse_mode: 'HTML',
          }),
        });
      }
    } catch (notifyErr) {
      console.error('Telegram notification failed:', notifyErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Booking request received. Our team will confirm via email within 15 minutes.',
      bookingId: `voice-${Date.now()}`,
    });

  } catch (error) {
    console.error('Voice booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process booking. Please try again or email support@cedexx.net.',
    });
  }
}
