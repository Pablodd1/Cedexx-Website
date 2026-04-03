import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Play, Video, Search, MessageCircleQuestion } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

export default function VideoLibrary() {
  const { t } = useLanguage();

  const videos = [
    { id: 'SMUqRt3W0W8', title: 'Cedexx Introduction', duration: '2:15' },
    { id: 'Xp8BWVtL474', title: 'How to Connect with a Doctor', duration: '3:45' },
    { id: '8Ens9KdhOpo', title: 'Telemedicine for Families', duration: '4:20' },
    { id: '1Kzbv2h7enQ', title: 'Security & HIPAA Compliance', duration: '2:50' },
  ];

  const faqs = [
    { q: 'How quickly can I connect with a provider?', a: 'In most cases, a board-certified provider joins the consultation within 15 minutes of your request — 24 hours a day, 7 days a week, including holidays.' },
    { q: 'Is the platform HIPAA compliant?', a: 'Absolutely. Cedexx is fully HIPAA compliant with military-grade encryption and strict security protocols protecting all patient data and communications.' },
    { q: 'Can I use this for my entire family?', a: 'Yes. Our Family Plan is designed for your whole household, providing 24/7 access for up to 4 members at one low monthly rate.' },
    { q: 'Does this replace my primary doctor?', a: 'No — Cedexx augments your existing care by providing immediate support when your regular doctor is unavailable, such as nights, weekends, or while traveling.' },
    { q: 'Can providers prescribe medication through the platform?', a: 'Yes. Providers on our platform can evaluate you and send prescriptions directly to your local pharmacy in real time. (Note: Controlled substances cannot be prescribed via telemedicine.)' },
    { q: 'How can I get started?', a: 'Simply click "Enroll Now" or email us at Daisy@Cedexx.net to connect with our team. We\'ll guide you through a quick onboarding process.' },
    { q: 'What is the cost for an individual or family?', a: 'Our Individual plan starts at $14.99/mo, and our Family Plan is just $27.99/mo. Both provide unlimited 24/7 access with $0 co-pays.' },
    { q: 'Can I use this for my employees?', a: 'Yes, we have specialized corporate plans designed to reduce absenteeism and provide high-quality healthcare as a premium employee benefit.' },
    { q: 'What devices can I use?', a: 'You can access Cedexx from any smartphone, tablet, or computer with a camera and internet connection. No special hardware is required.' },
    { q: 'Do you provide work or school notes?', a: 'Yes. Our physicians can provide medically necessary school and work notes digitally after a consultation.' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-[#050249] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -top-24 -left-24 h-64 w-64" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Q&A Video Library
          </motion.h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
            Better Care. Here. Now. Watch our demonstrations and find answers to common questions about our platform.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <h2 className="text-3xl font-black text-[#050249] flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#EBF3FB] flex items-center justify-center text-[#050249]">
                <Video className="h-6 w-6" />
              </div>
              Featured Resources
            </h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-blue-50 bg-[#F8FAFC] shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {videos.map((v, i) => (
              <motion.div
                key={i}
                className="bg-[#EBF3FB] rounded-[3rem] overflow-hidden shadow-sm border border-blue-50 group hover:shadow-2xl transition-all duration-500"
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
              >
                <div className="aspect-video relative bg-black">
                  <iframe
                    className="absolute inset-0 w-full h-full opacity-80"
                    src={`https://www.youtube.com/embed/${v.id}?modestbranding=1&rel=0`}
                    title={v.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-view; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black text-[#050249] mb-4">
                    {v.title}
                  </h3>
                  <div className="flex items-center text-xs font-bold text-blue-500 gap-4 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Play className="h-4 w-4" /> Demonstration
                    </span>
                    <span className="h-1.5 w-1.5 bg-blue-200 rounded-full" />
                    <span>{v.duration} Minutes</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F8FAFC] border-y border-slate-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-[#050249] mb-6 flex items-center justify-center gap-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">Quick answers to common questions about our platform and frictionless healthcare model.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="p-10 bg-white rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col gap-4 hover:shadow-xl transition-all duration-500"
                {...fadeIn}
                transition={{ delay: i * 0.05 }}
              >
                <h4 className="font-black text-[#050249] text-xl leading-tight">{faq.q}</h4>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#050249] text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight leading-tight">Need More Information?</h2>
          <p className="text-xl text-blue-100 mb-12 font-medium leading-relaxed">
            Our team is here 24/7 to help you understand how Cedexx can work for your family, your employees, or your organization.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="mailto:daisy@cedexx.net"
              className="bg-white text-[#050249] px-12 py-6 rounded-[2rem] font-black text-xl hover:scale-105 transition-transform shadow-2xl"
            >
              Contact Support
            </a>
            <button
              className="bg-blue-600/30 backdrop-blur-md border border-white/20 px-12 py-6 rounded-[2rem] font-black text-xl hover:bg-blue-600/50 transition-all shadow-2xl"
              onClick={() => (document.querySelector('.fixed.bottom-6.right-6') as HTMLButtonElement)?.click()}
            >
              Chat With Cedex
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}