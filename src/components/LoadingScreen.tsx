import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const messages = [
  "Finding opportunities...",
  "Loading verified listings...",
  "Preparing your dashboard...",
  "Almost ready..."
];

export default function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#121212] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-8"
      >
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-6xl"
        >
          🏠
        </motion.div>
        
        <h1 className="text-3xl font-black tracking-tight text-luxury-cream">HEXAESTATES</h1>

        <div className="h-16 flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.p
                    key={messages[index]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm text-luxury-citrus font-medium"
                >
                    {messages[index]}
                </motion.p>
            </AnimatePresence>
        </div>

        <div className="w-32 h-1 bg-luxury-surface rounded-full overflow-hidden">
            <motion.div 
                animate={{ x: [-128, 128] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-full h-full bg-luxury-citrus"
            />
        </div>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 text-xs text-luxury-text/50 font-medium"
      >
        Good things take time.
      </motion.p>
    </div>
  );
}
