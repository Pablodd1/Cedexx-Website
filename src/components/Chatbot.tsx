import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Mic, MicOff, Volume2, Phone } from 'lucide-react';
import { cn } from './ui';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are Cedex, a warm, friendly, and highly knowledgeable AI Virtual Receptionist for Cedexx — a technology platform connecting families to independent telemedicine providers. No insurance needed.

COMPANY KNOWLEDGE:
- Cedexx is a technology platform connecting families to independent licensed providers. We do NOT provide medical care directly.
- Who We Serve: Families with kids, busy parents, anyone seeking affordable non-emergency healthcare.
- Key Benefits: 24/7 provider access. No long wait times. Transparent pricing. HIPAA Secure.
- How It Works: Connect in seconds → Independent provider joins in minutes → Real-time consultation.
- Pricing: Individual $14.99/month, Family $27.99/month (up to 4 members).
- Prescriptions: Providers may prescribe to your local pharmacy. No controlled substances.
- Contact: info@cedexx.net or call 954-624-6744.
- Owned by Daisy Gonzalez (Founder) and Jasmel Acosta (CTO).
- Cedexx is a Miami-based Woman & Minority Business certified by Florida.

IMPORTANT DISCLAIMERS:
- Cedexx is NOT a healthcare provider. We are a technology platform.
- We do not provide medical advice, diagnoses, or treatment.
- All providers are independent contractors.
- For medical emergencies, call 911 immediately.

TONE: Warm, friendly, professional, concise. Speak naturally like a real receptionist. Never give medical advice.
IMPORTANT: Respond in PLAIN TEXT only. No markdown. Keep it conversational and natural.`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function Chatbot({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(inline);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const greetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return;
    try {
      const ai = new GoogleGenAI({ apiKey });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.0-flash',
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
    } catch (err) {
      console.error('Chatbot init failed:', err);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || isMinimized || hasAutoGreeted) return;
    greetTimerRef.current = setTimeout(() => {
      const greeting: Message = {
        role: 'model',
        text: "Hey there! How may I assist you today? I'm Cedex, your AI front desk virtual assistant. I can answer all your questions about Cedexx — our services, pricing, enrollment, or anything else. You can type your question or use the microphone to speak with me. What can I help you with?",
      };
      setMessages([greeting]);
      setHasAutoGreeted(true);
      speak(greeting.text);
    }, 5000);
    return () => { if (greetTimerRef.current) clearTimeout(greetTimerRef.current); };
  }, [isOpen, isMinimized, hasAutoGreeted]);

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_~`]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Microsoft'))
      && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [isVoiceEnabled]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (manualText?: string) => {
    const text = (manualText || input).trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);

    if (!chatRef.current) {
      const err = 'AI assistant unavailable. Email us at info@cedexx.net.';
      setMessages(prev => [...prev, { role: 'model', text: err }]);
      speak(err);
      return;
    }

    setIsLoading(true);
    try {
      const res = await chatRef.current.sendMessage({ message: text });
      let reply = res.text || "Sorry, could you rephrase that?";
      reply = reply.replace(/\*+/g, '');
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      speak(reply);
    } catch {
      const err = 'Something went wrong. Email info@cedexx.net.';
      setMessages(prev => [...prev, { role: 'model', text: err }]);
      speak(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) =>
    text.split('\n').map((line, i) => <p key={i} className={line === '' ? 'h-2' : ''}>{line}</p>);

  const chatUI = (
    <div className={cn(
      'bg-white flex flex-col overflow-hidden transition-all duration-300',
      inline ? 'h-full w-full' : cn('fixed right-6 rounded-2xl shadow-2xl z-50 border border-blue-100', isMinimized ? 'bottom-6 h-14 w-80 sm:w-96' : 'bottom-6 h-[520px] w-80 sm:w-96')
    )}>
      {!inline && (
        <div className="bg-[#050249] px-4 h-14 flex-shrink-0 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Cedex — AI Receptionist</p>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-blue-200 text-[10px]">Text or Voice</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={cn("p-1.5 rounded transition-colors", isVoiceEnabled ? "text-white bg-white/10" : "text-blue-300 hover:text-white")}
              title={isVoiceEnabled ? "Mute voice" : "Enable voice"}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
            <button onClick={() => setIsMinimized(!isMinimized)} className="text-blue-200 hover:text-white p-1 rounded transition-colors">
              <Minimize2 className="h-4 w-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white p-1 rounded transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {(!isMinimized || inline) && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.length === 0 && !hasAutoGreeted && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <Phone className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Cedex will greet you in a moment...</p>
                <p className="text-xs text-slate-300 mt-1">Type or use your microphone</p>
                <div className="flex gap-1 mt-3">
                  <span className="h-2 w-2 rounded-full bg-[#050249] animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#050249] animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#050249] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'model' && (
                  <div className="h-7 w-7 rounded-full bg-[#EBF3FB] border border-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-[#050249]" />
                  </div>
                )}
                <div className={cn(
                  'px-3 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#050249] text-white rounded-br-none'
                    : 'bg-white border border-blue-100 text-slate-700 rounded-bl-none shadow-sm'
                )}>
                  {formatText(msg.text)}
                </div>
                {msg.role === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="h-7 w-7 rounded-full bg-[#EBF3FB] border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3.5 w-3.5 text-[#050249]" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-blue-100 shadow-sm rounded-bl-none flex gap-1 items-center">
                  <span className="h-2 w-2 rounded-full bg-[#050249] animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#050249] animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#050249] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-blue-100 flex gap-2 items-center">
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
              title={isListening ? "Stop listening" : "Speak your message"}
            >
              <Mic className={cn("h-4 w-4", isListening && "animate-bounce")} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isListening ? "Listening..." : "Type or speak..."}
              className="flex-1 h-10 rounded-xl border border-blue-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition"
            />
            <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="h-10 w-10 rounded-xl bg-[#050249] text-white flex items-center justify-center hover:bg-[#03013b] disabled:opacity-40 transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center pb-2 px-3">
            AI responses are informational only. Not medical advice.
          </p>
        </>
      )}
    </div>
  );

  return (
    <>
      {!inline && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className={cn(
            'fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#050249] text-white shadow-xl flex items-center justify-center hover:bg-[#03013b] transition-all z-50 group',
            isOpen && !isMinimized && 'hidden'
          )}
          title="Chat or speak with Cedex"
        >
          <MessageSquare className="h-6 w-6" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          )}
          <span className="absolute right-full mr-3 bg-white text-slate-800 px-2 py-1 rounded text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100">
            Chat or Voice
          </span>
        </button>
      )}
      {(isOpen || inline) && chatUI}
    </>
  );
}
