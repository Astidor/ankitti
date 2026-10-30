import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  MoreVertical, 
  Settings, 
  Trash2, 
  Download, 
  RotateCcw, 
  Search, 
  Sparkles, 
  BookOpen, 
  FileEdit, 
  GitMerge, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  X,
  Activity,
  Code2,
  Sun,
  Zap
} from 'lucide-react';
import { Deck, DeckStats } from '../../types/anki';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';

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
  onOpenAiDeck?: (deck?: Deck) => void;
  onMergeDeck?: (deck?: Deck) => void;
}

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
  onMergeDeck,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deckFilter, setDeckFilter] = useState<'all' | 'due'>('all');
  const [selectedMood, setSelectedMood] = useState<string>('focus');

  const MOODS = [
    { id: 'focus', emoji: '🌸', label: 'Deep Focus' },
    { id: 'boba', emoji: '🧋', label: 'Boba Chill' },
    { id: 'crunch', emoji: '⚡', label: 'Crunch' },
    { id: 'chill', emoji: '🍵', label: 'Relaxed' },
  ];

  const BENTO_PALETTES = [
    {
      border: 'border-pink-200/90 hover:border-pink-300',
      iconBg: 'bg-pink-100/80 border-pink-200 text-strawberry-600',
      btnBg: 'bg-strawberry-500 hover:bg-strawberry-600 text-white shadow-rose-btn',
      pillDue: 'bg-pink-50 text-pink-700 border-pink-200',
      hoverText: 'group-hover:text-strawberry-600',
    },
    {
      border: 'border-purple-200/90 hover:border-purple-300',
      iconBg: 'bg-purple-100/80 border-purple-200 text-taro-600',
      btnBg: 'bg-taro-500 hover:bg-taro-600 text-white shadow-[0_2px_8px_rgba(128,90,213,0.25)]',
      pillDue: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverText: 'group-hover:text-taro-600',
    },
    {
      border: 'border-emerald-200/90 hover:border-emerald-300',
      iconBg: 'bg-emerald-100/80 border-emerald-200 text-matcha-600',
      btnBg: 'bg-matcha-600 hover:bg-matcha-700 text-white shadow-[0_2px_8px_rgba(56,161,105,0.25)]',
      pillDue: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      hoverText: 'group-hover:text-matcha-600',
    },
    {
      border: 'border-amber-200/90 hover:border-amber-300',
      iconBg: 'bg-amber-100/80 border-amber-200 text-amber-700',
      btnBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_2px_8px_rgba(214,158,46,0.25)]',
      pillDue: 'bg-amber-50 text-amber-800 border-amber-200',
      hoverText: 'group-hover:text-amber-600',
    },
  ];

  const totalCardsAllDecks = decks.reduce((acc, d) => acc + getDeckStats(d.id).total, 0);
  const totalDueAllDecks = decks.reduce((acc, d) => {
    const s = getDeckStats(d.id);
    return acc + s.newCount + s.learnCount + s.dueCount;
  }, 0);

  const firstDeckWithDue = decks.find(d => {
    const s = getDeckStats(d.id);
    return (s.newCount + s.learnCount + s.dueCount) > 0;
  });

  const dueDecksCount = decks.filter(d => {
    const s = getDeckStats(d.id);
    return (s.newCount + s.learnCount + s.dueCount) > 0;
  }).length;

  const cleanDeckTitle = (name: string) => {
    return name
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/^(JP|ES|CS:?)\s*/i, '')
      .trim() || name;
  };

  const renderDeckIcon = (icon?: string) => {
    if (icon === '⚡' || icon === 'zap' || icon === 'code') return <Code2 size={18} className="text-[#D84570]" />;
    if (icon === '🫀' || icon === 'heart' || icon === 'activity') return <Activity size={18} className="text-[#D84570]" />;
    if (icon === '☀️' || icon === 'sun') return <Sun size={18} className="text-[#D84570]" />;
    if (icon === '📚' || icon === 'book') return <BookOpen size={18} className="text-[#D84570]" />;
    return <KittyBow size={18} />;
  };

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
    <div className="space-y-6 w-full min-w-0">
      
      {/* 🌸 KAWAII GREETING & STREAK BANNER 🌸 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-cocoa-900 tracking-tight flex items-center space-x-2">
              <span>Konnichiwa, Study Buddy</span>
              <KittyBow size={24} className="inline-block transform hover:rotate-6 transition-transform" />
            </h1>
          </div>
          <p className="text-sm text-cocoa-600 font-medium mt-0.5">
            {totalDueAllDecks > 0 
              ? `You have ${totalDueAllDecks} cards due across ${dueDecksCount} ${dueDecksCount === 1 ? 'deck' : 'decks'} today.`
              : 'All caught up! Your memory garden is in full bloom 🌸'}
          </p>
        </div>

        {/* Mascot Mood / Daily Goal Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-white border border-pink-200/80 shadow-2xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-cocoa-800">1 Day Streak 🔥</span>
          <span className="text-pink-200">•</span>
          <span className="text-xs font-semibold text-strawberry-600">Goal: 25 cards</span>
        </div>
      </div>

      {/* 🌸 COZY STUDY DESK HERO CARD 🌸 */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-pink-100 p-6 sm:p-7 shadow-[0_4px_20px_rgba(255,77,121,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Soft background decorative ribbon glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-pink-100/40 to-rose-50/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center space-y-4 sm:space-y-0 sm:space-x-5 flex-1 min-w-0 text-center sm:text-left z-10">
          {/* Mascot in a cozy illustrated frame */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-b from-pink-50 to-rose-50/80 border-2 border-pink-200/80 p-1.5 shrink-0 shadow-sm flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/assets/reading_mascot.png" 
              alt="Ankitti Studying" 
              className="w-full h-full object-contain rounded-xl select-none"
            />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-strawberry-50 text-strawberry-700 border border-strawberry-200/60 text-xs font-bold tracking-wide uppercase">
              <Sparkles size={11} className="text-strawberry-500" />
              <span>Daily Focus Studio</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-cocoa-900 tracking-tight">
              {totalDueAllDecks > 0 
                ? "Let's review your cards together!"
                : "Great job! All cards are reviewed for today!"}
            </h2>
            <p className="text-sm text-cocoa-600 max-w-xl leading-relaxed">
              {totalDueAllDecks > 0 ? (
                <>Spaced repetition works best when reviewed daily. Reviewing now keeps your retention at <strong className="text-strawberry-600 font-bold">95%+</strong>!</>
              ) : (
                <>Take a break with some tea or boba, or practice any deck freely in cram mode whenever you're ready.</>
              )}
            </p>
          </div>
        </div>

        {/* CTA Button with cute tactile press feel */}
        <div className="z-10 w-full sm:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-2.5">
          {firstDeckWithDue && totalDueAllDecks > 0 ? (
            <button
              onClick={() => {
                sounds.playClick();
                onStudyDeck(firstDeckWithDue, 'due');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-strawberry-500 hover:bg-strawberry-600 active:scale-98 text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,77,121,0.35)] hover:shadow-[0_6px_20px_rgba(255,77,121,0.45)] flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
            >
              <KittyBow size={18} />
              <span>Study All Due ({totalDueAllDecks})</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onCreateDeck}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-strawberry-500 hover:bg-strawberry-600 active:scale-98 text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,77,121,0.35)] flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create New Deck</span>
            </button>
          )}
        </div>
      </div>

      {/* 🍱 CONTROL BAR: SEARCH, CLEAN SEGMENTED TOGGLE & ACTIONS 🍱 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full min-w-0">
        
        {/* Search & Segmented Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" size={15} />
            <input
              type="text"
              placeholder="Search your flashcard decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white rounded-2xl text-sm font-medium text-cocoa-900 placeholder-cocoa-400 border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 shadow-2xs transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cocoa-400 hover:text-cocoa-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Clean Segmented Filter */}
          <div className="inline-flex p-1 bg-white rounded-2xl border border-pink-100 shadow-2xs self-start sm:self-auto shrink-0 text-sm">
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('all'); }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                deckFilter === 'all'
                  ? 'bg-strawberry-50 text-strawberry-700 shadow-2xs border border-strawberry-100'
                  : 'text-cocoa-600 hover:text-cocoa-900'
              }`}
            >
              All Decks ({decks.length})
            </button>
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('due'); }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-1.5 cursor-pointer ${
                deckFilter === 'due'
                  ? 'bg-strawberry-50 text-strawberry-700 shadow-2xs border border-strawberry-100'
                  : 'text-cocoa-600 hover:text-cocoa-900'
              }`}
            >
              <span>Due Today</span>
              {dueDecksCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  deckFilter === 'due' ? 'bg-strawberry-500 text-white' : 'bg-pink-100 text-strawberry-700'
                }`}>
                  {dueDecksCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons: AI Deck, Merge, Import, New Deck */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap w-full md:w-auto min-w-0">
          {onOpenAiDeck && (
            <button
              onClick={() => { sounds.playClick(); onOpenAiDeck(); }}
              className="px-3.5 py-2.5 bg-white hover:bg-purple-50/60 text-purple-700 border border-purple-200/70 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer shrink-0"
              title="Create cards automatically with AI"
            >
              <Sparkles size={14} className="text-purple-500" />
              <span>AI Architect</span>
            </button>
          )}

          {onMergeDeck && decks.length >= 2 && (
            <button
              onClick={() => { sounds.playClick(); onMergeDeck(); }}
              className="px-3.5 py-2.5 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-pink-100 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer shrink-0"
              title="Merge two decks into one"
            >
              <GitMerge size={14} className="text-cocoa-500" />
              <span>Merge</span>
            </button>
          )}

          <button
            onClick={() => { sounds.playClick(); onOpenImport(); }}
            className="px-3.5 py-2.5 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-pink-100 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer shrink-0"
            title="Import an Anki .apkg collection"
          >
            <Download size={14} className="text-cocoa-500" />
            <span>Import Anki</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onCreateDeck(); }}
            className="px-4 py-2.5 bg-strawberry-500 hover:bg-strawberry-600 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 shadow-[0_2px_10px_rgba(255,77,121,0.25)] cursor-pointer shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* 🌸 MODULAR DECK GRID 🌸 */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-strawberry-50 border border-strawberry-100 flex items-center justify-center text-strawberry-500 shadow-2xs">
            <BookOpen size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-cocoa-900">No decks found</h3>
            <p className="text-sm text-cocoa-600 mt-1">Create your first deck or import an Anki .apkg collection.</p>
          </div>
          <button
            onClick={onCreateDeck}
            className="px-5 py-2.5 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-2xl text-sm font-bold shadow-[0_4px_12px_rgba(255,77,121,0.3)] cursor-pointer"
          >
            Create Your First Deck 🌸
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredDecks.map((deck, idx) => {
            const stats = getDeckStats(deck.id);
            const totalDue = stats.newCount + stats.learnCount + stats.dueCount;
            const hasDraft = hasDraftForDeck(deck.id);

            // Palette theme per deck index for delightful pastel variety
            const THEMES = [
              {
                border: 'hover:border-strawberry-300',
                iconBox: 'bg-strawberry-50 text-strawberry-600 border-strawberry-100',
                duePill: 'bg-strawberry-50 text-strawberry-700 border-strawberry-200',
                dueDot: 'bg-strawberry-500',
                progressBar: 'bg-strawberry-400',
              },
              {
                border: 'hover:border-purple-300',
                iconBox: 'bg-purple-50 text-purple-600 border-purple-100',
                duePill: 'bg-purple-50 text-purple-700 border-purple-200',
                dueDot: 'bg-purple-500',
                progressBar: 'bg-purple-400',
              },
              {
                border: 'hover:border-rose-300',
                iconBox: 'bg-rose-50 text-rose-600 border-rose-100',
                duePill: 'bg-rose-50 text-rose-700 border-rose-200',
                dueDot: 'bg-rose-500',
                progressBar: 'bg-rose-400',
              },
              {
                border: 'hover:border-amber-300',
                iconBox: 'bg-amber-50 text-amber-700 border-amber-100',
                duePill: 'bg-amber-50 text-amber-800 border-amber-200',
                dueDot: 'bg-amber-500',
                progressBar: 'bg-amber-400',
              },
            ];
            const theme = THEMES[idx % THEMES.length];

            return (
              <div
                key={deck.id}
                className={`bg-white rounded-3xl border border-pink-100/90 ${theme.border} p-5 sm:p-6 flex flex-col justify-between group transition-all duration-200 w-full min-w-0 overflow-hidden shadow-[0_2px_12px_rgba(255,77,121,0.03)] hover:shadow-[0_8px_24px_rgba(255,77,121,0.08)] hover:-translate-y-0.5`}
              >
                <div className="min-w-0 space-y-4">
                  {/* Top: Icon, Title & Options */}
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div 
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className="flex items-start space-x-3.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${theme.iconBox} border flex items-center justify-center shrink-0 select-none group-hover:scale-105 transition-transform shadow-2xs`}>
                        {renderDeckIcon(deck.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 min-w-0">
                          <h3 className="text-base sm:text-lg font-display font-bold text-cocoa-900 group-hover:text-strawberry-600 transition-colors truncate">
                            {cleanDeckTitle(deck.name)}
                          </h3>
                          {hasDraft && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1 shrink-0">
                              <FileEdit size={11} className="text-amber-600" />
                              <span>Draft</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-cocoa-600 font-normal line-clamp-2 mt-1 leading-relaxed">
                          {deck.description || 'Master this collection with spaced repetition.'}
                        </p>
                      </div>
                    </div>

                    {/* Options Menu */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === deck.id ? null : deck.id)}
                        className="p-1.5 text-cocoa-400 hover:text-cocoa-700 hover:bg-pink-50 rounded-xl transition-colors cursor-pointer"
                        title="Deck Options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === deck.id && (
                        <div 
                          className="absolute right-0 top-8 z-30 w-44 bg-white rounded-2xl shadow-xl border border-pink-100 p-1.5 text-xs font-bold text-cocoa-800 space-y-0.5 animate-fadeIn"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => { onAddCardToDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-pink-50 hover:text-strawberry-700 flex items-center space-x-2 cursor-pointer"
                          >
                            <Plus size={14} className="text-strawberry-500" />
                            <span>Add Card</span>
                          </button>
                          {onOpenAiDeck && (
                            <button
                              onClick={() => { onOpenAiDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2 cursor-pointer"
                            >
                              <Sparkles size={14} className="text-purple-500" />
                              <span>AI Architect</span>
                            </button>
                          )}
                          <button
                            onClick={() => { onEditDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Settings size={14} className="text-cocoa-400" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={() => { onExportDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Download size={14} className="text-cocoa-400" />
                            <span>Export Anki (.apkg)</span>
                          </button>
                          {onMergeDeck && (
                            <button
                              onClick={() => { onMergeDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                            >
                              <GitMerge size={14} className="text-cocoa-400" />
                              <span>Merge Deck</span>
                            </button>
                          )}
                          <div className="border-t border-pink-100 my-1"></div>
                          <button
                            onClick={() => { onDeleteDeck(deck.id); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Delete Deck</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress / Status row */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      {totalDue > 0 ? (
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border font-bold ${theme.duePill}`}>
                          <span className={`w-2 h-2 rounded-full ${theme.dueDot}`} />
                          <span className="tabular-nums">{totalDue} to review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>All Done</span>
                        </span>
                      )}

                      {stats.newCount > 0 && (
                        <span className="text-xs text-cocoa-600 font-semibold tabular-nums px-2 py-0.5 rounded-full bg-cocoa-100/70">
                          {stats.newCount} new
                        </span>
                      )}

                      <div className="ml-auto text-xs text-cocoa-500 font-semibold tabular-nums">
                        {stats.total} {stats.total === 1 ? 'card' : 'cards'}
                      </div>
                    </div>

                    {/* Cute micro progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-cocoa-100/70 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${totalDue === 0 ? 'bg-emerald-500' : theme.progressBar}`}
                        style={{ width: `${stats.total > 0 ? Math.min(100, Math.round(((stats.total - totalDue) / stats.total) * 100)) : 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="pt-4 mt-4 flex items-center justify-between gap-2 border-t border-pink-100/80">
                  <button
                    onClick={() => { sounds.playClick(); onAddCardToDeck(deck); }}
                    className="py-2 px-4 rounded-2xl border border-pink-200/90 bg-white hover:bg-pink-50/60 text-cocoa-800 hover:text-strawberry-600 hover:border-pink-300 transition-colors flex items-center space-x-1.5 text-xs sm:text-sm font-bold cursor-pointer shadow-2xs"
                    title="Add flashcard to this deck"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Add Card</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {totalDue === 0 && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onStudyDeck(deck, 'all');
                        }}
                        className="px-3.5 py-2 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-pink-200/80 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                        title="Review all cards in this deck anytime"
                      >
                        <RotateCcw size={14} className="text-cocoa-400" />
                        <span>Practice</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className={`px-5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98 ${
                        totalDue > 0
                          ? 'bg-strawberry-500 hover:bg-strawberry-600 text-white shadow-[0_4px_12px_rgba(255,77,121,0.3)]'
                          : 'bg-pink-100 hover:bg-pink-200/80 text-strawberry-700'
                      }`}
                    >
                      <span>{totalDue > 0 ? `Study (${totalDue})` : 'Study'}</span>
                      <ArrowRight size={14} />
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
