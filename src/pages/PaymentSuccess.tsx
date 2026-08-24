import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Home, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-24 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-[#23d9b0]/10 mb-8">
            <CheckCircle2 className="h-12 w-12 text-[#23d9b0]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#050249] mb-4 tracking-tight uppercase">
            Welcome to CEDEXX
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-lg text-slate-500 font-medium italic">powered by</span>
            <img src="/images/lyric-logo.webp" alt="Lyric Health" className="h-8 md:h-10 object-contain" />
          </div>
          <p className="text-lg text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            You're on your way to immediate access to care. You will receive an email coming from Lyric (<a href="mailto:noreply@getlyric.com" className="text-[#050249] underline">noreply@getlyric.com</a>).
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-3xl p-10 shadow-xl border border-blue-50 mb-8"
        >
          <h2 className="text-2xl font-black text-[#050249] mb-6 uppercase tracking-tight">
            What Happens Next?
          </h2>
          <p className="text-slate-600 mb-6 font-medium">
            Follow these simple steps to access your benefits:
          </p>
          <ol className="space-y-6">
            <li className="flex flex-col gap-1">
              <span className="font-bold text-[#050249] text-base">1. Allow 24–48 Hours for Activation</span>
              <span className="text-slate-600 text-sm leading-relaxed">
                Please allow 24–48 hours for your membership to become accessible through the Lyric Health app.
              </span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-bold text-[#050249] text-base">2. Download the Lyric Health App from your App Store</span>
              <span className="text-slate-600 text-sm leading-relaxed">
                Download the Lyric Health app on your mobile device. Open the app and select the link at the bottom right, next to "First Time User?" to locate your membership.
              </span>
            </li>
          </ol>
          <p className="mt-8 text-slate-600 text-sm leading-relaxed">
            That's it! Once activated, you'll be ready to access your CEDEXX wellness benefits through Lyric Health.
          </p>
          <p className="mt-4 text-[#050249] font-bold text-sm">
            CEDEXX — Better Care. Here. Now.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-[#050249] text-white rounded-3xl p-10 shadow-xl mb-12"
        >
          <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Member Support</h3>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            Our Member Success team is available to help you get started. Reach out anytime for assistance.
          </p>
          <a
            href="mailto:support@cedexx.net"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-white transition-colors"
          >
            <span className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">@</span>
            support@cedexx.net
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#050249] text-white font-bold py-4 px-10 rounded-2xl hover:bg-[#03013b] transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm uppercase tracking-tight"
          >
            <Home className="h-5 w-5" />
            Return Home
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#050249] font-bold py-4 px-10 rounded-2xl border-2 border-slate-200 hover:border-[#050249] transition-all text-sm uppercase tracking-tight"
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
