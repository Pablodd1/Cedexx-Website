import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, Send, Clock, Users, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const TIME_SLOTS = [
  '9:00 AM – 10:00 AM EST',
  '10:00 AM – 11:00 AM EST',
  '11:00 AM – 12:00 PM EST',
  '1:00 PM – 2:00 PM EST',
  '2:00 PM – 3:00 PM EST',
  '3:00 PM – 4:00 PM EST',
];

const ENROLLMENT_TYPES = [
  'Family (Self / Spouse / Children)',
  'Individual Plan',
  'Senior / Elderly Parent',
  'Healthcare Facility (Hospital/Nursing Home)',
  'Employer / Corporate Benefit',
  'Other',
];

import emailjs from '@emailjs/browser';

export function ScheduleDemo() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    facilityType: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const templateParams = {
      from_name: form.name,
      from_email: form.email,
      company_name: form.company,
      facility_type: form.facilityType,
      preferred_date: form.preferredDate,
      preferred_time: form.preferredTime,
      message: form.notes,
      subject: `New Enrollment Inquiry: ${form.name}`
    };

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateParams),
      });

      if (response.ok) {
        setSent(true);
        return;
      }

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_id',
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_id',
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key'
      );
      setSent(true);
    } catch (error) {
      console.error('All automated email attempts failed:', error);
      const subject = encodeURIComponent(`Enrollment Inquiry — ${form.name}`);
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nNotes: ${form.notes}`);
      window.location.href = `mailto:info@cedexx.net?subject=${subject}&body=${body}`;
    } finally {
      setSending(false);
    }
  };

  const highlights = [
    { icon: Clock, text: '30-minute personalized walkthrough' },
    { icon: Users, text: 'Tailored to your facility type & size' },
    { icon: Shield, text: 'See HIPAA compliance & security features' },
    { icon: Zap, text: 'Live Q&A with our implementation team' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-[#050249] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#050249]/60 mb-5">
              <Calendar className="h-7 w-7" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Get Started with Cedexx</h1>
            <p className="text-blue-200 text-lg max-w-xl mx-auto">
              See how Cedexx gives your family 24/7 physician access — in a live, personalized 15-minute session.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {highlights.map((h, i) => (
              <motion.div key={i} className="flex flex-col items-center text-center gap-2" {...fadeIn} transition={{ delay: i * 0.08 }}>
                <div className="h-11 w-11 rounded-xl bg-[#EBF3FB] flex items-center justify-center">
                  <h.icon className="h-5 w-5 text-[#050249]" />
                </div>
                <p className="text-xs font-semibold text-slate-600 leading-tight">{h.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main form */}
      <section className="py-20 bg-[#EBF3FB]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 md:p-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {sent ? (
                <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
                  <div className="h-18 w-18 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#050249]">Request Sent!</h3>
                  <p className="text-slate-500 max-w-sm">
                    Thank you, <strong>{form.name}</strong>! Our team will confirm your demo at <strong>{form.email}</strong> within one business day.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', company: '', facilityType: '', preferredDate: '', preferredTime: '', notes: '' }); }}
                    className="mt-2 border border-[#050249] text-[#050249] hover:bg-[#EBF3FB] font-semibold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="mb-1">
                    <h2 className="text-2xl font-bold text-[#050249]">Request Onboarding</h2>
                    <p className="text-slate-500 text-sm mt-1">Fill out the form below and our team will reach out to help you get started.</p>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-600">Full Name *</label>
                      <input
                        name="name" required value={form.name} onChange={handleChange}
                        placeholder="Dr. Jane Smith"
                        className="rounded-xl border border-blue-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-600">Email Address *</label>
                      <input
                        name="email" type="email" required value={form.email} onChange={handleChange}
                        placeholder="jane@hospital.com"
                        className="rounded-xl border border-blue-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition"
                      />
                    </div>
                  </div>

                  {/* Company + Facility type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-600">Facility / Company Name</label>
                      <input
                        name="company" value={form.company} onChange={handleChange}
                        placeholder="General Hospital"
                        className="rounded-xl border border-blue-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-600">Facility Type</label>
                      <select
                        name="facilityType" value={form.facilityType} onChange={handleChange}
                        title="Enrollment Type" aria-label="Enrollment Type"
                        className="rounded-xl border border-blue-200 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#050249] transition text-slate-700"
                      >
                        <option value="">Select type...</option>
                        {ENROLLMENT_TYPES.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-600">Preferred Date</label>
                      <input
                        name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange}
                        title="Preferred Date" aria-label="Preferred Date"
                        min={new Date().toISOString().split('T')[0]}
                        className="rounded-xl border border-blue-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-600">Preferred Time (EST)</label>
                      <select
                        name="preferredTime" value={form.preferredTime} onChange={handleChange}
                        title="Preferred Time Slot" aria-label="Preferred Time Slot"
                        className="rounded-xl border border-blue-200 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#050249] transition text-slate-700"
                      >
                        <option value="">Select a time slot...</option>
                        {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-600">Additional Notes</label>
                    <textarea
                      name="notes" rows={3} value={form.notes} onChange={handleChange}
                      placeholder="Tell us about your facility's size, challenges, or any specific questions..."
                      className="rounded-xl border border-blue-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-[#050249] hover:bg-[#03013b] text-white font-semibold text-xs py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mt-1"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Opening your email...' : 'Request My Demo'}
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    By submitting, your email client will open pre-filled. Our team will confirm within 1 business day.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-slate-100 border-t border-slate-200 py-5">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            {t('disclaimer.text')}
          </p>
        </div>
      </section>
    </div>
  );
}