import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Trash2, 
  Sparkles, 
  Camera,
  ZoomIn, 
  Eye, 
  Edit3,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { Card, CardType, Deck, MedicalMeta, CardDraft } from '../../types/anki';
import { storage } from '../../services/storage';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { RichCardContent } from '../common/RichCardContent';

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
  const [front, setFront] = useState<string>('');
  const [back, setBack] = useState<string>('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showExtras, setShowExtras] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
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
      setFront(editingCard.front);
      setBack(editingCard.back);
      setFrontImage(editingCard.frontImage || null);
      setBackImage(editingCard.backImage || null);
      setTags(editingCard.tags?.join(', ') || '');
      const meta = editingCard.medicalMeta || {};
      setHint(meta.clinicalPearl || meta.takeaway || '');
      setMnemonic(meta.mnemonic || '');
      
      // Auto-expand extras if the card already has extra data
      if (meta.clinicalPearl || meta.takeaway || meta.mnemonic || (editingCard.tags && editingCard.tags.length > 0)) {
        setShowExtras(true);
      } else {
        setShowExtras(false);
      }
    } else {
      // Check for saved draft for this deck
      const existingDraft = storage.getDraft(deck.id);
      if (existingDraft && (existingDraft.front.trim() || existingDraft.back.trim() || existingDraft.frontImage || existingDraft.backImage)) {
        setFront(existingDraft.front);
        setBack(existingDraft.back);
        setFrontImage(existingDraft.frontImage || null);
        setBackImage(existingDraft.backImage || null);
        setTags(existingDraft.tags || '');
        const meta = existingDraft.medicalMeta || {};
        setHint(meta.clinicalPearl || meta.takeaway || '');
        setMnemonic(meta.mnemonic || '');
        setShowExtras(Boolean(meta.clinicalPearl || meta.takeaway || meta.mnemonic || existingDraft.tags));
      } else {
        // Fresh blank card
        setFront('');
        setBack('');
        setFrontImage(null);
        setBackImage(null);
        setTags('');
        setHint('');
        setMnemonic('');
        setShowExtras(false);
      }
    }
    setViewMode('edit');
    isInitialMount.current = true;

    // Focus front input after opening
    setTimeout(() => {
      frontInputRef.current?.focus();
    }, 120);
  }, [isOpen, deck.id, editingCard]);

  // Silent draft auto-saving
  useEffect(() => {
    if (!isOpen) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (front.trim() || back.trim() || frontImage || backImage) {
        const isCloze = /\{\{c\d+::/i.test(front);
        const draft: CardDraft = {
          id: editingCard?.id ? `draft_${editingCard.id}` : `draft_${deck.id}`,
          deckId: deck.id,
          cardId: editingCard?.id,
          type: isCloze ? 'cloze' : 'basic',
          front,
          back,
          frontImage,
          backImage,
          tags,
          medicalMeta: {
            highYield: true,
            clinicalPearl: hint,
            takeaway: hint,
            mnemonic,
          },
          lastSavedAt: Date.now(),
        };
        storage.saveDraft(draft);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [front, back, frontImage, backImage, tags, hint, mnemonic, deck.id, editingCard?.id, isOpen]);

  // Cloze deletion helper: wraps selected text in {{c1::selection}}
  const handleInsertCloze = () => {
    const textarea = frontInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = front.substring(start, end) || 'hidden text';

    const existingClozes = (front.match(/\{\{c(\d+)::/g) || []).map(m => parseInt(m.replace(/\D/g, '')));
    const nextNumber = existingClozes.length > 0 ? Math.max(...existingClozes) + 1 : 1;

    const replacement = `{{c${nextNumber}::${selected}}}`;
    const newFront = front.substring(0, start) + replacement + front.substring(end);
    setFront(newFront);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 6, start + 6 + selected.length);
    }, 50);
  };

  const handleClear = () => {
    storage.clearDraft(editingCard?.id ? `draft_${editingCard.id}` : `draft_${deck.id}`);
    setFront('');
    setBack('');
    setFrontImage(null);
    setBackImage(null);
    setHint('');
    setMnemonic('');
    setTags('');
    frontInputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!front.trim()) return;

    const tagList = tags.split(/[, ]+/).map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    const isCloze = /\{\{c\d+::/i.test(front);

    const cardToSave: Card = {
      id: editingCard?.id || `card_${Date.now()}`,
      deckId: deck.id,
      type: isCloze ? 'cloze' : 'basic',
      front: front.trim(),
      back: back.trim(),
      frontImage: frontImage || null,
      backImage: backImage || null,
      tags: tagList.length > 0 ? tagList : [deck.name.slice(0, 15)],
      createdAt: editingCard?.createdAt || Date.now(),
      due: editingCard?.due || Date.now(),
      interval: editingCard?.interval || 0,
      easeFactor: editingCard?.easeFactor || 2.5,
      repetitions: editingCard?.repetitions || 0,
      lapses: editingCard?.lapses || 0,
      state: editingCard?.state || 'new',
      stepIndex: editingCard?.stepIndex || 0,
      medicalMeta: {
        highYield: true,
        clinicalPearl: hint.trim(),
        takeaway: hint.trim(),
        mnemonic: mnemonic.trim(),
      },
      flagged: editingCard?.flagged,
    };

    onSaveCard(cardToSave);
    sounds.playRating(3);

    // Clear draft once card is saved
    storage.clearDraft(editingCard?.id ? `draft_${editingCard.id}` : `draft_${deck.id}`);

    // If adding a new card, keep modal open and reset so user can rapid-fire add next card!
    if (!editingCard) {
      setFront('');
      setBack('');
      setFrontImage(null);
      setBackImage(null);
      setHint('');
      setMnemonic('');
      frontInputRef.current?.focus();
    } else {
      onClose();
    }
  };

  // ⌘+Enter / Ctrl+Enter shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xs animate-fadeIn"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-t-[32px] sm:rounded-[28px] w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-pink-200/90 ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber & Minimal Header */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-white/70">
          <div className="w-10 h-1 bg-pink-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-pink-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-pink-50 rounded-xl border border-pink-200/60 shadow-xs flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div className="flex items-center space-x-1.5 text-xs font-black text-slate-800">
              <span>{editingCard ? 'Edit Card' : 'New Card'}</span>
              <span className="text-pink-400">•</span>
              <span className="text-pink-600 font-extrabold max-w-[180px] sm:max-w-xs truncate">{deck.name}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Minimal Preview Toggle Button */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-pink-500 text-white border-pink-600'
                  : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50 border-pink-200'
              }`}
              title={viewMode === 'preview' ? 'Edit Mode' : 'Preview Card'}
            >
              {viewMode === 'preview' ? <Edit3 size={15} /> : <Eye size={15} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-pink-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {viewMode === 'preview' ? (
            /* Live Flip Preview */
            <div className="space-y-3 py-1">
              <div className="bg-white rounded-2xl border-2 border-pink-200 p-4 shadow-xs space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200/60">
                  Front
                </span>
                <RichCardContent
                  content={front || '*(No question entered)*'}
                  showClozeAnswers={false}
                  className="text-sm sm:text-base text-slate-900 font-semibold"
                />
                {frontImage && (
                  <div className="pt-2 flex justify-center">
                    <img src={frontImage} alt="Front" className="max-h-40 rounded-xl border border-pink-100 object-contain" />
                  </div>
                )}
              </div>

              <div className="bg-[#fffcfd] rounded-2xl border-2 border-rose-300 p-4 shadow-xs space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                  Back
                </span>
                <RichCardContent
                  content={back || (/\{\{c\d+::/i.test(front) ? front : '*(No answer entered)*')}
                  showClozeAnswers={true}
                  className="text-sm sm:text-base text-slate-800 font-medium"
                />
                {backImage && (
                  <div className="pt-2 flex justify-center">
                    <img src={backImage} alt="Back" className="max-h-40 rounded-xl border border-rose-100 object-contain" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Standard Card Editor: Natural Index Card Interface */
            <div className="space-y-3.5">
              
              {/* Card Face 1: FRONT */}
              <div className="rounded-2xl border-2 border-pink-200/90 bg-white p-3.5 shadow-2xs focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-200 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-pink-600">
                    Front
                  </span>
                  
                  {/* Front card micro-actions (Cloze + Camera) */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleInsertCloze}
                      className="px-2 py-0.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 text-[11px] font-bold border border-pink-200 flex items-center space-x-1 cursor-pointer"
                      title="Hide selected text for cloze recall [ ... ]"
                    >
                      <span>[...] Cloze</span>
                    </button>

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
                      className="p-1 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                      title="Attach photo or paste screenshot"
                    >
                      <Camera size={15} />
                    </button>
                  </div>
                </div>

                <textarea
                  ref={frontInputRef}
                  rows={3}
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  onPaste={(e) => handlePasteImage(e, setFrontImage)}
                  placeholder="Question or prompt..."
                  className="w-full bg-transparent focus:outline-none font-medium text-slate-800 text-sm leading-relaxed resize-y placeholder-slate-400"
                />

                {/* Front Image Thumbnail */}
                {frontImage && (
                  <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-pink-200 bg-pink-50/40">
                    <img 
                      src={frontImage} 
                      alt="Front attachment" 
                      onClick={() => setPreviewImage({ src: frontImage, title: 'Front Attachment' })}
                      className="max-h-28 w-auto object-contain cursor-zoom-in" 
                    />
                    <button
                      type="button"
                      onClick={() => setFrontImage(null)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Card Face 2: BACK */}
              <div className="rounded-2xl border-2 border-rose-200/90 bg-white p-3.5 shadow-2xs focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-200 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                    Back
                  </span>

                  {/* Back card micro-action (Camera) */}
                  <div className="flex items-center space-x-1.5">
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
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Attach photo or paste screenshot"
                    >
                      <Camera size={15} />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  onPaste={(e) => handlePasteImage(e, setBackImage)}
                  placeholder="Answer or key details..."
                  className="w-full bg-transparent focus:outline-none font-medium text-slate-800 text-sm leading-relaxed resize-y placeholder-slate-400"
                />

                {/* Back Image Thumbnail */}
                {backImage && (
                  <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-rose-200 bg-rose-50/40">
                    <img 
                      src={backImage} 
                      alt="Back attachment" 
                      onClick={() => setPreviewImage({ src: backImage, title: 'Back Attachment' })}
                      className="max-h-28 w-auto object-contain cursor-zoom-in" 
                    />
                    <button
                      type="button"
                      onClick={() => setBackImage(null)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Progressive Disclosure: Optional Details Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowExtras(!showExtras)}
                  className="w-full py-2 px-3 rounded-xl hover:bg-pink-50/80 text-slate-500 hover:text-pink-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-1.5">
                    <Sparkles size={13} className="text-pink-500" />
                    <span>{showExtras ? 'Hide extra details' : '+ Add hint, mnemonic, or tags'}</span>
                  </span>
                  {showExtras ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showExtras && (
                  <div className="mt-2 p-3 bg-pink-50/60 rounded-2xl border border-pink-200/80 space-y-2.5 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">💡 Hint / Key Takeaway</label>
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => setHint(e.target.value)}
                        placeholder="e.g. Remember to cross-reference with..."
                        className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">🧠 Memory Hook / Mnemonic</label>
                      <input
                        type="text"
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        placeholder="e.g. ROYGBIV for rainbow colors"
                        className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">🏷️ Tags</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g. Chapter 3, Exam 1"
                        className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-white border-t border-pink-100 flex items-center justify-between pb-safe">
          {(front || back || frontImage || backImage) ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!front.trim()}
              className="px-5 py-2.5 rounded-2xl bg-[#ff3366] hover:bg-[#e11d48] disabled:opacity-40 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{editingCard ? 'Save Changes' : 'Add Card 🎀'}</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">⌘↵</kbd>
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox for Image Expansion */}
      {previewImage && (
        <ImageLightboxModal
          isOpen={true}
          src={previewImage.src}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
