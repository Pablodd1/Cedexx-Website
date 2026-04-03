import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  TrendingUp,
  Zap,
  ShieldCheck,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle2,
  Layout as LayoutIcon,
  Activity,
  ChevronDown,
  BarChart3,
  Globe2,
  Lock
} from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { PasswordGate } from '../components/PasswordGate';

const marketStats = [
  { label: 'Families Enrolled', value: '12,400+', icon: Users, delay: 0.1 },
  { label: 'Avg. Connection Time', value: '< 15 mins', icon: Zap, delay: 0.2 },
  { label: 'Asset Valuation Lift', value: '$8.4M+', icon: TrendingUp, delay: 0.3 },
  { label: 'NOI Expansion', value: '$420K/yr', icon: DollarSign, delay: 0.4 },
];

const growthPoints = [
  { year: 'Year 1', revenue: '$0.3M', users: '1K members', height: '20%' },
  { year: 'Year 2', revenue: '$4.2M', users: '12.4K members', height: '55%' },
  { year: 'Year 3', revenue: '$15M+', users: '50K members', height: '100%' },
];

export const InvestorPitch = () => {
  const [bedCount, setBedCount] = useState(10000);
  const [activeTab, setActiveTab] = useState<'problem' | 'solution'>('problem');

  const annualNOI = (bedCount * 3.50 * 12).toLocaleString();
  const assetLift = (bedCount * 3.50 * 12 / 0.05).toLocaleString();

  return (
    <PasswordGate>
      <div className="min-h-screen bg-white pt-20 selection:bg-emerald-500 selection:text-white">

        {/* HERO SECTION - PREMIUM GLASS EFFECT */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#050249]">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" />
             <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-3 glass-emerald px-6 py-3 rounded-2xl mb-12 border-emerald-500/20"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px]">Private Institutional Deck</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-8xl font-black text-white italic leading-[0.95] tracking-tighter mb-12 uppercase"
              >
                Driving <span className="text-emerald-400">Yield</span><br />
                Multiplication.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-2xl text-blue-100/60 font-medium italic mb-12 max-w-3xl leading-relaxed"
              >
                Cedexx transforms clinical infrastructure into a high-yield resident amenity, specifically engineered to expand NOI and drive significant asset valuation lift across institutional portfolios.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-6"
              >
                <Button size="lg" className="bg-emerald-400 hover:bg-emerald-500 border-none px-12 h-16 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-emerald-500/20 group text-[#050249]">
                  Download Deck
                  <ChevronDown className="ml-2 group-hover:translate-y-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 md:px-12 h-16 rounded-2xl font-black text-lg uppercase tracking-widest bg-white/5 backdrop-blur-xl">
                  Contact Team
                </Button>
              </motion.div>
            </div>
          </div>

          <motion.div
             initial={{ opacity: 0, x: 100 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block z-0 pointer-events-none"
          >
             <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[150px] rounded-full scale-150" />
                <Card className="glass-dark border-white/10 p-12 w-[500px] h-[600px] rotate-[-5deg] scale-110 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                   <div className="flex flex-col gap-10">
                      <div className="h-1 bg-gradient-to-r from-emerald-500 to-transparent w-full opacity-50" />
                      <div className="space-y-4">
                        <div className="text-[10px] uppercase font-black tracking-[0.5em] text-emerald-400">Net Asset Yield</div>
                        <div className="text-6xl font-black text-white italic">+ $12.4M</div>
                      </div>
                      <div className="space-y-6">
                        {[
                          { label: 'Wait Time Reduction', val: '98%', color: 'bg-emerald-400' },
                          { label: 'Amenity Adoption', val: '84%', color: 'bg-blue-400' },
                          { label: 'Property Retention', val: '12%', color: 'bg-indigo-400' }
                        ].map((item, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-xs font-black uppercase text-blue-200/50">
                              <span>{item.label}</span>
                              <span className="text-white">{item.val}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: item.val }}
                                transition={{ delay: 1 + (i*0.2), duration: 1 }}
                                className={`h-full ${item.color}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </Card>
             </div>
          </motion.div>
        </section>

        {/* MARKET STATS */}
        <section className="py-20 bg-[#050249] relative overflow-hidden border-y border-white/10">
           <div className="container mx-auto px-6 relative z-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                 {marketStats.map((stat, i) => (
                    <motion.div
                       key={i}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: stat.delay }}
                       className="text-center md:text-left group"
                    >
                       <div className="text-emerald-400 mb-4 flex justify-center md:justify-start">
                          <stat.icon className="h-8 w-8 group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="text-3xl md:text-4xl font-black text-white italic mb-2">{stat.value}</div>
                       <div className="text-[10px] md:text-xs font-black uppercase text-blue-200/40 tracking-[0.3em]">{stat.label}</div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* MARKET GAP - INTERACTIVE SLIDER SECTION */}
        <section className="py-20 md:py-40 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 md:mb-24 max-w-4xl mx-auto">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-block bg-blue-100 text-[#050249] text-[10px] font-black px-4 py-2 rounded-full mb-8 border border-blue-200 uppercase tracking-widest"
               >
                 The Disruption Opportunity
               </motion.div>
               <h2 className="text-4xl md:text-7xl font-black text-[#050249] mb-10 leading-[0.9] tracking-tighter italic uppercase">Infrastructure Deficit.</h2>
               <p className="text-xl text-slate-500 font-medium italic">
                 The systematic primary care gap represents a multi-billion dollar friction point in the modern resident experience—and a massive arbitrage opportunity.
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
               {/* Problem Card */}
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="group relative"
               >
                  <Card className="p-8 md:p-12 h-full bg-white border-slate-200 shadow-xl group-hover:shadow-2xl transition-all rounded-[2.5rem] md:rounded-[3rem]">
                     <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 border border-red-100">
                        <Activity className="h-8 w-8" />
                     </div>
                     <h3 className="text-3xl font-black italic uppercase text-[#050249] mb-6">Traditional Delivery</h3>
                     <div className="space-y-6 md:space-y-8">
                        <div className="flex gap-4 md:gap-6 items-start">
                           <div className="text-4xl md:text-5xl font-black text-red-500 opacity-40">31</div>
                           <div>
                              <div className="text-base md:text-lg font-black text-[#050249] uppercase">Day Wait Time</div>
                              <p className="text-slate-500 text-sm md:text-base font-medium italic">Current national average for new patient primary care access.</p>
                           </div>
                        </div>
                        <div className="flex gap-4 md:gap-6 items-start">
                           <div className="text-4xl md:text-5xl font-black text-red-500 opacity-40">$220</div>
                           <div>
                              <div className="text-base md:text-lg font-black text-[#050249] uppercase">Avg. Self-Pay Cost</div>
                              <p className="text-slate-500 text-sm md:text-base font-medium italic">Premium pricing for urgent walk-in clinics without membership.</p>
                           </div>
                        </div>
                        <div className="pt-6 md:pt-8 border-t border-slate-100">
                           <div className="flex items-center gap-3 text-red-500 font-black text-xs uppercase tracking-widest">
                              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                              Resident Dissatisfaction
                           </div>
                        </div>
                     </div>
                  </Card>
               </motion.div>

                {/* Solution Card - Glassmorphism */}
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.2 }}
                  className="group relative"
               >
                  <Card className="glass p-8 md:p-12 h-full border-blue-100 shadow-2xl group-hover:shadow-[0_80px_100px_rgba(56,189,248,0.15)] transition-all rounded-[2rem] md:rounded-[3rem] overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-[#23d9b0]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                     <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 border border-emerald-100 relative z-10">
                        <Zap className="h-8 w-8" />
                     </div>
                     <h3 className="text-3xl font-black italic uppercase text-[#050249] mb-6 relative z-10">The Cedexx Layer</h3>
                     <div className="space-y-6 md:space-y-8 relative z-10">
                        <div className="flex gap-4 md:gap-6 items-start">
                           <div className="text-4xl md:text-5xl font-black text-emerald-500 opacity-100">15</div>
                           <div>
                              <div className="text-base md:text-lg font-black text-[#050249] uppercase">Minute Connection</div>
                              <p className="text-slate-500 text-sm md:text-base font-medium italic">Median provider connection time via the resident interface.</p>
                           </div>
                        </div>
                        <div className="flex gap-4 md:gap-6 items-start">
                           <div className="text-4xl md:text-5xl font-black text-emerald-500 opacity-100">$0</div>
                           <div>
                              <div className="text-base md:text-lg font-black text-[#050249] uppercase">Out-of-Pocket Visit Fee</div>
                              <p className="text-slate-500 text-sm md:text-base font-medium italic">Fully integrated as a portfolio-wide amenity for all residents.</p>
                           </div>
                        </div>
                        <div className="pt-6 md:pt-8 border-t border-slate-100">
                           <div className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-widest">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              Institutional Standard
                           </div>
                        </div>
                     </div>
                  </Card>
               </motion.div>
            </div>
          </div>
        </section>

        {/* GROWTH RAMP - INTERACTIVE GRAPH */}
        <section className="py-40 bg-white">
           <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                 <motion.div initial={{ opacity:0, x:-50 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-8">Scaling Velocity</div>
                    <h2 className="text-4xl md:text-7xl font-black text-[#050249] mb-10 leading-[0.9] tracking-tighter italic uppercase">Portfolio Velocity.</h2>
                    <p className="text-lg md:text-xl text-slate-500 mb-12 font-medium leading-relaxed italic">
                        Our strategic B2B2C model is optimized to capture entire portfolios simultaneously, maximizing unit density and dividend yield.
                    </p>
                    <div className="space-y-6">
                       {[
                         { label: 'Current Enrolled Families', val: '12,400', sub: 'Growing 14% MoM', color: 'text-indigo-600' },
                         { label: 'Projected EBITDA Margin', val: '38%', sub: 'Driven by AI triage efficiency', color: 'text-emerald-500' }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                           <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                           </div>
                           <div>
                             <div className="text-xs font-black uppercase text-blue-400 tracking-widest">{item.label}</div>
                             <div className={`text-3xl font-black ${item.color}`}>{item.val}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase italic">{item.sub}</div>
                           </div>
                         </div>
                       ))}
                    </div>
                 </motion.div>

                 <div className="relative h-[400px] md:h-[600px] flex items-end justify-between p-6 md:p-12 bg-slate-50 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-inner group overflow-hidden">
                    {growthPoints.map((point, i) => (
                      <div key={i} className="flex flex-col items-center gap-4 md:gap-6 h-full justify-end relative z-10">
                         <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: point.height }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 1 }}
                            className={`w-10 md:w-24 rounded-t-xl md:rounded-t-3xl relative ${i === 2 ? 'bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-[0_20px_50px_rgba(52,211,153,0.3)]' : 'bg-blue-100 group-hover:bg-blue-200 transition-colors'}`}
                         >
                            <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 text-center w-max">
                               <div className="text-xl md:text-2xl font-black text-[#050249]">{point.revenue}</div>
                               <div className="text-[8px] md:text-xs font-bold text-slate-400 uppercase italic leading-none">{point.users}</div>
                            </div>
                         </motion.div>
                         <div className="text-[10px] md:text-xs font-black uppercase text-[#050249] tracking-widest">{point.year}</div>
                      </div>
                    ))}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200" />
                    <div className="absolute top-12 left-12 grid grid-cols-4 gap-2 opacity-5 pointer-events-none">
                       {Array.from({length: 16}).map((_, i) => <div key={i} className="h-2 w-2 rounded-full bg-blue-900" />)}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* REIT PROFIT CALCULATOR */}
        <section className="py-40 bg-[#050249] text-white relative overflow-hidden">
           <div className="container mx-auto px-6 relative z-10 text-center mb-24">
              <h2 className="text-4xl md:text-7xl font-black mb-10 leading-[0.9] tracking-tighter italic uppercase">"Glassworth" Portfolio Impact.</h2>
              <p className="text-xl text-blue-100/60 font-medium italic max-w-2xl mx-auto">
                 Model your own portfolio lift at a 5% exit Cap Rate.
              </p>
           </div>

           <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10 pb-40">
              <Card className="glass-dark p-12 border-white/10 flex flex-col items-center col-span-1 lg:col-span-1">
                 <Building2 className="h-16 w-16 text-emerald-400 mb-8" />
                 <h3 className="text-2xl font-black mb-8 italic uppercase text-center">Your Bed Portfolio</h3>
                 <div className="w-full space-y-6">
                    <div className="relative">
                       <Input
                          type="number"
                          value={bedCount}
                          onChange={(e) => setBedCount(Number(e.target.value))}
                          className="bg-white/5 border-white/10 text-white text-center h-20 text-4xl font-black rounded-3xl"
                       />
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-blue-400 tracking-widest">Beds</span>
                    </div>
                     <div className="flex justify-between gap-4">
                        {[1000, 5000, 10000, 25000].map(n => (
                          <button
                             key={n}
                             onClick={() => setBedCount(n)}
                             className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${bedCount === n ? 'bg-emerald-400 text-[#050249]' : 'bg-white/5 text-blue-200 hover:bg-white/10'}`}
                          >
                             {`${n / 1000}K`}
                          </button>
                        ))}
                     </div>
                 </div>
              </Card>

              <Card className="glass p-12 border-emerald-500/20 col-span-1 lg:col-span-2 shadow-[0_50px_150px_rgba(35,217,176,0.15)] flex flex-col justify-center items-center text-center">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full items-center">
                    <motion.div
                       key={bedCount}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="space-y-2"
                    >
                       <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-4">Annual NOI Multiplication</div>
                       <div className="text-7xl font-black text-[#050249] italic leading-none">${annualNOI}</div>
                       <p className="text-blue-900/60 text-xs font-bold uppercase tracking-widest italic pt-4">Direct Portfolio Revenue</p>
                    </motion.div>

                    <motion.div
                       key={bedCount + '_lift'}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="space-y-2 p-10 bg-emerald-500 rounded-[3rem] shadow-2xl relative overflow-hidden group"
                    >
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                       <div className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.5em] mb-4 relative z-10">Asset Valuation Expansion</div>
                       <div className="text-7xl font-black text-white italic leading-none relative z-10">${assetLift}</div>
                       <p className="text-white text-xs font-bold uppercase tracking-widest italic pt-4 relative z-10">At 5.0% Exit Cap Rate</p>
                    </motion.div>
                 </div>
              </Card>
           </div>

            <div className="container mx-auto px-6 relative z-10 text-center -mt-10 md:-mt-20 pb-20">
               <p className="text-[10px] text-blue-100/30 uppercase font-bold tracking-widest max-w-4xl mx-auto">
                 Disclaimer: All financial projections, including NOI lift and asset valuation expansion, are pro forma estimates based on historical pilot data. Actual performance may vary based on market conditions, property-specific enrollment rates, and local regulatory environments.
               </p>
            </div>
         </section>

         {/* FINAL DECK CTA */}
         <section className="py-20 md:py-40 container mx-auto px-6 relative z-20 -mt-20">
            <div className="glass-dark p-8 md:p-24 rounded-[2rem] md:rounded-[4rem] text-center border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-[600px] bg-blue-600/30 blur-[100px] rounded-full" />
               <h2 className="text-3xl md:text-6xl font-black text-white mb-10 leading-none tracking-tighter uppercase italic">Ready to drive the lift?</h2>
               <p className="text-blue-100/60 text-lg md:text-xl font-medium italic mb-12 max-w-2xl mx-auto">
                  We are currently reviewing pilots for REIT portfolios and strategic hospital partnerships.
               </p>
               <div className="flex flex-wrap justify-center gap-6">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 border-none px-8 md:px-12 h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-widest shadow-2xl group w-full md:w-auto">
                     Request Access
                     <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </div>
            </div>
         </section>

      </div>
    </PasswordGate>
  );
};