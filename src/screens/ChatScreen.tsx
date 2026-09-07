import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MoreVertical, Plus, Mic, Copy, ThumbsUp, ThumbsDown, RotateCcw, Sparkles, Volume2, ArrowDown, Download, Share, Trash2, Paperclip, X, StopCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../store';
import { exportChat } from '../lib/utils';
import { Attachment } from '../types';

export function ChatScreen({ navigateTo }: { navigateTo: (screen: any) => void }) {
  const { chats, activeChatId, addChat, addMessage, deleteChat, settings } = useAppStore();
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);
  
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    audioRef.current = new Audio();
    return () => { if (audioRef.current) audioRef.current.pause(); }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isGenerating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSend();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, isGenerating]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = (event.target.result as string).split(',')[1];
          setAttachments(prev => [...prev, { mimeType: file.type, data: base64, name: file.name }]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64 = (event.target.result as string).split(',')[1];
            setAttachments(prev => [...prev, { mimeType: 'audio/webm', data: base64, name: 'Voice Note' }]);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;
    
    let chatId = activeChatId;
    if (!chatId) {
      chatId = addChat({ title: 'New Chat', type: 'text', messages: [] });
      useAppStore.getState().setActiveChat(chatId);
    }
    
    addMessage(chatId, { role: 'user', text: input, attachments: [...attachments] });
    setInput('');
    setAttachments([]);
    setIsGenerating(true);

    try {
      const currentChat = useAppStore.getState().chats.find(c => c.id === chatId);
      const formattedMessages = currentChat!.messages.map(m => ({
        role: m.role,
        parts: [
          ...(m.text ? [{ text: m.text }] : []),
          ...(m.attachments ? m.attachments.map(a => ({ inlineData: { mimeType: a.mimeType, data: a.data } })) : [])
        ]
      }));
      
      const fullSystemPrompt = settings.systemPrompt + 
        (settings.aboutMe ? `\n\nAbout the user:\nName: ${settings.userName}\n${settings.aboutMe}` : '');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedMessages,
          engine: 'gemini',
          system: fullSystemPrompt,
          apiKey: settings.apiKey,
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        addMessage(chatId, { role: 'model', text: data.text });
      } else {
         addMessage(chatId, { role: 'model', text: `Error: ${data.error}` });
      }
    } catch (err) {
      addMessage(chatId, { role: 'model', text: 'Network connection error. Please check your internet.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeak = async (text: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, apiKey: settings.apiKey })
      });
      const data = await res.json();
      if (res.ok && data.audio && audioRef.current) {
        audioRef.current.src = `data:${data.mimeType};base64,${data.audio}`;
        audioRef.current.play();
      }
    } catch (err) {
      console.error("TTS failed", err);
    }
  };

  return (
    <motion.div 
      key="chat"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-main)] relative"
      onClick={() => { setContextMenu(null); setShowMenu(false); }}
    >
      <div className="flex items-center justify-between p-4 pt-6 relative z-20 bg-[var(--bg-base)]">
        <button onClick={() => navigateTo('home')} className="p-2 -ml-2 text-[var(--text-muted)] hover:bg-[var(--text-main)]/10 rounded-full">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-center justify-center overflow-hidden px-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="font-semibold text-[15px] tracking-wide truncate max-w-[200px]">{activeChat?.title || 'New Chat'}</h2>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{messages.length > 0 ? `${messages.length} messages` : 'AI Assistant'}</p>
        </div>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-2 -mr-2 text-[var(--text-muted)] hover:bg-[var(--text-main)]/10 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-surface)] rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden z-50">
              <button onClick={() => { if(activeChat) exportChat(activeChat, 'md'); setShowMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-[var(--text-main)]/5 flex items-center gap-3">
                <Download className="w-4 h-4" /> Export as MD
              </button>
              <button onClick={() => { if(activeChatId && confirm('Delete this chat?')) { deleteChat(activeChatId); navigateTo('home'); } }} className="w-full px-4 py-3 text-left hover:bg-red-500/10 text-red-400 flex items-center gap-3 border-t border-[var(--border-color)]">
                <Trash2 className="w-4 h-4" /> Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-7 relative z-10 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-80 px-6 text-center">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#9c27b0] flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-bold mb-2">How can I help you today?</h3>
             <p className="text-sm text-[var(--text-muted)] max-w-[250px]">Send a message to start chatting with the AI.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <motion.div 
            initial={settings.graphicsLevel !== 'minimalist' ? { opacity: 0, y: 15, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            key={msg.id} 
            className={`flex gap-3 max-w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ id: msg.id, x: e.clientX, y: e.clientY });
            }}
          >
            {msg.role === 'user' && (
               <div className="flex flex-col gap-1 w-6 shrink-0 mt-auto mb-1 items-center justify-end">
                  <div className="w-5 h-5 rounded-full border border-[var(--accent)] flex items-center justify-center bg-black">
                     <Plus className="w-3 h-3 text-[var(--accent)]" />
                  </div>
               </div>
            )}

            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               <div className="flex gap-2">
                 {msg.role === 'model' && (
                   <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center shrink-0 mt-1">
                     <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                   </div>
                 )}
                 <div className={`max-w-[280px] md:max-w-[500px] rounded-[24px] px-5 py-4 flex flex-col ${
                   msg.role === 'user'
                     ? settings.graphicsLevel === 'hd_max'
                       ? 'bg-gradient-to-br from-[#ff8a65] via-[var(--accent)] to-[#9c27b0] text-white rounded-br-sm shadow-[0_8px_16px_rgba(0,0,0,0.2)]'
                       : 'bg-gradient-to-br from-[#ff8a65] via-[var(--accent)] to-[#9c27b0] text-white rounded-br-sm shadow-md'
                     : settings.graphicsLevel === 'hd_max'
                       ? 'bg-[var(--bg-surface)]/70 backdrop-blur-xl text-[var(--text-main)] rounded-bl-sm border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.15)]'
                       : 'bg-[var(--bg-surface)] text-[var(--text-main)] rounded-bl-sm border border-[var(--border-color)] shadow-sm'
                 }`}>
                   {msg.attachments && msg.attachments.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-2">
                       {msg.attachments.map((a, i) => (
                         <div key={i} className="max-w-full rounded-lg overflow-hidden border border-white/20 bg-black/10">
                           {a.mimeType.startsWith('image/') ? (
                             <img src={`data:${a.mimeType};base64,${a.data}`} alt="attachment" className="max-w-full h-auto max-h-48 object-contain" />
                           ) : a.mimeType.startsWith('audio/') ? (
                             <audio controls src={`data:${a.mimeType};base64,${a.data}`} className="h-10 max-w-[200px]" />
                           ) : (
                             <div className="px-3 py-2 text-sm flex items-center gap-2"><Paperclip className="w-4 h-4"/> {a.name || 'File'}</div>
                           )}
                         </div>
                       ))}
                     </div>
                   )}
                   {msg.role === 'model' ? (
                     <div className="text-[14.5px] leading-[1.6] font-medium markdown-body">
                       <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                     </div>
                   ) : (
                     <p className="text-[14.5px] leading-[1.5] font-medium whitespace-pre-wrap">{msg.text}</p>
                   )}
                 </div>
                 {msg.role === 'user' && (
                   <div className="w-6 h-6 rounded-full bg-white shrink-0 mt-1 overflow-hidden border border-white/20">
                     <img src={settings.userAvatar} alt="User" className="w-full h-full object-cover" />
                   </div>
                 )}
               </div>
               
               {msg.role === 'model' && (
                 <div className="flex items-center gap-4 mt-3 ml-10 text-[var(--text-muted)]">
                   <button onClick={() => navigator.clipboard.writeText(msg.text)} className="hover:text-[var(--text-main)] transition-colors"><Copy className="w-[15px] h-[15px]" /></button>
                   <button className="hover:text-[var(--text-main)] transition-colors"><ThumbsUp className="w-[15px] h-[15px]" /></button>
                   <button className="hover:text-[var(--text-main)] transition-colors"><ThumbsDown className="w-[15px] h-[15px]" /></button>
                   <button onClick={() => handleSpeak(msg.text)} className="hover:text-[var(--text-main)] transition-colors"><Volume2 className="w-[15px] h-[15px]" /></button>
                   <button className="hover:text-[var(--text-main)] transition-colors"><RotateCcw className="w-[15px] h-[15px]" /></button>
                 </div>
               )}
            </div>
          </motion.div>
        ))}
        {isGenerating && (
          <div className="flex gap-3 max-w-full justify-start">
             <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center shrink-0 mt-1">
               <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
             </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] px-5 py-4 rounded-[24px] rounded-bl-sm flex gap-1.5 items-center">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[var(--text-main)]/60 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[var(--text-main)]/60 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[var(--text-main)]/60 rounded-full" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-4" />
      </div>

      <div className="shrink-0 p-4 bg-[var(--bg-base)] border-t border-[var(--border-color)] z-20 flex flex-col gap-2">
        {attachments.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {attachments.map((a, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--border-color)] shrink-0 bg-[var(--bg-surface)] flex items-center justify-center">
                {a.mimeType.startsWith('image/') ? (
                  <img src={`data:${a.mimeType};base64,${a.data}`} alt="attachment" className="w-full h-full object-cover" />
                ) : a.mimeType.startsWith('audio/') ? (
                  <Volume2 className="w-6 h-6 text-[var(--accent)]" />
                ) : (
                  <Paperclip className="w-6 h-6 text-[var(--text-muted)]" />
                )}
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 w-full">
          <div className="flex flex-col items-center">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,audio/*,text/plain" multiple className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-full border border-[var(--accent)] flex items-center justify-center shrink-0 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition-colors">
               <Plus className="w-4 h-4 text-[var(--accent)]" />
             </button>
          </div>
          <div className="flex-1 flex items-center bg-[var(--bg-surface)] rounded-3xl pr-1.5 focus-within:ring-1 focus-within:ring-[var(--border-color)] transition-colors min-h-14 border border-[var(--border-color)] overflow-hidden">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder={isRecording ? `Recording... ${Math.floor(recordingTime/60)}:${(recordingTime%60).toString().padStart(2, '0')}` : "Send message..."} 
              disabled={isRecording}
              className="flex-1 bg-transparent h-14 pl-5 py-4 focus:outline-none text-[16px] text-[var(--text-main)] placeholder:text-[var(--text-muted)] resize-none disabled:opacity-50"
            />
            <div className="flex items-center pr-1 gap-1 shrink-0">
              {isRecording ? (
                <button onClick={stopRecording} className="p-2 text-red-500 hover:text-red-400 transition-colors animate-pulse">
                  <StopCircle className="w-[20px] h-[20px]" />
                </button>
              ) : (
                <button onClick={startRecording} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  <Mic className="w-[18px] h-[18px]" />
                </button>
              )}
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isGenerating || isRecording}
                className="w-9 h-9 rounded-full border border-[var(--border-color)] flex items-center justify-center disabled:opacity-50 hover:bg-[var(--text-main)]/10 transition-colors bg-[var(--text-main)]/5"
              >
                <ArrowDown className="w-5 h-5 text-[var(--text-main)]" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[var(--bg-surface)] rounded-lg shadow-2xl py-1 border border-[var(--border-color)] text-[var(--text-main)]"
          style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 150) }}
        >
          <button 
            className="w-full px-4 py-2 text-left hover:bg-[var(--text-main)]/10 text-sm flex items-center gap-2"
            onClick={() => {
              const msg = messages.find(m => m.id === contextMenu.id);
              if (msg) navigator.clipboard.writeText(msg.text);
              setContextMenu(null);
            }}
          >
            <Copy className="w-4 h-4" /> Copy Text
          </button>
        </div>
      )}
    </motion.div>
  );
}
