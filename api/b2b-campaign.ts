import type { VercelRequest, VercelResponse } from '@vercel/node';
import { B2B_CAMPAIGN_SEQUENCE, FAMILY_CAMPAIGN_SEQUENCE, CampaignRecipient } from '../src/data/b2b-email-campaigns.js';

const DASHBOARD_PASSWORD = (process.env.DASHBOARD_PASSWORD || '').trim();
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_CAMPAIGN = 'Daisy Gonzalez — CEDEXX <daisy@cedexx.net>';
const REPLY_TO = 'daisy@cedexx.net';

function parseRecipientLine(line: string): CampaignRecipient | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  // Support CSV or pipe format: "email@company.com, First Name, Company Name" or just "email@company.com"
  const parts = trimmed.split(/[,|\t;]/).map(s => s.trim());
  const emailPart = parts.find(p => p.includes('@') && p.includes('.'));
  if (!emailPart) return null;

  const cleanEmail = emailPart.replace(/^<|>$/g, '').trim().toLowerCase();
  const otherParts = parts.filter(p => p !== emailPart);

  return {
    email: cleanEmail,
    first_name: otherParts[0] || undefined,
    company: otherParts[1] || undefined,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-dashboard-pass');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Fail closed if DASHBOARD_PASSWORD is not configured on the server
  if (!DASHBOARD_PASSWORD) {
    return res.status(503).json({
      success: false,
      error: 'Admin password (DASHBOARD_PASSWORD) is not configured in server environment variables.',
    });
  }

  const pass = String(req.query.pass || req.headers['x-dashboard-pass'] || req.body?.pass || '').trim();
  if (!pass || pass !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  // GET: Return all 5 campaign metadata & preview HTML
  if (req.method === 'GET') {
    const track = (req.query.track as string) === 'b2b' ? 'b2b' : 'family';
    const sequence = track === 'b2b' ? B2B_CAMPAIGN_SEQUENCE : FAMILY_CAMPAIGN_SEQUENCE;
    const sampleRecipient: CampaignRecipient = {
      email: track === 'b2b' ? 'prospect@organization.org' : 'family@example.com',
      first_name: (req.query.first_name as string) || (track === 'b2b' ? 'Alex' : 'Maria'),
      company: (req.query.company as string) || 'Your Organization',
    };

    return res.status(200).json({
      success: true,
      track,
      campaigns: sequence.map(c => ({
        step: c.step,
        id: c.id,
        title: c.title,
        cadenceLabel: c.cadenceLabel,
        recommendedDelayDays: c.recommendedDelayDays,
        angle: c.angle,
        subject: c.subject,
        altSubject: c.altSubject,
        preheader: c.preheader,
        ctaLabel: c.ctaLabel,
        ctaUrl: c.ctaUrl,
        summary: c.summary,
        previewHtml: c.buildHtml(sampleRecipient),
        previewPlainText: c.buildPlainText(sampleRecipient),
      })),
    });
  }

  // POST: Send a specific campaign step (1-5) to a list of recipients via Resend
  if (req.method === 'POST') {
    if (!RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'RESEND_API_KEY is not configured on the server.',
      });
    }

    const {
      track = 'family',
      step = 1,
      recipientsRaw = '',
      recipients = [],
      customSubject = '',
    } = req.body || {};

    const sequence = track === 'b2b' ? B2B_CAMPAIGN_SEQUENCE : FAMILY_CAMPAIGN_SEQUENCE;
    const campaign = sequence.find(c => c.step === Number(step));
    if (!campaign) {
      return res.status(400).json({
        success: false,
        error: `Invalid campaign step (${step}). Choose 1 through 5.`,
      });
    }

    // Parse recipients from either array or newline/comma-separated text
    let parsedList: CampaignRecipient[] = [];
    if (Array.isArray(recipients) && recipients.length > 0) {
      parsedList = recipients
        .map((r: any) => (typeof r === 'string' ? parseRecipientLine(r) : r))
        .filter((r): r is CampaignRecipient => Boolean(r && r.email && r.email.includes('@')));
    } else if (typeof recipientsRaw === 'string' && recipientsRaw.trim()) {
      const lines = recipientsRaw.split(/\r?\n/);
      for (const line of lines) {
        const parsed = parseRecipientLine(line);
        if (parsed) parsedList.push(parsed);
      }
    }

    // Deduplicate by email
    const seen = new Set<string>();
    const uniqueRecipients = parsedList.filter(r => {
      const key = r.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (uniqueRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one valid email address.',
      });
    }

    const subjectToUse = (customSubject && customSubject.trim()) || campaign.subject;
    const results: Array<{ email: string; ok: boolean; id?: string; error?: string }> = [];

    for (const recipient of uniqueRecipients) {
      try {
        const html = campaign.buildHtml(recipient);
        const text = campaign.buildPlainText(recipient);

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_CAMPAIGN,
            to: [recipient.email],
            reply_to: REPLY_TO,
            subject: subjectToUse,
            html,
            text,
          }),
        });

        const data = await resendRes.json().catch(() => ({}));
        if (resendRes.ok) {
          results.push({ email: recipient.email, ok: true, id: data.id });
        } else {
          results.push({
            email: recipient.email,
            ok: false,
            error: data.message || `HTTP ${resendRes.status}`,
          });
        }
      } catch (err: any) {
        results.push({
          email: recipient.email,
          ok: false,
          error: err.message || 'Network error',
        });
      }
    }

    const sentCount = results.filter(r => r.ok).length;
    const failedCount = results.length - sentCount;

    return res.status(200).json({
      success: sentCount > 0,
      step: campaign.step,
      campaignTitle: campaign.title,
      subject: subjectToUse,
      total: results.length,
      sentCount,
      failedCount,
      results,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
