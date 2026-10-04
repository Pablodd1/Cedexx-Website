import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Home, ArrowRight, Loader2, ShieldCheck, HeartPulse } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface VerificationResult {
  success: boolean;
  member_id?: string;
  lyric_user_id?: string;
  plan?: string;
  name?: string;
  already_active?: boolean;
  activated?: boolean;
  error?: string;
}

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isFree = searchParams.get('free') === 'true';
  const planParam = searchParams.get('plan');

  const [verifying, setVerifying] = useState<boolean>(!!sessionId);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    let isMounted = true;
    const verify = async () => {
      try {
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();
        if (isMounted) {
          setVerifyResult(data);
          setVerifying(false);
        }
      } catch (err: any) {
        console.error('[PAYMENT SUCCESS VERIFY ERROR]', err);
        if (isMounted) {
          setVerifyResult({ success: false, error: err.message });
          setVerifying(false);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-24 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
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
            {isFree
              ? 'Your complimentary partner membership has been activated! Follow the instructions below to access your care benefits.'
              : "Thank you for your business! You're on your way to immediate access to care. Please follow the instructions below for your membership access."}
          </p>
        </motion.div>

        {/* Verification Status Card */}
        {sessionId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            {verifying ? (
              <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm flex items-center justify-center gap-3 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-[#050249]" />
                <span className="font-semibold text-sm">
                  Synchronizing membership & activating Lyric Health account...
                </span>
              </div>
            ) : verifyResult?.success ? (
              <div className="bg-[#f0fdf4] rounded-2xl p-6 border border-[#bbf7d0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#166534]/10 flex items-center justify-center text-[#166534]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#166534] text-sm uppercase tracking-wide">
                        Membership Confirmed & Active
                      </span>
                      <span className="bg-[#166534] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    </div>
                    <p className="text-xs text-[#15803d] font-medium mt-0.5">
                      {verifyResult.name ? `Account registered for ${verifyResult.name}. ` : ''}
                      {verifyResult.lyric_user_id
                        ? `Lyric Patient ID: #${verifyResult.lyric_user_id}`
                        : 'Lyric credentials queued for immediate clinical portal setup.'}
                    </p>
                  </div>
                </div>
                {verifyResult.member_id && (
                  <div className="text-right sm:border-l sm:border-[#bbf7d0] sm:pl-4">
                    <span className="text-[11px] uppercase font-bold text-slate-500 block">Member ID</span>
                    <span className="text-sm font-black text-[#050249]">{verifyResult.member_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
                <HeartPulse className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <span>
                  Payment captured successfully. Clinical record provisioning is processing in the background. If you need immediate assistance, call Lyric Member Services at 1-866-223-8831.
                </span>
              </div>
            )}
          </motion.div>
        )}

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
                Download the Lyric Health app on your mobile device.<br />
                Open the app and select the link at the bottom right, next to "First Time User?" to locate your membership.
              </span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-bold text-[#050249] text-base">3. Verify Your Account</span>
              <span className="text-slate-600 text-sm leading-relaxed">
                Enter your:<br />
                • Last Name<br />
                • Date of Birth<br />
                • ZIP Code (from your enrollment)
              </span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-bold text-[#050249] text-base">4. Check Your Email</span>
              <span className="text-slate-600 text-sm leading-relaxed">
                Once your account is located and verified, you will receive an email with additional information. Be sure to check spam for an email from noreply@getlyric.com.
              </span>
            </li>
          </ol>
          <p className="mt-8 text-slate-600 text-sm leading-relaxed">
            That's it! Once activated, you'll be ready to access your CEDEXX wellness benefits through Lyric Health. Upon completion of steps 1-4, please contact Lyric Health Member Services for assistance accessing your available services at <a href="tel:18662238831" className="text-[#050249] font-bold underline">1-866-223-8831</a>. If you have waited at least 48 hours and are still unable to locate or access your membership, please contact <a href="mailto:support@cedexx.net" className="text-[#050249] underline">support@cedexx.net</a> for assistance.
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
