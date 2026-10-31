import React, { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Camera,
  CheckCircle2,
  Code,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  Strikethrough,
  Trash2,
  Underline,
  X,
} from 'lucide-react';
import { Card, CardDraft, Deck } from '../../types/anki';
import { storage } from '../../services/storage';
import { sounds } from '../../services/audio';
import { RichCardContent } from '../common/RichCardContent';
import { Dialog, Field } from '../studio/Dialog';

interface CardEditorModalProps {
  isOpen: boolean;
  deck: Deck;
  /** All decks, so a new card can go into any of them. */
  decks?: Deck[];
  editingCard?: Card | null;
  onClose: () => void;
  onSaveCard: (card: Card) => void;
}

type Format = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'cloze' | 'code' | 'highlight' | 'link' | 'bullet';

const TOOLS: { format: Format; icon: typeof Bold; label: string }[] = [
  { format: 'bold', icon: Bold, label: 'Bold (Ctrl+B)' },
  { format: 'italic', icon: Italic, label: 'Italic (Ctrl+I)' },
  { format: 'underline', icon: Underline, label: 'Underline (Ctrl+U)' },
  { format: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
  { format: 'highlight', icon: Highlighter, label: 'Highlight' },
  { format: 'code', icon: Code, label: 'Code' },
  { format: 'link', icon: LinkIcon, label: 'Link (Ctrl+K)' },
  { format: 'bullet', icon: List, label: 'Bullet point' },
];

const WRAP: Record<Exclude<Format, 'cloze'>, [string, string, string]> = {
  bold: ['**', '**', 'bold text'],
  italic: ['*', '*', 'italic text'],
  underline: ['<u>', '</u>', 'underlined text'],
  strikethrough: ['~~', '~~', 'crossed-out text'],
  code: ['`', '`', 'code'],
  highlight: ['==', '==', 'highlighted text'],
  link: ['[', '](https://)', 'link text'],
  bullet: ['\n• ', '', 'list item'],
};

export const CardEditorModal: React.FC<CardEditorModalProps> = ({ isOpen, deck, decks, editingCard, onClose, onSaveCard }) => {
  const [deckId, setDeckId] = useState(deck.id);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [hint, setHint] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [activeField, setActiveField] = useState<'front' | 'back'>('front');
  const [addedCount, setAddedCount] = useState(0);

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const skipNextDraft = useRef(true);

  const allDecks = decks && decks.length > 0 ? decks : [deck];
  const targetDeck = allDecks.find((d) => d.id === deckId) ?? deck;
  const draftId = editingCard?.id ? `draft_${editingCard.id}` : `draft_${targetDeck.id}`;
  const hasContent = Boolean(front.trim() || frontImage || back.trim() || backImage);

  const readImage = (file: File, set: (v: string) => void) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        set(e.target.result as string);
        sounds.playClick();
      }
    };
    reader.readAsDataURL(file);
  };

  const pasteImage = (e: React.ClipboardEvent, set: (v: string) => void) => {
    const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'));
    const file = item?.getAsFile();
    if (file) {
      e.preventDefault();
      readImage(file, set);
    }
  };

  const loadFields = (source: { front: string; back: string; frontImage?: string | null; backImage?: string | null; tags?: string; meta?: Card['medicalMeta'] } | null) => {
    setFront(source?.front ?? '');
    setBack(source?.back ?? '');
    setFrontImage(source?.frontImage || null);
    setBackImage(source?.backImage || null);
    setTags(source?.tags ?? '');
    setHint(source?.meta?.clinicalPearl || source?.meta?.takeaway || '');
    setMnemonic(source?.meta?.mnemonic || '');
    setShowExtras(Boolean(source?.meta?.clinicalPearl || source?.meta?.takeaway || source?.meta?.mnemonic || source?.tags));
  };

  // Load the card being edited, or this deck's unfinished draft.
  useEffect(() => {
    if (!isOpen) return;
    setDeckId(editingCard?.deckId || deck.id);
    setAddedCount(0);
    setMode('write');
    setActiveField('front');
    skipNextDraft.current = true;
    if (editingCard) {
      loadFields({ ...editingCard, tags: editingCard.tags?.join(', ') || '', meta: editingCard.medicalMeta });
    } else {
      const draft = storage.getDraft(deck.id);
      const usable = draft && (draft.front.trim() || draft.back.trim() || draft.frontImage || draft.backImage);
      loadFields(usable ? { ...draft, meta: draft.medicalMeta } : null);
    }
    const t = setTimeout(() => frontRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [isOpen, deck.id, editingCard]);

  // Save an unfinished card as a draft while typing.
  useEffect(() => {
    if (!isOpen) return;
    if (skipNextDraft.current) {
      skipNextDraft.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (!hasContent) return;
      const draft: CardDraft = {
        id: draftId,
        deckId: targetDeck.id,
        cardId: editingCard?.id,
        type: /\{\{c\d+::/i.test(front) ? 'cloze' : 'basic',
        front,
        back,
        frontImage,
        backImage,
        tags,
        medicalMeta: { highYield: true, clinicalPearl: hint, takeaway: hint, mnemonic },
        lastSavedAt: Date.now(),
      };
      storage.saveDraft(draft);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front, back, frontImage, backImage, tags, hint, mnemonic, deckId, isOpen]);

  const applyFormat = (format: Format) => {
    sounds.playClick();
    const isFront = activeField === 'front' || format === 'cloze';
    const textarea = isFront ? frontRef.current : backRef.current;
    const value = isFront ? front : back;
    const setValue = isFront ? setFront : setBack;
    if (!textarea) return;

    let prefix: string, suffix: string, placeholder: string;
    if (format === 'cloze') {
      const used = (front.match(/\{\{c(\d+)::/g) || []).map((m) => parseInt(m.replace(/\D/g, '')));
      prefix = `{{c${used.length ? Math.max(...used) + 1 : 1}::`;
      suffix = '}}';
      placeholder = 'hidden words';
    } else {
      [prefix, suffix, placeholder] = WRAP[format];
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || placeholder;
    setValue(value.substring(0, start) + prefix + selected + suffix + value.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 30);
  };

  const clear = () => {
    storage.clearDraft(draftId);
    loadFields(null);
    frontRef.current?.focus();
  };

  const save = () => {
    if (!hasContent) return;
    const tagList = tags.split(/[, ]+/).map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
    const card: Card = {
      id: editingCard?.id || `card_${Date.now()}`,
      deckId: targetDeck.id,
      type: /\{\{c\d+::/i.test(front) ? 'cloze' : 'basic',
      front: front.trim(),
      back: back.trim(),
      frontImage: frontImage || null,
      backImage: backImage || null,
      tags: tagList.length > 0 ? tagList : [targetDeck.name.slice(0, 15)],
      createdAt: editingCard?.createdAt || Date.now(),
      due: editingCard?.due || Date.now(),
      interval: editingCard?.interval || 0,
      easeFactor: editingCard?.easeFactor || 2.5,
      repetitions: editingCard?.repetitions || 0,
      lapses: editingCard?.lapses || 0,
      state: editingCard?.state || 'new',
      stepIndex: editingCard?.stepIndex || 0,
      medicalMeta: { highYield: true, clinicalPearl: hint.trim(), takeaway: hint.trim(), mnemonic: mnemonic.trim() },
      flagged: editingCard?.flagged,
    };
    onSaveCard(card);
    sounds.playRating(3);
    storage.clearDraft(draftId);

    if (editingCard) {
      onClose();
    } else {
      // Stay open for the next card, with the same deck.
      skipNextDraft.current = true;
      setFront('');
      setBack('');
      setFrontImage(null);
      setBackImage(null);
      setHint('');
      setMnemonic('');
      setMode('write');
      setAddedCount((n) => n + 1);
      frontRef.current?.focus();
    }
  };

  const onEditorKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === 'enter') {
      e.preventDefault();
      save();
    } else if (e.shiftKey && k === 'c') {
      e.preventDefault();
      applyFormat('cloze');
    } else if (!e.shiftKey && (k === 'b' || k === 'i' || k === 'u' || k === 'k')) {
      e.preventDefault();
      applyFormat(({ b: 'bold', i: 'italic', u: 'underline', k: 'link' } as const)[k]);
    }
  };

  const face = (side: 'front' | 'back') => {
    const isFront = side === 'front';
    const value = isFront ? front : back;
    const image = isFront ? frontImage : backImage;
    const setImage = isFront ? setFrontImage : setBackImage;
    const fileRef = isFront ? frontFileRef : backFileRef;
    const id = `card-${side}`;
    return (
      <div className={`st-face ${activeField === side ? 'st-face-on' : ''}`} onClick={() => setActiveField(side)}>
        <div className="st-face-h">
          <label htmlFor={id}>{isFront ? 'Question' : 'Answer'}</label>
          <button type="button" className="st-ghost" onClick={() => fileRef.current?.click()} title="Add a picture (or paste one)">
            <Camera size={17} /> Picture
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && readImage(e.target.files[0], (v) => setImage(v))}
          />
        </div>
        <textarea
          id={id}
          ref={isFront ? frontRef : backRef}
          className="st-face-input"
          rows={3}
          value={value}
          onFocus={() => setActiveField(side)}
          onChange={(e) => (isFront ? setFront : setBack)(e.target.value)}
          onKeyDown={onEditorKey}
          onPaste={(e) => pasteImage(e, (v) => setImage(v))}
          placeholder={isFront ? 'Write a question, or paste a picture' : 'Write the answer'}
        />
        {image && (
          <div className="st-face-img">
            <img src={image} alt={isFront ? 'Question picture' : 'Answer picture'} />
            <button type="button" className="st-icon-btn" onClick={() => setImage(null)} aria-label="Remove picture" title="Remove picture">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="md"
      tint="#ffd2e5"
      title={editingCard ? 'Edit card' : 'New card'}
      description={
        editingCard
          ? `In “${targetDeck.name}”. Its progress is kept when you save.`
          : 'Write a question and its answer. Unfinished cards are saved as you type.'
      }
      footer={
        <>
          {hasContent && (
            <button type="button" className="st-ghost" onClick={clear} style={{ marginRight: 'auto' }}>
              <Trash2 size={16} /> Clear
            </button>
          )}
          <button type="button" className="st-btn st-btn-secondary" onClick={onClose}>
            {addedCount > 0 ? 'Done' : 'Cancel'}
          </button>
          <button type="button" className="st-btn st-btn-primary" onClick={save} disabled={!hasContent} title="Ctrl+Enter">
            {editingCard ? 'Save changes' : 'Add card'}
          </button>
        </>
      }
    >
      {!editingCard && allDecks.length > 1 && (
        <Field label="Deck" htmlFor="card-deck">
          <select id="card-deck" className="st-text" value={targetDeck.id} onChange={(e) => setDeckId(e.target.value)}>
            {allDecks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
      )}

      {addedCount > 0 && (
        <div className="st-alert st-alert-ok" role="status">
          <CheckCircle2 size={18} />
          <span>
            Card added to “{targetDeck.name}”{addedCount > 1 ? ` (${addedCount} so far)` : ''}. Write the next one, or press Done.
          </span>
        </div>
      )}

      <div className="st-seg" role="group" aria-label="Write or preview">
        <button type="button" aria-pressed={mode === 'write'} onClick={() => setMode('write')}>Write</button>
        <button type="button" aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>Preview</button>
      </div>

      {mode === 'write' ? (
        <>
          <div className="st-toolbar" role="toolbar" aria-label="Formatting">
            {TOOLS.map((t) => (
              <button
                key={t.format}
                type="button"
                className="st-icon-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat(t.format)}
                aria-label={t.label}
                title={t.label}
              >
                <t.icon size={17} />
              </button>
            ))}
            <button
              type="button"
              className="st-btn st-btn-secondary st-btn-sm"
              style={{ marginLeft: 'auto' }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat('cloze')}
              title="Select words in the question to hide them. You fill them in when you study. (Ctrl+Shift+C)"
            >
              […] Hide words
            </button>
          </div>
          {face('front')}
          {face('back')}

          <details open={showExtras} onToggle={(e) => setShowExtras((e.target as HTMLDetailsElement).open)}>
            <summary style={{ cursor: 'pointer', fontWeight: 800 }}>Hint, memory trick and tags</summary>
            <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
              <Field label="Something to remember" htmlFor="card-hint" hint="Shown under the answer while you study.">
                <input id="card-hint" className="st-text" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="e.g. Ichidan verb: drop る, add ます" />
              </Field>
              <Field label="Memory trick" htmlFor="card-mnemonic">
                <input id="card-mnemonic" className="st-text" value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} placeholder="e.g. ROYGBIV for the colours of a rainbow" />
              </Field>
              <Field label="Tags" htmlFor="card-tags" hint="Separate with commas. Handy for searching in All cards.">
                <input id="card-tags" className="st-text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="chapter 3, verbs" />
              </Field>
            </div>
          </details>
        </>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div className="st-face">
            <div className="st-face-h"><span>Question</span></div>
            <RichCardContent content={front || (frontImage ? '' : '*Nothing written yet*')} showClozeAnswers={false} className="" />
            {frontImage && <img src={frontImage} alt="Question picture" className="st-card-img" style={{ marginTop: 10 }} />}
          </div>
          <div className="st-face">
            <div className="st-face-h"><span>Answer</span></div>
            <RichCardContent
              content={back || (backImage ? '' : /\{\{c\d+::/i.test(front) ? front : '*Nothing written yet*')}
              showClozeAnswers
              className=""
            />
            {backImage && <img src={backImage} alt="Answer picture" className="st-card-img" style={{ marginTop: 10 }} />}
          </div>
        </div>
      )}
    </Dialog>
  );
};
