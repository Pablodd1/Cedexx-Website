import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { motion } from 'motion/react';
import { ExternalLink, Star, CheckCircle2, Shield, Users, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

export function Partners() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Doctor',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const partners = [
    {
      name: 'MDLIVE',
      url: 'https://www.mdlive.com/',
      desc: 'A leading telehealth provider offering 24/7 access to board-certified doctors and therapists.'
    },
    {
      name: 'Gemny',
      url: 'https://gemny.com/',
      desc: 'Innovative health solutions and technology partner.'
    },
    {
      name: 'Lyric',
      url: 'https://getlyric.com/',
      desc: 'Advanced health technology and patient engagement platform.'
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Partner Inquiry: ${formData.type} - ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nInquiry Type: ${formData.type}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:daisy@cedexx.net?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-[#050249] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -top-24 -left-24 h-64 w-64" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
          >
            Strategic Partnerships
          </motion.h1>
          <p className="text-xl text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
            We partner with leading healthcare organizations and licensed physicians to deliver a premium mobile healthcare experience—seamless, trusted, and always within reach. Better Care. Here. <span className="text-[#23d9b0]">Now.</span>
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-[#050249] mb-4">Our Ecosystem</h2>
            <p className="text-slate-500 font-medium">Industry leaders trusting Cedexx to deliver immediate healthcare access.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
            {partners.map((p, i) => (
              <motion.div
                key={i}
                className="h-full"
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-10 flex flex-col items-center text-center h-full border-blue-50 bg-[#EBF3FB] rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 group">
                  <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-[#050249] shadow-sm group-hover:bg-[#050249] group-hover:text-white transition-all">
                    <Star className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-[#050249] mb-4">{p.name}</h3>
                  <p className="text-slate-600 mb-8 font-medium text-sm leading-relaxed flex-1">{p.desc}</p>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <button className="w-full bg-[#050249] text-white font-bold py-3 rounded-xl hover:bg-[#03013b] flex items-center justify-center gap-2 transition-all shadow-lg text-sm">
                      Visit Partner <ExternalLink className="h-4 w-4" />
                    </button>
                  </a>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#EBF3FB]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <motion.div className="flex-1" {...fadeIn}>
               <div className="inline-block bg-white text-[#050249] text-[10px] font-black px-3 py-1 rounded-full mb-6 border border-blue-200">JOIN THE NETWORK</div>
               <h2 className="text-3xl md:text-5xl font-black text-[#050249] mb-8 leading-tight tracking-tight">Partner With Cedexx</h2>
               <p className="text-lg text-slate-600 mb-10 font-medium leading-relaxed">
                 We are scaling a national network of healthcare providers, organizations, and employers dedicated to frictionless medicine.
               </p>
               <div className="space-y-6">
                  {[
                    { icon: Activity, title: 'Physician Opportunities', text: 'Earn flexible income through our scheduled block model.' },
                    { icon: Users, title: 'Employer Solutions', text: 'Reduce absenteeism with immediate 24/7 care for staff.' },
                    { icon: Shield, title: 'Compliance & Safety', text: 'Military-grade encryption and HIPAA security for all partners.' }
                  ].map((item, id) => (
                    <div key={id} className="flex gap-5">
                       <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 text-[#050249] shadow-sm">
                          <item.icon className="h-6 w-6" />
                       </div>
                       <div>
                          <h4 className="font-black text-[#050249] mb-1">{item.title}</h4>
                          <p className="text-slate-500 text-sm font-medium">{item.text}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>

            <motion.div className="flex-1 w-full" {...fadeIn}>
               <Card className="p-10 md:p-12 bg-white rounded-[3rem] shadow-2xl border-blue-50">
                  {submitted ? (
                    <div className="text-center py-10">
                      <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-black text-[#050249] mb-2">Request Sent</h3>
                      <p className="text-slate-500 font-medium">Thank you! Our partnership team will contact you shortly.</p>
                      <button onClick={() => setSubmitted(false)} className="mt-8 text-blue-600 font-bold hover:underline">Send another request</button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                       <div>
                          <label className="block text-xs font-black text-[#050249] uppercase tracking-widest mb-2">Full Name</label>
                          <input
                            required
                            type="text"
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-black text-[#050249] uppercase tracking-widest mb-2">Email Address</label>
                          <input
                            required
                            type="email"
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-black text-[#050249] uppercase tracking-widest mb-2">Partner Type</label>
                          <select
                            id="partner-type"
                            title="Partner Type"
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm appearance-none"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                          >
                             <option>Doctor</option>
                             <option>Company</option>
                             <option>Organization</option>
                             <option>Other</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-black text-[#050249] uppercase tracking-widest mb-2">Message</label>
                          <textarea
                            required
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm h-32"
                            placeholder="Tell us about your interest..."
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                          />
                       </div>
                        <button className="w-full bg-[#050249] text-white font-black py-4 rounded-2xl hover:bg-[#03013b] transition-all shadow-xl hover:scale-105 active:scale-95 text-base">
                          Send Inquiry
                        </button>
                    </form>
                  )}
               </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}