export type Role = 'user' | 'model';

export interface Attachment {
  mimeType: string;
  data: string; // base64 string
  name?: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Chat {
  id: string;
  title: string;
  type: 'text' | 'image' | 'voice' | 'code' | 'p2p';
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  isPinned?: boolean;
  isFavorite?: boolean;
}

export type Theme = 'dark' | 'midnight' | 'amoled' | 'light' | 'system' | 'android' | 'mobile_dex' | 'iphone' | 'desktop' | 'dinamico_plus' | 'hd_amoled_plus' | 'ultra_plus' | 'desempenho_maximo';
export type AccentColor = 'purple' | 'pink' | 'blue' | 'cyan' | 'green' | 'orange' | 'red';
export type GraphicsLevel = 'minimalist' | 'hd' | 'hd_plus' | 'hd_max';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'error' | 'ai';
  message: string;
  timestamp: number;
  read: boolean;
  effect?: 'sparkle' | 'shake' | 'glow' | 'pulse';
}

export interface Settings {
  theme: Theme;
  accentColor: AccentColor;
  graphicsLevel: GraphicsLevel;
  apiKey: string;
  systemPrompt: string;
  autoSave: boolean;
  reducedMotion: boolean;
  uiDensity: 'compact' | 'comfortable';
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  transparency: boolean;
  
  // Profile Improvements
  userName: string;
  userAvatar: string;
  userBanner: string;
  userBio: string;
  aboutMe: string;
  language: string;
  joinDate: number;
}

export const defaultSettings: Settings = {
  theme: 'midnight',
  accentColor: 'pink',
  graphicsLevel: 'hd',
  apiKey: '',
  systemPrompt: 'You are a helpful and inspiring AI assistant.',
  autoSave: true,
  reducedMotion: false,
  uiDensity: 'comfortable',
  fontSize: 'medium',
  borderRadius: 'md',
  transparency: true,
  
  // Profile Defaults
  userName: 'Creator',
  userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix', // Anime-style avatar
  userBanner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', // Anime/Cool banner
  userBio: 'Exploring the edge of AI',
  aboutMe: 'I like concise and clear answers.',
  language: 'English',
  joinDate: Date.now(),
};
