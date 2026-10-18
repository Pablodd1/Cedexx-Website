import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readMembers } from '../github-db.js';

const DASHBOARD_PASSWORD = (process.env.DASHBOARD_PASSWORD || '').trim();

function computeStats(members: any[]) {
  const total = members.length;
  const paid = members.filter((m: any) => m.status === 'paid').length;
  const registered = members.filter((m: any) => m.status === 'registered').length;
  const checkout = members.filter((m: any) => m.status === 'checkout_started').length;
  const expired = members.filter((m: any) => m.status === 'expired').length;
  const failed = members.filter((m: any) => m.status === 'payment_failed').length;

  const by_plan: Record<string, number> = {};
  members.forEach((m: any) => {
    const plan = m.plan || 'unknown';
    by_plan[plan] = (by_plan[plan] || 0) + 1;
  });

  const by_status: Record<string, number> = {};
  members.forEach((m: any) => {
    const status = m.status || 'unknown';
    by_status[status] = (by_status[status] || 0) + 1;
  });

  return { total, paid, registered, checkout, expired, failed, by_plan, by_status };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!DASHBOARD_PASSWORD) {
    return res.status(503).json({ success: false, error: 'DASHBOARD_PASSWORD is not configured on the server.' });
  }

  // Check password
  const pass = String(req.query.pass || req.headers['x-dashboard-pass'] || '').trim();
  if (!pass || pass !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const members = await readMembers();
    const stats = computeStats(members);

    // Apply filters if provided
    let filtered = members;
    const { status, plan, search } = req.query;

    if (status && typeof status === 'string') {
      filtered = filtered.filter((m: any) => m.status === status);
    }
    if (plan && typeof plan === 'string') {
      filtered = filtered.filter((m: any) => m.plan === plan);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter((m: any) =>
        `${m.id || ''} ${m.first_name} ${m.last_name} ${m.email} ${m.phone} ${m.address || ''} ${m.city || ''} ${m.zipcode || ''} ${m.plan || ''}`.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      members: filtered,
      stats,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error('[MEMBERS ERROR]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch members', detail: err.message });
  }
}
