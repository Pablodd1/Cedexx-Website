import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Shield, Lock, CreditCard, Heart, Users, Smartphone, Building2, Brain, Stethoscope, Loader2, AlertCircle } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

interface PlanOption {
  id: string;
  name: string;
  price: string;
  desc: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const PLANS: PlanOption[] = [
  { id: 'carenow', name: 'CareNow™', price: '$18.99', desc: 'Virtual Urgent Care for you and your household — up to 7 dependents included.', icon: Heart },
  { id: 'carenow-mental', name: 'CareNow™ + Mental Wellness', price: '$26.99', desc: 'Everything in CareNow™, plus behavioral health and therapy support.', icon: Brain, highlight: true },
  { id: 'mental-wellness', name: 'Mental Wellness', price: '$18.99', desc: 'Standalone behavioral health, therapy, and counseling support.', icon: Brain },
  { id: 'carecomplete', name: 'CareComplete™', price: '$34.99', desc: 'Complete Virtual Primary Care — Individual Membership.', icon: Stethoscope },
  { id: 'carecomplete-family', name: 'CareComplete™ Family', price: '$52.99', desc: 'Complete Family Virtual Care for up to 7 household members.', icon: Users },
];

export function Enroll() {
  const [step, setStep] = React.useState(0);
  const [role, setRole] = React.useState('individual');
  const [plan, setPlan] = React.useState('carenow-mental');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [promoCode, setPromoCode] = React.useState('');
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [promoApplied, setPromoApplied] = React.useState(false);
  const [discountedPrice, setDiscountedPrice] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [consentAnalytics, setConsentAnalytics] = React.useState(false);
  const [consentTOS, setConsentTOS] = React.useState(false);
  const [consentError, setConsentError] = React.useState<string | null>(null);

  // Track form start — fire once when user first interacts with any field
  const formStartedRef = React.useRef(false);
  React.useEffect(() => {
    if (formStartedRef.current) return;
    const hasAnyInput = firstName || lastName || email || phone || dob;
    if (!hasAnyInput) return;
    formStartedRef.current = true;

    const sendFormStart = async () => {
      try {
        await fetch('/api/track-form-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName || '',
            last_name: lastName || '',
            email: email || 'anonymous@cedexx.net',
            phone: phone || '',
            plan: plan || '',
            field: firstName ? 'first_name' : lastName ? 'last_name' : email ? 'email' : phone ? 'phone' : 'dob',
            url: typeof window !== 'undefined' ? window.location.href : '',
          }),
        });
      } catch (_) {
        // Non-blocking — never block the user flow
      }
    };
    sendFormStart();
  }, [firstName, lastName, email, phone, dob, plan]);

  const roles = [
    { id: 'individual', title: 'Individual / Life Solutions', icon: Heart, desc: 'Everyday care for yourself and your family.' },
    { id: 'hospitality', title: 'Hospitality Partner', icon: Smartphone, desc: 'Concierge healthcare for hotel groups.' },
    { id: 'housing', title: 'Housing / REIT Partner', icon: Building2, desc: 'Residential wellness amenity solutions.' },
    { id: 'affiliate', title: 'Affiliate Partner', icon: Users, desc: 'Strategic marketing and growth partnerships.' }
  ];

  const selectedPlan = PLANS.find(p => p.id === plan);

  const handleRegister = async () => {
    setConsentError(null);
    if (!consentTOS) {
      setConsentError('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !dob) {
      setConsentError('Please complete all required fields: First Name, Last Name, Email, and Date of Birth.');
      return;
    }
    // Fire-and-forget: log the lead when they move from personal info to plan selection
    try {
      await fetch('/api/register-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dob: dob,
          plan: plan,
          status: 'registered',
          consent_analytics: consentAnalytics,
          consent_tos: consentTOS,
          consent_version: '2.0',
          consent_timestamp: new Date().toISOString(),
        }),
      });
    } catch (_) {
      // Non-blocking — never block the user flow
    }
    setStep(2);
  };

  const handleCheckout = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please complete your personal information in step 2.');
      return;
    }
    setLoading(true);
    setError(null);

    // First: mark member as checkout_started so admin gets notified
    try {
      await fetch('/api/register-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dob: dob,
          plan: plan,
          is_checkout: true,
          consent_tos: consentTOS,
          consent_version: '2.0',
          consent_timestamp: new Date().toISOString(),
        }),
      });
    } catch (_) {
      // Non-blocking — don't stop checkout if this fails
    }

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          promo_code: promoApplied ? promoCode.trim().toUpperCase() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      window.location.href = data.url;
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
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">Complete your enrollment in under 5 minutes and get immediate 24/7 access to board-certified care.</p>
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

              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8 italic uppercase tracking-tighter">Select Your Role</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {roles.map((r) => (
                      <div 
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all group ${
                          role === r.id ? 'border-[#050249] bg-[#EBF3FB] shadow-xl' : 'border-slate-100 hover:border-blue-200 bg-white'
                        }`}
                      >
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                          role === r.id ? 'bg-[#050249] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
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
                    onClick={() => setStep(1)}
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
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">First Name</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="John" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Last Name</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="Doe" />
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#050249] uppercase tracking-widest">Phone Number</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" placeholder="+1 (___) ___-____" />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="dob" className="text-xs font-black text-[#050249] uppercase tracking-widest">Date of Birth</label>
                      <input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm" />
                    </div>
                  </div>
                  {/* Consent Section */}
                  <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                    <div className="flex items-start gap-3">
                      <input
                        id="consent-tos"
                        type="checkbox"
                        checked={consentTOS}
                        onChange={(e) => { setConsentTOS(e.target.checked); if (consentError) setConsentError(null); }}
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-[#050249] focus:ring-[#050249] cursor-pointer"
                      />
                      <label htmlFor="consent-tos" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                        I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#050249] font-bold underline hover:text-[#23d9b0]">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#050249] font-bold underline hover:text-[#23d9b0]">Privacy Policy</a>. I understand that Cedexx is a technology platform and does not provide medical advice. Clinical services are provided by Lyric Health. <span className="text-red-500 font-bold">*</span>
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        id="consent-analytics"
                        type="checkbox"
                        checked={consentAnalytics}
                        onChange={(e) => setConsentAnalytics(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-[#050249] focus:ring-[#050249] cursor-pointer"
                      />
                      <label htmlFor="consent-analytics" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                        I consent to Cedexx collecting and using my enrollment information (name, email, phone, DOB, plan choice) for operational analytics and membership tracking. I understand this data is stored securely and used only to improve services. <span className="text-slate-400 italic">(Optional — you may decline and still enroll)</span>
                      </label>
                    </div>
                    {consentError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-red-600 text-xs font-bold">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {consentError}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button className="flex-1 py-4 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all text-sm italic" onClick={() => setStep(0)}>Back</button>
                    <button className="flex-[2] py-4 rounded-2xl font-black bg-[#050249] text-white hover:bg-[#03013b] transition-all shadow-xl text-sm italic" onClick={handleRegister}>Plan Selection</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8 italic uppercase tracking-tighter">Choose Your Plan</h2>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {PLANS.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setPlan(p.id)}
                        className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${
                          plan === p.id ? 'border-[#050249] bg-[#EBF3FB] shadow-xl' : 'border-slate-100 bg-white hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-1">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors shrink-1 ${plan === p.id ? 'bg-[#050249] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                            <p.icon className="h-6 w-6" />
                          </div>
                          <div className="min-w-1">
                            <h3 className="font-black text-[#050249] text-lg leading-tight">{p.name}</h3>
                            <p className="text-slate-500 font-medium text-xs italic leading-snug">{p.desc}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-2xl font-black text-[#050249]">{p.price}</div>
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">per month</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button className="flex-1 py-4 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all text-sm italic" onClick={() => setStep(1)}>Back</button>
                    <button className="flex-[2] py-4 rounded-2xl font-black bg-[#050249] text-white hover:bg-[#03013b] transition-all shadow-xl text-sm italic" onClick={() => setStep(3)}>Continue to Payment</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-black text-[#050249] mb-8 italic uppercase tracking-tighter">Secure Checkout</h2>

                  <div className="p-6 bg-[#EBF3FB] rounded-[2rem] flex items-center gap-4 text-sm text-[#050249] border border-blue-50 font-bold italic mb-8">
                    <Lock className="h-5 w-5" />
                    You will be redirected to Stripe's secure checkout to complete your subscription
                  </div>

                  {/* Promo Code */}
                  <div className="mb-8">
                    <label className="text-xs font-black text-[#050249] uppercase tracking-widest mb-3 block">Promo Code (Optional)</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null); setPromoApplied(false); setDiscountedPrice(null); }}
                        className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm uppercase tracking-wider"
                        placeholder="ENTER CODE"
                        disabled={loading}
                      />
                      <button
                        onClick={async () => {
                          if (!promoCode.trim()) return;
                          setPromoError(null);
                          try {
                            const res = await fetch('/api/stripe/validate-promo', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ code: promoCode.trim(), plan_id: plan }),
                            });
                            const data = await res.json();
                            if (!res.ok || !data.valid) {
                              setPromoError(data.error || 'Invalid promo code');
                              setPromoApplied(false);
                              setDiscountedPrice(null);
                              return;
                            }
                            setPromoApplied(true);
                            setDiscountedPrice(data.discounted_price || null);
                          } catch (err: any) {
                            setPromoError('Unable to validate code. Please try again.');
                          }
                        }}
                        disabled={!promoCode.trim() || loading}
                        className="px-6 py-4 rounded-2xl font-black bg-slate-100 text-[#050249] hover:bg-slate-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-2 text-xs font-bold text-red-500 italic">{promoError}</p>
                    )}
                    {promoApplied && (
                      <p className="mt-2 text-xs font-bold text-[#23d9b0] italic">✓ Promo code applied successfully</p>
                    )}
                  </div>

                  {selectedPlan && (
                    <div className="p-6 rounded-[2.5rem] border-2 border-[#050249] bg-[#EBF3FB] shadow-xl mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-[#050249] text-white flex items-center justify-center">
                            <selectedPlan.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-black text-[#050249] text-lg leading-tight">{selectedPlan.name}</h3>
                            <p className="text-slate-500 font-medium text-xs italic">{selectedPlan.desc}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {promoApplied && discountedPrice ? (
                            <>
                              <div className="text-2xl font-black text-[#23d9b0]">{discountedPrice}</div>
                              <div className="text-sm font-bold text-slate-400 line-through">{selectedPlan.price}</div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl font-black text-[#050249]">{selectedPlan.price}</div>
                              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">per month</div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-blue-200 pt-4 mt-4">
                        <div className="flex items-center justify-between text-sm font-bold text-[#050249]">
                          <span>Monthly Total</span>
                          <span className="text-xl">{promoApplied && discountedPrice ? discountedPrice : selectedPlan.price}</span>
                        </div>
                        {promoApplied && (
                          <div className="flex items-center justify-between text-xs font-bold text-[#23d9b0] mt-1">
                            <span>Promo Applied</span>
                            <span>{promoCode.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-red-600 italic">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      className="flex-1 py-4 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all text-sm italic"
                      onClick={() => setStep(2)}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      className="flex-[2] py-4 rounded-2xl font-black bg-[#050249] text-white hover:bg-[#03013b] transition-all shadow-xl text-sm italic inline-flex items-center justify-center gap-2"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Redirecting to Secure Checkout...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Proceed to Secure Checkout
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
