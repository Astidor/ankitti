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
  Search,
  Sparkles,
  BookOpen,
  Layers,
  FileEdit,
  GitMerge,
  CheckCircle2,
  Calendar,
  Flame,
  Sprout
} from 'lucide-react';
import { Deck, DeckStats } from '../../types/anki';
import { sounds } from '../../services/audio';
import { KittyBow, AestheticMascot } from '../common/KittyIllustrations';

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

// Pastel Palette rotation for aesthetic bento decks
const BENTO_THEMES = [
  {
    bg: 'bg-[#FFF7FA]',
    border: 'border-[#FFD1DC]',
    badgeBg: 'bg-[#FFE4EE]',
    badgeText: 'text-[#BE124C]',
    accentColor: '#FF4D88',
    tag: '🌸 Language & Vocab'
  },
  {
    bg: 'bg-[#F2FAF5]',
    border: 'border-[#C5ECD2]',
    badgeBg: 'bg-[#E2F6E8]',
    badgeText: 'text-[#1B652A]',
    accentColor: '#34A853',
    tag: '🌱 Biology & Medicine'
  },
  {
    bg: 'bg-[#F8F4FF]',
    border: 'border-[#E1D2FD]',
    badgeBg: 'bg-[#EFE7FE]',
    badgeText: 'text-[#5F24D4]',
    accentColor: '#8B5CF6',
    tag: '💻 Code & Algorithms'
  },
  {
    bg: 'bg-[#FFFDF2]',
    border: 'border-[#FEF0A3]',
    badgeBg: 'bg-[#FEF9D9]',
    badgeText: 'text-[#B45309]',
    accentColor: '#F59E0B',
    tag: '⭐ Core Knowledge'
  },
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
  onMergeDeck,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deckFilter, setDeckFilter] = useState<'all' | 'due'>('all');

  const totalCardsAllDecks = decks.reduce((acc, d) => acc + getDeckStats(d.id).total, 0);
  const totalDueAllDecks = decks.reduce((acc, d) => {
    const s = getDeckStats(d.id);
    return acc + s.newCount + s.learnCount + s.dueCount;
  }, 0);

  // Find first candidate deck with due cards for 1-click Quick Study
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
      
      {/* 🌸 THE BENTO COMPANION & STUDY GARDEN BANNER 🌸 */}
      <div className="relative overflow-hidden rounded-[28px] bg-white border border-[#EFE8DE] shadow-bento p-6 sm:p-7">
        
        {/* Soft background pastel gradient accent */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-gradient-to-br from-[#FFD1DC]/40 via-[#FFF0F5]/30 to-transparent rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Greeting & Garden Status */}
          <div className="space-y-3.5 max-w-xl text-left">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFF0F5] border border-[#FFD1DC] text-[#BE124C] text-xs font-bold shadow-2xs">
              <KittyBow size={15} />
              <span>Ankitti Spaced Repetition Studio 🎀</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3E2D28] tracking-tight">
                Konnichiwa, Study Buddy! 🌸
              </h2>
              <p className="text-xs sm:text-sm text-cocoa-500 font-medium leading-relaxed">
                Your memory garden grows with every spaced repetition review. No lockouts, no pressure.
              </p>
            </div>

            {/* Study Garden Pill & Quick Study CTA */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              {firstDeckWithDue ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onStudyDeck(firstDeckWithDue, 'due');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-strawberry-500 hover:bg-strawberry-600 text-white font-bold text-xs flex items-center space-x-2 shadow-squishy-pink transition-all squishy-btn cursor-pointer"
                  title={`Start reviewing ${firstDeckWithDue.name}`}
                >
                  <Zap size={14} className="fill-white" />
                  <span>Review Due Cards ({totalDueAllDecks} Cards)</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-matcha-50 border border-matcha-200 text-matcha-700 font-bold text-xs flex items-center space-x-2">
                  <CheckCircle2 size={15} className="text-matcha-600" />
                  <span>Garden blooming! Zero cards due today ✨</span>
                </div>
              )}

              {/* Garden Status Badges */}
              <div className="flex items-center space-x-2 text-xs font-bold text-cocoa-600">
                <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
                  <Sprout size={14} className="text-matcha-600" />
                  <span>{totalCardsAllDecks} Total Cards</span>
                </span>
                <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
                  <Layers size={14} className="text-strawberry-500" />
                  <span>{decks.length} Decks</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Mascot Illustration */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-[#FAF7F2] p-2.5 shadow-2xs border border-[#EFE8DE] flex items-center justify-center animate-floatGentle">
              <img 
                src="/assets/hero_mascot.png" 
                alt="Study Mascot" 
                className="w-full h-full object-cover rounded-2xl select-none"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 🍱 CONTROL BAR: SEARCH, WASHI-TAPE FILTERS & ACTIONS 🍱 */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search & Segmented Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" size={15} />
            <input
              type="text"
              placeholder="Search bento decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-xs font-semibold text-[#3E2D28] placeholder-cocoa-400 border border-[#EFE8DE] focus:outline-none focus:ring-2 focus:ring-strawberry-300 focus:border-strawberry-400 shadow-2xs transition-all"
            />
          </div>

          {/* Washi-Tape Styled Segmented Filter */}
          <div className="inline-flex p-1 bg-[#FAF7F2] rounded-xl border border-[#EFE8DE] self-start sm:self-auto shrink-0 shadow-2xs">
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('all'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deckFilter === 'all'
                  ? 'bg-white text-[#3E2D28] shadow-xs'
                  : 'text-cocoa-500 hover:text-[#3E2D28]'
              }`}
            >
              All Decks ({decks.length})
            </button>
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('due'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                deckFilter === 'due'
                  ? 'bg-strawberry-500 text-white shadow-xs'
                  : 'text-cocoa-500 hover:text-[#3E2D28]'
              }`}
            >
              <span>Due Today</span>
              {dueDecksCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  deckFilter === 'due' ? 'bg-white text-strawberry-700' : 'bg-strawberry-100 text-strawberry-800'
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
              className="px-3.5 py-2 bg-white hover:bg-[#FAF7F2] text-[#3E2D28] border border-[#EFE8DE] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs squishy-btn cursor-pointer"
            >
              <Sparkles size={14} className="text-taro-500" />
              <span>AI Architect</span>
            </button>
          )}

          {onMergeDeck && decks.length >= 2 && (
            <button
              onClick={() => { sounds.playClick(); onMergeDeck(); }}
              className="px-3.5 py-2 bg-white hover:bg-[#FAF7F2] text-[#3E2D28] border border-[#EFE8DE] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs squishy-btn cursor-pointer"
              title="Merge two decks into one"
            >
              <GitMerge size={14} className="text-cocoa-500" />
              <span>Merge Decks</span>
            </button>
          )}

          <button
            onClick={() => { sounds.playClick(); onOpenImport(); }}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF7F2] text-[#3E2D28] border border-[#EFE8DE] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs squishy-btn cursor-pointer"
          >
            <Download size={14} className="text-cocoa-500" />
            <span>Import .apkg</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onCreateDeck(); }}
            className="px-4 py-2 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-squishy-pink squishy-btn cursor-pointer"
          >
            <Plus size={15} />
            <span>+ New Deck</span>
          </button>
        </div>
      </div>

      {/* 🌸 MODULAR BENTO DECK GRID 🌸 */}
      {filteredDecks.length === 0 ? (
        <div className="bento-card p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FFF0F5] border border-[#FFD1DC] flex items-center justify-center">
            <BookOpen size={28} className="text-strawberry-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#3E2D28]">No study decks found</h3>
            <p className="text-xs text-cocoa-500 mt-1">Create your first deck or import an Anki .apkg collection.</p>
          </div>
          <button
            onClick={onCreateDeck}
            className="px-5 py-2.5 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-2xl text-xs font-bold shadow-squishy-pink squishy-btn cursor-pointer"
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
                className={`relative rounded-[26px] ${theme.bg} border-2 ${theme.border} p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-bento-hover flex flex-col justify-between shadow-bento`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className="space-y-2 cursor-pointer flex-1 group"
                    >
                      {/* Top Washi Tag & Draft Status */}
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                          {deck.tags && deck.tags.length > 0 ? deck.tags[0] : theme.tag}
                        </span>
                        {hasDraft && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-honey-100 text-honey-700 border border-honey-200 flex items-center space-x-1">
                            <FileEdit size={11} className="text-honey-600" />
                            <span>Draft Auto-Saved</span>
                          </span>
                        )}
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-center space-x-3 pt-0.5">
                        <span className="text-2xl p-2.5 bg-white rounded-2xl border border-[#EFE8DE] select-none shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          {deck.icon || '🎀'}
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-[#3E2D28] tracking-tight group-hover:text-strawberry-600 transition-colors">
                            {deck.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Options Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === deck.id ? null : deck.id)}
                        className="p-1.5 text-cocoa-400 hover:text-cocoa-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
                        title="Deck Options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === deck.id && (
                        <div 
                          className="absolute right-0 top-8 z-30 w-44 bg-white rounded-2xl shadow-xl border border-[#EFE8DE] p-1.5 text-xs font-semibold text-[#3E2D28] space-y-0.5 animate-fadeIn"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => { onAddCardToDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-[#FAF7F2] flex items-center space-x-2 cursor-pointer"
                          >
                            <Plus size={14} className="text-strawberry-500" />
                            <span>Add Card</span>
                          </button>
                          {onOpenAiDeck && (
                            <button
                              onClick={() => { onOpenAiDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-taro-50 hover:text-taro-700 flex items-center space-x-2 cursor-pointer"
                            >
                              <Sparkles size={14} className="text-taro-500" />
                              <span>AI Architect Cards</span>
                            </button>
                          )}
                          <button
                            onClick={() => { onEditDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-[#FAF7F2] flex items-center space-x-2 cursor-pointer"
                          >
                            <Settings size={14} className="text-cocoa-400" />
                            <span>Deck Settings</span>
                          </button>
                          <button
                            onClick={() => { onExportDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-[#FAF7F2] flex items-center space-x-2 cursor-pointer"
                          >
                            <Download size={14} className="text-cocoa-400" />
                            <span>Export (.json)</span>
                          </button>
                          {onMergeDeck && (
                            <button
                              onClick={() => { onMergeDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-[#FAF7F2] flex items-center space-x-2 cursor-pointer"
                            >
                              <GitMerge size={14} className="text-cocoa-400" />
                              <span>Merge Deck</span>
                            </button>
                          )}
                          <div className="border-t border-[#EFE8DE] my-1"></div>
                          <button
                            onClick={() => { onDeleteDeck(deck.id); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Delete Deck</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deck Description */}
                  <p className="text-xs text-cocoa-500 font-medium line-clamp-2 mt-2 leading-relaxed">
                    {deck.description || 'Master this collection with spaced repetition.'}
                  </p>

                  {/* Anki Card Count Pills */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#EFE8DE]/80 text-xs font-bold">
                    {stats.newCount > 0 && (
                      <span className="flex items-center space-x-1 text-taro-700 bg-white px-2.5 py-0.5 rounded-full border border-taro-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-taro-500" />
                        <span>{stats.newCount} new</span>
                      </span>
                    )}

                    {stats.learnCount > 0 && (
                      <span className="flex items-center space-x-1 text-honey-700 bg-white px-2.5 py-0.5 rounded-full border border-honey-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-honey-500" />
                        <span>{stats.learnCount} learn</span>
                      </span>
                    )}

                    {stats.dueCount > 0 ? (
                      <span className="flex items-center space-x-1 text-strawberry-700 bg-white px-2.5 py-0.5 rounded-full border border-strawberry-200 font-extrabold">
                        <span className="w-1.5 h-1.5 rounded-full bg-strawberry-500" />
                        <span>{stats.dueCount} due today</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-matcha-700 bg-white px-2.5 py-0.5 rounded-full border border-matcha-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-matcha-500" />
                        <span>Completed 🌸</span>
                      </span>
                    )}

                    <div className="ml-auto text-xs text-cocoa-400 font-semibold">
                      {stats.total} total
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area: +Card, Relearn Anytime, and Study */}
                <div className="pt-3.5 mt-2 flex items-center justify-between gap-2 border-t border-[#EFE8DE]/60">
                  <button
                    onClick={() => { sounds.playClick(); onAddCardToDeck(deck); }}
                    className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#3E2D28] border border-[#EFE8DE] transition-colors text-xs font-bold flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
                    title="Add flashcard to this deck"
                  >
                    <Plus size={13} className="text-strawberry-500" />
                    <span>Card</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Relearn / Drill All Anytime Button */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, 'all');
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#3E2D28] border border-[#EFE8DE] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-2xs"
                      title="Drill or relearn all cards in this deck anytime"
                    >
                      <RotateCcw size={12} className="text-cocoa-400 shrink-0" />
                      <span>Relearn All</span>
                    </button>

                    {/* Primary Study Due Button */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer squishy-btn ${
                        totalDue > 0
                          ? 'bg-strawberry-500 hover:bg-strawberry-600 text-white shadow-squishy-pink active:scale-95'
                          : 'bg-white hover:bg-slate-100 text-[#3E2D28] border border-[#EFE8DE]'
                      }`}
                    >
                      <Play size={12} className={totalDue > 0 ? 'fill-white' : 'fill-cocoa-600'} />
                      <span>{totalDue > 0 ? `Study (${totalDue})` : 'Study'}</span>
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
