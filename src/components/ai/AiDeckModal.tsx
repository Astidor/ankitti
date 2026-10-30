import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Bot, 
  Layers, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2,
  Key
} from 'lucide-react';
import { Deck, Card, AiDeckResponse } from '../../types/anki';
import { DEFAULT_DECK_SETTINGS } from '../../services/scheduler';
import { api } from '../../services/api';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';

interface AiDeckModalProps {
  isOpen: boolean;
  decks?: Deck[];
  initialDeckId?: string | null;
  onClose: () => void;
  onDeckCreated: (deck: Deck, cards: Card[]) => void;
}

const PRESET_TOPICS = [
  { label: 'Japanese N5 Verbs', topic: 'Japanese JLPT N5 essential verbs, polite forms (masu), and example sentences' },
  { label: 'Pharmacology: Antibiotics', topic: 'High-yield antibiotics mechanisms, bacterial coverage, and classic side effects' },
  { label: 'React 19 & Next.js', topic: 'Modern React server components, hooks, concurrent rendering, and performance' },
  { label: 'Neuroscience Basics', topic: 'Brain lobes, cranial nerves, functions, and clinical lesions' },
  { label: 'Constitutional Law', topic: 'US Constitutional Amendments 1 to 14, historic court cases, and key rights' },
];

export const AiDeckModal: React.FC<AiDeckModalProps> = ({
  isOpen,
  decks = [],
  initialDeckId,
  onClose,
  onDeckCreated,
}) => {
  const [destinationMode, setDestinationMode] = useState<'existing' | 'new'>('new');
  const [targetDeckId, setTargetDeckId] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [cardCount, setCardCount] = useState<number>(6);
  const [style, setStyle] = useState<'mixed' | 'basic' | 'cloze'>('mixed');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<AiDeckResponse | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Record<number, boolean>>({});
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('ankitti_custom_deepseek_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  const handleSaveCustomKey = (val: string) => {
    setCustomApiKey(val);
    if (val.trim()) {
      localStorage.setItem('ankitti_custom_deepseek_key', val.trim());
    } else {
      localStorage.removeItem('ankitti_custom_deepseek_key');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (initialDeckId && decks.some(d => d.id === initialDeckId)) {
      setDestinationMode('existing');
      setTargetDeckId(initialDeckId);
    } else if (decks.length > 0) {
      setTargetDeckId(decks[0].id);
      setDestinationMode(initialDeckId ? 'existing' : (decks.length > 0 ? 'existing' : 'new'));
    } else {
      setDestinationMode('new');
    }
  }, [isOpen, initialDeckId, decks]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedResult(null);

    const storedCustomKey = (localStorage.getItem('ankitti_custom_deepseek_key') || '').trim();
    const effectiveKey = customApiKey.trim() || storedCustomKey || undefined;

    try {
      const result = await api.generateAiDeck({
        topic: topic.trim(),
        cardCount,
        notes: notes.trim(),
        style,
        apiKey: effectiveKey,
      });

      setGeneratedResult(result);
      const initialSelected: Record<number, boolean> = {};
      result.cards.forEach((_, idx) => {
        initialSelected[idx] = true;
      });
      setSelectedIndices(initialSelected);
      sounds.playRating(4);
    } catch (err: unknown) {
      sounds.playRating(1);
      const msg = err instanceof Error ? err.message : 'AI Generation failed';
      if (msg === 'KEY_MISSING' || msg === 'AI_API_KEY_MISSING') {
        setShowKeyInput(true);
        setErrorMessage('DeepSeek API key is not configured in Cloudflare yet. You can provide your own API key below to generate cards immediately!');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDeck = decks.find(d => d.id === targetDeckId);
  const selectedCount = Object.values(selectedIndices).filter(Boolean).length;

  const handleImportToCollection = async () => {
    if (!generatedResult) return;

    setIsLoading(true);
    try {
      const now = Date.now();
      let targetDeck: Deck;

      if (destinationMode === 'existing' && targetDeckId && decks.length > 0) {
        const found = decks.find(d => d.id === targetDeckId);
        if (!found) {
          throw new Error('Target destination deck not found');
        }
        targetDeck = found;
      } else {
        // Create brand new deck
        const deckId = `deck_ai_${now}`;
        targetDeck = {
          id: deckId,
          name: generatedResult.deck.name,
          description: generatedResult.deck.description,
          icon: generatedResult.deck.icon || '🤖',
          color: generatedResult.deck.color || '#f43f5e',
          settings: {
            ...DEFAULT_DECK_SETTINGS,
            newCardsPerDay: 20,
            reviewsPerDay: 100,
          },
          createdAt: now,
          updatedAt: now,
        };
        await api.createDeck(targetDeck);
      }

      // Create Selected Cards
      const createdCards: Card[] = [];
      const cardsToCreate = generatedResult.cards.filter((_, idx) => selectedIndices[idx] !== false);

      for (let i = 0; i < cardsToCreate.length; i++) {
        const item = cardsToCreate[i];
        const card: Card = {
          id: `card_ai_${i}_${now}`,
          deckId: targetDeck.id,
          type: item.type,
          front: item.front,
          back: item.back,
          tags: item.tags || ['AI-Generated'],
          createdAt: now,
          due: now,
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          lapses: 0,
          state: 'new',
          stepIndex: 0,
          medicalMeta: {
            highYield: true,
            takeaway: item.takeaway,
            mnemonic: item.mnemonic,
            clinicalPearl: item.takeaway,
          },
        };

        const saved = await api.createCard(card);
        createdCards.push(saved);
      }

      sounds.playRating(4);
      onDeckCreated(targetDeck, createdCards);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import deck';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (idx: number) => {
    setSelectedIndices(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl overflow-hidden border border-slate-200 flex flex-col ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber */}
        <div className="pt-2 pb-1 flex justify-center bg-slate-50 sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-500 border border-rose-100 flex items-center justify-center">
              <Bot size={18} />
            </span>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span>AI Deck Architect</span>
                <KittyBow size={15} />
              </div>
              <div className="text-[11px] text-slate-500">Generate high-yield flashcards with clozes and mnemonics</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-bold">Notice</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {!generatedResult && (
            <form onSubmit={handleGenerate} className="space-y-4">
              
              {/* Destination Selector: Add to Existing Deck vs Create New Deck */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <Layers size={13} className="text-slate-500" />
                    <span>Destination</span>
                  </span>

                  {decks.length > 0 && (
                    <div className="inline-flex p-0.5 bg-white rounded-lg border border-slate-200 text-[10px] font-semibold shadow-2xs">
                      <button
                        type="button"
                        onClick={() => { sounds.playClick(); setDestinationMode('existing'); }}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          destinationMode === 'existing'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Add to Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => { sounds.playClick(); setDestinationMode('new'); }}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          destinationMode === 'new'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        + New Deck
                      </button>
                    </div>
                  )}
                </div>

                {destinationMode === 'existing' && decks.length > 0 ? (
                  <div className="space-y-1 pt-0.5">
                    <select
                      value={targetDeckId}
                      onChange={(e) => setTargetDeckId(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                    >
                      {decks.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.icon || '📁'} {d.name}
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-slate-500 font-medium px-1 flex items-center space-x-1">
                      <span>✓ Cards will be added into</span>
                      <strong className="font-semibold text-slate-800">{selectedDeck?.name || 'this deck'}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-normal px-1">
                    AI will automatically title and create a brand new deck in your collection.
                  </div>
                )}
              </div>

              {/* Presets */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 text-[11px] flex items-center justify-between">
                  <span>Quick Presets</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to fill</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setTopic(p.topic)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 text-[11px] font-medium transition-all cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 text-xs">
                  Topic or Concept <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Japanese JLPT N5 Verbs, or Cardiac Arrhythmias..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-2xs"
                />
              </div>

              {/* Source Notes Paste Area */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700 text-xs">
                    Paste Lecture Notes or Text (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">Extract high-yield cards</span>
                </div>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste your raw notes, study guides, or syllabus here. The AI will distill them into optimal flashcards with clozes and mnemonics..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-2xs resize-y"
                />
              </div>

              {/* Generation Controls: Card count & Card Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-700 text-[11px]">
                      Cards to Generate: <strong className="text-rose-600">{cardCount}</strong>
                    </label>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={cardCount}
                    onChange={(e) => setCardCount(parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>3 Quick</span>
                    <span>8 Standard</span>
                    <span>15 Deep</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 text-[11px] block mb-1.5">
                    Flashcard Style
                  </label>
                  <div className="inline-flex p-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs w-full">
                    <button
                      type="button"
                      onClick={() => setStyle('mixed')}
                      className={`flex-1 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                        style === 'mixed' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Mixed
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('basic')}
                      className={`flex-1 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                        style === 'basic' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Q&A
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('cloze')}
                      className={`flex-1 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                        style === 'cloze' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Cloze
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom API Key Collapsible */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="w-full px-3.5 py-2 flex items-center justify-between text-left text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-1.5 font-medium text-[11px]">
                    <Key size={13} className="text-slate-400" />
                    <span>DeepSeek API Key {customApiKey ? '✓ (Custom key configured)' : '(Optional)'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {showKeyInput ? 'Hide' : 'Configure'}
                  </span>
                </button>
                
                {showKeyInput && (
                  <div className="p-3 pt-1 space-y-2 border-t border-slate-100 bg-slate-50">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      By default, Ankitti uses your Cloudflare secret <code className="font-mono bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[10px]">DEEPSEEK_API_KEY</code>. You can also provide a personal DeepSeek API key:
                    </p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="password"
                        value={customApiKey}
                        onChange={(e) => handleSaveCustomKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                      />
                      {customApiKey && (
                        <button
                          type="button"
                          onClick={() => handleSaveCustomKey('')}
                          className="px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Stored only in your local browser storage. Never committed to git.
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 pb-safe">
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating flashcards with AI...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate Cards</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Generated Deck Review Stage */}
          {generatedResult && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Deck Summary Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs border border-slate-200">
                    {destinationMode === 'existing' ? (selectedDeck?.icon || '📁') : (generatedResult.deck.icon || '🤖')}
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                      {destinationMode === 'existing' ? 'Destination Deck' : 'New Deck Title'}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {destinationMode === 'existing' ? selectedDeck?.name : generatedResult.deck.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {destinationMode === 'existing'
                        ? 'Cards will be added directly into this deck.'
                        : generatedResult.deck.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                    {selectedCount} / {generatedResult.cards.length} Cards
                  </span>
                </div>
              </div>

              {/* Cards List Preview */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {generatedResult.cards.map((card, idx) => {
                  const isSelected = selectedIndices[idx] !== false;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelect(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start space-x-3 ${
                        isSelected 
                          ? 'bg-white border-slate-300 shadow-2xs ring-1 ring-rose-500/20' 
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-rose-600 focus:ring-rose-400 mt-1 accent-rose-500 w-4 h-4 cursor-pointer"
                      />

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {card.type === 'cloze' ? 'Cloze' : 'Q&A'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                        </div>

                        <div className="font-semibold text-slate-900 text-xs">
                          {card.front}
                        </div>

                        <div className="text-slate-600 text-[11px] leading-relaxed">
                          {card.back}
                        </div>

                        {card.takeaway && (
                          <div className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 inline-block font-medium">
                            💡 {card.takeaway}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 pb-safe border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                >
                  ← Back to Prompt
                </button>

                <button
                  type="button"
                  onClick={handleImportToCollection}
                  disabled={isLoading || selectedCount === 0}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  <span>
                    {destinationMode === 'existing'
                      ? `Add ${selectedCount} Cards to "${selectedDeck?.name || 'Deck'}"`
                      : `Create Deck & Add ${selectedCount} Cards`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
