import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/track-visit
 * Lightweight visitor tracking — privacy-respecting, no cookies
 * Stores in GitHub DB for persistence
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/visits.json';

interface Visit {
  id: string;
  page: string;
  referrer: string;
  country?: string;
  city?: string;
  ua: string;           // user agent (browser, OS, device)
  screen: string;       // screen resolution
  lang: string;         // browser language
  timestamp: string;
  sessionId: string;    // anonymous session grouping
  duration?: number;    // seconds on page
}

async function readVisits(): Promise<Visit[]> {
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

async function writeVisits(visits: Visit[]) {
  if (!GITHUB_TOKEN) return;
  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    const getData = await getRes.json();
    const sha = getData.sha;

    // Keep only last 5000 visits to avoid bloat
    const trimmed = visits.length > 5000 ? visits.slice(-5000) : visits;

    await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Track visit: ${new Date().toISOString()}`,
          content: Buffer.from(JSON.stringify(trimmed, null, 2)).toString('base64'),
          sha,
          branch: 'main',
        }),
      }
    );
  } catch (err) {
    console.error('[TRACK VISIT WRITE ERROR]', err);
  }
}

// Parse user agent for device info
function parseUA(ua: string) {
  const browser = /Chrome\/(\d+)/.test(ua) ? 'Chrome' :
    /Safari\//.test(ua) && !/Chrome/.test(ua) ? 'Safari' :
    /Firefox\/(\d+)/.test(ua) ? 'Firefox' :
    /Edge\/(\d+)/.test(ua) ? 'Edge' :
    /Opera|OPR\//.test(ua) ? 'Opera' : 'Other';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { page, referrer, screen, sessionId, duration, country, city } = req.body;
  const ua = req.headers['user-agent'] || '';
  const lang = req.headers['accept-language']?.split(',')[0] || '';

  const visit: Visit = {
    id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    page: page || '/',
    referrer: referrer || 'direct',
    country: country || '',
    city: city || '',
    ua,
    screen: screen || '',
    lang,
    timestamp: new Date().toISOString(),
    sessionId: sessionId || `sess_${Date.now()}`,
    duration: duration || undefined,
  };

  try {
    const visits = await readVisits();
    visits.push(visit);
    await writeVisits(visits);

    res.status(200).json({ success: true, id: visit.id });
  } catch (err: any) {
    console.error('[TRACK VISIT ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
