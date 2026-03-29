import * as React from "react";
import { BrainCircuit, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThreadList } from "@/components/assistant-ui/thread-list";

interface ThreadListSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSelectThread: (id: string) => void;
  currentThreadId: string | null;
}

export function ThreadListSidebar({
  onSelectThread,
  currentThreadId,
  ...props
}: ThreadListSidebarProps) {
  return (
    <Sidebar {...props}>
      {/* Sidebar Header — Quantum AI Brand */}
      <SidebarHeader
        className="mb-2"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "16px 12px",
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1">
              {/* Quantum atom icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(96,165,250,0.9), rgba(167,139,250,0.9))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 0 16px rgba(96,165,250,0.35)",
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
                <p
                  className="quantum-gradient-text font-bold"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1rem",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Quantum AI
                </p>
                <p
                  style={{
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.1em",
                    marginTop: 1,
                  }}
                >
                  CONVERSATIONS
                </p>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Thread List */}
      <SidebarContent className="px-2 overflow-y-auto">
        <ThreadList onSelectThread={onSelectThread} currentThreadId={currentThreadId} />
      </SidebarContent>

      <SidebarRail />

      {/* Sidebar Footer */}
      <SidebarFooter
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "12px",
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: "0.75rem",
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "0.5rem",
                    background: "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(96,165,250,0.3))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Zap size={15} style={{ color: "#4ade80" }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                    OpenRouter · Groq
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>
                    Llama 3.3 · 70B
                  </p>
                </div>
                <BrainCircuit size={13} style={{ color: "#a78bfa", marginLeft: "auto", opacity: 0.7 }} />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
