import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Dynamic import to catch any module load errors
    const db = await import('./lib/github-db');
    res.status(200).json({ 
      ok: true, 
      has_readMembers: !!db.readMembers,
      has_addMember: !!db.addMember,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message, stack: err.stack });
  }
}
