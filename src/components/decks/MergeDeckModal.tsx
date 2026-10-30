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
  const [newDeckColor, setNewDeckColor] = useState<string>('#f43f5e');

  // Options
  const [deleteSourceDeck, setDeleteSourceDeck] = useState<boolean>(true);
  const [tagMergedCards, setTagMergedCards] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setNewDeckName('Merged Deck');
    }

    setDeleteSourceDeck(true);
    setTagMergedCards(true);
    setIsSubmitting(false);
    setErrorMessage(null);
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
    setErrorMessage(null);
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
      setErrorMessage('Failed to merge decks. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 ios-bottom-sheet sm:animate-none flex flex-col max-h-[92vh]">
        
        {/* iOS Grabber */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-slate-50 sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-500 border border-rose-100 flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span>Merge Decks</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  2 Decks → 1
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-normal">Transfer all cards safely into one unified deck</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle size={15} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* STEP 1: SOURCE DECK */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              1. Source Deck (Move cards from)
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <select
                value={sourceDeckId}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              >
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.icon || '📁'} {deck.name} ({getDeckCardCount(deck.id)} cards)
                  </option>
                ))}
              </select>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 font-medium px-1">
                <span>Selected to move:</span>
                <span className="font-semibold font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-800">
                  {sourceCardCount} cards
                </span>
              </div>
            </div>
          </div>

          {/* CONNECTOR ICON */}
          <div className="flex items-center justify-center -my-1">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shadow-2xs">
              <ArrowDown size={14} />
            </div>
          </div>

          {/* STEP 2: DESTINATION DECK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                2. Destination Deck (Merge cards into)
              </label>

              {/* Toggle: Existing vs New */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setTargetMode('existing')}
                  disabled={availableTargetDecks.length === 0}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
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
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    targetMode === 'new'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  + New Deck
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              {targetMode === 'existing' ? (
                availableTargetDecks.length > 0 ? (
                  <>
                    <select
                      value={targetDeckId}
                      onChange={(e) => setTargetDeckId(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                    >
                      {availableTargetDecks.map((deck) => (
                        <option key={deck.id} value={deck.id}>
                          {deck.icon || '📁'} {deck.name} (currently {getDeckCardCount(deck.id)} cards)
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium px-1">
                      <span>Resulting total:</span>
                      <span className="font-semibold font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-800">
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
                      className="text-base p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none shrink-0"
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
                      className="flex-1 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                    />
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium px-1 flex items-center justify-between">
                    <span>New deck will contain:</span>
                    <span className="font-semibold font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-800">
                      {sourceCardCount} cards
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: MERGE OPTIONS */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
              Merge Preferences
            </span>

            {/* Option 1: Delete source deck */}
            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deleteSourceDeck}
                onChange={(e) => setDeleteSourceDeck(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">Delete empty source deck after merge</span>
                <span className="text-[11px] text-slate-500">
                  {deleteSourceDeck 
                    ? `"${sourceDeck?.name || 'Source'}" will be deleted once cards are moved.` 
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
                className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">Tag cards with source deck name</span>
                <span className="text-[11px] text-slate-500">
                  Adds tag <code className="bg-slate-200 text-slate-800 px-1 rounded font-mono text-[10px]">#from-{(sourceDeck?.name || 'deck').slice(0, 15)}</code> for filtering.
                </span>
              </div>
            </label>
          </div>

          {/* REASSURANCE NOTICE */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 px-1">
            <Sparkles size={14} className="text-rose-500 shrink-0" />
            <span>Card review history, intervals, and scheduling stats are fully preserved.</span>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || sourceCardCount === 0 || (targetMode === 'existing' && !targetDeckId) || (targetMode === 'new' && !newDeckName.trim())}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <GitMerge size={15} />
              <span>{isSubmitting ? 'Merging Cards...' : `Merge ${sourceCardCount} Cards`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
