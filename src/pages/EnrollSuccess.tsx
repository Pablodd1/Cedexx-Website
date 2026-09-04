import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Mail, Download, ExternalLink, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function EnrollSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollment, setEnrollment] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found. Please contact support.');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stripe/checkout-status?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success && data.status === 'paid') {
          setEnrollment(data);
        } else {
          setError('Payment verification pending. Please check your email for confirmation.');
        }
      } catch (err) {
        setError('Unable to verify payment. Please contact support at support@cedexx.net');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#050249] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#050249] italic">Confirming Payment...</h2>
          <p className="text-slate-500 mt-2">Please wait while we verify your enrollment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-24 font-sans">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[3rem] shadow-2xl border border-blue-50 p-10 md:p-16 text-center"
        >
          <div className="h-20 w-20 bg-[#23d9b0] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-[#050249] mb-4 italic uppercase tracking-tighter">
            Enrollment Complete!
          </h1>
          <p className="text-lg text-slate-500 mb-8">
            Thank you for choosing <strong>CEDEXX — Better Care. Here. Now.</strong>
          </p>

          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-amber-700 text-sm">
              <AlertCircle className="h-5 w-5 inline mr-2" />
              {error}
            </div>
          )}

          <div className="bg-[#EBF3FB] rounded-2xl p-6 mb-8 text-left border border-blue-50">
            <h3 className="font-black text-[#050249] text-sm uppercase tracking-widest mb-4">What Happens Next?</h3>
            <ol className="space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#050249] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span><strong>Allow 24–48 Hours for Activation</strong><br/>Your membership is being prepared for activation through the Lyric Health app.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#050249] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span><strong>Download the Lyric Health App</strong><br/>Download the app on your mobile device.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#050249] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span><strong>Locate Your Membership</strong><br/>Open the app and select the link at the bottom right, next to "First Time User?" to locate your membership.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#050249] text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span><strong>Verify Your Account</strong><br/>Enter your Last Name, Date of Birth, and ZIP Code.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#050249] text-white flex items-center justify-center text-xs font-bold shrink-0">5</span>
                <span><strong>Check Your Email</strong><br/>You'll receive additional instructions to complete your registration.</span>
              </li>
            </ol>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 text-[#050249]">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-medium">A confirmation email has been sent to you with detailed instructions.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://apps.apple.com/us/app/lyric-health/id1547361165"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#050249] text-white font-black py-4 px-8 rounded-2xl hover:bg-[#03013b] transition-all shadow-xl text-sm uppercase tracking-tighter italic"
            >
              <Download className="h-5 w-5" />
              Download Lyric Health
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#050249] font-black py-4 px-8 rounded-2xl border-2 border-[#050249] hover:bg-[#EBF3FB] transition-all text-sm uppercase tracking-tighter italic"
            >
              <ExternalLink className="h-5 w-5" />
              Back to Home
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400">
              Questions? Contact us at{' '}
              <a href="mailto:support@cedexx.net" className="text-[#050249] font-medium hover:underline">support@cedexx.net</a>
              {' '}or call{' '}
              <a href="tel:754-432-2201" className="text-[#050249] font-medium hover:underline">(754) 432-2201</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
