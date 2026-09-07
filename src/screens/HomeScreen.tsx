import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight, AlignLeft, Sparkles, ChevronRight, MessageSquare, Mic, Image, Code, Network, Code2 } from 'lucide-react';
import { useAppStore } from '../store';
import { formatDate } from '../lib/utils';

export function HomeScreen({ navigateTo }: { navigateTo: (screen: any) => void }) {
  const { chats, setActiveChat, settings } = useAppStore();
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleOpenChat = (id: string, type: string) => {
    setActiveChat(id);
    navigateTo(type === 'voice' ? 'voice' : type === 'image' ? 'image' : 'chat');
  };

  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-main)] p-6 relative overflow-hidden"
    >
      {settings.graphicsLevel !== 'minimalist' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            animate={settings.graphicsLevel === 'hd_max' ? { 
              scale: [1, 1.2, 1],
              x: [0, 40, 0],
              y: [0, 30, 0]
            } : {}}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-[-20%] left-[-20%] w-[350px] h-[350px] bg-[var(--accent)] rounded-full mix-blend-screen ${settings.graphicsLevel === 'hd_max' ? 'blur-[120px] opacity-40' : 'blur-[80px] opacity-20'}`} 
          />
          <motion.div 
            animate={settings.graphicsLevel === 'hd_max' ? { 
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 20, 0]
            } : {}}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-[10%] right-[-10%] w-[300px] h-[300px] bg-[#9c27b0] rounded-full mix-blend-screen ${settings.graphicsLevel === 'hd_max' ? 'blur-[100px] opacity-30' : 'blur-[80px] opacity-15'}`} 
          />
          {settings.graphicsLevel === 'hd_max' && (
            <motion.div 
              animate={{ scale: [1, 1.4, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-[#ff8a65] rounded-full blur-[140px] opacity-20 mix-blend-screen" 
            />
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-4 relative z-10">
        <button 
          onClick={() => navigateTo('settings')}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#9c27b0] flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
        >
          <AlignLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
        <button onClick={() => navigateTo('settings')} className="px-5 py-2.5 bg-black rounded-full text-[13px] font-semibold border border-white/20 shadow-sm flex items-center gap-2 group text-white">
          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 group-hover:border-white/40 transition-colors">
            <img src={settings.userAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <span className="truncate max-w-[80px]">{settings.userName}</span>
        </button>
      </div>

      <h1 className="text-[34px] font-bold mb-6 leading-[1.15] relative z-10 tracking-tight text-[var(--text-main)]">
        Create, explore,<br/>be inspired
      </h1>

      <div className="relative mb-6 z-10">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..." 
          className={`w-full bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-full py-4 pl-14 pr-4 focus:outline-none text-[15px] text-[var(--text-main)] placeholder:text-[var(--text-muted)] ${settings.graphicsLevel !== 'minimalist' ? 'shadow-inner' : ''}`}
        />
        {search && (
           <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] shadow-xl overflow-hidden max-h-60 z-50">
             {filteredChats.map(c => (
               <button key={c.id} onClick={() => handleOpenChat(c.id, c.type)} className="w-full p-4 text-left border-b border-[var(--border-color)] hover:bg-[var(--text-main)]/5 flex items-center gap-3">
                 <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
                 <div className="flex-1 truncate">{c.title}</div>
               </button>
             ))}
             {filteredChats.length === 0 && <div className="p-4 text-[var(--text-muted)] text-center">No results</div>}
           </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 z-10">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveChat(null); navigateTo('chat'); }} 
          className={`aspect-[1.1] rounded-[28px] border border-[var(--border-color)] p-5 flex flex-col justify-between cursor-pointer transition-all group ${settings.graphicsLevel === 'hd_max' ? 'bg-[var(--bg-surface)]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/10' : settings.graphicsLevel !== 'minimalist' ? 'bg-[var(--bg-panel)] backdrop-blur-md' : 'bg-[var(--bg-panel)]'}`}
        >
          <span className="font-semibold text-[17px] leading-[1.2] tracking-wide flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
            AI text<br/>writer
          </span>
          <div className="w-9 h-9 rounded-[10px] border border-[var(--border-color)] flex items-center justify-center self-end bg-[var(--bg-base)] group-hover:bg-[var(--text-main)]/5 transition-colors shadow-sm">
            <ArrowUpRight className="w-4 h-4 text-[var(--text-main)]" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveChat(null); navigateTo('image'); }} 
          className={`aspect-[1.1] rounded-[28px] border border-[var(--border-color)] p-5 flex flex-col justify-between cursor-pointer transition-all group ${settings.graphicsLevel === 'hd_max' ? 'bg-[var(--bg-surface)]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/10' : settings.graphicsLevel !== 'minimalist' ? 'bg-[var(--bg-panel)] backdrop-blur-md' : 'bg-[var(--bg-panel)]'}`}
        >
          <span className="font-semibold text-[17px] leading-[1.2] tracking-wide flex items-center gap-2">
            <Image className="w-4 h-4 text-[var(--text-muted)]" />
            AI image<br/>generator
          </span>
          <div className="w-9 h-9 rounded-[10px] border border-[var(--border-color)] flex items-center justify-center self-end bg-[var(--bg-base)] group-hover:bg-[var(--text-main)]/5 transition-colors shadow-sm">
            <ArrowUpRight className="w-4 h-4 text-[var(--text-main)]" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveChat(null); navigateTo('p2p'); }} 
          className={`aspect-[1.1] rounded-[28px] border border-[var(--border-color)] p-5 flex flex-col justify-between cursor-pointer transition-all group ${settings.graphicsLevel === 'hd_max' ? 'bg-[var(--bg-surface)]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/10' : settings.graphicsLevel !== 'minimalist' ? 'bg-[var(--bg-panel)] backdrop-blur-md' : 'bg-[var(--bg-panel)]'}`}
        >
          <span className="font-semibold text-[17px] leading-[1.2] tracking-wide flex items-center gap-2">
            <Network className="w-4 h-4 text-[var(--text-muted)]" />
            P2P Node<br/>Network
          </span>
          <div className="w-9 h-9 rounded-[10px] border border-[var(--border-color)] flex items-center justify-center self-end bg-[var(--bg-base)] group-hover:bg-[var(--text-main)]/5 transition-colors shadow-sm">
            <ArrowUpRight className="w-4 h-4 text-[var(--text-main)]" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveChat(null); navigateTo('code'); }} 
          className={`aspect-[1.1] rounded-[28px] border border-[var(--border-color)] p-5 flex flex-col justify-between cursor-pointer transition-all group ${settings.graphicsLevel === 'hd_max' ? 'bg-[var(--bg-surface)]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/10' : settings.graphicsLevel !== 'minimalist' ? 'bg-[var(--bg-panel)] backdrop-blur-md' : 'bg-[var(--bg-panel)]'}`}
        >
          <span className="font-semibold text-[17px] leading-[1.2] tracking-wide flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[var(--text-muted)]" />
            Code HTML<br/>Creator
          </span>
          <div className="w-9 h-9 rounded-[10px] border border-[var(--border-color)] flex items-center justify-center self-end bg-[var(--bg-base)] group-hover:bg-[var(--text-main)]/5 transition-colors shadow-sm">
            <ArrowUpRight className="w-4 h-4 text-[var(--text-main)]" />
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between items-end mb-4 z-10">
        <h2 className="text-[19px] font-bold tracking-wide">History</h2>
        <span className="text-[12px] text-[var(--text-muted)] font-medium mb-1 cursor-pointer">See all</span>
      </div>

      <div className="flex flex-col z-10 flex-1 overflow-y-auto pb-4 custom-scrollbar">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] space-y-3">
             <MessageSquare className="w-8 h-8 opacity-50" />
             <p className="text-sm">No chats yet. Start a new one!</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} onClick={() => handleOpenChat(chat.id, chat.type)} className="flex items-center gap-4 cursor-pointer py-3.5 group relative">
              <div className="w-8 h-8 rounded-full flex items-center justify-center relative bg-[var(--bg-surface)] shrink-0 overflow-hidden border border-[var(--border-color)]">
                {chat.type === 'image' ? <Image className="w-4 h-4 text-[var(--accent)]" /> : 
                 chat.type === 'voice' ? <Mic className="w-4 h-4 text-[var(--accent)]" /> :
                 chat.type === 'code' ? <Code className="w-4 h-4 text-[var(--accent)]" /> :
                 <Sparkles className="w-4 h-4 text-[var(--accent)]" strokeWidth={2.5} />}
              </div>
              <div className="flex-1 flex flex-col justify-center overflow-hidden">
                <h3 className="font-semibold text-[15px] mb-0.5 truncate pr-8">{chat.title}</h3>
                <p className="text-[13px] text-[var(--text-muted)] truncate w-full">{formatDate(chat.updatedAt)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)] shrink-0 group-hover:text-[var(--text-main)] transition-colors" />
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
