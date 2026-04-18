import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function PartnerForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const roles = [
    'Hospitality Partner',
    'Affiliate Partner',
    'Housing / REIT Partner',
    'Physician'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  if (isSent) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[3rem] shadow-2xl border border-blue-100 text-center"
      >
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-3xl font-black text-[#050249] mb-4">Request Sent</h3>
        <p className="text-slate-600 font-medium">Thank you for your interest in CEDEXX. Our partnership team will contact you within one business day.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_30px_100px_rgba(5,2,73,0.1)] border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Full Name</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-900"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Email Address</label>
          <input
            required
            type="email"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-900"
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Phone Number</label>
          <input
            required
            type="tel"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-900"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">I am a...</label>
          <select
            required
            title="Select your role"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-900 appearance-none cursor-pointer"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="" disabled>Select your role</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">How can we help?</label>
        <textarea
          required
          rows={4}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-900 resize-none"
          placeholder="Tell us about your organization or interest in CEDEXX..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      <button
        disabled={isSubmitting}
        className="w-full bg-[#050249] hover:bg-[#03013b] text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-[#050249]/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
      >
        {isSubmitting ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            SEND REQUEST
            <span className="text-blue-400">→</span>
          </>
        )}
      </button>
    </form>
  );
}
