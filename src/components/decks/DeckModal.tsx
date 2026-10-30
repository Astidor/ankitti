import React, { useState, useEffect } from 'react';
import { X, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
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

const DECK_ICONS = ['🎀', '📚', '🧠', '🫀', '🔬', '💊', '⭐', '💻', '🎨', '🌸', '⚡', '📝'];
const DECK_COLORS = ['#FF4D88', '#A277FF', '#4ECDC4', '#55B382', '#FFB84D', '#FF70A6', '#6C5CE7', '#8D7B68'];

export const DeckModal: React.FC<DeckModalProps> = ({
  isOpen,
  editingDeck,
  onClose,
  onSaveDeck,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<string>('📚');
  const [color, setColor] = useState<string>('#FF4D88');
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
      setColor(editingDeck.color || '#FF4D88');
      setNewCardsPerDay(editingDeck.settings.newCardsPerDay);
      setReviewsPerDay(editingDeck.settings.reviewsPerDay);
      setLearningSteps(editingDeck.settings.learningSteps.join(' '));
      setShowAdvanced(false);
    } else {
      setName('');
      setDescription('');
      setIcon('📚');
      setColor('#FF4D88');
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-cocoa-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF7F2] rounded-t-[28px] sm:rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden border border-[#EFE8DE] ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-white/50 sm:hidden">
          <div className="w-10 h-1 bg-cocoa-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#EFE8DE] select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-strawberry-50 rounded-xl text-strawberry-600 border border-strawberry-100 flex items-center justify-center">
              <KittyBow size={15} />
            </span>
            <div className="text-sm font-extrabold text-[#3E2D28]">
              {editingDeck ? 'Deck Settings' : 'Create New Deck'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-cocoa-50 hover:bg-cocoa-100 text-cocoa-500 hover:text-[#3E2D28] transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-cocoa-800 mb-1.5">Deck Name</label>
            <div className="flex items-center space-x-2">
              <span className="text-2xl p-2 bg-white rounded-xl border border-[#EFE8DE] shrink-0 select-none shadow-2xs">
                {icon}
              </span>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Japanese JLPT N5, Biology 101..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-white focus:outline-none focus:ring-2 focus:ring-strawberry-400/40 focus:border-strawberry-400 font-bold text-[#3E2D28] text-sm shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Icon Selector */}
          <div>
            <label className="block font-bold text-cocoa-800 mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {DECK_ICONS.map(i => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center border transition-all cursor-pointer ${
                    icon === i 
                      ? 'bg-strawberry-50 border-strawberry-300 font-bold shadow-2xs scale-105' 
                      : 'border-[#EFE8DE] hover:bg-white bg-white/70 text-cocoa-700'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color accent */}
          <div>
            <label className="block font-bold text-cocoa-800 mb-1.5">Color Accent</label>
            <div className="flex space-x-2">
              {DECK_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-cocoa-800 scale-110 shadow-xs' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-cocoa-800 mb-1.5">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or notes..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#EFE8DE] bg-white focus:outline-none focus:ring-2 focus:ring-strawberry-400/40 focus:border-strawberry-400 text-xs font-normal text-[#3E2D28] shadow-2xs"
            />
          </div>

          {/* Collapsible Advanced Settings */}
          <div className="border-t border-[#EFE8DE] pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-1.5 px-2 rounded-xl text-cocoa-600 hover:text-[#3E2D28] text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center space-x-1.5">
                <Sliders size={12} className="text-cocoa-500" />
                <span>Advanced daily study limits</span>
              </span>
              {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-white rounded-2xl border border-[#EFE8DE] space-y-2.5 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-cocoa-700 mb-1">New cards / day</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={newCardsPerDay}
                      onChange={(e) => setNewCardsPerDay(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#EFE8DE] bg-[#FAF7F2] text-xs font-bold text-[#3E2D28]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-cocoa-700 mb-1">Max reviews / day</label>
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      value={reviewsPerDay}
                      onChange={(e) => setReviewsPerDay(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#EFE8DE] bg-[#FAF7F2] text-xs font-bold text-[#3E2D28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-cocoa-700 mb-1">Learning intervals (minutes)</label>
                  <input
                    type="text"
                    value={learningSteps}
                    onChange={(e) => setLearningSteps(e.target.value)}
                    placeholder="1 10"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#EFE8DE] bg-[#FAF7F2] text-xs font-mono text-[#3E2D28]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 pb-safe border-t border-[#EFE8DE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-cocoa-600 hover:bg-cocoa-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="squishy-btn px-5 py-2 bg-strawberry-500 hover:bg-strawberry-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-squishy-pink transition-all cursor-pointer"
            >
              {editingDeck ? 'Save Changes' : 'Create Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
