import React from 'react';
import { motion } from 'motion/react';
import { XCircle, Home, ArrowLeft, HelpCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PaymentCancel() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-24 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-red-50 mb-8">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#050249] mb-6 tracking-tight italic uppercase">
            Payment <span className="text-red-400">Cancelled</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">
            Your enrollment was not completed. No charges were made. You can restart the process whenever you are ready.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-[3rem] p-10 shadow-2xl border border-blue-50 mb-10"
        >
          <h3 className="text-xl font-black text-[#050249] mb-6 italic uppercase tracking-tighter">Common Reasons</h3>
          <div className="space-y-4">
            {[
              'You closed the checkout window before completing payment',
              'Your card was declined — try a different payment method',
              'You need more time to decide — that is completely okay',
              'You have questions about the plan and want to speak with our team first',
            ].map((reason, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50">
                <HelpCircle className="h-5 w-5 text-[#050249] shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-slate-600 italic">{reason}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/enroll"
            className="inline-flex items-center justify-center gap-2 bg-[#050249] text-white font-black py-4 px-10 rounded-2xl hover:bg-[#03013b] transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base uppercase tracking-tighter italic"
          >
            <CreditCard className="h-5 w-5" />
            Try Again
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#050249] font-black py-4 px-10 rounded-2xl border-2 border-slate-100 hover:border-[#050249] transition-all text-base uppercase tracking-tighter italic"
          >
            <Home className="h-5 w-5" />
            Return Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <a
            href="mailto:support@cedexx.net"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#050249] hover:text-[#23d9b0] transition-colors italic"
          >
            <ArrowLeft className="h-4 w-4" />
            Need help? Contact our support team
          </a>
        </motion.div>
      </div>
    </div>
  );
}
