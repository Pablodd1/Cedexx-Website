import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, PhoneCall, Volume2 } from 'lucide-react';
import { cn } from './ui';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are Cedex, the highly advanced AI Voice Assistant and Virtual Front Desk Receptionist for Cedexx. Be warm, professional, and helpful.`;

export function VoiceAssistant({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(inline);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const playbackCtxRef = useRef<AudioContext | null>(null);

  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) { isPlayingRef.current = false; return; }
    isPlayingRef.current = true;
    const ctx = playbackCtxRef.current!;
    const buffer = audioQueueRef.current.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = playNextInQueue;
    source.start();
  }, []);

  const enqueueAudio = useCallback(async (base64: string) => {
    if (!playbackCtxRef.current) playbackCtxRef.current = new AudioContext({ sampleRate: 24000 });
    const ctx = playbackCtxRef.current;
    const raw = atob(base64);
    const pcm = new Int16Array(raw.length / 2);
    for (let i = 0; i < pcm.length; i++) {
      pcm[i] = (raw.charCodeAt(i * 2)) | (raw.charCodeAt(i * 2 + 1) << 8);
    }
    const float32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) float32[i] = pcm[i] / 32768;
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);
    audioQueueRef.current.push(buffer);
    if (!isPlayingRef.current) playNextInQueue();
  }, [playNextInQueue]);

  const endCall = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => s?.close?.()).catch(() => {});
      sessionRef.current = null;
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    playbackCtxRef.current?.close();
    playbackCtxRef.current = null;
    audioQueueRef.current = [];
    isPlayingRef.current = false;
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
      const ai = new GoogleGenAI({ apiKey });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-live-001',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript('Connected — start speaking.');
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = stream;
              const ctx = new AudioContext({ sampleRate: 16000 });
              audioContextRef.current = ctx;
              const source = ctx.createMediaStreamSource(stream);
              const processor = ctx.createScriptProcessor(4096, 1, 1);
              processor.onaudioprocess = (e) => {
                const input = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(input.length);
                for (let i = 0; i < input.length; i++) {
                  pcm16[i] = Math.max(-32768, Math.min(32767, input[i] * 32768));
                }
                const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
                sessionPromise.then(s => s?.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
              };
              source.connect(processor);
              processor.connect(ctx.destination);
            } catch {
              setTranscript('Microphone access denied.');
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            const text = msg.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) setTranscript(text);
            const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) await enqueueAudio(audio);
          },
          onclose: () => endCall(),
          onerror: () => endCall(),
        },
      });
      sessionRef.current = sessionPromise;
    } catch {
      setTranscript('Connection failed. Please try again.');
      setIsConnecting(false);
    }
  };

  const assistantUI = (
    <div className={cn(
      "bg-white flex flex-col overflow-hidden",
      inline ? "w-full" : "fixed bottom-24 right-6 w-80 rounded-2xl shadow-2xl z-50 border border-blue-100"
    )}>
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

      <div className={cn("flex flex-col items-center gap-5", inline ? "" : "p-6 bg-slate-50")}>
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

        <div className="w-full bg-white rounded-xl border border-blue-100 p-3 min-h-[56px] flex items-center justify-center">
          {isConnected && <Volume2 className="h-4 w-4 text-[#050249] mr-2 flex-shrink-0" />}
          <p className="text-center text-sm text-slate-600 leading-snug">
            {transcript || (isConnecting ? 'Connecting...' : 'Click "Start Call" to speak with Cedex.')}
          </p>
        </div>

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
          AI responses are informational only.
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
          title="Talk to Cedex"
        >
          <PhoneCall className="h-6 w-6" />
        </button>
      )}

      {(isOpen || inline) && assistantUI}
    </>
  );
}
