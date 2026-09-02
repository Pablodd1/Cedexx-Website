import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/dashboard/calls
 * Returns call logs for admin dashboard
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'cedexx2024';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body;
  if (password !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const membersRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!membersRes.ok) {
      return res.status(500).json({ error: 'Failed to read members' });
    }

    const fileData = await membersRes.json();
    const members = fileData.content
      ? JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8')).members || []
      : [];

    // Extract voice leads and call history
    const voiceLeads = members.filter((m: any) => m.type === 'voice_lead');
    const membersWithCalls = members.filter((m: any) => m.call_history && m.call_history.length > 0);
    
    const allCalls = [
      ...voiceLeads.map((l: any) => ({
        id: l.id,
        type: 'voicemail',
        phone: l.phone,
        status: l.status,
        duration: l.duration,
        recording_url: l.recording_url,
        transcription: l.transcription,
        created_at: l.created_at,
      })),
      ...membersWithCalls.flatMap((m: any) =>
        (m.call_history || []).map((c: any) => ({
          id: c.call_sid,
          type: 'call',
          phone: m.phone,
          name: `${m.first_name} ${m.last_name}`,
          status: c.outcome,
          duration: c.duration,
          created_at: c.timestamp,
        }))
      ),
    ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Stats
    const stats = {
      total_calls: allCalls.length,
      voicemails: voiceLeads.length,
      total_duration: allCalls.reduce((sum: number, c: any) => sum + (c.duration || 0), 0),
      avg_duration: allCalls.length > 0 
        ? Math.round(allCalls.reduce((sum: number, c: any) => sum + (c.duration || 0), 0) / allCalls.length)
        : 0,
    };

    res.status(200).json({
      success: true,
      calls: allCalls.slice(0, 100), // Limit to 100 most recent
      stats,
    });

  } catch (err: any) {
    console.error('[DASHBOARD CALLS ERROR]', err);
    res.status(500).json({ error: 'Failed to load calls', detail: err.message });
  }
}
