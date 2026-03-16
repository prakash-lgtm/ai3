import { prisma } from "@/lib/prisma";
import { 
  ChevronLeft, 
  MessageSquare, 
  User, 
  Bot, 
  Calendar, 
  Cpu,
  Hash
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getThreadDetail(id: string) {
  try {
    if (!prisma) return null;
    const thread = await prisma.thread.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    return thread;
  } catch (e) {
    console.error("Database error", e);
    return null;
  }
}

export default async function ThreadDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const thread = await getThreadDetail(id);

  if (!thread) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white p-8 font-sans">
      {/* Header */}
      <div className="mb-12 flex justify-between items-start">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/threads" 
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">Conversation Detail</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                thread.model === 'groq' ? 'bg-green-500/10 text-green-400' :
                'bg-pink-500/10 text-pink-400'
              }`}>
                {thread.model}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium tracking-wider">
              <span className="flex items-center gap-1.5 uppercase">
                <Hash className="w-3 h-3" /> {thread.id}
              </span>
              <span className="flex items-center gap-1.5 uppercase">
                <Calendar className="w-3 h-3" /> {new Date(thread.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all uppercase tracking-widest">
            Delete Archive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
              Session Metadata
            </h3>
            <div className="space-y-4">
              <MetaItem label="Model" value={thread.model || 'Unknown'} icon={<Cpu className="w-4 h-4" />} />
              <MetaItem label="Total Messages" value={thread.messages.length.toString()} icon={<MessageSquare className="w-4 h-4" />} />
              <MetaItem label="Created At" value={new Date(thread.createdAt).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
            </div>
          </div>
        </div>

        {/* Chat Log */}
        <div className="lg:col-span-3 space-y-6">
          {thread.messages.map((message: any) => (
            <div 
              key={message.id} 
              className={`flex gap-6 p-8 rounded-[2rem] border transition-all duration-500 ${
                message.role === 'user' 
                ? 'bg-white/[0.03] border-white/10 ml-12' 
                : 'bg-blue-500/[0.02] border-blue-500/10 mr-12'
              }`}
            >
              <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xl ${
                message.role === 'user'
                ? 'bg-white/5 border-white/10'
                : 'bg-blue-500/10 border-blue-500/20'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-6 h-6 text-gray-400" />
                ) : (
                  <Bot className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    message.role === 'user' ? 'text-gray-500' : 'text-blue-400'
                  }`}>
                    {message.role === 'user' ? 'Subject' : 'Quantum AI Engine'}
                  </span>
                  <span className="text-[10px] text-gray-600 font-medium">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {thread.messages.length === 0 && (
            <div className="py-20 text-center text-gray-500 italic">
              No messages found in this thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors">
      <div className="p-2 rounded-xl bg-white/5 text-gray-500">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-200">{value}</p>
      </div>
    </div>
  );
}
