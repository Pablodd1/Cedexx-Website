import React, { useState } from 'react';
import { Card } from '../components/ui';
import { Calendar, User, ArrowRight, Shield, Heart, Sparkles, CheckCircle2, Loader2, BookOpen, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  date: string;
  author: string;
  authorRole: string;
  category: string;
  image?: string;
  featured?: boolean;
  content?: {
    lead: string;
    scripture1?: {
      verse: string;
      reference: string;
      reflection: string;
    };
    bodyParagraphs: string[];
    scripture2?: {
      verse: string;
      reference: string;
      reflection: string;
    };
    encouragementSection?: {
      title: string;
      points: string[];
      closingThought: string;
      scripture: {
        verse: string;
        reference: string;
        note: string;
      };
    };
    signoff: {
      prayer: string[];
      closing: string;
      name: string;
      title: string;
      psalm: string;
    };
  };
}

const FEATURED_POST: BlogPost = {
  id: "true-wellness-faith-renewal",
  title: "True Wellness: Caring for Body, Mind, and Spirit",
  subtitle: "A Personal Reflection from CEDEXX Founder Daisy Gonzalez",
  excerpt: "At CEDEXX, we talk a lot about wellness — making healthcare accessible, caring for the whole person, and helping families live healthier lives. But true wellness goes deeper than the physical body.",
  date: "September 2026",
  author: "Daisy Gonzalez",
  authorRole: "Founder & CEO, CEDEXX",
  category: "Faith & Wholeness",
  image: "/images/faith-wellness-restoration.jpg",
  featured: true,
  content: {
    lead: "My first purpose is to share Christ. Everything else I do flows from that.",
    bodyParagraphs: [
      "At CEDEXX, we talk a lot about wellness — making healthcare accessible, caring for the whole person, and helping people live healthier lives. But through my own journey, I have learned that true wellness goes far deeper than the physical body.",
      "We are more than our physical health. We have a mind that needs renewal, a heart that needs encouragement, and a spirit that longs for something this world simply cannot give. For me, that answer is Jesus Christ.",
      "Life can be demanding. We all walk through seasons of stress, uncertainty, disappointment, and loss — days when you simply feel exhausted. In those moments, God's Word offers something beyond temporary encouragement. It points us directly toward hope, peace, restoration, and enduring truth.",
      "Taking care of ourselves means seeking appropriate medical care, nurturing our bodies, making healthy choices, building meaningful relationships, and protecting our mental well-being. But I also believe there is something deeply transformative about beginning each day by turning our hearts and minds toward God."
    ],
    scripture1: {
      verse: "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers.",
      reference: "3 John 1:2",
      reflection: "That verse captures what I believe with all my heart: our physical well-being matters, but so does the condition of our soul."
    },
    scripture2: {
      verse: "And do not be conformed to this world, but be transformed by the renewing of your mind.",
      reference: "Romans 12:2",
      reflection: "That daily renewal is what I want to encourage in each of you."
    },
    encouragementSection: {
      title: "A Moment of Encouragement",
      points: [
        "Some days may bring a verse about healing.",
        "Others may remind us to rest.",
        "Some may challenge how we think.",
        "And others may simply remind us that God is with us."
      ],
      closingThought: "Over the coming days, we will be sharing Scripture centered on wellness, wholeness, renewal of the mind, strength, peace, hope, and faith. My hope is not simply that these Scriptures encourage you — but that they lead you to know the One who gave us the promise in the first place.",
      scripture: {
        verse: "Come to Me, all you who labor and are heavy laden, and I will give you rest.",
        reference: "Matthew 11:28",
        note: "That invitation is for everyone."
      }
    },
    signoff: {
      prayer: [
        "May these words bring you encouragement.",
        "May they renew your mind.",
        "May they strengthen your heart.",
        "And above all, may they point you toward Christ."
      ],
      closing: "With faith and gratitude,",
      name: "Daisy Gonzalez",
      title: "Founder & CEO, CEDEXX",
      psalm: "\"He restores my soul.\" — Psalm 23:3"
    }
  }
};

const POSTS: BlogPost[] = [
  {
    id: "pediatric-ai-2025",
    title: "AI & Clinical Intelligence: The Future of Pediatric Diagnosis in 2025",
    excerpt: "Artificial intelligence is no longer science fiction. Research from early 2025 shows AI-enhanced monitoring can identify pediatric respiratory issues with 94% accuracy via smartphone audio.",
    date: "April 2025",
    author: "Clinical Operations",
    authorRole: "Cedexx Care Team",
    category: "Future of Health"
  },
  {
    id: "telemedicine-trends-2025",
    title: "Telemedicine Trends for 2025: Why Modern Parents Choose Virtual Care",
    excerpt: "New research indicates over 90% of parents prefer hybrid care models. Discover how immediate access to pediatric specialists is reducing household stress and improving clinical outcomes.",
    date: "April 2025",
    author: "Cedexx Clinical Team",
    authorRole: "Family Health",
    category: "Research-Backed Care"
  },
  {
    id: "financial-impact-virtual-visits",
    title: "The Financial Impact: How Virtual Visits Save Families Hundreds Annually",
    excerpt: "Urgent care wait times aren't just frustrating; they're expensive. Learn how one membership eliminates co-pays and hidden fees while providing military-grade security.",
    date: "March 2025",
    author: "Business Operations",
    authorRole: "Care Economics",
    category: "Healthcare Economics"
  },
  {
    id: "pediatric-chronic-conditions",
    title: "Managing Pediatric Chronic Conditions via Digital Platforms",
    excerpt: "From asthma to developmental monitoring, virtual check-ins are proving highly effective for consistent monitoring without disrupting your child's school or home routine.",
    date: "February 2025",
    author: "Pediatric Specialists",
    authorRole: "Clinical Team",
    category: "Wellness Insights"
  },
  {
    id: "hydration-miami-heat",
    title: "Healthy Living Tips: Staying Hydrated in the Miami Heat",
    excerpt: "As we move into the warmer months, staying hydrated is about more than just drinking water. Learn the signs of heat exhaustion and when to connect with a physician.",
    date: "January 2025",
    author: "Cedexx Wellness Team",
    authorRole: "Wellness Coaching",
    category: "Healthy Living"
  },
  {
    id: "parents-guide-247-care",
    title: "Telemedicine: A Parent's Guide to 24/7 Care",
    excerpt: "How to maximize your digital consults for pediatric needs. Prepare for your first appointment and get the most out of your membership.",
    date: "December 2024",
    author: "Clinical Operations",
    authorRole: "Patient Advocacy",
    category: "User Guides"
  }
];

export function Blog() {
  const [expandedFeatured, setExpandedFeatured] = useState<boolean>(true);
  const [scriptureEmail, setScriptureEmail] = useState<string>('');
  const [scriptureName, setScriptureName] = useState<string>('');
  const [scriptureSubmitting, setScriptureSubmitting] = useState<boolean>(false);
  const [scriptureSent, setScriptureSent] = useState<boolean>(false);

  const handleScriptureSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptureEmail || !scriptureEmail.includes('@')) return;
    setScriptureSubmitting(true);
    try {
      await fetch('/api/guide-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: scriptureEmail.trim(),
          first_name: scriptureName.trim() || 'Valued Reader',
          source: 'Daily Scripture & Wellness Reflections'
        })
      });
      setScriptureSent(true);
    } catch (err) {
      console.error('[SCRIPTURE SUBSCRIBE ERROR]', err);
      setScriptureSent(true);
    } finally {
      setScriptureSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-[#050249] selection:text-white font-sans bg-[#F8FAFC]">
      {/* ── HERO BANNER ── */}
      <section className="bg-[#050249] text-white pt-24 pb-28 md:pt-32 md:pb-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -top-24 -left-24 h-64 w-64 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#23d9b0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-[#23d9b0] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            CEDEXX Health & Wellness Journal
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight italic uppercase">
            Health & <span className="text-[#23d9b0]">Wholeness</span> Blog
          </h1>
          <p className="text-base sm:text-lg text-blue-100/80 font-medium leading-relaxed max-w-2xl mx-auto italic">
            Reflections on physical health, mental renewal, and spiritual peace — caring for the whole person in everyday life.
          </p>
        </div>
      </section>

      {/* ── FEATURED POST (DAISY'S REFLECTION) ── */}
      <section className="container mx-auto px-6 max-w-5xl -mt-16 relative z-20">
        <article className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-blue-50 overflow-hidden">
          
          {/* Featured Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
            <img 
              src={FEATURED_POST.image} 
              alt="Peaceful morning sunrise over calm reflective waters, symbolizing spiritual renewal, faith, and peace"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-[#23d9b0] text-[#050249] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                  Founder's Reflection
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {FEATURED_POST.category}
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  {FEATURED_POST.date}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight italic leading-tight text-white drop-shadow-md">
                {FEATURED_POST.title}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium italic mt-2 max-w-2xl hidden sm:block">
                {FEATURED_POST.subtitle}
              </p>
            </div>
          </div>

          {/* Author Badge */}
          <div className="px-6 sm:px-12 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-full bg-[#050249] text-[#23d9b0] font-black flex items-center justify-center text-sm shadow-sm ring-4 ring-blue-50">
                DG
              </div>
              <div>
                <h4 className="font-black text-[#050249] text-base leading-tight">
                  {FEATURED_POST.author}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {FEATURED_POST.authorRole}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-400 italic">
              Estimated read: 4 minutes
            </span>
          </div>

          {/* Full Article Content */}
          <div className="p-6 sm:p-12 text-slate-700 leading-relaxed text-base sm:text-lg font-medium space-y-6">
            
            {/* Opening Lead */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#050249] text-white shadow-md relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#23d9b0]/15 rounded-full blur-2xl" />
              <Quote className="h-8 w-8 text-[#23d9b0] mb-3 opacity-80" />
              <p className="text-lg sm:text-2xl font-black italic leading-snug tracking-tight text-[#23d9b0]">
                "My first purpose is to share Christ. Everything else I do flows from that."
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed pt-2">
              At CEDEXX, we talk a lot about wellness — making healthcare accessible, caring for the whole person, and helping people live healthier lives. But through my own journey, I have learned that true wellness goes far deeper than the physical body.
            </p>

            <p className="text-slate-600 leading-relaxed">
              We are more than our physical health. We have a mind that needs renewal, a heart that needs encouragement, and a spirit that longs for something this world simply cannot give. For me, that answer is Jesus Christ.
            </p>

            {/* Scripture Callout 1 */}
            <div className="my-8 p-6 sm:p-8 rounded-2xl bg-[#eff6ff] border-l-4 border-blue-600 shadow-sm">
              <p className="text-lg sm:text-xl font-bold text-[#050249] italic mb-2">
                "I pray that you may prosper in all things and be in health, just as your soul prospers."
              </p>
              <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-blue-600">
                <span>— 3 John 1:2</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium italic mt-3 pt-3 border-t border-blue-200/60">
                That verse captures what I believe deeply: our physical well-being matters, but so does the condition of our soul.
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Life can be demanding. We all walk through stress, uncertainty, disappointment, and loss — seasons when you simply feel tired. In those moments, God's Word offers something beyond temporary encouragement. It points us toward hope, peace, restoration, and truth.
            </p>

            {/* Scripture Callout 2 */}
            <div className="my-8 p-6 sm:p-8 rounded-2xl bg-[#f0fdf4] border-l-4 border-emerald-600 shadow-sm">
              <p className="text-lg sm:text-xl font-bold text-[#166534] italic mb-2">
                "Be transformed by the renewing of your mind."
              </p>
              <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-700">
                <span>— Romans 12:2</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium italic mt-3 pt-3 border-t border-emerald-200/60">
                That renewal is what I want to encourage in your life each day.
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Taking care of ourselves means seeking appropriate medical care, caring for our bodies, making healthy choices, building meaningful relationships, and protecting our mental well-being. But I also believe there is something powerful about beginning each day by turning our hearts and minds toward God.
            </p>

            <div className="h-px w-full bg-slate-100 my-8" />

            {/* Section: A Moment of Encouragement */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-[#050249] uppercase italic tracking-tight flex items-center gap-2">
                <Heart className="h-6 w-6 text-[#23d9b0] fill-current" />
                A Moment of Encouragement
              </h3>

              <p className="text-slate-600 leading-relaxed">
                Over the coming days, we will be sharing Scripture centered on wellness, wholeness, renewal of the mind, strength, peace, hope, and faith:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Some days may bring a verse about healing.",
                  "Others may remind us to rest.",
                  "Some may challenge how we think.",
                  "And others may simply remind us that God is with us."
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-[#23d9b0] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-slate-600 leading-relaxed pt-2">
                My hope is not simply that these Scriptures encourage you — but that they lead you to know the One who gave us the promise in the first place.
              </p>

              {/* Matthew 11:28 Card */}
              <div className="my-6 p-6 sm:p-8 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                <p className="text-lg sm:text-2xl font-black text-amber-950 italic mb-2">
                  "Come to Me, all you who labor and are heavy laden, and I will give you rest."
                </p>
                <p className="text-xs sm:text-sm font-black text-amber-800 uppercase tracking-widest">
                  — Matthew 11:28
                </p>
                <p className="text-xs text-slate-500 font-semibold mt-2 uppercase tracking-wider">
                  That invitation is for everyone.
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-slate-100 my-8" />

            {/* In-Article Scripture Subscribe Form */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#050249] to-blue-950 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#23d9b0]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#23d9b0] bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  Daily Scripture Reflections
                </span>
                <h3 className="text-xl sm:text-3xl font-black mt-3 mb-2 uppercase italic tracking-tight">
                  Receive a Daily Scripture & Reflection
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/80 font-medium leading-relaxed mb-6">
                  If you would like to receive periodic biblical encouragement from CEDEXX, you are welcome to subscribe. Each message includes a short Scripture and reflection focused on faith, wellness, and peace of mind. No obligation — simply an open invitation to pause and draw closer to God.
                </p>

                {scriptureSent ? (
                  <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-medium flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Thank you for subscribing! May these reflections bring peace, strength, and joy to your week.</span>
                  </div>
                ) : (
                  <form onSubmit={handleScriptureSubscribe} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="text"
                        placeholder="Your First Name (optional)"
                        value={scriptureName}
                        onChange={(e) => setScriptureName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#23d9b0]"
                      />
                      <input 
                        type="email"
                        required
                        placeholder="Your Email Address"
                        value={scriptureEmail}
                        onChange={(e) => setScriptureEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#23d9b0]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={scriptureSubmitting}
                      className="w-full sm:w-auto bg-[#23d9b0] hover:bg-[#1eb996] text-[#050249] text-xs font-black uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {scriptureSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>Subscribe to Scripture Reflections</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Closing Prayer & Sign-off */}
            <div className="pt-6 text-slate-700 space-y-4">
              <p className="font-bold text-[#050249] text-base">
                My prayer is simple:
              </p>
              
              <ul className="space-y-1.5 pl-4 text-sm sm:text-base italic text-slate-600 font-medium">
                <li>• May these words bring you encouragement.</li>
                <li>• May they renew your mind.</li>
                <li>• May they strengthen your heart.</li>
                <li>• And above all, may they point you toward Christ.</li>
              </ul>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-slate-600 font-medium italic">With faith and gratitude,</p>
                <h4 className="text-xl font-black text-[#050249] uppercase tracking-tight italic mt-1">
                  Daisy Gonzalez
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Founder & CEO, CEDEXX
                </p>
                <p className="text-sm font-bold text-blue-700 italic mt-4 bg-blue-50/60 inline-block px-4 py-2 rounded-xl border border-blue-100">
                  "He restores my soul." — Psalm 23:3
                </p>
              </div>
            </div>

          </div>

          {/* Embedded Legal Disclaimer */}
          <div className="bg-slate-900 p-6 flex items-center gap-4 border-t border-white/5">
            <Shield className="h-4 w-4 text-blue-400 opacity-60 shrink-0" />
            <p className="text-[10px] text-blue-200/50 uppercase tracking-widest font-black italic">
              Legal Notice: CEDEXX provides a digital healthcare platform powered by Lyric Health. Blog content represents personal wellness and faith reflections and does not constitute medical diagnosis or clinical treatment.
            </p>
          </div>
        </article>
      </section>

      {/* ── CLINICAL & INDUSTRY ARTICLES LIST ── */}
      <section className="py-24 bg-slate-50 mt-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto mb-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">
              Clinical & Industry Insights
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#050249] mt-3 uppercase italic tracking-tight">
              More From The CEDEXX Journal
            </h2>
            <p className="text-sm text-slate-500 font-medium italic mt-1">
              Explore our clinical research, telemedicine guides, and family health resources.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {POSTS.map((post) => (
              <Card key={post.id} className="p-0 overflow-hidden bg-white border-none shadow-xl rounded-[2.5rem] group hover:shadow-2xl transition-all">
                <div className="p-8 sm:p-10">
                   <div className="flex items-center gap-4 mb-6">
                      <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        {post.category}
                      </span>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                        {post.date}
                      </span>
                   </div>
                   <h3 className="text-xl sm:text-2xl font-black text-[#050249] mb-4 leading-tight group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter">
                     {post.title}
                   </h3>
                   <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm sm:text-base">
                      {post.excerpt}
                   </p>
                   <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                            <User className="h-4 w-4" />
                         </div>
                         <div>
                           <span className="text-xs font-black text-[#050249] uppercase tracking-widest block">
                             {post.author}
                           </span>
                           <span className="text-[10px] text-slate-400 font-medium">
                             {post.authorRole}
                           </span>
                         </div>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-[#050249] group-hover:text-white transition-all shadow-sm">
                         <ArrowRight className="h-4 w-4" />
                      </div>
                   </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Medical Notice */}
          <div className="mt-20 max-w-4xl mx-auto p-8 sm:p-10 bg-white rounded-3xl border border-slate-100 text-center shadow-sm">
             <h3 className="text-xl font-black text-[#050249] mb-3 uppercase italic">Medical Information Notice</h3>
             <p className="text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto italic text-xs sm:text-sm">
                Articles on this blog are for informational purposes only and do not constitute formal medical advice, diagnosis, or clinical prescription. Always seek the advice of your physician or qualified telehealth provider through your Lyric Health portal with any clinical questions.
             </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER NEWSLETTER STRIP ── */}
      <section className="py-24 bg-[#050249] text-white">
        <div className="container mx-auto px-6 text-center max-w-3xl">
           <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight italic uppercase">
             Stay Connected with CEDEXX
           </h2>
           <p className="text-sm sm:text-base text-blue-200/80 mb-8 max-w-xl mx-auto font-medium">
             Receive monthly wellness research, healthcare tips, and inspirational updates directly in your inbox.
           </p>
           <form onSubmit={handleScriptureSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                required
                value={scriptureEmail}
                onChange={(e) => setScriptureEmail(e.target.value)}
                placeholder="Enter your email address" 
                className="flex-1 bg-white/10 border border-white/20 px-6 py-3.5 rounded-2xl text-white placeholder-blue-200/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#23d9b0] transition-all" 
              />
              <button 
                type="submit"
                disabled={scriptureSubmitting}
                className="bg-[#23d9b0] text-[#050249] font-black px-8 py-3.5 rounded-2xl hover:bg-[#1eb996] transition-all shadow-xl text-xs uppercase tracking-wider"
              >
                {scriptureSubmitting ? 'Joining...' : 'Subscribe'}
              </button>
           </form>
        </div>
      </section>
    </div>
  );
}

export default Blog;
