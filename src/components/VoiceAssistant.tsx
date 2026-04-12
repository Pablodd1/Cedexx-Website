import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, PhoneCall, Volume2 } from 'lucide-react';
import { cn } from './ui';

const SYSTEM_INSTRUCTION = `You are Cedex, the highly advanced AI Voice Assistant and Virtual Front Desk Receptionist for Cedexx — a technology platform connecting families to independent telemedicine providers. No insurance needed.

CORE MISSION:
Welcome callers warmly, answer questions about our services, and guide families toward enrolling or speaking with our team.

COMPANY KNOWLEDGE (FAMILY FOCUS):
- Service: Cedexx is a technology platform connecting families to independent licensed providers. We do not provide medical care directly.
- Who We Serve: Families with kids, busy parents, and anyone seeking affordable, non-emergency healthcare access.
- Key Benefits: Provider access at your fingertips 24/7. No long wait times. Transparent pricing. HIPAA Secure.
- How It Works: (1) Connect in seconds → (2) Independent provider joins in minutes → (3) Consultation in real time.
- Pricing: Affordable monthly family plans. Direct callers to our pricing page or to speak with a specialist.
- Prescriptions: Providers on our platform may prescribe directly to your local pharmacy. No controlled substances.
- Contact: Email info@cedexx.net or call 954-624-6744.
- Powered by Cedexx.

IMPORTANT DISCLAIMERS (use when relevant):
- Cedexx is NOT a healthcare provider. We are a technology platform.
- We do not provide medical advice, diagnoses, or treatment.
- All providers are independent contractors, not Cedexx employees.
- For medical emergencies, call 911 immediately.

VOICE GUIDELINES & TONE:
- SPEAK NATURALLY. You are a live voice receptionist, not a chatbot reading a list.
- Be WARM, CONFIDENT, PROFESSIONAL, and PERSUASIVE.
- Keep answers short and conversational. Do not recite bullet points aloud.
- NEVER give medical diagnoses or advice. Redirect medical questions to enrolling and speaking with our independent providers.
- If someone wants to book a demo, collect their name and email and let them know our team will email them to confirm.
- REMEMBER the conversation context throughout the call — reference earlier details naturally.
- Speak naturally in the language the user speaks to you in.`;

export function VoiceAssistant({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(inline);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);

  const endCall = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    const recognition = (window as any).recognition;
    if (recognition) {
      recognition.stop();
      (window as any).recognition = null;
    }
    window.speechSynthesis.cancel();
    audioContextRef.current?.close();
    audioContextRef.current = null;
    playbackCtxRef.current?.close();
    playbackCtxRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setTranscript('');
    setIsOpen(false);
  }, []);

  const startCall = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      setTranscript('API key not configured. Voice assistant unavailable.');
      return;
    }

    setIsConnecting(true);
    setTranscript('Connecting to Cedex...');

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setTranscript('Voice recognition not supported in this browser.');
        setIsConnecting(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setTranscript('Connected — I am listening.');
        speak("Hello! I'm Cedex, your AI receptionist. How can I help you today?");
      };

      recognition.onresult = async (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const text = lastResult[0].transcript;
          setTranscript('Thinking...');
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [{ role: 'user', content: text }],
                provider: 'kimi'
              })
            });
            const data = await response.json();
            const responseText = data.choices?.[0]?.message?.content || "I'm sorry, I'm having trouble thinking.";
            setTranscript(responseText);
            speak(responseText);
          } catch (err) {
            console.error('Gemini error:', err);
            setTranscript('Sorry, I encountered an error. Please try again.');
          }
        }
      };

      recognition.onerror = () => endCall();
      recognition.onend = () => { if (isConnected) recognition.start(); };
      
      (window as any).recognition = recognition;
      recognition.start();

    } catch (err) {
      console.error('Start call failed:', err);
      setTranscript('Connection failed. Please try again.');
      setIsConnecting(false);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')) && v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const assistantUI = (
    <div className={cn(
      "bg-white flex flex-col overflow-hidden",
      inline ? "w-full" : "fixed bottom-24 right-6 w-80 rounded-2xl shadow-2xl z-50 border border-blue-100"
    )}>
      {/* Header (Hidden if inline) */}
      {!inline && (
        <div className="bg-[#050249] p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            <div>
              <p className="font-bold text-sm leading-tight">Cedex — AI Receptionist</p>
              <p className="text-blue-200 text-xs">Cedexx</p>
            </div>
          </div>
          <button onClick={endCall} title="End call and close" className="text-blue-200 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Body */}
      <div className={cn("flex flex-col items-center gap-5", inline ? "" : "p-6 bg-slate-50")}>
        {/* Waveform / Mic indicator */}
        <div className={cn(
          'h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500 relative',
          isConnected ? 'bg-[#EBF3FB] pulse-ring' : 'bg-slate-100'
        )}>
          {isConnected ? (
            <div className="flex items-end gap-1 h-10">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="wave-bar w-1.5 bg-[#050249] rounded-full h-8 origin-bottom" />
              ))}
            </div>
          ) : (
            <MicOff className="h-10 w-10 text-slate-400" />
          )}
        </div>

        {/* Status / Transcript */}
        <div className="w-full bg-white rounded-xl border border-blue-100 p-3 min-h-[56px] flex items-center justify-center">
          {isConnected && <Volume2 className="h-4 w-4 text-[#050249] mr-2 flex-shrink-0" />}
          <p className="text-center text-sm text-slate-600 leading-snug">
            {transcript || (isConnecting ? 'Connecting...' : 'Click "Start Call" to speak with Cedex, our AI receptionist.')}
          </p>
        </div>

        {/* CTA */}
        {!isConnected && !isConnecting ? (
          <button
            onClick={startCall}
            className="w-full bg-[#050249] hover:bg-[#03013b] text-white font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
          >
            <Mic className="h-4 w-4" /> Start Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl py-3 transition-colors"
          >
            End Call
          </button>
        )}

        <p className="text-[10px] text-slate-400 text-center leading-tight">
          AI responses are informational only and do not constitute medical advice.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {!inline && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#050249] text-white shadow-xl flex items-center justify-center hover:bg-[#03013b] transition-all z-50 group',
            isOpen && 'hidden'
          )}
          title="Talk to Cedex — AI Receptionist"
        >
          <PhoneCall className="h-6 w-6" />
          <span className="absolute right-full mr-3 bg-white text-slate-800 px-2 py-1 rounded text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100">
            Talk to Cedex
          </span>
        </button>
      )}

      {(isOpen || inline) && assistantUI}
    </>
  );
}

