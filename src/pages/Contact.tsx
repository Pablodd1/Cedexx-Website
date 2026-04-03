import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Clock, Send, CheckCircle2, Linkedin, Globe, Shield, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { VirtualReceptionist } from '../components/VirtualReceptionist';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

import emailjs from '@emailjs/browser';

export function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const templateParams = {
      from_name: form.name,
      from_email: form.email,
      company_name: form.company,
      message: form.message,
      subject: `General Inquiry: ${form.name}`
    };

    try {
      // 1. Try our new professional Resend API route
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateParams),
      });

      if (response.ok) {
        setSent(true);
        setForm({ name: '', email: '', company: '', message: '' });
        return;
      }

      // 2. Fallback to EmailJS if serverless route unavailable
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_id',
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_id',
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key'
      );
      setSent(true);
      setForm({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      console.error('All automated email attempts failed:', error);
      // 3. Fallback
      const subject = encodeURIComponent(`Cedexx Inquiry from ${form.name}`);
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`);
      window.location.href = `mailto:info@cedexx.net?subject=${subject}&body=${body}`;
    } finally {
      setSending(false);
    }
  };

  const contactItems = [
    {
      icon: Mail,
      label: 'Email Support',
      href: 'mailto:info@cedexx.net',
      display: 'info@cedexx.net',
    },
    {
      icon: MessageCircle,
      label: 'Live Chat',
      href: null,
      display: 'Available 24/7 via the platform',
    },
    {
      icon: Clock,
      label: 'Response Time',
      href: null,
      display: 'Less than 1 business day',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-[#050249] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -top-24 -left-24 h-64 w-64" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div {...fadeIn}>
            <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">{t('contact.title')}</h1>
            <p className="text-base text-blue-100 font-medium max-w-2xl mx-auto">{t('contact.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-[#050249] mb-6 leading-tight tracking-tight italic uppercase">Meet our Virtual Front Desk</h2>
              <p className="text-base text-slate-500 font-medium max-w-2xl mx-auto italic text-center">Instant voice support powered by advanced clinical intelligence.</p>
            </div>
            <VirtualReceptionist />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-6xl mx-auto items-start">

            {/* Contact Info */}
            <motion.div className="flex flex-col gap-10" {...fadeIn}>
              <div>
                <div className="inline-block bg-[#050249] text-white text-[10px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase shadow-lg shadow-blue-900/20">Digital First</div>
                <h2 className="text-3xl md:text-5xl font-black text-[#050249] mb-6 leading-tight tracking-tight">Support at Your Fingertips</h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  CEDEXX is a digital-first platform. We provide secure, instantaneous support through our encrypted channels, ensuring your privacy and data are always protected.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {contactItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-6 bg-white rounded-[2.5rem] p-8 shadow-sm border border-blue-50 hover:shadow-xl transition-all duration-500"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="h-16 w-16 rounded-2xl bg-[#EBF3FB] flex items-center justify-center flex-shrink-0 text-[#050249] shadow-sm">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-[#050249] text-xl font-black hover:text-blue-600 transition-colors"
                        >
                          {item.display}
                        </a>
                      ) : (
                        <p className="text-[#050249] text-xl font-black">{item.display}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social / Additional */}
              <div className="flex flex-wrap items-center gap-6">
                <a
                  href="https://www.linkedin.com/company/cedexx-healthcare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[12px] font-black text-[#050249] hover:bg-[#050249] hover:text-white transition-all bg-white border border-blue-50 rounded-2xl px-6 py-3 shadow-sm"
                >
                  <Linkedin className="h-5 w-5" /> LinkedIn
                </a>
                <a
                  href="/"
                  className="flex items-center gap-3 text-[12px] font-black text-[#050249] hover:bg-[#050249] hover:text-white transition-all bg-white border border-blue-50 rounded-2xl px-6 py-3 shadow-sm"
                >
                  <Globe className="h-5 w-5" /> cedexx.com
                </a>
              </div>

              <div className="p-8 bg-[#050249] rounded-[2.5rem] text-white flex items-center gap-6 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                <Shield className="h-12 w-12 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="font-black text-lg mb-1 tracking-tight">HIPAA Compliant & Secure</h4>
                  <p className="text-blue-100 text-sm font-medium">All communications are encrypted using bank-level standards.</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="bg-white rounded-[3rem] shadow-2xl border border-blue-50 p-10 md:p-12 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full gap-8 py-12 text-center">
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[#050249] mb-3tracking-tight">{t('contact.sent')}</h3>
                    <p className="text-slate-500 font-medium">Our team will respond to your inquiry via email <br /> within 1 business day.</p>
                  </div>
                  <button onClick={() => setSent(false)} className="text-[#050249] font-black hover:underline uppercase text-xs tracking-widest">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative z-10">
                  <div className="mb-4">
                    <h3 className="text-3xl font-black text-[#050249] mb-2 tracking-tight">Send Us a Message</h3>
                    <p className="text-slate-500 font-medium text-sm">Fill out the form below and we'll be in touch.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-[#050249] uppercase tracking-widest">{t('contact.name')} *</label>
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full rounded-2xl border border-blue-50 bg-slate-50 px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#050249] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-[#050249] uppercase tracking-widest">{t('contact.email')} *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full rounded-2xl border border-blue-50 bg-slate-50 px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#050249] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-[#050249] uppercase tracking-widest">{t('contact.company')}</label>
                    <input
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Organization or Facility Name"
                      className="w-full rounded-2xl border border-blue-50 bg-slate-50 px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#050249] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-[#050249] uppercase tracking-widest">{t('contact.message')} *</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="How can our healthcare specialists help you today?"
                      className="w-full rounded-2xl border border-blue-50 bg-slate-50 px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#050249] transition-all resize-none h-40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-[#050249] text-white w-full py-4.5 rounded-2xl font-black text-lg hover:bg-[#03013b] transition-all shadow-2xl flex items-center gap-4 justify-center group"
                  >
                    <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    {sending ? 'Opening Email...' : t('contact.send')}
                  </button>

                  <p className="text-[10px] font-black text-slate-300 text-center uppercase tracking-widest">
                    Secure Submission via Encrypted Data Channels
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-[11px] text-slate-400 text-center leading-relaxed font-medium uppercase tracking-tight">
            {t('disclaimer.text')}
          </p>
        </div>
      </section>
    </div>
  );
}