import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { Info, CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';

export function NotificationCenter() {
  const { notifications, markNotificationRead } = useAppStore();
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3); // Max 3 visible at once

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {unreadNotifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md min-w-[280px] max-w-sm
              ${notif.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-100' : ''}
              ${notif.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-100' : ''}
              ${notif.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-100' : ''}
              ${notif.type === 'ai' ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' : ''}
              ${notif.effect === 'glow' ? 'shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]' : ''}
              ${notif.effect === 'shake' ? 'animate-[shake_0.5s_ease-in-out]' : ''}
              ${notif.effect === 'pulse' ? 'animate-pulse' : ''}
            `}
          >
            {notif.effect === 'sparkle' && (
               <Sparkles className="absolute top-1 right-1 w-8 h-8 text-[var(--accent)] opacity-20 animate-spin-slow" />
            )}
            
            <div className="shrink-0 mt-0.5">
              {notif.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
              {notif.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
              {notif.type === 'ai' && <Sparkles className="w-5 h-5 text-[var(--accent)]" />}
            </div>
            
            <div className="flex-1 text-sm font-medium pr-6 leading-tight text-[var(--text-main)]">
              {notif.message}
            </div>
            
            <button 
              onClick={() => markNotificationRead(notif.id)}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-black/20 text-[var(--text-muted)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Auto-dismiss timeout bar */}
            <motion.div 
               initial={{ width: '100%' }}
               animate={{ width: '0%' }}
               transition={{ duration: 4, ease: 'linear' }}
               onAnimationComplete={() => markNotificationRead(notif.id)}
               className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
