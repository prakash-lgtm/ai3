import { prisma } from "@/lib/prisma";
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  ExternalLink,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

async function getThreads() {
  try {
    if (!prisma) return [];
    return await prisma.thread.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
  } catch (e) {
    console.error("Database error", e);
    return [];
  }
}

export default async function AdminThreadsPage() {
  const threads = await getThreads();

  return (
    <div className="min-h-screen bg-[#050510] text-white p-8 font-sans">
      {/* Breadcrumb & Navigation */}
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href="/admin" 
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversation Logs</h1>
          <p className="text-xs text-gray-500 tracking-wider uppercase font-medium mt-1">
            Browser through all system interactions
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by Thread ID or content..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-sm font-medium hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4" />
          More Filters
        </button>
      </div>

      {/* Threads Table */}
      <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-8 py-6 font-semibold">Thread Identity</th>
                <th className="px-8 py-6 font-semibold">Artificial Intelligence Model</th>
                <th className="px-8 py-6 font-semibold">Message Count</th>
                <th className="px-8 py-6 font-semibold">Created Date</th>
                <th className="px-8 py-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {threads.length > 0 ? threads.map((thread: any) => (
                <tr key={thread.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="font-mono text-sm text-gray-300">
                        {thread.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      thread.model === 'groq' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      thread.model === 'fireworks' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                      'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {thread.model || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium">
                      {thread._count.messages}
                      <span className="text-gray-500 ml-1 font-normal uppercase text-[9px] tracking-tighter">msgs</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400">
                    {new Date(thread.createdAt).toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <Link 
                      href={`/admin/threads/${thread.id}`}
                      className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      INSPECT
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <MessageSquare className="w-12 h-12 opacity-10" />
                      <p className="italic">No conversations found in the archive.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
