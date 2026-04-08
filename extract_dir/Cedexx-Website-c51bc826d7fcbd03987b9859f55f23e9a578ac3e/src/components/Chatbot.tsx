import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Mic, MicOff, Volume2 } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi there! I'm Cedex, your Cedexx AI Assistant. 👋\n\nI can help you learn about our affordable physician access for families, enrollment options, or connect you with our team. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

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

  const speak = (text: string) => {
    if (!isVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Try to find a premium/natural sounding voice
    const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')) && v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
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
      // Remove Markdown asterisks
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

  const formatText = (text: string) =>
    text.split('\n').map((line, i) => <p key={i} className={line === '' ? 'h-2' : ''}>{line}</p>);

  const chatbotUI = (
    <div className={cn(
      'bg-white flex flex-col overflow-hidden transition-all duration-300',
      inline ? 'h-full w-full' : cn('fixed right-6 rounded-2xl shadow-2xl z-50 border border-blue-100', isMinimized ? 'bottom-6 h-14 w-80 sm:w-96' : 'bottom-6 h-[520px] w-80 sm:w-96')
    )}>
      {/* Header (Hidden if inline) */}
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
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
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

          {/* Input */}
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

