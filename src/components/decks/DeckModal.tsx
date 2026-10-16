import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Palette, Sliders, Save, Sparkles } from 'lucide-react';
import { Deck, DeckSettings } from '../../types/anki';
import { DEFAULT_DECK_SETTINGS } from '../../services/scheduler';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';

interface DeckModalProps {
  isOpen: boolean;
  editingDeck?: Deck | null;
  onClose: () => void;
  onSaveDeck: (deck: Deck) => void;
}

const DECK_ICONS = ['🫀', '💊', '🧠', '🫁', '🦴', '🩸', '🧬', '🔬', '🩺', '👶', '🎀', '⭐'];
const DECK_COLORS = ['#ff4d88', '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export const DeckModal: React.FC<DeckModalProps> = ({
  isOpen,
  editingDeck,
  onClose,
  onSaveDeck,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<string>('🫀');
  const [color, setColor] = useState<string>('#ff4d88');
  const [newCardsPerDay, setNewCardsPerDay] = useState<number>(20);
  const [reviewsPerDay, setReviewsPerDay] = useState<number>(150);
  const [learningSteps, setLearningSteps] = useState<string>('1 10');

  useEffect(() => {
    if (!isOpen) return;

    if (editingDeck) {
      setName(editingDeck.name);
      setDescription(editingDeck.description);
      setIcon(editingDeck.icon || '🫀');
      setColor(editingDeck.color || '#ff4d88');
      setNewCardsPerDay(editingDeck.settings.newCardsPerDay);
      setReviewsPerDay(editingDeck.settings.reviewsPerDay);
      setLearningSteps(editingDeck.settings.learningSteps.join(' '));
    } else {
      // Check if draft deck name in storage
      const draft = localStorage.getItem('ankitti_draft_deck');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setName(parsed.name || '');
          setDescription(parsed.description || '');
          setIcon(parsed.icon || '🫀');
          setColor(parsed.color || '#ff4d88');
        } catch {}
      } else {
        setName('');
        setDescription('');
        setIcon('🫀');
        setColor('#ff4d88');
        setNewCardsPerDay(20);
        setReviewsPerDay(150);
        setLearningSteps('1 10');
      }
    }
  }, [isOpen, editingDeck]);

  // Auto-save draft deck for newly created decks
  useEffect(() => {
    if (!isOpen || editingDeck) return;
    if (name || description) {
      localStorage.setItem('ankitti_draft_deck', JSON.stringify({ name, description, icon, color }));
    }
  }, [name, description, icon, color, isOpen, editingDeck]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedSteps = learningSteps
      .split(/\s+/)
      .map(s => parseFloat(s))
      .filter(s => !isNaN(s) && s > 0);

    const settings: DeckSettings = {
      ...DEFAULT_DECK_SETTINGS,
      newCardsPerDay,
      reviewsPerDay,
      learningSteps: parsedSteps.length > 0 ? parsedSteps : [1, 10],
    };

    const deckToSave: Deck = {
      id: editingDeck?.id || `deck_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      settings,
      createdAt: editingDeck?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSaveDeck(deckToSave);
    sounds.playRating(3);
    localStorage.removeItem('ankitti_draft_deck');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden border border-pink-200/80 ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber & Header */}
        <div className="pt-2.5 pb-1 px-4 flex justify-center bg-white/70">
          <div className="w-10 h-1 bg-pink-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-white/80 border-b border-pink-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-pink-50 rounded-xl border border-pink-200/60 shadow-xs flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-xs font-black text-kitty-dark tracking-tight">
                {editingDeck ? 'Deck Settings' : 'Create New Deck'}
              </div>
              <div className="text-[10px] text-kitty-subtle">Customize theme & daily spaced intervals</div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-kitty-dark mb-1.5">Deck Title</label>
            <div className="flex items-center space-x-2">
              <span className="text-2xl p-2.5 bg-pink-50 rounded-2xl border border-pink-200/80 shadow-xs">{icon}</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Japanese Core Vocabulary"
                className="flex-1 px-4 py-2.5 rounded-2xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-bold text-sm shadow-xs"
              />
            </div>
          </div>

          {/* Quick Icon Selector */}
          <div>
            <label className="block font-semibold text-kitty-subtle mb-1.5 text-[11px]">Select Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {DECK_ICONS.map(i => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border transition-all ios-btn ${
                    icon === i ? 'bg-pink-100 border-pink-400 scale-105 shadow-xs font-bold' : 'border-pink-100 hover:bg-pink-50 bg-white'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color accent */}
          <div>
            <label className="block font-semibold text-kitty-subtle mb-1.5 text-[11px]">Deck Accent Color</label>
            <div className="flex space-x-2.5">
              {DECK_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ios-btn ${
                    color === c ? 'ring-2 ring-offset-2 ring-pink-500 scale-110 shadow-xs' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-kitty-dark mb-1">Description / Subtitle</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of topics, modules, or goals covered..."
              className="w-full px-4 py-2.5 rounded-2xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none text-xs shadow-xs"
            />
          </div>

          {/* Daily Study Options */}
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200/70 space-y-3">
            <span className="font-extrabold text-kitty-dark block text-xs flex items-center space-x-1.5">
              <Sliders size={13} className="text-pink-600" />
              <span>Anki Daily Spaced Repetition Parameters</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-kitty-dark mb-1">
                  New cards / day
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={newCardsPerDay}
                  onChange={(e) => setNewCardsPerDay(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs font-mono font-bold shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-kitty-dark mb-1">
                  Max reviews / day
                </label>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={reviewsPerDay}
                  onChange={(e) => setReviewsPerDay(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs font-mono font-bold shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-kitty-dark mb-1">
                Learning steps (minutes, space-separated)
              </label>
              <input
                type="text"
                value={learningSteps}
                onChange={(e) => setLearningSteps(e.target.value)}
                placeholder="1 10"
                className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs font-mono shadow-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-3 pb-safe border-t border-pink-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-kitty-dark hover:bg-pink-100/70 transition-colors font-bold ios-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#FF4D80] hover:bg-[#F43F5E] text-white font-extrabold shadow-md shadow-pink-300/50 hover:shadow-lg transition-all flex items-center space-x-2 ios-btn cursor-pointer"
            >
              <Save size={14} />
              <span>{editingDeck ? 'Save Changes' : 'Create Deck 🎀'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
