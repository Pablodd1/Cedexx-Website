import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/dashboard/calls
 * Returns call logs for admin dashboard
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/calls.json';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'cedexx2024';

async function readCalls() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
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
    const calls = await readCalls();
    const sorted = Array.isArray(calls) 
      ? calls.sort((a: any, b: any) => new Date(b.loggedAt || b.timestamp || 0).getTime() - new Date(a.loggedAt || a.timestamp || 0).getTime())
      : [];

    // Stats
    const total = sorted.length;
    const voicemails = sorted.filter((c: any) => c.type === 'voicemail').length;
    const inbound = sorted.filter((c: any) => c.direction === 'inbound' || !c.direction).length;
    const outbound = sorted.filter((c: any) => c.direction === 'outbound').length;
    
    const durations = sorted
      .map((c: any) => parseInt(c.duration) || 0)
      .filter((d: number) => d > 0);
    const totalDuration = durations.reduce((sum: number, d: number) => sum + d, 0);
    const avgDuration = durations.length > 0 ? Math.round(totalDuration / durations.length) : 0;

    // Last 24h
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const last24h = sorted.filter((c: any) => new Date(c.loggedAt || c.timestamp || 0).getTime() > dayAgo).length;

    // Last 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const last7d = sorted.filter((c: any) => new Date(c.loggedAt || c.timestamp || 0).getTime() > weekAgo).length;

    // By day (last 30 days)
    const byDay: Record<string, number> = {};
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    sorted
      .filter((c: any) => new Date(c.loggedAt || c.timestamp || 0).getTime() > thirtyDaysAgo)
      .forEach((c: any) => {
        const date = new Date(c.loggedAt || c.timestamp || 0).toISOString().slice(0, 10);
        byDay[date] = (byDay[date] || 0) + 1;
      });

    // By intent
    const byIntent: Record<string, number> = {};
    sorted.forEach((c: any) => {
      const intent = c.intent || 'unknown';
      byIntent[intent] = (byIntent[intent] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      calls: sorted.slice(0, 200),
      stats: {
        total,
        voicemails,
        inbound,
        outbound,
        totalDuration,
        avgDuration,
        last24h,
        last7d,
        byDay,
        byIntent,
      },
    });
  } catch (err: any) {
    console.error('[DASHBOARD CALLS ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to load calls', detail: err.message });
  }
}
