import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, PhoneCall, Volume2, Loader2 } from 'lucide-react';
import { cn } from './ui';
import Vapi from '@vapi-ai/web';
import { buildSystemPrompt } from '../data/cedexx-knowledge';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || '5acddf90-ccad-4b4b-aac8-9adcea8d51bb';

// Vapi.ai assistant configuration for CEDEXX
// Uses REAL website content from cedexx-knowledge.ts (updated for Lyric Health partnership)
const ASSISTANT_CONFIG = {
  name: 'JasDex',
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.5,
    systemPrompt: buildSystemPrompt(),
  },
  voice: {
    provider: 'deepgram',
    voiceId: 'aura-asteria-en',
  },
  firstMessage: "Hello! I'm JasDex, your Cedexx virtual front desk receptionist. I'm here to help you with Lyric Health virtual care access, pricing questions, or booking a consultation. How can I assist you today?",
  endCallFunctionEnabled: true,
  recordingEnabled: false,
  functions: [
    {
      name: 'bookAppointment',
      description: 'Book a consultation appointment for the user',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name of the person booking' },
          email: { type: 'string', description: 'Email address' },
          phone: { type: 'string', description: 'Phone number (optional)' },
          service: { type: 'string', description: 'Type of service: urgent-care, mental-wellness, prescription, pediatric, family-wellness' },
          preferredDate: { type: 'string', description: 'Preferred date (YYYY-MM-DD format)' },
          preferredTime: { type: 'string', description: 'Preferred time (e.g. 2:00 PM)' },
        },
        required: ['name', 'email', 'service'],
      },
    },
    {
      name: 'transferToHuman',
      description: 'Transfer the call to a human agent when the user requests it or when the issue is complex',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for transfer' },
        },
        required: ['reason'],
      },
    },
    {
      name: 'sendPricingInfo',
      description: 'Send pricing information to the user via email',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Email to send pricing to' },
          plan: { type: 'string', description: 'Plan type: individual, family, corporate' },
        },
        required: ['email'],
      },
    },
  ],
};

export function VoiceAssistant({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(inline);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFallbackModeRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
      recognitionRef.current?.stop?.();
      audioRef.current?.pause?.();
    };
  }, []);

  const speakViaDeepgramOrBrowser = useCallback(async (text: string, onDone?: () => void) => {
    setIsSpeaking(true);
    setTranscript(text);
    try {
      const audio = new Audio(`/api/voice/speak?text=${encodeURIComponent(text)}`);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        onDone?.();
      };
      audio.onerror = () => {
        // Fallback to browser SpeechSynthesis
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.98;
        utter.onend = () => {
          setIsSpeaking(false);
          onDone?.();
        };
        window.speechSynthesis?.speak(utter);
      };
      await audio.play();
    } catch {
      setIsSpeaking(false);
      onDone?.();
    }
  }, []);

  const listenForNextTurn = useCallback(() => {
    if (!isFallbackModeRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    try {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      recognitionRef.current = rec;
      rec.onresult = async (ev: any) => {
        const userText = ev.results?.[0]?.[0]?.transcript || '';
        if (!userText) return;
        setTranscript(`You: "${userText}"`);
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: userText }] }),
          });
          const data = await res.json();
          const reply = (data.choices?.[0]?.message?.content || "I'm here to help with CEDEXX plans and Lyric Health access.").replace(/\*+/g, '').trim();
          speakViaDeepgramOrBrowser(reply, () => {
            if (isFallbackModeRef.current) listenForNextTurn();
          });
        } catch {
          speakViaDeepgramOrBrowser("You can enroll anytime at cedexx.net/enroll or call 754-432-2201.", () => {
            if (isFallbackModeRef.current) listenForNextTurn();
          });
        }
      };
      rec.onend = () => {
        if (isFallbackModeRef.current && !isSpeaking) {
          try { rec.start(); } catch {}
        }
      };
      rec.start();
    } catch {}
  }, [isSpeaking, speakViaDeepgramOrBrowser]);

  const startDirectWebVoiceFallback = useCallback(() => {
    isFallbackModeRef.current = true;
    setIsConnecting(false);
    setIsConnected(true);
    const greeting = "Hello! I'm JasDex, your Cedexx virtual front desk receptionist. How can I assist you today?";
    speakViaDeepgramOrBrowser(greeting, () => {
      listenForNextTurn();
    });
  }, [listenForNextTurn, speakViaDeepgramOrBrowser]);

  const endCall = useCallback(() => {
    isFallbackModeRef.current = false;
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    recognitionRef.current?.stop?.();
    audioRef.current?.pause?.();
    window.speechSynthesis?.cancel?.();
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setTranscript('');
    if (!inline) setIsOpen(false);
  }, [inline]);

  const startCall = async () => {
    setIsConnecting(true);
    setTranscript('Connecting to JasDex...');

    if (!VAPI_PUBLIC_KEY || VAPI_PUBLIC_KEY.includes('REPLACE')) {
      startDirectWebVoiceFallback();
      return;
    }

    try {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      // Event handlers
      vapi.on('call-start', () => {
        setIsConnecting(false);
        setIsConnected(true);
        setTranscript("Connected — I'm listening.");
      });

      vapi.on('speech-start', () => {
        setIsSpeaking(true);
      });

      vapi.on('speech-end', () => {
        setIsSpeaking(false);
      });

      vapi.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setTranscript(message.transcript);
        }
        if (message.type === 'assistant-message') {
          setTranscript(message.message);
        }
      });

      (vapi as any).on('function-call', (functionCall: any) => {
        handleFunctionCall(functionCall);
      });

      vapi.on('call-end', () => {
        if (!isFallbackModeRef.current) endCall();
      });

      vapi.on('error', (error) => {
        console.warn('Vapi error, switching to direct Deepgram/AI voice bridge:', error);
        try { vapi.stop(); } catch {}
        startDirectWebVoiceFallback();
      });

      // Start the call
      await vapi.start(ASSISTANT_CONFIG as any);

    } catch (err) {
      console.warn('Vapi start failed, switching to direct Deepgram/AI voice bridge:', err);
      startDirectWebVoiceFallback();
    }
  };

  const handleFunctionCall = async (functionCall: any) => {
    const { name, parameters } = functionCall;

    switch (name) {
      case 'bookAppointment':
        console.log('Booking appointment:', parameters);
        try {
          await fetch('/api/voice-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parameters),
          });
        } catch (e) {
          console.error('Booking failed:', e);
        }
        break;

      case 'transferToHuman':
        console.log('Transfer to human:', parameters.reason);
        window.location.href = 'tel:+17544322201';
        break;

      case 'sendPricingInfo':
        console.log('Send pricing to:', parameters.email);
        break;

      default:
        console.log('Unknown function:', name);
    }
  };

  const assistantUI = (
    <div className={cn(
      "flex flex-col overflow-hidden",
      inline ? "w-full bg-transparent" : "fixed bottom-24 right-6 w-80 rounded-2xl shadow-2xl z-50 border border-blue-100 bg-white"
    )}>
      {/* Header (Hidden if inline) */}
      {!inline && (
        <div className="bg-[#050249] p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            <div>
              <p className="font-bold text-sm leading-tight">JasDex — AI Receptionist</p>
              <p className="text-blue-200 text-xs">CEDEXX</p>
            </div>
          </div>
          <button onClick={endCall} title="End call and close" className="text-blue-200 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Body */}
      <div className={cn("flex flex-col items-center gap-4", inline ? "p-2" : "p-6 bg-slate-50")}>
        {/* Waveform / Mic indicator */}
        <div className={cn(
          'h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500 relative',
          isConnected ? 'bg-[#EBF3FB] pulse-ring' : inline ? 'bg-white/10' : 'bg-slate-100'
        )}>
          {isConnected ? (
            isSpeaking ? (
              // Speaking animation
              <div className="flex items-end gap-1 h-10">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className="wave-bar w-1.5 bg-[#050249] rounded-full origin-bottom"
                    style={{
                      animation: `wave ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                      height: `${12 + Math.random() * 20}px`
                    }}
                  />
                ))}
              </div>
            ) : (
              // Listening indicator
              <div className="relative">
                <div className="absolute inset-0 bg-[#23d9b0] rounded-full animate-ping opacity-20" />
                <Mic className="h-8 w-8 text-[#050249]" />
              </div>
            )
          ) : (
            <MicOff className={cn("h-8 w-8", inline ? "text-blue-200" : "text-slate-400")} />
          )}
        </div>

        {/* Status / Transcript */}
        <div className={cn(
          "w-full rounded-xl p-3 min-h-[56px] flex items-center justify-center",
          inline ? "bg-white/10 border border-white/20 text-white" : "bg-white border border-blue-100 text-slate-600"
        )}>
          {isSpeaking && <Volume2 className={cn("h-4 w-4 mr-2 flex-shrink-0 animate-pulse", inline ? "text-[#23d9b0]" : "text-[#050249]")} />}
          {isConnecting && <Loader2 className={cn("h-4 w-4 mr-2 animate-spin", inline ? "text-white" : "text-[#050249]")} />}
          <p className={cn("text-center text-xs leading-snug", inline ? "text-blue-50" : "text-slate-600")}>
            {transcript || (isConnecting ? 'Connecting to JasDex...' : 'Click "Start Call" to speak with JasDex, our AI receptionist.')}
          </p>
        </div>

        {/* CTA */}
        {!isConnected && !isConnecting ? (
          <button
            onClick={startCall}
            className={cn(
              "w-full font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2",
              inline ? "bg-[#23d9b0] hover:bg-[#1ec29d] text-[#050249]" : "bg-[#050249] hover:bg-[#03013b] text-white"
            )}
          >
            <Mic className="h-4 w-4" /> Start Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className={cn(
              "w-full font-semibold rounded-xl py-3 transition-colors",
              inline ? "bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30" : "border border-red-200 text-red-600 hover:bg-red-50"
            )}
          >
            {isConnecting ? 'Cancel' : 'End Call'}
          </button>
        )}

        <p className={cn("text-[10px] text-center leading-tight", inline ? "text-blue-200/60" : "text-slate-400")}>
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
          title="Talk to JasDex — AI Receptionist"
        >
          <PhoneCall className="h-6 w-6" />
          <span className="absolute right-full mr-3 bg-white text-slate-800 px-2 py-1 rounded text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100">
            Talk to JasDex
          </span>
        </button>
      )}

      {(isOpen || inline) && assistantUI}

      {/* Wave animation styles */}
      <style>{`
        @keyframes wave {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
        .pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(5, 2, 73, 0.4); }
          100% { box-shadow: 0 0 0 20px rgba(5, 2, 73, 0); }
        }
      `}</style>
    </>
  );
}
