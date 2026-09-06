import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, PhoneCall, Volume2, Loader2 } from 'lucide-react';
import { cn } from './ui';
import Vapi from '@vapi-ai/web';
import { buildSystemPrompt } from '../data/cedexx-knowledge';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || '5acddf90-ccad-4b4b-aac8-9adcea8d51bb';

// Vapi.ai assistant configuration for CEDEXX
// Uses REAL website content from cedexx-knowledge.ts (updated for Lyric Health partnership)
const ASSISTANT_CONFIG = {
  name: 'Cedex',
  model: {
    provider: 'google',
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    systemPrompt: buildSystemPrompt(),
  },
  voice: {
    provider: 'deepgram',
    voiceId: 'flux-hannah-en',
    speed: 1,
  },
  firstMessage: "Hello! I'm Hannah, your Cedexx virtual front desk receptionist. I'm here to help you with Lyric Health virtual care access, pricing questions, or booking a consultation. How can I assist you today?",
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setTranscript('');
    if (!inline) setIsOpen(false);
  }, [inline]);

  const startCall = async () => {
    if (!VAPI_PUBLIC_KEY || VAPI_PUBLIC_KEY.includes('REPLACE')) {
      setTranscript('Vapi.ai not configured. Please add your public key to .env.local');
      return;
    }

    setIsConnecting(true);
    setTranscript('Connecting to Cedex...');

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
        endCall();
      });

      vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        setTranscript('Sorry, I encountered a connection issue. Please try again.');
        setIsConnecting(false);
      });

      // Start the call
      await vapi.start(ASSISTANT_CONFIG as any);

    } catch (err) {
      console.error('Start call failed:', err);
      setTranscript('Connection failed. Please check your microphone permissions and try again.');
      setIsConnecting(false);
    }
  };

  const handleFunctionCall = async (functionCall: any) => {
    const { name, parameters } = functionCall;

    switch (name) {
      case 'bookAppointment':
        // TODO: Integrate with Cal.com or your booking system
        console.log('Booking appointment:', parameters);
        // Send to your booking API
        try {
          await fetch('/api/book-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parameters),
          });
        } catch (e) {
          console.error('Booking failed:', e);
        }
        break;

      case 'transferToHuman':
        // TODO: Implement human handoff (Twilio, Slack, etc.)
        console.log('Transfer to human:', parameters.reason);
        break;

      case 'sendPricingInfo':
        // TODO: Send email via Brevo/Resend
        console.log('Send pricing to:', parameters.email);
        break;

      default:
        console.log('Unknown function:', name);
    }
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
              <p className="text-blue-200 text-xs">CEDEXX</p>
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
            <MicOff className="h-10 w-10 text-slate-400" />
          )}
        </div>

        {/* Status / Transcript */}
        <div className="w-full bg-white rounded-xl border border-blue-100 p-3 min-h-[56px] flex items-center justify-center">
          {isSpeaking && <Volume2 className="h-4 w-4 text-[#050249] mr-2 flex-shrink-0 animate-pulse" />}
          {isConnecting && <Loader2 className="h-4 w-4 text-[#050249] mr-2 animate-spin" />}
          <p className="text-center text-sm text-slate-600 leading-snug">
            {transcript || (isConnecting ? 'Connecting to Cedex...' : 'Click "Start Call" to speak with Cedex, our AI receptionist.')}
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
            {isConnecting ? 'Cancel' : 'End Call'}
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
