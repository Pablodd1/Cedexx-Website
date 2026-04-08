import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, Input, Card } from './ui';

export const PasswordGate = ({ children }: { children: React.ReactNode }) => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('pitch_authorized');
    if (saved === 'true') setIsAuthorized(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'cedexx2026') {
      setIsAuthorized(true);
      localStorage.setItem('pitch_authorized', 'true');
    } else {
      setError('Incorrect password. Please contact the Cedexx team.');
    }
  };

  if (isAuthorized) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#050249] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-dark p-8 md:p-12 border-white/20 text-white shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="h-20 w-20 bg-blue-600/30 rounded-3xl flex items-center justify-center border border-white/20 mb-6 group cursor-pointer hover:scale-110 transition-transform">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-black italic mb-4 uppercase tracking-tighter">Secure Investor Access</h1>
            <p className="text-blue-100/60 font-medium leading-relaxed italic">
              This page contains confidential financial projections and market data. Please enter the password provided in your investor invitation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 h-14 rounded-2xl px-6 focus:ring-emerald-500/50"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-bold mt-2 ml-1"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 border-none font-black text-lg h-14 rounded-2xl group">
              Access Deck
              <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-blue-200/40 text-[10px] font-black uppercase tracking-[0.3em]">
              <ShieldCheck className="h-4 w-4" />
              Enterprise Encryption
            </div>
            <p className="text-[10px] text-blue-200/30 text-center italic">
              Access is monitored for security purposes. Unauthorized distribution of this content is prohibited.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
