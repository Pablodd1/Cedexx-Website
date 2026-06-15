import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, Mail, CheckCircle, Loader2 } from 'lucide-react';

interface GuideCaptureProps {
  variant?: 'modal' | 'inline' | 'banner';
  onClose?: () => void;
}

export function GuideCapture({ variant = 'inline', onClose }: GuideCaptureProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/guide-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
      setEmail('');
      setFirstName('');
    } catch (err: any) {
      setError(err.message || 'Failed to send guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative"
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <GuideContent />
        </motion.div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-[#050249] py-4 px-6">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-3 text-white">
            <BookOpen className="h-5 w-5 text-[#23d9b0]" />
            <span className="font-bold text-sm">Get our free guide to help you get started</span>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#23d9b0] flex-1 sm:w-64"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-[#23d9b0] text-[#050249] font-bold text-sm hover:bg-[#1bc9a0] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Me the Guide'}
            </button>
          </form>
        </div>
        {error && <p className="text-red-300 text-xs text-center mt-2">{error}</p>}
        <AnimatePresence>
          {success && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[#23d9b0] text-xs text-center mt-2 font-bold"
            >
              ✓ Guide sent! Check your email.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#EBF3FB]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-blue-50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EBF3FB] flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-[#050249]" />
            </div>
            <GuideContent />
          </div>
        </motion.div>
      </div>
    </section>
  );

  function GuideContent() {
    return (
      <>
        <h3 className="text-2xl md:text-3xl font-black text-[#050249] mb-3 italic">
          Before You Go...
        </h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Get our free guide to help you get started with Cedexx virtual healthcare. Learn how to book your first visit, understand your options, and make the most of your membership.
        </p>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <CheckCircle className="h-12 w-12 text-[#23d9b0]" />
              <p className="text-[#050249] font-bold text-lg">Guide sent!</p>
              <p className="text-slate-500 text-sm">Check your inbox for your free Cedexx guide.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name (optional)"
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address *"
                    required
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#050249] hover:bg-[#03013b] text-white font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-[#050249]/20 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Me the Guide'
                )}
              </button>

              <p className="text-slate-400 text-xs text-center">
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </>
    );
  }
}
