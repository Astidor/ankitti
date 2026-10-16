import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Sparkles, 
  Check, 
  Clock, 
  Tag, 
  BookOpen, 
  Lightbulb, 
  FileText,
  AlertCircle,
  Image as ImageIcon,
  Paperclip,
  ZoomIn
} from 'lucide-react';
import { Card, CardType, Deck, MedicalMeta, CardDraft } from '../../types/anki';
import { storage } from '../../services/storage';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';
import { ImageLightboxModal } from '../common/ImageLightboxModal';

interface CardEditorModalProps {
  isOpen: boolean;
  deck: Deck;
  editingCard?: Card | null;
  onClose: () => void;
  onSaveCard: (card: Card) => void;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  deck,
  editingCard,
  onClose,
  onSaveCard,
}) => {
  const [type, setType] = useState<CardType>('basic');
  const [front, setFront] = useState<string>('');
  const [back, setBack] = useState<string>('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string>('High-Yield');
  const [medicalMeta, setMedicalMeta] = useState<MedicalMeta>({
    highYield: true,
    system: 'Cardiovascular',
    difficulty: 'Normal',
    clinicalPearl: '',
    mnemonic: '',
    firstAidRef: '',
  });

  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [draftRestoredNotice, setDraftRestoredNotice] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);
  const frontInputRef = useRef<HTMLTextAreaElement>(null);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  const handleImageFile = (file: File, callback: (base64: string) => void) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
        sounds.playClick();
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = (e: React.ClipboardEvent, callback: (base64: string) => void) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleImageFile(file, callback);
          break;
        }
      }
    }
  };

  // Load existing card or restore auto-saved draft
  useEffect(() => {
    if (!isOpen) return;

    if (editingCard) {
      setType(editingCard.type);
      setFront(editingCard.front);
      setBack(editingCard.back);
      setFrontImage(editingCard.frontImage || null);
      setBackImage(editingCard.backImage || null);
      setTags(editingCard.tags.join(', '));
      setMedicalMeta(editingCard.medicalMeta || { highYield: true });
      setDraftRestoredNotice(false);
    } else {
      // Check for saved draft for this deck
      const existingDraft = storage.getDraft(deck.id);
      if (existingDraft && (existingDraft.front.trim() || existingDraft.back.trim() || existingDraft.frontImage || existingDraft.backImage)) {
        setType(existingDraft.type);
        setFront(existingDraft.front);
        setBack(existingDraft.back);
        setFrontImage(existingDraft.frontImage || null);
        setBackImage(existingDraft.backImage || null);
        setTags(existingDraft.tags);
        setMedicalMeta(existingDraft.medicalMeta);
        setLastSavedTime(new Date(existingDraft.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setDraftRestoredNotice(true);
      } else {
        // Fresh card default
        setType('basic');
        setFront('');
        setBack('');
        setFrontImage(null);
        setBackImage(null);
        setTags('High-Yield');
        setMedicalMeta({
          highYield: true,
          system: deck.name.replace(/^[^\w]+/, '').trim() || 'General',
          difficulty: 'Normal',
        });
        setDraftRestoredNotice(false);
      }
    }
    isInitialMount.current = true;
  }, [isOpen, deck.id, deck.name, editingCard]);

  // AUTO-SAVE / DRAFT PERSISTENCE (Runs on every keystroke after 350ms debounce)
  useEffect(() => {
    if (!isOpen) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only save if there is some content
    const timer = setTimeout(() => {
      if (front.trim() || back.trim() || frontImage || backImage) {
        const draft: CardDraft = {
          id: editingCard?.id ? `draft_${editingCard.id}` : `draft_${deck.id}`,
          deckId: deck.id,
          cardId: editingCard?.id,
          type,
          front,
          back,
          frontImage,
          backImage,
          tags,
          medicalMeta,
          lastSavedAt: Date.now(),
        };
        storage.saveDraft(draft);
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [front, back, frontImage, backImage, tags, type, medicalMeta, deck.id, editingCard?.id, isOpen]);

  // Cloze deletion helper: wraps selected text in {{c1::selection}}
  const handleInsertCloze = () => {
    const textarea = frontInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = front.substring(start, end) || 'hidden text';

    // Count existing clozes to auto-increment
    const existingClozes = (front.match(/\{\{c(\d+)::/g) || []).map(m => parseInt(m.replace(/\D/g, '')));
    const nextNumber = existingClozes.length > 0 ? Math.max(...existingClozes) + 1 : 1;

    const replacement = `{{c${nextNumber}::${selected}}}`;
    const newFront = front.substring(0, start) + replacement + front.substring(end);
    setFront(newFront);
    setType('cloze');

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 6, start + 6 + selected.length);
    }, 50);
  };

  const handleClearDraft = () => {
    if (confirm('Discard this draft and start a blank card?')) {
      storage.clearDraft(editingCard?.id ? `draft_${editingCard.id}` : `draft_${deck.id}`);
      setFront('');
      setBack('');
      setFrontImage(null);
      setBackImage(null);
      setLastSavedTime(null);
      setDraftRestoredNotice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim()) return;

    const tagList = tags.split(/[, ]+/).map(t => t.trim().replace(/^#/, '')).filter(Boolean);

    const cardToSave: Card = {
      id: editingCard?.id || `card_${Date.now()}`,
      deckId: deck.id,
      type,
      front: front.trim(),
      back: back.trim(),
      frontImage: frontImage || null,
      backImage: backImage || null,
      tags: tagList.length > 0 ? tagList : ['High-Yield'],
      createdAt: editingCard?.createdAt || Date.now(),
      due: editingCard?.due || Date.now(),
      interval: editingCard?.interval || 0,
      easeFactor: editingCard?.easeFactor || 2.5,
      repetitions: editingCard?.repetitions || 0,
      lapses: editingCard?.lapses || 0,
      state: editingCard?.state || 'new',
      stepIndex: editingCard?.stepIndex || 0,
      medicalMeta,
      flagged: editingCard?.flagged,
    };

    onSaveCard(cardToSave);
    sounds.playRating(3);

    // Clear saved draft once card is committed
    storage.clearDraft(editingCard?.id ? `draft_${editingCard.id}` : `draft_${deck.id}`);

    // If adding new card, reset form so student can add next card rapid-fire!
    if (!editingCard) {
      setFront('');
      setBack('');
      setFrontImage(null);
      setBackImage(null);
      setLastSavedTime(null);
      setDraftRestoredNotice(false);
      frontInputRef.current?.focus();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-[28px] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-pink-200/80">
        
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
              <div className="text-xs font-black text-kitty-dark tracking-tight flex items-center space-x-1.5">
                <span>{editingCard ? 'Edit Flashcard' : 'Add Flashcard'}</span>
                <span className="text-pink-400">•</span>
                <span className="text-pink-600 font-extrabold max-w-[180px] sm:max-w-xs truncate">{deck.name}</span>
              </div>
              <div className="text-[10px] text-kitty-subtle">SM-2 Spaced Repetition Engine</div>
            </div>
          </div>

          {/* Auto-Save Status Badge & Close button */}
          <div className="flex items-center space-x-2">
            {lastSavedTime && (
              <span className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] font-semibold text-kitty-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                <span>Auto-saved at {lastSavedTime} 🎀</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-pink-100/70 hover:bg-pink-200/70 text-kitty-subtle hover:text-kitty-dark flex items-center justify-center transition-colors ios-btn"
              title="Close (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Draft Restored Banner */}
        {draftRestoredNotice && (
          <div className="bg-amber-50/90 px-4 py-2 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0" />
              <span>Restored your unfinished draft from previous session.</span>
            </div>
            <button
              onClick={handleClearDraft}
              className="text-[11px] font-bold text-amber-700 hover:text-rose-600 underline ml-2 cursor-pointer"
            >
              Discard Draft
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Card Type iOS Segmented Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="inline-flex p-1 bg-pink-100/60 rounded-2xl border border-pink-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => setType('basic')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs ios-btn ${
                  type === 'basic' 
                    ? 'bg-white text-pink-600 shadow-sm' 
                    : 'text-kitty-subtle hover:text-kitty-dark'
                }`}
              >
                📝 Basic Q&A
              </button>
              <button
                type="button"
                onClick={() => setType('cloze')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs ios-btn ${
                  type === 'cloze' 
                    ? 'bg-white text-pink-600 shadow-sm' 
                    : 'text-kitty-subtle hover:text-kitty-dark'
                }`}
              >
                [ ... ] Cloze
              </button>
              <button
                type="button"
                onClick={() => setType('concept')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs ios-btn ${
                  type === 'concept' 
                    ? 'bg-white text-pink-600 shadow-sm' 
                    : 'text-kitty-subtle hover:text-kitty-dark'
                }`}
              >
                💡 Concept
              </button>
            </div>

            {/* Quick Cloze insertion button */}
            <button
              type="button"
              onClick={handleInsertCloze}
              className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold border border-pink-200 flex items-center justify-center space-x-1.5 ios-btn"
              title="Wrap selected text in {{c1::...}}"
            >
              <span>+ Insert Cloze Deletion</span>
              <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded-md border border-pink-200 font-mono">⌘⇧C</kbd>
            </button>
          </div>

          {/* Front / Question */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-kitty-dark text-xs flex items-center space-x-1">
                <span>{type === 'cloze' ? 'Card Text with Cloze {{c1::answer}}' : 'Front (Question / Prompt / Concept)'}</span>
                <span className="text-pink-500 font-extrabold">*</span>
              </label>
              <span className="text-[10px] text-kitty-subtle bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100 font-medium">Markdown Supported</span>
            </div>
            <textarea
              ref={frontInputRef}
              rows={4}
              required
              value={front}
              onChange={(e) => setFront(e.target.value)}
              onPaste={(e) => handlePasteImage(e, setFrontImage)}
              placeholder={
                type === 'cloze'
                  ? 'e.g. The capital of Japan is {{c1::Tokyo}}.'
                  : 'e.g. What is the mechanism of action of beta-lactam antibiotics?'
              }
              className="w-full px-4 py-3 rounded-2xl border border-pink-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-pink-400 font-sans text-xs leading-relaxed resize-y shadow-xs"
            />

            {/* Front Screenshot / Attachment Controls */}
            <div className="flex items-center justify-between pt-1">
              <input
                type="file"
                ref={frontFileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageFile(e.target.files[0], setFrontImage);
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => frontFileInputRef.current?.click()}
                className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200/70 ios-btn cursor-pointer"
              >
                <ImageIcon size={13} />
                <span>{frontImage ? 'Change Front Screenshot' : '📷 Attach Front Screenshot / Diagram'}</span>
              </button>
              <span className="text-[10px] text-kitty-subtle">Tip: Paste screenshot (Ctrl+V) directly</span>
            </div>

            {frontImage && (
              <div 
                className="relative inline-block mt-2 rounded-2xl overflow-hidden border-2 border-pink-300 shadow-sm max-w-xs group bg-pink-50/40 cursor-zoom-in"
                onClick={() => setPreviewImage({ src: frontImage, title: 'Front Attachment Preview' })}
                title="Click to expand"
              >
                <img src={frontImage} alt="Front Attachment" className="max-h-36 w-auto object-contain transition-transform group-hover:scale-102" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 text-slate-800 text-[10px] font-bold shadow-xs flex items-center space-x-1">
                    <ZoomIn size={11} />
                    <span>Expand</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFrontImage(null);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors shadow-sm cursor-pointer z-10"
                  title="Remove Image"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Back / Explanation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-kitty-dark text-xs">
                {type === 'cloze' ? 'Extra Notes / Context (revealed on flip)' : 'Back (Answer / Explanation / Key Details)'}
              </label>
            </div>
            <textarea
              rows={4}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              onPaste={(e) => handlePasteImage(e, setBackImage)}
              placeholder="e.g. Inhibit penicillin-binding proteins (PBPs), halting peptidoglycan cell wall cross-linking..."
              className="w-full px-4 py-3 rounded-2xl border border-pink-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-pink-400 font-sans text-xs leading-relaxed resize-y shadow-xs"
            />

            {/* Back Screenshot / Attachment Controls */}
            <div className="flex items-center justify-between pt-1">
              <input
                type="file"
                ref={backFileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageFile(e.target.files[0], setBackImage);
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backFileInputRef.current?.click()}
                className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200/70 ios-btn cursor-pointer"
              >
                <ImageIcon size={13} />
                <span>{backImage ? 'Change Back Screenshot' : '📷 Attach Back Screenshot / Diagram'}</span>
              </button>
              <span className="text-[10px] text-kitty-subtle">Tip: Paste screenshot (Ctrl+V) directly</span>
            </div>

            {backImage && (
              <div 
                className="relative inline-block mt-2 rounded-2xl overflow-hidden border-2 border-pink-300 shadow-sm max-w-xs group bg-pink-50/40 cursor-zoom-in"
                onClick={() => setPreviewImage({ src: backImage, title: 'Back Attachment Preview' })}
                title="Click to expand"
              >
                <img src={backImage} alt="Back Attachment" className="max-h-36 w-auto object-contain transition-transform group-hover:scale-102" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 text-slate-800 text-[10px] font-bold shadow-xs flex items-center space-x-1">
                    <ZoomIn size={11} />
                    <span>Expand</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBackImage(null);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors shadow-sm cursor-pointer z-10"
                  title="Remove Image"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Universal Learning Accelerators Section */}
          <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-kitty-dark text-xs flex items-center space-x-1.5">
                <Sparkles size={14} className="text-pink-600" />
                <span>Memory Hooks & Metadata</span>
              </span>

              {/* Key Concept Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={medicalMeta.highYield ?? true}
                  onChange={(e) => setMedicalMeta(prev => ({ ...prev, highYield: e.target.checked }))}
                  className="rounded text-pink-600 focus:ring-pink-400 accent-pink-500 w-3.5 h-3.5"
                />
                <span className="font-bold text-xs text-pink-700">⭐ Key Concept</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-kitty-dark mb-1">
                  💡 Key Takeaway / Pearl
                </label>
                <input
                  type="text"
                  value={medicalMeta.takeaway || medicalMeta.clinicalPearl || ''}
                  onChange={(e) => setMedicalMeta(prev => ({ ...prev, takeaway: e.target.value, clinicalPearl: e.target.value }))}
                  placeholder="e.g. Bactericidal; resistance via beta-lactamases"
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-kitty-dark mb-1">
                  🧠 Mnemonic / Memory Hook
                </label>
                <input
                  type="text"
                  value={medicalMeta.mnemonic || ''}
                  onChange={(e) => setMedicalMeta(prev => ({ ...prev, mnemonic: e.target.value }))}
                  placeholder="e.g. Penicillin prevents peptidoglycan!"
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-kitty-dark mb-1">
                  📖 Textbook / Lecture Reference
                </label>
                <input
                  type="text"
                  value={medicalMeta.reference || medicalMeta.firstAidRef || ''}
                  onChange={(e) => setMedicalMeta(prev => ({ ...prev, reference: e.target.value, firstAidRef: e.target.value }))}
                  placeholder="e.g. Robbins Pathology p. 124, First Aid 2024"
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-kitty-dark mb-1">
                  🏷️ Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Pharmacology, Antibiotics, High-Yield"
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 flex items-center justify-between border-t border-pink-100">
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-xs text-kitty-subtle hover:text-rose-600 flex items-center space-x-1.5 py-2 px-2.5 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={13} />
              <span>Discard Draft</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-kitty-dark hover:bg-pink-100/70 transition-colors font-bold text-xs ios-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-[#FF4D80] hover:bg-[#F43F5E] text-white font-extrabold shadow-md shadow-pink-300/50 hover:shadow-lg transition-all text-xs flex items-center space-x-2 ios-btn cursor-pointer"
              >
                <Save size={14} />
                <span>{editingCard ? 'Update Flashcard' : 'Add Flashcard 🎀'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <ImageLightboxModal
        isOpen={!!previewImage}
        src={previewImage?.src || null}
        title={previewImage?.title || 'Screenshot Preview'}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};
