import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler, { config as webhookConfig } from '../webhook/stripe.js';

export const config = webhookConfig;

export default async function webhookHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
