import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/menu-choice
 * Handles IVR digit selection from incoming call
 */

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${xml}\n</Response>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/xml');

  return res.status(200).send(twiml(`<Redirect method="POST">https://www.cedexx.net/api/voice/ai-desk</Redirect>`));
}
