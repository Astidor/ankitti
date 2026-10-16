import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Bot, 
  BookOpen, 
  Sliders, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Key, 
  Plus, 
  CheckCircle2,
  Trash2,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Deck, Card, AiDeckResponse, AiDeckCardItem } from '../../types/anki';
import { DEFAULT_DECK_SETTINGS } from '../../services/scheduler';
import { api } from '../../services/api';
import { sounds } from '../../services/audio';
import { KittyBow, AestheticMascot } from '../common/KittyIllustrations';

interface AiDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (deck: Deck, cards: Card[]) => void;
}

const PRESET_TOPICS = [
  { label: '🌸 Japanese JLPT N5 Core Verbs', topic: 'Japanese JLPT N5 essential verbs, polite forms (masu), and example sentences' },
  { label: '🩺 Pharmacology: Antibiotics', topic: 'High-yield antibiotics mechanisms, bacterial coverage, and classic side effects' },
  { label: '💻 React 19 & Next.js Core Concepts', topic: 'Modern React server components, hooks, concurrent rendering, and performance' },
  { label: '🧠 Neuroscience & Brain Anatomy', topic: 'Brain lobes, cranial nerves, functions, and clinical lesions' },
  { label: '⚖️ Constitutional Law Amendments', topic: 'US Constitutional Amendments 1 to 14, historic court cases, and key rights' },
];

export const AiDeckModal: React.FC<AiDeckModalProps> = ({
  isOpen,
  onClose,
  onDeckCreated,
}) => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [cardCount, setCardCount] = useState<number>(6);
  const [style, setStyle] = useState<'mixed' | 'basic' | 'cloze'>('mixed');
  const [customKey, setCustomKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<AiDeckResponse | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedResult(null);

    try {
      const result = await api.generateAiDeck({
        topic: topic.trim(),
        cardCount,
        notes: notes.trim(),
        style,
        apiKey: customKey.trim() || undefined,
      });

      setGeneratedResult(result);
      // Select all cards by default
      const initialSelected: Record<number, boolean> = {};
      result.cards.forEach((_, idx) => {
        initialSelected[idx] = true;
      });
      setSelectedIndices(initialSelected);
      sounds.playRating(4);
    } catch (err: unknown) {
      sounds.playRating(1);
      const msg = err instanceof Error ? err.message : 'AI Generation failed';
      if (msg === 'KEY_MISSING') {
        setShowKeyInput(true);
        setErrorMessage('DeepSeek API Key is needed. You can set DEEPSEEK_API_KEY in .env, or enter it below!');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportToCollection = async () => {
    if (!generatedResult) return;

    setIsLoading(true);
    try {
      const now = Date.now();
      const deckId = `deck_ai_${now}`;

      // 1. Create Deck
      const newDeck: Deck = {
        id: deckId,
        name: generatedResult.deck.name,
        description: generatedResult.deck.description,
        icon: generatedResult.deck.icon || '🤖',
        color: generatedResult.deck.color || '#ff4d88',
        settings: {
          ...DEFAULT_DECK_SETTINGS,
          newCardsPerDay: 20,
          reviewsPerDay: 100,
        },
        createdAt: now,
        updatedAt: now,
      };

      await api.createDeck(newDeck);

      // 2. Create Selected Cards
      const createdCards: Card[] = [];
      const cardsToCreate = generatedResult.cards.filter((_, idx) => selectedIndices[idx] !== false);

      for (let i = 0; i < cardsToCreate.length; i++) {
        const item = cardsToCreate[i];
        const card: Card = {
          id: `card_ai_${i}_${now}`,
          deckId,
          type: item.type,
          front: item.front,
          back: item.back,
          tags: item.tags || ['DeepSeek-AI'],
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
          },
        };

        const saved = await api.createCard(card);
        createdCards.push(saved);
      }

      sounds.playRating(4);
      onDeckCreated(newDeck, createdCards);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs sm:backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-[32px] w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl overflow-hidden border-t sm:border border-pink-200/80 flex flex-col ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber */}
        <div className="pt-2.5 pb-1 flex justify-center bg-white/70">
          <div className="w-10 h-1 bg-pink-200 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-3.5 flex items-center justify-between border-b border-pink-100 bg-white/80">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-linear-to-tr from-pink-100 to-rose-50 rounded-2xl border border-pink-200/80 shadow-xs flex items-center justify-center text-pink-600">
              <Bot size={20} />
            </span>
            <div>
              <div className="text-sm font-black text-kitty-dark tracking-tight flex items-center space-x-1.5">
                <span>AI Deck Architect</span>
                <KittyBow size={16} />
              </div>
              <div className="text-[10px] text-kitty-subtle">Instant flashcards with mnemonics & clozes via Ankitti AI</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-100/70 hover:bg-pink-200/70 text-kitty-subtle hover:text-kitty-dark flex items-center justify-center transition-colors ios-btn"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-bold">Generation Notice</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {!generatedResult && (
            <form onSubmit={handleGenerate} className="space-y-4">
              
              {/* Presets */}
              <div>
                <label className="block font-bold text-kitty-dark mb-1.5 text-[11px] flex items-center justify-between">
                  <span>✨ Quick Inspiration Topics</span>
                  <span className="text-[10px] text-kitty-subtle font-normal">Click to fill</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setTopic(p.topic)}
                      className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100/80 text-pink-700 border border-pink-200/80 text-[11px] font-semibold transition-all ios-btn"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div className="space-y-1">
                <label className="block font-bold text-kitty-dark text-xs">
                  Target Topic / Syllabus Concept <span className="text-pink-500 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Japanese JLPT N5 Essential Verbs, or Cardiology Myocardial Infarction..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-pink-200 text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs font-medium"
                />
              </div>

              {/* Source Notes Paste Area */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-kitty-dark text-xs">
                    Paste Lecture Notes, Textbook Excerpt, or Summary (Optional)
                  </label>
                  <span className="text-[10px] text-kitty-subtle">AI extracts the highest-yield cards</span>
                </div>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste your raw notes, study guides, or syllabus here. The AI architect will distill them into optimal spaced repetition cards with clozes and mnemonics..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-pink-200 text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs resize-y"
                />
              </div>

              {/* Generation Controls: Card count & Card Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-pink-50/50 p-4 rounded-2xl border border-pink-200/70">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-kitty-dark text-[11px]">
                      Cards to Generate: <strong className="text-pink-600">{cardCount}</strong>
                    </label>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={cardCount}
                    onChange={(e) => setCardCount(parseInt(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-kitty-subtle mt-0.5">
                    <span>3 Quick</span>
                    <span>8 Standard</span>
                    <span>15 Deep</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-kitty-dark text-[11px] block mb-1.5">
                    Flashcard Style
                  </label>
                  <div className="inline-flex p-1 bg-white rounded-xl border border-pink-200 shadow-xs w-full">
                    <button
                      type="button"
                      onClick={() => setStyle('mixed')}
                      className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        style === 'mixed' ? 'bg-pink-500 text-white' : 'text-kitty-subtle hover:text-kitty-dark'
                      }`}
                    >
                      Mixed
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('basic')}
                      className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        style === 'basic' ? 'bg-pink-500 text-white' : 'text-kitty-subtle hover:text-kitty-dark'
                      }`}
                    >
                      Q&A
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('cloze')}
                      className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        style === 'cloze' ? 'bg-pink-500 text-white' : 'text-kitty-subtle hover:text-kitty-dark'
                      }`}
                    >
                      Cloze
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Custom API Key accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Key size={13} />
                  <span>{showKeyInput ? 'Hide API Key' : 'Configure API Key (or use .env)'}</span>
                </button>

                {showKeyInput && (
                  <div className="mt-2 p-3 bg-pink-50/70 rounded-2xl border border-pink-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-kitty-dark">AI Service API Key:</span>
                      <span className="text-[10px] text-kitty-subtle">Stored in your local session</span>
                    </div>
                    <input
                      type="password"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-xs font-mono focus:ring-2 focus:ring-pink-400 focus:outline-none"
                    />
                    <div className="text-[10px] text-kitty-subtle leading-relaxed">
                      💡 Tip: You can also place <code>DEEPSEEK_API_KEY=your_key</code> inside <code>.env</code> in the project directory.
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 pb-safe">
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="w-full py-3.5 rounded-2xl bg-[#FF4D80] hover:bg-[#F43F5E] text-white font-extrabold text-xs shadow-md shadow-pink-200 hover:shadow-lg transition-all flex items-center justify-center space-x-2 ios-btn cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Architecting your flashcards with AI... 🎀</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate Deck with AI 🪄</span>
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
              <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl p-2 bg-white rounded-2xl shadow-xs border border-pink-200">
                    {generatedResult.deck.icon || '🤖'}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">
                      {generatedResult.deck.name}
                    </h3>
                    <p className="text-[11px] text-kitty-subtle mt-0.5">
                      {generatedResult.deck.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-pink-600 bg-white px-3 py-1 rounded-full border border-pink-200 shadow-xs">
                    {Object.values(selectedIndices).filter(Boolean).length} / {generatedResult.cards.length} Cards
                  </span>
                </div>
              </div>

              {/* Cards List Preview */}
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {generatedResult.cards.map((card, idx) => {
                  const isSelected = selectedIndices[idx] !== false;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelect(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start space-x-3 ${
                        isSelected 
                          ? 'bg-white border-pink-300 shadow-xs ring-1 ring-pink-200' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="rounded text-pink-600 focus:ring-pink-400 mt-1 accent-pink-500 w-4 h-4 cursor-pointer"
                      />

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                            {card.type === 'cloze' ? 'Cloze Deletion' : 'Basic Q&A'}
                          </span>
                          <span className="text-[10px] text-kitty-subtle font-mono">Card {idx + 1}</span>
                        </div>

                        <div className="font-extrabold text-kitty-dark text-xs">
                          {card.front}
                        </div>

                        <div className="text-kitty-subtle text-[11px] leading-relaxed">
                          {card.back}
                        </div>

                        {card.takeaway && (
                          <div className="text-[10px] text-pink-700 bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-100 inline-block font-medium">
                            💡 {card.takeaway}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 pb-safe border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="px-4 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-kitty-dark font-bold text-xs transition-colors ios-btn"
                >
                  ← Back to Prompt
                </button>

                <button
                  type="button"
                  onClick={handleImportToCollection}
                  disabled={isLoading || Object.values(selectedIndices).filter(Boolean).length === 0}
                  className="flex-1 py-2.5 rounded-2xl bg-[#FF4D80] hover:bg-[#F43F5E] text-white font-extrabold text-xs shadow-md shadow-pink-200 hover:shadow-lg transition-all flex items-center justify-center space-x-2 ios-btn cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  <span>
                    Add Deck to Collection ({Object.values(selectedIndices).filter(Boolean).length} Cards) 🎀
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
