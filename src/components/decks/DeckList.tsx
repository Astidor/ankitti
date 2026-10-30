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
      
      {/* 🌸 EDITORIAL TITLE & SUMMARY 🌸 */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-1">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-cocoa-900 tracking-tight">
            Konnichiwa, Study Buddy.
          </h1>
          <KittyBow size={20} />
        </div>
        <p className="text-sm text-cocoa-600 font-medium">
          {totalDueAllDecks > 0 
            ? `${totalDueAllDecks} cards due across ${dueDecksCount} ${dueDecksCount === 1 ? 'deck' : 'decks'} today`
            : 'All caught up for today'}
        </p>
      </div>

      {/* 🌸 STUDY STUDIO HERO CARD 🌸 */}
      <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#EAE6DF] p-1 shrink-0 flex items-center justify-center">
            <img 
              src="/assets/hero_mascot.png" 
              alt="Study Mascot" 
              className="w-full h-full object-cover rounded-xl select-none"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-cocoa-900 tracking-tight truncate">
              Ready for a focus session?
            </h2>
            <p className="mt-0.5 text-sm text-cocoa-600 leading-relaxed">
              {totalDueAllDecks > 0 ? (
                <span>You have <strong className="text-strawberry-600 font-semibold">{totalDueAllDecks} cards due</strong> right now. Reviewing on time solidifies long-term retention.</span>
              ) : (
                <span>All caught up. Your memory garden is in full bloom.</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick CTA */}
        {firstDeckWithDue && totalDueAllDecks > 0 ? (
          <button
            onClick={() => {
              sounds.playClick();
              onStudyDeck(firstDeckWithDue, 'due');
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-full font-semibold text-sm shadow-rose-btn transition-all shrink-0 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
          >
            <span>Study All Due ({totalDueAllDecks})</span>
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={onCreateDeck}
            className="w-full sm:w-auto px-5 py-2.5 bg-cocoa-100 hover:bg-cocoa-200 text-cocoa-800 rounded-full font-semibold text-sm transition-all shrink-0 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>New Deck</span>
          </button>
        )}
      </div>

      {/* 🍱 CONTROL BAR: SEARCH, CLEAN SEGMENTED TOGGLE & ACTIONS 🍱 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full min-w-0">
        
        {/* Search & Segmented Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-400" size={14} />
            <input
              type="text"
              placeholder="Search decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl text-xs font-medium text-cocoa-900 placeholder-cocoa-400 border border-[#EAE4DC] focus:outline-none focus:ring-2 focus:ring-strawberry-200 focus:border-strawberry-400 shadow-2xs transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cocoa-400 hover:text-cocoa-700"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Clean Segmented Filter */}
          <div className="inline-flex p-0.5 bg-cocoa-100/70 rounded-xl border border-[#EAE6DF] self-start sm:self-auto shrink-0 text-sm">
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                deckFilter === 'all'
                  ? 'bg-white text-cocoa-900 shadow-2xs'
                  : 'text-cocoa-600 hover:text-cocoa-900'
              }`}
            >
              All Decks ({decks.length})
            </button>
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('due'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                deckFilter === 'due'
                  ? 'bg-white text-strawberry-700 shadow-2xs'
                  : 'text-cocoa-600 hover:text-cocoa-900'
              }`}
            >
              <span>Due Today</span>
              {dueDecksCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  deckFilter === 'due' ? 'bg-strawberry-100 text-strawberry-800' : 'bg-cocoa-200 text-cocoa-700'
                }`}>
                  {dueDecksCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap w-full md:w-auto min-w-0">
          {onOpenAiDeck && (
            <button
              onClick={() => { sounds.playClick(); onOpenAiDeck(); }}
              className="px-3 py-2 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-[#EAE6DF] hover:border-strawberry-200 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 shadow-2xs atelier-btn cursor-pointer shrink-0"
            >
              <Sparkles size={14} className="text-taro-500" />
              <span>AI Deck</span>
            </button>
          )}

          {onMergeDeck && decks.length >= 2 && (
            <button
              onClick={() => { sounds.playClick(); onMergeDeck(); }}
              className="px-3 py-2 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-[#EAE6DF] hover:border-strawberry-200 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 shadow-2xs atelier-btn cursor-pointer shrink-0"
              title="Merge two decks into one"
            >
              <GitMerge size={14} className="text-cocoa-500" />
              <span>Merge</span>
            </button>
          )}

          <button
            onClick={() => { sounds.playClick(); onOpenImport(); }}
            className="px-3 py-2 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-[#EAE6DF] hover:border-strawberry-200 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 shadow-2xs atelier-btn cursor-pointer shrink-0"
          >
            <Download size={14} className="text-cocoa-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onCreateDeck(); }}
            className="px-3.5 py-2 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 shadow-rose-btn hover:shadow-rose-btn-hover atelier-btn cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* 🌸 MODULAR DECK GRID 🌸 */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-12 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-[#EAE6DF] flex items-center justify-center text-strawberry-500">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-cocoa-900">No decks found</h3>
            <p className="text-sm text-cocoa-600 mt-1">Create your first deck or import an Anki .apkg collection.</p>
          </div>
          <button
            onClick={onCreateDeck}
            className="px-4 py-2 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-xl text-sm font-semibold shadow-rose-btn atelier-btn cursor-pointer"
          >
            Create Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => {
            const stats = getDeckStats(deck.id);
            const totalDue = stats.newCount + stats.learnCount + stats.dueCount;
            const hasDraft = hasDraftForDeck(deck.id);

            return (
              <div
                key={deck.id}
                className="bg-white rounded-2xl border border-[#EAE6DF] hover:border-strawberry-300 p-4 sm:p-5 flex flex-col justify-between group transition-colors w-full min-w-0 overflow-hidden shadow-xs"
              >
                <div className="min-w-0">
                  {/* Top: Icon, Title & Options */}
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div 
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className="flex items-start space-x-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0 select-none group-hover:scale-105 transition-transform">
                        {renderDeckIcon(deck.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 min-w-0">
                          <h3 className="text-base font-bold text-cocoa-900 group-hover:text-strawberry-600 transition-colors truncate">
                            {cleanDeckTitle(deck.name)}
                          </h3>
                          {hasDraft && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-honey-100 text-honey-800 border border-honey-200 flex items-center space-x-1 shrink-0">
                              <FileEdit size={11} className="text-honey-600" />
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
                        className="p-1.5 text-cocoa-400 hover:text-cocoa-700 hover:bg-cocoa-50 rounded-xl transition-colors cursor-pointer"
                        title="Deck Options"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {activeMenuId === deck.id && (
                        <div 
                          className="absolute right-0 top-7 z-30 w-44 bg-white rounded-2xl shadow-card-hover border border-[#EAE6DF] p-1.5 text-xs font-semibold text-cocoa-800 space-y-0.5 animate-fadeIn"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => { onAddCardToDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Plus size={13} className="text-strawberry-500" />
                            <span>Add Card</span>
                          </button>
                          {onOpenAiDeck && (
                            <button
                              onClick={() => { onOpenAiDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                            >
                              <Sparkles size={13} className="text-taro-500" />
                              <span>AI Architect</span>
                            </button>
                          )}
                          <button
                            onClick={() => { onEditDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Settings size={13} className="text-cocoa-400" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={() => { onExportDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Download size={13} className="text-cocoa-400" />
                            <span>Export</span>
                          </button>
                          {onMergeDeck && (
                            <button
                              onClick={() => { onMergeDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                            >
                              <GitMerge size={13} className="text-cocoa-400" />
                              <span>Merge</span>
                            </button>
                          )}
                          <div className="border-t border-[#EAE6DF] my-1"></div>
                          <button
                            onClick={() => { onDeleteDeck(deck.id); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center flex-wrap gap-2 mt-4 pt-3 border-t border-[#EAE6DF] text-sm">
                    {totalDue > 0 ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold bg-strawberry-50 text-strawberry-800 border-strawberry-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-strawberry-500" />
                        <span className="tabular-nums">{totalDue} due today</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-matcha-50 text-matcha-800 border border-matcha-200 text-xs font-semibold">
                        <CheckCircle2 size={12} className="text-matcha-600" />
                        <span>Completed</span>
                      </span>
                    )}

                    {stats.newCount > 0 && (
                      <span className="text-sm text-cocoa-600 font-medium tabular-nums">
                        {stats.newCount} new
                      </span>
                    )}

                    <div className="ml-auto text-sm text-cocoa-600 font-medium tabular-nums">
                      {stats.total} {stats.total === 1 ? 'card' : 'cards'}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-[#EAE6DF]">
                  <button
                    onClick={() => { sounds.playClick(); onAddCardToDeck(deck); }}
                    className="py-1.5 px-3.5 rounded-full border border-[#EAE6DF] bg-white hover:bg-cocoa-50 text-cocoa-700 hover:text-strawberry-600 hover:border-strawberry-200 transition-colors flex items-center space-x-1 text-sm font-semibold cursor-pointer"
                    title="Add flashcard to this deck"
                  >
                    <Plus size={14} strokeWidth={2} />
                    <span>Add Card</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {totalDue === 0 && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onStudyDeck(deck, 'all');
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-[#EAE6DF] rounded-full text-sm font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                        title="Review all cards in this deck anytime"
                      >
                        <RotateCcw size={13} className="text-cocoa-400" />
                        <span>Practice</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        totalDue > 0
                          ? 'bg-strawberry-500 hover:bg-strawberry-600 text-white shadow-xs'
                          : 'bg-cocoa-100 hover:bg-cocoa-200 text-cocoa-800'
                      }`}
                    >
                      <span>{totalDue > 0 ? `Study (${totalDue})` : 'Study'}</span>
                      <ArrowRight size={13} />
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
