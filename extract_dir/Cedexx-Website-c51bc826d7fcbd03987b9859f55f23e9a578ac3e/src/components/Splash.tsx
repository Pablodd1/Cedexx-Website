import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import splashVideo from '../assets/splash.mp4';

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Give time for exit animation
    }, 3500); // Show for 3.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#050249] flex items-center justify-center p-6"
        >
          {/* Splash Container - Premium Horizontal Frame */}
          <div className="relative w-full max-w-[1024px] aspect-video md:aspect-[21/9] overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/5 bg-black flex items-center justify-center">
            <video
              autoPlay
              muted
              playsInline
              onEnded={() => {
                setIsVisible(false);
                setTimeout(onFinish, 500);
              }}
              src={splashVideo}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Subtle Logo Watermark in Loading */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                 <motion.div 
                   key={i}
                   animate={{ opacity: [0.3, 1, 0.3] }}
                   transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                   className="h-1 w-1 rounded-full bg-white" 
                 />
              ))}
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">CEDEXX</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
