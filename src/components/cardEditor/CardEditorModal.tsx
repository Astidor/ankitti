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
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Highlighter,
  List
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
  const [activeField, setActiveField] = useState<'front' | 'back'>('front');
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  const frontInputRef = useRef<HTMLTextAreaElement>(null);
  const backInputRef = useRef<HTMLTextAreaElement>(null);
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
      
      if (meta.clinicalPearl || meta.takeaway || meta.mnemonic || (editingCard.tags && editingCard.tags.length > 0)) {
        setShowExtras(true);
      } else {
        setShowExtras(false);
      }
    } else {
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
    setActiveField('front');
    isInitialMount.current = true;

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

  // Formatting Bar Engine: Inserts or wraps formatting around active textarea selection
  const applyFormat = (type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'cloze' | 'code' | 'highlight' | 'link' | 'bullet') => {
    sounds.playClick();
    const isFront = activeField === 'front';
    const textarea = isFront ? frontInputRef.current : backInputRef.current;
    const value = isFront ? front : back;
    const setValue = isFront ? setFront : setBack;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    let prefix = '';
    let suffix = '';
    let defaultPlaceholder = '';

    switch (type) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        defaultPlaceholder = 'bold text';
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        defaultPlaceholder = 'italic text';
        break;
      case 'underline':
        prefix = '<u>';
        suffix = '</u>';
        defaultPlaceholder = 'underlined text';
        break;
      case 'strikethrough':
        prefix = '~~';
        suffix = '~~';
        defaultPlaceholder = 'strikethrough';
        break;
      case 'code':
        prefix = '`';
        suffix = '`';
        defaultPlaceholder = 'code';
        break;
      case 'highlight':
        prefix = '==';
        suffix = '==';
        defaultPlaceholder = 'highlighted text';
        break;
      case 'link':
        prefix = '[';
        suffix = '](https://)';
        defaultPlaceholder = 'link text';
        break;
      case 'bullet':
        prefix = '\n• ';
        suffix = '';
        defaultPlaceholder = 'list item';
        break;
      case 'cloze': {
        const fullContent = front;
        const existingClozes = (fullContent.match(/\{\{c(\d+)::/g) || []).map(m => parseInt(m.replace(/\D/g, '')));
        const nextNum = existingClozes.length > 0 ? Math.max(...existingClozes) + 1 : 1;
        prefix = `{{c${nextNum}::`;
        suffix = '}}';
        defaultPlaceholder = 'hidden text';
        break;
      }
    }

    const insertText = selected || defaultPlaceholder;
    const replacement = prefix + insertText + suffix;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    setValue(newValue);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultPlaceholder.length);
      }
    }, 40);
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
    const hasContent = Boolean(front.trim() || frontImage || back.trim() || backImage);
    if (!hasContent) return;

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
    storage.clearDraft(editingCard?.id ? `draft_${editingCard.id}` : `draft_${deck.id}`);

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

  // Standard Anki keyboard shortcuts: Ctrl/Cmd + B, I, U, Shift+C (Cloze), Enter (Save)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMeta = e.metaKey || e.ctrlKey;

    if (isMeta && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (isMeta && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      applyFormat('cloze');
      return;
    }

    if (isMeta && !e.shiftKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        applyFormat('bold');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        applyFormat('italic');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        applyFormat('underline');
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        applyFormat('link');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-2xl w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber & Minimal Header */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-slate-50 sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-rose-50 rounded-lg text-rose-500 flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
              <span>{editingCard ? 'Edit Card' : 'New Card'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-600 font-semibold max-w-[180px] sm:max-w-xs truncate">{deck.name}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Minimal Preview Toggle Button */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
              }`}
              title={viewMode === 'preview' ? 'Edit Mode' : 'Preview Card'}
            >
              {viewMode === 'preview' ? <Edit3 size={15} /> : <Eye size={15} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Anki-Style Formatting Bar Ribbon (When in Edit Mode) */}
        {viewMode === 'edit' && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto select-none no-scrollbar">
            
            {/* Formatting Tools */}
            <div className="flex items-center space-x-0.5">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('bold')}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Bold (Ctrl+B)"
              >
                <Bold size={15} />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('italic')}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Italic (Ctrl+I)"
              >
                <Italic size={15} />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('underline')}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Underline (Ctrl+U)"
              >
                <Underline size={15} />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('strikethrough')}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Strikethrough"
              >
                <Strikethrough size={15} />
              </button>

              <div className="h-4 w-[1px] bg-slate-200 mx-1" />

              {/* Cloze Deletion Button */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('cloze')}
                className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center space-x-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Wrap selection in Cloze deletion {{c1::...}} (Ctrl+Shift+C)"
              >
                <span>[...]</span>
                <span className="hidden sm:inline">Cloze</span>
              </button>

              <div className="h-4 w-[1px] bg-slate-200 mx-1" />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('code')}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Inline Code (`code`)"
              >
                <Code size={15} />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('highlight')}
                className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Highlight Text (==text==)"
              >
                <Highlighter size={15} />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('link')}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Add Link [text](url)"
              >
                <LinkIcon size={15} />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('bullet')}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                title="Bullet List"
              >
                <List size={15} />
              </button>
            </div>

            {/* Target Field Switcher Pill (Front / Back) */}
            <div className="flex items-center space-x-1 shrink-0 bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveField('front');
                  frontInputRef.current?.focus();
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  activeField === 'front' 
                    ? 'bg-rose-500 text-white' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveField('back');
                  backInputRef.current?.focus();
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  activeField === 'back' 
                    ? 'bg-rose-500 text-white' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Back
              </button>
            </div>

          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {viewMode === 'preview' ? (
            /* Live Flip Preview */
            <div className="space-y-3 py-1">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Front
                </span>
                <RichCardContent
                  content={front || (frontImage ? '' : '*(No question entered)*')}
                  showClozeAnswers={false}
                  className="text-sm sm:text-base text-slate-900 font-semibold"
                />
                {frontImage && (
                  <div className="pt-2 flex justify-center">
                    <img src={frontImage} alt="Front" className="max-h-40 rounded-xl border border-slate-100 object-contain" />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  Back
                </span>
                <RichCardContent
                  content={back || (backImage ? '' : (/\{\{c\d+::/i.test(front) ? front : '*(No answer entered)*'))}
                  showClozeAnswers={true}
                  className="text-sm sm:text-base text-slate-800 font-medium"
                />
                {backImage && (
                  <div className="pt-2 flex justify-center">
                    <img src={backImage} alt="Back" className="max-h-40 rounded-xl border border-slate-100 object-contain" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Standard Card Editor */
            <div className="space-y-3.5">
              
              {/* Card Face 1: FRONT */}
              <div 
                onClick={() => setActiveField('front')}
                className={`rounded-xl border bg-white p-3.5 shadow-xs transition-all ${
                  activeField === 'front' 
                    ? 'border-rose-400 ring-2 ring-rose-400/20' 
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-slate-700">
                      Front
                    </span>
                    {activeField === 'front' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700">
                        Editing
                      </span>
                    )}
                  </div>
                  
                  {/* Front card photo upload */}
                  <div className="flex items-center space-x-1.5">
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
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                  onFocus={() => setActiveField('front')}
                  onChange={(e) => setFront(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  onPaste={(e) => handlePasteImage(e, setFrontImage)}
                  placeholder="Question or prompt... (or attach photo)"
                  className="w-full bg-transparent focus:outline-none font-medium text-slate-900 text-sm leading-relaxed resize-y placeholder-slate-400"
                />

                {/* Front Image Thumbnail */}
                {frontImage && (
                  <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
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
              <div 
                onClick={() => setActiveField('back')}
                className={`rounded-xl border bg-white p-3.5 shadow-xs transition-all ${
                  activeField === 'back' 
                    ? 'border-rose-400 ring-2 ring-rose-400/20' 
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-slate-700">
                      Back
                    </span>
                    {activeField === 'back' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700">
                        Editing
                      </span>
                    )}
                  </div>
                  
                  {/* Back card photo upload */}
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
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Attach photo or paste screenshot"
                    >
                      <Camera size={15} />
                    </button>
                  </div>
                </div>

                <textarea
                  ref={backInputRef}
                  rows={3}
                  value={back}
                  onFocus={() => setActiveField('back')}
                  onChange={(e) => setBack(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  onPaste={(e) => handlePasteImage(e, setBackImage)}
                  placeholder="Answer or key details... (or attach photo)"
                  className="w-full bg-transparent focus:outline-none font-medium text-slate-900 text-sm leading-relaxed resize-y placeholder-slate-400"
                />

                {/* Back Image Thumbnail */}
                {backImage && (
                  <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
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
                  className="w-full py-2 px-3 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-1.5">
                    <Sparkles size={13} className="text-slate-400" />
                    <span>{showExtras ? 'Hide extra details' : '+ Add hint, mnemonic, or tags'}</span>
                  </span>
                  {showExtras ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showExtras && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hint / Key Takeaway</label>
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => setHint(e.target.value)}
                        placeholder="e.g. Remember to cross-reference with..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Memory Hook / Mnemonic</label>
                      <input
                        type="text"
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        placeholder="e.g. ROYGBIV for rainbow colors"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tags</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g. Chapter 3, Exam 1"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between pb-safe">
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
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!front.trim() && !frontImage && !back.trim() && !backImage}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{editingCard ? 'Save Changes' : 'Add Card'}</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono font-normal">⌘↵</kbd>
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
