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
  Calendar
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
      
      {/* Mobile Compact Hero Greeting */}
      <div className="sm:hidden bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KittyBow size={18} className="text-rose-500" />
            <span className="text-sm font-bold text-slate-900 tracking-tight">Study Dashboard</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {totalCardsAllDecks} Cards • {decks.length} Decks
          </span>
        </div>

        {firstDeckWithDue ? (
          <button
            onClick={() => {
              sounds.playClick();
              onStudyDeck(firstDeckWithDue, 'due');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500 active:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all ios-btn cursor-pointer"
          >
            <Zap size={14} />
            <span>Review Due Cards ({totalDueAllDecks})</span>
          </button>
        ) : (
          <div className="py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-medium text-xs flex items-center justify-center space-x-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>All caught up! Zero cards due today</span>
          </div>
        )}
      </div>

      {/* Desktop/Tablet Modern Cockpit Hero Banner */}
      <div className="hidden sm:block relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
              <KittyBow size={14} className="text-rose-500" />
              <span>Spaced Repetition Flashcards</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ready for your daily review?
            </h2>

            <p className="text-sm text-slate-600 font-normal leading-relaxed">
              Strengthen long-term memory with scheduled reviews powered by the SM-2 algorithm.
            </p>

            {/* Quick Action & Stats Pill */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {firstDeckWithDue ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onStudyDeck(firstDeckWithDue, 'due');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center space-x-2 shadow-xs hover:shadow-sm transition-all ios-btn cursor-pointer"
                  title={`Start reviewing ${firstDeckWithDue.name}`}
                >
                  <Zap size={14} />
                  <span>Start Due Review ({totalDueAllDecks} Cards)</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs flex items-center space-x-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>All caught up! Zero cards due right now</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                  <strong className="font-bold text-slate-900">{totalCardsAllDecks}</strong> Total Cards
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                  <strong className="font-bold text-slate-900">{decks.length}</strong> Decks
                </span>
              </div>
            </div>
          </div>

          {/* Clean Mascot Illustration */}
          <div className="relative shrink-0">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-slate-50 p-2 shadow-xs border border-slate-200/80 flex items-center justify-center">
              <img 
                src="/assets/hero_mascot.png" 
                alt="Ankitti Mascot" 
                className="w-full h-full object-cover rounded-xl select-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Segmented Filter & Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search & Segmented Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 shadow-xs transition-all"
            />
          </div>

          {/* Segmented Filter: All vs Due */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-auto shrink-0 shadow-xs">
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('all'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                deckFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Decks ({decks.length})
            </button>
            <button
              onClick={() => { sounds.playClick(); setDeckFilter('due'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                deckFilter === 'due'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Due Today</span>
              {dueDecksCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  deckFilter === 'due' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-800'
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
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-xs ios-btn cursor-pointer"
            >
              <Sparkles size={14} className="text-purple-500" />
              <span>AI Deck</span>
            </button>
          )}

          {onMergeDeck && decks.length >= 2 && (
            <button
              onClick={() => { sounds.playClick(); onMergeDeck(); }}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-xs ios-btn cursor-pointer"
              title="Merge two decks into one"
            >
              <GitMerge size={14} className="text-slate-500" />
              <span>Merge</span>
            </button>
          )}

          <button
            onClick={() => { sounds.playClick(); onOpenImport(); }}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-xs ios-btn cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onCreateDeck(); }}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-xs ios-btn cursor-pointer"
          >
            <Plus size={15} />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* Modern Grid Deck Cards */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <BookOpen size={28} className="text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No decks found</h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">Create a new deck or import an existing Anki .apkg collection.</p>
          </div>
          <button
            onClick={onCreateDeck}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs ios-btn cursor-pointer"
          >
            Create Your First Deck
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
                className="relative rounded-2xl bg-white border border-slate-200/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md flex flex-col justify-between shadow-xs"
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
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {deck.tags && deck.tags.length > 0 ? deck.tags[0] : 'Deck'}
                        </span>
                        {hasDraft && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                            <FileEdit size={11} className="text-amber-600" />
                            <span>Draft</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl p-2 bg-slate-50 rounded-xl border border-slate-200/60 select-none shrink-0 group-hover:scale-105 transition-transform">
                          {deck.icon || '📚'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors">
                          {deck.name}
                        </h3>
                      </div>
                    </div>

                    {/* Options Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === deck.id ? null : deck.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Deck Options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === deck.id && (
                        <div 
                          className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-lg border border-slate-200 p-1 text-xs font-medium text-slate-700 space-y-0.5 animate-fadeIn"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => { onAddCardToDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900 flex items-center space-x-2 cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>Add Card</span>
                          </button>
                          {onOpenAiDeck && (
                            <button
                              onClick={() => { onOpenAiDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2 cursor-pointer"
                            >
                              <Sparkles size={14} className="text-purple-500" />
                              <span>AI Add Cards</span>
                            </button>
                          )}
                          <button
                            onClick={() => { onEditDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900 flex items-center space-x-2 cursor-pointer"
                          >
                            <Settings size={14} />
                            <span>Deck Settings</span>
                          </button>
                          <button
                            onClick={() => { onExportDeck(deck); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900 flex items-center space-x-2 cursor-pointer"
                          >
                            <Download size={14} />
                            <span>Export (.apkg)</span>
                          </button>
                          {onMergeDeck && (
                            <button
                              onClick={() => { onMergeDeck(deck); setActiveMenuId(null); }}
                              className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900 flex items-center space-x-2 cursor-pointer"
                            >
                              <GitMerge size={14} />
                              <span>Merge Deck</span>
                            </button>
                          )}
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => { onDeleteDeck(deck.id); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Delete Deck</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deck Description */}
                  <p className="text-xs text-slate-500 font-normal line-clamp-2 mt-2 leading-relaxed">
                    {deck.description || 'No description provided.'}
                  </p>

                  {/* Anki Card Count Pills */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs font-medium">
                    {stats.newCount > 0 && (
                      <span className="flex items-center space-x-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{stats.newCount} new</span>
                      </span>
                    )}

                    {stats.learnCount > 0 && (
                      <span className="flex items-center space-x-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{stats.learnCount} learn</span>
                      </span>
                    )}

                    {stats.dueCount > 0 ? (
                      <span className="flex items-center space-x-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{stats.dueCount} due</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Completed</span>
                      </span>
                    )}

                    <div className="ml-auto text-xs text-slate-400 font-normal">
                      {stats.total} cards
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area: Study + Relearn Anytime */}
                <div className="pt-3 mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => { sounds.playClick(); onAddCardToDeck(deck); }}
                    className="py-1 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-medium flex items-center space-x-1 shrink-0 cursor-pointer"
                    title="Add flashcard to this deck"
                  >
                    <Plus size={14} />
                    <span>Card</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Relearn / Practice All Button */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, 'all');
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-all flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs"
                      title="Practice all cards in this deck"
                    >
                      <RotateCcw size={12} className="text-slate-500 shrink-0" />
                      <span>Review All</span>
                    </button>

                    {/* Primary Study Due Button */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStudyDeck(deck, totalDue > 0 ? 'due' : 'all');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-xs shrink-0 cursor-pointer ${
                        totalDue > 0
                          ? 'bg-rose-500 hover:bg-rose-600 text-white active:scale-95'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Play size={12} className={totalDue > 0 ? 'fill-white' : 'fill-slate-600'} />
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
