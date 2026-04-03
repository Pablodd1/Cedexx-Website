import React from 'react';
import { Heart, Users, Target, Award, Linkedin, Twitter, Mail, Star, Clock, Shield, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import daisyImg from '../assets/daisy-profile-white.png';
import jasmelImg from '../assets/jasmel-profile-white.png';
import splashVideo from '../assets/splash.mp4';
import missionHeroImg from '../assets/mission-hero.png';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export function About() {
  const management = [
    {
      name: 'Daisy Gonzalez',
      role: 'Founder',
      initials: 'DG',
      desc: 'Strategy & Operations Expert. 20+ years experience in private and commercial cross sectors of business including healthcare. Dedicated to closing the accessibility gap for modern families.',
      image: daisyImg,
      socials: { linkedin: 'https://linkedin.com', twitter: '#', email: 'Daisy@Cedexx.net' }
    },
    {
      name: 'Jasmel Acosta',
      role: 'CTO',
      initials: 'JA',
      desc: 'Engineering leadership and technology strategy. Expert in scaling secure, high-availability medical infrastructure and digital-first patient experiences.',
      image: jasmelImg,
      socials: { linkedin: 'https://linkedin.com', twitter: '#', email: 'jasmel@cedexx.net' }
    }
  ];

  return (
    <div className="flex flex-col selection:bg-[#050249] selection:text-white">
      {/* ── HERO SECTION WITH SPLASH VIDEO ── */}
      <section className="relative bg-[#050249] text-white py-32 md:py-48 overflow-hidden min-h-[70vh] flex items-center">
        {/* Background Video & Watermark */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            src={splashVideo}
            className="w-full h-full object-cover opacity-20 grayscale brightness-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050249] via-[#050249]/60 to-[#050249]" />
          
          {/* Raised Watermark Logo */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 pointer-events-none">
            <Logo className="h-[600px] w-auto" variant="white" />
          </div>
        </div>

        <div className="container mx-auto px-6 text-center max-w-5xl relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-6xl font-black mb-10 leading-[1] tracking-tighter italic uppercase"
          >
            CEDEXX bridges the <br /> gaps in healthcare.
          </motion.h1>
          <p className="text-xl md:text-3xl text-blue-100/80 font-medium leading-relaxed max-w-3xl mx-auto italic">
            Connecting families to healthcare with a modern digital standard. A moral choice for families, a strategic advantage for organizations.
          </p>
        </div>
      </section>

      {/* ── MISSION SECTION ── */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center max-w-6xl mx-auto mb-40">
             <motion.div {...fadeIn}>
                <h2 className="text-4xl md:text-6xl font-black text-[#050249] mb-10 leading-[1.1] tracking-tighter uppercase italic">Our Mission</h2>
                <p className="text-xl text-slate-600 mb-10 font-medium leading-relaxed">
                  CEDEXX was built on a simple truth: millions of families delay care because traditional healthcare is expensive, inconvenient, and often inaccessible when needed most. We close that gap through affordable digital access. Affordable access should not depend on time, insurance, or proximity. CEDEXX makes care available when real life demands it.
                </p>
                <div className="space-y-8">
                   {[
                     { title: 'Moral Choice', text: 'Prioritizing patient outcomes and accessibility over insurance bureaucracy.' },
                     { title: 'Family First', text: 'Designing every feature specifically for mothers, children, and modern households.' },
                     { title: 'Harmonious Care', text: 'Removing every barrier between a patient and a board-certified physician, accessible at your fingertips anytime, anywhere.' }
                   ].map((item, id) => (
                     <div key={id} className="flex gap-6 group">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#050249] group-hover:bg-[#050249] group-hover:text-white transition-all shadow-sm">
                           <Shield className="h-6 w-6" />
                        </div>
                        <div>
                           <h4 className="font-black text-[#050249] uppercase tracking-widest mb-1 text-sm">{item.title}</h4>
                           <p className="text-slate-500 font-medium leading-relaxed">{item.text}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </motion.div>
             <motion.div className="relative aspect-square" {...fadeIn}>
                <div className="absolute -inset-6 bg-slate-50 rounded-[4rem] -rotate-3 transition-transform group-hover:rotate-0" />
                <img 
                  src={missionHeroImg}
                  alt="Modern Healthcare Diagnostics" 
                  className="relative w-full h-full object-cover rounded-[3.5rem] shadow-2xl"
                />
             </motion.div>
          </div>

          {/* ── LEADERSHIP SECTION ── */}
          <div className="py-32 bg-slate-50 rounded-[5rem] p-12 md:p-24 border border-slate-100">
            <motion.div className="text-center mb-24" {...fadeIn}>
              <h2 className="text-3xl md:text-5xl font-black text-[#050249] mb-6 leading-none tracking-tighter uppercase italic">Leadership</h2>
              <p className="text-base text-slate-500 font-medium max-w-2xl mx-auto italic text-center">The visionary team behind our mission to revolutionize healthcare access.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {management.map((v, i) => (
                <motion.div 
                   key={i}
                   className="relative"
                   {...fadeIn}
                   transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="p-10 md:p-14 text-center bg-white shadow-[0_40px_100px_rgba(5,2,73,0.08)] rounded-[3.5rem] group flex flex-col h-full border-none ring-1 ring-slate-100 items-center overflow-hidden">
                    <div className="relative w-72 h-72 mx-auto mb-10 overflow-hidden rounded-[2.5rem] shadow-xl aspect-square bg-white">
                      <img 
                        src={v.image} 
                        alt={v.name} 
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                      />
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <h3 className="text-4xl font-black text-[#050249] mb-3 leading-tight uppercase italic tracking-tighter">{v.name}</h3>
                      <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs mb-10">{v.role}</p>
                      <p className="text-slate-600 leading-relaxed font-semibold italic mb-12 text-lg group-hover:text-slate-900 transition-colors px-4 max-w-md">
                        "{v.desc}"
                      </p>
                    </div>
                    
                    <div className="flex justify-center gap-6 mb-12">
                      <a href={v.socials.linkedin} target="_blank" rel="noopener noreferrer" title="Visit LinkedIn Profile" className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#050249] hover:text-white transition-all shadow-sm">
                        <Linkedin className="h-6 w-6" />
                      </a>
                      <a href={`mailto:${v.socials.email}`} title="Send Email" className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#050249] hover:text-white transition-all shadow-sm">
                        <Mail className="h-6 w-6" />
                      </a>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex justify-center gap-3 text-[#050249]/20">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px] font-black tracking-[0.5em] uppercase">Executive Board</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── CERTIFICATIONS SECTION ── */}
          <div className="mt-32 max-w-6xl mx-auto">
            <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl border border-blue-50 relative overflow-hidden group hover:border-blue-100 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award className="h-32 w-32 text-blue-900" />
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h3 className="text-4xl md:text-5xl font-black text-[#050249] mb-8 leading-[1.1] tracking-tighter uppercase italic">Miami Core & Executive Certification</h3>
                  <p className="text-xl text-slate-600 font-medium mb-12 italic leading-relaxed">
                    Proudly rooted in the South Florida community. CEDEXX is more than a digital platform; we are a locally-driven organization dedicated to transforming the healthcare landscape of Miami and beyond.
                  </p>
                  <div className="inline-flex items-center gap-4 bg-green-50 text-green-700 font-black text-[12px] md:text-sm uppercase tracking-widest px-6 py-3 rounded-2xl border border-green-100">
                    <CheckCircle2 className="h-5 w-5" />
                    Support Local Miami small business
                  </div>
                </div>

                <div className="space-y-8 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">Official Certification</span>
                    <h4 className="text-2xl font-black text-[#050249] uppercase italic">Woman & Minority Business</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Entity</span>
                      <p className="font-bold text-[#050249]">CEDEXX LLC</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Validity Period</span>
                      <p className="font-bold text-[#050249]">03/24/2026 – 03/24/2028</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Executive Contact</span>
                      <p className="font-bold text-[#050249]">Pedro Allende</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Certification ID</span>
                      <p className="font-bold text-[#050249]">OSD-2026-FL</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4 italic">Issuing Authority</span>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      Florida Department of Management Services<br />
                      Office of Supplier Development<br />
                      4050 Esplanade Way, Suite 380<br />
                      Tallahassee, Florida 32399 | 850-487-0915
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INVESTOR STRIP ── */}
      <section className="py-40 bg-[#050249] text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
           <motion.div {...fadeIn}>
               <h2 className="text-3xl md:text-6xl font-black mb-10 leading-[0.9] tracking-tighter italic uppercase">Investor-Grade Clinical Access</h2>
               <p className="text-base md:text-xl text-blue-200/80 font-medium mb-16 leading-relaxed italic">
                We are building the nation's most scalable digital healthcare platform for the modern era.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                 <Link to="/partners" className="bg-white text-[#050249] px-12 py-6 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl uppercase tracking-tighter">Partner With Us</Link>
                 <Link to="/contact" className="bg-blue-600/30 backdrop-blur-md border border-white/20 px-12 py-6 rounded-2xl font-black text-lg hover:bg-blue-600/50 transition-all shadow-2xl uppercase tracking-tighter">Contact Support</Link>
              </div>
           </motion.div>
        </div>
        
        {/* Secondary Disclaimer */}
        <div className="container mx-auto px-6 mt-20 relative z-10">
           <p className="text-[10px] text-blue-400/30 uppercase tracking-[0.3em] text-center max-w-2xl mx-auto font-black italic">
             CEDEXX is a technology platform connecting members to medical providers. We do not provide medical services or advice directly.
           </p>
        </div>
      </section>
    </div>
  );
}