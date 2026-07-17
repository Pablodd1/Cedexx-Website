import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Shield, AlertCircle, CheckCircle2, Mail, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

export function DeleteMyData() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!confirmed) {
      setError('You must confirm that you want your data deleted.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSuccess(true);
        setEmail('');
        setReason('');
        setConfirmed(false);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          {...fadeIn}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
            <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
              <Trash2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-2">Delete My Data</h1>
              <p className="text-slate-500">Exercise your right to erasure (GDPR / CCPA)</p>
            </div>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-6 py-8"
            >
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">Request Received</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  We have received your data deletion request. If we have a record associated with your email, it will be permanently removed from our systems within <strong className="text-emerald-900">72 hours</strong>.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full text-left">
                <p className="text-sm text-slate-500 mb-3 font-medium uppercase tracking-widest">What happens next?</p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    We will search our member database for any records matching your email.
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    If found, all personal data (name, phone, DOB, plan, payment history) will be permanently deleted.
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    A confirmation email will be sent once deletion is complete (or if no records are found).
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    Anonymized analytics data (e.g., aggregate enrollment counts) may be retained for business intelligence.
                  </li>
                </ul>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#050249] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#03013b] transition-all"
              >
                Return to Home
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl text-sm text-blue-900 flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Under the <strong>GDPR</strong> and <strong>CCPA</strong>, you have the right to request the deletion of your personal data. We will process your request within 72 hours and notify you by email. Medical records held by our partner Lyric Health are governed by their HIPAA policies and must be requested separately.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#050249] uppercase tracking-widest flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <p className="text-xs text-slate-400">Enter the email address you used during enrollment. This is how we locate your record.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#050249] uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Reason for Deletion (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="No longer using the service, privacy concerns, or other reason..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="confirm-delete"
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="confirm-delete" className="text-sm text-slate-700 leading-relaxed">
                  I confirm that I want to permanently delete all personal data associated with this email address from Cedexx systems. I understand this action is irreversible and may affect any active memberships.
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm font-medium">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-6 w-6" /> Request Data Deletion
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 font-medium">
                Need help? Contact us at{' '}
                <a href="mailto:Daisy@Cedexx.net" className="text-emerald-600 hover:underline">
                  Daisy@Cedexx.net
                </a>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
