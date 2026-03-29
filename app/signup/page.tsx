"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, ShieldCheck, ArrowRight, Loader2, Zap } from "lucide-react";

export default function SignupPage() {
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Contact, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate sync");

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid Protocol Key");

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4 relative overflow-hidden font-outfit">
      {/* Background Energy Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[150px]"
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      
      {/* Scanline Effect */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] scanline z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-[0_0_80px_rgba(0,0,0,0.7)] relative overflow-hidden group">
          {/* Top Edge Glow - Purple/Pink for Signup */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.6)]" />

          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center relative z-10">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -5, filter: "brightness(1.5)" }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-800 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(168,85,247,0.5)] cursor-pointer"
            >
              <UserPlus className="w-10 h-10 text-white animate-pulse" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">
              Quantum <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">Sync</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-black tracking-[0.4em] uppercase opacity-70">
              {step === 1 ? "Begin Identity Protocol" : "Secure Verification Stream"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black text-center tracking-widest uppercase"
              >
                {error}
              </motion.div>
            )}

            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                onSubmit={handleRequestOtp} 
                className="space-y-6 relative z-10"
              >
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-purple-400/50" /> Portal Identity
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all text-lg font-bold shadow-inner"
                      placeholder="Email or Phone Number"
                    />
                    <div className="absolute top-1/2 right-5 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-700 to-blue-800 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-[0_15px_30px_-10px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-3 group relative overflow-hidden uppercase tracking-[0.2em] text-[11px] italic"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      <span className="relative z-10">Initialize Sync</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-3 transition-transform" />
                      <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                onSubmit={handleVerifyOtp} 
                className="space-y-6 relative z-10"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-blue-400/50" /> Identity Matrix Key
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-5 px-6 text-center text-white placeholder:text-gray-700 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-4xl font-black tracking-[0.7em] shadow-inner"
                    placeholder="000000"
                  />
                  <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-6 bg-white/[0.03] py-2 rounded-lg">
                    Requesting Access for: <span className="text-white ml-2">{contact}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-400 font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-[9px]"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-[0_15px_30px_-10px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden uppercase tracking-widest text-[9px] italic"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span className="relative z-10">Verify Flow</span>
                        <Zap className="w-4 h-4 relative z-10 group-hover:scale-150 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center pt-8 border-t border-white/5 relative z-10">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.1em]">
              Already synced in the Matrix?{" "}
              <Link href="/login" className="text-purple-400 hover:text-pink-400 transition-colors ml-2 hover:underline decoration-2 underline-offset-8">
                Log In
              </Link>
            </p>
          </div>

          {/* Energy Particles */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="mt-12 flex items-center justify-between px-6">
           <p className="text-gray-800 text-[9px] uppercase tracking-[0.5em] font-black">
            Quantum Core • v3.0
          </p>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse delay-150" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

