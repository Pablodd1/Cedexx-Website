import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

export function VirtualReceptionist() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-20">
      <div className="bg-[#050249] rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full mb-8 border border-white/10">
            <Sparkles className="h-4 w-4 text-[#23d9b0]" />
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">AI Virtual Front Desk</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tighter">
            Talk to our Front Desk
          </h3>
          <p className="text-blue-200/60 font-medium mb-12 max-w-sm leading-relaxed italic">
            Experience the future of clinical support. Click below to start a secure voice consultation.
          </p>
          <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <Mic className="h-10 w-10 text-[#050249]" />
          </div>
          <p className="mt-8 text-[10px] text-blue-200/30 uppercase tracking-[0.3em] font-black italic">
            SECURE HIPAA-COMPLIANT VOICE PROTOCOL
          </p>
        </div>
      </div>
    </div>
  );
}
