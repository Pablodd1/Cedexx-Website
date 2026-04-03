import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500);
    }, 2000);

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
          <div className="flex flex-col items-center gap-6">
            <Logo className="h-32 md:h-48" variant="white" />
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
