import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Home, ArrowRight, Shield, Users, Heart, Clock } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-24 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-[#23d9b0]/10 mb-8">
            <CheckCircle2 className="h-12 w-12 text-[#23d9b0]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#050249] mb-4 tracking-tight italic uppercase">
            Welcome to <span className="text-[#23d9b0]">CEDEXX</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-lg text-slate-500 font-medium italic">powered by</span>
            <img src="/images/lyric-logo.png" alt="Lyric Health" className="h-8 md:h-10 object-contain" />
          </div>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">
            Your enrollment is complete and your membership is now active. You have immediate access to 24/7 care.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-[3rem] p-10 shadow-2xl border border-blue-50"
          >
            <h3 className="text-2xl font-black text-[#050249] mb-6 italic uppercase tracking-tighter">What Happens Next</h3>
            <ul className="space-y-5">
              {[
                { icon: Shield, text: 'Check your email for confirmation and onboarding instructions' },
                { icon: Users, text: 'Download the CEDEXX member app using the link in your email' },
                { icon: Heart, text: 'Set up your profile and add any dependents to your plan' },
                { icon: Clock, text: 'Start using 24/7 care immediately — no waiting period' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-600 italic">
                  <item.icon className="h-5 w-5 text-[#050249] shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-[#050249] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/20 rounded-full blur-2xl" />
            <h3 className="text-2xl font-black mb-6 italic uppercase tracking-tighter">Member Support</h3>
            <p className="text-blue-100 font-medium text-sm italic mb-8 leading-relaxed">
              Our Member Success team is available to help you get started. Reach out anytime for assistance with your account, app setup, or care navigation.
            </p>
            <div className="space-y-3">
              <a href="mailto:support@cedexx.net" className="flex items-center gap-3 text-sm font-bold text-blue-100 hover:text-white transition-colors">
                <span className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-sm">@</span>
                support@cedexx.net
              </a>
              <a href="tel:954-624-6744" className="flex items-center gap-3 text-sm font-bold text-blue-100 hover:text-white transition-colors">
                <span className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-sm">T</span>
                954-624-6744
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#050249] text-white font-black py-4 px-10 rounded-2xl hover:bg-[#03013b] transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base uppercase tracking-tighter italic"
          >
            <Home className="h-5 w-5" />
            Return Home
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#050249] font-black py-4 px-10 rounded-2xl border-2 border-slate-100 hover:border-[#050249] transition-all text-base uppercase tracking-tighter italic"
          >
            Explore Services
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>

        {sessionId && (
          <p className="text-center text-xs text-slate-400 mt-8 font-medium">
            Session ID: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
}
