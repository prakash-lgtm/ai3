import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { History, MessageSquare, Calendar, Clock, ChevronRight, Search, Filter } from "lucide-react";
import Link from "next/link";

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const threads = await prisma.thread.findMany({
    where: { userId: (session as any).id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { messages: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#050510] text-white p-4 md:p-10 font-outfit relative overflow-hidden">
      {/* Background Energy */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-128 bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
              <History className="w-10 h-10 text-blue-500" />
              Intelligence Log
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">
              Previous Quantum Conversations
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search matrix..." 
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm w-64 uppercase tracking-widest font-bold"
              />
            </div>
            <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </header>

        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 border border-dashed border-white/10 rounded-[40px] bg-white/[0.01]">
             <MessageSquare className="w-16 h-16 text-gray-700 mb-6" />
             <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400">No Data History Found</h3>
             <p className="text-gray-600 text-sm mt-2 font-medium">Initiate your first stream to start logging data.</p>
             <Link href="/" className="mt-8 px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-110 transition-all">
                Start New Stream
             </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {threads.map((thread) => (
              <Link 
                key={thread.id} 
                href={`/?threadId=${thread.id}`}
                className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-[32px] p-6 transition-all duration-300 flex items-center justify-between overflow-hidden shadow-lg hover:shadow-blue-500/10"
              >
                {/* Hover Accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300">
                    <MessageSquare className="w-6 h-6 text-blue-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                      {thread.title || "Untitled Intelligence Stream"}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          {new Date(thread.updatedAt).toLocaleDateString()}
                       </span>
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                       <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-500/60 uppercase tracking-widest">
                          {thread._count.messages} Fragments
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="text-right hidden md:block">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Model</p>
                      <p className="text-xs font-bold text-blue-400/80 uppercase">{thread.model || "Quantum v1"}</p>
                   </div>
                   <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}

        <footer className="mt-20 pt-10 border-t border-white/5 flex items-center justify-between text-gray-700">
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Quantum Data History • Encryption Active</p>
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">v3.5.0-STABLE</p>
        </footer>
      </div>
    </div>
  );
}
