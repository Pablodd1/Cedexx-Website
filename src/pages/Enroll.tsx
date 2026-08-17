import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Shield, Lock, CreditCard, Activity, Heart, Users, Smartphone, Building2, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface EnrollmentForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: string;
  plan: 'family' | 'individual';
}

const PLANS = {
  family: { name: 'Family Plan', price: '$34.99/mo', members: 'Up to 7 members' },
  individual: { name: 'Individual Plan', price: '$14.99/mo', members: '1 member' },
};

export function Enroll() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<EnrollmentForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    role: 'individual',
    plan: 'family',
  });

  const roles = [
    { id: 'individual', title: 'Individual / Life Solutions', icon: Heart, desc: 'Everyday care for yourself and your family.' },
    { id: 'hospitality', title: 'Hospitality Partner', icon: Smartphone, desc: 'Concierge healthcare for hotel groups.' },
    { id: 'housing', title: 'Housing / REIT Partner', icon: Building2, desc: 'Residential wellness amenity solutions.' },
    { id: 'affiliate', title: 'Affiliate Partner', icon: Users, desc: 'Strategic marketing and growth partnerships.' }
  ];

  const updateForm = (field: keyof EnrollmentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 0:
        return true; // Role is pre-selected
      case 1:
        if (!form.firstName.trim() || !form.lastName.trim()) {
          setError('First and last name are required');
          return false;
        }
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          setError('Valid email address is required');
          return false;
        }
        return true;
      case 2:
        return true; // Plan is pre-selected
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          date_of_birth: form.dateOfBirth,
          role: form.role,
          plan: form.plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-24 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-[#050249] text-white text-[10px] font-black px-4 py-1 rounded-full mb-6 tracking-widest uppercase shadow-lg shadow-blue-900/20"
          >
            Join the Network
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-[#050249] mb-6 tracking-tight italic uppercase">Better Care. Here. <span className="text-[#23d9b0]">Now.</span></h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">Complete your enrollment in under 5 minutes and get immediate access to board-certified care.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-blue-50 p-8 md:p-12 max-w-3xl mx-auto">
              
              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-16 max-w-md mx-auto">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black transition-all shadow-sm text-xs ${
                      step >= i ? 'bg-[#050249] text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {i + 1}
                    </div>
                    {i < 3 && (
                      <div className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                        step > i ? 'bg-[#050249]' : 'bg-slate-100'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Error Banner */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8 italic uppercase tracking-tighter">Select Your Role</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {roles.map((r) => (
                      <div 
                        key={r.id}
                        onClick={() => updateForm('role', r.id)}
                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all group ${
                          form.role === r.id ? 'border-[#050249] bg-[#EBF3FB] shadow-xl' : 'border-slate-100 hover:border-blue-200 bg-white'
                        }`}
                      >
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                          form.role === r.id ? 'bg-[#050249] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                        }`}>
                          <r.icon className="h-6 w-6" />
                        </div>
                        <h4 className="font-black text-[#050249] uppercase tracking-wider text-sm mb-1">{r.title}</h4>
                        <p className="text-slate-500 text-xs font-medium italic">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="w-full bg-[#050249] text-white font-black py-4 rounded-2xl hover:bg-[#03013b] transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base uppercase tracking-tighter italic" 
                    onClick={handleNext}
                  >
                    Continue to Membership Details
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8 italic uppercase tracking-tighter">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">First Name *</label>
                      <input 
                        type="text" 
                        value={form.firstName}
                        onChange={(e) => updateForm('firstName', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" 
                        placeholder="John" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Last Name *</label>
                      <input 
                        type="text" 
                        value={form.lastName}
                        onChange={(e) => updateForm('lastName', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" 
                        placeholder="Doe" 
                      />
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Email Address *</label>
                      <input 
                        type="email" 
                        value={form.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" 
                        placeholder="john@example.com" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Phone Number</label>
                      <input 
                        type="tel" 
                        value={form.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" 
                        placeholder="+1 (___) ___-____" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="dob" className="text-xs font-black text-[#050249] uppercase tracking-widest">Date of Birth</label>
                      <input 
                        id="dob" 
                        type="date" 
                        value={form.dateOfBirth}
                        onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button className="flex-1 py-4 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all text-sm italic" onClick={() => setStep(0)}>Back</button>
                    <button className="flex-[2] py-4 rounded-2xl font-black bg-[#050249] text-white hover:bg-[#03013b] transition-all shadow-xl text-sm italic" onClick={handleNext}>Plan Selection</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8 italic uppercase tracking-tighter">Choose Your Plan</h2>
                  <div className="space-y-6">
                    <div 
                      onClick={() => updateForm('plan', 'family')}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${
                        form.plan === 'family' ? 'border-[#050249] bg-[#EBF3FB] shadow-xl' : 'border-slate-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${form.plan === 'family' ? 'bg-[#050249] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                           <Heart className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-[#050249] text-xl">Family Plan</h3>
                          <p className="text-slate-500 font-medium text-sm italic underline">Household coverage for up to 7 members</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-[#050249]">$34.99</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">per month</div>
                      </div>
                    </div>

                    <div 
                      onClick={() => updateForm('plan', 'individual')}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${
                        form.plan === 'individual' ? 'border-[#050249] bg-[#EBF3FB] shadow-xl' : 'border-slate-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${form.plan === 'individual' ? 'bg-[#050249] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                           <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-[#050249] text-xl">Individual Plan</h3>
                          <p className="text-slate-500 font-medium text-sm italic underline">Single member 24/7 access</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-[#050249]">$14.99</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">per month</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button className="flex-1 py-4 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all text-sm italic" onClick={() => setStep(1)}>Back</button>
                    <button className="flex-[2] py-4 rounded-2xl font-black bg-[#050249] text-white hover:bg-[#03013b] transition-all shadow-xl text-sm italic" onClick={handleNext}>Continue to Payment</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8 italic uppercase tracking-tighter">Confirm & Pay</h2>
                  
                  {/* Summary */}
                  <div className="bg-[#EBF3FB] rounded-2xl p-6 mb-8 border border-blue-50">
                    <h3 className="font-black text-[#050249] text-sm uppercase tracking-widest mb-4">Enrollment Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-medium text-[#050249]">{form.firstName} {form.lastName}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium text-[#050249]">{form.email}</span></div>
                      {form.phone && <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium text-[#050249]">{form.phone}</span></div>}
                      <div className="flex justify-between"><span className="text-slate-500">Plan</span><span className="font-medium text-[#050249]">{PLANS[form.plan].name}</span></div>
                      <div className="flex justify-between pt-3 border-t border-blue-100"><span className="font-bold text-[#050249]">Total</span><span className="font-black text-[#050249] text-lg">{PLANS[form.plan].price}</span></div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#EBF3FB] rounded-[2rem] flex items-center gap-4 text-sm text-[#050249] border border-blue-50 font-bold italic mb-8">
                    <Lock className="h-5 w-5 shrink-0" />
                    <span>Secure payment via Stripe. Your card details are never stored on our servers.</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      className="flex-1 py-4 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all text-sm italic" 
                      onClick={() => setStep(2)}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button 
                      className="flex-[2] py-4 rounded-2xl font-black bg-[#050249] text-white hover:bg-[#03013b] transition-all shadow-xl text-sm italic flex items-center justify-center gap-2 disabled:opacity-60" 
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Pay {PLANS[form.plan].price}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:order-2 space-y-8">
            <div className="bg-[#050249] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/20 rounded-full blur-2xl" />
              <h3 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">Member Benefits</h3>
              <ul className="space-y-6">
                {[
                  '24/7/365 Unlimited Consults',
                  '$0 Co-pays & Hidden Fees',
                  'Board-Certified Physicians',
                  'Instant Pharmacy Delivery',
                  'Enterprise-Level Data Encryption',
                  'Digital School & Work Notes'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-bold text-blue-100 italic">
                    <CheckCircle2 className="h-6 w-6 text-blue-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}              </ul>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-blue-50 shadow-xl">
              <div className="h-16 w-16 bg-[#EBF3FB] rounded-2xl flex items-center justify-center mb-6 text-[#050249] shadow-sm">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-black text-[#050249] text-xl mb-3 italic uppercase tracking-tighter">100% Satisfaction</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                Cancel your membership at any time with zero penalties. We are committed to frictionless healthcare.
              </p>
            </div>
            
            <div className="bg-[#EBF3FB] p-8 rounded-[2.5rem] border border-blue-50">
               <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-[#050249] shadow-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-[#050249] uppercase tracking-widest italic">Active Members</h4>
                    <p className="text-slate-500 text-sm font-bold italic">12,400+ Families Enrolled</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
