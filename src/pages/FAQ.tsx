import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Phone, 
  Mail, 
  Smartphone, 
  Clock, 
  ShieldCheck, 
  Pill, 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Users
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'onboarding' | 'care' | 'rx' | 'billing' | 'partner';
  question: string;
  answer: string;
  steps?: string[];
  importantNotice?: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'post-purchase-steps',
    category: 'onboarding',
    question: "I just purchased or enrolled in my membership. What happens next?",
    answer: "Welcome to CEDEXX! Follow these 4 easy steps to access your benefits:",
    steps: [
      "Allow 24–48 Hours for Account Provisioning: Lyric Health requires 24 to 48 hours to complete credentialing and establish your clinical profile in their nationwide medical provider network.",
      "Download the Lyric Health App: Search 'Lyric Health' in the Apple App Store (iOS) or Google Play Store (Android).",
      "Tap 'First Time User?': Open the app and tap the 'First Time User?' link on the bottom right of the login screen.",
      "Verify Your Profile: Enter your Last Name, Date of Birth, and the ZIP Code registered with CEDEXX to instantly link and activate your account.",
      "Watch for Confirmation Email: You will also receive an activation message from noreply@getlyric.com (please check your spam/junk folder)."
    ],
    importantNotice: "Do NOT attempt to sign in before tapping 'First Time User?'. As a new CEDEXX member, your account is verified through your Last Name, DOB, and ZIP Code matching your registration."
  },
  {
    id: 'first-time-user-setup',
    category: 'onboarding',
    question: "How do I locate and activate my membership in the Lyric Health app?",
    answer: "Your membership is pre-credentialed in Lyric Health's system. Open the Lyric Health app, look at the bottom right of the sign-in screen, and tap 'First Time User?'. You will be asked to verify your identity by entering: 1) Your Last Name, 2) Your Date of Birth, and 3) The ZIP Code you provided during your CEDEXX enrollment. Once entered, the system will match your profile and prompt you to create your login password.",
    importantNotice: "If you just purchased in the last 24 hours, Lyric may still be provisioning your account. Please allow up to 48 hours before verifying."
  },
  {
    id: 'member-id-format',
    category: 'onboarding',
    question: "What is my Member ID number?",
    answer: "Your Primary Member ID is the 10-digit phone number you provided during registration (without hyphens or spaces, e.g., 3055550199). If you contact Lyric Health Member Services or need to verify your account with a pharmacy, simply provide this 10-digit phone number.",
  },
  {
    id: 'app-download-links',
    category: 'onboarding',
    question: "Where can I download the Lyric Health app?",
    answer: "The Lyric Health app is available for free on both iOS and Android. You can search for 'Lyric Health' in your app store, or use the direct download buttons below. Telehealth consultations, virtual visits, and prescription refills are all accessed through this app.",
    steps: [
      "Apple App Store (iPhone / iPad): Search 'Lyric Health' or visit https://apps.apple.com/us/app/lyric-health/id1607146169",
      "Google Play Store (Android): Search 'Lyric Health' or visit https://play.google.com/store/apps/details?id=com.lyric.app"
    ]
  },
  {
    id: 'consult-speed',
    category: 'care',
    question: "How do 24/7 virtual doctor consultations work, and how fast can I speak to a doctor?",
    answer: "Consultations are available 24/7/365 with $0 co-pays and no hidden fees. Once logged into the Lyric Health app, tap 'Request Consult'. Most visits begin in under 15 minutes by phone or high-definition secure video with a US board-certified physician licensed in your state.",
  },
  {
    id: 'who-provides-care',
    category: 'care',
    question: "Who provides the medical care and telehealth services?",
    answer: "All clinical consultations, diagnoses, medical advice, and prescriptions are provided by Lyric Health's nationwide network of licensed, board-certified medical physicians and mental health professionals. CEDEXX provides the technology platform, membership infrastructure, and employer/housing wellness amenity.",
  },
  {
    id: 'pediatric-care',
    category: 'care',
    question: "Can my children or dependents be seen by a doctor?",
    answer: "Yes! Pediatric care is fully supported for minor dependents included on your membership. Board-certified physicians can assess pediatric fevers, earaches, rashes, cold/flu, pink eye, and allergies, and electronically transmit pediatric prescriptions to your preferred local pharmacy.",
  },
  {
    id: 'doctors-notes',
    category: 'care',
    question: "Can I get a doctor's note for work, school, or travel insurance?",
    answer: "Yes. When clinically appropriate, Lyric Health providers can issue official digital medical excuse notes for work, school, daycare, or travel insurance claims. You can download and share these notes directly from your app.",
  },
  {
    id: 'prescriptions-cost',
    category: 'rx',
    question: "Are prescriptions covered at no cost?",
    answer: "Yes! Your membership includes formulary medications at $0 co-pay when prescribed by a platform physician. CareNow™ includes 37 acute medications for common infections and illnesses at no additional cost. CareComplete™ expands this to include 37 acute medications plus 200 chronic medications for long-term health management at no additional cost.",
  },
  {
    id: 'rx-pickup-process',
    category: 'rx',
    question: "How do I receive my prescribed medications at the pharmacy?",
    answer: "Your provider will electronically send your prescription directly to the licensed local retail pharmacy of your choice (Walgreens, CVS, Walmart, Publix, Kroger, etc.). When you arrive, present your digital CEDEXX/Lyric RX discount card (available in your member portal or app, containing your BIN #, PCN #, and Member ID) to access covered medications at $0 co-pay.",
  },
  {
    id: 'mental-health-services',
    category: 'care',
    question: "Does CEDEXX include mental wellness and therapy support?",
    answer: "Yes. Members enrolled in CareNow™ + Mental Wellness, Mental Wellness, or CareComplete™ have access to confidential virtual behavioral health visits with licensed therapists, psychologists, and counselors with $0 co-pays.",
  },
  {
    id: 'cancellation-policy',
    category: 'billing',
    question: "How do I cancel or modify my membership?",
    answer: "You may cancel your CEDEXX membership at any time with zero cancellation penalties or fees. To cancel, email support@cedexx.net with 'Cancellation' in the subject line. Please include your Full Name, Date of Birth, registered Email Address, and Phone Number so we can locate your record. Cancellations take effect at the end of your current billing cycle.",
  },
  {
    id: 'contact-lyric-vs-cedexx',
    category: 'billing',
    question: "Who should I contact for support — Lyric Health or CEDEXX?",
    answer: "We offer dedicated support desks depending on what you need assistance with:",
    steps: [
      "Contact Lyric Health (1-866-223-8831) for: App login issues after 48 hours, clinical questions, appointment scheduling, doctor visits, and prescription transmission.",
      "Contact CEDEXX Support ((754) 432-2201 or support@cedexx.net) for: Billing questions, adding family members, changing membership plans, promo codes, or cancellation requests."
    ]
  },
  {
    id: 'resident-housing-partner',
    category: 'partner',
    question: "I received a complimentary membership through my housing community or employer. How does it work?",
    answer: "If your housing community or property management company provides CEDEXX as an amenity, your monthly membership fee is 100% sponsored. You receive full 24/7 access to Lyric Health virtual doctors, acute prescriptions, and digital care notes with $0 co-pay and $0 monthly cost to you.",
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'onboarding', label: 'Getting Started & App Setup', icon: Smartphone },
  { id: 'care', label: '24/7 Doctor Consults', icon: Clock },
  { id: 'rx', label: 'Prescriptions & Pharmacy', icon: Pill },
  { id: 'billing', label: 'Membership & Support', icon: ShieldCheck },
  { id: 'partner', label: 'Housing & Partners', icon: Users },
];

export function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'post-purchase-steps': true,
    'first-time-user-setup': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.question.toLowerCase().includes(q) || 
        item.answer.toLowerCase().includes(q) ||
        (item.steps && item.steps.some(s => s.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 selection:bg-blue-100 overflow-x-hidden">
      
      {/* ── HERO BANNER ── */}
      <section className="bg-[#050249] text-white pt-20 pb-24 md:pt-28 md:pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#23d9b0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-[#23d9b0] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Member & Patient Resource Center
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight italic uppercase">
            Frequently Asked <span className="text-[#23d9b0]">Questions</span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100/80 max-w-2xl mx-auto italic font-medium leading-relaxed mb-10">
            Clear, step-by-step guidance on account activation, downloading the Lyric Health app, 24/7 doctor consults, prescriptions, and support.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-5 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. 'First-Time User', 'Lyric Health', 'Prescriptions', 'Member ID')..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#23d9b0]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK START GUIDE CARD (FEATURED FOR NEW MEMBERS) ── */}
      <section className="container mx-auto px-6 max-w-5xl -mt-12 relative z-20">
        <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#23d9b0] bg-[#050249] px-3 py-1 rounded-full">
                Quick-Start Checklist
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#050249] mt-3 uppercase italic tracking-tight">
                New Member? What To Expect Next
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium italic mt-1">
                Follow these 4 simple steps to connect with 24/7 care through Lyric Health.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://apps.apple.com/us/app/lyric-health/id1607146169"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#050249] hover:bg-[#03013b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                🍏 Apple App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.lyric.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#050249] hover:bg-[#03013b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                🤖 Google Play Store
              </a>
            </div>
          </div>

          {/* 4 Step Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-[#050249] text-[#23d9b0] flex items-center justify-center font-black text-sm mb-3">
                1
              </div>
              <h4 className="font-black text-[#050249] text-sm mb-1 uppercase tracking-tight">
                Allow 24–48 Hours
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Lyric Health credentials your record in the clinical system. Watch for an email from <strong>noreply@getlyric.com</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-[#050249] text-[#23d9b0] flex items-center justify-center font-black text-sm mb-3">
                2
              </div>
              <h4 className="font-black text-[#050249] text-sm mb-1 uppercase tracking-tight">
                Download App
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Install the <strong>Lyric Health</strong> app from the iOS App Store or Android Google Play Store.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#eff6ff] border border-blue-200">
              <div className="h-8 w-8 rounded-lg bg-[#050249] text-white flex items-center justify-center font-black text-sm mb-3">
                3
              </div>
              <h4 className="font-black text-[#050249] text-sm mb-1 uppercase tracking-tight">
                Tap "First Time User?"
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Do not try to sign in yet. Tap the <strong>"First Time User?"</strong> link at the bottom right of the app.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f0fdf4] border border-emerald-200">
              <div className="h-8 w-8 rounded-lg bg-[#166534] text-white flex items-center justify-center font-black text-sm mb-3">
                4
              </div>
              <h4 className="font-black text-[#166534] text-sm mb-1 uppercase tracking-tight">
                Verify Your Info
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Enter your <strong>Last Name</strong>, <strong>DOB</strong>, and <strong>registered ZIP Code</strong> to link your membership!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER TABS ── */}
      <section className="container mx-auto px-6 max-w-5xl mt-16">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#050249] text-white shadow-lg translate-y-[-1px]'
                    : 'bg-white text-slate-600 hover:text-[#050249] border border-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── FAQ LIST ── */}
      <section className="container mx-auto px-6 max-w-5xl mt-12">
        {filteredFAQs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
            <HelpCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-[#050249] mb-2 uppercase tracking-tight">
              No matching questions found
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't find an answer matching "{searchQuery}". Please check your search term or contact our support team directly.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="bg-[#050249] text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-widest"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  id={faq.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-6 sm:p-8 flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="h-7 w-7 rounded-lg bg-[#EBF3FB] text-[#050249] font-black text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#050249] group-hover:text-white transition-colors">
                        Q
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-[#050249] italic tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-[#050249] transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-50 text-[#050249]' : ''}`}>
                      <ChevronDown className="h-5 w-5 shrink-0" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 border-t border-slate-50"
                      >
                        <div className="pt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                          <p>{faq.answer}</p>

                          {faq.steps && (
                            <ol className="mt-4 space-y-2.5 pl-2">
                              {faq.steps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                                  <CheckCircle2 className="h-4 w-4 text-[#23d9b0] shrink-0 mt-0.5" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          )}

                          {faq.importantNotice && (
                            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 font-medium">
                              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>{faq.importantNotice}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── STILL NEED HELP? SUPPORT CARD ── */}
      <section className="container mx-auto px-6 max-w-5xl mt-20">
        <div className="bg-[#050249] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#23d9b0] bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Live Member Support
            </span>
            <h3 className="text-2xl sm:text-4xl font-black mt-4 mb-4 uppercase italic tracking-tight">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-sm sm:text-base text-blue-100/80 font-medium leading-relaxed mb-8">
              Our clinical and customer care teams are available to make sure you get immediate, frictionless access to your benefits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="h-5 w-5 text-[#23d9b0]" />
                  <h4 className="font-black text-sm uppercase tracking-wider">
                    Lyric Health 24/7 Desk
                  </h4>
                </div>
                <p className="text-xs text-blue-100/70 mb-3">
                  App login issues after 48h, clinical questions, provider visits, prescriptions.
                </p>
                <a
                  href="tel:18662238831"
                  className="text-lg font-black text-white hover:text-[#23d9b0] transition-colors"
                >
                  1-866-223-8831
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <h4 className="font-black text-sm uppercase tracking-wider">
                    CEDEXX Member Desk
                  </h4>
                </div>
                <p className="text-xs text-blue-100/70 mb-3">
                  Billing, receipts, plan upgrades, housing sponsor verification, cancellations.
                </p>
                <div className="flex flex-col gap-1">
                  <a
                    href="tel:17544322201"
                    className="text-base font-black text-white hover:text-[#23d9b0] transition-colors"
                  >
                    (754) 432-2201
                  </a>
                  <a
                    href="mailto:support@cedexx.net"
                    className="text-xs font-bold text-blue-200 hover:text-white underline transition-colors"
                  >
                    support@cedexx.net
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-blue-200/60 font-medium">
                CEDEXX Healthcare Platform • Powered by Lyric Health
              </p>
              <Link
                to="/enroll"
                className="bg-[#23d9b0] hover:bg-[#1eb996] text-[#050249] text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-105"
              >
                Enroll In A Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
export default FAQ;
