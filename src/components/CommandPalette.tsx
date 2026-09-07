import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Settings as SettingsIcon, Image, Mic, X } from 'lucide-react';
import { useAppStore } from '../store';

export function CommandPalette({ navigateTo }: { navigateTo: (screen: any) => void }) {
  const { isCommandPaletteOpen, setCommandPaletteOpen, chats, setActiveChat } = useAppStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[var(--bg-surface)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden z-10"
          >
            <div className="flex items-center p-4 border-b border-[var(--border-color)]">
              <Search className="w-5 h-5 text-[var(--text-muted)] mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search chats, tools, or commands..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)] text-lg"
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="p-1 rounded hover:bg-[var(--text-main)]/10 text-[var(--text-muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {search === '' && (
                <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Quick Actions</div>
              )}
              {search === '' && [
                { icon: MessageSquare, label: 'New Text Chat', action: () => { setActiveChat(null); navigateTo('chat'); setCommandPaletteOpen(false); } },
                { icon: Image, label: 'AI Image Generator', action: () => { setActiveChat(null); navigateTo('image'); setCommandPaletteOpen(false); } },
                { icon: Mic, label: 'Voice Chat', action: () => { setActiveChat(null); navigateTo('voice'); setCommandPaletteOpen(false); } },
                { icon: SettingsIcon, label: 'Settings', action: () => { navigateTo('settings'); setCommandPaletteOpen(false); } }
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={item.action}
                  className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-[var(--bg-panel)] transition-colors text-left text-[var(--text-main)]"
                >
                  <item.icon className="w-5 h-5 mr-3 text-[var(--text-muted)]" />
                  <span>{item.label}</span>
                </button>
              ))}

              {(search !== '' || filteredChats.length > 0) && (
                <div className="px-3 py-2 mt-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Chats</div>
              )}
              {filteredChats.map(chat => (
                <button 
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat.id);
                    navigateTo(chat.type === 'voice' ? 'voice' : chat.type === 'image' ? 'image' : 'chat');
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-[var(--bg-panel)] transition-colors text-left text-[var(--text-main)]"
                >
                  <MessageSquare className="w-5 h-5 mr-3 text-[var(--text-muted)]" />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate">{chat.title}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{new Date(chat.updatedAt).toLocaleDateString()}</div>
                  </div>
                </button>
              ))}
              
              {search !== '' && filteredChats.length === 0 && (
                <div className="p-8 text-center text-[var(--text-muted)]">No results found for "{search}"</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
