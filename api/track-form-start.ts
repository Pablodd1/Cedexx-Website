

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // HIPAA & FTC Privacy Safeguard: Do not store unconsented PII in members database
  // Only log aggregated/anonymous telemetry without persistent PII storage
  return res.status(200).json({ success: true, message: 'Anonymous telemetry acknowledged' });
}
