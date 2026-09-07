import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, Message, Settings, defaultSettings, Notification } from '../types';
import { generateId } from '../lib/utils';

interface AppState {
  chats: Chat[];
  settings: Settings;
  activeChatId: string | null;
  isSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  notifications: Notification[];
  lastConnectedNode: string | null;
  
  // Actions
  addChat: (chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  setActiveChat: (id: string | null) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  clearHistory: () => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  setLastConnectedNode: (node: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      chats: [],
      settings: defaultSettings,
      activeChatId: null,
      isSidebarOpen: false,
      isCommandPaletteOpen: false,
      notifications: [],
      lastConnectedNode: null,

      addChat: (chatData) => {
        const id = generateId();
        const now = Date.now();
        const newChat: Chat = {
          ...chatData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ chats: [newChat, ...state.chats] }));
        return id;
      },

      updateChat: (id, updates) => {
        set((state) => ({
          chats: state.chats.map((c) => 
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        }));
      },

      deleteChat: (id) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          activeChatId: state.activeChatId === id ? null : state.activeChatId,
        }));
      },

      addMessage: (chatId, msg) => {
        const message: Message = { ...msg, id: generateId(), timestamp: Date.now() };
        set((state) => ({
          chats: state.chats.map((c) => {
            if (c.id === chatId) {
              const messages = [...c.messages, message];
              // Auto-generate title from first user message if title is 'New Chat'
              let title = c.title;
              if (messages.length === 1 && c.title === 'New Chat' && message.role === 'user') {
                title = message.text.slice(0, 30) + (message.text.length > 30 ? '...' : '');
              }
              return { ...c, messages, title, updatedAt: Date.now() };
            }
            return c;
          })
        }));
      },

      setActiveChat: (id) => set({ activeChatId: id }),
      
      updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
      
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      
      setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
      
      clearHistory: () => set({ chats: [], activeChatId: null }),

      togglePin: (id) => set((state) => ({
        chats: state.chats.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c)
      })),

      toggleFavorite: (id) => set((state) => ({
        chats: state.chats.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)
      })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [{ ...notification, id: generateId(), timestamp: Date.now(), read: false }, ...state.notifications].slice(0, 50)
      })),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      
      setLastConnectedNode: (node) => set({ lastConnectedNode: node }),
    }),
    {
      name: 'ai-app-storage',
      partialize: (state) => ({ 
        chats: state.chats, 
        settings: state.settings,
        lastConnectedNode: state.lastConnectedNode
      }), // Save chats, settings, and last connected node
    }
  )
);
