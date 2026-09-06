import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Globe, X, Bot, Mic, Phone } from 'lucide-react';
import { Chatbot } from './Chatbot';
import { VoiceAssistant } from './VoiceAssistant';

export function SupportHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'menu' | 'chat' | 'voice'>('menu');

  const contactOptions = [
    { 
      id: 'phone', 
      label: 'Call 24/7 Support', 
      icon: Phone, 
      desc: '(754) 432-2201',
      onClick: () => window.location.href = 'tel:+17544322201'
    },
    { 
      id: 'chat', 
      label: 'Chat with JasDex', 
      icon: MessageSquare, 
      desc: 'Instant AI Support',
      onClick: () => setActiveMode('chat')
    },
    { 
      id: 'voice', 
      label: 'Voice call', 
      icon: Mic, 
      desc: 'JasDex Voice Desk',
      onClick: () => setActiveMode('voice')
    },
    { 
      id: 'email', 
      label: 'Email Support', 
      icon: Mail, 
      desc: 'support@cedexx.net',
      onClick: () => window.location.href = 'mailto:support@cedexx.net'
    },
    { 
      id: 'website', 
      label: 'Visit Website', 
      icon: Globe, 
      desc: 'cedexx.net',
      onClick: () => window.open('https://cedexx.net', '_blank')
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-end justify-center px-4 pb-4 md:pb-0 md:justify-end">
      
      {/* ── Hub Content ── */}
            <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-6 w-full max-w-md bg-white shadow-[0_30px_100px_rgba(5,2,73,0.2)] rounded-[2.5rem] border border-slate-100 overflow-hidden md:w-80 pointer-events-auto"
            >
            {activeMode === 'menu' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                   <div>
                     <h4 className="text-[#050249] font-black text-2xl tracking-tighter uppercase italic">Cedexx <span className="text-blue-500">Hub</span></h4>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">JasDex — 24/7 Digital Assistant</p>
                   </div>
                   <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                     <Bot className="h-6 w-6 text-blue-600" />
                   </div>
                </div>

                <div className="space-y-4">
                  {contactOptions.map(opt => (
                    <motion.button
                      key={opt.id}
                      whileHover={{ x: 5 }}
                      onClick={opt.onClick}
                      className="w-full group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left border border-transparent hover:border-slate-200"
                    >
                      <div className="h-12 w-12 rounded-[1rem] bg-[#050249] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <opt.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[#050249] font-black text-sm uppercase tracking-wider">{opt.label}</p>
                        <p className="text-slate-400 text-xs font-medium">{opt.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {activeMode === 'chat' && (
            <div className="relative h-[78vh] min-h-[420px] w-full">
                <button 
                  onClick={() => setActiveMode('menu')}
                  className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-xl text-[#050249] hover:bg-white text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm"
                >
                  ← Support Hub
                </button>
                <Chatbot inline />
              </div>
            )}

            {activeMode === 'voice' && (
              <div className="relative h-[250px] flex items-center justify-center bg-[#050249] text-white overflow-hidden p-8 text-center">
                <button 
                  onClick={() => setActiveMode('menu')}
                  className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md p-2 rounded-xl text-white hover:bg-white/20 text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-sm"
                >
                  ← Support Hub
                </button>
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 bg-blue-500/20 rounded-full flex items-center justify-center ring-8 ring-blue-500/10 animate-pulse">
                    <Mic className="h-10 w-10 text-blue-400" />
                  </div>
                  <h5 className="font-black italic text-xl">JasDex Voice Support</h5>
                  <p className="text-blue-200/60 text-xs font-medium">Connecting you to JasDex, our AI Front Desk...</p>
                  <VoiceAssistant inline />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle Button ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setActiveMode('menu');
        }}
        className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ring-2 ring-white/20 pointer-events-auto ${
          isOpen ? 'bg-red-500 text-white' : 'bg-[#050249] text-white'
        }`}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
      </motion.button>

    </div>
  );
}
