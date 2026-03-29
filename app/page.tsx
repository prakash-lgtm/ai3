"use client";

import { Assistant } from "./assistant";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050510] relative text-white overflow-x-hidden">
      {/* Hero Section with Goku moves / Quantum AI name */}
      <Hero />

      {/* Assistant Section */}
      <section className="container mx-auto px-4 py-20 relative z-20">
         <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-black uppercase tracking-widest text-blue-400 mb-4 px-8 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              Quantum Interface Active
            </h2>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.3em]">
              Real-time Intelligence Stream
            </p>
         </div>
         <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 md:p-8 shadow-2xl relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <Assistant />
         </div>
      </section>

      {/* Background Animated Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </main>
  );
}
