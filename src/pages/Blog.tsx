import React, { useState } from 'react';
import { Card } from '../components/ui';
import { User, ArrowRight, Shield, Heart, Sparkles, CheckCircle2, Loader2, Quote, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  authorRole: string;
  category: string;
  isFounderArticle?: boolean;
}

const PUMPKIN_PRACTICE = [
  {
    letter: 'P',
    title: 'Pray with Purpose',
    body: 'Begin your morning with prayer. Bring God your worries, your gratitude, your unanswered questions, and your hopes for what lies ahead. You do not need to have every answer right now; often, we just need to make room to listen.',
    verse: '"Trust in the LORD with all thine heart; and lean not unto thine own understanding."',
    reference: 'Proverbs 3:5',
  },
  {
    letter: 'U',
    title: 'Unplug to Unwind',
    body: 'Step away from the constant noise, the endless scrolling, and the pressure to stay busy every hour of the day. Give yourself permission to be still. Real peace usually begins the moment we stop giving every distraction our attention.',
  },
  {
    letter: 'M',
    title: 'Meditate on What Matters',
    body: 'Carve out unhurried time for Scripture, quiet thought, and gratitude. Look back on what this year has taught you so far. What has anchored your faith? What has stretched you? What truly deserves more of your heart and time?',
  },
  {
    letter: 'P',
    title: 'Practice Gratitude',
    body: 'Notice the quiet victories, the prayers that have already been answered, the people who have stood in your corner, and the doors that helped you grow. Gratitude does not mean everything in life is easy; it means we recognize the good even while we are still in the middle of growing.',
  },
  {
    letter: 'K',
    title: 'Keep Growing in Faith',
    body: 'Real growth is rarely comfortable, and the best progress is not always visible right away. Stay willing to learn, to forgive, to adjust your course, and to step past what feels familiar. Becoming who you are called to be is a lifelong walk, not a sprint.',
  },
  {
    letter: 'I',
    title: 'Intentionally Invest in Yourself',
    body: 'Make daily choices that care for your health, strengthen your family and relationships, and honor your calling. Protect your rest, look after your body and mind, and give your dreams the honest attention they deserve.',
  },
  {
    letter: 'N',
    title: 'Nurture New Beginnings',
    body: 'There is still plenty of time to begin again. You never have to wait for January first to make a meaningful change. Take one small, honest step toward a goal this week, revisit a dream you set on the shelf, or build a healthier rhythm for your home.',
  },
];

const FALL_REFLECTION_QUESTIONS = [
  {
    question: 'What have I learned this year?',
    prompt: 'Which moments or challenges have quietly made me wiser, stronger, or more compassionate toward others?',
  },
  {
    question: 'Where do I still need to grow?',
    prompt: 'Is there a daily habit, a mindset, a relationship, or an area of my health that needs more honest care?',
  },
  {
    question: 'What am I still believing for?',
    prompt: 'Which goals or prayers did I set aside earlier in the year that I can begin walking toward again today?',
  },
  {
    question: 'What can I accomplish before the year ends?',
    prompt: 'What is one practical, meaningful step I can take for my family or my well-being this week?',
  },
  {
    question: 'What do I need to surrender to God?',
    prompt: 'Where in my life can I trade fear for faith, and the need for control for quiet trust?',
  },
];

const POSTS: BlogPost[] = [
  {
    id: 'true-wellness-faith-renewal',
    title: 'True Wellness: Caring for Body, Mind, and Spirit',
    excerpt:
      'At CEDEXX, we talk a lot about making healthcare accessible and caring for the whole person. Through my own journey, I have learned that true wellness goes far deeper than the physical body.',
    date: 'September 2026',
    author: 'Daisy Gonzalez',
    authorRole: 'Founder & CEO, CEDEXX',
    category: 'Faith & Wholeness',
    isFounderArticle: true,
  },
  {
    id: 'pediatric-ai-2025',
    title: 'AI & Clinical Intelligence: The Future of Pediatric Diagnosis in 2025',
    excerpt:
      'Artificial intelligence is no longer science fiction. Research from early 2025 shows AI-enhanced monitoring can identify pediatric respiratory issues with 94% accuracy via smartphone audio.',
    date: 'April 2025',
    author: 'Clinical Operations',
    authorRole: 'Cedexx Care Team',
    category: 'Future of Health',
  },
  {
    id: 'telemedicine-trends-2025',
    title: 'Telemedicine Trends for 2025: Why Modern Parents Choose Virtual Care',
    excerpt:
      'New research indicates over 90% of parents prefer hybrid care models. Discover how immediate access to pediatric specialists is reducing household stress and improving clinical outcomes.',
    date: 'April 2025',
    author: 'Cedexx Clinical Team',
    authorRole: 'Family Health',
    category: 'Research-Backed Care',
  },
  {
    id: 'financial-impact-virtual-visits',
    title: 'The Financial Impact: How Virtual Visits Save Families Hundreds Annually',
    excerpt:
      'Urgent care wait times are not just frustrating; they are expensive. Learn how one membership eliminates co-pays and hidden fees while providing dependable family access.',
    date: 'March 2025',
    author: 'Business Operations',
    authorRole: 'Care Economics',
    category: 'Healthcare Economics',
  },
  {
    id: 'pediatric-chronic-conditions',
    title: 'Managing Pediatric Chronic Conditions via Digital Platforms',
    excerpt:
      'From asthma to developmental monitoring, virtual check-ins are proving highly effective for consistent follow-up without disrupting your child’s school or home routine.',
    date: 'February 2025',
    author: 'Pediatric Specialists',
    authorRole: 'Clinical Team',
    category: 'Wellness Insights',
  },
  {
    id: 'hydration-miami-heat',
    title: 'Healthy Living Tips: Staying Hydrated in the Miami Heat',
    excerpt:
      'As we move into the warmer months, staying hydrated is about more than just drinking water. Learn the signs of heat exhaustion and when to connect with a physician.',
    date: 'January 2025',
    author: 'Cedexx Wellness Team',
    authorRole: 'Wellness Coaching',
    category: 'Healthy Living',
  },
  {
    id: 'parents-guide-247-care',
    title: "Telemedicine: A Parent's Guide to 24/7 Care",
    excerpt:
      'How to make the most of your digital consults for pediatric needs. Prepare for your first appointment and get the greatest value from your family membership.',
    date: 'December 2024',
    author: 'Clinical Operations',
    authorRole: 'Patient Advocacy',
    category: 'User Guides',
  },
];

export function Blog() {
  const [activeFounderPost, setActiveFounderPost] = useState<'fall-2026' | 'september-2026'>('fall-2026');
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
          source: 'Daily Scripture & Wellness Reflections',
        }),
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
            Personal reflections on physical health, mental renewal, and spiritual peace, caring for the whole person in everyday life.
          </p>

          {/* Founder Edition Switcher */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setActiveFounderPost('fall-2026')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeFounderPost === 'fall-2026'
                  ? 'bg-[#23d9b0] text-[#050249] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Fall Edition: Pumpkin Spice & Everything Nice
            </button>
            <button
              type="button"
              onClick={() => setActiveFounderPost('september-2026')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeFounderPost === 'september-2026'
                  ? 'bg-[#23d9b0] text-[#050249] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              September Edition: True Wellness & Faith
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURED FOUNDER REFLECTION ── */}
      <section id="founder-reflection-top" className="container mx-auto px-6 max-w-5xl -mt-16 relative z-20">
        {activeFounderPost === 'fall-2026' ? (
          <article className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-amber-100/80 overflow-hidden">
            {/* Featured Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
              <img
                src="/images/fall-reflection-pumpkin.jpg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/faith-wellness-restoration.jpg';
                }}
                alt="Warm autumn morning coffee and open journal beside golden fall leaves"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050249]/90 via-black/30 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="bg-amber-400 text-[#050249] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                    The CEDEXX Fall Edition
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Faith • Reflection • Growth • New Beginnings
                  </span>
                  <span className="text-xs text-amber-200 font-medium">
                    October 2026
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight italic leading-tight text-white drop-shadow-md">
                  Pumpkin Spice & Everything Nice
                </h2>
                <p className="text-xs sm:text-base text-blue-100/95 font-medium italic mt-2 max-w-2xl">
                  A Personal Fall Reflection from Daisy Gonzalez, Founder & CEO of CEDEXX
                </p>
              </div>
            </div>

            {/* Author Badge */}
            <div className="px-6 sm:px-12 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-[#050249] text-amber-300 font-black flex items-center justify-center text-sm shadow-sm ring-4 ring-amber-50">
                  DG
                </div>
                <div>
                  <h4 className="font-black text-[#050249] text-base leading-tight">
                    Daisy Gonzalez
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Founder & CEO, CEDEXX
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-400 italic">
                Estimated read: 5 minutes
              </span>
            </div>

            {/* Full Article Content */}
            <div className="p-6 sm:p-12 text-slate-700 leading-relaxed text-base sm:text-lg font-medium space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                  A Note to Our Community
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#050249] tracking-tight italic">
                  A Season to Slow Down, Trust More, and Grow Deeper
                </h3>
              </div>

              <p className="text-slate-700 font-semibold italic">
                Dear CEDEXX Community,
              </p>

              <p className="text-slate-600 leading-relaxed">
                There is something quietly special about fall. As the air shifts and the leaves begin to turn, the season reminds us that change is a natural part of life, and that letting go of what no longer serves us often makes room for something far more meaningful to grow.
              </p>

              <p className="text-slate-600 leading-relaxed">
                As we step into the final months of the year, I find myself looking back on how far we have come, the lessons that shaped us along the way, and the prayers and dreams still waiting to unfold.
              </p>

              <p className="text-slate-600 leading-relaxed">
                Fall is more than a change in the calendar. It is an invitation to pause, reconnect with God, and trust Him even when we cannot see every mile of the road ahead.
              </p>

              <p className="text-slate-600 leading-relaxed">
                So often, we spend our energy planning what comes next and forget to appreciate where we are standing right now. We become so focused on what we have yet to finish that we overlook just how much we have already overcome.
              </p>

              {/* Highlighted Encouragement Callout */}
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#050249] text-white shadow-md relative overflow-hidden my-6">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/15 rounded-full blur-2xl" />
                <Quote className="h-8 w-8 text-amber-300 mb-3 opacity-80" />
                <p className="text-lg sm:text-2xl font-black italic leading-snug tracking-tight text-amber-200">
                  "Trust more. Worry less. Make room for quiet reflection. And never underestimate what God can do with the time you have left."
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed">
                At CEDEXX, we believe that caring for ourselves means caring for the whole person: mind, body, and spirit. True wellness begins when we intentionally make space for what matters most.
              </p>

              <p className="text-slate-600 leading-relaxed">
                So pour your favorite warm cup of coffee or tea, find a quiet corner for a few minutes, and join me in a little seasonal reflection.
              </p>

              <div className="pt-2 pb-4">
                <p className="text-slate-600 italic">With intention and care,</p>
                <p className="font-black text-[#050249] text-lg uppercase italic tracking-tight mt-1">
                  Daisy Gonzalez
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Founder & CEO, CEDEXX • <span className="italic text-[#050249]">Better Care. Here. Now.</span>
                </p>
              </div>

              <div className="h-px w-full bg-slate-100 my-8" />

              {/* Section: The P.U.M.P.K.I.N. Practice */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                    Seasonal Rhythm
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#050249] uppercase italic tracking-tight mt-3">
                    The P.U.M.P.K.I.N. Practice
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 font-semibold italic mt-1">
                    Seven gentle reminders for a season of spiritual and personal growth
                  </p>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  What if a familiar symbol of the season could become more than a fall favorite? Here are seven simple habits to nourish your spirit, clear your mind, and help your household move forward with purpose:
                </p>

                <div className="space-y-4 pt-2">
                  {PUMPKIN_PRACTICE.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-slate-50/90 border border-slate-100 hover:border-amber-200 transition-all shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-11 w-11 rounded-xl bg-[#050249] text-amber-300 font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                          {item.letter}
                        </div>
                        <div className="space-y-2 flex-1">
                          <h4 className="text-lg font-black text-[#050249] tracking-tight">
                            {item.title}
                          </h4>
                          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                            {item.body}
                          </p>
                          {item.verse && (
                            <div className="mt-3 p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-500">
                              <p className="text-sm sm:text-base font-bold text-amber-950 italic">
                                {item.verse}
                              </p>
                              <p className="text-xs font-black uppercase tracking-wider text-amber-800 mt-1">
                                {item.reference}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 my-8" />

              {/* Section: Your Fall Reflection */}
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Looking Ahead
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#050249] uppercase italic tracking-tight mt-3">
                    Your Fall Reflection: Before the Year Ends
                  </h3>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  As the year begins to wind down, I invite you to set aside a few quiet minutes for yourself and reflect honestly, gently, and without self-judgment. Ask yourself:
                </p>

                <div className="grid grid-cols-1 gap-3.5 pt-1">
                  {FALL_REFLECTION_QUESTIONS.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#eff6ff]/70 border border-blue-100 flex items-start gap-3.5"
                    >
                      <CheckCircle2 className="h-5 w-5 text-[#050249] shrink-0 mt-1" />
                      <div>
                        <h4 className="font-black text-[#050249] text-base">
                          {q.question}
                        </h4>
                        <p className="text-slate-600 text-sm sm:text-base mt-0.5">
                          {q.prompt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-slate-600 leading-relaxed pt-2">
                  You do not need to finish the year with every detail figured out. You only need to stay open to growth, faithful in the small things, and willing to take the next honest step.
                </p>

                <p className="text-slate-600 leading-relaxed">
                  Progress does not have to be loud to be meaningful. Often, the most lasting changes happen quietly in the choices we make each day.
                </p>
              </div>

              <div className="h-px w-full bg-slate-100 my-8" />

              {/* Closing Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-[#050249] uppercase italic tracking-tight">
                  A Little Seasonal Encouragement
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  May this autumn remind you that rest is productive, quiet reflection is powerful, and faith can steady you through any season of uncertainty.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  May you find peace in the present moment, courage for what lies ahead, and genuine gratitude for the road that brought you here.
                </p>
                <p className="text-slate-800 font-bold leading-relaxed">
                  And as you look toward the final months of the year, remember that your story is still unfolding, your growth is still ahead of you, and there is still time to build something beautiful with what remains.
                </p>
                <p className="text-[#050249] font-black italic">
                  Keep praying. Keep growing. Keep believing.
                </p>

                <div className="pt-4 border-t border-amber-200/60">
                  <p className="text-slate-600 font-medium italic">With intention and care,</p>
                  <h4 className="text-xl font-black text-[#050249] uppercase tracking-tight italic mt-1">
                    Daisy Gonzalez
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Founder & CEO of CEDEXX • Better Care. Here. Now.
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-amber-900 italic mt-3 bg-white/80 inline-block px-4 py-2 rounded-xl border border-amber-200">
                    Pause. Reflect. Renew. Your next season begins with the choices you make today.
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Legal Disclaimer */}
            <div className="bg-slate-900 p-6 flex items-center gap-4 border-t border-white/5">
              <Shield className="h-4 w-4 text-blue-400 opacity-60 shrink-0" />
              <p className="text-[10px] text-blue-200/50 uppercase tracking-widest font-black italic">
                Legal Notice: CEDEXX is a technology and wellness membership platform powered by Lyric Health, not a medical provider. Blog reflections represent personal faith and wellness encouragement and do not constitute medical diagnosis or clinical treatment.
              </p>
            </div>
          </article>
        ) : (
          <article className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-blue-50 overflow-hidden">
            {/* September Featured Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
              <img
                src="/images/faith-wellness-restoration.jpg"
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
                    Faith & Wholeness
                  </span>
                  <span className="text-xs text-blue-200 font-medium">
                    September 2026
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight italic leading-tight text-white drop-shadow-md">
                  True Wellness: Caring for Body, Mind, and Spirit
                </h2>
                <p className="text-xs sm:text-sm text-blue-100/90 font-medium italic mt-2 max-w-2xl hidden sm:block">
                  A Personal Reflection from CEDEXX Founder Daisy Gonzalez
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
                    Daisy Gonzalez
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Founder & CEO, CEDEXX
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-400 italic">
                Estimated read: 4 minutes
              </span>
            </div>

            {/* September Full Article Content */}
            <div className="p-6 sm:p-12 text-slate-700 leading-relaxed text-base sm:text-lg font-medium space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#050249] text-white shadow-md relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#23d9b0]/15 rounded-full blur-2xl" />
                <Quote className="h-8 w-8 text-[#23d9b0] mb-3 opacity-80" />
                <p className="text-lg sm:text-2xl font-black italic leading-snug tracking-tight text-[#23d9b0]">
                  "My first purpose is to share Christ. Everything else I do flows from that."
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed pt-2">
                At CEDEXX, we talk a lot about wellness, making healthcare accessible, caring for the whole person, and helping families live healthier lives. Through my own journey, I have learned that true wellness goes far deeper than the physical body.
              </p>

              <p className="text-slate-600 leading-relaxed">
                We are more than our physical health. We have a mind that needs renewal, a heart that needs encouragement, and a spirit that longs for something this world cannot give on its own. For me, that answer is Jesus Christ.
              </p>

              <div className="my-8 p-6 sm:p-8 rounded-2xl bg-[#eff6ff] border-l-4 border-blue-600 shadow-sm">
                <p className="text-lg sm:text-xl font-bold text-[#050249] italic mb-2">
                  "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers."
                </p>
                <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-blue-600">
                  <span>3 John 1:2</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium italic mt-3 pt-3 border-t border-blue-200/60">
                  That verse captures what I believe deeply: our physical well-being matters, and so does the condition of our soul.
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Life can be demanding. We all walk through stress, uncertainty, disappointment, and loss, seasons when you simply feel tired. In those moments, God's Word offers something beyond temporary comfort. It points us toward hope, peace, restoration, and enduring truth.
              </p>

              <div className="my-8 p-6 sm:p-8 rounded-2xl bg-[#f0fdf4] border-l-4 border-emerald-600 shadow-sm">
                <p className="text-lg sm:text-xl font-bold text-[#166534] italic mb-2">
                  "And do not be conformed to this world, but be transformed by the renewing of your mind."
                </p>
                <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-700">
                  <span>Romans 12:2</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium italic mt-3 pt-3 border-t border-emerald-200/60">
                  That daily renewal is what I want to encourage in your life.
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Taking care of ourselves means seeking timely medical care, looking after our bodies, making healthy choices, building strong relationships, and protecting our mental well-being. I also believe there is something transformative about beginning each day by turning our hearts and minds toward God.
              </p>

              <div className="h-px w-full bg-slate-100 my-8" />

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-[#050249] uppercase italic tracking-tight flex items-center gap-2">
                  <Heart className="h-6 w-6 text-[#23d9b0] fill-current" />
                  A Moment of Encouragement
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  Throughout our journal, we share Scripture centered on wellness, wholeness, renewal of the mind, strength, peace, hope, and faith:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    'Some days bring a verse about healing.',
                    'Others remind us to rest.',
                    'Some challenge how we think.',
                    'And others remind us that God is with us.',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-[#23d9b0] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="my-6 p-6 sm:p-8 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                  <p className="text-lg sm:text-2xl font-black text-amber-950 italic mb-2">
                    "Come to Me, all you who labor and are heavy laden, and I will give you rest."
                  </p>
                  <p className="text-xs sm:text-sm font-black text-amber-800 uppercase tracking-widest">
                    Matthew 11:28
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-2 uppercase tracking-wider">
                    That invitation is open to everyone.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-slate-600 font-medium italic">With faith and gratitude,</p>
                <h4 className="text-xl font-black text-[#050249] uppercase tracking-tight italic mt-1">
                  Daisy Gonzalez
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Founder & CEO, CEDEXX
                </p>
                <p className="text-sm font-bold text-blue-700 italic mt-4 bg-blue-50/60 inline-block px-4 py-2 rounded-xl border border-blue-100">
                  "He restores my soul." • Psalm 23:3
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 flex items-center gap-4 border-t border-white/5">
              <Shield className="h-4 w-4 text-blue-400 opacity-60 shrink-0" />
              <p className="text-[10px] text-blue-200/50 uppercase tracking-widest font-black italic">
                Legal Notice: CEDEXX is a technology and wellness membership platform powered by Lyric Health, not a medical provider. Blog reflections represent personal faith and wellness encouragement and do not constitute medical diagnosis or clinical treatment.
              </p>
            </div>
          </article>
        )}

        {/* Shared Scripture Subscribe Card Below Featured Reflection */}
        <div className="mt-10 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#050249] to-blue-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#23d9b0]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#23d9b0] bg-white/10 px-3 py-1 rounded-full border border-white/15">
              Seasonal & Scripture Reflections
            </span>
            <h3 className="text-xl sm:text-3xl font-black mt-3 mb-2 uppercase italic tracking-tight">
              Receive Personal Reflections & Encouragement
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/80 font-medium leading-relaxed mb-6">
              If you would like to receive periodic notes of encouragement and Scripture from CEDEXX, you are welcome to subscribe. Each message shares a short reflection focused on faith, family wellness, and peace of mind.
            </p>

            {scriptureSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-medium flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Thank you for subscribing! May these reflections bring peace, strength, and encouragement to your week.</span>
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
                      <span>Subscribe to Reflections</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── CLINICAL & INDUSTRY ARTICLES LIST ── */}
      <section className="py-24 bg-slate-50 mt-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto mb-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">
              Founder Reflections & Clinical Insights
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#050249] mt-3 uppercase italic tracking-tight">
              More From The CEDEXX Journal
            </h2>
            <p className="text-sm text-slate-500 font-medium italic mt-1">
              Explore our founder reflections, clinical research, telemedicine guides, and family health resources.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {POSTS.map((post) => (
              <Card
                key={post.id}
                onClick={() => {
                  if (post.isFounderArticle) {
                    setActiveFounderPost(activeFounderPost === 'fall-2026' ? 'september-2026' : 'fall-2026');
                    window.scrollTo({ top: 280, behavior: 'smooth' });
                  }
                }}
                className={`p-0 overflow-hidden bg-white border-none shadow-xl rounded-[2.5rem] group hover:shadow-2xl transition-all ${
                  post.isFounderArticle ? 'cursor-pointer ring-2 ring-[#23d9b0]/40' : ''
                }`}
              >
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
                        {post.isFounderArticle ? <BookOpen className="h-4 w-4 text-[#050249]" /> : <User className="h-4 w-4" />}
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
              Articles on this blog are for informational and inspirational purposes only and do not constitute formal medical advice, diagnosis, or clinical prescription. Always seek the advice of your physician or qualified telehealth provider through your Lyric Health portal with any clinical questions.
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
            Receive monthly wellness insights, family health tips, and personal reflections directly in your inbox.
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
