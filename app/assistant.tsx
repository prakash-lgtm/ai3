"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useAISDKRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { useChat } from "@ai-sdk/react";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const API_OPTIONS = [
  {
    id: "clipdrop",
    label: "Image Gen",
    sublabel: "Cloud · Fast",
    model: "Clipdrop SDXL",
    color: "#a855f7",
    icon: "🎨",
  },
  {
    id: "groq",
    label: "Groq",
    sublabel: "Cloud · Fast",
    model: "Llama 3.3 · 70B",
    color: "#4ade80",
    icon: "☁️",
  },
  {
    id: "fireworks",
    label: "Fireworks",
    sublabel: "Cloud · Powerful",
    model: "Llama 3.3 · 70B",
    color: "#ec4899",
    icon: "🎆",
  },
  {
    id: "ollama",
    label: "Ollama",
    sublabel: "Local · Private",
    model: "llama3",
    color: "#fb923c",
    icon: "🖥️",
  },
] as const;

export const Assistant = () => {
  const [selectedModel, setSelectedModel] = useState<string>("groq");
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; username?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  const chat = useChat({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: {
        selectedModel,
        threadId: currentThreadId,
      },
    }),
    onResponse: (response: Response) => {
      const threadId = response.headers.get("x-thread-id");
      if (threadId && !currentThreadId) {
        setCurrentThreadId(threadId);
      }
    }
  });

  // Sync internal messages when history loads
  useEffect(() => {
    if (initialMessages.length > 0) {
      chat.setMessages(initialMessages);
    }
  }, [initialMessages, chat]);

  const runtime = useAISDKRuntime(chat);

  const handleSelectThread = async (threadId: string) => {
    if (threadId === "new") {
      setCurrentThreadId(null);
      setInitialMessages([]);
      chat.setMessages([]);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/threads/${threadId}`);
      const data = await res.json();
      if (data.thread && data.thread.messages) {
        const msgs = data.thread.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: new Date(m.createdAt),
        }));
        setInitialMessages(msgs);
        setCurrentThreadId(threadId);
      }
    } catch (e) {
      console.error("Failed to load thread history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const active = API_OPTIONS.find((o) => o.id === selectedModel) ?? API_OPTIONS[0];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5 relative overflow-hidden bg-[#050510]">
          {/* Animated background particles - RESTORED PREMIUM AESTHETICS */}
          <div className="particles" aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
            {[
              { left: 5, dur: 12, delay: 0, size: 2, color: "var(--quantum-blue)" },
              { left: 12, dur: 18, delay: 2, size: 3, color: "var(--quantum-violet)" },
              { left: 20, dur: 10, delay: 5, size: 2, color: "var(--quantum-cyan)" },
              { left: 28, dur: 14, delay: 1, size: 2, color: "var(--quantum-blue)" },
              { left: 35, dur: 20, delay: 7, size: 3, color: "var(--quantum-violet)" },
              { left: 50, dur: 16, delay: 6, size: 2, color: "var(--quantum-blue)" },
              { left: 65, dur: 19, delay: 4, size: 2, color: "var(--quantum-cyan)" },
              { left: 80, dur: 15, delay: 0, size: 3, color: "var(--quantum-violet)" },
              { left: 93, dur: 17, delay: 5, size: 2, color: "var(--quantum-blue)" },
            ].map((p, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: `${p.left}%`,
                  animation: `quantum-float ${p.dur}s linear infinite`,
                  animationDelay: `${p.delay}s`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.color,
                  opacity: 0.5,
                  borderRadius: "50%",
                  boxShadow: `0 0 10px ${p.color}`,
                }}
              />
            ))}
          </div>

          <ThreadListSidebar onSelectThread={handleSelectThread} currentThreadId={currentThreadId} />

          <SidebarInset style={{ zIndex: 1, position: "relative", background: "transparent" }}>
            <header className="flex h-16 shrink-0 flex-col relative z-20 backdrop-blur-xl border-b border-white/5 bg-[#070714]/80 px-6 justify-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white/70 hover:text-white" />
                <Separator orientation="vertical" className="h-6 opacity-20" />
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/80 to-purple-500/80 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="white" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke="white" strokeWidth="1.5" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke="white" strokeWidth="1.5" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke="white" strokeWidth="1.5" transform="rotate(120 12 12)" /></svg>
                  </div>
                  <div className="truncate">
                    <h1 className="text-sm font-bold text-white tracking-tight font-outfit truncate">
                      {currentThreadId ? "Quantum Session" : "New Intel Protocol"}
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{active.label} · {active.model}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">{user?.username || "Quantum User"}</span>
                    <span className="text-[9px] text-blue-400/70 font-bold tracking-[0.1em]">{user ? "SYNCED" : "LOCAL"}</span>
                  </div>
                  <div className="group relative">
                    <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer overflow-hidden">
                       <User className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a20] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1.5 z-[100] backdrop-blur-2xl">
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <Settings className="w-3.5 h-3.5" /> Settings
                      </button>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            
            <div className="flex-1 overflow-hidden relative z-10">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin-reverse" />
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] animate-pulse">Syncing History</p>
                </div>
              ) : (
                <Thread />
              )}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <style jsx global>{`
        @keyframes quantum-float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1s linear infinite;
        }
      `}</style>
    </AssistantRuntimeProvider>
  );
};
