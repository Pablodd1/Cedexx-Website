import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight, CheckCircle2, Shield, Clock, Activity,
  FileText, Users, TrendingDown, Zap, Video, Star, Heart, Smartphone, Building2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import heroVideo from '../assets/hero-video.mp4';
import { PartnerForm } from '../components/PartnerForm';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui';
import { ArrowRight } from 'lucide-react';

// Persona Images
import momImg from '../assets/mom_wfh.png';
import travelerImg from '../assets/traveler.png';
import ceoImg from '../assets/ceo.png';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};

const TESTIMONIALS = [
  {
    category: "For Families",
    image: momImg,
    quote: "I can finally get my kids treated without missing work or waiting for hours at urgent care.",
    author: "Modern WFH Parent",
    detail: "Caring for her child while staying connected to work."
  },
  {
    category: "For Travelers",
    image: travelerImg,
    quote: "I didn't have to wait hours in the urgent care for a doctor's note for my travel insurance.",
    author: "Relieved Traveler",
    detail: "Immediate support when travel plans get interrupted."
  },
  {
    category: "For Employers",
    image: ceoImg,
    quote: "I have increased productivity with Cedexx Telemedicine and my employees are really enjoying this added value.",
    author: "Organization CEO",
    detail: "Strengthening workforce stability and benefit reach."
  }
];

export function Home() {
  const { t } = useLanguage();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col selection:bg-[#050249] selection:text-white">

      {/* ── HERO SECTION ── */}
      <section className="relative bg-[#050249] text-white min-h-[56vh] lg:min-h-[72vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-[#050249]/90 via-[#050249]/80 to-black/40 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            src={heroVideo}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-6 py-32 relative z-20 flex justify-end">
          <div className="max-w-4xl text-right flex flex-col items-end">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-end"
            >

              <h1 className="text-4xl md:text-7xl font-black leading-[0.9] mb-6 tracking-tighter uppercase italic">
                Better Care. <span className="text-[#23d9b0]">Here. Now.</span>
              </h1>
              
              <h2 className="text-xl md:text-3xl font-bold text-[#23d9b0] mb-8 tracking-tight italic max-w-2xl">
                {t('hero.subtitle')}
              </h2>

              <div className="space-y-4 mb-10 max-w-2xl">
                <p className="text-lg text-blue-50/90 font-medium leading-relaxed italic">
                  {t('hero.platform_desc')}
                </p>
                <p className="text-sm text-[#23d9b0] font-black uppercase tracking-widest italic">
                  {t('hero.amenity_desc')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 py-6">
                <Link
                  to="/enroll"
                  className="bg-white text-[#050249] hover:bg-blue-50 font-black px-10 py-5 rounded-2xl transition-all text-base text-center shadow-2xl hover:-translate-y-1 active:translate-y-0 uppercase tracking-tighter"
                >
                  {t('hero.cta1')}
                </Link>
                <a
                  href="#partner"
                  className="bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md border border-white/20 text-white font-black px-10 py-5 rounded-2xl transition-all text-base text-center flex items-center justify-center gap-3 uppercase tracking-tighter"
                >
                  {t('hero.cta2')}
                </a>
              </div>

              <p className="text-[11px] text-blue-300/40 mt-8 max-w-md font-medium leading-relaxed">
                {t('disclaimer.text')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HIGH-CONVERSION FEATURE GRID ── */}
      <section className="bg-white py-24 relative z-30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: t('features.access.title'), 
                desc: t('features.access.desc'), 
                icon: Clock,
                color: 'bg-blue-50 text-blue-600'
              },
              { 
                title: t('features.speed.title'), 
                desc: t('features.speed.desc'), 
                icon: Zap,
                color: 'bg-emerald-50 text-emerald-600'
              },
              { 
                title: t('features.membership.title'), 
                desc: t('features.membership.desc'), 
                icon: Users,
                color: 'bg-purple-50 text-purple-600'
              },
              { 
                title: t('features.secure.title'), 
                desc: t('features.secure.desc'), 
                icon: Shield,
                color: 'bg-slate-50 text-slate-600'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2.5rem] bg-white border border-slate-100/10 hover:border-slate-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500"
              >
                <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-[#050249] mb-3 uppercase tracking-tight italic">{feature.title}</h3>
                <p className="text-slate-500 font-medium text-sm italic">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILLAR BLOCK (Four Pillars) ── */}
      <section className="bg-slate-50 py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#050249] uppercase italic tracking-tighter mb-4">{t('serve.title')}</h2>
            <div className="h-1.5 w-24 bg-[#23d9b0] mx-auto rounded-full" />
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" {...fadeIn}>
            {[
              { title: t('serve.card1.title'), desc: t('serve.card1.desc'), cta: t('serve.card1.cta'), link: '/partners' },
              { title: t('serve.card2.title'), desc: t('serve.card2.desc'), cta: t('serve.card2.cta'), link: '/partners' },
              { title: t('serve.card4.title'), desc: t('serve.card4.desc'), cta: t('serve.card4.cta'), link: '/partners' },
              { title: 'Hospitality Pillar', desc: 'Connecting travelers with licensed physicians from the comfort of their room.', cta: 'About Us', link: '/about' }
            ].map((card, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="text-xl font-black text-[#050249] mb-4 uppercase italic tracking-tight leading-tight">{card.title}</h3>
                <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed italic">
                  {card.desc}
                </p>
                <Link to={card.link} className="mt-auto">
                    <Button variant="outline" className="w-full rounded-xl border-2 border-slate-100 text-[#050249] font-black group-hover:bg-[#050249] group-hover:text-white transition-all uppercase text-[10px] tracking-widest py-3">{card.cta}</Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AUDIENCE STRIP ── */}
      <section className="bg-white border-b border-slate-100 py-10 relative z-30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em]">
            {t('trust.label')}
          </p>
        </div>
      </section>

      {/* ── SLOGAN SECTION ── */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-4xl md:text-6xl font-black text-[#050249] mb-12 leading-[1.1] tracking-tighter">
                {t('pressure.title')}
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-2">
                   <div className="h-3 w-3 rounded-full bg-[#23d9b0]" />
                   <span className="text-xl font-black text-[#050249] uppercase tracking-wider">Connected Healthcare</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {[
                    { text: 'No insurance premiums', icon: TrendingDown },
                    { text: 'No co-pays', icon: Star },
                    { text: 'No urgent care wait times', icon: Clock },
                    { text: 'No scheduling delays', icon: Zap },
                  ].map((item, id) => (
                    <div key={id} className="flex flex-col gap-4 group">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#050249] group-hover:text-white transition-all duration-500">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <span className="font-black text-[#050249] text-sm uppercase tracking-widest">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Rotating Testimonials with Multi-Persona Support */}
            <motion.div 
              className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-[4rem] group"
              {...fadeIn}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img 
                    src={TESTIMONIALS[activeTestimonial].image} 
                    alt={TESTIMONIALS[activeTestimonial].category} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050249] via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/50"
                    >
                      <div className="text-[10px] font-black tracking-[0.3em] uppercase text-blue-500 mb-4">
                        {TESTIMONIALS[activeTestimonial].category}
                      </div>
                      <p className="text-[#050249] font-black text-lg md:text-2xl leading-tight mb-6">
                        “{TESTIMONIALS[activeTestimonial].quote}”
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <div>
                          <p className="text-[#050249] font-black text-sm uppercase tracking-widest leading-none mb-1">
                            {TESTIMONIALS[activeTestimonial].author}
                          </p>
                          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
                            {TESTIMONIALS[activeTestimonial].detail}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${activeTestimonial === i ? 'w-6 bg-[#050249]' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BUILT FOR EVERYDAY LIFE Section (Cleanup) ── */}
      <section className="py-32 bg-[#050249] text-white relative overflow-hidden">
        {/* Animated Background Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div {...fadeIn}>
              <div className="text-[10px] font-black text-[#23d9b0] uppercase tracking-[0.4em] mb-8">System Architecture</div>
              <h2 className="text-4xl md:text-6xl font-black mb-10 leading-[1.1] tracking-tighter">
                Modern Care that keeps up with your life
              </h2>
              <div className="space-y-10">
                <p className="text-2xl text-blue-200/80 font-medium leading-relaxed italic">
                  Built for the moments care cannot wait.
                </p>
                <div className="flex flex-col gap-6">
                  {[
                    '24/7 Physician Availability',
                    'Consultations in under 15 minutes',
                    'Affordable monthly membership',
                    'No insurance required',
                    'Secure HIPAA compliant connection',
                    'Medical Notes for work, school & travel insurance'
                  ].map((text, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-6 group"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="h-2 w-2 rounded-full bg-[#23d9b0] group-hover:scale-150 transition-transform" />
                      <span className="text-lg font-black uppercase tracking-widest text-blue-100 group-hover:text-white transition-colors">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 md:p-20 shadow-2xl"
              {...fadeIn}
            >
               <div className="flex flex-col items-center text-center gap-8">
                  <div className="h-24 w-24 bg-[#23d9b0]/20 rounded-[2rem] flex items-center justify-center border border-[#23d9b0]/30">
                    <Shield className="h-10 w-10 text-[#23d9b0]" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Fully Compliant</h3>
                    <p className="text-blue-200 font-medium max-w-xs mx-auto">
                      Cedexx operates under full HIPAA compliance with enterprise-level security standards.
                    </p>
                  </div>
                  <div className="w-full h-px bg-white/10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Enterprise Standard</p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* ── PARTNER FORM SECTION ── */}
      <section id="partner" className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div {...fadeIn}>
              <div className="inline-block bg-blue-100 text-[#050249] text-[10px] font-black px-4 py-2 rounded-full mb-8 border border-blue-200 uppercase tracking-widest font-sans">Strategic Partnerships</div>
              <h2 className="text-4xl md:text-7xl font-black text-[#050249] mb-10 leading-[0.9] tracking-tighter italic uppercase">
                Strategic Partnerships
              </h2>
              <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed italic">
                We partner with leading healthcare organizations and licensed physicians to deliver a premium mobile healthcare experience—seamless, trusted, and always within reach. Keep It in Your <span className="text-[#23d9b0]">Back Pocket.</span>
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: t('serve.card1.title'), desc: t('serve.card1.desc'), icon: Smartphone },
                  { title: t('serve.card2.title'), desc: t('serve.card2.desc'), icon: Users },
                  { title: t('serve.card4.title'), desc: t('serve.card4.desc'), icon: Building2 },
                  { title: 'Physician Opportunities', desc: 'Secure clinical blocks and earn flexible income with our independent provider model.', icon: Heart }
                ].map((p, i) => (
                  <div key={i} className="space-y-3 group">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#050249] shadow-sm border border-slate-100 group-hover:bg-[#050249] group-hover:text-white transition-all">
                      <p.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-black text-[#050249] uppercase tracking-wider text-sm">{p.title}</h4>
                    <p className="text-slate-500 text-sm font-medium italic">{p.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <PartnerForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-40 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-6xl font-black text-[#050249] mb-8 leading-none tracking-tighter uppercase italic">Frequently Asked Questions</h2>
            <p className="text-base text-slate-500 font-medium italic">Direct answers for families and organizations.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {[
              { q: 'Can my children be seen immediately?', a: 'Yes. Most consultations begin in under 15 minutes with a board-certified provider, making it the fastest way to connect for pediatric care.' },
              { q: 'Do I need insurance to use Cedexx?', a: 'No. Cedexx connects you with providers offering high-quality care without the need for insurance premiums, co-pays, or complex billing.' },
              { q: 'Can I get a doctor’s note for travel insurance?', a: 'Yes. Providers on our platform can issue clinical documentation and notes for travel-related illnesses and non-controlled medical requirements instantly.' },
              { q: 'How do employers benefit from this?', a: 'By connecting employees with 24/7 provider access, you significantly reduce absenteeism and provide an incredible added value for their families.' },
              { q: 'Are medications covered?', a: 'Providers on our platform can send prescriptions directly to your local pharmacy. While the cost of the medicine is handled by the pharmacy, the consult is free with your membership.' },
              { q: 'Is my medical data secure?', a: 'Cedexx is a fully HIPAA-compliant platform. We use enterprise-level encryption to ensure your family’s privacy is protected at all times.' },
            ].map((faq, idx) => (
              <motion.div 
                key={idx} 
                {...fadeIn} 
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group"
              >
                <h4 className="text-[#050249] font-black text-xl mb-4 italic uppercase tracking-tighter">
                  <span className="text-blue-500 mr-2 group-hover:mr-4 transition-all">Q.</span> {faq.q}
                </h4>
                <p className="text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-40 bg-[#050249] text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div {...fadeIn}>
              <h2 className="text-4xl md:text-7xl font-black mb-12 leading-none tracking-tighter">
                Keep It in<br />Your <span className="text-[#23d9b0]">Back Pocket.</span>
              </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <Link to="/enroll" className="bg-white text-[#050249] px-12 py-6 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_30px_100px_rgba(255,255,255,0.1)] uppercase tracking-tighter">Start Membership</Link>
               <a href="#partner" className="bg-blue-600/30 backdrop-blur-md border border-white/20 px-12 py-6 rounded-2xl font-black text-lg hover:bg-blue-600/40 transition-all shadow-2xl uppercase tracking-tighter">Partner With Us</a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
