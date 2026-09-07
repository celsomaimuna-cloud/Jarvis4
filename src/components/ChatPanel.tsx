import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Play, Copy, RefreshCcw } from 'lucide-react';
import { Message } from '../types';

type Props = {
  messages: Message[];
  isGenerating: boolean;
  autoScroll: boolean;
  onSpeak: (text: string) => void;
};

export function ChatPanel({ messages, isGenerating, autoScroll, onSpeak }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, autoScroll]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <p className="font-medium tracking-wide text-sm">Jarvis Systems Online</p>
        </div>
      )}

      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col \${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-5 py-3 ${
              msg.role === 'user'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm'
                : 'bg-transparent text-zinc-900 dark:text-zinc-100 rounded-tl-sm'
            }`}
          >
            {msg.role === 'model' ? (
              <div className="markdown-body prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 text-sm">
                <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            )}
          </div>

          {/* Action Row for Model */}
          {msg.role === 'model' && (
            <div className="flex items-center gap-2 mt-2 ml-2 opacity-50 hover:opacity-100 transition-opacity">
              <button onClick={() => onSpeak(msg.text)} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors group relative">
                <Play className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors group relative">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      ))}

      {isGenerating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
          <div className="px-5 py-3 flex items-center gap-2">
             <div className="flex gap-1">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
             </div>
          </div>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
