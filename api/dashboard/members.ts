import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readMembers } from './lib/github-db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminPass = process.env.ADMIN_DASHBOARD_PASSWORD || 'cedexx-admin-2026';
  const authHeader = req.headers['authorization'] || '';
  const queryPass = req.query.pass as string || '';
  const providedPass = authHeader.replace('Bearer ', '').trim() || queryPass;

  if (providedPass !== adminPass) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const members = await readMembers();

    const stats = {
      total: members.length,
      paid: members.filter((m) => m.status === 'paid').length,
      registered: members.filter((m) => m.status === 'registered').length,
      checkout: members.filter((m) => m.status === 'checkout_started').length,
      expired: members.filter((m) => m.status === 'expired').length,
      failed: members.filter((m) => m.status === 'failed').length,
      form_started: members.filter((m) => m.status === 'form_started').length,
      by_plan: {} as Record<string, number>,
    };

    for (const m of members) {
      if (m.plan) stats.by_plan[m.plan] = (stats.by_plan[m.plan] || 0) + 1;
    }

    return res.status(200).json({
      success: true,
      members: members.sort((a, b) =>
        new Date(b.registered_at || 0).getTime() - new Date(a.registered_at || 0).getTime()
      ),
      stats,
      source: 'github-repo',
    });
  } catch (err: any) {
    console.error('[DASHBOARD ERROR]', err);
    return res.status(500).json({ error: 'Failed to load members', detail: err.message });
  }
}
