"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        await res.text(); // Consume the stream
        throw new Error("Server returned an invalid response. Please check if the server is running correctly.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          {/* Logo/Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold quantum-gradient-text tracking-tight mb-1">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Access your Quantum Intelligence account
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                <Lock className="w-3 h-3" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end px-1">
              <Link href="#" className="text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-gray-400 text-[13px]">
              New to Quantum AI?{" "}
              <Link href="/signup" className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1">
                Create Account
              </Link>
            </p>
          </div>

          {/* Decorative corner */}
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        <p className="mt-8 text-center text-gray-600 text-[10px] uppercase tracking-[0.2em] font-medium">
          Secure Quantum Authentication • v2.0
        </p>
      </motion.div>
    </div>
  );
}
