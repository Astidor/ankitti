import React, { useEffect, useRef, useState } from 'react';
import { Download, FilePlus2, FolderPlus, Plus, Sparkles } from 'lucide-react';
import { sounds } from '../../services/audio';

/** Open/close state for a popover that closes on Escape or a click outside it. */
export function usePopover<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

export interface CreateActions {
  onAddCard: () => void;
  onNewDeck: () => void;
  onImport: () => void;
  onAi: () => void;
}

const CHOICES = (a: CreateActions) => [
  { key: 'card', title: 'Add a card', sub: 'Write a question and its answer', icon: FilePlus2, bg: 'var(--c-pink-soft)', run: a.onAddCard },
  { key: 'deck', title: 'New deck', sub: 'An empty deck for a new subject', icon: FolderPlus, bg: 'var(--c-mint)', run: a.onNewDeck },
  { key: 'import', title: 'Import from Anki', sub: '.apkg, .csv, .tsv or .json files', icon: Download, bg: 'var(--c-sky)', run: a.onImport },
  { key: 'ai', title: 'Make a deck with AI', sub: 'Type a topic, get a draft to edit', icon: Sparkles, bg: 'var(--c-butter)', run: a.onAi },
];

const ChoiceList: React.FC<{ actions: CreateActions; close: () => void }> = ({ actions, close }) => (
  <div role="menu">
    {CHOICES(actions).map((c) => (
      <button
        key={c.key}
        role="menuitem"
        className="st-pop-item"
        onClick={() => {
          sounds.playClick();
          close();
          c.run();
        }}
      >
        <span className="st-pop-icon" style={{ background: c.bg }}>
          <c.icon size={18} strokeWidth={2.5} />
        </span>
        <span>
          <span className="st-pop-title">{c.title}</span>
          <span className="st-pop-sub">{c.sub}</span>
        </span>
      </button>
    ))}
  </div>
);

/** The single "Create" entry point in the sidebar. */
export const CreateButton: React.FC<{ actions: CreateActions }> = ({ actions }) => {
  const { open, setOpen, ref } = usePopover();
  return (
    <div className="st-pop-wrap" ref={ref}>
      <button
        className="st-btn st-btn-primary st-btn-block"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          sounds.playClick();
          setOpen(!open);
        }}
      >
        <Plus size={18} strokeWidth={3} /> Create
      </button>
      {open && (
        <div className="st-pop" style={{ left: 0, top: 54 }}>
          <ChoiceList actions={actions} close={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

/** The same choices as a bottom sheet on phones. */
export const CreateSheet: React.FC<{ open: boolean; onClose: () => void; actions: CreateActions }> = ({ open, onClose, actions }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="st-sheet-back" onClick={onClose}>
      <div className="st-sheet" role="dialog" aria-modal="true" aria-label="Create" onClick={(e) => e.stopPropagation()}>
        <p className="st-sheet-h st-display">What would you like to make?</p>
        <ChoiceList actions={actions} close={onClose} />
      </div>
    </div>
  );
};
