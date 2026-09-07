import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from './store';
import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { VoiceScreen } from './screens/VoiceScreen';
import { ImageScreen } from './screens/ImageScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CommandPalette } from './components/CommandPalette';
import { WifiOff } from 'lucide-react';

import { P2PScreen } from './screens/P2PScreen';
import { CodeScreen } from './screens/CodeScreen';

import { NotificationCenter } from './components/NotificationCenter';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'chat' | 'voice' | 'image' | 'settings' | 'p2p' | 'code'>('home');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [tipIndex, setTipIndex] = useState(0);
  
  const { settings } = useAppStore();

  const marketingTips = [
    "Tip: You can use your AI offline for previously cached chats!",
    "Tip: Share your AI generated images on social media to boost engagement!",
    "Tip: Use the command palette (Cmd+K) to navigate faster!",
    "Tip: Personalize your AI in Profile Settings for better answers.",
    "Tip: Export your chats as JSON to back them up locally."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isOffline) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % marketingTips.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isOffline, marketingTips.length]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${settings.theme}`);
  }, [settings.theme]);

  const navigateTo = (screen: any) => {
    setCurrentScreen(screen);
  };

  const accentHex = {
    purple: '#9c27b0',
    pink: '#ff3366',
    blue: '#2196f3',
    cyan: '#00bcd4',
    green: '#4caf50',
    orange: '#ff9800',
    red: '#f44336'
  }[settings.accentColor] || '#ff3366';

  return (
    <div 
      className={`min-h-[100dvh] bg-[var(--bg-base)] flex items-center justify-center font-sans p-0 md:p-8 relative overflow-hidden ${settings.reducedMotion ? 'reduce-motion' : ''}`}
      style={{ '--accent': accentHex } as any}
    >
      <NotificationCenter />
      {settings.graphicsLevel === 'hd_max' && (
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <motion.div 
            animate={{ 
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,var(--accent)_0%,transparent_60%)] opacity-30 blur-[100px]"
          />
        </div>
      )}

      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[var(--accent)] to-[#9c27b0] text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 z-[9999] shadow-md animate-in slide-in-from-top">
          <WifiOff className="w-3.5 h-3.5 shrink-0" /> 
          <span className="truncate">{marketingTips[tipIndex]}</span>
        </div>
      )}

      <div className="w-full h-[100dvh] md:w-[390px] md:h-[844px] md:rounded-[45px] md:border-[12px] md:border-[#111] bg-[var(--bg-base)] overflow-hidden relative shadow-2xl flex flex-col">
        <div className="h-8 w-full shrink-0 hidden md:block" />
        
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && <HomeScreen navigateTo={navigateTo} />}
          {currentScreen === 'chat' && <ChatScreen navigateTo={navigateTo} />}
          {currentScreen === 'voice' && <VoiceScreen navigateTo={navigateTo} />}
          {currentScreen === 'image' && <ImageScreen navigateTo={navigateTo} />}
          {currentScreen === 'p2p' && <P2PScreen navigateTo={navigateTo} />}
          {currentScreen === 'code' && <CodeScreen navigateTo={navigateTo} />}
          {currentScreen === 'settings' && <SettingsScreen onBack={() => navigateTo('home')} />}
        </AnimatePresence>
        
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[4px] bg-[var(--text-main)]/30 rounded-full z-50 hidden md:block pointer-events-none" />
      </div>

      <CommandPalette navigateTo={navigateTo} />
    </div>
  );
}
