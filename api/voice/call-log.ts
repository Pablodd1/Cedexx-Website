import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/call-log
 * Logs call data to GitHub DB for tracking
 * 
 * Stores:
 * - Call SID
 * - Caller number
 * - Direction (inbound/outbound)
 * - Status
 * - Timestamps
 * - Recording URL (if voicemail)
 * - Transcription (if voicemail)
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/calls.json';

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

async function writeCalls(calls: any[]) {
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
          message: `Update call log: ${new Date().toISOString()}`,
          content: Buffer.from(JSON.stringify(calls, null, 2)).toString('base64'),
          sha: getData.sha,
          branch: 'main',
        }),
      }
    );
  } catch (err) {
    console.error('[CALL LOG WRITE ERROR]', err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const callData = req.body;

  console.log('[CALL LOG]', callData);

  try {
    const calls = await readCalls();
    calls.push({
      ...callData,
      loggedAt: new Date().toISOString(),
    });

    // Keep only last 500 calls
    if (calls.length > 500) {
      calls.splice(0, calls.length - 500);
    }

    await writeCalls(calls);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[CALL LOG ERROR]', err);
    res.status(500).json({ success: false });
  }
}
