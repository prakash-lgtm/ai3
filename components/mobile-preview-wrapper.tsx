"use client";

import { useState, useEffect } from "react";
import { Smartphone, Monitor } from "lucide-react";

export function MobilePreviewWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("mobile-preview-preference");
    if (saved === "true") {
      setIsMobileView(true);
    }
  }, []);

  const toggleView = () => {
    const newState = !isMobileView;
    setIsMobileView(newState);
    localStorage.setItem("mobile-preview-preference", String(newState));
  };

  // Before hydration, just render children directly to prevent mismatch
  // We use a fragment to match layout shape
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <div
      className={
        isMobileView
          ? "flex h-screen w-full items-center justify-center bg-zinc-900 dark:bg-zinc-950 relative overflow-hidden"
          : "contents"
      }
    >
      <button
        onClick={toggleView}
        className="fixed bottom-4 right-4 z-[9999] p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        title={isMobileView ? "Switch to Desktop View" : "Simulate Mobile View"}
      >
        {isMobileView ? <Monitor className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
      </button>

      {/* Main Content Area */}
      <div
        className={
          isMobileView
            ? "relative w-[375px] h-[812px] bg-background rounded-[2.5rem] border-8 border-zinc-950 dark:border-zinc-800 overflow-hidden shadow-2xl shrink-0"
            : "contents"
        }
      >
        {/* Fake mobile notch for aesthetic */}
        {isMobileView && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-950 dark:bg-zinc-800 rounded-b-xl z-50 pointer-events-none" />
        )}
        
        <div className={isMobileView ? "w-full h-full overflow-y-auto overflow-x-hidden bg-background" : "contents"}>
          {children}
        </div>
      </div>
    </div>
  );
}
