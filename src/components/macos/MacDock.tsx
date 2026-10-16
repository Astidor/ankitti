import React from 'react';
import { Layers, PlusCircle, Upload, BarChart2, Timer } from 'lucide-react';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';

interface MacDockProps {
  currentTab: 'decks' | 'browser' | 'stats';
  onSelectTab: (tab: 'decks' | 'browser' | 'stats') => void;
  onOpenNewCard: () => void;
  onOpenImport: () => void;
  onOpenAccount: () => void;
  onOpenPomodoro: () => void;
  dueCardsTotal: number;
  hasDraft: boolean;
}

export const MacDock: React.FC<MacDockProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewCard,
  onOpenImport,
  onOpenAccount,
  onOpenPomodoro,
  dueCardsTotal,
  hasDraft,
}) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-2xl rounded-2xl border border-slate-200/90 shadow-xl transition-all">
        {/* Decks Tab */}
        <button
          onClick={() => { sounds.playClick(); onSelectTab('decks'); }}
          className={`group relative p-2.5 rounded-xl transition-all duration-200 transform hover:-translate-y-1.5 hover:scale-110 ${
            currentTab === 'decks' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
          }`}
          title="Decks"
        >
          <Layers size={21} />
          {dueCardsTotal > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {dueCardsTotal > 99 ? '99+' : dueCardsTotal}
            </span>
          )}
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow pointer-events-none transition-opacity whitespace-nowrap">
            Decks
          </span>
          {currentTab === 'decks' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
          )}
        </button>

        {/* Add Card (with draft indicator) */}
        <button
          onClick={() => { sounds.playClick(); onOpenNewCard(); }}
          className="group relative p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200 transform hover:-translate-y-1.5 hover:scale-110"
          title="Add Flashcard (Auto-saving draft)"
        >
          <PlusCircle size={21} className="text-indigo-600" />
          {hasDraft && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow" title="Draft auto-saved">
              ✏️
            </span>
          )}
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow pointer-events-none transition-opacity whitespace-nowrap">
            Add Card {hasDraft ? '(Draft saved)' : ''}
          </span>
        </button>

        {/* Import Anki (.apkg) */}
        <button
          onClick={() => { sounds.playClick(); onOpenImport(); }}
          className="group relative p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200 transform hover:-translate-y-1.5 hover:scale-110"
          title="Import Anki Package (.apkg / .csv / .tsv)"
        >
          <Upload size={21} className="text-violet-600" />
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow pointer-events-none transition-opacity whitespace-nowrap">
            Import Anki
          </span>
        </button>

        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

        {/* Focus Timer */}
        <button
          onClick={() => { sounds.playClick(); onOpenPomodoro(); }}
          className="group relative p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200 transform hover:-translate-y-1.5 hover:scale-110"
          title="Study Pomodoro Timer"
        >
          <Timer size={21} className="text-rose-500" />
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow pointer-events-none transition-opacity whitespace-nowrap">
            Timer
          </span>
        </button>

        {/* Spaced Heatmap & Stats */}
        <button
          onClick={() => { sounds.playClick(); onSelectTab('stats'); }}
          className={`group relative p-2.5 rounded-xl transition-all duration-200 transform hover:-translate-y-1.5 hover:scale-110 ${
            currentTab === 'stats' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
          }`}
          title="Study Stats & Heatmap"
        >
          <BarChart2 size={21} className="text-emerald-600" />
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow pointer-events-none transition-opacity whitespace-nowrap">
            Stats
          </span>
          {currentTab === 'stats' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
          )}
        </button>

        {/* Account & Profile */}
        <button
          onClick={() => { sounds.playClick(); onOpenAccount(); }}
          className="group relative p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200 transform hover:-translate-y-1.5 hover:scale-110 flex items-center justify-center"
          title="User Account & Goals"
        >
          <div className="relative">
            <KittyBow size={22} />
          </div>
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow pointer-events-none transition-opacity whitespace-nowrap">
            Account
          </span>
        </button>
      </div>
    </div>
  );
};
