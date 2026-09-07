import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Image as ImageIcon, Download, Sparkles, Send } from 'lucide-react';
import { useAppStore } from '../store';

export function ImageScreen({ navigateTo }: { navigateTo: (screen: any) => void }) {
  const { addChat, addMessage, activeChatId, chats, settings } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const latestImage = activeChat?.messages.filter(m => m.role === 'model' && m.text.startsWith('data:image')).pop()?.text;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setError(null);
    setIsGenerating(true);
    
    let chatId = activeChatId;
    if (!chatId) {
      chatId = addChat({ title: prompt.slice(0, 20), type: 'image', messages: [] });
      useAppStore.getState().setActiveChat(chatId);
    }
    
    addMessage(chatId, { role: 'user', text: prompt });

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey: settings.apiKey }),
      });
      const data = await res.json();
      
      if (res.ok && data.image) {
        addMessage(chatId, { role: 'model', text: `data:${data.mimeType};base64,${data.image}` });
      } else {
        setError(data.error || "Failed to generate image.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (latestImage) {
      const a = document.createElement('a');
      a.href = latestImage;
      a.download = `generated-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <motion.div 
      key="image"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-main)] relative overflow-hidden"
    >
      {settings.graphicsLevel === 'hd_max' && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-[var(--accent)] rounded-full blur-[120px] mix-blend-screen"
          />
        </div>
      )}

      <div className="flex items-center p-4 pt-6 relative z-10 bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-transparent">
        <button onClick={() => navigateTo('home')} className="p-2 -ml-2 text-[var(--text-muted)] hover:bg-[var(--text-main)]/10 rounded-full">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex-1 flex justify-center items-center gap-2">
           <ImageIcon className="w-5 h-5 text-[var(--accent)]" />
           <span className="font-semibold text-[15px] tracking-wide">Image Generator</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex-1 w-full bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] flex items-center justify-center overflow-hidden relative group shadow-lg">
          {isGenerating ? (
            <div className="flex flex-col items-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                <Sparkles className="w-10 h-10 text-[var(--accent)] opacity-50" />
              </motion.div>
              <p className="mt-4 text-[var(--text-muted)] text-sm animate-pulse">Generating your image...</p>
            </div>
          ) : latestImage ? (
            <>
              <img src={latestImage} alt="Generated" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                 <button onClick={handleDownload} className="px-6 py-3 bg-white text-black font-semibold rounded-full flex items-center gap-2 hover:scale-105 transition-transform">
                   <Download className="w-4 h-4" /> Download
                 </button>
              </div>
            </>
          ) : (
            <div className="text-[var(--text-muted)] flex flex-col items-center">
              <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
              <p>Describe an image to generate</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="shrink-0 mt-6 space-y-4">
           <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] p-2 flex items-center">
             <input 
               type="text" 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
               placeholder="Describe what you want to see..."
               className="flex-1 bg-transparent border-none outline-none text-[16px] px-4 placeholder:text-[var(--text-muted)] text-[var(--text-main)]"
             />
             <button 
               onClick={handleGenerate}
               disabled={!prompt.trim() || isGenerating}
               className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center disabled:opacity-50 hover:opacity-80 transition-opacity"
             >
               <Send className="w-4 h-4 text-white" />
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
