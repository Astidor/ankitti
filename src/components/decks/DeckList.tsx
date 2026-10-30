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
  X
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
      .replace(/^(\p{Extended_Pictographic}|\p{Regional_Indicator}{2})\s*/u, '')
      .replace(/^(JP|ES|CS:?)\s*/i, '')
      .trim() || name;
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
    <div className="space-y-5 w-full min-w-0">
      
      {/* 🌸 ELEGANT & COMPACT GREETING HERO 🌸 */}
      <div className="bg-white rounded-2xl border border-[#EAE4DC] p-5 sm:p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cocoa-50 border border-[#EAE4DC] p-1.5 shrink-0 flex items-center justify-center">
            <img 
              src="/assets/hero_mascot.png" 
              alt="Study Mascot" 
              className="w-full h-full object-cover rounded-xl select-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-cocoa-900 tracking-tight">
                Konnichiwa, Study Buddy!
              </h2>
              <KittyBow size={16} />
            </div>
            <p className="text-xs text-cocoa-500 font-medium">
              {totalDueAllDecks > 0 ? (
                <span>You have <strong className="text-strawberry-600 font-semibold">{totalDueAllDecks} cards due</strong> across {dueDecksCount} decks.</span>
              ) : (
                <span>All caught up for today! Your garden is blooming 🌸</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick CTA */}
        {firstDeckWithDue && totalDueAllDecks > 0 && (
          <button
            onClick={() => {
              sounds.playClick();
              onStudyDeck(firstDeckWithDue, 'due');
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-strawberry-500 hover:bg-strawberry-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-rose-btn hover:shadow-rose-btn-hover transition-all atelier-btn cursor-pointer shrink-0"
          >
            <Play size={13} className="fill-white" />
            <span>Study All Due ({totalDueAllDecks})</span>
            <ArrowRight size={13} />
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
          <div className="inline-flex p-0.5 bg-cocoa-100/70 rounded-xl border border-[#EAE4DC] self-start sm:self-auto shrink-0 text-xs">
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                deckFilter === 'all'
                  ? 'bg-white text-cocoa-900 shadow-2xs'
                  : 'text-cocoa-500 hover:text-cocoa-800'
              }`}
            >
              All Decks ({decks.length})
            </button>
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('due'); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                deckFilter === 'due'
                  ? 'bg-white text-strawberry-700 shadow-2xs'
                  : 'text-cocoa-500 hover:text-cocoa-800'
              }`}
            >
              <span>Due Today</span>
              {dueDecksCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
              className="px-3 py-2 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-[#EAE4DC] hover:border-strawberry-200 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 shadow-2xs atelier-btn cursor-pointer shrink-0"
            >
              <Sparkles size={13} className="text-taro-500" />
              <span>AI Deck</span>
            </button>
          )}

          {onMergeDeck && decks.length >= 2 && (
            <button
              onClick={() => { sounds.playClick(); onMergeDeck(); }}
              className="px-3 py-2 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-[#EAE4DC] hover:border-strawberry-200 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 shadow-2xs atelier-btn cursor-pointer shrink-0"
              title="Merge two decks into one"
            >
              <GitMerge size={13} className="text-cocoa-500" />
              <span>Merge</span>
            </button>
          )}

          <button
            onClick={() => { sounds.playClick(); onOpenImport(); }}
            className="px-3 py-2 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-[#EAE4DC] hover:border-strawberry-200 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 shadow-2xs atelier-btn cursor-pointer shrink-0"
          >
            <Download size={13} className="text-cocoa-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onCreateDeck(); }}
            className="px-3.5 py-2 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-rose-btn hover:shadow-rose-btn-hover atelier-btn cursor-pointer shrink-0"
          >
            <Plus size={14} />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* 🌸 MODULAR DECK GRID 🌸 */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAE4DC] p-12 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-strawberry-50 border border-strawberry-100 flex items-center justify-center text-strawberry-500">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-cocoa-900">No decks found</h3>
            <p className="text-xs text-cocoa-500 mt-1">Create your first deck or import an Anki .apkg collection.</p>
          </div>
          <button
            onClick={onCreateDeck}
            className="px-4 py-2 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-xl text-xs font-semibold shadow-rose-btn atelier-btn cursor-pointer"
          >
            Create Deck 🌸
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => {
            const stats = getDeckStats(deck.id);
            const totalDue = stats.newCount + stats.learnCount + stats.dueCount;
            const hasDraft = hasDraftForDeck(deck.id);

            return (
              <div
                key={deck.id}
                className="atelier-card p-4 sm:p-5 flex flex-col justify-between group transition-all w-full min-w-0"
              >
                <div>
                  {/* Top: Icon, Title & Options */}
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className="flex items-start space-x-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cocoa-50 border border-[#EAE4DC] flex items-center justify-center text-xl shrink-0 select-none group-hover:scale-105 transition-transform">
                        {deck.icon || '🎀'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm sm:text-base font-bold text-cocoa-900 group-hover:text-strawberry-600 transition-colors truncate">
                            {cleanDeckTitle(deck.name)}
                          </h3>
                          {hasDraft && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-honey-100 text-honey-800 border border-honey-200 flex items-center space-x-1 shrink-0">
                              <FileEdit size={10} className="text-honey-600" />
                              <span>Draft</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-cocoa-500 font-normal line-clamp-2 mt-1 leading-relaxed">
                          {deck.description || 'Master this collection with spaced repetition.'}
                        </p>
                      </div>
                    </div>

                    {/* Options Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === deck.id ? null : deck.id)}
                        className="p-1.5 text-cocoa-400 hover:text-cocoa-700 hover:bg-cocoa-50 rounded-lg transition-colors cursor-pointer"
                        title="Deck Options"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {activeMenuId === deck.id && (
                        <div 
                          className="absolute right-0 top-7 z-30 w-44 bg-white rounded-xl shadow-card-hover border border-[#EAE4DC] p-1 text-xs font-medium text-cocoa-800 space-y-0.5 animate-fadeIn"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => { onAddCardToDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Plus size={13} className="text-strawberry-500" />
                            <span>Add Card</span>
                          </button>
                          {onOpenAiDeck && (
                            <button
                              onClick={() => { onOpenAiDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                            >
                              <Sparkles size={13} className="text-taro-500" />
                              <span>AI Architect</span>
                            </button>
                          )}
                          <button
                            onClick={() => { onEditDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Settings size={13} className="text-cocoa-400" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={() => { onExportDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Download size={13} className="text-cocoa-400" />
                            <span>Export</span>
                          </button>
                          {onMergeDeck && (
                            <button
                              onClick={() => { onMergeDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-cocoa-50 flex items-center space-x-2 cursor-pointer"
                            >
                              <GitMerge size={13} className="text-cocoa-400" />
                              <span>Merge</span>
                            </button>
                          )}
                          <div className="border-t border-[#EAE4DC] my-1"></div>
                          <button
                            onClick={() => { onDeleteDeck(deck.id); setActiveMenuId(null); }}
                            className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center flex-wrap gap-2 mt-4 pt-3 border-t border-[#EAE4DC] text-xs">
                    {totalDue > 0 ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-strawberry-50 text-strawberry-700 border border-strawberry-200 text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-strawberry-500" />
                        <span>{totalDue} due today</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-matcha-50 text-matcha-700 border border-matcha-200 text-[11px] font-semibold">
                        <CheckCircle2 size={11} className="text-matcha-600" />
                        <span>Completed 🌸</span>
                      </span>
                    )}

                    {stats.newCount > 0 && (
                      <span className="text-[11px] text-cocoa-500 font-medium">
                        {stats.newCount} new
                      </span>
                    )}

                    <div className="ml-auto text-xs text-cocoa-400 font-medium">
                      {stats.total} {stats.total === 1 ? 'card' : 'cards'}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-[#EAE4DC]">
                  <button
                    onClick={() => { sounds.playClick(); onAddCardToDeck(deck); }}
                    className="p-1.5 rounded-lg border border-[#EAE4DC] text-cocoa-500 hover:text-strawberry-600 hover:border-strawberry-200 hover:bg-cocoa-50 transition-colors flex items-center space-x-1 text-xs font-medium cursor-pointer"
                    title="Add flashcard to this deck"
                  >
                    <Plus size={13} />
                    <span className="hidden sm:inline">Add Card</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {totalDue === 0 && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onStudyDeck(deck, 'all');
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-cocoa-50 text-cocoa-700 border border-[#EAE4DC] rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
                        title="Review all cards in this deck anytime"
                      >
                        <RotateCcw size={12} className="text-cocoa-400" />
                        <span>Relearn</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer atelier-btn ${
                        totalDue > 0
                          ? 'bg-strawberry-500 hover:bg-strawberry-600 text-white shadow-rose-btn'
                          : 'bg-cocoa-100 hover:bg-cocoa-200 text-cocoa-800'
                      }`}
                    >
                      <Play size={11} className={totalDue > 0 ? 'fill-white' : 'fill-cocoa-700'} />
                      <span>{totalDue > 0 ? `Study (${totalDue})` : 'Practice'}</span>
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
