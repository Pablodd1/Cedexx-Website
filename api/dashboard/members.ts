import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'cedexx2024';

async function readMembers() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`GitHub read failed: ${res.status}`);
  }
  const data = await res.json();
  return data.content ? JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')).members || [] : [];
}

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

  // Check password
  const pass = req.query.pass || req.headers['x-dashboard-pass'];
  if (pass !== DASHBOARD_PASSWORD) {
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
        `${m.first_name} ${m.last_name} ${m.email} ${m.phone}`.toLowerCase().includes(q)
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
