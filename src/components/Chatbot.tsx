import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Mic, MicOff, Volume2, VolumeX, Phone } from 'lucide-react';
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
IMPORTANT: Respond in PLAIN TEXT only. No markdown. Keep it conversational and natural. Keep responses short — 2-3 sentences max.`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

const FALLBACK_RESPONSES: Record<string, string> = {
  'hello': "Hey there! How can I help you today? I can tell you about our services, pricing, or enrollment.",
  'hi': "Hi! Welcome to Cedexx. What can I help you with today?",
  'pricing': "We offer two plans: Individual at $14.99/month and Family at $27.99/month for up to 4 members. No insurance needed!",
  'price': "We offer two plans: Individual at $14.99/month and Family at $27.99/month for up to 4 members. No insurance needed!",
  'cost': "We offer two plans: Individual at $14.99/month and Family at $27.99/month for up to 4 members. No insurance needed!",
  'how does it work': "It's simple: you connect through our platform, an independent licensed provider joins in minutes, and you get real-time care. No insurance, no waiting rooms!",
  'services': "We offer 24/7 telemedicine, mental wellness support, and digital prescriptions sent to your local pharmacy. All through our platform!",
  'contact': "You can reach us at info@cedexx.net or call 954-624-6744. We're here to help!",
  'phone': "You can call us at 954-624-6744 or email info@cedexx.net.",
  'prescription': "Providers on our platform can send prescriptions directly to your local pharmacy. No controlled substances though.",
  'insurance': "No insurance needed! Cedexx works without insurance. Our plans are affordable monthly memberships.",
  'who are you': "I'm Cedex, the AI front desk virtual assistant for Cedexx. I can answer questions about our services, pricing, enrollment, and more!",
  'what is cedexx': "Cedexx is a technology platform connecting families to independent telemedicine providers. 24/7 access, no insurance needed, affordable monthly plans.",
};

function getFallbackResponse(input: string): string | null {
  const lower = input.toLowerCase().trim();
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return null;
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const greetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const loadVoices = () => {
      const voices = synthRef.current?.getVoices() || [];
      if (voices.length > 0) voicesRef.current = voices;
    };
    loadVoices();
    synthRef.current?.addEventListener('voiceschanged', loadVoices);
    return () => synthRef.current?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // Init Gemini chat
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.log('Gemini API key not configured — using fallback responses');
      return;
    }
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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  // Auto-greet
  useEffect(() => {
    if (!isOpen || isMinimized || hasAutoGreeted) return;
    greetTimerRef.current = setTimeout(() => {
      const greeting: Message = {
        role: 'model',
        text: "Hey there! How may I assist you today? I'm Cedex, your AI front desk virtual assistant. I can answer all your questions about Cedexx — our services, pricing, enrollment, or anything else. You can type your question or click the microphone to speak with me. What can I help you with?",
      };
      setMessages([greeting]);
      setHasAutoGreeted(true);
      // Speak after a short delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          speak(greeting.text);
        });
      });
    }, 3000);
    return () => { if (greetTimerRef.current) clearTimeout(greetTimerRef.current); };
  }, [isOpen, isMinimized, hasAutoGreeted]);

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled || !synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const cleanText = text.replace(/[*#_~`]/g, '').replace(/\n+/g, '. ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Use cached voices or get fresh ones
    let voices = voicesRef.current;
    if (voices.length === 0) {
      voices = synthRef.current.getVoices();
    }

    // Pick best English voice
    const preferred =
      voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices.find(v => v.name.includes('Samantha') && v.lang.startsWith('en')) ||
      voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];

    if (preferred) {
      utterance.voice = preferred;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.warn('Speech error:', e.error);
      setIsSpeaking(false);
    };

    // Small delay to ensure browser is ready
    setTimeout(() => {
      synthRef.current?.speak(utterance);
    }, 100);
  }, [isVoiceEnabled]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText('');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) setInterimText(interim);
      if (finalTranscript) {
        setInput(finalTranscript.trim());
        setInterimText('');
        setIsListening(false);
        // Auto-send after voice input
        setTimeout(() => handleSend(finalTranscript.trim()), 500);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimText('');
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (manualText?: string) => {
    const text = (manualText || input).trim();
    if (!text) return;
    setInput('');
    setInterimText('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    stopSpeaking();

    // Try Gemini first, fallback to local responses
    if (chatRef.current) {
      setIsLoading(true);
      try {
        const res = await chatRef.current.sendMessage({ message: text });
        let reply = res.text || "Sorry, could you rephrase that?";
        reply = reply.replace(/\*+/g, '').trim();
        setMessages(prev => [...prev, { role: 'model', text: reply }]);
        speak(reply);
        return;
      } catch (err) {
        console.warn('Gemini error, using fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }

    // Fallback responses
    setIsLoading(true);
    setTimeout(() => {
      const fallback = getFallbackResponse(text);
      const reply = fallback || `Thanks for your message! I'm a basic assistant right now. For detailed help, email info@cedexx.net or call 954-624-6744.`;
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      speak(reply);
      setIsLoading(false);
    }, 800);
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
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300", isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-white/20")}>
              <Bot className={cn("h-4 w-4", isSpeaking ? "text-[#050249]" : "text-white")} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Cedex — AI Receptionist</p>
              <div className="flex items-center gap-1">
                <span className={cn("h-1.5 w-1.5 rounded-full transition-all", isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-emerald-400")} />
                <span className={cn("text-[10px] transition-all", isSpeaking ? "text-emerald-300 font-semibold" : "text-blue-200")}>
                  {isSpeaking ? "Speaking..." : isVoiceEnabled ? "Text or Voice" : "Voice muted"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className={cn("p-1.5 rounded transition-colors", isVoiceEnabled ? "text-white bg-white/10" : "text-blue-300 hover:text-white")}
              title={isVoiceEnabled ? "Mute voice" : "Enable voice"}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4 animate-pulse" /> : isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button onClick={() => setIsMinimized(!isMinimized)} className="text-blue-200 hover:text-white p-1 rounded transition-colors">
              <Minimize2 className="h-4 w-4" />
            </button>
            <button onClick={() => { setIsOpen(false); stopSpeaking(); }} className="text-blue-200 hover:text-white p-1 rounded transition-colors">
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
                <p className="text-xs text-slate-300 mt-1">Type or use the microphone</p>
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

            {interimText && (
              <div className="flex gap-2 justify-end">
                <div className="px-3 py-2 rounded-2xl max-w-[80%] text-sm bg-slate-200 text-slate-500 italic rounded-br-none">
                  {interimText}
                </div>
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
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                isListening ? "bg-red-500 text-white animate-pulse scale-110" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
              title={isListening ? "Tap to stop" : "Tap to speak"}
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
            <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="h-10 w-10 rounded-xl bg-[#050249] text-white flex items-center justify-center hover:bg-[#03013b] disabled:opacity-40 transition-colors flex-shrink-0">
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
