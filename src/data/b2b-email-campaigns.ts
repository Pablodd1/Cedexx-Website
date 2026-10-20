export interface CampaignRecipient {
  email: string;
  first_name?: string;
  company?: string;
  segment?: 'family' | 'school' | 'corporate' | 'community' | 'affiliate' | 'general';
}

export interface CampaignTemplate {
  track: 'family' | 'b2b';
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
const ENROLL_URL = 'https://www.cedexx.net/enroll';
const PRICING_URL = 'https://www.cedexx.net/pricing';
const PARTNER_URL = 'https://www.cedexx.net/partners#partner-form';
const LOGO_URL = 'https://www.cedexx.net/images/lyric-logo.webp';

function wrapBrandedEmail({
  preheader,
  badge,
  headline,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  psText,
  footerSubline,
}: {
  preheader: string;
  badge: string;
  headline: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  psText?: string;
  footerSubline?: string;
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
              <h2 style="margin:0 0 18px 0;color:#050249;font-size:21px;font-weight:800;line-height:1.35;">
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
                ${secondaryCtaLabel && secondaryCtaUrl ? `
                <a href="${secondaryCtaUrl}" style="display:inline-block;margin-left:12px;color:#050249;font-size:13px;font-weight:700;text-decoration:underline;padding:10px 8px;">
                  ${secondaryCtaLabel}
                </a>` : ''}
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
                  ${footerSubline || 'Founder & CEO, CEDEXX · Family, Community & Institutional Wellness'}
                </p>
                <p style="margin:6px 0 0 0;font-size:12px;color:#475569;">
                  📞 <a href="tel:8882600585" style="color:#050249;text-decoration:none;font-weight:600;">(888) 260-0585</a> · 
                  ✉️ <a href="mailto:daisy@cedexx.net" style="color:#050249;text-decoration:none;font-weight:600;">daisy@cedexx.net</a> · 
                  🌐 <a href="${CEDEXX_URL}" style="color:#050249;text-decoration:none;font-weight:600;">cedexx.net</a>
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
                <a href="${PRICING_URL}" style="color:#64748b;text-decoration:none;">Plans &amp; Pricing</a> · 
                <a href="${ENROLL_URL}" style="color:#64748b;text-decoration:none;">Enroll Now</a>
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
  if (name && !['there', 'partner', 'decision maker', 'family', 'friend'].includes(name.toLowerCase())) {
    return `Hi ${name},`;
  }
  return 'Hello,';
}

function orgMentionFor(r?: CampaignRecipient, fallback = 'your organization'): string {
  return r?.company?.trim() ? r.company.trim() : fallback;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRACK 1: 5-EMAIL FAMILY & HOUSEHOLD FOLLOW-UP CAMPAIGN SEQUENCE
// Crystal-clear benefits of CEDEXX services for families (up to 7 members)
// ═══════════════════════════════════════════════════════════════════════════
export const FAMILY_CAMPAIGN_SEQUENCE: CampaignTemplate[] = [
  // ─── FAMILY EMAIL 1: DAY 1 — 24/7 URGENT CARE & PEDIATRICS FOR UP TO 7 FAMILY MEMBERS ($18.99/MO) ───
  {
    track: 'family',
    step: 1,
    id: 'family-1-urgent-care-household',
    title: 'Email 1: 24/7 Doctor Access for Your Whole Family — Starting at $18.99/mo ($0 Co-Pays)',
    cadenceLabel: 'Week 1 / Day 1 (Tuesday 9:30 AM EST)',
    recommendedDelayDays: 0,
    angle: 'Clear Household Protection — Replace $150–$300 Urgent Care Visits with 1 Membership for Up to 7 Family Members',
    subject: '24/7 doctors for your whole family (up to 7 members) — starting at $18.99/mo',
    altSubject: 'Skip the $200 urgent care bill: 24/7 family doctor access with $0 co-pays',
    preheader: 'One simple CEDEXX membership covers you, your spouse, and your children with $0 visit fees and no insurance required.',
    ctaLabel: 'Protect Your Family Starting at $18.99/mo',
    ctaUrl: ENROLL_URL,
    summary: 'Clearly explains the #1 immediate benefit for families: 24/7 Virtual Urgent Care & Pediatrics for up to 7 household members starting at $18.99/mo (CareNow™), with $0 visit fees, $0 co-pays, digital prescriptions, and school/work excuse notes.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      return wrapBrandedEmail({
        preheader: 'One simple CEDEXX membership covers you, your spouse, and your children with $0 visit fees and no insurance required.',
        badge: 'Family Series 1 of 5 · 24/7 Urgent Care & Pediatrics',
        headline: 'When fever strikes at 10 PM, your family shouldn’t face a 3-hour wait or a $200 urgent care bill.',
        ctaLabel: 'Enroll Your Family Starting at $18.99/mo',
        ctaUrl: ENROLL_URL,
        secondaryCtaLabel: 'Compare All Family Plans',
        secondaryCtaUrl: PRICING_URL,
        psText: 'Have questions before enrolling? Call our friendly support desk anytime at (888) 260-0585 or reply directly to this email.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Every parent knows the stress of a sudden fever, ear infection, or sinus flu after hours. A single trip to a walk-in urgent care clinic often costs <strong>$150 to $300+ out of pocket</strong>—even when you have insurance.
          </p>
          <p style="margin:0 0 16px 0;">
            At <strong>CEDEXX</strong> (powered by <strong>Lyric Health</strong>), we created a simple, affordable membership that gives your <strong>entire household (up to 7 family members)</strong> 24/7 access to board-certified doctors and pediatricians from your phone or computer.
          </p>

          <div style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:14px;padding:20px 22px;margin:18px 0;">
            <p style="margin:0 0 12px 0;font-weight:800;color:#050249;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">
              What Your Family Gets with CareNow™ ($18.99/month):
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#334155;line-height:1.65;">
              <tr>
                <td valign="top" width="24" style="padding-bottom:8px;color:#23d9b0;font-weight:900;">✓</td>
                <td style="padding-bottom:8px;"><strong>Covers Up to 7 Family Members:</strong> One flat monthly price covers you, your spouse/partner, and dependents—no per-person fees.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="padding-bottom:8px;color:#23d9b0;font-weight:900;">✓</td>
                <td style="padding-bottom:8px;"><strong>$0 Visit Fees &amp; $0 Co-Pays:</strong> Unlimited 24/7 virtual urgent care and pediatric consultations at zero extra cost.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="padding-bottom:8px;color:#23d9b0;font-weight:900;">✓</td>
                <td style="padding-bottom:8px;"><strong>Everyday Illnesses Treated Fast:</strong> Cold &amp; flu, sinus &amp; respiratory infections, ear &amp; eye infections, allergies, rashes, and stomach bugs.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="padding-bottom:8px;color:#23d9b0;font-weight:900;">✓</td>
                <td style="padding-bottom:8px;"><strong>Digital Prescriptions &amp; Refills:</strong> Sent directly to your preferred local pharmacy when medically appropriate.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="padding-bottom:8px;color:#23d9b0;font-weight:900;">✓</td>
                <td style="padding-bottom:8px;"><strong>Digital School &amp; Work Excuse Notes:</strong> Provided digitally after your consultation so your family doesn't miss a beat.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="color:#23d9b0;font-weight:900;">✓</td>
                <td><strong>No Insurance Required:</strong> No deductibles, no surprise bills, and cancel anytime with zero fees.</td>
              </tr>
            </table>
          </div>

          <p style="margin:0;">
            Instead of paying $200+ for a single walk-in clinic visit, your whole family stays protected all month for <strong>$18.99</strong>.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

Every parent knows the stress of a sudden fever, ear infection, or flu after hours. A single trip to a walk-in urgent care clinic often costs $150 to $300+ out of pocket.

At CEDEXX (powered by Lyric Health), one CareNow™ membership ($18.99/month) gives your entire household (up to 7 family members) 24/7 access to board-certified doctors and pediatricians:

- Covers Up to 7 Family Members under one flat monthly price
- $0 Visit Fees & $0 Co-Pays for unlimited 24/7 virtual urgent care visits
- Treats Cold & Flu, Sinus Infections, Ear & Eye Infections, Allergies & more
- Digital Prescriptions sent directly to your local pharmacy
- Digital School & Work Excuse Notes provided after consults
- No Insurance Required — cancel anytime with zero fees

Enroll Your Family Starting at $18.99/mo: ${ENROLL_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── FAMILY EMAIL 2: DAY 6 — MENTAL WELLNESS, THERAPY & COUNSELING FOR PARENTS, TEENS & COUPLES ───
  {
    track: 'family',
    step: 2,
    id: 'family-2-mental-wellness-therapy',
    title: 'Email 2: Unlimited Family Therapy & Mental Wellness — Add for Just +$8/mo',
    cadenceLabel: 'Week 2 / Day 6 (5 Days Later — Monday/Tuesday 10:00 AM EST)',
    recommendedDelayDays: 5,
    angle: 'Emotional & Behavioral Support — Unlimited Licensed Therapists, Family Counseling & Crisis Support',
    subject: 'Unlimited therapy & mental wellness for your family (just $26.99/mo with Urgent Care)',
    altSubject: 'Caring for your family’s mind & heart: Private virtual counseling with $0 co-pays',
    preheader: 'Traditional therapy costs $150+ per session. Get unlimited licensed therapists + 24/7 Urgent Care for your household for $26.99/mo.',
    ctaLabel: 'Explore CareNow + Mental Wellness ($26.99/mo)',
    ctaUrl: ENROLL_URL,
    summary: 'Follows up on Email 1 by highlighting CEDEXX Mental Wellness ($18.99/mo standalone, or $26.99/mo bundled with 24/7 Urgent Care in CareNow + Mental Wellness). Explains unlimited licensed therapist access, family counseling, anxiety/stress support, and transparent 50%-off specialty psychiatry.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      return wrapBrandedEmail({
        preheader: 'Traditional therapy costs $150+ per session. Get unlimited licensed therapists + 24/7 Urgent Care for your household for $26.99/mo.',
        badge: 'Family Series 2 of 5 · Mental Wellness & Family Therapy',
        headline: 'True family health cares for the whole person—body, mind, and spirit.',
        ctaLabel: 'Start CareNow + Mental Wellness ($26.99/mo)',
        ctaUrl: ENROLL_URL,
        secondaryCtaLabel: 'View Mental Wellness Details',
        secondaryCtaUrl: PRICING_URL,
        psText: 'You can also choose our standalone Mental Wellness membership for $18.99/month, or bundle it with 24/7 Urgent Care for just $8 more ($26.99/month total).',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Following up on my last note—physical illnesses like colds and ear infections are only half of what modern families navigate. Between work stress, school pressures, anxiety, and life transitions, mental wellness matters just as much.
          </p>
          <p style="margin:0 0 16px 0;">
            Normally, a single private therapy session costs <strong>$150 to $250+ per hour</strong>. With our most popular <strong>CareNow™ + Mental Wellness Bundle ($26.99/month)</strong>, you add full behavioral health and therapy for your household for <strong>just $8 more per month</strong>:
          </p>

          <div style="background-color:#050249;color:#ffffff;border-radius:14px;padding:20px 22px;margin:18px 0;">
            <p style="margin:0 0 12px 0;color:#23d9b0;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">
              What’s Included in CEDEXX Mental Wellness:
            </p>
            <ul style="margin:0;padding-left:18px;color:#e2e8f0;font-size:14px;line-height:1.75;">
              <li><strong style="color:#ffffff;">Unlimited Access to Licensed Therapists &amp; Counselors:</strong> $0 additional session fees for licensed therapists and counselors.</li>
              <li><strong style="color:#ffffff;">Individual, Couples &amp; Family Counseling:</strong> Support for anxiety, depression, workplace stress, grief &amp; loss, and relationship challenges.</li>
              <li><strong style="color:#ffffff;">24/7 Crisis Support Line:</strong> Immediate emotional support whenever you or a loved one need someone to talk to.</li>
              <li><strong style="color:#ffffff;">Multilingual Mental Health Professionals:</strong> Speak with compassionate providers from the privacy of home.</li>
              <li><strong style="color:#ffffff;">Plus Everything in CareNow™ ($26.99/mo Bundle):</strong> Includes 24/7 Virtual Urgent Care &amp; Pediatrics for up to 7 family members.</li>
            </ul>
          </div>

          <p style="margin:0;font-size:13px;color:#475569;">
            <em>Note on Specialty Care:</em> If you ever need a Psychiatrist or Psychologist appointment, members also receive transparent self-pay rates typically ~50% below market pricing, always shown upfront with zero hidden fees.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

Following up on my last note—true family health cares for both physical and emotional well-being. Normally, a single private therapy session costs $150 to $250+ per hour.

With our Best-Value Bundle — CareNow™ + Mental Wellness ($26.99/month) — you get 24/7 Urgent Care PLUS full Mental Wellness for just $8 more per month:

- Unlimited Access to Licensed Therapists & Counselors ($0 additional session fees)
- Individual Therapy & Family Counseling (anxiety, depression, stress, grief, relationships)
- 24/7 Crisis Support Line & Multilingual Professionals
- Everything in CareNow™ included (24/7 Urgent Care for up to 7 family members)
- Or choose standalone Mental Wellness for $18.99/month

Start CareNow + Mental Wellness ($26.99/mo): ${ENROLL_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── FAMILY EMAIL 3: DAY 12 — CARECOMPLETE™ PRIMARY CARE, $0 LABS & 237+ $0 MEDICATIONS ───
  {
    track: 'family',
    step: 3,
    id: 'family-3-carecomplete-labs-meds',
    title: 'Email 3: Dedicated Family Primary Care + $0 Annual Labs + 237 Medications at $0 Cost',
    cadenceLabel: 'Week 3 / Day 12 (6 Days Later — Monday/Tuesday 9:30 AM EST)',
    recommendedDelayDays: 6,
    angle: 'Complete Medical Home — Dedicated PCP, $0 Lab Panel, $0 Acute/Chronic Medications, Dermatology & GLP-1 Access',
    subject: 'Your own Primary Care Doctor + $0 annual labs + 237 medications at $0 cost',
    altSubject: 'Inside CareComplete™: Complete Primary Care, Urgent Care, Therapy & $0 Meds for your family',
    preheader: 'See everything included in CareComplete™ ($34.99/mo Individual | $52.99/mo Family for up to 7 members).',
    ctaLabel: 'See CareComplete™ Family Benefits',
    ctaUrl: PRICING_URL,
    summary: 'Deep-dives into CEDEXX’s flagship CareComplete™ ($34.99/mo Individual) and CareComplete Family™ ($52.99/mo for up to 7 members)—spotlighting the Dedicated Primary Care Physician for EVERY family member, $0 Annual Wellness Lab Panel, 37 acute + 200+ chronic medications at $0 cost, Virtual Dermatology, and Care Navigation.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      return wrapBrandedEmail({
        preheader: 'See everything included in CareComplete™ ($34.99/mo Individual | $52.99/mo Family for up to 7 members).',
        badge: 'Family Series 3 of 5 · Complete Primary Care, $0 Labs & $0 Meds',
        headline: 'What if every member of your family had their own Primary Care Doctor, $0 annual labs, and $0 common prescriptions?',
        ctaLabel: 'Explore CareComplete™ ($34.99 Individual | $52.99 Family)',
        ctaUrl: ENROLL_URL,
        secondaryCtaLabel: 'Compare All 5 Plans',
        secondaryCtaUrl: PRICING_URL,
        psText: 'For a family of up to 7 members, CareComplete Family™ ($52.99/month) works out to just ~$7.57 per person per month for Primary Care, Urgent Care, Mental Wellness, Annual Labs, and Prescription Coverage.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Many families tell us they don’t just want urgent care when someone gets sick—they want a <strong>consistent Primary Care Doctor</strong> who knows their health history, manages chronic conditions, orders annual bloodwork, and keeps prescriptions affordable.
          </p>
          <p style="margin:0 0 16px 0;">
            That is why we built <strong>CareComplete™ ($34.99/mo Individual)</strong> and <strong>CareComplete Family™ ($52.99/mo for up to 7 household members)</strong>. Here is what your family unlocks:
          </p>

          <div style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:14px;padding:20px 22px;margin:18px 0;">
            <p style="margin:0 0 12px 0;font-weight:800;color:#050249;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">
              6 High-Value Benefits Inside CareComplete™:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#334155;line-height:1.65;">
              <tr>
                <td valign="top" width="24" style="padding-bottom:10px;color:#050249;font-weight:900;">1.</td>
                <td style="padding-bottom:10px;"><strong>Dedicated Virtual Primary Care Physician (PCP):</strong> Every covered family member gets their own personal Primary Care Doctor with unlimited virtual visits.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="padding-bottom:10px;color:#050249;font-weight:900;">2.</td>
                <td style="padding-bottom:10px;"><strong>Annual Wellness Exam &amp; Lab Panel at $0 Cost:</strong> Preventive annual checkups and annual wellness blood lab panel included at $0 cost.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="padding-bottom:10px;color:#050249;font-weight:900;">3.</td>
                <td style="padding-bottom:10px;"><strong>$0 Prescription Programs (237+ Medications):</strong> Includes <strong>37 common acute-care medications at $0 cost</strong> (Basic Program) PLUS <strong>over 200 chronic-care medications at $0 cost</strong> (Enhanced Program).</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="padding-bottom:10px;color:#050249;font-weight:900;">4.</td>
                <td style="padding-bottom:10px;"><strong>Everything in CareNow™ + Mental Wellness Included:</strong> 24/7 Urgent Care, Pediatrics, AND Unlimited Licensed Therapists &amp; Family Counseling.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="padding-bottom:10px;color:#050249;font-weight:900;">5.</td>
                <td style="padding-bottom:10px;"><strong>Virtual Dermatology &amp; Chronic Care Management:</strong> Skin evaluations plus ongoing care for asthma, blood pressure, diabetes, and more.</td>
              </tr>
              <tr>
                <td valign="top" width="24" style="color:#050249;font-weight:900;">6.</td>
                <td><strong>Care Navigation &amp; Medical Weight Management:</strong> Dedicated Wellness Advocate, reduced-cost diagnostics, and clinician-guided GLP-1 weight management options at a fraction of retail pricing.</td>
              </tr>
            </table>
          </div>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

Many families want more than urgent care when someone gets sick—they want a consistent Primary Care Doctor, annual bloodwork, and affordable prescriptions.

With CareComplete™ ($34.99/mo Individual) and CareComplete Family™ ($52.99/mo for up to 7 household members), here is what your family unlocks:

1. Dedicated Virtual Primary Care Physician (PCP) for every covered family member with unlimited virtual visits
2. Annual Wellness Exam & Annual Wellness Lab Panel at $0 Cost
3. $0 Prescription Programs: 37 common acute-care medications at $0 cost + over 200 chronic-care medications at $0 cost
4. Everything in CareNow™ (24/7 Urgent Care) + Everything in Mental Wellness (Unlimited Licensed Therapists)
5. Virtual Dermatology & Chronic Condition Management (asthma, hypertension, diabetes)
6. Dedicated Wellness Advocate, Care Navigation & Clinician-Guided GLP-1 Weight Management options

Explore CareComplete™ ($34.99 Individual | $52.99 Family): ${ENROLL_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── FAMILY EMAIL 4: DAY 18 — SIDE-BY-SIDE PLAN GUIDE & HOW EASY IT IS TO USE ───
  {
    track: 'family',
    step: 4,
    id: 'family-4-plan-comparison-how-it-works',
    title: 'Email 4: Which CEDEXX Plan Fits Your Family Best? (Simple 60-Second Guide)',
    cadenceLabel: 'Week 4 / Day 18 (6 Days Later — Monday/Tuesday 10:00 AM EST)',
    recommendedDelayDays: 6,
    angle: 'Clarity & Simplicity — Side-by-Side Comparison of All 5 Plans + Simple 24–48h Setup & Phone-Number Member ID',
    subject: 'Which CEDEXX plan fits your household best? (Quick side-by-side guide)',
    altSubject: 'How CEDEXX works: Simple plans from $18.99/mo + your phone number is your Member ID',
    preheader: 'Compare all 5 plans at a glance and see how easy it is to activate your Lyric Health app in 24–48 hours.',
    ctaLabel: 'Choose Your Family’s Plan in 2 Minutes',
    ctaUrl: ENROLL_URL,
    summary: 'Gives families a crystal-clear side-by-side comparison of all 5 plans ($18.99 to $52.99/mo) and demystifies how it works: 2-minute online signup, 24–48 hour Lyric Health activation, and using your 10-digit phone number as your Member ID.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      return wrapBrandedEmail({
        preheader: 'Compare all 5 plans at a glance and see how easy it is to activate your Lyric Health app in 24–48 hours.',
        badge: 'Family Series 4 of 5 · Simple Plan Guide & How It Works',
        headline: 'No confusing insurance jargon—just 5 clear options built around your family.',
        ctaLabel: 'Select Your Plan & Enroll Online',
        ctaUrl: ENROLL_URL,
        secondaryCtaLabel: 'Read Common Questions (FAQ)',
        secondaryCtaUrl: `${CEDEXX_URL}/faq`,
        psText: 'Already have health insurance with a high deductible? CEDEXX works alongside your existing plan so you can use $0-copay virtual care first and avoid $200+ clinic bills.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Healthcare shouldn’t require a magnifying glass to understand. Whether you are a solo freelancer, a couple, or a household of seven, here is a clear look at all 5 <strong>CEDEXX</strong> memberships:
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #cbd5e1;border-radius:12px;overflow:hidden;margin:16px 0 20px 0;font-size:13px;">
            <tr style="background-color:#050249;color:#ffffff;font-weight:800;text-align:left;">
              <td style="padding:10px 12px;">Plan</td>
              <td style="padding:10px 12px;">Monthly</td>
              <td style="padding:10px 12px;">Who &amp; What It Covers</td>
            </tr>
            <tr style="background-color:#ffffff;border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 12px;font-weight:800;color:#050249;">CareNow™</td>
              <td style="padding:10px 12px;font-weight:800;color:#050249;">$18.99/mo</td>
              <td style="padding:10px 12px;color:#334155;"><strong>Up to 7 Family Members:</strong> 24/7 Urgent Care, Pediatrics, RX &amp; School/Work Notes ($0 visit fee)</td>
            </tr>
            <tr style="background-color:#f0fdf9;border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 12px;font-weight:800;color:#050249;">CareNow + Mental ⭐</td>
              <td style="padding:10px 12px;font-weight:800;color:#0d9488;">$26.99/mo</td>
              <td style="padding:10px 12px;color:#334155;"><strong>Best Value (Up to 7 Members):</strong> Everything in CareNow™ + Unlimited Licensed Therapists &amp; Family Counseling</td>
            </tr>
            <tr style="background-color:#ffffff;border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 12px;font-weight:800;color:#050249;">Mental Wellness</td>
              <td style="padding:10px 12px;font-weight:800;color:#050249;">$18.99/mo</td>
              <td style="padding:10px 12px;color:#334155;"><strong>Behavioral Health &amp; Therapy:</strong> Unlimited Licensed Therapists, Family Counseling &amp; 24/7 Crisis Line</td>
            </tr>
            <tr style="background-color:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 12px;font-weight:800;color:#050249;">CareComplete™</td>
              <td style="padding:10px 12px;font-weight:800;color:#050249;">$34.99/mo</td>
              <td style="padding:10px 12px;color:#334155;"><strong>Individual Complete Care:</strong> Dedicated Primary Care Doctor + Urgent Care + Mental Health + $0 Annual Labs + 237 $0 Meds</td>
            </tr>
            <tr style="background-color:#ffffff;">
              <td style="padding:10px 12px;font-weight:800;color:#050249;">CareComplete Family™</td>
              <td style="padding:10px 12px;font-weight:800;color:#050249;">$52.99/mo</td>
              <td style="padding:10px 12px;color:#334155;"><strong>Whole Family (Up to 7 Members):</strong> Dedicated Primary Care Doctor for EVERY member + Urgent Care + Therapy + $0 Labs + 237 $0 Meds</td>
            </tr>
          </table>

          <div style="background-color:#f8fafc;border-left:4px solid #050249;padding:14px 18px;border-radius:0 10px 10px 0;">
            <p style="margin:0 0 6px 0;font-weight:800;color:#050249;font-size:13px;text-transform:uppercase;">
              How Enrollment &amp; Activation Works (3 Simple Steps):
            </p>
            <p style="margin:0 0 4px 0;font-size:13px;color:#334155;"><strong>1. Enroll in 2 Minutes:</strong> Choose your plan at <a href="${ENROLL_URL}" style="color:#050249;font-weight:700;">cedexx.net/enroll</a>—you’ll receive an instant receipt from support@cedexx.net.</p>
            <p style="margin:0 0 4px 0;font-size:13px;color:#334155;"><strong>2. 24–48 Hour Lyric Health Activation:</strong> Within 24 to 48 hours, Lyric Health activates your account and emails setup instructions from <em>noreply@getlyric.com</em>.</p>
            <p style="margin:0;font-size:13px;color:#334155;"><strong>3. No Plastic Cards Needed:</strong> Your 10-digit phone number is your Member ID, and you can add your spouse and children right inside the Lyric Health app.</p>
          </div>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

Here is a quick side-by-side guide to all 5 CEDEXX plans (powered by Lyric Health) with $0 visit fees and no insurance required:

1. CareNow™ ($18.99/mo — Up to 7 Family Members): 24/7 Virtual Urgent Care, Pediatrics, Prescriptions & School/Work Notes.
2. CareNow + Mental Wellness ($26.99/mo — Best Value, Up to 7 Members): Everything in CareNow™ + Unlimited Licensed Therapists & Family Counseling.
3. Mental Wellness ($18.99/mo): Unlimited Licensed Therapists, Family Counseling & 24/7 Crisis Support Line.
4. CareComplete™ ($34.99/mo — Individual): Dedicated Primary Care Doctor + Urgent Care + Mental Health + $0 Annual Labs + 237 Medications at $0 cost + Dermatology.
5. CareComplete Family™ ($52.99/mo — Up to 7 Family Members): Dedicated Primary Care Doctor for EVERY family member + Urgent Care + Therapy + $0 Annual Labs + 237 Medications at $0 cost.

How It Works:
- Step 1: Enroll at ${ENROLL_URL} and receive an immediate receipt.
- Step 2: Within 24–48 hours, Lyric Health activates your membership and emails login instructions.
- Step 3: Your 10-digit phone number is your Member ID—no plastic insurance cards needed.

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── FAMILY EMAIL 5: DAY 25 — PERSONAL INVITATION FROM FOUNDER DAISY GONZALEZ ───
  {
    track: 'family',
    step: 5,
    id: 'family-5-founder-invitation-peace-of-mind',
    title: 'Email 5: Peace of Mind Before the Next Sick Day (Personal Note from Daisy)',
    cadenceLabel: 'Week 5 / Day 25 (7 Days Later — Tuesday 9:30 AM EST)',
    recommendedDelayDays: 7,
    angle: 'Warm Founder Close — Don’t Wait for an Emergency to Set Up Your Family’s 24–48h Account Activation',
    subject: 'Before the next unexpected sick day hits your household...',
    altSubject: 'A personal note from CEDEXX Founder Daisy Gonzalez (+ how we can help)',
    preheader: 'Because Lyric Health account activation takes 24–48 hours, setting up your family plan before someone gets sick gives you instant peace of mind.',
    ctaLabel: 'Activate Your Family’s Peace of Mind Today',
    ctaUrl: ENROLL_URL,
    summary: 'Warm final check-in from Founder Daisy Gonzalez reminding families why enrolling BEFORE a sick day matters (since Lyric Health account provisioning takes 24–48 hours), reiterating zero contracts/cancel anytime, and inviting a direct reply or phone call if they have any questions.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      return wrapBrandedEmail({
        preheader: 'Because Lyric Health account activation takes 24–48 hours, setting up your family plan before someone gets sick gives you instant peace of mind.',
        badge: 'Family Series 5 of 5 · A Personal Note from Our Founder',
        headline: 'The best time to have a family doctor in your pocket is before someone wakes up sick.',
        ctaLabel: 'Enroll Your Household Today',
        ctaUrl: ENROLL_URL,
        secondaryCtaLabel: 'Call Us: (888) 260-0585',
        secondaryCtaUrl: 'tel:8882600585',
        psText: 'Also looking to bring CEDEXX to your workplace, school, church, or apartment community? Reply "PARTNER" and I will personally send you our custom group options.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            I started <strong>CEDEXX</strong> because I believe every family deserves dependable, compassionate healthcare—for body, mind, and spirit—without worrying whether a doctor’s visit will break the monthly budget.
          </p>
          <p style="margin:0 0 14px 0;">
            One important tip I always share with parents: <strong>Lyric Health account provisioning takes 24 to 48 hours after you enroll.</strong> Setting up your membership <em>before</em> a midnight fever or sinus infection hits means your family’s account is already active and ready the moment you need a doctor.
          </p>

          <div style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:18px 20px;margin:18px 0;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#050249;"><strong>✓ Plans Start at Just $18.99/mo:</strong> Covering up to 7 household members for 24/7 Urgent Care.</p>
            <p style="margin:0 0 8px 0;font-size:14px;color:#050249;"><strong>✓ Zero Visit Fees, Zero Co-Pays, Zero Contracts:</strong> Stay only as long as your family loves the care. Cancel anytime with no fees.</p>
            <p style="margin:0;font-size:14px;color:#050249;"><strong>✓ Real Human Support:</strong> Have a question about which plan fits your family? Reply to this email or call our desk at <strong>(888) 260-0585</strong>.</p>
          </div>

          <p style="margin:0;">
            <em>"Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers." (3 John 1:2)</em><br/><br/>
            We would be honored to care for you and your loved ones whenever you are ready.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

I started CEDEXX because I believe every family deserves dependable, compassionate healthcare—for body, mind, and spirit—without worrying whether a doctor's visit will break the monthly budget.

One important tip I always share with families: Lyric Health account activation takes 24 to 48 hours after enrollment. Setting up your membership BEFORE a sick day hits means your account is already active the moment you need a doctor.

- Plans start at $18.99/mo for up to 7 family members (CareNow™), $26.99/mo with Mental Wellness, or $52.99/mo for CareComplete Family™ Primary Care + $0 Labs + 237 $0 Medications.
- $0 visit fees, $0 co-pays, no insurance needed, and cancel anytime with zero fees.
- Have questions? Reply directly to this email or call us at (888) 260-0585.

Enroll Your Household Today: ${ENROLL_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// TRACK 2: 5-EMAIL B2B INSTITUTIONAL, WORKFORCE & COMMUNITY SEQUENCE
// Clear benefits of CEDEXX family services for School Districts, Employers & Communities
// ═══════════════════════════════════════════════════════════════════════════
export const B2B_CAMPAIGN_SEQUENCE: CampaignTemplate[] = [
  // ─── B2B EMAIL 1: DAY 1 — THE EXECUTIVE HOOK & CLEAR FAMILY BENEFITS ───
  {
    track: 'b2b',
    step: 1,
    id: 'campaign-1-executive-intro',
    title: 'Email 1: Give Every Household 24/7 Doctors & Therapy with $0 Co-Pays (Up to 7 Family Members)',
    cadenceLabel: 'Day 1 (Tuesday 9:30 AM EST)',
    recommendedDelayDays: 0,
    angle: 'Problem Disruption — Eliminating $150–$300 Urgent Care Costs & Absenteeism for Your Families',
    subject: 'A $0-copay 24/7 family doctor & mental wellness benefit for your people',
    altSubject: 'Covering up to 7 family members per household with $0-copay virtual care',
    preheader: 'How school districts, employers, and residential communities give every household 24/7 Urgent Care, Primary Care, Therapy, and $0 prescriptions.',
    ctaLabel: 'Explore Institutional & Community Solutions',
    ctaUrl: PARTNER_URL,
    summary: 'Introduces CEDEXX (powered by Lyric Health) to organizations by clearly highlighting the concrete benefits for their families: 24/7 Urgent Care & Pediatrics, Unlimited Mental Health Therapy, $0 Annual Labs, 237+ $0 Medications, and up to 7 household members covered per plan.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapBrandedEmail({
        preheader: 'How school districts, employers, and residential communities give every household 24/7 Urgent Care, Primary Care, Therapy, and $0 prescriptions.',
        badge: 'B2B Series 1 of 5 · Executive Introduction',
        headline: 'What happens when every family in your organization can see a doctor or therapist 24/7—with $0 co-pays?',
        ctaLabel: 'Explore Institutional & Community Solutions',
        ctaUrl: PARTNER_URL,
        psText: 'You can simply reply "QUOTE" to this email with your approximate headcount or unit count, and I will prepare a custom volume overview for your team.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Across school districts, workplaces, and residential communities, one challenge comes up repeatedly: even when people have insurance, a single urgent care visit for a sick child or spouse costs <strong>$150 to $300+ out of pocket</strong>—plus hours lost away from work or school.
          </p>
          <p style="margin:0 0 16px 0;">
            At <strong>CEDEXX</strong> (powered by <strong>Lyric Health</strong>), we built a turnkey digital healthcare and mental wellness amenity so <strong>${org}</strong> can protect not just the individual employee, resident, or member—but their <strong>entire household (up to 7 family members)</strong>.
          </p>
          <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin:18px 0;">
            <p style="margin:0 0 10px 0;font-weight:800;color:#050249;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">
              Clear Family Benefits Inside CEDEXX Memberships:
            </p>
            <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">
              <li><strong>Up to 7 Family Members Included:</strong> One membership covers the adult, spouse/partner, and children at no extra per-person cost.</li>
              <li><strong>24/7 Virtual Urgent Care &amp; Pediatrics ($0 Visit Fee):</strong> Same-day care for flu, sinus/ear infections, allergies, and digital school/work excuse notes.</li>
              <li><strong>Unlimited Licensed Therapists &amp; Family Counseling:</strong> Confidential mental health, stress, anxiety, and crisis support with $0 co-pays.</li>
              <li><strong>Dedicated Primary Care, $0 Annual Labs &amp; 237+ $0 Meds:</strong> Available on CareComplete™ tiers (37 acute + 200+ chronic medications at $0 cost).</li>
            </ul>
          </div>
          <p style="margin:0;">
            Whether you are supporting educators and staff, corporate teams, multifamily residents, or association members, CEDEXX makes whole-family wellness remarkably affordable at scale.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

Across school districts, workplaces, and residential communities, a single urgent care visit for a sick child or spouse often costs $150 to $300+ out of pocket—plus hours lost away from work or school.

At CEDEXX (powered by Lyric Health), we deliver a modern digital healthcare and mental wellness benefit for ${orgMentionFor(r)} that protects the entire household:
- Up to 7 Family Members covered under a single membership
- 24/7 Virtual Urgent Care & Pediatrics ($0 visit fees, $0 co-pays, digital school/work notes)
- Unlimited Licensed Therapists & Family Counseling
- Dedicated Virtual Primary Care, $0 Annual Wellness Labs & 237+ Medications at $0 cost (CareComplete™)

Explore Institutional & Community Solutions: ${PARTNER_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── B2B EMAIL 2: DAY 6 — ECOSYSTEM FIT & TAILORED USE CASES ───
  {
    track: 'b2b',
    step: 2,
    id: 'campaign-2-ecosystems-scale',
    title: 'Email 2: How Organizations Like Yours Deploy CEDEXX for Families (4 Ecosystems)',
    cadenceLabel: 'Day 6 (5 Days Later — Thursday 10:00 AM EST)',
    recommendedDelayDays: 5,
    angle: 'Sector Relevance — School Districts, Public Agencies, Employers & Residential Communities',
    subject: 'How schools, employers & communities roll out 24/7 family care',
    altSubject: 'Following up: Tailoring CEDEXX family wellness for your community or workforce',
    preheader: 'See how our 4 Ecosystems support educators, employees, residents, and their households.',
    ctaLabel: 'See the Ecosystems We Serve',
    ctaUrl: `${CEDEXX_URL}/partners`,
    summary: 'Follows up on Email 1 by showing concrete deployment models across the 4 CEDEXX pillars: Workforce & Institutional (Schools/Public Agencies), Community & Housing (Multifamily/Student/Hospitality), Family & Individual, and Affiliate/Associations.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapBrandedEmail({
        preheader: 'See how our 4 Ecosystems support educators, employees, residents, and their households.',
        badge: 'B2B Series 2 of 5 · Ecosystems We Serve',
        headline: 'One connected family wellness platform—tailored to how your organization operates.',
        ctaLabel: 'See the Ecosystems We Serve',
        ctaUrl: `${CEDEXX_URL}/partners`,
        psText: 'Not sure whether an organization-sponsored or voluntary member-paid rollout fits best? Reply here and we can walk through both models in 10 minutes.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Following up on my note earlier this week—organizations often ask how <strong>CEDEXX</strong> supports their families without adding administrative burden to HR or property teams.
          </p>
          <p style="margin:0 0 16px 0;">
            We structure our partnerships around core ecosystems so <strong>${org}</strong> can choose the exact fit:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 18px 0;">
            <tr>
              <td style="padding:14px 16px;background-color:#f8fafc;border-left:4px solid #050249;border-radius:8px;margin-bottom:10px;">
                <strong style="color:#050249;font-size:14px;">1. School Districts, Public Agencies &amp; Employers</strong><br/>
                <span style="font-size:13px;color:#475569;">Cut absenteeism when an employee or their child wakes up sick: 24/7 urgent care, pediatrics, unlimited licensed therapy, $0 common prescriptions, and instant digital work/school excuse notes.</span>
              </td>
            </tr>
            <tr><td height="10"></td></tr>
            <tr>
              <td style="padding:14px 16px;background-color:#f8fafc;border-left:4px solid #23d9b0;border-radius:8px;">
                <strong style="color:#050249;font-size:14px;">2. Multifamily, Student, Senior &amp; Workforce Housing</strong><br/>
                <span style="font-size:13px;color:#475569;">Offer "Rent-Included" or resident-perk household healthcare (covering up to 7 family members per unit) that boosts lease renewals and property value.</span>
              </td>
            </tr>
            <tr><td height="10"></td></tr>
            <tr>
              <td style="padding:14px 16px;background-color:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;">
                <strong style="color:#050249;font-size:14px;">3. Associations, Credit Unions, Faith &amp; Nonprofit Networks</strong><br/>
                <span style="font-size:13px;color:#475569;">Provide exclusive affiliate or member-sponsored family plans for independent contractors, REALTORS®, gig workers, and uninsured households.</span>
              </td>
            </tr>
          </table>
          <p style="margin:0;">
            Because all clinical care is delivered nationwide by board-certified <strong>Lyric Health</strong> physicians and therapists, your team never handles medical data or claims administration.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

Following up on my note earlier this week—here is how organizations deploy CEDEXX for their families without adding administrative burden:

1. School Districts, Public Agencies & Employers: Cut absenteeism with 24/7 urgent care, pediatrics, unlimited therapy, $0 common medications, and digital work/school notes.
2. Multifamily, Student & Senior Housing: Offer resident household wellness amenities (covering up to 7 family members per unit) that boost lease renewals.
3. Associations, Credit Unions & Faith/Nonprofit Networks: Exclusive member family wellness plans for independent contractors and households.

See the Ecosystems We Serve: ${CEDEXX_URL}/partners

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── B2B EMAIL 3: DAY 12 — FINANCIAL ROI & VOLUME PRICING BREAKDOWN ───
  {
    track: 'b2b',
    step: 3,
    id: 'campaign-3-roi-volume-pricing',
    title: 'Email 3: The Math Behind Volume Pricing vs. Traditional Family Care Costs',
    cadenceLabel: 'Day 12 (6 Days Later — Wednesday 9:30 AM EST)',
    recommendedDelayDays: 6,
    angle: 'CFO / Benefits ROI — Custom Per-Door, Per-Member, or Organization-Sponsored Economics',
    subject: 'The math: $150+ urgent care visits vs. volume-priced 24/7 family coverage',
    altSubject: 'Custom Community, Workforce & Institutional Pricing for your group',
    preheader: 'How flexible per-door, per-member, or voluntary pricing lowers family healthcare costs at scale.',
    ctaLabel: 'Request a Custom Volume Quote',
    ctaUrl: PARTNER_URL,
    summary: 'Presents the clear financial case for CFOs, Superintendents, HR Directors, and Property Owners: retail family plans run $18.99–$52.99/mo for up to 7 members, and Institutional partners unlock reduced volume pricing or $0-budget voluntary rollouts.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapBrandedEmail({
        preheader: 'How flexible per-door, per-member, or voluntary pricing lowers family healthcare costs at scale.',
        badge: 'B2B Series 3 of 5 · ROI & Volume Pricing',
        headline: 'High-impact family wellness doesn’t require a fortune—especially at volume.',
        ctaLabel: 'Request a Custom Volume Quote',
        ctaUrl: PARTNER_URL,
        psText: 'Even if you have zero budget allocated right now, we can launch a 100% voluntary member-paid program with an exclusive institutional discount for your families.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            When evaluating a new benefit for <strong>${org}</strong>, leadership teams always ask two questions: <em>"What does it actually cost?"</em> and <em>"What do families actually get?"</em>
          </p>
          <p style="margin:0 0 16px 0;">
            Even at our public retail rates ($18.99/mo for <em>CareNow™</em> up to $52.99/mo for <em>CareComplete Family™</em>), a single avoided urgent care visit ($150–$300+) pays for months of membership. For institutional, workforce, and community partners, we go further with <strong>Custom Volume Pricing</strong>:
          </p>
          <div style="background-color:#050249;color:#ffffff;border-radius:12px;padding:20px 22px;margin:18px 0;">
            <p style="margin:0 0 10px 0;color:#23d9b0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">
              Enterprise &amp; Institutional Pricing Options
            </p>
            <ul style="margin:0;padding-left:18px;color:#e2e8f0;font-size:14px;line-height:1.75;">
              <li><strong style="color:#ffffff;">Custom Per-Door or Per-Employee Wholesale Pricing:</strong> Reduced rates based on your unit count, staff size, or member roster.</li>
              <li><strong style="color:#ffffff;">3 Flexible Funding Models:</strong> 100% Organization-Sponsored, Cost-Shared, or 100% Voluntary (zero cost to your budget).</li>
              <li><strong style="color:#ffffff;">Complete Care Suite:</strong> Choose from 24/7 Urgent Care (<em>CareNow™</em>), Urgent Care + Unlimited Therapy (<em>CareNow + Mental</em>), or Dedicated Primary Care + $0 Annual Labs + 237 $0 Medications (<em>CareComplete™</em>).</li>
              <li><strong style="color:#ffffff;">Up to 7 Family Members Included:</strong> Protects the entire household under one flat rate.</li>
            </ul>
          </div>
          <p style="margin:0;">
            If you share your approximate group size, we can put together a clear, side-by-side custom quote for <strong>${org}</strong> within 24 hours.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

When evaluating a new benefit for ${orgMentionFor(r)}, leadership teams always ask: "What does it cost?" and "What do families actually get?"

Even a single avoided urgent care visit ($150-$300+) pays for months of CEDEXX membership. For institutional, workforce, and community partners, we offer Custom Volume Pricing:
- Custom Per-Door, Per-Member, or Per-Employee wholesale pricing
- 3 Funding Models: Organization-Sponsored, Cost-Shared, or 100% Voluntary (zero budget required)
- Complete Care Tiers: CareNow™ (24/7 Urgent Care), CareNow + Mental (Urgent Care + Unlimited Therapy), and CareComplete™ (Dedicated Primary Care + $0 Annual Labs + 237 $0 Medications)
- Up to 7 household members covered on family plans

Request a Custom Volume Quote: ${PARTNER_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── B2B EMAIL 4: DAY 18 — TURNKEY ROLLOUT, COMPLIANCE & WHOLE-PERSON CARE ───
  {
    track: 'b2b',
    step: 4,
    id: 'campaign-4-turnkey-rollout',
    title: 'Email 4: Zero HR Headaches — How Our 24–48 Hour Turnkey Family Rollout Works',
    cadenceLabel: 'Day 18 (6 Days Later — Tuesday 10:00 AM EST)',
    recommendedDelayDays: 6,
    angle: 'Operational Trust — Turnkey Implementation, Bilingual Support & Whole-Person Care',
    subject: 'How we roll out CEDEXX across your organization (with zero HR heavy lifting)',
    altSubject: 'Turnkey implementation + bilingual family support for your community',
    preheader: 'Dedicated rollout, 24–48 hour Lyric Health provisioning, and multi-language member support.',
    ctaLabel: 'Schedule a 15-Minute Rollout Walkthrough',
    ctaUrl: PARTNER_URL,
    summary: 'Removes the #1 operational objection ("We don’t have time to manage another program") by detailing CEDEXX’s turnkey rollout, 24–48h Lyric Health activation, phone-number Member ID, and bilingual support.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapBrandedEmail({
        preheader: 'Dedicated rollout, 24–48 hour Lyric Health provisioning, and multi-language member support.',
        badge: 'B2B Series 4 of 5 · Turnkey Implementation',
        headline: 'Designed so your team never has to manage clinical logistics or support tickets.',
        ctaLabel: 'Schedule a 15-Minute Rollout Walkthrough',
        ctaUrl: PARTNER_URL,
        psText: 'We provide co-branded English & Spanish digital flyers, family onboarding guides, and dedicated phone/chat support so your team doesn’t have to answer member questions.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            Even when a family wellness program makes financial sense, HR directors, school administrators, and property managers rightly worry about the workload of launching it.
          </p>
          <p style="margin:0 0 16px 0;">
            We engineered <strong>CEDEXX</strong> so that rolling out to <strong>${org}</strong> is completely turnkey:
          </p>
          <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin:18px 0;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#050249;"><strong>✓ Dedicated Organization-Wide Rollout:</strong> We supply ready-to-send digital enrollment links or roster provisioning.</p>
            <p style="margin:0 0 8px 0;font-size:14px;color:#050249;"><strong>✓ 24–48 Hour Lyric Health Activation:</strong> Once enrolled, Lyric Health provisions accounts within 24–48 hours and emails simple app setup instructions directly to each family.</p>
            <p style="margin:0 0 8px 0;font-size:14px;color:#050249;"><strong>✓ Simple Phone-Number Member ID:</strong> No plastic cards to mail or lose—a member’s 10-digit phone number is their Member ID.</p>
            <p style="margin:0;font-size:14px;color:#050249;"><strong>✓ Multilingual Member Support:</strong> Live phone desk at (888) 260-0585 and 24/7 AI support in English, Spanish, Haitian Creole, and Russian.</p>
          </div>
          <p style="margin:0;">
            At CEDEXX, we believe true wellness cares for the whole person—body, mind, and spirit. When families feel supported at home, they show up stronger at work, at school, and in your community.
          </p>
        `,
      });
    },
    buildPlainText: (r) => `${greetingFor(r)}

We engineered CEDEXX so rolling out to ${orgMentionFor(r)} requires zero heavy lifting from your team:

- Dedicated Organization-Wide Rollout: Ready-to-send digital enrollment links or roster provisioning.
- 24–48 Hour Lyric Health Activation: Families receive direct setup instructions to access the Lyric Health app.
- Simple Phone-Number Member ID: No plastic cards to mail—their 10-digit phone number is their Member ID.
- Multilingual Support: Toll-free desk at (888) 260-0585 and 24/7 digital support in English, Spanish, Haitian Creole, and Russian.

Schedule a 15-Minute Rollout Walkthrough: ${PARTNER_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },

  // ─── B2B EMAIL 5: DAY 25 — DIRECT 1-LINE CLOSE / PILOT INVITATION ───
  {
    track: 'b2b',
    step: 5,
    id: 'campaign-5-pilot-close',
    title: 'Email 5: Quick Pilot or Custom Quote Check-In (High-Reply Close)',
    cadenceLabel: 'Day 25 (7 Days Later — Tuesday 9:30 AM EST)',
    recommendedDelayDays: 7,
    angle: 'Low-Friction Executive Close — 15-Minute Custom Quote or Zero-Cost Voluntary Family Pilot',
    subject: 'Should we prepare a custom family wellness quote for your group?',
    altSubject: 'Quick question on 2026 family wellness benefits for your organization',
    preheader: 'A quick check-in from CEDEXX Founder Daisy Gonzalez—reply with 1, 2, or 3.',
    ctaLabel: 'Request Your Custom Institutional Quote',
    ctaUrl: PARTNER_URL,
    summary: 'Uses the highest-converting B2B executive follow-up technique: a short, respectful check-in offering a "Reply 1, 2, or 3" micro-response or a zero-cost voluntary family pilot program.',
    buildHtml: (r) => {
      const greeting = greetingFor(r);
      const org = orgMentionFor(r, 'your organization');
      return wrapBrandedEmail({
        preheader: 'A quick check-in from CEDEXX Founder Daisy Gonzalez—reply with 1, 2, or 3.',
        badge: 'B2B Series 5 of 5 · Executive Check-In',
        headline: 'Would a custom volume quote or a zero-cost voluntary family pilot be helpful for your upcoming planning?',
        ctaLabel: 'Request Your Custom Institutional Quote',
        ctaUrl: PARTNER_URL,
        psText: 'Even if timing is better next quarter, I would love to send you our 1-page Institutional & Family Benefits Overview for your files.',
        bodyHtml: `
          <p style="margin:0 0 14px 0;">${greeting}</p>
          <p style="margin:0 0 14px 0;">
            I know your schedule is packed, so I will keep this brief. Over the past few weeks, I shared how <strong>CEDEXX</strong> (powered by <strong>Lyric Health</strong>) helps school districts, public agencies, employers, and residential communities provide <strong>24/7 virtual urgent care, primary care, mental wellness, $0 annual labs, and 237+ $0 medications</strong> for up to 7 family members per household.
          </p>
          <p style="margin:0 0 14px 0;">
            If expanding affordable family healthcare access for <strong>${org}</strong> is on your radar this year, simply reply to this email with <strong>1, 2, or 3</strong>:
          </p>
          <div style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:18px 20px;margin:16px 0;">
            <p style="margin:0 0 10px 0;font-size:14px;color:#050249;">
              <strong>1 — Send me a Custom Quote:</strong> Reply with your approximate staff, student, resident, or member count and we will email a tailored volume quote.
            </p>
            <p style="margin:0 0 10px 0;font-size:14px;color:#050249;">
              <strong>2 — Let’s launch a $0-Budget Voluntary Family Pilot:</strong> Give your families an exclusive group discount link at zero cost to your organization.
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

I know your schedule is packed, so I will keep this brief. Over the past few weeks, I shared how CEDEXX (powered by Lyric Health) helps school districts, public agencies, employers, and residential communities provide 24/7 virtual urgent care, primary care, mental wellness, $0 annual labs, and 237+ $0 medications for up to 7 family members per household.

If expanding affordable family healthcare access for ${orgMentionFor(r)} is on your radar, simply reply with 1, 2, or 3:

1 — Send me a Custom Quote (reply with your approximate headcount or unit count)
2 — Let's launch a $0-Budget Voluntary Family Pilot for our group
3 — Better to reconnect next quarter

Or request a quote directly: ${PARTNER_URL}

With intention & care,
Daisy Gonzalez | Founder & CEO, CEDEXX
(888) 260-0585 | daisy@cedexx.net`,
  },
];
