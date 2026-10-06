import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../webhook/stripe.js';

export default async function webhookHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
