import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/call-log
 * Logs all voice interactions to GitHub DB
 * Creates a "voice_lead" record for each call
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Pablodd1/Cedexx-Website';
const FILE_PATH = 'data/members.json';

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

async function writeMembers(members: any[]) {
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=main`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!getRes.ok) throw new Error(`GitHub read for SHA failed: ${getRes.status}`);
  const fileData = await getRes.json();
  const sha = fileData.sha;

  const payload = {
    members,
    created_at: fileData.content ? JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8')).created_at : new Date().toISOString(),
    version: '1.0',
  };

  const putRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Log voice call`,
        content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
        sha,
        branch: 'main',
      }),
    }
  );
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(`GitHub write failed: ${putRes.status} — ${err.message || ''}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    callSid,
    from,
    to,
    direction,
    status,
    startedAt,
    duration,
    recordingUrl,
    transcription,
    menuChoice,
    outcome,
  } = req.body;

  if (!callSid || !from) {
    return res.status(400).json({ error: 'callSid and from are required' });
  }

  try {
    const members = await readMembers();

    // Create voice lead record
    const voiceLead = {
      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type: 'voice_lead',
      call_sid: callSid,
      phone: from,
      direction: direction || 'inbound',
      status: status || 'completed',
      menu_choice: menuChoice || null,
      outcome: outcome || 'answered',
      duration: duration || 0,
      recording_url: recordingUrl || null,
      transcription: transcription || null,
      created_at: startedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if this phone number already exists as a member
    const existingMember = members.find((m: any) => m.phone === from);
    
    if (existingMember) {
      // Update existing member with call info
      existingMember.last_call_at = new Date().toISOString();
      existingMember.call_history = existingMember.call_history || [];
      existingMember.call_history.push({
        call_sid: callSid,
        timestamp: new Date().toISOString(),
        duration,
        outcome,
      });
    } else {
      // Create new voice lead (not yet a member)
      members.push(voiceLead);
    }

    await writeMembers(members);

    res.status(200).json({
      success: true,
      message: 'Call logged',
      lead_id: voiceLead.id,
      is_existing_member: !!existingMember,
    });

  } catch (err: any) {
    console.error('[CALL LOG ERROR]', err);
    res.status(500).json({ error: 'Failed to log call', detail: err.message });
  }
}
