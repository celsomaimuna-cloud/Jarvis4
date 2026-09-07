import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Trash2, Key, Moon, Monitor, Eye, Download, Info, Settings as SettingsIconSVG, Image as ImageIcon, User, Edit3, MessageSquare, Activity, Globe } from 'lucide-react';
import { useAppStore } from '../store';
import { Theme, AccentColor } from '../types';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings, clearHistory, chats } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [tempApiKey, setTempApiKey] = useState(settings.apiKey || '');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Stats calculation
  const totalChats = chats.length;
  const totalMessages = chats.reduce((acc, chat) => acc + chat.messages.length, 0);
  const joinDateStr = new Date(settings.joinDate).toLocaleDateString();

  const themes: { id: Theme, name: string }[] = [
    { id: 'dark', name: 'Dark' },
    { id: 'midnight', name: 'Midnight' },
    { id: 'amoled', name: 'AMOLED' },
    { id: 'light', name: 'Light' },
    { id: 'system', name: 'System' },
    { id: 'android', name: 'Android' },
    { id: 'mobile_dex', name: 'Mobile Dex' },
    { id: 'iphone', name: 'iPhone' },
    { id: 'desktop', name: 'Desktop' },
    { id: 'dinamico_plus', name: 'DINÂMICO+' },
    { id: 'hd_amoled_plus', name: 'HD AMOLED+' },
    { id: 'ultra_plus', name: 'ULTRA+' },
    { id: 'desempenho_maximo', name: 'DESEMPENHO MÁXIMO' },
  ];

  const colors: { id: AccentColor, hex: string }[] = [
    { id: 'purple', hex: '#9c27b0' },
    { id: 'pink', hex: '#ff3366' },
    { id: 'blue', hex: '#2196f3' },
    { id: 'cyan', hex: '#00bcd4' },
    { id: 'green', hex: '#4caf50' },
    { id: 'orange', hex: '#ff9800' },
    { id: 'red', hex: '#f44336' },
  ];

  const avatars = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jude',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Liliana',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Mason',
  ];

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', parts: [{ text: 'ping' }] }],
          engine: 'gemini',
          apiKey: tempApiKey
        })
      });
      if (res.ok) setConnectionStatus('success');
      else setConnectionStatus('error');
    } catch (e) {
      setConnectionStatus('error');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSettings({ userAvatar: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSettings({ userBanner: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'general', label: 'General', icon: SettingsIconSVG },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'api', label: 'API & AI', icon: Key },
    { id: 'data', label: 'Data & Storage', icon: Download },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-main)]">
      <div className="flex items-center p-4 border-b border-[var(--border-color)]">
        <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full hover:bg-[var(--bg-surface)]">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r border-[var(--border-color)] p-4 space-y-1 hidden md:block overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[var(--text-main)]/10 text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]'}`}
            >
              <tab.icon className="w-4 h-4 mr-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="flex overflow-x-auto space-x-2 pb-4 mb-6 md:hidden scrollbar-hide">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border ${activeTab === tab.id ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)]' : 'border-[var(--border-color)] text-[var(--text-muted)]'}`}
               >
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Profile Header & Cover */}
                <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-color)]">
                  <div className="h-32 bg-gradient-to-r from-[var(--accent)] to-[#9c27b0] opacity-80 relative overflow-hidden">
                    <img src={settings.userBanner} alt="Banner" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                    <input type="file" id="bannerUpload" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                    <label htmlFor="bannerUpload" className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full cursor-pointer hover:bg-black/70 backdrop-blur-sm transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </label>
                  </div>
                  <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end">
                      <div className="-mt-12 relative">
                        <div className="w-24 h-24 rounded-full border-4 border-[var(--bg-surface)] overflow-hidden bg-[var(--bg-base)]">
                          <img src={settings.userAvatar} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleAvatarUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-surface)] flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
                        >
                          <Edit3 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Pro Member</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <input 
                        type="text" 
                        value={settings.userName} 
                        onChange={e => updateSettings({ userName: e.target.value })}
                        className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-[var(--border-color)] rounded px-1 -ml-1 w-full"
                        placeholder="Your Name"
                      />
                      <input 
                        type="text" 
                        value={settings.userBio} 
                        onChange={e => updateSettings({ userBio: e.target.value })}
                        className="text-sm text-[var(--text-muted)] bg-transparent border-none outline-none focus:ring-1 focus:ring-[var(--border-color)] rounded px-1 -ml-1 w-full mt-1"
                        placeholder="Your Bio"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[var(--text-muted)]" /> Choose Avatar</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {avatars.map((url, i) => (
                      <button 
                        key={i} 
                        onClick={() => updateSettings({ userAvatar: url })}
                        className={`w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 transition-all ${settings.userAvatar === url ? 'border-[var(--accent)] scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={url} alt={`Avatar ${i+1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Context (About Me) */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-[var(--text-muted)]" /> Personalization Context</label>
                  <p className="text-xs text-[var(--text-muted)]">This context will be provided to the AI to personalize responses for you.</p>
                  <textarea
                    value={settings.aboutMe}
                    onChange={e => updateSettings({ aboutMe: e.target.value })}
                    placeholder="E.g., I'm a developer learning React. Keep answers concise."
                    className="w-full h-24 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] resize-none text-sm"
                  />
                </div>

                {/* Region & Language */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-[var(--text-muted)]" /> Preferred Language</label>
                  <select 
                    value={settings.language} 
                    onChange={e => updateSettings({ language: e.target.value })}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] appearance-none"
                  >
                    <option value="English">English</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-1">
                    <div className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Total Chats</div>
                    <div className="text-2xl font-bold">{totalChats}</div>
                  </div>
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-1">
                    <div className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3" /> Messages</div>
                    <div className="text-2xl font-bold">{totalMessages}</div>
                  </div>
                </div>
                
                <div className="text-center text-xs text-[var(--text-muted)]">
                  Joined on {joinDateStr}
                </div>
              </motion.div>
            )}

            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2">General Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Save</div>
                    <div className="text-sm text-[var(--text-muted)]">Automatically save chats to local storage</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.autoSave} onChange={e => updateSettings({ autoSave: e.target.checked })} />
                    <div className="w-11 h-6 bg-[var(--text-muted)]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reduced Motion</div>
                    <div className="text-sm text-[var(--text-muted)]">Disable UI animations for better performance</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.reducedMotion} onChange={e => updateSettings({ reducedMotion: e.target.checked })} />
                    <div className="w-11 h-6 bg-[var(--text-muted)]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                  </label>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2 mb-4">Theme</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {themes.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => updateSettings({ theme: t.id })}
                        className={`flex items-center justify-center py-3 px-4 rounded-xl border ${settings.theme === t.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-main)]' : 'border-[var(--border-color)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}
                      >
                        {t.id === 'system' ? <Monitor className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2 mb-4">Graphics Quality</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'minimalist', name: 'Minimalist' },
                      { id: 'hd', name: 'HD' },
                      { id: 'hd_plus', name: 'HD+' },
                      { id: 'hd_max', name: 'HD Maximum' }
                    ].map(g => (
                      <button 
                        key={g.id}
                        onClick={() => updateSettings({ graphicsLevel: g.id as any })}
                        className={`flex items-center justify-center py-2 px-3 rounded-xl border text-sm font-medium ${settings.graphicsLevel === g.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-main)] shadow-[0_0_10px_var(--accent)]' : 'border-[var(--border-color)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">Higher settings enable heavy SVG filters and blurs.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2 mb-4">Accent Color</h3>
                  <div className="flex flex-wrap gap-4">
                    {colors.map(c => (
                      <button
                        key={c.id}
                        onClick={() => updateSettings({ accentColor: c.id })}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform ${settings.accentColor === c.id ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'api' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2">API Configuration</h3>
                
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl">
                   <p className="text-sm text-[var(--text-muted)] mb-4">
                     The application uses a secure server-side proxy. Enter your API key below if you wish to override the default.
                   </p>
                   
                   <div className="space-y-3">
                     <label className="text-sm font-medium">Gemini API Key</label>
                     <div className="flex gap-2">
                       <input
                         type="password"
                         value={tempApiKey}
                         onChange={e => setTempApiKey(e.target.value)}
                         placeholder="••••••••••••••••••••••••••••••"
                         className="flex-1 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                       />
                       <button 
                         onClick={() => updateSettings({ apiKey: tempApiKey })}
                         className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-80 flex items-center gap-2"
                       >
                         <Save className="w-4 h-4" /> Save
                       </button>
                     </div>
                   </div>

                   <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-color)]">
                     <div className="flex items-center gap-3">
                       <button onClick={handleTestConnection} className="px-4 py-2 bg-[var(--text-main)]/10 hover:bg-[var(--text-main)]/20 rounded-lg text-sm font-medium">
                         Test Connection
                       </button>
                       {connectionStatus === 'testing' && <span className="text-yellow-500 text-sm">Testing...</span>}
                       {connectionStatus === 'success' && <span className="text-green-500 text-sm">Connected successfully!</span>}
                       {connectionStatus === 'error' && <span className="text-red-500 text-sm">Connection failed.</span>}
                     </div>
                     <button 
                       onClick={() => { setTempApiKey(''); updateSettings({ apiKey: '' }); }}
                       className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1"
                     >
                       <Trash2 className="w-4 h-4" /> Remove Key
                     </button>
                   </div>
                </div>

                <div className="space-y-3 pt-4">
                   <label className="text-sm font-medium">System Prompt</label>
                   <textarea
                     value={settings.systemPrompt}
                     onChange={e => updateSettings({ systemPrompt: e.target.value })}
                     className="w-full h-32 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] resize-none"
                   />
                </div>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2">Storage & Data</h3>
                
                <div className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl">
                  <div>
                    <div className="font-medium">Export Data</div>
                    <div className="text-sm text-[var(--text-muted)]">Download your profile and chats as JSON</div>
                  </div>
                  <button 
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings, chats }));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", "ai_profile_export.json");
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                    className="px-4 py-2 bg-[var(--text-main)]/10 hover:bg-[var(--text-main)]/20 text-[var(--text-main)] rounded-lg font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div>
                    <div className="font-medium text-red-500">Clear All History</div>
                    <div className="text-sm text-red-500/70">Permanently delete all chats and generated media</div>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete all history? This cannot be undone.')) {
                        clearHistory();
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
                  >
                    Clear History
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
