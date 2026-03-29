"use client";

import { motion } from "framer-motion";
import { Zap, History } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full h-[80vh] flex flex-col items-center justify-center overflow-hidden bg-[#050510]">
      {/* Background Energy Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[150px]"
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Goku Hero Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <video
            src="/quantum-goku-move.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-2xl drop-shadow-[0_0_60px_rgba(59,130,246,0.4)]"
          />
          {/* Energy Particles */}
          <motion.div 
            animate={{ y: [0, -50, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-400 rounded-full blur-sm pointer-events-none"
          />
          <motion.div 
            animate={{ y: [0, -70, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
            className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-400 rounded-full blur-sm pointer-events-none"
          />
          {/* Bottom gradient fade into page */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#050510] to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-20 text-center -mt-20">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1, duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic">
            Quantum <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">AI</span>
          </h1>
          <p className="mt-4 text-gray-400 text-lg md:text-xl font-bold tracking-[0.2em] uppercase max-w-2xl mx-auto">
            Experience Hyper-Intelligence with Zero Limits
          </p>
          
          <div className="mt-10 flex flex-wrap gap-6 justify-center">
            <Link href="/login" className="px-10 py-5 bg-white text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 flex items-center gap-3">
              Power Up Now <Zap className="w-5 h-5 fill-current" />
            </Link>
            <Link href="/history" className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 glassmorphism">
              View History <History className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative Scanline */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] scanline" />
    </section>
  );
}
