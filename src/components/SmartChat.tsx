import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function SmartChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm the Cedexx Smart Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const { lang } = useLanguage();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          language: lang,
          provider: 'gemini',
          messages: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text
          })).concat({ role: 'user', content: input })
        }),
      });

      const data = await response.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.choices[0].message.content,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Gemini AI failed:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I'm currently having trouble connecting to the AI brain. Please try again or contact support@cedexx.net.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBotResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('price') || lower.includes('cost') || lower.includes('membership')) 
      return "Cedexx memberships start at $14.99/mo for individuals and $27.99/mo for families of 4. No insurance is needed!";
    if (lower.includes('doctor') || lower.includes('provider') || lower.includes('physician'))
      return "Our network includes independent licensed providers available 24/7. Most consultations happen in under 15 minutes.";
    if (lower.includes('enroll') || lower.includes('start') || lower.includes('join'))
      return "You can enroll right now! Click the 'Enroll Now' button in the menu to select your plan.";
    return "I'm here to help with questions about our telehealth services, pricing, or the platform. Would you like to schedule a demo?";
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        title="Open Smart Chat"
        className="fixed bottom-8 right-8 h-16 w-16 bg-[#050249] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[100] border border-white/10"
      >
        <MessageCircle className="h-7 w-7" />
        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/20 pointer-events-none" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 w-[90vw] md:w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl z-[100] flex flex-col overflow-hidden border border-blue-50"
          >
            {/* Header */}
            <div className="bg-[#050249] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#23d9b0]" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest italic">Smart Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] font-medium text-blue-200">Online & Encrypted</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
            >
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-[#050249] text-white rounded-br-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-blue-50 rounded-bl-none'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <span className="text-[9px] opacity-40 mt-2 block font-bold uppercase">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-blue-50 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bot is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form 
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition-all font-medium"
                />
                <button 
                  type="submit"
                  title="Send Message"
                  disabled={!input.trim()}
                  className="h-12 w-12 bg-[#050249] text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
              <p className="text-center text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
                Digital Assistant • HIPAA Compliant Environment
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
