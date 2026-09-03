// GitHub Repo as Database — Persistent storage for CEDEXX members
// Uses GitHub Contents API (repo scope required)

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'Pablodd1';
const REPO_NAME = 'Cedexx-Website';
const FILE_PATH = 'data/members.json';

interface MemberRecord {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  dob?: string;
  plan?: string;
  status: string;
  registered_at?: string;
  paid_at?: string | null;
  checkout_started_at?: string | null;
  checkout_expired_at?: string | null;
  payment_failed_at?: string | null;
  stripe_session_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  consent_tos?: boolean;
  consent_analytics?: boolean;
  consent_version?: string;
  consent_timestamp?: string;
  form_started_at?: string;
  form_field?: string;
  page_url?: string;
  ip_address?: string;
  updated_at?: string;
}

interface DbContent {
  members: MemberRecord[];
  created_at: string;
  version: string;
}

async function getFileSha(): Promise<{ sha: string; content: DbContent } | null> {
  if (!GITHUB_TOKEN) {
    console.warn('[GITHUB DB] GITHUB_TOKEN not set — using in-memory DB');
    return null;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=main`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`[GITHUB DB] GET failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    return { sha: data.sha, content: decoded };
  } catch (err) {
    console.error('[GITHUB DB] Error reading file:', err);
    return null;
  }
}

// In-memory fallback when GitHub is unavailable
let memoryDb: MemberRecord[] | null = null;

export async function readMembers(): Promise<MemberRecord[]> {
  // Use in-memory DB if we already have it cached
  if (memoryDb) return memoryDb;

  const file = await getFileSha();
  if (!file) {
    memoryDb = [];
    return memoryDb;
  }

  memoryDb = file.content.members || [];
  return memoryDb;
}

export async function writeMembers(members: MemberRecord[]): Promise<void> {
  // Always update in-memory cache
  memoryDb = members;

  if (!GITHUB_TOKEN) {
    console.warn('[GITHUB DB] GITHUB_TOKEN not set — persisting in-memory only');
    return;
  }

  try {
    const file = await getFileSha();
    const sha = file?.sha;
    const existing = file?.content?.members || [];

    // Merge: update existing by id, append new ones
    const byId = new Map(existing.map((m: MemberRecord) => [m.id, m]));
    for (const m of members) {
      byId.set(m.id, { ...(byId.get(m.id) || {}), ...m, updated_at: new Date().toISOString() });
    }
    const merged = Array.from(byId.values());

    const payload: DbContent = {
      members: merged,
      created_at: file?.content?.created_at || new Date().toISOString(),
      version: '1.0',
    };

    const body = {
      message: `Update members DB — ${members.length} change(s)`,
      content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
      sha,
      branch: 'main',
    };

    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[GITHUB DB] PUT failed: ${res.status} — ${err.message || ''}`);
    } else {
      console.log('[GITHUB DB] Write successful');
    }
  } catch (err) {
    console.error('[GITHUB DB] Error writing file:', err);
  }
}

export async function addMember(member: MemberRecord): Promise<void> {
  const members = await readMembers();
  const existing = members.find((m) => m.id === member.id);
  if (existing) {
    Object.assign(existing, member, { updated_at: new Date().toISOString() });
  } else {
    members.push({ ...member, updated_at: new Date().toISOString() });
  }
  await writeMembers(members);
}

export async function updateMember(id: string, updates: Partial<MemberRecord>): Promise<void> {
  const members = await readMembers();
  const m = members.find((x) => x.id === id);
  if (!m) throw new Error(`Member ${id} not found`);
  Object.assign(m, updates, { updated_at: new Date().toISOString() });
  await writeMembers(members);
}

export type { MemberRecord, DbContent };
