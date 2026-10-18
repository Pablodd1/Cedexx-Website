export interface CampaignRecipient {
  email: string;
  first_name?: string;
  company?: string;
  segment?: 'school' | 'corporate' | 'community' | 'affiliate' | 'general';
}

export interface CampaignTemplate {
  step: number;
  id: string;
  title: string;
  cadenceLabel: string;
  recommendedDelayDays: number;
  angle: string;
  subject: string;
  altSubject: string;
  preheader: string;
  ctaLabel: string;
  ctaUrl: string;
  summary: string;
  buildHtml: (recipient?: CampaignRecipient) => string;
  buildPlainText: (recipient?: CampaignRecipient) => string;
}

const CEDEXX_URL = 'https://www.cedexx.net';
const PARTNER_URL = 'https://www.cedexx.net/partners#partner-form';
const PRICING_URL = 'https://www.cedexx.net/pricing';
const LOGO_URL = 'https://www.cedexx.net/images/lyric-logo.webp';

function wrapB2BEmail({
  preheader,
  badge,
  headline,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  psText,
}: {
  preheader: string;
  badge: string;
  headline: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  psText?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(5,2,73,0.08);border:1px solid #e2e8f0;">
          
          <!-- Top Brand Header -->
          <tr>
            <td style="background-color:#050249;padding:28px 36px;text-align:left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background-color:rgba(35,217,176,0.16);color:#23d9b0;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;padding:5px 12px;border-radius:999px;margin-bottom:10px;">
                      ${badge}
                    </span>
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">
                      CEDEXX <span style="font-weight:400;font-size:14px;color:#93c5fd;">| Better Care. Here. Now.</span>
                    </h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="color:#23d9b0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">
                      Powered by Lyric Health
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:36px 36px 24px 36px;">
              <h2 style="margin:0 0 18px 0;color:#050249;font-size:20px;font-weight:800;line-height:1.35;">
                ${headline}
              </h2>
              <div style="font-size:15px;line-height:1.68;color:#334155;">
                ${bodyHtml}
              </div>

              <!-- Primary CTA -->
              <div style="margin:28px 0 24px 0;text-align:left;">
                <a href="${ctaUrl}" style="display:inline-block;background-color:#050249;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:15px 28px;border-radius:12px;letter-spacing:0.4px;box-shadow:0 4px 14px rgba(5,2,73,0.18);">
                  ${ctaLabel} &rarr;
                </a>
              </div>

              <!-- Signature -->
              <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;">
                <p style="margin:0 0 4px 0;font-size:14px;color:#0f172a;font-weight:700;">
                  With intention &amp; care,
                </p>
                <p style="margin:0;font-size:15px;color:#050249;font-weight:800;">
                  Daisy Gonzalez
                </p>
                <p style="margin:2px 0 0 0;font-size:13px;color:#64748b;">
                  Founder &amp; CEO, CEDEXX · Enterprise, Community &amp; Institutional Partnerships
                </p>
                <p style="margin:6px 0 0 0;font-size:12px;color:#475569;">
                  📞 <a href="tel:8882600585" style="color:#050249;text-decoration:none;font-weight:600;">(888) 260-0585</a> · 
                  ✉️ <a href="mailto:daisy@cedexx.net" style="color:#050249;text-decoration:none;font-weight:600;">daisy@cedexx.net</a> · 
                  🌐 <a href="${CEDEXX_URL}/partners" style="color:#050249;text-decoration:none;font-weight:600;">cedexx.net/partners</a>
                </p>
              </div>

              ${psText ? `
              <div style="margin-top:18px;background-color:#f8fafc;border-left:3px solid #23d9b0;padding:12px 16px;border-radius:0 8px 8px 0;">
                <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">
                  <strong style="color:#050249;">P.S.</strong> ${psText}
                </p>
              </div>` : ''}
            </td>
          </tr>

          <!-- Lyric Trust Strip -->
          <tr>
            <td style="padding:18px 36px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 8px 0;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                Clinical Care Nationwide Powered By
              </p>
              <img src="${LOGO_URL}" alt="Lyric Health" width="115" style="display:block;margin:0 auto;border:0;" />
              <p style="margin:10px 0 0 0;color:#94a3b8;font-size:11px;line-height:1.5;">
                One connected wellness solution. Built for families. Designed for communities. Scaled for institutions.<br/>
                <a href="${CEDEXX_URL}" style="color:#050249;text-decoration:none;font-weight:600;">cedexx.net</a> · 
                <a href="${CEDEXX_URL}/pricing" style="color:#64748b;text-decoration:none;">Plans &amp; Pricing</a> · 
                <a href="${CEDEXX_URL}/partners" style="color:#64748b;text-decoration:none;">Institutional Solutions</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function greetingFor(r?: CampaignRecipient): string {
  const name = r?.first_name?.trim();
  if (name && name.toLowerCase() !== 'there' && name.toLowerCase() !== 'partner') {
    return `Hi ${name},`;
  }
  return 'Hello,';
}

function orgMentionFor(r?: CampaignRecipient, fallback = 'your organization'): string {
  return r?.company?.trim() ? r.company.trim() : fallback;
}

export const B2B_CAMPAIGN_SEQUENCE: CampaignTemplate[] = [
  // ─── EMAIL 1: DAY 1 — THE EXECUTIVE HOOK & PROBLEM/SOLUTION ───
  {
    step: 1,
    id: 'campaign-1-executive-intro',
    title: 'Email 1: The $0-Copay Household Wellness Amenity (Executive Hook)',
    cadenceLabel: 'Day 1 (Tuesday 9:30 AM EST)',
    recommendedDelayDays: 0,
    angle: 'Problem Disruption — Eliminating $150–$300 Urgent Care Costs & Absenteeism for Your People',
    subject: 'A $0-copay virtual healthcare & mental wellness benefit for your people',
    altSubject: 'Expanding 24/7 healthcare access for your organization & households',
    preheader: 'How school districts, employers, and residential communities provide 24/7 doctor & mental wellness access for up to 7 family members.',
    ctaLabel: 'Explore Institutional & Community Solutions',
    ctaUrl: PARTNER_URL,
    summary: 'Introduces CEDEXX (powered by Lyric Health) and the core problem: families avoiding care due to $150–$300 urgent care co-pays, waiting rooms, and insurance gaps. Highlights 1 subscription covering up to 7 household members.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapB2BEmail({
        preheader: 'How school districts, employers, and residential communities provide 24/7 doctor & mental wellness access for up to 7 family members.',
        badge: 'Campaign 1 of 5 · Executive Introduction',
        headline: 'What happens when the people you serve can see a doctor or counselor 24/7—with $0 co-pays?',
        ctaLabel: 'Explore Institutional & Community Solutions',
        ctaUrl: PARTNER_URL,
        psText: 'You can simply reply "QUOTE" to this email with your approximate headcount or unit count, and I will prepare a custom volume overview for your team.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Across school districts, workplaces, and residential communities, one challenge comes up repeatedly: even when people have traditional insurance, a single urgent care visit often costs <strong>$150 to $300+ out of pocket</strong>—plus hours lost away from work, school, or family.
          </p>
          <p style="margin:0 0 16px 0;">
            At <strong>CEDEXX</strong> (powered by <strong>Lyric Health</strong>), we built a modern digital healthcare and mental wellness amenity designed so <strong>${org}</strong> can deliver immediate, dependable care to the people who make your community thrive.
          </p>
          <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin:18px 0;">
            <p style="margin:0 0 10px 0;font-weight:800;color:#050249;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">
              What 1 CEDEXX Membership Delivers:
            </p>
            <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
              <li><strong>24/7 Virtual Urgent Care &amp; Pediatrics:</strong> Board-certified physicians nationwide in minutes—with <strong>$0 visit fees and $0 co-pays</strong>.</li>
              <li><strong>Mental Health &amp; Therapy:</strong> Confidential virtual counseling and behavioral health support for anxiety, stress, and burnout.</li>
              <li><strong>Full Household Coverage (Up to 7 Members):</strong> Every family plan covers the member plus their spouse and children at no extra per-person cost.</li>
              <li><strong>No Insurance Required:</strong> Works as a standalone safety net or complements high-deductible health plans.</li>
            </ul>
          </div>
          <p style="margin:0;">
            Whether you are supporting educators and staff, corporate teams, multifamily residents, or association members, CEDEXX makes high-impact healthcare remarkably affordable at scale.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

Across school districts, workplaces, and residential communities, a single urgent care visit often costs $150 to $300+ out of pocket—plus hours lost away from work or school.

At CEDEXX (powered by Lyric Health), we deliver a modern digital healthcare and mental wellness benefit for ${orgMentionFor(r)}:
- 24/7 Virtual Urgent Care, Primary Care & Pediatrics ($0 visit fees, $0 co-pays)
- Confidential Mental Health & Therapy
- Up to 7 Household Members covered under a single family membership
- No insurance required

Explore Institutional & Community Solutions: ${PARTNER_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── EMAIL 2: DAY 6 — ECOSYSTEM FIT & TAILORED USE CASES ───
  {
    step: 2,
    id: 'campaign-2-ecosystems-scale',
    title: 'Email 2: How Organizations Like Yours Deploy CEDEXX (4 Ecosystems)',
    cadenceLabel: 'Day 6 (5 Days Later — Thursday 10:00 AM EST)',
    recommendedDelayDays: 5,
    angle: 'Sector Relevance — School Districts, Public Agencies, Employers & Residential Communities',
    subject: 'How schools, employers & communities roll out 24/7 virtual care',
    altSubject: 'Following up: Tailoring CEDEXX for your community or workforce',
    preheader: 'See how our 4 Ecosystems support educators, employees, residents, and member associations.',
    ctaLabel: 'See the Ecosystems We Serve',
    ctaUrl: `${CEDEXX_URL}/partners`,
    summary: 'Follows up on Email 1 by showing concrete deployment models across the 4 CEDEXX pillars: Workforce & Institutional (Schools/Public Agencies), Community & Housing (Multifamily/Student/Hospitality), Family & Individual, and Affiliate/Associations.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapB2BEmail({
        preheader: 'See how our 4 Ecosystems support educators, employees, residents, and member associations.',
        badge: 'Campaign 2 of 5 · Ecosystems We Serve',
        headline: 'One connected wellness platform—tailored to how your organization operates.',
        ctaLabel: 'See the Ecosystems We Serve',
        ctaUrl: `${CEDEXX_URL}/partners`,
        psText: 'Not sure whether an organization-sponsored or voluntary member-paid rollout fits best? Reply here and we can walk through both models in 10 minutes.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Following up on my note earlier this week—organizations often ask how <strong>CEDEXX</strong> adapts to their specific population without adding administrative burden to HR or property teams.
          </p>
          <p style="margin:0 0 16px 0;">
            We structure our partnerships around four core ecosystems so <strong>${org}</strong> can choose the exact fit:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 18px 0;">
            <tr>
              <td style="padding:14px 16px;background-color:#f8fafc;border-left:4px solid #050249;border-radius:8px;margin-bottom:10px;">
                <strong style="color:#050249;font-size:14px;">1. School Districts, Public Agencies &amp; Employers</strong><br/>
                <span style="font-size:13px;color:#475569;">Reduce teacher and workforce absenteeism with 24/7 urgent care, mental wellness counseling, pediatric specialists, and digital work/school excuse notes.</span>
              </td>
            </tr>
            <tr><td height="10"></td></tr>
            <tr>
              <td style="padding:14px 16px;background-color:#f8fafc;border-left:4px solid #23d9b0;border-radius:8px;">
                <strong style="color:#050249;font-size:14px;">2. Multifamily, Student, Senior &amp; Workforce Housing</strong><br/>
                <span style="font-size:13px;color:#475569;">Offer "Rent-Included" or resident-perk virtual healthcare that boosts tenant retention, differentiates properties, and supports hotel/hospitality guests.</span>
              </td>
            </tr>
            <tr><td height="10"></td></tr>
            <tr>
              <td style="padding:14px 16px;background-color:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;">
                <strong style="color:#050249;font-size:14px;">3. Associations, Credit Unions, Faith &amp; Nonprofit Networks</strong><br/>
                <span style="font-size:13px;color:#475569;">Provide exclusive affiliate or member-sponsored wellness plans for independent contractors, REALTORS®, gig workers, and families.</span>
              </td>
            </tr>
          </table>
          <p style="margin:0;">
            Because all clinical care is delivered nationwide by board-certified <strong>Lyric Health</strong> physicians and therapists, your team never handles medical data or complex claims administration.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

Following up on my note earlier this week—here is how organizations deploy CEDEXX without adding administrative burden:

1. School Districts, Public Agencies & Employers: Reduce absenteeism with 24/7 urgent care, mental wellness, pediatrics, and digital work/school notes.
2. Multifamily, Student & Senior Housing: Offer resident wellness amenities and hospitality guest concierge care that boost retention.
3. Associations, Credit Unions & Faith/Nonprofit Networks: Exclusive member wellness plans for independent contractors and families.

See the Ecosystems We Serve: ${CEDEXX_URL}/partners

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── EMAIL 3: DAY 12 — FINANCIAL ROI & VOLUME PRICING BREAKDOWN ───
  {
    step: 3,
    id: 'campaign-3-roi-volume-pricing',
    title: 'Email 3: The Math Behind Volume Pricing vs. Traditional Care Costs',
    cadenceLabel: 'Day 12 (6 Days Later — Wednesday 9:30 AM EST)',
    recommendedDelayDays: 6,
    angle: 'CFO / Benefits ROI — Custom Per-Door, Per-Member, or Organization-Sponsored Economics',
    subject: 'The math: $150+ urgent care visits vs. volume-priced 24/7 coverage',
    altSubject: 'Custom Community, Workforce & Institutional Pricing for your team',
    preheader: 'How flexible per-door, per-member, or voluntary pricing lowers healthcare costs at scale.',
    ctaLabel: 'Request a Custom Volume Quote',
    ctaUrl: PARTNER_URL,
    summary: 'Presents the clear financial case for CFOs, Superintendents, HR Directors, and Property Owners: retail plans start at $16.99–$52.99/mo, and Enterprise/Institutional partners unlock reduced volume pricing with zero implementation fees.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapB2BEmail({
        preheader: 'How flexible per-door, per-member, or voluntary pricing lowers healthcare costs at scale.',
        badge: 'Campaign 3 of 5 · ROI & Volume Pricing',
        headline: 'High-impact wellness doesn’t require a fortune—especially at volume.',
        ctaLabel: 'Request a Custom Volume Quote',
        ctaUrl: PARTNER_URL,
        psText: 'Even if you have zero budget allocated right now, we can launch a 100% voluntary member-paid program with an exclusive institutional discount for your group.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            When evaluating a new benefit for <strong>${org}</strong>, leadership teams always ask two questions: <em>"What does it actually cost?"</em> and <em>"Will people actually use it?"</em>
          </p>
          <p style="margin:0 0 16px 0;">
            Even at our public retail rates, a single avoided urgent care visit ($150–$300+) pays for months of membership. For institutional, workforce, and community partners, we go a step further with <strong>Custom Volume Pricing</strong>:
          </p>
          <div style="background-color:#050249;color:#ffffff;border-radius:12px;padding:20px 22px;margin:18px 0;">
            <p style="margin:0 0 10px 0;color:#23d9b0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">
              Enterprise &amp; Institutional Pricing Options
            </p>
            <ul style="margin:0;padding-left:18px;color:#e2e8f0;font-size:14px;line-height:1.75;">
              <li><strong style="color:#ffffff;">Custom Per-Door or Per-Employee Pricing:</strong> Reduced wholesale rates based on your unit count, staff size, or member roster.</li>
              <li><strong style="color:#ffffff;">3 Flexible Funding Models:</strong> 100% Organization-Sponsored, Cost-Shared, or 100% Voluntary (zero cost to your budget).</li>
              <li><strong style="color:#ffffff;">3 Scalable Care Tiers:</strong> From 24/7 Urgent Care (<em>CareNow™</em>) to Urgent Care + Mental Health (<em>CarePlus™</em>) to Full Virtual Primary Care &amp; Preventive Labs (<em>CareComplete™</em>).</li>
              <li><strong style="color:#ffffff;">Up to 7 Family Members Included:</strong> Family tiers protect the entire household under one flat rate.</li>
            </ul>
          </div>
          <p style="margin:0;">
            If you share your approximate group size, we can put together a clear, side-by-side custom quote for <strong>${org}</strong> within 24 hours.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

When evaluating a new benefit for ${orgMentionFor(r)}, leadership teams always ask: "What does it cost?" and "Will people use it?"

Even a single avoided urgent care visit ($150-$300+) pays for months of CEDEXX membership. For institutional, workforce, and community partners, we offer Custom Volume Pricing:
- Custom Per-Door, Per-Member, or Per-Employee wholesale pricing
- 3 Funding Models: Organization-Sponsored, Cost-Shared, or 100% Voluntary (zero budget required)
- 3 Tiers: CareNow™ (Urgent Care), CarePlus™ (Urgent Care + Mental Wellness), and CareComplete™ (Full Virtual Primary Care + Labs)
- Up to 7 household members covered on family plans

Request a Custom Volume Quote: ${PARTNER_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── EMAIL 4: DAY 18 — TURNKEY ROLLOUT, COMPLIANCE & WHOLE-PERSON CARE ───
  {
    step: 4,
    id: 'campaign-4-turnkey-rollout',
    title: 'Email 4: Zero HR Headaches — How Our 24–48 Hour Turnkey Rollout Works',
    cadenceLabel: 'Day 18 (6 Days Later — Tuesday 10:00 AM EST)',
    recommendedDelayDays: 6,
    angle: 'Operational Trust — Turnkey Implementation, Bilingual Support & Whole-Person Care',
    subject: 'How we roll out CEDEXX across your organization (with zero HR heavy lifting)',
    altSubject: 'Turnkey implementation + bilingual support for your community',
    preheader: 'Dedicated rollout, 24–48 hour Lyric Health provisioning, and multi-language member support.',
    ctaLabel: 'See How Implementation Works',
    ctaUrl: PARTNER_URL,
    summary: 'Removes the #1 operational objection ("We don’t have time to manage another program") by detailing CEDEXX’s turnkey rollout, 24–48h Lyric Health activation, bilingual support (EN/ES/Creole/Russian), and whole-person wellness philosophy.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapB2BEmail({
        preheader: 'Dedicated rollout, 24–48 hour Lyric Health provisioning, and multi-language member support.',
        badge: 'Campaign 4 of 5 · Turnkey Implementation',
        headline: 'Designed so your team never has to manage clinical logistics or support tickets.',
        ctaLabel: 'Schedule a 15-Minute Rollout Walkthrough',
        ctaUrl: PARTNER_URL,
        psText: 'We provide co-branded English & Spanish digital flyers, onboarding guides, and dedicated phone/chat support so your team doesn’t have to answer member questions.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Even when a wellness program makes financial sense, HR directors, school administrators, and property managers rightly worry about the workload of launching it.
          </p>
          <p style="margin:0 0 16px 0;">
            We engineered <strong>CEDEXX</strong> so that rolling out to <strong>${org}</strong> is completely turnkey:
          </p>
          <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin:18px 0;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#050249;"><strong>✓ Dedicated Organization-Wide Rollout:</strong> We supply ready-to-send digital enrollment links or roster provisioning.</p>
            <p style="margin:0 0 8px 0;font-size:14px;color:#050249;"><strong>✓ 24–48 Hour Lyric Health Activation:</strong> Once enrolled, Lyric Health provisions accounts within 24–48 hours and emails simple app setup instructions directly to each member.</p>
            <p style="margin:0 0 8px 0;font-size:14px;color:#050249;"><strong>✓ Simple Phone-Number Member ID:</strong> No plastic cards to mail or lose—a member’s 10-digit phone number is their Member ID.</p>
            <p style="margin:0;font-size:14px;color:#050249;"><strong>✓ Multilingual Member Support:</strong> Live phone desk at (888) 260-0585 and 24/7 AI support in English, Spanish, Haitian Creole, and Russian.</p>
          </div>
          <p style="margin:0;">
            At CEDEXX, we believe true wellness cares for the whole person—body, mind, and spirit. When your people feel supported at home, they show up stronger at work, at school, and in your community.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

We engineered CEDEXX so rolling out to ${orgMentionFor(r)} requires zero heavy lifting from your team:

- Dedicated Organization-Wide Rollout: Ready-to-send digital enrollment links or roster provisioning.
- 24–48 Hour Lyric Health Activation: Members receive direct setup instructions to access the Lyric Health app.
- Simple Phone-Number Member ID: No plastic cards to mail—their 10-digit phone number is their Member ID.
- Multilingual Support: Toll-free desk at (888) 260-0585 and 24/7 digital support in English, Spanish, Haitian Creole, and Russian.

Schedule a 15-Minute Rollout Walkthrough: ${PARTNER_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── EMAIL 5: DAY 25 — DIRECT 1-LINE CLOSE / PILOT INVITATION ───
  {
    step: 5,
    id: 'campaign-5-pilot-close',
    title: 'Email 5: Quick Pilot or Custom Quote Check-In (High-Reply Close)',
    cadenceLabel: 'Day 25 (7 Days Later — Tuesday 9:30 AM EST)',
    recommendedDelayDays: 7,
    angle: 'Low-Friction Executive Close — 15-Minute Custom Quote or Zero-Cost Voluntary Pilot',
    subject: 'Should we prepare a custom wellness quote for your group?',
    altSubject: 'Quick question on 2026 wellness benefits for your organization',
    preheader: 'A quick check-in from CEDEXX Founder Daisy Gonzalez—reply with 1, 2, or 3.',
    ctaLabel: 'Request Your Custom Institutional Quote',
    ctaUrl: PARTNER_URL,
    summary: 'Uses the highest-converting B2B executive follow-up technique: a short, respectful check-in offering a "Reply 1, 2, or 3" micro-response or a zero-cost voluntary pilot program.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapB2BEmail({
        preheader: 'A quick check-in from CEDEXX Founder Daisy Gonzalez—reply with 1, 2, or 3.',
        badge: 'Campaign 5 of 5 · Executive Check-In',
        headline: 'Would a custom volume quote or a zero-cost voluntary pilot be helpful for your upcoming planning?',
        ctaLabel: 'Request Your Custom Institutional Quote',
        ctaUrl: PARTNER_URL,
        psText: 'Even if timing is better next quarter, I would love to send you our 1-page Institutional & Community Pricing Overview for your files.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            I know your schedule is packed, so I will keep this brief. Over the past few weeks, I shared how <strong>CEDEXX</strong> (powered by <strong>Lyric Health</strong>) helps school districts, public agencies, employers, and residential communities provide <strong>24/7 virtual urgent care, primary care, and mental wellness</strong> with $0 co-pays for up to 7 family members.
          </p>
          <p style="margin:0 0 14px 0;">
            If expanding affordable healthcare access for <strong>${org}</strong> is on your radar this year, simply reply to this email with <strong>1, 2, or 3</strong>:
          </p>
          <div style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:18px 20px;margin:16px 0;">
            <p style="margin:0 0 10px 0;font-size:14px;color:#050249;">
              <strong>1 — Send me a Custom Quote:</strong> Reply with your approximate staff, student, resident, or member count and we will email a tailored volume quote.
            </p>
            <p style="margin:0 0 10px 0;font-size:14px;color:#050249;">
              <strong>2 — Let’s launch a $0-Budget Voluntary Pilot:</strong> Give your people an exclusive institutional discount link at zero cost to your organization.
            </p>
            <p style="margin:0;font-size:14px;color:#050249;">
              <strong>3 — Better to reconnect next quarter:</strong> Let me know when your next benefits or amenity review window opens.
            </p>
          </div>
          <p style="margin:0;">
            Thank you for the work you do for your community—I look forward to connecting whenever the timing is right.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

I know your schedule is packed, so I will keep this brief. Over the past few weeks, I shared how CEDEXX (powered by Lyric Health) helps school districts, public agencies, employers, and residential communities provide 24/7 virtual urgent care, primary care, and mental wellness with $0 co-pays for up to 7 family members.

If expanding affordable healthcare access for ${orgMentionFor(r)} is on your radar, simply reply with 1, 2, or 3:

1 — Send me a Custom Quote (reply with your approximate headcount or unit count)
2 — Let's launch a $0-Budget Voluntary Pilot for our group
3 — Better to reconnect next quarter

Or request a quote directly: ${PARTNER_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },
];
