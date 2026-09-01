import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readMembers, addMember } from './lib/github-db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const members = await readMembers();
    res.status(200).json({ ok: true, count: members.length });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
