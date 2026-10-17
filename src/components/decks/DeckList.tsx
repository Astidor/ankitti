import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  MoreVertical, 
  Settings, 
  Trash2, 
  Download, 
  RotateCcw,
  Zap,
  Flag,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  Layers,
  FileEdit,
  Heart
} from 'lucide-react';
import { Deck, DeckStats } from '../../types/anki';
import { sounds } from '../../services/audio';
import { KittyBow, AestheticMascot, CuteSparkleStar } from '../common/KittyIllustrations';

export type StudyFilterMode = 'due' | 'all' | 'flagged' | 'highYield';

interface DeckListProps {
  decks: Deck[];
  getDeckStats: (deckId: string) => DeckStats;
  hasDraftForDeck: (deckId: string) => boolean;
  onStudyDeck: (deck: Deck, mode?: StudyFilterMode) => void;
  onAddCardToDeck: (deck: Deck) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onExportDeck: (deck: Deck) => void;
  onCreateDeck: () => void;
  onOpenImport: () => void;
  onOpenAiDeck?: () => void;
}

const BENTO_THEMES = [
  {
    bg: 'bg-[#fff8fa]',
    border: 'border-pink-200/90',
    accent: 'text-[#be123c]',
    badge: 'bg-pink-100 text-pink-700',
    button: 'bg-[#ff3366] text-white hover:bg-[#e11d48]',
  },
  {
    bg: 'bg-[#f7f5ff]',
    border: 'border-purple-200/90',
    accent: 'text-[#6b21a8]',
    badge: 'bg-purple-100 text-purple-700',
    button: 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]',
  },
  {
    bg: 'bg-[#f0f9ff]',
    border: 'border-sky-200/90',
    accent: 'text-[#0369a1]',
    badge: 'bg-sky-100 text-sky-700',
    button: 'bg-[#0284c7] text-white hover:bg-[#0369a1]',
  },
  {
    bg: 'bg-[#fff7ed]',
    border: 'border-amber-200/90',
    accent: 'text-[#c2410c]',
    badge: 'bg-amber-100 text-amber-800',
    button: 'bg-[#ea580c] text-white hover:bg-[#c2410c]',
  },
  {
    bg: 'bg-[#f0fdf4]',
    border: 'border-emerald-200/90',
    accent: 'text-[#15803d]',
    badge: 'bg-emerald-100 text-emerald-800',
    button: 'bg-[#16a34a] text-white hover:bg-[#15803d]',
  }
];

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  getDeckStats,
  hasDraftForDeck,
  onStudyDeck,
  onAddCardToDeck,
  onEditDeck,
  onDeleteDeck,
  onExportDeck,
  onCreateDeck,
  onOpenImport,
  onOpenAiDeck,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deckFilter, setDeckFilter] = useState<'all' | 'due'>('all');

  const totalCardsAllDecks = decks.reduce((acc, d) => acc + getDeckStats(d.id).total, 0);
  const totalDueAllDecks = decks.reduce((acc, d) => {
    const s = getDeckStats(d.id);
    return acc + s.newCount + s.learnCount + s.dueCount;
  }, 0);

  // Find the first deck with due cards for 1-click Quick Study
  const firstDeckWithDue = decks.find(d => {
    const s = getDeckStats(d.id);
    return (s.newCount + s.learnCount + s.dueCount) > 0;
  });

  const dueDecksCount = decks.filter(d => {
    const s = getDeckStats(d.id);
    return (s.newCount + s.learnCount + s.dueCount) > 0;
  }).length;

  const filteredDecks = decks.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (deckFilter === 'due') {
      const stats = getDeckStats(d.id);
      return (stats.newCount + stats.learnCount + stats.dueCount) > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Mobile Compact Hero Greeting (Phone View) */}
      <div className="sm:hidden bg-white/95 rounded-3xl border border-pink-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KittyBow size={20} />
            <span className="text-xs font-black text-pink-600 tracking-tight">Ankitti Studio 🎀</span>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-pink-100 text-pink-700">
            {totalCardsAllDecks} Cards • {decks.length} Decks
          </span>
        </div>

        {firstDeckWithDue ? (
          <button
            onClick={() => {
              sounds.playClick();
              onStudyDeck(firstDeckWithDue, 'due');
            }}
            className="w-full py-3 px-4 rounded-2xl bg-[#ff3366] active:bg-[#e11d48] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-sm transition-all ios-btn cursor-pointer"
          >
            <Zap size={15} />
            <span>Review Due Cards ({totalDueAllDecks})</span>
          </button>
        ) : (
          <div className="py-2.5 px-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All caught up! Zero cards due 🎉</span>
          </div>
        )}
      </div>

      {/* Desktop/Tablet Bento Hero Banner */}
      <div className="hidden sm:block relative overflow-hidden rounded-[32px] bg-white border-2 border-pink-200/90 p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-xl text-left">
            <div className="flex items-center space-x-2">
              <KittyBow size={20} className="hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider text-pink-600">
                Ankitti Spaced Repetition 🎀
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              What would you like to master today?
            </h2>

            <p className="text-sm text-slate-600 font-medium">
              Review scheduled cards or relearn anytime on your own schedule.
            </p>

            {/* Quick Action & Real Stats */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {firstDeckWithDue ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onStudyDeck(firstDeckWithDue, 'due');
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#ff3366] hover:bg-[#e11d48] text-white font-extrabold text-xs flex items-center space-x-2 shadow-sm hover:shadow-md transition-all ios-btn cursor-pointer"
                  title={`Start reviewing ${firstDeckWithDue.name}`}
                >
                  <Zap size={14} />
                  <span>Start Due Review ({totalDueAllDecks} Cards)</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All caught up! Zero cards due right now 🎉</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                <span className="px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200/80 text-pink-700">
                  {totalCardsAllDecks} Total Cards
                </span>
                <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700">
                  {decks.length} Decks
                </span>
              </div>
            </div>
          </div>

          {/* Real Generated Mascot Card with Cute Breathing Float */}
          <div className="relative shrink-0">
            <div className="w-44 h-44 md:w-52 md:h-52 rounded-[28px] bg-[#fff8fa] p-2.5 shadow-md border-2 border-pink-200/90 flex items-center justify-center mascot-float">
              <img 
                src="/assets/hero_mascot.png" 
                alt="Ankitti Mascot" 
                className="w-full h-full object-cover rounded-2xl select-none"
              />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white/95 px-3 py-1 rounded-full text-[11px] font-black text-pink-700 border border-pink-200 shadow-xs flex items-center space-x-1">
              <span>☕ Study Session Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Segmented Filter & Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* iOS Pill Search & Segmented Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" size={16} />
            <input
              type="text"
              placeholder="Search decks by title or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 border border-pink-200/90 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 shadow-xs transition-all"
            />
          </div>

          {/* iOS Segmented Filter: All vs Due */}
          <div className="inline-flex p-1 bg-pink-100/70 rounded-full border border-pink-200/80 self-start sm:self-auto shrink-0 shadow-xs">
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('all'); }}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                deckFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-pink-700'
              }`}
            >
              All Decks ({decks.length})
            </button>
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('due'); }}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                deckFilter === 'due'
                  ? 'bg-[#ff3366] text-white shadow-xs'
                  : 'text-slate-600 hover:text-pink-700'
              }`}
            >
              <span>Due Today</span>
              {dueDecksCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  deckFilter === 'due' ? 'bg-white text-[#ff3366]' : 'bg-pink-200 text-pink-800'
                }`}>
                  {dueDecksCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAiDeck && (
            <button
              onClick={() => { sounds.playClick(); onOpenAiDeck(); }}
              className="px-4 py-2 bg-linear-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 text-pink-700 border border-pink-200/90 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs ios-btn cursor-pointer"
            >
              <Sparkles size={14} className="text-pink-500 animate-pulse" />
              <span>AI Deck Architect 🪄</span>
            </button>
          )}

          <button
            onClick={() => { sounds.playClick(); onOpenImport(); }}
            className="px-4 py-2 bg-white hover:bg-pink-50 text-slate-700 border border-pink-200 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs ios-btn cursor-pointer"
          >
            <Download size={14} className="text-pink-500" />
            <span>Import (.apkg)</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onCreateDeck(); }}
            className="px-4 py-2 bg-[#FF4D80] hover:bg-[#F43F5E] text-white rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ios-btn cursor-pointer"
          >
            <Plus size={15} />
            <span>New Deck 🎀</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Deck Cards */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-pink-200 p-12 text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-pink-50 border border-pink-200 flex items-center justify-center">
            <BookOpen size={40} className="text-pink-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">No decks found</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Create a new deck or import an existing Anki .apkg collection.</p>
          </div>
          <button
            onClick={onCreateDeck}
            className="px-5 py-2.5 bg-[#ff3366] text-white rounded-full text-xs font-bold shadow-sm ios-btn"
          >
            Create Your First Deck 🎀
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDecks.map((deck, idx) => {
            const stats = getDeckStats(deck.id);
            const totalDue = stats.newCount + stats.learnCount + stats.dueCount;
            const hasDraft = hasDraftForDeck(deck.id);
            const theme = BENTO_THEMES[idx % BENTO_THEMES.length];

            return (
              <div
                key={deck.id}
                className={`relative rounded-[28px] ${theme.bg} border-2 ${theme.border} p-5 md:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className="space-y-1.5 cursor-pointer flex-1 group"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                          {deck.tags && deck.tags.length > 0 ? deck.tags[0] : 'Deck'}
                        </span>
                        {hasDraft && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                            <FileEdit size={11} />
                            <span>Draft</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <span className="text-2xl p-1.5 bg-white rounded-xl border border-pink-200/80 shadow-2xs select-none shrink-0 group-hover:scale-105 transition-transform">
                          {deck.icon || '🎀'}
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight group-hover:text-pink-600 transition-colors">
                          {deck.name}
                        </h3>
                      </div>
                    </div>

                    {/* Options Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === deck.id ? null : deck.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-full transition-colors"
                        title="Deck Options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === deck.id && (
                        <div 
                          className="absolute right-0 top-8 z-30 w-44 bg-white rounded-2xl shadow-xl border border-pink-200 p-1.5 text-xs font-semibold text-slate-700 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => { onAddCardToDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-2 text-left rounded-xl hover:bg-pink-50 hover:text-pink-600 flex items-center space-x-2"
                          >
                            <Plus size={14} />
                            <span>Add Flashcard</span>
                          </button>
                          <button
                            onClick={() => { onEditDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center space-x-2"
                          >
                            <Settings size={14} />
                            <span>Deck Settings</span>
                          </button>
                          <button
                            onClick={() => { onExportDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center space-x-2"
                          >
                            <Download size={14} />
                            <span>Export Deck</span>
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => { onDeleteDeck(deck.id); setActiveMenuId(null); }}
                            className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 text-rose-600 flex items-center space-x-2"
                          >
                            <Trash2 size={14} />
                            <span>Delete Deck</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deck Description */}
                  <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-2">
                    {deck.description || 'No description provided.'}
                  </p>

                  {/* Anki SM-2 Card Count Pills */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold flex items-center space-x-1">
                      <span className="text-[10px] text-blue-500 uppercase tracking-wider">New:</span>
                      <span>{stats.newCount}</span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold flex items-center space-x-1">
                      <span className="text-[10px] text-amber-500 uppercase tracking-wider">Learn:</span>
                      <span>{stats.learnCount}</span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-pink-50 text-pink-700 border border-pink-200 text-xs font-bold flex items-center space-x-1">
                      <span className="text-[10px] text-pink-500 uppercase tracking-wider">Due:</span>
                      <span>{stats.dueCount}</span>
                    </div>

                    <div className="ml-auto text-[11px] text-slate-400 font-semibold font-mono">
                      Total: {stats.total}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area: Study + Relearn Anytime */}
                <div className="pt-4 mt-3 border-t border-pink-200/50 flex items-center justify-between gap-1.5 sm:gap-2">
                  <button
                    onClick={() => { sounds.playClick(); onAddCardToDeck(deck); }}
                    className="p-2 text-slate-500 hover:text-pink-600 hover:bg-white rounded-full transition-colors ios-btn shrink-0"
                    title="Add flashcard to this deck"
                  >
                    <Plus size={18} />
                  </button>

                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    {/* Relearn Anytime Button */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, 'all');
                      }}
                      className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-white hover:bg-pink-50 text-slate-700 border border-pink-200 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center space-x-1 shadow-xs ios-btn shrink-0"
                      title="Study and repeat all cards in this deck right now (relearn mode)"
                    >
                      <RotateCcw size={12} className="text-amber-500 shrink-0" />
                      <span>Relearn</span>
                    </button>

                    {/* Primary Study Due Button */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ios-btn shrink-0 ${
                        totalDue > 0
                          ? 'bg-[#ff3366] hover:bg-[#e11d48] text-white'
                          : 'bg-white hover:bg-pink-50 text-slate-700 border border-pink-200'
                      }`}
                    >
                      <Play size={12} className={totalDue > 0 ? 'fill-white' : 'fill-slate-600'} />
                      <span>{totalDue > 0 ? `Study (${totalDue})` : 'Practice All'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
