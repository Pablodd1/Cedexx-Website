import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Mic, MicOff, Volume2, Phone, PhoneOff } from 'lucide-react';
import { cn } from './ui';
import { GoogleGenAI } from '@google/genai';

const FAMILY_SYSTEM_INSTRUCTION = `You are Cedex, a warm, professional, and highly knowledgeable AI Virtual Receptionist for Cedexx — a technology platform connecting families to independent telemedicine providers. No insurance needed.

MEMORY & CONTEXT:
- Remember everything the user tells you in this conversation (their name, questions).
- Reference earlier details naturally.
- If the user provides their name or email, acknowledge it warmly and remember it for the rest of the chat.

COMPANY KNOWLEDGE:
- Service: Cedexx is a technology platform connecting families to independent licensed providers. We do not provide medical care directly.
- Who We Serve: Families with kids, busy parents, and anyone seeking affordable, non-emergency healthcare access.
- Key Benefits: Provider access at your fingertips 24/7. No long wait times. Transparent pricing. HIPAA Secure.
- How It Works: (1) Connect in seconds → (2) Independent provider joins in minutes → (3) Consultation in real time.
- Pricing: Affordable monthly family plans.
- Prescriptions: Providers on our platform may prescribe directly to your local pharmacy. No controlled substances.
- Contact: info@cedexx.net or call 954-624-6744.
- Powered by Cedexx.

IMPORTANT DISCLAIMERS (use when relevant):
- Cedexx is NOT a healthcare provider. We are a technology platform.
- We do not provide medical advice, diagnoses, or treatment.
- All providers are independent contractors, not Cedexx employees.
- For medical emergencies, call 911 immediately.

APPOINTMENT / DEMO BOOKING:
- When a user wants to schedule a demo or speak with someone, ask for: Full Name, Email Address, and Facility Name.
- Once collected, tell them: "I've forwarded your details to our team. You'll receive a confirmation email at [their email] shortly."
- Format the collected info clearly in the chat as a summary card.

CALLBACK OFFER:
- If the user seems unsure, hesitant, or says they need to think about it, offer a callback.
- Say: "No problem at all! I can have our team call you back at your convenience. Would you like me to arrange that?"
- If they agree, collect their name and phone number, then confirm: "Perfect! Someone from our team will call you at [phone number] soon. Is there a preferred time?"

TONE: Friendly, professional, concise. Use simple lists instead of bullet points. Never give medical advice.
IMPORTANT: Respond in PLAIN TEXT only. DO NOT use markdown formatting (no **, *, #, etc.). Keep responses natural and conversational, as if speaking.
DISCLAIMER: Remind users that AI responses are informational only when medical questions arise.`;

interface Message {
  role: 'user' | 'model';
  text: string;
  isAppointment?: boolean;
  appointmentData?: { name: string; email: string; facility: string };
}

export function Chatbot({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(inline);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);
  const [showCallbackPrompt, setShowCallbackPrompt] = useState(false);
  const [callbackData, setCallbackData] = useState({ name: '', phone: '' });
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const autoGreetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return;
    try {
      const ai = new GoogleGenAI({ apiKey });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.0-flash',
        config: { systemInstruction: FAMILY_SYSTEM_INSTRUCTION },
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

    autoGreetTimerRef.current = setTimeout(() => {
      const greeting: Message = {
        role: 'model',
        text: "Hey there! 👋 How may I assist you today? I'm Cedex, your AI front desk virtual assistant. I can answer all your questions about Cedexx — our services, pricing, enrollment, or anything else. If you'd prefer, I can also arrange a callback and the owner himself will call you back. What can I help you with?",
      };
      setMessages([greeting]);
      setHasAutoGreeted(true);
      speak(greeting.text);

      callbackTimerRef.current = setTimeout(() => {
        setShowCallbackPrompt(true);
      }, 30000);
    }, 5000);

    return () => {
      if (autoGreetTimerRef.current) clearTimeout(autoGreetTimerRef.current);
      if (callbackTimerRef.current) clearTimeout(callbackTimerRef.current);
    };
  }, [isOpen, isMinimized, hasAutoGreeted]);

  const speak = (text: string) => {
    if (!isVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_~`]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Microsoft'))
      && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
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
    setShowCallbackPrompt(false);

    if (!chatRef.current) {
      const errorMsg = 'AI assistant is currently unavailable. Please email us at info@cedexx.net.';
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
      speak(errorMsg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await chatRef.current.sendMessage({ message: text });
      let reply = res.text || "I'm sorry, I didn't catch that. Could you rephrase?";
      reply = reply.replace(/\*+/g, '');
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      speak(reply);
    } catch {
      const errorMsg = 'Something went wrong. Please try again or email info@cedexx.net.';
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallbackSubmit = () => {
    if (!callbackData.name || !callbackData.phone) return;
    setCallbackSubmitted(true);
    const confirmMsg: Message = {
      role: 'model',
      text: `Perfect! Thank you, ${callbackData.name}. Someone from our team will call you at ${callbackData.phone} soon. Is there anything else I can help with?`,
    };
    setMessages(prev => [...prev, confirmMsg]);
    speak(confirmMsg.text);
    setCallbackData({ name: '', phone: '' });
    setTimeout(() => {
      setShowCallbackPrompt(false);
      setCallbackSubmitted(false);
    }, 5000);
  };

  const formatText = (text: string) =>
    text.split('\n').map((line, i) => <p key={i} className={line === '' ? 'h-2' : ''}>{line}</p>);

  const chatbotUI = (
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
                <span className="text-blue-200 text-[10px]">Online 24/7</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              title={isVoiceEnabled ? "Mute voice" : "Enable voice"}
              className={cn("p-1.5 rounded transition-colors", isVoiceEnabled ? "text-white bg-white/10" : "text-blue-300 hover:text-white")}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
            <button onClick={() => setIsMinimized(!isMinimized)} title="Minimize chat" className="text-blue-200 hover:text-white p-1 rounded transition-colors">
              <Minimize2 className="h-4 w-4" />
            </button>
            <button onClick={() => setIsOpen(false)} title="Close chat" className="text-blue-200 hover:text-white p-1 rounded transition-colors">
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
                <Bot className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Cedex will greet you in a moment...</p>
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

            {showCallbackPrompt && !callbackSubmitted && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#050249]" />
                  <p className="text-sm font-bold text-[#050249]">Want a callback?</p>
                </div>
                <p className="text-xs text-slate-600">Leave your details and the owner himself will call you back!</p>
                <input
                  type="text"
                  placeholder="Your name"
                  value={callbackData.name}
                  onChange={e => setCallbackData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-blue-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#050249]"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={callbackData.phone}
                  onChange={e => setCallbackData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-blue-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#050249]"
                />
                <button
                  onClick={handleCallbackSubmit}
                  disabled={!callbackData.name || !callbackData.phone}
                  className="w-full h-9 rounded-lg bg-[#050249] text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#03013b] disabled:opacity-40 transition-colors"
                >
                  <Phone className="h-3 w-3" /> Request Callback
                </button>
              </div>
            )}

            {showCallbackPrompt && callbackSubmitted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-2">
                <span className="text-emerald-600 text-lg">✓</span>
                <p className="text-xs text-emerald-700 font-medium">Callback requested! We'll call you soon.</p>
              </div>
            )}

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
              title="Speak your message"
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              <Mic className={cn("h-4 w-4", isListening && "animate-bounce")} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isListening ? "Listening..." : "Type a message..."}
              className="flex-1 h-10 rounded-xl border border-blue-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition"
            />
            <button onClick={() => handleSend()} title="Send message" disabled={isLoading || !input.trim()} className="h-10 w-10 rounded-xl bg-[#050249] text-white flex items-center justify-center hover:bg-[#03013b] disabled:opacity-40 transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center pb-2 px-3">
            AI responses are informational only and not medical advice.
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
          title="Chat with Cedex"
        >
          <MessageSquare className="h-6 w-6" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          )}
          <span className="absolute right-full mr-3 bg-white text-slate-800 px-2 py-1 rounded text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100">
            Chat with Cedex
          </span>
        </button>
      )}

      {(isOpen || inline) && chatbotUI}
    </>
  );
}
