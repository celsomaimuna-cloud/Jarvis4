import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2, Cpu, Palette, ScrollText } from 'lucide-react';
import { Settings } from '../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (s: Settings) => void;
};

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-zinc-500" />
                <h3 className="text-zinc-900 dark:text-zinc-100 font-medium">Settings</h3>
              </div>
              <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Engine Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Cpu className="w-4 h-4" /> AI Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSettingsChange({ ...settings, engine: 'gemini' })}
                    className={`p-3 rounded-lg border transition-all ${settings.engine === 'gemini' ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 font-medium' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                  >
                    Gemini 3.1
                  </button>
                  <button
                    onClick={() => onSettingsChange({ ...settings, engine: 'claude' })}
                    className={`p-3 rounded-lg border transition-all ${settings.engine === 'claude' ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 font-medium' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                  >
                    Claude 3.5
                  </button>
                </div>
              </div>

              {/* Persona Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <ScrollText className="w-4 h-4" /> System Persona
                </label>
                <select
                  value={settings.persona}
                  onChange={(e) => onSettingsChange({ ...settings, persona: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg p-3 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
                >
                  <option value="You are Jarvis, an elite AI assistant by Playbox 2026. Be concise, highly technical, and professional.">Jarvis (Elite AI)</option>
                  <option value="You are a helpful coding assistant. Provide detailed explanations.">Helpful Coder</option>
                  <option value="You are a creative UI designer. Think out of the box.">Creative Designer</option>
                </select>
              </div>

              {/* Auto Scroll Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Auto-Scroll Chat</label>
                <button
                  onClick={() => onSettingsChange({ ...settings, autoScroll: !settings.autoScroll })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${settings.autoScroll ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                >
                  <motion.div
                    layout
                    className="w-5 h-5 bg-white dark:bg-zinc-900 rounded-full absolute top-0.5 shadow-sm"
                    animate={{ left: settings.autoScroll ? '22px' : '2px' }}
                  />
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50 dark:bg-zinc-900/50">
              <button onClick={onClose} className="px-5 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 rounded-lg transition-opacity font-medium text-sm">
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
