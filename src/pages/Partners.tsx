import React, { useState } from 'react';
import { Card } from '../components/ui';
import { motion } from 'motion/react';
import { CheckCircle2, Shield, Users, Activity, Building2, Smartphone, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PartnerForm } from '../components/PartnerForm';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

export function Partners() {
  const { t } = useLanguage();
  const [submitted] = useState(false);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* ── HERO SECTION ── */}
      <section className="bg-[#050249] text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -top-24 -left-24 h-64 w-64" />
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter uppercase italic leading-[0.9]">
              {t('partners.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-medium leading-relaxed italic max-w-2xl mx-auto">
              {t('partners.hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── ECOSYSTEMS WE SERVE ── */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-[#050249] mb-6 tracking-tighter uppercase italic">{t('partners.ecosystems.title')}</h2>
            <p className="text-xl text-slate-500 font-medium italic mb-12">{t('partners.ecosystems.subtitle')}</p>
            
            <div className="h-2 w-24 bg-[#23d9b0] mx-auto rounded-full mb-16" />

            <div className="space-y-16 text-left">
              <motion.div {...fadeIn} className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                  {t('partners.ecosystems.quote')}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <motion.div {...fadeIn} className="space-y-6">
                  <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#050249]">
                     <Smartphone className="h-8 w-8" />
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    <strong className="text-[#050249] block text-xl mb-2 font-black uppercase">{t('partners.ecosystems.gig.title')}</strong>
                    {t('partners.ecosystems.gig.desc')}
                  </p>
                </motion.div>

                <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="space-y-6">
                  <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#050249]">
                     <Users className="h-8 w-8" />
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    <strong className="text-[#050249] block text-xl mb-2 font-black uppercase">{t('partners.ecosystems.individuals.title')}</strong>
                    {t('partners.ecosystems.individuals.desc')}
                  </p>
                </motion.div>

                <motion.div {...fadeIn} className="space-y-6">
                  <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#050249]">
                     <Building2 className="h-8 w-8" />
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    <strong className="text-[#050249] block text-xl mb-2 font-black uppercase">{t('partners.ecosystems.housing.title')}</strong>
                    {t('partners.ecosystems.housing.desc')}
                  </p>
                </motion.div>

                <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="space-y-6">
                  <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#050249]">
                     <Heart className="h-8 w-8" />
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    <strong className="text-[#050249] block text-xl mb-2 font-black uppercase">{t('partners.ecosystems.hospitality.title')}</strong>
                    {t('partners.ecosystems.hospitality.desc')}
                  </p>
                </motion.div>
              </div>

              <motion.div {...fadeIn} className="text-center pt-12 space-y-4">
                <p className="text-2xl font-black text-[#050249] italic uppercase leading-tight">
                  {t('partners.ecosystems.footer')}
                </p>
                <div className="text-[#050249] font-black italic uppercase tracking-widest text-lg">
                  {t('footer.tagline')}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNER WITH US ── */}
      <section className="py-32 bg-[#EBF3FB] relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <motion.div className="flex-1" {...fadeIn}>
               <div className="inline-block bg-white text-[#050249] text-[10px] font-black px-4 py-2 rounded-full mb-8 border border-blue-200 uppercase tracking-widest">
                 {t('partners.form.badge')}
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-[#050249] mb-10 leading-[0.9] tracking-tighter italic uppercase">
                 {t('partners.form.title')}
               </h2>
               <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed italic">
                 {t('partners.form.subtitle')}
               </p>
               <div className="space-y-8">
                  {[
                    { 
                      icon: Building2, 
                      title: 'Multifamily/Student Housing REIT', 
                      text: 'Add value to your property with a premium digital care amenity.' 
                    },
                    { 
                      icon: Smartphone, 
                      title: 'Hospitality', 
                      text: 'Add convenience and practicality for your hotel guests.' 
                    },
                    { 
                      icon: Activity, 
                      title: 'Physician Opportunities', 
                      text: 'Earn flexible income through our scheduled block model.' 
                    },
                    { 
                      icon: Shield, 
                      title: 'Compliance & Safety', 
                      text: 'National healthcare platform with security for all partners.' 
                    }
                  ].map((item, id) => (
                    <div key={id} className="flex gap-6 group">
                       <div className="h-14 w-14 rounded-[1.25rem] bg-white flex items-center justify-center flex-shrink-0 text-[#050249] shadow-sm group-hover:bg-[#050249] group-hover:text-white transition-all duration-300">
                          <item.icon className="h-6 w-6" />
                       </div>
                       <div className="pt-2">
                          <h4 className="font-black text-[#050249] mb-1 uppercase tracking-tight text-lg italic">{item.title}</h4>
                          <p className="text-slate-500 font-medium italic">{item.text}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>

            <motion.div className="flex-1 w-full" {...fadeIn} transition={{ delay: 0.2 }}>
               <PartnerForm />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
