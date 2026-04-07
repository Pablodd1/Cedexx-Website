import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, Clock, Shield, CreditCard, ArrowRight, Users, Activity, Pill, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Home() {
  const { t } = useLanguage();

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#050249] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050249] via-[#0a0560] to-[#050249]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 py-32 md:py-48 relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-black leading-none tracking-tighter uppercase italic mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-blue-200/80 font-medium mb-10 max-w-xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/enroll">
                <button className="bg-white text-[#050249] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2">
                  {t('hero.cta1')} <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link to="/partners">
                <button className="border-2 border-white/30 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                  {t('hero.cta2')}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-slate-50 py-8 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-slate-500 font-medium italic">{t('trust.label')}</p>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#050249] leading-none tracking-tighter uppercase italic mb-4">{t('serve.title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: t('serve.card1.title'), desc: t('serve.card1.desc') },
              { icon: Activity, title: t('serve.card2.title'), desc: t('serve.card2.desc') },
              { icon: Shield, title: t('serve.card3.title'), desc: t('serve.card3.desc') },
              { icon: Heart, title: t('serve.card4.title'), desc: t('serve.card4.desc') },
            ].map((card, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                <div className="h-14 w-14 bg-[#050249] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#050249] uppercase tracking-tight italic mb-3">{card.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#050249] leading-none tracking-tighter uppercase italic mb-4">{t('how.title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              { step: '01', title: t('how.step1.title'), desc: t('how.step1.desc'), icon: Clock },
              { step: '02', title: t('how.step2.title'), desc: t('how.step2.desc'), icon: Phone },
              { step: '03', title: t('how.step3.title'), desc: t('how.step3.desc'), icon: Pill },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="h-20 w-20 bg-[#050249] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Step {item.step}</span>
                <h3 className="text-xl font-black text-[#050249] uppercase italic tracking-tight mt-2 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#050249] leading-none tracking-tighter uppercase italic mb-4">{t('outcomes.title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[t('outcomes.card1'), t('outcomes.card2'), t('outcomes.card3')].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="bg-[#050249] text-white p-10 rounded-3xl text-center">
                <h3 className="text-lg font-black uppercase tracking-tight italic">{item}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#050249] leading-none tracking-tighter uppercase italic mb-4">Simple Pricing</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <motion.div {...fadeIn} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-lg">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Individual</h3>
              <p className="text-4xl font-black text-[#050249] italic">{t('plans.individual')}</p>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="bg-[#050249] text-white p-10 rounded-3xl shadow-xl">
              <h3 className="text-sm font-black text-blue-300 uppercase tracking-widest mb-2">Family</h3>
              <p className="text-4xl font-black italic">{t('plans.family')}</p>
              <p className="text-blue-200/60 text-sm mt-2 font-medium">{t('plans.family.desc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#050249] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-5xl font-black leading-none tracking-tighter uppercase italic mb-6">Ready to Get Started?</h2>
            <p className="text-blue-200/60 font-medium mb-10 max-w-lg mx-auto">Join thousands of families who trust Cedexx for affordable, 24/7 healthcare access.</p>
            <Link to="/enroll">
              <button className="bg-white text-[#050249] font-black text-sm uppercase tracking-widest px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2 mx-auto">
                {t('hero.cta1')} <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
