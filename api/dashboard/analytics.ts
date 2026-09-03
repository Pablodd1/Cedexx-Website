import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/dashboard/analytics
 * Visitor analytics for admin dashboard
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/visits.json';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'cedexx2024';

async function readVisits() {
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
    return JSON.parse(content) || [];
  } catch {
    return [];
  }
}

function parseUA(ua: string) {
  const browser = /Chrome\/(\d+)/.test(ua) ? 'Chrome' :
    /Safari\//.test(ua) && !/Chrome/.test(ua) ? 'Safari' :
    /Firefox\/(\d+)/.test(ua) ? 'Firefox' :
    /Edge\/(\d+)/.test(ua) ? 'Edge' : 'Other';

  const os = /Windows/.test(ua) ? 'Windows' :
    /Mac OS/.test(ua) ? 'macOS' :
    /Linux/.test(ua) ? 'Linux' :
    /Android/.test(ua) ? 'Android' :
    /iPhone|iPad/.test(ua) ? 'iOS' : 'Other';

  const device = /Mobile|Android|iPhone/.test(ua) ? 'Mobile' : 'Desktop';

  return { browser, os, device };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pass = req.query.pass || req.headers['x-dashboard-pass'];
  if (pass !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const visits = await readVisits();
    const now = Date.now();

    // Time windows
    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const activeNow = visits.filter((v: any) => new Date(v.timestamp).getTime() > hourAgo).length;
    const today = visits.filter((v: any) => new Date(v.timestamp).getTime() > dayAgo).length;
    const thisWeek = visits.filter((v: any) => new Date(v.timestamp).getTime() > weekAgo).length;
    const thisMonth = visits.filter((v: any) => new Date(v.timestamp).getTime() > thirtyDaysAgo).length;
    const total = visits.length;

    // Unique sessions
    const sessions = new Set(visits.map((v: any) => v.sessionId));
    const sessionsToday = new Set(
      visits
        .filter((v: any) => new Date(v.timestamp).getTime() > dayAgo)
        .map((v: any) => v.sessionId)
    );

    // Top pages
    const pageCounts: Record<string, number> = {};
    visits.forEach((v: any) => {
      const page = v.page || '/';
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Top referrers
    const refCounts: Record<string, number> = {};
    visits.forEach((v: any) => {
      const ref = v.referrer || 'direct';
      refCounts[ref] = (refCounts[ref] || 0) + 1;
    });
    const topReferrers = Object.entries(refCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Devices / browsers / OS
    const deviceCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};

    visits.forEach((v: any) => {
      const parsed = parseUA(v.ua || '');
      deviceCounts[parsed.device] = (deviceCounts[parsed.device] || 0) + 1;
      browserCounts[parsed.browser] = (browserCounts[parsed.browser] || 0) + 1;
      osCounts[parsed.os] = (osCounts[parsed.os] || 0) + 1;
    });

    // By day (last 30 days)
    const byDay: Record<string, number> = {};
    visits
      .filter((v: any) => new Date(v.timestamp).getTime() > thirtyDaysAgo)
      .forEach((v: any) => {
        const date = new Date(v.timestamp).toISOString().slice(0, 10);
        byDay[date] = (byDay[date] || 0) + 1;
      });

    // By hour (today)
    const byHour: Record<number, number> = {};
    visits
      .filter((v: any) => new Date(v.timestamp).getTime() > dayAgo)
      .forEach((v: any) => {
        const hour = new Date(v.timestamp).getHours();
        byHour[hour] = (byHour[hour] || 0) + 1;
      });

    // Recent visits (last 50)
    const recent = visits
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)
      .map((v: any) => {
        const parsed = parseUA(v.ua || '');
        return {
          id: v.id,
          page: v.page,
          referrer: v.referrer,
          device: parsed.device,
          browser: parsed.browser,
          os: parsed.os,
          country: v.country,
          timestamp: v.timestamp,
          duration: v.duration,
        };
      });

    res.status(200).json({
      success: true,
      stats: {
        activeNow,
        today,
        thisWeek,
        thisMonth,
        total,
        sessions: sessions.size,
        sessionsToday: sessionsToday.size,
      },
      topPages,
      topReferrers,
      devices: Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]),
      browsers: Object.entries(browserCounts).sort((a, b) => b[1] - a[1]),
      os: Object.entries(osCounts).sort((a, b) => b[1] - a[1]),
      byDay,
      byHour,
      recent,
    });
  } catch (err: any) {
    console.error('[ANALYTICS ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
