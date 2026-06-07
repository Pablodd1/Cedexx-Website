import express from 'express';

const router = express.Router();

/**
 * POST /api/book-voice
 * Handle voice-initiated bookings from Vapi.ai
 */
router.post('/book-voice', async (req, res) => {
  try {
    const { name, email, phone, service, preferredDate, preferredTime } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and email are required' 
      });
    }

    // TODO: Integrate with your booking system
    // Options:
    // 1. Cal.com API
    // 2. Your existing MBMB booking server
    // 3. Google Calendar API
    // 4. Email notification

    console.log('Voice booking received:', {
      name,
      email,
      phone,
      service,
      preferredDate,
      preferredTime,
      source: 'vapi-voice',
      timestamp: new Date().toISOString(),
    });

    // Send Telegram notification to Jasmel
    try {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7838956683';
      
      if (TELEGRAM_BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `🎙️ VOICE BOOKING from CEDEXX\n\n👤 ${name}\n📧 ${email}\n${phone ? `📞 ${phone}\n` : ''}${service ? `🏥 Service: ${service}\n` : ''}${preferredDate ? `📅 ${preferredDate}` : ''}${preferredTime ? ` ⏰ ${preferredTime}` : ''}\n\n🤖 Booked via AI Voice Assistant`,
            parse_mode: 'HTML',
          }),
        });
      }
    } catch (notifyErr) {
      console.error('Telegram notification failed:', notifyErr);
    }

    // TODO: Send confirmation email via Brevo
    // TODO: Create calendar event via Google Calendar API

    return res.status(200).json({
      success: true,
      message: 'Booking request received. Our team will confirm via email within 15 minutes.',
      bookingId: `voice-${Date.now()}`,
    });

  } catch (error) {
    console.error('Voice booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process booking. Please try again or email info@cedexx.net.',
    });
  }
});

export default router;
