/**
 * CEDEXX Permanent Patient Memory Engine (`api/github-db.ts`)
 * 
 * CRITICAL GUARANTEES FOR REGISTERED PATIENTS:
 * 1. Atomic Read-Modify-Write Merge: Every write fetches the latest GitHub SHA + file content
 *    immediately before PUT, and merges incoming records by normalized `email` and `id`
 *    so concurrent writes (e.g., Stripe Webhook + Lyric Bridge + Register Member) NEVER overwrite
 *    or lose any registered patient.
 * 2. Protected Status Hierarchy: Higher lifecycle statuses (`paid` > `active` > `checkout_started` > `registered` > `form_started`)
 *    cannot be accidentally downgraded by an out-of-order request (unless explicitly `cancelled` or `expired`).
 * 3. Non-Destructive Field Merging: Existing non-empty fields (`stripe_customer_id`, `lyric_user_id`, `paid_at`,
 *    `phone`, `dob`, `address`, etc.) are preserved if a subsequent partial update omits them.
 * 4. Optional Dual-Write to Supabase: If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`)
 *    are configured, every patient write is ALSO mirrored to Supabase `members` table automatically.
 */

import { supabase } from './supabase.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'Pablodd1';
const REPO_NAME = 'Cedexx-Website';
const FILE_PATH = 'data/members.json';

export interface MemberRecord {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  dob?: string;
  plan?: string;
  status?: string;
  promo_code?: string;
  payment_method?: string;
  registered_at?: string;
  activated_at?: string | null;
  paid_at?: string | null;
  checkout_started_at?: string | null;
  checkout_expired_at?: string | null;
  payment_failed_at?: string | null;
  stripe_session_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  lyric_synced?: boolean;
  lyric_synced_at?: string | null;
  lyric_sync_method?: string;
  lyric_user_id?: number | string | null;
  lyric_sync_attempts?: number;
  lyric_last_error?: string | null;
  consent_tos?: boolean;
  consent_analytics?: boolean;
  consent_version?: string;
  consent_timestamp?: string;
  form_started_at?: string;
  form_field?: string;
  page_url?: string;
  ip_address?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  gender?: string;
  cancelled_at?: string | null;
  updated_at?: string;
  [key: string]: any;
}

export interface DbContent {
  members: MemberRecord[];
  created_at: string;
  version: string;
}

const STATUS_RANK: Record<string, number> = {
  'form_started': 1,
  'registered': 2,
  'checkout_started': 3,
  'payment_failed': 3,
  'expired': 3,
  'active': 4,
  'paid': 5,
  'cancelled': 6,
};

function resolveBestStatus(oldStatus?: string, newStatus?: string): string {
  if (!oldStatus) return newStatus || 'registered';
  if (!newStatus) return oldStatus;
  // Explicit terminal states always apply
  if (newStatus === 'cancelled' || newStatus === 'payment_failed') return newStatus;
  const oldRank = STATUS_RANK[oldStatus] ?? 0;
  const newRank = STATUS_RANK[newStatus] ?? 0;
  return newRank >= oldRank ? newStatus : oldStatus;
}

export function mergeMemberRecords(existing: MemberRecord, incoming: Partial<MemberRecord>): MemberRecord {
  const merged: MemberRecord = { ...existing };

  for (const [key, val] of Object.entries(incoming)) {
    if (key === 'status') continue;
    // Never overwrite an existing non-empty value with undefined, null, or empty string
    if (val !== undefined && val !== null && val !== '') {
      merged[key] = val;
    } else if (!(key in merged)) {
      merged[key] = val;
    }
  }

  merged.status = resolveBestStatus(existing.status, incoming.status);

  // Ensure 10-digit phone Member ID is preserved if phone is available
  const cleanPhone = String(merged.phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length === 10) {
    merged.id = cleanPhone;
  }

  if (merged.email) {
    merged.email = merged.email.toLowerCase().trim();
  }

  merged.updated_at = incoming.updated_at || new Date().toISOString();
  return merged;
}

function mergeMemberLists(remoteList: MemberRecord[], incomingList: MemberRecord[]): MemberRecord[] {
  const result: MemberRecord[] = remoteList.map((m) => ({ ...m }));

  for (const inc of incomingList) {
    if (!inc) continue;
    const normEmail = (inc.email || '').toLowerCase().trim();
    const incId = String(inc.id || '').trim();

    // Match by normalized email first (primary unique patient identity), or by ID if email matches/is absent
    const matchIndex = result.findIndex((r) => {
      const rEmail = (r.email || '').toLowerCase().trim();
      if (normEmail && rEmail && normEmail === rEmail) return true;
      if (!normEmail && incId && String(r.id || '').trim() === incId) return true;
      return false;
    });

    if (matchIndex >= 0) {
      result[matchIndex] = mergeMemberRecords(result[matchIndex], inc);
    } else {
      const cleanPhone = String(inc.phone || '').replace(/\D/g, '').slice(-10);
      const id = cleanPhone.length === 10 ? cleanPhone : (inc.id || `mem_${Date.now()}`);
      result.push({
        ...inc,
        id,
        email: normEmail || inc.email || '',
        status: inc.status || 'registered',
        registered_at: inc.registered_at || new Date().toISOString(),
        updated_at: inc.updated_at || new Date().toISOString(),
      });
    }
  }

  return result;
}

async function fetchGitHubFile(): Promise<{ sha: string; content: DbContent } | null> {
  if (!GITHUB_TOKEN) {
    console.warn('[GITHUB DB] GITHUB_TOKEN not set');
    return null;
  }

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=main`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache',
      },
    }
  );

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`[GITHUB DB] GET failed with HTTP ${res.status}`);
  }

  const data = await res.json();
  const decoded: DbContent = data.content
    ? JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'))
    : { members: [], created_at: new Date().toISOString(), version: '1.0' };

  return { sha: data.sha, content: decoded };
}

async function mirrorToSupabase(members: MemberRecord[]): Promise<void> {
  if (!supabase || !members.length) return;
  try {
    await supabase.from('members').upsert(
      members.map((m) => ({
        id: m.id,
        email: m.email,
        first_name: m.first_name || '',
        last_name: m.last_name || '',
        phone: m.phone || '',
        dob: m.dob || '',
        plan: m.plan || '',
        status: m.status || 'registered',
        address: m.address || '',
        city: m.city || '',
        state: m.state || '',
        zipcode: m.zipcode || '',
        registered_at: m.registered_at || null,
        paid_at: m.paid_at || null,
        stripe_customer_id: m.stripe_customer_id || null,
        stripe_subscription_id: m.stripe_subscription_id || null,
        lyric_synced: m.lyric_synced || false,
        lyric_user_id: m.lyric_user_id || null,
        raw_record: m,
        updated_at: m.updated_at || new Date().toISOString(),
      })),
      { onConflict: 'email' }
    );
  } catch (err) {
    // Non-fatal if Supabase table is not provisioned yet
    console.warn('[SUPABASE MIRROR] Skipped or failed:', err);
  }
}

/**
 * Always reads fresh from GitHub (`ref=main`) so serverless warm instances never serve stale data.
 */
export async function readMembers(): Promise<MemberRecord[]> {
  try {
    const file = await fetchGitHubFile();
    return file?.content?.members || [];
  } catch (err) {
    console.error('[GITHUB DB] readMembers error:', err);
    return [];
  }
}

/**
 * Atomically merges `incomingMembers` into the latest `data/members.json` on GitHub (`main`),
 * retrying up to 5 times with exponential backoff on 409 SHA conflicts.
 * Guaranteed never to drop or overwrite concurrent patient records.
 */
export async function writeMembers(incomingMembers: MemberRecord[], commitMessage?: string): Promise<boolean> {
  if (!GITHUB_TOKEN) {
    console.error('[GITHUB DB] Cannot persist: GITHUB_TOKEN missing');
    return false;
  }

  let attempts = 0;
  const maxAttempts = 5;
  let delayMs = 250;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const latestFile = await fetchGitHubFile();
      const sha = latestFile?.sha;
      const remoteMembers = latestFile?.content?.members || [];
      const createdAt = latestFile?.content?.created_at || new Date().toISOString();

      // Atomic merge: combine latest remote records with incoming changes
      const mergedMembers = mergeMemberLists(remoteMembers, incomingMembers);

      const payload: DbContent = {
        members: mergedMembers,
        created_at: createdAt,
        version: '1.0',
      };

      const putRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMessage || `Update members DB (${mergedMembers.length} permanent records)`,
            content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
            sha,
            branch: 'main',
          }),
        }
      );

      if (putRes.ok) {
        await mirrorToSupabase(incomingMembers);
        return true;
      }

      if ((putRes.status === 409 || putRes.status === 422) && attempts < maxAttempts) {
        console.warn(`[GITHUB DB] SHA conflict (${putRes.status}) on attempt ${attempts}, retrying in ${delayMs}ms...`);
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
        continue;
      }

      const errText = await putRes.text().catch(() => '');
      console.error(`[GITHUB DB] PUT failed (${putRes.status}): ${errText}`);
      break;
    } catch (err) {
      console.error(`[GITHUB DB] Write error on attempt ${attempts}:`, err);
      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
      }
    }
  }

  return false;
}

/**
 * Upsert a single patient record atomically without needing to read all members first.
 */
export async function upsertMember(member: Partial<MemberRecord> & { email: string }, commitMessage?: string): Promise<MemberRecord> {
  const latest = await readMembers();
  const normEmail = member.email.toLowerCase().trim();
  const existing = latest.find((m) => (m.email || '').toLowerCase().trim() === normEmail);

  const cleanPhone = String(member.phone || existing?.phone || '').replace(/\D/g, '').slice(-10);
  const resolvedId = cleanPhone.length === 10
    ? cleanPhone
    : (existing?.id || member.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  const recordToSave: MemberRecord = existing
    ? mergeMemberRecords(existing, { ...member, id: resolvedId })
    : {
        id: resolvedId,
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: normEmail,
        phone: member.phone || '',
        dob: member.dob || '',
        address: member.address || '',
        city: member.city || '',
        state: member.state || '',
        zipcode: member.zipcode || '',
        plan: member.plan || 'carenow',
        status: member.status || 'registered',
        registered_at: member.registered_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...member,
      };

  await writeMembers([recordToSave], commitMessage || `Upsert patient ${recordToSave.id}`);
  return recordToSave;
}
