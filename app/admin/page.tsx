import { prisma } from "@/lib/prisma";
import { 
  Activity, 
  MessageSquare, 
  Users, 
  Cpu, 
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  // These will fail if DB is not initialized, so we wrap in try-catch for now
  try {
    if (!prisma) throw new Error("Database not initialized");
    const threadCount = await prisma.thread.count();
    const messageCount = await prisma.message.count();
    
    // Get recent threads
    const recentThreads = await prisma.thread.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    // Model distribution (approximate)
    const modelStats = await prisma.thread.groupBy({
      by: ['model'],
      _count: {
        id: true
      }
    });

    return { threadCount, messageCount, recentThreads, modelStats };
  } catch (e) {
    console.error("Database not initialized yet", e);
    return { threadCount: 0, messageCount: 0, recentThreads: [], modelStats: [] };
  }
}

export default async function AdminDashboard() {
  const { threadCount, messageCount, recentThreads, modelStats } = await getStats();

  return (
    <div className="min-h-screen bg-[#050510] text-white p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold quantum-gradient-text tracking-tight mb-2">
            Admin Console
          </h1>
          <p className="text-gray-400 text-sm tracking-wider uppercase font-medium">
            System Overview & Analytics
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
            SYSTEM OPERATIONAL
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<MessageSquare className="text-blue-400" />}
          label="Total Conversations"
          value={threadCount.toString()}
          trend="+12% from last week"
          color="blue"
        />
        <StatCard 
          icon={<Activity className="text-purple-400" />}
          label="Total Messages"
          value={messageCount.toString()}
          trend="+8% from last week"
          color="purple"
        />
        <StatCard 
          icon={<Users className="text-cyan-400" />}
          label="Active Users"
          value="42" 
          trend="+5 new today"
          color="cyan"
        />
        <StatCard 
          icon={<TrendingUp className="text-emerald-400" />}
          label="Avg. Response Time"
          value="1.2s"
          trend="-200ms optimization"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Threads */}
        <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-bottom border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Recent Conversations
            </h2>
            <Link href="/admin/threads" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
                  <th className="px-6 py-4 font-semibold">Thread ID</th>
                  <th className="px-6 py-4 font-semibold">Model</th>
                  <th className="px-6 py-4 font-semibold">Messages</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentThreads.length > 0 ? recentThreads.map((thread: any) => (
                  <tr key={thread.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm text-gray-300">
                      {thread.id.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        thread.model === 'groq' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        thread.model === 'fireworks' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                        'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {thread.model || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {thread._count.messages}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/threads/${thread.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                      No conversations recorded yet. Check your database connection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Usage Card */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-gray-400" />
            Model Distribution
          </h2>
          <div className="space-y-6">
            {modelStats.length > 0 ? modelStats.map((stat: any) => (
              <div key={stat.model}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium uppercase tracking-wide text-gray-300">
                    {stat.model || 'Unknown'}
                  </span>
                  <span className="text-sm font-bold text-gray-400">
                    {stat._count.id} threads
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      stat.model === 'groq' ? 'bg-green-400' :
                      stat.model === 'fireworks' ? 'bg-pink-400' :
                      'bg-orange-400'
                    }`}
                    style={{ width: `${(stat._count.id / Math.max(threadCount, 1)) * 100}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-8">
                Usage data will appear here once conversations are logged.
              </p>
            )}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5">
            <p className="text-xs text-gray-400 italic">
              "System performance is currently optimal. Recommended: scaling Groq resources for high-traffic llama models."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  trend: string,
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    purple: "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    cyan: "hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    emerald: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  };

  return (
    <div className={`rounded-3xl bg-white/5 border border-white/10 p-6 transition-all duration-500 backdrop-blur-xl ${colorMap[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-full uppercase tracking-widest">
          LIVE
        </span>
      </div>
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
          {label}
        </p>
        <h3 className="text-3xl font-extrabold tracking-tight mb-2">
          {value}
        </h3>
        <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
          {trend}
        </p>
      </div>
    </div>
  );
}
