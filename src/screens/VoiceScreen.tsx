import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MoreVertical, Mic, X, RotateCcw, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';

export function VoiceScreen({ navigateTo }: { navigateTo: (screen: any) => void }) {
  const { activeChatId, chats, addMessage, addChat, settings } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const activeChat = chats.find(c => c.id === activeChatId);
  const meshRings = settings.graphicsLevel === 'minimalist' ? 8 : settings.graphicsLevel === 'hd' ? 24 : settings.graphicsLevel === 'hd_plus' ? 36 : 48;

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsSpeaking(false);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          setIsListening(false);
          handleSendVoice(transcript);
        }
      };
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSendVoice = async (text: string) => {
    if (!text.trim()) return;
    
    let chatId = activeChatId;
    if (!chatId) {
      chatId = addChat({ title: text.slice(0, 20), type: 'voice', messages: [] });
      useAppStore.getState().setActiveChat(chatId);
    }
    
    addMessage(chatId, { role: 'user', text });
    setIsSpeaking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', parts: [{ text }] }],
          engine: 'gemini',
          apiKey: settings.apiKey,
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        addMessage(chatId, { role: 'model', text: data.text });
        
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.text, apiKey: settings.apiKey })
        });
        const ttsData = await ttsRes.json();
        if (ttsRes.ok && ttsData.audio && audioRef.current) {
          audioRef.current.src = `data:${ttsData.mimeType};base64,${ttsData.audio}`;
          audioRef.current.play();
        } else {
          setIsSpeaking(false);
        }
      } else {
         setIsSpeaking(false);
      }
    } catch (err) {
      setIsSpeaking(false);
    }
  };

  return (
    <motion.div 
      key="voice"
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-main)] relative overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 pt-6 relative z-10">
        <button onClick={() => navigateTo('home')} className="p-2 -ml-2 text-[var(--text-muted)] hover:bg-[var(--text-main)]/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="font-semibold text-[15px] tracking-wide">Voice Assistant</h2>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{activeChat?.title || 'New Session'}</p>
        </div>
        <button className="p-2 -mr-2 text-[var(--text-muted)] hover:bg-[var(--text-main)]/10 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pb-20">
        <div className="relative w-[280px] h-[280px] flex items-center justify-center mb-6">
          <motion.div 
            animate={{ 
              rotateZ: [0, 360],
              rotateY: isListening || isSpeaking ? [0, 180, 360] : [0, 20, 0],
              rotateX: isListening || isSpeaking ? [0, -180, -360] : [0, 15, 0],
              scale: isListening ? [1, 1.25, 1] : isSpeaking ? [1, 1.3, 1] : [1, 1.05, 1] 
            }}
            transition={{ 
              rotateZ: { duration: 25, repeat: Infinity, ease: "linear" }, 
              rotateY: { duration: 20, repeat: Infinity, ease: "easeInOut" },
              rotateX: { duration: 22, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: isListening || isSpeaking ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" } 
            }}
            className="absolute inset-0 z-20 opacity-90 mix-blend-screen"
            style={{ perspective: "1000px" }}
          >
             <svg viewBox="0 0 100 100" className={`w-full h-full ${settings.graphicsLevel === 'hd_max' ? 'drop-shadow-[0_0_25px_var(--accent)]' : settings.graphicsLevel !== 'minimalist' ? 'drop-shadow-[0_0_10px_var(--accent)]' : ''}`}>
               <defs>
                 <linearGradient id="meshGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="var(--accent)" />
                   <stop offset="100%" stopColor="#9c27b0" />
                 </linearGradient>
                 <linearGradient id="meshGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
                   <stop offset="0%" stopColor="#ff8a65" />
                   <stop offset="100%" stopColor="var(--accent)" />
                 </linearGradient>
                 {settings.graphicsLevel === 'hd_max' && (
                    <filter id="max-glow">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                 )}
               </defs>
               
               <g transform="translate(50, 50)" filter={settings.graphicsLevel === 'hd_max' ? "url(#max-glow)" : undefined}>
                 {[...Array(meshRings)].map((_, i) => {
                   const angle = (i * (360/meshRings)) * (Math.PI / 180);
                   const cx = Math.cos(angle) * 12;
                   const cy = Math.sin(angle) * 12;
                   const strokeColor = i % 2 === 0 && settings.graphicsLevel === 'hd_max' ? "url(#meshGrad2)" : "url(#meshGrad1)";
                   return (
                     <ellipse key={`h-${i}`} cx={cx} cy={cy} rx="38" ry="16" fill="none" stroke={strokeColor} strokeWidth={settings.graphicsLevel === 'minimalist' ? "0.6" : settings.graphicsLevel === 'hd_max' ? "0.4" : "0.3"} transform={`rotate(${i * (360/meshRings)})`} style={{ opacity: settings.graphicsLevel === 'hd_max' ? 0.8 : 0.6 }} />
                   );
                 })}
               </g>
             </svg>
          </motion.div>
          
          {settings.graphicsLevel !== 'minimalist' && (
             <div className={`absolute inset-4 bg-gradient-to-tr from-[#9c27b0] via-[var(--accent)] to-[#ff8a65] rounded-full blur-[50px] z-10 transition-all duration-500 ${isListening || isSpeaking ? 'opacity-90 scale-110' : 'opacity-40 scale-100'}`} />
          )}
        </div>

        <div className="text-center max-w-[300px] mx-auto px-4 mt-4 h-24 flex items-center justify-center">
          <p className="text-[20px] font-medium leading-[1.3] tracking-tight text-[var(--text-main)] inline transition-opacity">
             {transcript ? transcript : isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap the mic and speak"}
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-between z-10 w-full px-12">
        <button onClick={() => setTranscript('')} className="w-11 h-11 rounded-full border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors bg-transparent">
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <div className="relative">
          {isListening && settings.graphicsLevel !== 'minimalist' && <div className="absolute inset-[-12px] bg-gradient-to-r from-[#ff8a65] via-[var(--accent)] to-[#9c27b0] blur-xl opacity-60 rounded-full animate-pulse pointer-events-none" />}
          <button 
            onClick={toggleListening} 
            className={`w-[72px] h-[72px] rounded-full flex items-center justify-center relative z-10 shadow-lg active:scale-95 transition-all ${isListening ? 'bg-white text-black' : 'bg-gradient-to-br from-[#ff8a65] via-[var(--accent)] to-[#9c27b0] text-white'}`}
          >
            <Mic className={`w-7 h-7`} />
          </button>
        </div>

        <button onClick={() => navigateTo('chat')} className="w-11 h-11 rounded-full border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors bg-transparent">
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
