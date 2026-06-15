import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Mic, Volume2, VolumeX } from 'lucide-react';
import { cn } from './ui';

const FAMILY_SYSTEM_INSTRUCTION = `You are Cedex, a warm, professional, and highly knowledgeable AI Virtual Receptionist for Cedexx — powered by Lyric Health, our exclusive telehealth partner. No insurance needed.

COMPANY KNOWLEDGE:
- Cedexx is powered by Lyric Health, a leading integrated virtual primary care platform
- Lyric Health offers: 24/7 Urgent Care, Primary Care, Mental Health, Dermatology, Virtual MSK, Care Navigation, Labs, and GLP-1 Weight Loss
- Lyric Health's nationwide network includes licensed physicians, pediatricians, dermatologists, psychiatrists, and therapists with 10+ years average experience
- Pricing: Individual $14.99/month, Family $34.99/month (up to 7 members)
- Contact: info@cedexx.net
- No insurance needed, HIPAA Secure through Lyric Health, 24/7 access
- How it works: Connect in seconds → Lyric Health provider joins in minutes → Real-time consultation via phone or video
- Prescriptions sent to your local pharmacy, digital work/school notes available

IMPORTANT DISCLAIMERS:
- Cedexx is NOT a healthcare provider — we are the technology platform. Lyric Health delivers all medical care.
- Lyric Health providers are part of their nationwide network
- For medical emergencies, call 911 immediately

TONE: Friendly, professional, concise. Keep responses short (2-3 sentences). No markdown formatting.`;

const FALLBACK_RESPONSES: Record<string, string> = {
  'hello': "Hi! Welcome to Cedexx powered by Lyric Health. I can help you with our virtual care plans, pricing, or answer any questions. What would you like to know?",
  'hi': "Hey there! Welcome to Cedexx powered by Lyric Health. How can I assist you today?",
  'pricing': "Our plans are simple: Individual $14.99/month or Family $34.99/month for up to 7 members. No insurance needed!",
  'price': "We offer two plans: Individual at $14.99/month and Family at $34.99/month. Both include 24/7 telemedicine access!",
  'cost': "Individual plan is $14.99/month, Family plan is $34.99/month. That's it - no hidden fees!",
  'enroll': "To enroll, visit our website or I can connect you with our team. Would you like me to schedule a call?",
  'signup': "To get started, visit our enrollment page or I can have our team contact you. Which do you prefer?",
  'services': "Through our partner Lyric Health, we offer 24/7 urgent care, primary care, mental health support, dermatology, virtual MSK, care navigation, labs, and GLP-1 weight loss — all via phone or video consultation.",
  'contact': "You can reach us at info@cedexx.net. We're here Mon-Fri for support!",
  'phone': "Email us at info@cedexx.net. We'd love to hear from you!",
  'insurance': "No insurance needed! Cedexx powered by Lyric Health works on a simple monthly membership. Just pay your plan fee and get access to Lyric's nationwide provider network.",
  'who are you': "I'm Cedex, your AI assistant for Cedexx — powered by Lyric Health. I can answer questions about our virtual care services, pricing, and help you get started!",
  'what is cedexx': "Cedexx is a healthcare technology platform powered by Lyric Health. We connect families to Lyric Health's integrated virtual care services including 24/7 urgent care, primary care, mental health, and more. No insurance required, affordable monthly plans.",
};

function getFallbackResponse(input: string): string | null {
  const lower = input.toLowerCase().trim();
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return null;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function Chatbot({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(inline);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi there! I'm Cedex, your Cedexx AI Assistant. 👋 I can help you learn about our affordable physician access for families, enrollment options, or connect you with our team. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interimText, setInterimText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const deepgramModuleRef = useRef<any>(null);
  const dgWsRef = useRef<any>(null);
  const micStreamRef = useRef<any>(null);
  const audioCtxRef = useRef<any>(null);
  const processorRef = useRef<any>(null);

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    const loadVoices = () => {
      const voices = synthRef.current?.getVoices() || [];
      if (voices.length > 0) {
        voicesRef.current = voices;
      }
    };
    
    loadVoices();
    synthRef.current?.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      synthRef.current?.removeEventListener('voiceschanged', loadVoices);
      synthRef.current?.cancel();
    };
  }, []);

// Deepgram streaming integration: lazy-load Deepgram SDK for production streaming
useEffect(() => {
  const key = (typeof window !== 'undefined') ? (import.meta.env.VITE_DEEPGRAM_API_KEY) : null;
  if (!key) return;
  (async () => {
    try {
      const mod = await import('@deepgram/sdk');
      deepgramModuleRef.current = mod;
      console.log('Deepgram SDK loaded (lazy)');
    } catch (err) {
      console.warn('Failed to load Deepgram SDK lazily', err);
    }
  })();
}, []);

  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-greeting after 5 seconds when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 1) {
      const timer = setTimeout(() => {
        const greeting = "Hi there! I'm Cedex, your Cedexx AI Assistant. 👋 I can help you learn about our affordable physician access for families, enrollment options, or connect you with our team. How can I help you today?";
        setMessages(prev => [...prev, { role: 'model', text: greeting }]);
        speak(greeting);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  // Callback offer after 60 seconds of inactivity
  useEffect(() => {
    if (!isOpen || messages.length < 2) return;
    
    const inactivityTimer = setTimeout(() => {
      const callbackMsg = "I haven't heard from you in a while. Would you like me to have our team call you back? Just leave your name and number, and we'll be in touch shortly!";
      setMessages(prev => [...prev, { role: 'model', text: callbackMsg }]);
      speak(callbackMsg);
    }, 60000);
    
    return () => clearTimeout(inactivityTimer);
  }, [isOpen, messages.length]);

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled || !synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Clean text
    const cleanText = text.replace(/[*#_~`]/g, '').replace(/\n+/g, '. ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Get voices
    let voices = voicesRef.current;
    if (voices.length === 0) {
      voices = synthRef.current.getVoices();
    }
    
    // Pick best English voice
    const preferredVoice = 
      voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices.find(v => v.name.includes('Samantha') && v.lang.startsWith('en')) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Small delay to ensure browser is ready
    setTimeout(() => {
      synthRef.current?.speak(utterance);
    }, 100);
  }, [isVoiceEnabled]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListeningDeepgram = async () => {
    const key = import.meta.env.VITE_DEEPGRAM_API_KEY;
    if (!key) {
      // Demo fallback
      setIsListening(true);
      setInterimText('Listening (demo)...');
      setTimeout(() => {
        const transcript = 'Demo spoken input';
        setInput(transcript);
        setInterimText('');
        setIsListening(false);
        handleSend(transcript);
      }, 1500);
      return;
    }
    // Production: WebSocket Deepgram streaming bridge
    try {
      const url = `wss://api.deepgram.com/v1/listen?access_token=${encodeURIComponent(key)}&interim_results=true&language=en-US`;
      const ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';
      dgWsRef.current = ws;
      ws.onopen = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          micStreamRef.current = stream;
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ac = new AudioCtx({ sampleRate: 16000 });
          audioCtxRef.current = ac;
          const source = ac.createMediaStreamSource(stream);
          const proc = ac.createScriptProcessor(4096, 1, 1);
          processorRef.current = proc;
          proc.onaudioprocess = (ev: any) => {
            const input = ev.inputBuffer.getChannelData(0);
            const out = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
              const s = Math.max(-1, Math.min(1, input[i]));
              out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            ws.send(out.buffer);
          };
          source.connect(proc);
          proc.connect(ac.destination);
          setIsListening(true);
          setInterimText('');
        } catch (err) {
          console.error('Deepgram mic setup error', err);
          ws.close();
        }
      };
      ws.onmessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : JSON.parse(new TextDecoder().decode(event.data));
          const transcript = data?.channel?.alternatives?.[0]?.transcript || data?.results?.[0]?.alternatives?.[0]?.transcript;
          if (transcript) {
            setInput(transcript);
          }
        } catch {
          // ignore non-JSON data
        }
      };
      ws.onerror = (err) => {
        console.error('Deepgram WS error', err);
        setInterimText('Listening (error)');
      };
      ws.onclose = () => {
        try { audioCtxRef.current?.close(); } catch {}
        micStreamRef.current?.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
        audioCtxRef.current = null;
        processorRef.current = null;
        setIsListening(false);
      };
      setIsListening(true);
      setInterimText('Listening with Deepgram...');
    } catch (err) {
      console.error('Deepgram streaming setup failed', err);
      // Fallback to demo
      setIsListening(true);
      setInterimText('Listening (demo)...');
      setTimeout(() => {
        const transcript = 'Demo spoken input';
        setInput(transcript);
        setInterimText('');
        setIsListening(false);
        handleSend(transcript);
      }, 1500);
    }
  };

  const toggleListening = () => {
    startListeningDeepgram();
  };

  const handleSend = async (manualText?: string) => {
    const text = (manualText || input).trim();
    if (!text) return;
    
    setInput('');
    setInterimText('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    stopSpeaking();

    setIsLoading(true);
    
    try {
      let response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          provider: 'kimi' // Use Kimi as primary
        })
      });
      // If primary provider fails, attempt backup provider
      if (!response.ok) {
        const backup = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: text }],
            provider: 'minimax' // Backup provider
          })
        });
        if (backup.ok) {
          response = backup;
        } else {
          throw new Error('API request failed');
        }
      }

      const data = await response.json();
      
      // Try to extract reply from different response formats
      let reply = 
        data.choices?.[0]?.message?.content ||
        data.content?.[0]?.text ||
        data.text ||
        "";
      
      if (!reply) {
        throw new Error('No response content');
      }
      
      // Clean markdown
      reply = reply.replace(/\*+/g, '').trim();
      
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      speak(reply);
      
    } catch (error) {
      console.warn('API error, using fallback:', error);
      
      // Try fallback response
      const fallback = getFallbackResponse(text);
      const reply = fallback || "We're experiencing connectivity issues connecting to Cedexx AI. Please try again in a moment, or email us at info@cedexx.net for assistance.";
      
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      speak(reply);
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) =>
    text.split('\n').map((line, i) => <p key={i} className={line === '' ? 'h-2' : ''}>{line}</p>);

  const chatbotUI = (
    <div className={cn(
      'bg-white flex flex-col overflow-hidden transition-all duration-300',
      inline ? 'h-full w-full' : cn(
        'fixed bottom-0 left-0 right-0 mx-auto',
        isMinimized ? 'h-14 w-80' : 'h-[520px] w-80'
      ),
      'md:w-96 md:max-w-md'
    )}>
        {!inline && (
        <div className="bg-[#050249] px-4 h-14 flex-shrink-0 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-all", isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-white/20")}>
              <Bot className={cn("h-4 w-4", isSpeaking ? "text-[#050249]" : "text-white")} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Cedex — AI Receptionist</p>
              <div className="flex items-center gap-1">
                <span className={cn("h-1.5 w-1.5 rounded-full transition-all", isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-emerald-400")} />
                <span className={cn("text-[10px] transition-all", isSpeaking ? "text-emerald-300 font-semibold" : "text-blue-200")}>
                  {isSpeaking ? "Speaking..." : isVoiceEnabled ? "Online" : "Muted"}
                </span>
              </div>
              <div className="text-xs text-white/70 mt-1 ml-2">Voice: {Boolean(import.meta.env.VITE_DEEPGRAM_API_KEY) ? 'Ready' : 'Offline'}</div>
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
                  {interimText}...
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
              placeholder={isListening ? "Listening..." : "Type a message..."}
              className="flex-1 h-10 rounded-xl border border-blue-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050249] transition"
            />
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || (!input.trim() && !interimText)} 
              className="h-10 w-10 rounded-xl bg-[#050249] text-white flex items-center justify-center hover:bg-[#03013b] disabled:opacity-40 transition-colors flex-shrink-0"
            >
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
          title="Chat with Cedex"
        >
          <MessageSquare className="h-6 w-6" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          )}
        </button>
      )}
      {(isOpen || inline) && chatbotUI}
    </>
  );
}
