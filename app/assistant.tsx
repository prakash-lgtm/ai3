"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState, useEffect } from "react";
import { LogOut, User, Settings, Info } from "lucide-react";
import { useRouter } from "next/navigation";

const API_OPTIONS = [
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

  const transport = useMemo(
    () => ({
      async sendMessages({ messages }: { messages: any[] }) {
        const encoder = new TextEncoder();
        return new ReadableStream({
          async start(controller) {
            try {
              const res = await fetch("/api/chat", {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: JSON.stringify({ 
                  messages,
                  selectedModel 
                }),
              });

              const textPartId = "text-" + Math.random().toString(36).substring(7);

              const contentType = res.headers.get("content-type");
              if (!contentType || !contentType.includes("application/json")) {
                const errorText = "⚠️ Server Error: AI service returned an invalid response. Check .env.local.";
                controller.enqueue({ type: "text-start", id: textPartId });
                controller.enqueue({ type: "text-delta", id: textPartId, delta: errorText });
                controller.enqueue({ type: "text-end", id: textPartId });
                controller.enqueue({ type: "finish", finishReason: "error" });
                controller.close();
                return;
              }

              const data = await res.json();

              if (!res.ok) {
                const errorText = `❌ Error: ${data.error || "Something went wrong"}`;
                controller.enqueue({ type: "text-start", id: textPartId });
                controller.enqueue({ type: "text-delta", id: textPartId, delta: errorText });
                controller.enqueue({ type: "text-end", id: textPartId });
                controller.enqueue({ type: "finish", finishReason: "error" });
                controller.close();
                return;
              }

              // Emit chunks for assistant-ui with synchronized ID
              controller.enqueue({ type: "text-start", id: textPartId });
              controller.enqueue({ type: "text-delta", id: textPartId, delta: data.reply });
              controller.enqueue({ type: "text-end", id: textPartId });
              controller.enqueue({ type: "finish", finishReason: "stop" });
              controller.close();

            } catch (err: any) {
              const textPartId = "error-" + Math.random().toString(36).substring(7);
              const errorText = `🔌 Connection Error: ${err.message || "Failed to connect to the AI service."}`;
              controller.enqueue({ type: "text-start", id: textPartId });
              controller.enqueue({ type: "text-delta", id: textPartId, delta: errorText });
              controller.enqueue({ type: "text-end", id: textPartId });
              controller.enqueue({ type: "finish", finishReason: "error" });
              controller.close();
            }
          }
        });
      },
      async reconnectToStream() {
        return null;
      }
    }),
    [selectedModel]
  );

  const runtime = useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport: transport as any,
  });

  const active = API_OPTIONS.find((o) => o.id === selectedModel) ?? API_OPTIONS[0];

  const [user, setUser] = useState<{ email: string; username?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5 relative">

          {/* Animated background particles */}
          <div className="particles" aria-hidden="true">
            {[
              { left: 5, dur: 12, delay: 0, size: 2, color: "var(--quantum-blue)" },
              { left: 12, dur: 18, delay: 2, size: 3, color: "var(--quantum-violet)" },
              { left: 20, dur: 10, delay: 5, size: 2, color: "var(--quantum-cyan)" },
              { left: 28, dur: 14, delay: 1, size: 2, color: "var(--quantum-blue)" },
              { left: 35, dur: 20, delay: 7, size: 3, color: "var(--quantum-violet)" },
              { left: 42, dur: 9, delay: 3, size: 2, color: "var(--quantum-cyan)" },
              { left: 50, dur: 16, delay: 6, size: 2, color: "var(--quantum-blue)" },
              { left: 58, dur: 11, delay: 9, size: 3, color: "var(--quantum-violet)" },
              { left: 65, dur: 19, delay: 4, size: 2, color: "var(--quantum-cyan)" },
              { left: 72, dur: 13, delay: 8, size: 2, color: "var(--quantum-blue)" },
              { left: 80, dur: 15, delay: 0, size: 3, color: "var(--quantum-violet)" },
              { left: 88, dur: 8, delay: 2, size: 2, color: "var(--quantum-cyan)" },
              { left: 93, dur: 17, delay: 5, size: 2, color: "var(--quantum-blue)" },
              { left: 15, dur: 11, delay: 10, size: 2, color: "var(--quantum-cyan)" },
              { left: 45, dur: 14, delay: 3, size: 3, color: "var(--quantum-blue)" },
              { left: 70, dur: 9, delay: 7, size: 2, color: "var(--quantum-violet)" },
              { left: 55, dur: 16, delay: 1, size: 2, color: "var(--quantum-cyan)" },
              { left: 30, dur: 20, delay: 6, size: 3, color: "var(--quantum-blue)" },
              { left: 82, dur: 12, delay: 4, size: 2, color: "var(--quantum-violet)" },
              { left: 8, dur: 18, delay: 9, size: 2, color: "var(--quantum-cyan)" },
            ].map((p, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${p.left}%`,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.color,
                  opacity: 0.5,
                }}
              />
            ))}
          </div>

          {/* Radial glow */}
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(96,165,250,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(167,139,250,0.07) 0%, transparent 60%)",
            }}
          />

          <ThreadListSidebar />

          <SidebarInset style={{ zIndex: 1, position: "relative" }}>
            {/* Header */}
            <header
              className="flex h-auto shrink-0 flex-col"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(7, 7, 20, 0.7)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Top row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-5 opacity-30" />

                {/* Logo + Brand */}
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="quantum-glow"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(96,165,250,0.8), rgba(167,139,250,0.8))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" fill="white" />
                      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="white" strokeWidth="1.5" fill="none" />
                      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="white" strokeWidth="1.5" fill="none" transform="rotate(60 12 12)" />
                      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="white" strokeWidth="1.5" fill="none" transform="rotate(120 12 12)" />
                    </svg>
                  </div>

                  <div>
                    <h1
                      className="quantum-gradient-text font-bold leading-none"
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem", letterSpacing: "-0.02em" }}
                    >
                      Quantum AI
                    </h1>
                    <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginTop: 1 }}>
                      NEXT-GEN INTELLIGENCE
                    </p>
                  </div>

                  {/* Active API badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: `${active.color}15`,
                      border: `1px solid ${active.color}40`,
                      fontSize: "0.65rem",
                      color: active.color,
                      letterSpacing: "0.05em",
                      fontWeight: 600,
                      marginLeft: 8,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {active.icon} {active.label} · {active.model}
                  </div>
                </div>

                {/* Status badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    fontSize: "0.7rem",
                    color: "#4ade80",
                    letterSpacing: "0.05em",
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4ade80",
                      display: "inline-block",
                      boxShadow: "0 0 8px #4ade80",
                      animation: "quantum-pulse 2s ease-in-out infinite",
                    }}
                  />
                  ONLINE
                </div>

                <Separator orientation="vertical" className="h-5 opacity-30" />

                {/* User Profile / Login */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-[0.7rem] font-bold text-white tracking-wide">
                      {user?.username || "Quantum Explorer"}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {user ? "Personal Workspace" : "Guest Access"}
                    </span>
                  </div>
                  <div className="group relative">
                    <button 
                      className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                    </button>
                    {/* Tooltip/Menu */}
                    <div className="absolute right-0 top-full mt-3 w-48 bg-[#0a0a1f] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[100] backdrop-blur-3xl">
                      <button 
                        onClick={() => router.push("/login")}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <button 
                         onClick={handleLogout}
                         className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Switcher Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px 10px",
                }}
              >
                <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
                  API
                </span>

                {API_OPTIONS.map((option) => {
                  const isActive = selectedModel === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedModel(option.id)}
                      title={`Switch to ${option.label} (${option.sublabel})`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        borderRadius: 999,
                        border: `1px solid ${isActive ? option.color : "rgba(255,255,255,0.1)"}`,
                        background: isActive ? `${option.color}18` : "rgba(255,255,255,0.03)",
                        color: isActive ? option.color : "rgba(255,255,255,0.45)",
                        fontSize: "0.75rem",
                        fontWeight: isActive ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        outline: "none",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem" }}>{option.icon}</span>
                      <span>{option.label}</span>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          color: isActive ? `${option.color}bb` : "rgba(255,255,255,0.25)",
                          fontWeight: 400,
                        }}
                      >
                        {option.sublabel}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: option.color,
                            boxShadow: `0 0 6px ${option.color}`,
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </button>
                  );
                })}

                {/* Separator + model info */}
                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>
                  Model: <span style={{ color: active.color, fontWeight: 500 }}>{active.model}</span>
                </span>
              </div>
            </header>

            <div className="flex-1 overflow-hidden" style={{ position: "relative", zIndex: 1 }}>
              <Thread />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
