import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendPaymentConfirmation, sendAdminNotification } from './client-email';
import { notifyAdmin } from './notify';

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
        message: `Update via Stripe webhook`,
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

  const sig = req.headers['stripe-signature'];
  const event = req.body;

  try {
    const members = await readMembers();
    let updated = false;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_email || session.customer_details?.email;
        const metadata = session.metadata || {};
        if (email) {
          const member = members.find((m: any) => m.email === email);
          if (member) {
            member.status = 'paid';
            member.paid_at = new Date().toISOString();
            member.stripe_session_id = session.id;
            member.stripe_customer_id = session.customer;
            member.stripe_subscription_id = session.subscription;
            updated = true;

            // ─── SEND NOTIFICATIONS ───
            const notifyPayload = {
              type: 'payment' as const,
              first_name: member.first_name || metadata.first_name || '',
              last_name: member.last_name || metadata.last_name || '',
              email: member.email,
              phone: member.phone || '',
              plan: member.plan || metadata.plan || '',
              amount: session.amount_total || 0,
              stripe_session_id: session.id,
            };

            // Fire-and-forget notifications
            Promise.allSettled([
              sendPaymentConfirmation({
                first_name: member.first_name || metadata.first_name || '',
                last_name: member.last_name || metadata.last_name || '',
                email: member.email,
                plan: member.plan || metadata.plan || '',
                amount: session.amount_total,
                stripe_session_id: session.id,
              }),
              notifyAdmin(notifyPayload),
            ]).catch(() => {});
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const email = invoice.customer_email;
        if (email) {
          const member = members.find((m: any) => m.email === email);
          if (member) {
            member.status = 'payment_failed';
            member.payment_failed_at = new Date().toISOString();
            updated = true;

            // ─── NOTIFY ADMIN OF FAILURE ───
            Promise.allSettled([
              notifyAdmin({
                type: 'payment' as const,
                first_name: member.first_name,
                last_name: member.last_name,
                email: member.email,
                phone: member.phone || '',
                plan: member.plan || '',
                amount: invoice.amount_due || 0,
                stripe_session_id: invoice.id,
              }),
            ]).catch(() => {});
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const member = members.find((m: any) => m.stripe_customer_id === customerId);
        if (member) {
          member.status = 'cancelled';
          member.cancelled_at = new Date().toISOString();
          updated = true;
        }
        break;
      }
    }

    if (updated) {
      await writeMembers(members);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK ERROR]', err);
    res.status(500).json({ error: err.message });
  }
}
