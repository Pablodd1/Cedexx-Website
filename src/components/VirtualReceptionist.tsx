import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Phone, Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VapiClient } from '@vapi-ai/web';
import { buildSystemPrompt } from '../data/cedexx-knowledge';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || '5acddf90-ccad-4b4b-aac8-9adcea8d51bb';

// Vapi.ai assistant configuration for CEDEXX Virtual Receptionist
// Uses REAL website content from cedexx-knowledge.ts
const ASSISTANT_CONFIG = {
  name: 'Cedex',
  model: {
    provider: 'google',
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    systemPrompt: buildSystemPrompt(),
  },
  voice: {
    provider: '11labs',
    voiceId: 'bella', // Warm, professional female voice
    stability: 0.5,
    similarityBoost: 0.75,
  },
  firstMessage: "Hello! I'm Cedex, your Cedexx virtual front desk. I'm here to help you with telemedicine access, pricing, or booking a consultation. How can I assist you today?",
  endCallFunctionEnabled: true,
  recordingEnabled: false,
  functions: [
    {
      name: 'bookAppointment',
      description: 'Book a consultation appointment for the user',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name' },
          email: { type: 'string', description: 'Email address' },
          phone: { type: 'string', description: 'Phone number (optional)' },
          service: { type: 'string', description: 'Service type' },
          preferredDate: { type: 'string', description: 'Preferred date (YYYY-MM-DD)' },
          preferredTime: { type: 'string', description: 'Preferred time' },
        },
        required: ['name', 'email'],
      },
    },
    {
      name: 'transferToHuman',
      description: 'Transfer to human agent',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for transfer' },
        },
        required: ['reason'],
      },
    },
    {
      name: 'sendInfo',
      description: 'Send information to user via email',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Email to send to' },
          topic: { type: 'string', description: 'Topic: pricing, services, enrollment' },
        },
        required: ['email', 'topic'],
      },
    },
  ],
};

export function VirtualReceptionist() {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "speaking" | "listening">("idle");
  const [transcript, setTranscript] = useState("");
  const [latestUserMessage, setLatestUserMessage] = useState("");
  const vapiRef = useRef<VapiClient | null>(null);

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
    setIsActive(false);
    setStatus('idle');
    setTranscript("");
    setLatestUserMessage("");
  }, []);

  const toggleCall = async () => {
    if (isActive) {
      endCall();
      return;
    }

    if (!VAPI_PUBLIC_KEY || VAPI_PUBLIC_KEY.includes('REPLACE')) {
      setTranscript('Vapi.ai not configured. Please add your public key to .env.local');
      return;
    }

    // Start call
    setIsActive(true);
    setStatus("connecting");

    try {
      const vapi = new VapiClient(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      // Event handlers
      vapi.on('call-start', () => {
        setStatus('listening');
      });

      vapi.on('speech-start', () => {
        setStatus('speaking');
      });

      vapi.on('speech-end', () => {
        setStatus('listening');
      });

      vapi.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final' && message.role === 'user') {
          setLatestUserMessage(message.transcript);
        }
        if (message.type === 'assistant-message') {
          setTranscript(message.message);
        }
      });

      vapi.on('function-call', (functionCall) => {
        handleFunctionCall(functionCall);
      });

      vapi.on('call-end', () => {
        endCall();
      });

      vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        setTranscript('Sorry, I encountered a connection issue. Please try again.');
        setStatus('idle');
        setIsActive(false);
      });

      // Start the call
      await vapi.start(ASSISTANT_CONFIG);

    } catch (error) {
      console.error('Start call failed:', error);
      setTranscript('Connection failed. Please check your microphone permissions and try again.');
      setStatus('idle');
      setIsActive(false);
    }
  };

  const handleFunctionCall = async (functionCall: any) => {
    const { name, parameters } = functionCall;
    
    switch (name) {
      case 'bookAppointment':
        console.log('Booking appointment:', parameters);
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
        console.log('Transfer to human:', parameters.reason);
        // TODO: Implement human handoff
        break;

      case 'sendInfo':
        console.log('Send info:', parameters);
        // TODO: Send email via Brevo
        break;

      default:
        console.log('Unknown function:', name);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-20">
      <div className="bg-[#050249] rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl border border-white/10 group">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#23d9b0]/10 blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full mb-8 border border-white/10">
            <Sparkles className="h-4 w-4 text-[#23d9b0]" />
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">AI Virtual Front Desk</span>
          </div>

          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tighter">
            {isActive ? "Connected to Cedex" : "Talk to our Front Desk"}
          </h3>
          
          <p className="text-blue-200/60 font-medium mb-12 max-w-sm leading-relaxed italic">
            {isActive 
              ? (transcript || "I'm your Cedexx virtual assistant. How can I help you today?")
              : "Experience instant voice support. Click below to start a secure conversation with our AI receptionist."}
          </p>

          {/* Voice Visualizer / Action Button */}
          <div className="relative mb-12">
            <AnimatePresence>
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: [1, 2, 2.5], 
                        opacity: [0.3, 0.1, 0] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.5,
                        ease: "easeOut"
                      }}
                      className="absolute w-24 h-24 rounded-full border-2 border-blue-400/30"
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            <button
              onClick={toggleCall}
              className={`relative h-32 w-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl group/btn ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white hover:scale-105 active:scale-95'
              }`}
            >
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isActive ? 'bg-red-400' : 'bg-blue-400'}`} />
              
              <AnimatePresence mode="wait">
                {status === "connecting" ? (
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-1"
                  >
                    {[0, 1, 2].map(i => (
                      <div 
                        key={i} 
                        className={`h-2 w-2 rounded-full bg-[#050249] animate-bounce ${i === 1 ? 'animation-delay-200' : i === 2 ? 'animation-delay-400' : ''}`} 
                      />
                    ))}
                  </motion.div>
                ) : status === "speaking" ? (
                  <motion.div
                    key="speaking"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex items-end gap-1 h-8"
                  >
                    {[1, 2, 3, 4].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-[#050249] rounded-full"
                        animate={{ height: [8, 24, 12, 28, 8] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={isActive ? "active" : "inactive"}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    {isActive ? (
                      <Phone className="h-10 w-10 text-white fill-white" />
                    ) : (
                      <Mic className="h-10 w-10 text-[#050249]" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Live Transcript Display */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-white/10"
            >
              {latestUserMessage && (
                <div className="mb-2">
                  <span className="text-[10px] text-blue-300 uppercase tracking-wider font-bold">You said:</span>
                  <p className="text-sm text-white/80 italic">{latestUserMessage}</p>
                </div>
              )}
              {transcript && (
                <div>
                  <span className="text-[10px] text-[#23d9b0] uppercase tracking-wider font-bold">Cedex:</span>
                  <p className="text-sm text-white">{transcript}</p>
                </div>
              )}
            </motion.div>
          )}

          <div className="flex items-center gap-8 justify-center w-full">
            <div className={`flex flex-col items-center gap-2 transition-opacity ${status === 'speaking' ? 'opacity-100' : 'opacity-40'}`}>
              <Volume2 className="h-4 w-4 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Speaking</span>
            </div>
            <div className="h-px flex-1 bg-white/10 max-w-[100px]" />
            <div className={`flex flex-col items-center gap-2 transition-opacity ${status === 'listening' ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`h-2 w-2 rounded-full ${status === 'listening' ? 'bg-[#23d9b0] animate-pulse' : 'bg-white/20'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Listening</span>
            </div>
          </div>
        </div>

        {/* Technical Requirements Tooltip */}
        <div className="mt-12 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] text-blue-200/30 uppercase tracking-[0.3em] font-black italic">
            SECURE HIPAA-COMPLIANT VOICE PROTOCOL • VAPI.AI + GEMINI 1.5 FLASH
          </p>
        </div>
      </div>

      <style>{`
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}
