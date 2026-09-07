import type { VercelRequest, VercelResponse } from '@vercel/node';

const TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '8834617573:AAGANwBh_xp-MIZpqukctS2OAuJ2zxJOnrU';
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '7838956683';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-dashboard-pass');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Check bot info
    const meRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/getMe`);
    const meData = await meRes.json();

    if (!meData.ok) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Telegram Bot Token',
        details: meData,
      });
    }

    // 2. Send test alert if requested or on POST
    let messageSent = null;
    const shouldSend = req.method === 'POST' || req.query.send === 'true';

    if (shouldSend) {
      const customText = (req.body && req.body.text) || req.query.text;
      const text = customText || [
        '🔔 <b>CEDEXX Admin Test Alert</b>',
        '',
        '✅ Bot: @' + (meData.result.username || 'Cedexxbot'),
        '📍 Source: Admin Dashboard',
        `🕒 ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST`,
        '',
        'Telegram notification pipeline is 100% operational.',
      ].join('\n');

      const sendRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT,
          text,
          parse_mode: 'HTML',
        }),
      });

      messageSent = await sendRes.json();
    }

    return res.status(200).json({
      success: true,
      bot: {
        id: meData.result.id,
        name: meData.result.first_name,
        username: meData.result.username,
      },
      chat_id: TELEGRAM_CHAT,
      test_message_sent: messageSent?.ok || false,
      message_result: messageSent,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to communicate with Telegram API',
    });
  }
}
