import React from 'react';
import { motion }  from 'motion/react';
import { Check, Heart, Brain, Shield, Users, Stethoscope, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut' },
};

interface PricingPlan {
  id: string;
  name: string;
  subtitle?: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  highlight?: boolean;
  icon: React.ElementType;
  cta: string;
}

const PLANS: PricingPlan[] = [
  {
    id: 'carenow',
    name: 'CareNow',
    price: '$14.99',
    priceNote: '/month',
    description: 'Virtual Urgent Care for you and your household up to 7 dependents.',
    features: [
      '24/7 Virtual Urgent Care',
      'Same-Day Appointments',
      'Acute Prescription Coverage',
      'Licensed Physicians in Your State',
      'Secure HIPAA-Compliant Mobile Platform',
      'Multilingual Support',
      'Add Mental Wellness Anytime',
    ],
    icon: Heart,
    cta: 'Start CareNow',
  },
  {
    id: 'carenow-mental',
    name: 'CareNow + Mental Wellness',
    subtitle: 'CareNow + $8',
    price: '$22.99',
    priceNote: '/month',
    description: 'Everything in CareNow, plus:',
    features: [
      'Behavioral Health',
      'Individual Therapy',
      'Family Counseling',
      'Mental Wellness Support',
      'Licensed Mental Health Professionals',
      'Secure HIPAA-Compliant Mobile Platform',
      'Multilingual Support',
      'Bundled Savings',
    ],
    highlight: true,
    icon: Brain,
    cta: 'Start CareNow + Mental',
  },
  {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    price: '$14.99',
    priceNote: '/month',
    description: 'Perfect for members seeking mental health support.',
    features: [
      'Therapy',
      'Counseling',
      'Behavioral Health',
      'Licensed Mental Health Professionals',
      'Multilingual Support',
      'Secure HIPAA-Compliant Mobile Platform',
    ],
    icon: Brain,
    cta: 'Start Mental Wellness',
  },
  {
    id: 'carecomplete',
    name: 'CareComplete',
    subtitle: 'Complete Virtual Primary Care',
    price: '$34.99',
    priceNote: '/month',
    description: 'Individual Membership. A comprehensive virtual healthcare membership designed for preventive care, ongoing health management, and whole-person wellness.',
    features: [
      'Includes Everything in CareNow',
      'Dedicated Virtual Primary Care Physician',
      'Annual Wellness Examination',
      'Routine Bloodwork & Integrated Lab Services',
      'Zero-Cost Annual Wellness Lab Panel',
      'Acute & Chronic Care Management',
      'Chronic Disease Management',
      'Prescription Management (Acute & Chronic)',
      'Virtual Dermatology',
      'Behavioral Health, Counseling & Therapy',
      'Care Navigation & Care Coordination',
      'Dedicated Wellness Advocate',
      'Health Risk Assessment',
      'Caregiver Support Tools',
      'Secure Messaging with Healthcare Specialists',
      'Reduced Procedure Discounts',
      'Licensed Physicians in Your State',
      'Secure HIPAA-Compliant Mobile Platform',
      'Data-driven Intuitive Care Support',
      'Multilingual Support',
      'Family Upgrade Available',
    ],
    icon: Stethoscope,
    cta: 'Start CareComplete',
  },
  {
    id: 'carecomplete-family',
    name: 'CareComplete Family',
    subtitle: 'Complete Family Virtual Care',
    price: '$52.99',
    priceNote: '/month',
    description: 'Coverage for up to seven household members, with every member receiving comprehensive virtual healthcare.',
    features: [
      'Individual Primary Care Physician for each member',
      'Annual Wellness Visits',
      'Preventive Care',
      'Integrated Lab Services',
      'Acute & Chronic Care',
      'Chronic Disease Management',
      'Prescription Management',
      'Virtual Dermatology',
      'Behavioral Health, Counseling & Therapy',
      'Wellness Advocate',
      'Care Navigation & Coordination',
      'Specialist Messaging',
      'Health Risk Assessments',
      'Caregiver Support Tools',
      'Reduced Procedure Discounts',
      'Licensed Physicians in Your State',
      'Secure HIPAA-Compliant Mobile Platform',
      'Multilingual Support',
      'Data-driven Intuitive Care Support',
    ],
    icon: Users,
    cta: 'Start Family Plan',
  },
];

export function PricingSection() {
  return (
    <section className="py-24 bg-[#EBF3FB] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-[#050249] text-white text-[10px] font-black px-4 py-2 rounded-full mb-6 tracking-widest uppercase shadow-lg shadow-blue-900/20">
            Membership Plans
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-[#050249] mb-4 uppercase italic tracking-tighter leading-[0.9]">
            Simple. Transparent. <span className="text-[#23d9b0]">Affordable.</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto italic">
            Choose the plan that fits your life. All plans include 24/7 access, no hidden fees, and no insurance required.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-[3rem] border-2 transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.08)] hover:-translate-y-2 ${
                plan.highlight
                  ? 'bg-[#050249] border-[#050249] text-white shadow-2xl scale-[1.02]'
                  : 'bg-white border-white shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#23d9b0] text-[#050249] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8 md:p-10 flex flex-col flex-1">
                {/* Icon & Title */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      plan.highlight ? 'bg-white/10 text-[#23d9b0]' : 'bg-[#EBF3FB] text-[#050249]'
                    }`}
                  >
                    <plan.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black uppercase italic tracking-tighter leading-tight ${
                        plan.highlight ? 'text-white' : 'text-[#050249]'
                      }`}
                    >
                      {plan.name}
                    </h3>
                    {plan.subtitle && (
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          plan.highlight ? 'text-[#23d9b0]' : 'text-slate-400'
                        }`}
                      >
                        {plan.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-black tracking-tighter ${
                        plan.highlight ? 'text-white' : 'text-[#050249]'
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm font-bold uppercase tracking-wider ${
                        plan.highlight ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {plan.priceNote}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-medium mt-2 italic ${
                      plan.highlight ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className={`h-px w-full mb-6 ${
                    plan.highlight ? 'bg-white/10' : 'bg-slate-100'
                  }`}
                />

                {/* Features */}
                <div className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          <Check
                            className={`h-4 w-4 ${
                              plan.highlight ? 'text-[#23d9b0]' : 'text-[#23d9b0]'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium leading-snug ${
                            plan.highlight ? 'text-blue-100' : 'text-slate-600'
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    to="/enroll"
                    className={`block w-full text-center font-black py-4 rounded-2xl transition-all text-sm uppercase tracking-tighter italic hover:scale-[1.02] active:scale-[0.98] ${
                      plan.highlight
                        ? 'bg-[#23d9b0] text-[#050249] hover:bg-[#1ec8a0] shadow-lg'
                        : 'bg-[#050249] text-white hover:bg-[#03013b] shadow-xl'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          className="text-center mt-16"
          {...fadeIn}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 border border-slate-100 shadow-sm">
            <Shield className="h-5 w-5 text-[#23d9b0]" />
            <span className="text-sm font-bold text-[#050249] uppercase tracking-wider">
              No insurance required. Cancel anytime. HIPAA compliant.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
