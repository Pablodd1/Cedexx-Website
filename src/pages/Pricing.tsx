import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, Users, Clock, Heart, Stethoscope, Brain, UserCheck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';

const PLANS = [
  {
    id: 'carenow',
    name: 'CareNow™',
    subtitle: 'Virtual Urgent Care',
    price: '$18.99',
    period: '/month',
    description: 'For you and your household — up to 7 dependents included.',
    features: [
      '24/7 Virtual Urgent Care',
      'Same-Day Appointments',
      'Acute Prescription Coverage',
      'Licensed Physicians in Your State',
      'Unlimited Virtual Visits',
      'Family Coverage (Up to 7)',
      'No Insurance Required',
      'No Hidden Fees',
    ],
    cta: 'Start CareNow',
    popular: false,
    accent: 'blue',
  },
  {
    id: 'carenow-mental',
    name: 'CareNow + Mental Wellness',
    subtitle: 'Best Value Bundle',
    price: '$26.99',
    period: '/month',
    description: 'Add only $8/month to your CareNow™ membership and receive the full Mental Wellness plan.',
    features: [
      'Everything in CareNow™',
      'Everything in Mental Wellness',
      'Behavioral Health Support',
      'Individual Therapy Sessions',
      'Family Therapy & Counseling',
      'Anxiety & Depression Care',
      'Stress Management Tools',
      '24/7 Crisis Support Line',
    ],
    cta: 'Start CareNow + Mental',
    popular: true,
    accent: 'emerald',
  },
  {
    id: 'mental',
    name: 'Mental Wellness',
    subtitle: 'Behavioral Health & Therapy',
    price: '$18.99',
    period: '/month',
    description: 'Perfect for individuals and families seeking convenient, affordable mental health support.',
    features: [
      'Unlimited Licensed Therapists',
      'Family Therapy & Counseling',
      'Behavioral Health Support',
      'Anxiety, Stress & Depression Care',
      '24/7 Crisis Support Line',
      'Online Therapy Sessions',
      'No Insurance Required',
      'No Hidden Fees',
    ],
    cta: 'Start Mental Wellness',
    popular: false,
    accent: 'violet',
  },
  {
    id: 'carecomplete',
    name: 'CareComplete™',
    subtitle: 'Complete Virtual Primary Care',
    price: '$34.99',
    period: '/month',
    description: 'Comprehensive virtual healthcare for preventive care, primary care, chronic condition management, mental wellness, and prescription savings.',
    features: [
      'Everything in CareNow™',
      'Everything in Mental Wellness',
      'Dedicated Virtual Primary Care Physician',
      'Unlimited Virtual Primary Care Visits',
      'Preventive Care & Screenings',
      'Chronic Condition Management',
      'Prescription Savings Program',
      'Annual Wellness Review',
      'Lab Order Management',
      'Referral Coordination',
      'Health Records Access',
      'Priority Scheduling',
    ],
    cta: 'Start CareComplete',
    popular: false,
    accent: 'indigo',
  },
  {
    id: 'carecomplete-family',
    name: 'CareComplete Family™',
    subtitle: 'Complete Care for the Whole Family',
    price: '$52.99',
    period: '/month',
    description: 'One affordable membership providing comprehensive virtual healthcare for your entire household. Every member receives their own personalized care.',
    features: [
      'Coverage for Up to 7 Household Members',
      'Wellness for the Whole Family',
      'Everything in CareNow™',
      'Everything in Mental Wellness',
      'Dedicated PCP per Member',
      'Unlimited Virtual Visits',
      'Preventive Care for All',
      'Chronic Condition Management',
      'Prescription Savings Program',
      'Annual Wellness Reviews',
      'Lab Order Management',
      'Referral Coordination',
      'Priority Scheduling',
    ],
    cta: 'Start Family Plan',
    popular: false,
    accent: 'cyan',
  },
];

const ENTERPRISE = {
  name: 'Enterprise & Community Solutions',
  subtitle: 'Custom Portfolio & Workforce Pricing',
  description: 'Scalable digital wellness memberships designed for residential communities, workforce ecosystems, and member organizations. Volume-based pricing reduces cost while increasing value.',
  idealFor: [
    'Multifamily & Build-to-Rent Communities',
    'Student & Senior Housing',
    'Luxury-Living & Lifestyle Communities',
    'Health-sharing Networks',
    'Employers & Workforce Benefits',
    'Transportation & Driver Networks',
    'REALTOR®, Trade & Professional Associations',
    "HOA's, Credit Unions, Community & Faith-Based Organizations",
  ],
  benefits: [
    'Custom per-door, per-member, or employer-sponsored pricing',
    'Reduced pricing through volume implementation',
    'Rent-inclusive resident wellness amenity programs',
    'Affiliate and association-exclusive membership plans',
    'Family household membership options',
    'Dedicated implementation and portfolio-wide rollout',
    'Ongoing management & support',
  ],
};

export function Pricing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative bg-[#050249] text-white pt-24 pb-16 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Membership Plans
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 font-medium mb-4">
              Simple. Transparent. Affordable.
            </p>
            <p className="text-lg text-blue-300/80">
              Starting At{' '}
              <span className="text-[#23d9b0] font-bold text-2xl">$18.99/Month</span>
            </p>
            <p className="text-sm text-blue-400/60 mt-4 max-w-xl mx-auto">
              Choose the plan that fits your life. All plans include 24/7 access, no hidden fees, and no insurance required.
            </p>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 37 768 43 864 45C960 47 1056 45 1152 41.7C1248 37 1344 30 1392 26.7L1440 23V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="py-16 -mt-1">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PLANS.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular
                    ? 'bg-[#050249] text-white shadow-2xl shadow-[#050249]/20 scale-[1.02] ring-4 ring-[#23d9b0]/30'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#23d9b0] text-[#050249] text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-black mb-1 ${plan.popular ? 'text-white' : 'text-[#050249]'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm font-medium ${plan.popular ? 'text-blue-300' : 'text-slate-500'}`}>
                    {plan.subtitle}
                  </p>
                </div>

                <div className="mb-6">
                  <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-[#050249]'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-blue-400' : 'text-slate-400'}>
                    {plan.period}
                  </span>
                </div>

                <p className={`text-sm mb-8 leading-relaxed ${plan.popular ? 'text-blue-200' : 'text-slate-600'}`}>
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-[#23d9b0]/20' : 'bg-emerald-50'
                      }`}>
                        <Check className={`h-3 w-3 ${plan.popular ? 'text-[#23d9b0]' : 'text-emerald-500'}`} />
                      </div>
                      <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-slate-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/enroll"
                  className={`block w-full text-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
                    plan.popular
                      ? 'bg-[#23d9b0] text-[#050249] hover:bg-[#1bc99e]'
                      : 'bg-[#050249] text-white hover:bg-[#03013b]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE ── */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#050249] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#23d9b0]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                  <Users className="h-4 w-4 text-[#23d9b0]" />
                  <span className="text-xs font-black uppercase tracking-widest text-blue-200">Enterprise</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  {ENTERPRISE.name}
                </h2>
                <p className="text-lg text-blue-200 mb-6">
                  {ENTERPRISE.subtitle}
                </p>
                <p className="text-blue-300/80 mb-8 leading-relaxed">
                  {ENTERPRISE.description}
                </p>

                <div className="mb-8">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#23d9b0] mb-4">
                    Ideal For
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ENTERPRISE.idealFor.map((item, i) => (
                      <span key={i} className="text-xs bg-white/10 text-blue-200 px-3 py-1.5 rounded-lg font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to="/contact"
                  className="inline-block bg-[#23d9b0] text-[#050249] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Contact for Custom Pricing
                </Link>
              </div>

              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-[#23d9b0] mb-6">
                  Enterprise Benefits
                </h4>
                <ul className="space-y-4">
                  {ENTERPRISE.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-lg bg-[#23d9b0]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#23d9b0]" />
                      </div>
                      <span className="text-sm text-blue-100">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-sm text-blue-300/80 leading-relaxed">
                    Designed to increase resident satisfaction, workforce wellness, and organizational value. Whether you're serving hundreds or hundreds of thousands of members, CEDEXX delivers scalable wellness solutions tailored to your community, portfolio, or workforce.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PLAN GUIDE ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black text-[#050249] mb-4">
              Choose the Right Plan for You
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Not sure which plan fits your needs? Here's a quick guide to help you decide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock className="h-6 w-6" />,
                title: 'CareNow™',
                price: '$18.99',
                tag: '24/7 Virtual Urgent Care',
                desc: 'Best for busy individuals, families, and anyone needing fast, on-demand care for everyday illnesses and minor injuries.',
                color: 'blue',
              },
              {
                icon: <Heart className="h-6 w-6" />,
                title: 'CareNow + Mental',
                price: '$26.99',
                tag: 'Urgent Care + Therapy',
                desc: 'Best for individuals and families who want comprehensive urgent care plus ongoing mental health support.',
                color: 'emerald',
              },
              {
                icon: <Brain className="h-6 w-6" />,
                title: 'Mental Wellness',
                price: '$18.99',
                tag: 'Behavioral Health & Therapy',
                desc: 'Perfect for individuals and families seeking convenient, affordable mental health support.',
                color: 'violet',
              },
              {
                icon: <Stethoscope className="h-6 w-6" />,
                title: 'CareComplete™',
                price: '$34.99',
                tag: 'Complete Virtual Primary Care',
                desc: 'Best for individuals who want a dedicated Primary Care Physician, preventive care, wellness, and ongoing health management.',
                color: 'indigo',
              },
              {
                icon: <UserCheck className="h-6 w-6" />,
                title: 'CareComplete Family™',
                price: '$52.99',
                tag: 'Complete Care for the Whole Family',
                desc: 'Best for households wanting comprehensive virtual care for up to seven members, each with their own Primary Care Physician.',
                color: 'cyan',
                span: true,
              },
            ].map((guide, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
                  guide.span ? 'md:col-span-2 lg:col-span-1' : ''
                } ${
                  guide.color === 'emerald'
                    ? 'bg-emerald-50 border-emerald-200'
                    : guide.color === 'violet'
                    ? 'bg-violet-50 border-violet-200'
                    : guide.color === 'indigo'
                    ? 'bg-indigo-50 border-indigo-200'
                    : guide.color === 'cyan'
                    ? 'bg-cyan-50 border-cyan-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4 ${
                  guide.color === 'emerald'
                    ? 'bg-emerald-100 text-emerald-600'
                    : guide.color === 'violet'
                    ? 'bg-violet-100 text-violet-600'
                    : guide.color === 'indigo'
                    ? 'bg-indigo-100 text-indigo-600'
                    : guide.color === 'cyan'
                    ? 'bg-cyan-100 text-cyan-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {guide.icon}
                </div>
                <h4 className="font-black text-[#050249] mb-1">{guide.title}</h4>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                  guide.color === 'emerald'
                    ? 'text-emerald-600'
                    : guide.color === 'violet'
                    ? 'text-violet-600'
                    : guide.color === 'indigo'
                    ? 'text-indigo-600'
                    : guide.color === 'cyan'
                    ? 'text-cyan-600'
                    : 'text-blue-600'
                }`}>
                  {guide.tag}
                </p>
                <p className="text-2xl font-black text-[#050249] mb-3">{guide.price}<span className="text-sm text-slate-400 font-medium">/mo</span></p>
                <p className="text-sm text-slate-600 leading-relaxed">{guide.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALTY NOTE ── */}
      <section className="py-8 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
              <Shield className="h-4 w-4 text-[#23d9b0]" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Transparent Pricing</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              <span className="font-bold text-[#050249]">Specialty Care When Needed:</span>{' '}
              Psychiatrist and Psychologist appointments are available at transparent, discounted self-pay rates — typically about{' '}
              <span className="text-[#23d9b0] font-bold">50% below traditional market pricing</span>.
              Appointment fees are displayed before scheduling, so you'll always know the cost in advance with no hidden fees.
              No additional fees for Licensed Therapists & Counselors.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-[#050249]">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-blue-200 max-w-xl mx-auto mb-8">
              Join thousands of members who have already made CEDEXX their trusted healthcare partner.
            </p>
            <Link
              to="/enroll"
              className="inline-block bg-[#23d9b0] text-[#050249] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
            >
              Enroll Today
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
