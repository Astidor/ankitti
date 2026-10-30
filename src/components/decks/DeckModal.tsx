import React, { useState, useEffect } from 'react';
import { X, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { Deck, DeckSettings } from '../../types/anki';
import { DEFAULT_DECK_SETTINGS } from '../../services/scheduler';
import { sounds } from '../../services/audio';

interface DeckModalProps {
  isOpen: boolean;
  editingDeck?: Deck | null;
  onClose: () => void;
  onSaveDeck: (deck: Deck) => void;
}

const DECK_ICONS = ['📚', '🧠', '🫀', '🔬', '💊', '⭐', '💻', '🎨', '🌎', '⚡', '📝', '🎀'];
const DECK_COLORS = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#64748b'];

export const DeckModal: React.FC<DeckModalProps> = ({
  isOpen,
  editingDeck,
  onClose,
  onSaveDeck,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<string>('📚');
  const [color, setColor] = useState<string>('#f43f5e');
  const [newCardsPerDay, setNewCardsPerDay] = useState<number>(20);
  const [reviewsPerDay, setReviewsPerDay] = useState<number>(150);
  const [learningSteps, setLearningSteps] = useState<string>('1 10');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingDeck) {
      setName(editingDeck.name);
      setDescription(editingDeck.description);
      setIcon(editingDeck.icon || '📚');
      setColor(editingDeck.color || '#f43f5e');
      setNewCardsPerDay(editingDeck.settings.newCardsPerDay);
      setReviewsPerDay(editingDeck.settings.reviewsPerDay);
      setLearningSteps(editingDeck.settings.learningSteps.join(' '));
      setShowAdvanced(false);
    } else {
      setName('');
      setDescription('');
      setIcon('📚');
      setColor('#f43f5e');
      setNewCardsPerDay(20);
      setReviewsPerDay(150);
      setLearningSteps('1 10');
      setShowAdvanced(false);
    }
  }, [isOpen, editingDeck]);

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber & Header */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-slate-50 sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 select-none">
          <div className="text-sm font-bold text-slate-900">
            {editingDeck ? 'Deck Settings' : 'New Deck'}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Deck Name</label>
            <div className="flex items-center space-x-2">
              <span className="text-2xl p-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0 select-none">
                {icon}
              </span>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Spanish Vocabulary, Biology 101..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/50 font-semibold text-slate-900 text-sm shadow-xs"
              />
            </div>
          </div>

          {/* Quick Icon Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {DECK_ICONS.map(i => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
                    icon === i ? 'bg-slate-100 border-slate-400 font-bold shadow-xs' : 'border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color accent */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Color Accent</label>
            <div className="flex space-x-2">
              {DECK_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-xs' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or notes..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-xs font-normal text-slate-900 shadow-xs"
            />
          </div>

          {/* Collapsible Advanced Settings */}
          <div className="border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-1.5 px-2 rounded-lg text-slate-500 hover:text-slate-800 text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center space-x-1.5">
                <Sliders size={12} className="text-slate-400" />
                <span>Advanced daily study limits</span>
              </span>
              {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">New cards / day</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={newCardsPerDay}
                      onChange={(e) => setNewCardsPerDay(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Max reviews / day</label>
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      value={reviewsPerDay}
                      onChange={(e) => setReviewsPerDay(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Learning intervals (minutes)</label>
                  <input
                    type="text"
                    value={learningSteps}
                    onChange={(e) => setLearningSteps(e.target.value)}
                    placeholder="1 10"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 pb-safe border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {editingDeck ? 'Save Changes' : 'Create Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
