import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Phone, X, Bot, Mic } from 'lucide-react';
import { Chatbot } from './Chatbot';
import { VoiceAssistant } from './VoiceAssistant';

export function SupportHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'menu' | 'chat' | 'voice'>('menu');

  const contactOptions = [
    { 
      id: 'chat', 
      label: 'Text / Chat', 
      icon: MessageSquare, 
      desc: 'Instant AI Support',
      onClick: () => setActiveMode('chat')
    },
    { 
      id: 'voice', 
      label: 'Voice call', 
      icon: Mic, 
      desc: 'AI Voice Assistant',
      onClick: () => setActiveMode('voice')
    },
    { 
      id: 'email', 
      label: 'Email Support', 
      icon: Mail, 
      desc: 'info@cedexx.net',
      onClick: () => window.location.href = 'mailto:info@cedexx.net'
    },
    { 
      id: 'call', 
      label: 'Immediate call', 
      icon: Phone, 
      desc: '954-624-6744',
      onClick: () => window.location.href = 'tel:9546246744'
    }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-80 bg-white shadow-[0_30px_100px_rgba(5,2,73,0.2)] rounded-[2.5rem] border border-slate-100 overflow-hidden"
          >
            {activeMode === 'menu' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                   <div>
                     <h4 className="text-[#050249] font-black text-2xl tracking-tighter uppercase italic">Cedexx <span className="text-blue-500">Hub</span></h4>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">24/7 Digital Assistant</p>
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
              <div className="relative h-[500px]">
                <button 
                  onClick={() => setActiveMode('menu')}
                  className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-xl text-[#050249] hover:bg-white text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm"
                >
                  Back
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
                  Back
                </button>
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 bg-blue-500/20 rounded-full flex items-center justify-center ring-8 ring-blue-500/10 animate-pulse">
                    <Mic className="h-10 w-10 text-blue-400" />
                  </div>
                  <h5 className="font-black italic text-xl">Cedexx Voice Support</h5>
                  <p className="text-blue-200/60 text-xs font-medium">AI Voice Assistant</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setActiveMode('menu');
        }}
        className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ring-2 ring-white/20 ${
          isOpen ? 'bg-red-500 text-white' : 'bg-[#050249] text-white'
        }`}
      >
        {isOpen ? <X className="h-8 w-8 text-white" /> : <MessageSquare className="h-8 w-8 text-white" />}
      </motion.button>

    </div>
  );
}
