import React, { useState, useEffect } from 'react';
import { X, GitMerge, ArrowDown, Plus, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Deck } from '../../types/anki';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';

interface MergeDeckModalProps {
  isOpen: boolean;
  decks: Deck[];
  initialSourceDeck?: Deck | null;
  getDeckCardCount: (deckId: string) => number;
  onClose: () => void;
  onMergeDecks: (
    sourceDeckId: string,
    targetDeckId: string,
    options: { deleteSourceDeck: boolean; tagMergedCards: boolean },
    newDeck?: { name: string; icon: string; color: string }
  ) => Promise<void>;
}

const DECK_ICONS = ['🎀', '📚', '🧠', '🫀', '🔬', '⭐', '🌸', '💻', '🎨', '⚡'];

export const MergeDeckModal: React.FC<MergeDeckModalProps> = ({
  isOpen,
  decks,
  initialSourceDeck,
  getDeckCardCount,
  onClose,
  onMergeDecks,
}) => {
  const [sourceDeckId, setSourceDeckId] = useState<string>('');
  const [targetMode, setTargetMode] = useState<'existing' | 'new'>('existing');
  const [targetDeckId, setTargetDeckId] = useState<string>('');
  
  // New deck fields
  const [newDeckName, setNewDeckName] = useState<string>('');
  const [newDeckIcon, setNewDeckIcon] = useState<string>('🎀');
  const [newDeckColor, setNewDeckColor] = useState<string>('#ff4d88');

  // Options
  const [deleteSourceDeck, setDeleteSourceDeck] = useState<boolean>(true);
  const [tagMergedCards, setTagMergedCards] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const source = initialSourceDeck || decks[0];
    const initialSrcId = source ? source.id : '';
    setSourceDeckId(initialSrcId);

    // Pick first candidate target that is not the source
    const candidateTarget = decks.find(d => d.id !== initialSrcId);
    if (candidateTarget) {
      setTargetDeckId(candidateTarget.id);
      setTargetMode('existing');
    } else {
      setTargetMode('new');
    }

    if (source) {
      setNewDeckName(`${source.name} (Combined)`);
    } else {
      setNewDeckName('Merged Deck 🎀');
    }

    setDeleteSourceDeck(true);
    setTagMergedCards(true);
    setIsSubmitting(false);
  }, [isOpen, initialSourceDeck, decks]);

  if (!isOpen) return null;

  const sourceDeck = decks.find(d => d.id === sourceDeckId);
  const availableTargetDecks = decks.filter(d => d.id !== sourceDeckId);
  const targetDeck = targetMode === 'existing' ? decks.find(d => d.id === targetDeckId) : null;

  const sourceCardCount = sourceDeck ? getDeckCardCount(sourceDeck.id) : 0;
  const targetCurrentCount = targetDeck ? getDeckCardCount(targetDeck.id) : 0;
  const totalCombinedCount = targetMode === 'new' ? sourceCardCount : targetCurrentCount + sourceCardCount;

  const handleSourceChange = (newSrcId: string) => {
    setSourceDeckId(newSrcId);
    if (targetDeckId === newSrcId) {
      const nextTarget = decks.find(d => d.id !== newSrcId);
      if (nextTarget) {
        setTargetDeckId(nextTarget.id);
      } else {
        setTargetMode('new');
      }
    }
    const newSrc = decks.find(d => d.id === newSrcId);
    if (newSrc && targetMode === 'new') {
      setNewDeckName(`${newSrc.name} (Combined)`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceDeckId) return;

    if (targetMode === 'existing' && !targetDeckId) return;
    if (targetMode === 'new' && !newDeckName.trim()) return;

    setIsSubmitting(true);
    try {
      await onMergeDecks(
        sourceDeckId,
        targetMode === 'existing' ? targetDeckId : '',
        { deleteSourceDeck, tagMergedCards },
        targetMode === 'new' ? { name: newDeckName.trim(), icon: newDeckIcon, color: newDeckColor } : undefined
      );
      sounds.playRating(4);
      onClose();
    } catch (err) {
      console.error('Merge decks failed:', err);
      alert('Failed to merge decks. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-t-[32px] sm:rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden border border-pink-200/90 ios-bottom-sheet sm:animate-none flex flex-col max-h-[92vh]">
        
        {/* iOS Grabber & Header */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-white/70">
          <div className="w-10 h-1 bg-pink-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-pink-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-pink-50 rounded-xl border border-pink-200/60 shadow-xs flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-xs font-black text-slate-800 tracking-tight flex items-center space-x-1.5">
                <span>Merge Flashcard Decks</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-pink-100 text-pink-700 font-bold">
                  2 Decks → 1
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Transfer all cards safely into one unified deck</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* STEP 1: SOURCE DECK */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              1. Source Deck (Move cards from)
            </label>
            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-200/80">
              <select
                value={sourceDeckId}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-white border border-rose-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.icon || '🎀'} {deck.name} ({getDeckCardCount(deck.id)} cards)
                  </option>
                ))}
              </select>

              <div className="mt-2 flex items-center justify-between text-[11px] text-rose-700 font-medium px-1">
                <span>Selected to move:</span>
                <span className="font-extrabold font-mono bg-rose-100 px-2 py-0.5 rounded-full text-rose-800">
                  {sourceCardCount} cards
                </span>
              </div>
            </div>
          </div>

          {/* CONNECTOR ICON */}
          <div className="flex items-center justify-center -my-1">
            <div className="w-8 h-8 rounded-full bg-pink-100 border border-pink-300 text-pink-600 flex items-center justify-center shadow-xs">
              <ArrowDown size={16} className="animate-bounce" />
            </div>
          </div>

          {/* STEP 2: DESTINATION DECK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                2. Destination Deck (Merge cards into)
              </label>

              {/* Toggle: Existing vs New */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setTargetMode('existing')}
                  disabled={availableTargetDecks.length === 0}
                  className={`px-2 py-1 rounded-md transition-all ${
                    targetMode === 'existing'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 disabled:opacity-40'
                  }`}
                >
                  Existing Deck
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('new')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    targetMode === 'new'
                      ? 'bg-white text-pink-700 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  + New Deck
                </button>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
              {targetMode === 'existing' ? (
                availableTargetDecks.length > 0 ? (
                  <>
                    <select
                      value={targetDeckId}
                      onChange={(e) => setTargetDeckId(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-white border border-emerald-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {availableTargetDecks.map((deck) => (
                        <option key={deck.id} value={deck.id}>
                          {deck.icon || '🎀'} {deck.name} (currently {getDeckCardCount(deck.id)} cards)
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium px-1">
                      <span>Resulting total:</span>
                      <span className="font-extrabold font-mono bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-900">
                        {totalCombinedCount} cards ({targetCurrentCount} + {sourceCardCount})
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 py-1 text-center">
                    No other decks available. Switch to "+ New Deck" above.
                  </div>
                )
              ) : (
                /* CREATE NEW DECK INPUT */
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center space-x-2">
                    {/* Emoji Picker */}
                    <select
                      value={newDeckIcon}
                      onChange={(e) => setNewDeckIcon(e.target.value)}
                      className="text-base p-2 bg-white border border-emerald-200 rounded-xl focus:outline-none shrink-0"
                    >
                      {DECK_ICONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      placeholder="Name for new merged deck..."
                      className="flex-1 text-xs font-bold text-slate-800 bg-white border border-emerald-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="text-[11px] text-emerald-800 font-medium px-1 flex items-center justify-between">
                    <span>New deck will contain:</span>
                    <span className="font-extrabold font-mono bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-900">
                      {sourceCardCount} cards
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: MERGE OPTIONS */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Merge Preferences
            </span>

            {/* Option 1: Delete source deck */}
            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deleteSourceDeck}
                onChange={(e) => setDeleteSourceDeck(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Delete empty source deck after merge</span>
                <span className="text-[11px] text-slate-500">
                  {deleteSourceDeck 
                    ? `"${sourceDeck?.name || 'Source'}" will be safely deleted once cards are moved.` 
                    : `"${sourceDeck?.name || 'Source'}" will remain in your list with 0 cards.`}
                </span>
              </div>
            </label>

            {/* Option 2: Tag merged cards */}
            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tagMergedCards}
                onChange={(e) => setTagMergedCards(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Tag cards with source deck name</span>
                <span className="text-[11px] text-slate-500">
                  Adds tag <code className="bg-pink-100 text-pink-800 px-1 rounded font-mono text-[10px]">#from-{(sourceDeck?.name || 'deck').slice(0, 15)}</code> so you can track or filter them later.
                </span>
              </div>
            </label>
          </div>

          {/* REASSURANCE NOTICE */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 px-1">
            <Sparkles size={14} className="text-pink-500 shrink-0" />
            <span>All card review history, learning intervals, and scheduling stats are 100% preserved.</span>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || sourceCardCount === 0 || (targetMode === 'existing' && !targetDeckId) || (targetMode === 'new' && !newDeckName.trim())}
              className="px-5 py-2.5 rounded-2xl bg-[#ff3366] hover:bg-[#e11d48] text-white text-xs font-extrabold shadow-md shadow-pink-200 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <GitMerge size={15} />
              <span>{isSubmitting ? 'Merging Cards...' : `Merge ${sourceCardCount} Cards 🎀`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
