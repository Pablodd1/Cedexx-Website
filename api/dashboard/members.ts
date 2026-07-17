import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';

const DATA_FILE = '/tmp/cedexx-members.json';

function loadMembers(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (_) {}
  return [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Password protection via Authorization header or query param
  const adminPass = process.env.ADMIN_DASHBOARD_PASSWORD || 'cedexx-admin-2026';
  const authHeader = req.headers['authorization'] || '';
  const queryPass = req.query.pass as string || '';

  const providedPass = authHeader.replace('Bearer ', '').trim() || queryPass;

  if (providedPass !== adminPass) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const members = loadMembers();

  // Stats summary
  const stats = {
    total: members.length,
    paid: members.filter((m) => m.status === 'paid').length,
    registered: members.filter((m) => m.status === 'registered').length,
    by_plan: {} as Record<string, number>,
  };

  members.forEach((m) => {
    if (m.plan) {
      stats.by_plan[m.plan] = (stats.by_plan[m.plan] || 0) + 1;
    }
  });

  // Optional filters
  let filtered = [...members];
  const { status, plan, search } = req.query;

  if (status) filtered = filtered.filter((m) => m.status === status);
  if (plan) filtered = filtered.filter((m) => m.plan === plan);
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.email?.toLowerCase().includes(q) ||
        m.first_name?.toLowerCase().includes(q) ||
        m.last_name?.toLowerCase().includes(q) ||
        m.phone?.includes(q)
    );
  }

  // Sort by most recent first
  filtered.sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());

  return res.status(200).json({ success: true, stats, members: filtered });
}
