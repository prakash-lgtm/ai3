"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Thread {
  id: string;
  title: string;
  updatedAt: string;
}

interface ThreadListProps {
  onSelectThread: (id: string) => void;
  currentThreadId: string | null;
}

export const ThreadList: React.FC<ThreadListProps> = ({ onSelectThread, currentThreadId }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/threads");
      const data = await res.json();
      if (data.threads) {
        setThreads(data.threads);
      }
    } catch (e) {
      console.error("Failed to load threads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
    // Poll for updates every 30 seconds or we can just hope onFinish handles it
    const interval = setInterval(fetchThreads, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteThread = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    
    try {
      await fetch(`/api/threads/${id}`, { method: "DELETE" });
      setThreads(threads.filter(t => t.id !== id));
      if (currentThreadId === id) {
        onSelectThread("new");
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <Button
        onClick={() => onSelectThread("new")}
        variant="outline"
        className={cn(
          "w-full h-11 justify-start gap-3 rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white hover:text-white transition-all mb-4",
          !currentThreadId && "border-blue-500/50 bg-blue-500/10"
        )}
      >
        <PlusIcon className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-bold uppercase tracking-widest">New Protocol</span>
      </Button>

      {threads.length === 0 ? (
        <div className="py-10 text-center px-4">
          <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
            No Quantum History
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all border border-transparent",
                currentThreadId === thread.id 
                  ? "bg-white/[0.07] border-white/10 shadow-lg" 
                  : "hover:bg-white/[0.04]"
              )}
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                currentThreadId === thread.id ? "bg-blue-400 animate-pulse" : "bg-white/10"
              )} />
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[11px] font-bold truncate tracking-wide",
                  currentThreadId === thread.id ? "text-white" : "text-gray-400"
                )}>
                  {thread.title || "Quantum Session"}
                </p>
                <p className="text-[9px] text-gray-600 font-medium">
                  {new Date(thread.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <button 
                onClick={(e) => handleDeleteThread(e, thread.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
