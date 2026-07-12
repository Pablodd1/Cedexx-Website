import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Heart, Brain, Shield, Users, Stethoscope, Building2, ChevronDown, ChevronUp, Mail, MousePointer2, UserCheck, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut' },
};

interface FeatureItem {
  text: string;
  note?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  trademark?: boolean;
  subtitle?: string;
  membershipType?: string;
  price: string;
  priceNote?: string;
  description: string;
  features: FeatureItem[];
  highlight?: boolean;
  icon: React.ElementType;
  cta: string;
  ctaLink: string;
  enterprise?: boolean;
  idealFor?: string;
  shortTag?: string;
  specialtyNote?: string;
}

const PLANS: PricingPlan[] = [
  {
    id: 'carenow',
    name: 'CareNow',
    trademark: true,
    price: '$14.99',
    priceNote: '/month',
    description: 'Virtual Urgent Care for you and your household — up to 7 dependents included.',
    shortTag: '24/7 Virtual Urgent Care',
    idealFor: 'Best for busy individuals, families, and anyone needing fast, on-demand care for everyday illnesses and minor injuries.',
    features: [
      { text: '24/7 Virtual Urgent Care' },
      { text: 'Same-Day Appointments' },
      { text: 'Acute Prescription Coverage' },
      { text: 'Licensed Physicians in Your State' },
      { text: 'Secure HIPAA-Compliant Mobile Platform' },
      { text: 'Multilingual Member Support' },
      { text: 'Add Mental Wellness Anytime' },
    ],
    icon: Heart,
    cta: 'Start CareNow',
    ctaLink: '/enroll',
  },
  {
    id: 'carenow-mental',
    name: 'CareNow + Mental Wellness',
    price: '$22.99',
    priceNote: '/month',
    description: 'Everything in CareNow™, plus behavioral health and therapy support.',
    shortTag: 'Urgent Care + Therapy',
    idealFor: 'Best for individuals and families who want comprehensive urgent care plus ongoing mental health support.',
    features: [
      { text: 'Everything Included in CareNow™' },
      { text: 'Everything Included in Mental Wellness' },
      { text: 'Behavioral Health' },
      { text: 'Individual Therapy' },
      { text: 'Family Counseling' },
      { text: 'Licensed Mental Health Professionals' },
      { text: 'Secure HIPAA-Compliant Mobile Platform' },
      { text: 'Multilingual Member Support' },
    ],
    highlight: true,
    icon: Brain,
    cta: 'Start CareNow + Mental',
    ctaLink: '/enroll',
  },
  {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    price: '$14.99',
    priceNote: '/month',
    description: 'Perfect for individuals and families seeking convenient, affordable mental health support.',
    shortTag: 'Behavioral Health & Therapy',
    idealFor: 'Perfect for individuals and families seeking convenient, affordable mental health support.',
    features: [
      { text: 'Unlimited Access to Licensed Therapists & Counselors' },
      { text: 'Individual Therapy & Counseling' },
      { text: 'Behavioral Health Support' },
      { text: 'Anxiety, Stress & Depression Care' },
      { text: 'Multilingual Mental Health Professionals' },
      { text: 'Secure HIPAA-Compliant Mobile Platform' },
    ],
    specialtyNote: 'Specialty Care When Needed: Psychiatrist and Psychologist appointments are available at transparent, discounted self-pay rates—typically about 50% below traditional market pricing. Appointment fees are displayed before scheduling, so you\'ll always know the cost in advance with no hidden fees. No additional fees for Licensed Therapists & Counselors.',
    icon: Brain,
    cta: 'Start Mental Wellness',
    ctaLink: '/enroll',
  },
  {
    id: 'carecomplete',
    name: 'CareComplete',
    trademark: true,
    subtitle: 'Complete Virtual Primary Care',
    membershipType: 'Individual Membership',
    price: '$34.99',
    priceNote: '/month',
    description: 'Comprehensive virtual healthcare for preventive care, primary care, chronic condition management, mental wellness, and prescription savings—all in one affordable membership.',
    shortTag: 'Complete Virtual Primary Care',
    idealFor: 'Best for individuals who want a dedicated Primary Care Physician, preventive care, wellness, and ongoing health management.',
    features: [
      { text: 'Everything Included in CareNow™' },
      { text: 'Everything Included in Mental Wellness' },
      { text: 'Dedicated Virtual Primary Care Physician' },
      { text: 'Unlimited Virtual Primary Care Visits' },
      { text: '24/7 On-Demand Urgent Care' },
      { text: 'Annual Wellness Examination' },
      { text: 'Annual Wellness Lab Panel at $0 Cost' },
      { text: 'Integrated Laboratory Services' },
      { text: 'Acute & Chronic Care Management' },
      { text: 'Chronic Disease Management' },
      { text: 'Prescription Management' },
      { text: 'Basic Prescription Program', note: '37 commonly prescribed acute-care medications at $0 cost' },
      { text: 'Enhanced Prescription Program', note: 'Over 200 chronic-care medications included at $0 cost. Additional prescriptions available at discounted member pricing' },
      { text: 'Behavioral Health, Counseling & Therapy' },
      { text: 'Virtual Dermatology Consultations' },
      { text: 'Care Navigation & Care Coordination' },
      { text: 'Dedicated Wellness Advocate' },
      { text: 'Personalized Health Risk Assessment' },
      { text: 'Caregiver Support Resources' },
      { text: 'Secure Messaging with Healthcare Specialists' },
      { text: 'Reduced-Cost Procedures & Diagnostic Services' },
      { text: 'Clinician-Guided Medical Weight Management', note: 'GLP-1 treatment options available for qualified members at a fraction of typical retail pricing' },
      { text: 'Licensed Physicians in Your State' },
      { text: 'Secure HIPAA-Compliant Mobile Platform' },
      { text: 'Intelligent, Data-Driven Care Support' },
      { text: 'Multilingual Member Support' },
      { text: 'Family Upgrade Available' },
    ],
    icon: Stethoscope,
    cta: 'Start CareComplete',
    ctaLink: '/enroll',
  },
  {
    id: 'carecomplete-family',
    name: 'CareComplete Family',
    trademark: true,
    subtitle: 'Complete Virtual Primary Care',
    membershipType: 'Family Membership (Up to 7 Members)',
    price: '$52.99',
    priceNote: '/month',
    description: 'One affordable membership providing comprehensive virtual healthcare for your entire household. Every covered family member receives their own personalized care and access to the full suite of healthcare benefits.',
    shortTag: 'Complete Care for the Whole Family',
    idealFor: 'Best for households wanting comprehensive virtual care for up to seven members, each with their own Primary Care Physician.',
    features: [
      { text: 'Coverage for Up to 7 Household Members' },
      { text: 'Wellness for the Whole Family' },
      { text: 'Everything Included in CareNow™' },
      { text: 'Everything Included in Mental Wellness' },
      { text: 'Individual Virtual Primary Care Physician for Each Member' },
      { text: 'Unlimited Virtual Primary Care Visits' },
      { text: '24/7 On-Demand Urgent Care' },
      { text: 'Annual Wellness Examination for Every Member' },
      { text: 'Annual Wellness Lab Panel at $0 Cost' },
      { text: 'Integrated Laboratory Services' },
      { text: 'Acute & Chronic Care Management' },
      { text: 'Chronic Disease Management' },
      { text: 'Prescription Management' },
      { text: 'Basic Prescription Program', note: '37 commonly prescribed acute-care medications at $0 cost' },
      { text: 'Enhanced Prescription Program', note: 'Over 200 chronic-care medications included at $0 cost. Additional prescriptions available at discounted member pricing' },
      { text: 'Behavioral Health, Counseling & Therapy' },
      { text: 'Virtual Dermatology Consultations' },
      { text: 'Care Navigation & Care Coordination' },
      { text: 'Dedicated Wellness Advocate' },
      { text: 'Personalized Health Risk Assessment' },
      { text: 'Caregiver Support Resources' },
      { text: 'Secure Messaging with Healthcare Specialists' },
      { text: 'Reduced-Cost Procedures & Diagnostic Services' },
      { text: 'Clinician-Guided Medical Weight Management', note: 'GLP-1 treatment options available for qualified members at a fraction of typical retail pricing' },
      { text: 'Licensed Physicians in Your State' },
      { text: 'Secure HIPAA-Compliant Mobile Platform' },
      { text: 'Intelligent, Data-Driven Care Support' },
      { text: 'Multilingual Member Support' },
    ],
    icon: Users,
    cta: 'Start Family Plan',
    ctaLink: '/enroll',
  },
];

const ENTERPRISE_IDEAL = [
  'Multifamily & Build-to-Rent Communities',
  'Student & Senior Housing',
  'Luxury-Living & Lifestyle Communities',
  'Health-sharing Networks',
  'Employers & Workforce Benefits',
  'Transportation & Driver Networks',
  'REALTOR®, Trade & Professional Associations',
  "HOA's, Credit Unions, Community & Faith-Based Organizations",
];

const ENTERPRISE_BENEFITS = [
  'Custom per-door, per-member, or employer-sponsored pricing',
  'Reduced pricing through volume implementation',
  'Rent-inclusive resident wellness amenity programs',
  'Affiliate and association-exclusive membership plans',
  'Family household membership options',
  'Dedicated implementation and portfolio-wide rollout with ongoing management & support',
];

function PlanCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_COUNT = 4;
  const hasMore = plan.features.length > PREVIEW_COUNT;
  const previewFeatures = plan.features.slice(0, PREVIEW_COUNT);
  const extraFeatures = plan.features.slice(PREVIEW_COUNT);

  const displayName = plan.trademark ? `${plan.name}™` : plan.name;

  return (
    <motion.div
      {...fadeIn}
      transition={{ delay: index * 0.08 }}
      className={`group/card relative flex flex-col rounded-[3rem] border-2 transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-1 ${
        plan.highlight
          ? 'bg-[#050249] border-[#050249] text-white shadow-2xl scale-[1.02]'
          : 'bg-white border-white shadow-xl'
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#23d9b0] text-[#050249] text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div className="p-8 md:p-10 flex flex-col flex-1">
        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-5">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 mt-1 ${
            plan.highlight ? 'bg-white/10 text-[#23d9b0]' : 'bg-[#EBF3FB] text-[#050249]'
          }`}>
            <plan.icon className="h-7 w-7" />
          </div>
          <div>
            <h3 className={`text-xl font-black uppercase italic tracking-tighter leading-tight ${
              plan.highlight ? 'text-white' : 'text-[#050249]'
            }`}>
              {displayName}
            </h3>
            {plan.subtitle && (
              <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${
                plan.highlight ? 'text-[#23d9b0]' : 'text-[#23d9b0]'
              }`}>
                {plan.subtitle}
              </p>
            )}
            {plan.membershipType && (
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                plan.highlight ? 'text-blue-300' : 'text-slate-400'
              }`}>
                {plan.membershipType}
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black tracking-tighter ${
              plan.highlight ? 'text-white' : 'text-[#050249]'
            }`}>
              {plan.price}
            </span>
            <span className={`text-sm font-bold uppercase tracking-wider ${
              plan.highlight ? 'text-blue-200' : 'text-slate-400'
            }`}>
              {plan.priceNote}
            </span>
          </div>
          <p className={`text-sm font-medium mt-2 leading-relaxed ${
            plan.highlight ? 'text-blue-200' : 'text-slate-500'
          }`}>
            {plan.description}
          </p>
        </div>

        {/* Divider */}
        <div className={`h-px w-full mb-5 ${plan.highlight ? 'bg-white/10' : 'bg-slate-100'}`} />

        {/* Features — Always show preview. Extra features expand on hover (desktop) or via toggle (mobile). */}
        <div className="flex-1">
          <ul className="space-y-2.5">
            {previewFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Check className="h-4 w-4 text-[#23d9b0]" />
                </div>
                <div>
                  <span className={`text-sm font-semibold leading-snug ${
                    plan.highlight ? 'text-blue-100' : 'text-slate-700'
                  }`}>
                    {feature.text}
                  </span>
                  {feature.note && (
                    <p className={`text-[11px] mt-0.5 leading-snug font-medium ${
                      plan.highlight ? 'text-blue-300/80' : 'text-slate-400'
                    }`}>
                      {feature.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Extra features — hidden by default, expand on hover */}
          {hasMore && (
            <div
              className={`overflow-hidden transition-all duration-500 ease-out
                ${expanded
                  ? 'max-h-[2000px] opacity-100 mt-2.5'
                  : 'max-h-0 opacity-0 mt-0 md:group-hover/card:max-h-[2000px] md:group-hover/card:opacity-100 md:group-hover/card:mt-2.5'
                }
              `}
            >
              <ul className="space-y-2.5">
                {extraFeatures.map((feature, idx) => (
                  <li key={`extra-${idx}`} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <Check className="h-4 w-4 text-[#23d9b0]" />
                    </div>
                    <div>
                      <span className={`text-sm font-semibold leading-snug ${
                        plan.highlight ? 'text-blue-100' : 'text-slate-700'
                      }`}>
                        {feature.text}
                      </span>
                      {feature.note && (
                        <p className={`text-[11px] mt-0.5 leading-snug font-medium ${
                          plan.highlight ? 'text-blue-300/80' : 'text-slate-400'
                        }`}>
                          {feature.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hover hint — desktop only, hidden when already expanded */}
          {hasMore && !expanded && (
            <div className="hidden md:flex mt-3 items-center gap-2 text-[11px] font-black uppercase tracking-widest opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 text-[#23d9b0]">
              <MousePointer2 className="h-3.5 w-3.5" />
              <span>Hover for +{extraFeatures.length} benefits</span>
            </div>
          )}

          {/* Toggle button — always visible for mobile / manual control */}
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`mt-3 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                plan.highlight
                  ? 'text-[#23d9b0] hover:text-white'
                  : 'text-[#050249]/50 hover:text-[#050249]'
              }`}
            >
              {expanded ? (
                <><ChevronUp className="h-3.5 w-3.5" /> Show Less</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" /> Show All Benefits</>
              )}
            </button>
          )}
        </div>

        {/* Specialty Note — shown only for Mental Wellness plan */}
        {plan.specialtyNote && (
          <div className={`mt-4 rounded-xl p-3 text-[11px] leading-relaxed font-medium italic border ${
            plan.highlight
              ? 'bg-white/10 border-white/20 text-blue-100'
              : 'bg-[#f0fdf9] border-[#23d9b0]/30 text-slate-600'
          }`}>
            {plan.specialtyNote}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8">
          <Link
            to={plan.ctaLink}
            className={`block w-full text-center font-black py-4 rounded-2xl transition-all text-sm uppercase tracking-tighter italic hover:scale-[1.02] active:scale-[0.98] shadow-xl ${
              plan.highlight
                ? 'bg-[#23d9b0] text-[#050249] hover:bg-[#1ec8a0]'
                : 'bg-[#050249] text-white hover:bg-[#03013b]'
            }`}
          >
            {plan.cta}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function PlanGuideCard({ index }: { index: number }) {
  return (
    <motion.div
      {...fadeIn}
      transition={{ delay: index * 0.08 }}
      className="relative flex flex-col rounded-[3rem] border-2 border-[#050249]/10 bg-gradient-to-br from-[#050249] to-[#0a0460] text-white shadow-2xl overflow-hidden"
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 h-64 w-64 bg-[#23d9b0]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="p-8 md:p-10 flex flex-col flex-1 relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <Lightbulb className="h-7 w-7 text-[#23d9b0]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#23d9b0] uppercase tracking-[0.4em] mb-1">Plan Guide</p>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white leading-tight">
              Choose the Right Plan for You
            </h3>
          </div>
        </div>

        <div className="h-px w-full bg-white/10 mb-6" />

        {/* Ideal candidates list */}
        <div className="flex-1 space-y-4">
          {PLANS.map((plan) => {
            const displayName = plan.trademark ? `${plan.name}™` : plan.name;
            return (
              <div key={plan.id} className="group/plan">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <plan.icon className="h-4 w-4 text-[#23d9b0]" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase italic tracking-tighter text-white leading-snug">
                      {displayName}
                    </p>
                    {plan.shortTag && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#23d9b0] mt-0.5">
                        {plan.shortTag}
                      </p>
                    )}
                    <p className="text-[11px] text-blue-200/80 font-medium leading-snug mt-1">
                      {plan.idealFor}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8">
          <Link
            to="/enroll"
            className="flex items-center justify-center gap-2 w-full text-center font-black py-4 rounded-2xl bg-[#23d9b0] text-[#050249] text-sm uppercase tracking-tighter italic hover:bg-[#1ec8a0] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            <UserCheck className="h-5 w-5" />
            Enroll Today
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function EnterpriseCard({ index }: { index: number }) {
  return (
    <motion.div
      {...fadeIn}
      transition={{ delay: index * 0.08 }}
      className="relative flex flex-col rounded-[3rem] border-2 border-[#050249]/10 bg-gradient-to-br from-[#050249] to-[#0a0460] text-white shadow-2xl overflow-hidden md:col-span-2 xl:col-span-3"
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 h-64 w-64 bg-[#23d9b0]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="p-8 md:p-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Building2 className="h-8 w-8 text-[#23d9b0]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#23d9b0] uppercase tracking-[0.4em] mb-1">Enterprise & Community Solutions</p>
              <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-tight">
                Custom Portfolio &<br />Workforce Pricing
              </h3>
            </div>
          </div>
          <div className="shrink-0">
            <div className="bg-[#23d9b0]/10 border border-[#23d9b0]/30 rounded-2xl px-6 py-3 text-center">
              <p className="text-[10px] font-black text-[#23d9b0] uppercase tracking-widest mb-1">Pricing</p>
              <p className="text-xl font-black text-white tracking-tight">Custom Quote</p>
            </div>
          </div>
        </div>

        <p className="text-blue-200 font-medium leading-relaxed mb-8 max-w-3xl italic">
          Scalable digital wellness memberships designed for residential communities, workforce ecosystems, and member organizations. Volume-based pricing reduces cost while increasing value.
        </p>

        <div className="h-px w-full bg-white/10 mb-8" />

        {/* Two-column feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Ideal For */}
          <div>
            <p className="text-[10px] font-black text-[#23d9b0] uppercase tracking-[0.35em] mb-4">Ideal For</p>
            <ul className="space-y-2.5">
              {ENTERPRISE_IDEAL.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-[#23d9b0] shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-100 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise Benefits */}
          <div>
            <p className="text-[10px] font-black text-[#23d9b0] uppercase tracking-[0.35em] mb-4">Enterprise Benefits</p>
            <ul className="space-y-2.5">
              {ENTERPRISE_BENEFITS.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-[#23d9b0] shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-100 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-blue-300/80 text-sm font-medium italic leading-relaxed mb-8 max-w-3xl">
          Designed to increase resident satisfaction, workforce wellness, and organizational value. Whether you're serving hundreds or hundreds of thousands of members, CEDEXX delivers scalable wellness solutions tailored to your community, portfolio, or workforce.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-3 bg-[#23d9b0] text-[#050249] font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-tighter italic hover:bg-[#1ec8a0] hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]"
          >
            <Mail className="h-5 w-5" />
            Contact CEDEXX for Custom Pricing
          </Link>
          <Link
            to="/partners"
            className="inline-flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-tighter italic hover:bg-white/20 transition-all"
          >
            Learn About Partnerships
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function PricingSection() {
  return (
    <section className="py-24 bg-[#EBF3FB] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-400/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          {...fadeIn}
        >
          <div className="inline-block bg-[#050249] text-white text-[10px] font-black px-4 py-2 rounded-full mb-6 tracking-widest uppercase shadow-lg shadow-blue-900/20">
            Membership Plans
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-[#050249] mb-3 uppercase italic tracking-tighter leading-[0.9]">
            Simple. Transparent. <span className="text-[#23d9b0]">Affordable.</span>
          </h2>
          <p className="text-2xl md:text-3xl font-black text-[#050249] mb-4 tracking-tight">
            Starting At <span className="text-[#23d9b0]">$14.99</span>/Month
          </p>
          <p className="text-base text-slate-500 font-medium max-w-2xl mx-auto italic">
            Choose the plan that fits your life. All plans include 24/7 access, no hidden fees, and no insurance required.
          </p>
        </motion.div>

        {/* Pricing Grid — 5 plans + 1 guide card = 6 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
          <PlanGuideCard index={PLANS.length} />
          {/* Enterprise full-width card */}
          <EnterpriseCard index={PLANS.length + 1} />
        </div>

        {/* Bottom Note */}
        <motion.div
          className="text-center mt-16"
          {...fadeIn}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 border border-slate-100 shadow-sm">
            <Shield className="h-5 w-5 text-[#23d9b0]" />
            <span className="text-sm font-bold text-[#050249] uppercase tracking-wider">
              No insurance required · Cancel anytime · HIPAA compliant
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
