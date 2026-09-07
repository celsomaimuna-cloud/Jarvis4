import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Network, Copy, Check, Users, LogOut, Paperclip, FileText } from 'lucide-react';
import { useAppStore } from '../store';
import { db, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from '../lib/firebase';

export function P2PScreen({ navigateTo }: { navigateTo: (screen: any) => void }) {
  const { settings, lastConnectedNode, setLastConnectedNode, addNotification } = useAppStore();
  const [roomId, setRoomId] = useState(lastConnectedNode || '');
  const [isConnected, setIsConnected] = useState(!!lastConnectedNode);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<() => void>();

  useEffect(() => {
    if (isConnected && roomId) {
      connectToRoom(roomId);
    }
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectToRoom = (id: string) => {
    const q = query(
      collection(db, 'p2p_rooms', id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    }, (error) => {
      console.error("Firebase listen error:", error);
      addNotification({ type: 'error', message: 'Connection lost to Node network', effect: 'shake' });
    });
  };

  const handleConnect = () => {
    if (!roomId.trim()) return;
    setIsConnected(true);
    setLastConnectedNode(roomId);
    connectToRoom(roomId);
    addNotification({ type: 'success', message: `Connected to Node ${roomId}`, effect: 'pulse' });
  };

  const generateRoom = () => {
    setRoomId(Math.random().toString(36).substring(2, 8).toUpperCase());
  };

  const copyRoom = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;
    
    const text = input;
    setInput('');
    
    try {
      await addDoc(collection(db, 'p2p_rooms', roomId, 'messages'), {
        text,
        sender: settings.userName,
        avatar: settings.userAvatar,
        timestamp: serverTimestamp(),
        type: 'text'
      });
    } catch (err) {
      console.error("Send error", err);
      addNotification({ type: 'error', message: 'Failed to send message' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isConnected) return;

    // Fast P2P file sending via base64 for simplicity in this version
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        await addDoc(collection(db, 'p2p_rooms', roomId, 'messages'), {
          text: file.name,
          fileData: base64Data,
          fileType: file.type,
          sender: settings.userName,
          avatar: settings.userAvatar,
          timestamp: serverTimestamp(),
          type: 'file'
        });
        addNotification({ type: 'success', message: 'File sent securely via network', effect: 'sparkle' });
      } catch (err) {
        console.error("Send error", err);
        addNotification({ type: 'error', message: 'File too large or network error', effect: 'shake' });
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setLastConnectedNode(null);
    setRoomId('');
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = undefined;
    }
    addNotification({ type: 'info', message: 'Disconnected from Node' });
  };

  const handleBack = () => {
    // Just navigate back, stay connected in background
    navigateTo('home');
  };

  return (
    <motion.div 
      key="p2p"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-main)] relative overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 pt-6 relative z-10 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
        <button onClick={handleBack} className="p-2 -ml-2 text-[var(--text-muted)] hover:bg-[var(--text-main)]/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="font-semibold tracking-wide">P2P Node Network</h2>
        </div>
        <div className="w-10 flex items-center justify-end text-[var(--text-muted)] text-sm">
           {isConnected && <div className="flex items-center gap-1"><Users className="w-4 h-4"/> <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"/></div>}
        </div>
      </div>

      {!isConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mb-4 border border-[var(--accent)]/30">
             <Network className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Connect to a Node</h3>
            <p className="text-[var(--text-muted)] text-sm">Enter a Room ID to connect to other users in real-time, or generate a new one to invite others.</p>
          </div>
          
          <div className="w-full max-w-sm space-y-4 pt-4">
            <div className="relative flex items-center bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] p-2">
               <input 
                 type="text" 
                 value={roomId} 
                 onChange={e => setRoomId(e.target.value.toUpperCase())}
                 placeholder="ROOM ID (e.g. ABCD12)"
                 className="w-full bg-transparent p-2 text-center text-lg font-bold tracking-widest focus:outline-none"
               />
               <button onClick={copyRoom} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]">
                 {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
               </button>
            </div>
            
            <button 
              onClick={handleConnect}
              disabled={!roomId.trim()}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold disabled:opacity-50 transition-transform active:scale-95 shadow-md"
            >
              Connect to Swarm
            </button>
            <button 
              onClick={generateRoom}
              className="w-full py-3 rounded-xl bg-transparent border border-[var(--border-color)] font-medium hover:bg-[var(--text-main)]/5 transition-colors"
            >
              Generate New ID
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10 bg-[var(--bg-base)]">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] my-4 px-2">
               <div>Connected to Room: <span className="font-bold">{roomId}</span></div>
               <button onClick={handleDisconnect} className="flex items-center gap-1 hover:text-red-400 transition-colors">
                 <LogOut className="w-3.5 h-3.5" /> Leave Room
               </button>
            </div>
            
            {messages.map((msg) => {
              const isMe = msg.sender === settings.userName;
              return (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'}`}>
                  {!isMe && <span className="text-[11px] text-[var(--text-muted)] ml-1 mb-1 font-medium">{msg.sender}</span>}
                  <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--border-color)] mt-auto">
                      <img src={msg.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender}`} alt="Avatar" className="w-full h-full object-cover bg-[var(--bg-surface)]" />
                    </div>
                    <div className={`rounded-[20px] px-4 py-2 text-[14.5px] break-all ${
                      isMe 
                        ? 'bg-[var(--accent)] text-white rounded-tr-sm' 
                        : 'bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-tl-sm'
                    }`}>
                      {msg.type === 'file' ? (
                        <a href={msg.fileData} download={msg.text} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
                          {msg.fileType?.startsWith('image/') ? (
                             <img src={msg.fileData} alt={msg.text} className="max-w-[150px] max-h-[150px] rounded-md object-cover" />
                          ) : (
                             <div className="w-12 h-12 bg-black/20 rounded-lg flex items-center justify-center">
                               <FileText className="w-6 h-6" />
                             </div>
                          )}
                          <span className="text-xs truncate max-w-[150px] underline">{msg.text}</span>
                        </a>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} className="h-2" />
          </div>

          <div className="shrink-0 p-4 bg-[var(--bg-base)] border-t border-[var(--border-color)] z-20">
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--text-main)]/5 shrink-0 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Broadcast to swarm..." 
                className="flex-1 bg-[var(--bg-surface)] h-12 rounded-full pl-4 pr-4 focus:outline-none border border-[var(--border-color)]"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
