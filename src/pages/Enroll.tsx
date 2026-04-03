import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Shield, Lock, CreditCard, Activity, Heart, Users, Smartphone } from 'lucide-react';
import { Button } from '../components/ui';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

export function Enroll() {
  const [step, setStep] = React.useState(1);
  const [plan, setPlan] = React.useState('family');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-[#050249] text-white text-[10px] font-black px-4 py-1 rounded-full mb-6 tracking-widest uppercase shadow-lg shadow-blue-900/20"
          >
            Join the Network
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-[#050249] mb-6 tracking-tight">Better Care. Here. Now.</h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Complete your enrollment in under 5 minutes and get immediate 24/7 access to board-certified care.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-50 p-6 md:p-8 max-w-3xl mx-auto">
              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-16 max-w-md mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-all shadow-sm ${
                      step >= i ? 'bg-[#050249] text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {i}
                    </div>
                    {i < 3 && (
                      <div className={`h-1.5 flex-1 mx-4 rounded-full transition-colors ${
                        step > i ? 'bg-[#050249]' : 'bg-slate-100'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">First Name</label>
                      <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="John" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Last Name</label>
                      <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="Doe" />
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Email Address</label>
                      <input type="email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Phone Number</label>
                      <input type="tel" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="(954) 000-0000" />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="dob" className="text-xs font-black text-[#050249] uppercase tracking-widest">Date of Birth</label>
                      <input id="dob" type="date" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" />
                    </div>
                  </div>
                  <button className="w-full mt-8 bg-[#050249] text-white font-black py-2.5 px-6 rounded-xl hover:bg-[#03013b] transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] text-xs" onClick={() => setStep(2)}>Continue to Plan Selection</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8">Choose Your Plan</h2>
                  <div className="space-y-6">
                    <div 
                      onClick={() => setPlan('family')}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between ${
                        plan === 'family' ? 'border-[#050249] bg-[#EBF3FB] shadow-xl' : 'border-slate-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${plan === 'family' ? 'bg-[#050249] text-white' : 'bg-slate-100 text-slate-400'}`}>
                           <Heart className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-[#050249] text-xl">Family Plan</h3>
                          <p className="text-slate-500 font-medium text-sm">Household coverage for up to 4 members</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-[#050249]">$27.99</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">per month</div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setPlan('individual')}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between ${
                        plan === 'individual' ? 'border-[#050249] bg-[#EBF3FB] shadow-xl' : 'border-slate-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${plan === 'individual' ? 'bg-[#050249] text-white' : 'bg-slate-100 text-slate-400'}`}>
                           <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-[#050249] text-xl">Individual Plan</h3>
                          <p className="text-slate-500 font-medium text-sm">Single member 24/7 access</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-[#050249]">$14.99</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">per month</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button className="flex-1 py-2 rounded-xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all text-xs" onClick={() => setStep(1)}>Back</button>
                    <button className="flex-[2] py-2 rounded-xl font-black bg-[#050249] text-white hover:bg-[#03013b] transition-all shadow-xl text-xs" onClick={() => setStep(3)}>Continue to Payment</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8">Payment Details</h2>
                  <div className="space-y-8">
                    <div className="p-6 bg-[#EBF3FB] rounded-[2rem] flex items-center gap-4 text-sm text-[#050249] border border-blue-50 font-bold">
                      <Lock className="h-5 w-5" />
                      Secure 256-bit SSL Encrypted Transaction
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Cardholder Name</label>
                      <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="John Doe" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Card Number</label>
                      <div className="relative">
                        <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="0000 0000 0000 0000" />
                        <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Expiry Date</label>
                        <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-[#050249] uppercase tracking-widest">CVV</label>
                        <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="123" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button className="flex-1 py-2 rounded-xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all text-xs" onClick={() => setStep(2)}>Back</button>
                    <button className="flex-[2] py-2 rounded-xl font-black bg-[#050249] text-white hover:bg-[#03013b] transition-all shadow-xl text-xs">Complete Enrollment</button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:order-2 space-y-8">
            <div className="bg-[#050249] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/20 rounded-full blur-2xl" />
              <h3 className="text-2xl font-black mb-8">Member Benefits</h3>
              <ul className="space-y-6">
                {[
                  '24/7/365 Unlimited Consults',
                  '$0 Co-pays & Hidden Fees',
                  'Board-Certified Physicians',
                  'Instant Pharmacy Delivery',
                  'Enterprise-Level Data Encryption',
                  'Digital School & Work Notes'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-bold text-blue-100">
                    <CheckCircle2 className="h-6 w-6 text-blue-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}              </ul>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-blue-50 shadow-xl">
              <div className="h-16 w-16 bg-[#EBF3FB] rounded-2xl flex items-center justify-center mb-6 text-[#050249] shadow-sm">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-black text-[#050249] text-xl mb-3">100% Satisfaction</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Cancel your membership at any time with zero penalties. We are committed to frictionless healthcare.
              </p>
            </div>
            
            <div className="bg-[#EBF3FB] p-8 rounded-[2.5rem] border border-blue-50">
               <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-[#050249] shadow-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-[#050249] uppercase tracking-widest">Active Members</h4>
                    <p className="text-slate-500 text-sm font-bold">12,400+ Families Enrolled</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}