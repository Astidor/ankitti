import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Wifi, 
  BatteryCharging, 
  Palette, 
  Timer, 
  Moon, 
  Sun,
  Flame
} from 'lucide-react';
import { UserAccount } from '../../types/anki';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';

export type WallpaperTheme = 'sakura' | 'midnight' | 'matcha' | 'cloud';

interface MacMenuBarProps {
  account: UserAccount;
  currentWallpaper: WallpaperTheme;
  onChangeWallpaper: (theme: WallpaperTheme) => void;
  showPetals: boolean;
  onTogglePetals: () => void;
  onTogglePomodoro: () => void;
  onOpenAccount: () => void;
  onOpenImport: () => void;
  onOpenNewCard: () => void;
  onOpenNewDeck: () => void;
  onOpenStats: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MacMenuBar: React.FC<MacMenuBarProps> = ({
  account,
  currentWallpaper,
  onChangeWallpaper,
  showPetals,
  onTogglePetals,
  onTogglePomodoro,
  onOpenAccount,
  onOpenImport,
  onOpenNewCard,
  onOpenNewDeck,
  onOpenStats,
  soundEnabled,
  onToggleSound,
}) => {
  const [time, setTime] = useState<string>('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-10 fixed top-2 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-5xl bg-white/92 backdrop-blur-2xl border-2 border-pink-200/90 rounded-full px-4 flex items-center justify-between text-xs text-[#312e81] font-bold select-none z-50 shadow-mac">
      {/* Left Menu Items */}
      <div className="flex items-center space-x-1">
        {/* Hello Kitty Bow Brand Logo */}
        <div 
          onClick={() => { sounds.playClick(); onOpenAccount(); }}
          className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg hover:bg-pink-100/70 cursor-pointer text-kitty-600 font-bold transition-all group"
          title="Ankitti - About & Profile"
        >
          <KittyBow size={18} className="transform group-hover:rotate-12 transition-transform" />
          <span className="font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
            Ankitti
          </span>
        </div>

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={`px-2.5 py-0.5 rounded transition-colors ${
              activeMenu === 'file' ? 'bg-pink-200/70 text-kitty-900' : 'hover:bg-pink-100/60'
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div 
              className="absolute left-0 mt-1 w-48 bg-white/95 backdrop-blur-2xl rounded-xl shadow-mac border border-pink-200 py-1 z-50 text-left"
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button 
                onClick={() => { onOpenNewCard(); setActiveMenu(null); }}
                className="w-full px-3 py-1.5 hover:bg-pink-50 flex items-center justify-between text-left text-xs"
              >
                <span>Add Card...</span>
                <span className="text-[10px] text-pink-400 font-mono">⌘N</span>
              </button>
              <button 
                onClick={() => { onOpenNewDeck(); setActiveMenu(null); }}
                className="w-full px-3 py-1.5 hover:bg-pink-50 flex items-center justify-between text-left text-xs"
              >
                <span>New Deck...</span>
                <span className="text-[10px] text-pink-400 font-mono">⇧⌘N</span>
              </button>
              <div className="my-1 border-t border-pink-100" />
              <button 
                onClick={() => { onOpenImport(); setActiveMenu(null); }}
                className="w-full px-3 py-1.5 hover:bg-pink-50 flex items-center justify-between text-left text-xs text-kitty-600 font-semibold"
              >
                <span>Import Anki (.apkg)...</span>
                <span className="text-[10px] text-pink-400 font-mono">⌘I</span>
              </button>
            </div>
          )}
        </div>

        {/* Tools Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
            className={`px-2.5 py-0.5 rounded transition-colors ${
              activeMenu === 'tools' ? 'bg-indigo-100 text-indigo-900' : 'hover:bg-slate-100'
            }`}
          >
            Tools
          </button>
          {activeMenu === 'tools' && (
            <div 
              className="absolute left-0 mt-1 w-52 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-left"
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button 
                onClick={() => { onOpenStats(); setActiveMenu(null); }}
                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-left text-xs"
              >
                <span>📊 Spaced Heatmap & Stats</span>
                <span className="text-[10px] text-slate-400 font-mono">⌘S</span>
              </button>
              <button 
                onClick={() => { onTogglePomodoro(); setActiveMenu(null); }}
                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-left text-xs"
              >
                <span>⏱️ Focus Pomodoro Timer</span>
              </button>
              <button 
                onClick={() => { onOpenAccount(); setActiveMenu(null); }}
                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-left text-xs"
              >
                <span>🎯 Goals & Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme / Wallpaper Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'theme' ? null : 'theme')}
            className={`px-2.5 py-0.5 rounded flex items-center space-x-1 transition-colors ${
              activeMenu === 'theme' ? 'bg-pink-200/70 text-kitty-900' : 'hover:bg-pink-100/60'
            }`}
          >
            <Palette size={12} className="text-pink-600" />
            <span>Theme</span>
          </button>
          {activeMenu === 'theme' && (
            <div 
              className="absolute left-0 mt-1 w-52 bg-white/95 backdrop-blur-2xl rounded-xl shadow-mac border border-pink-200 py-1.5 z-50 text-left"
              onMouseLeave={() => setActiveMenu(null)}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-kitty-subtle tracking-wider">
                macOS Kitty Wallpapers
              </div>
              <button 
                onClick={() => { onChangeWallpaper('sakura'); setActiveMenu(null); }}
                className={`w-full px-3 py-1.5 hover:bg-pink-50 flex items-center space-x-2 text-xs ${currentWallpaper === 'sakura' ? 'font-bold text-pink-600' : ''}`}
              >
                <span>🌸 Sakura Blossom (Classic Pink)</span>
              </button>
              <button 
                onClick={() => { onChangeWallpaper('midnight'); setActiveMenu(null); }}
                className={`w-full px-3 py-1.5 hover:bg-pink-50 flex items-center space-x-2 text-xs ${currentWallpaper === 'midnight' ? 'font-bold text-purple-600' : ''}`}
              >
                <span>🌙 Midnight Kitty (Dark Glass)</span>
              </button>
              <button 
                onClick={() => { onChangeWallpaper('matcha'); setActiveMenu(null); }}
                className={`w-full px-3 py-1.5 hover:bg-pink-50 flex items-center space-x-2 text-xs ${currentWallpaper === 'matcha' ? 'font-bold text-emerald-600' : ''}`}
              >
                <span>🍵 Matcha Mint (Soothing)</span>
              </button>
              <button 
                onClick={() => { onChangeWallpaper('cloud'); setActiveMenu(null); }}
                className={`w-full px-3 py-1.5 hover:bg-pink-50 flex items-center space-x-2 text-xs ${currentWallpaper === 'cloud' ? 'font-bold text-sky-600' : ''}`}
              >
                <span>☁️ Cloud Cream (Minimal)</span>
              </button>
              <div className="my-1 border-t border-pink-100" />
              <button 
                onClick={() => { onTogglePetals(); setActiveMenu(null); }}
                className="w-full px-3 py-1.5 hover:bg-pink-50 flex items-center justify-between text-xs"
              >
                <span>Floating Petals Animation</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${showPetals ? 'bg-pink-200 text-pink-800' : 'bg-gray-100 text-gray-500'}`}>
                  {showPetals ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right System Indicators */}
      <div className="flex items-center space-x-3 text-kitty-dark/80">
        {/* Pomodoro quick trigger button */}
        <button
          onClick={onTogglePomodoro}
          className="p-1 rounded-md hover:bg-pink-100/70 transition-colors text-kitty-600"
          title="Open Focus Pomodoro Timer"
        >
          <Timer size={13} className="text-pink-600" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="p-1 rounded-md hover:bg-pink-100/70 transition-colors text-kitty-600"
          title={soundEnabled ? 'Mute Kawaii Sounds' : 'Unmute Kawaii Sounds'}
        >
          {soundEnabled ? <Volume2 size={13} className="text-pink-600 animate-pulse" /> : <VolumeX size={13} className="text-gray-400" />}
        </button>

        {/* User Account pill */}
        <button
          onClick={onOpenAccount}
          className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-pink-100/80 hover:bg-pink-200/80 border border-pink-300/50 text-kitty-800 transition-all text-[11px]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold truncate max-w-[110px]">{account.name}</span>
          <span className="text-pink-500 text-[10px]">({account.targetExam})</span>
        </button>

        <Wifi size={13} className="text-pink-400" />
        <BatteryCharging size={14} className="text-emerald-500" />

        {/* Live Clock */}
        <span className="text-[11px] font-medium text-kitty-dark pl-1">
          {time || '11:25 AM'}
        </span>
      </div>
    </header>
  );
};
