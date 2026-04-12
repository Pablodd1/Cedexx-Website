import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Phone, Sparkles, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY || '');

export function VirtualReceptionist() {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "speaking" | "listening">("idle");

  useEffect(() => {
    vapi.on('call-start', () => {
      setIsActive(true);
      setStatus('speaking');
    });

    vapi.on('call-end', () => {
      setIsActive(false);
      setStatus('idle');
    });

    vapi.on('speech-start', () => setStatus('speaking'));
    vapi.on('speech-end', () => setStatus('listening'));

    vapi.on('error', (error) => {
      console.error('Vapi Error:', error);
      setIsActive(false);
      setStatus('idle');
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const toggleCall = () => {
    if (!isActive) {
      setStatus("connecting");
      // Start the Vapi call
      vapi.start({
        name: "Cedexx Front Desk Assistant",
        model: {
          provider: "custom-llm", 
          model: "moonshot-v1-8k",
          url: "https://cedexx-website.vercel.app/api/chat", 
          messages: [
            {
              role: "system",
              content: "You are the Cedexx Healthcare Virtual Front Desk. You are speaking to a customer. Be helpful, professional, and explain that you can help with 24/7 doctor access, prescriptions, and mental wellness coverage. Pricing is $14.99/mo individual, $27.99/mo family. Be concise. Respond using the Kimi AI engine for maximum speed."
            }
          ]
        },
        voice: {
          provider: "google",
          voiceId: "en-US-Neural2-F" 
        }
      });
    } else {
      vapi.stop();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-20">
      <div className="bg-[#050249] rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl border border-white/10 group">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#23d9b0]/10 blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full mb-8 border border-white/10">
            <Sparkles className="h-4 w-4 text-[#23d9b0]" />
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">AI Virtual Front Desk</span>
          </div>

          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tighter">
            {isActive ? "Connected to AI Receptionist" : "Talk to our Front Desk"}
          </h3>
          
          <p className="text-blue-200/60 font-medium mb-12 max-w-sm leading-relaxed italic">
            {isActive 
              ? "Hi, I'm your Cedexx virtual assistant. How can I help you today?"
              : "Experience the future of clinical support. Click below to start a secure voice consultation."}
          </p>

          {/* Voice Visualizer / Action Button */}
          <div className="relative mb-12">
            <AnimatePresence>
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: [1, 2, 2.5], 
                        opacity: [0.3, 0.1, 0] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.5,
                        ease: "easeOut"
                      }}
                      className="absolute w-24 h-24 rounded-full border-2 border-blue-400/30"
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            <button
              onClick={toggleCall}
              className={`relative h-32 w-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl group/btn ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white hover:scale-105 active:scale-95'
              }`}
            >
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isActive ? 'bg-red-400' : 'bg-blue-400'}`} />
              
              <AnimatePresence mode="wait">
                {status === "connecting" ? (
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-1"
                  >
                    {[0, 1, 2].map(i => (
                      <div 
                        key={i} 
                        className={`h-2 w-2 rounded-full bg-[#050249] animate-bounce ${i === 1 ? 'dot-bounce-1' : i === 2 ? 'dot-bounce-2' : ''}`} 
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={isActive ? "active" : "inactive"}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    {isActive ? (
                      <Phone className="h-10 w-10 text-white fill-white" />
                    ) : (
                      <Mic className="h-10 w-10 text-[#050249]" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          <div className="flex items-center gap-8 justify-center w-full">
            <div className="flex flex-col items-center gap-2 opacity-40">
              <Volume2 className="h-4 w-4 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Listen</span>
            </div>
            <div className="h-px flex-1 bg-white/10 max-w-[100px]" />
            <div className="flex flex-col items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${status === 'listening' ? 'bg-[#23d9b0] animate-pulse' : 'bg-white/20'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{status}</span>
            </div>
          </div>
        </div>

        {/* Technical Requirements Tooltip */}
        <div className="mt-12 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] text-blue-200/30 uppercase tracking-[0.3em] font-black italic">
            SECURE HIPAA-COMPLIANT VOICE PROTOCOL • ENCRYPTED GATEWAY
          </p>
        </div>
      </div>
    </div>
  );
}
