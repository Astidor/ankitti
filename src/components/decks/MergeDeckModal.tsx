import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Deck } from '../../types/anki';
import { sounds } from '../../services/audio';
import { Dialog, Field } from '../studio/Dialog';

interface MergeDeckModalProps {
  isOpen: boolean;
  decks: Deck[];
  initialSourceDeck?: Deck | null;
  getDeckCardCount: (deckId: string) => number;
  onClose: () => void;
  onMergeDecks: (
    sourceDeckId: string,
    targetDeckId: string,
    options: { deleteSourceDeck: boolean; tagMergedCards: boolean },
    newDeck?: { name: string; icon: string; color: string }
  ) => Promise<void>;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const MergeDeckModal: React.FC<MergeDeckModalProps> = ({
  isOpen,
  decks,
  initialSourceDeck,
  getDeckCardCount,
  onClose,
  onMergeDecks,
}) => {
  const [sourceId, setSourceId] = useState('');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [targetId, setTargetId] = useState('');
  const [newName, setNewName] = useState('');
  const [deleteSource, setDeleteSource] = useState(true);
  const [tagCards, setTagCards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const source = initialSourceDeck || decks[0];
    setSourceId(source?.id || '');
    const other = decks.find((d) => d.id !== source?.id);
    setTargetId(other?.id || '');
    setMode(other ? 'existing' : 'new');
    setNewName(source ? `${source.name} (combined)` : 'Combined deck');
    setDeleteSource(true);
    setTagCards(false);
    setIsSubmitting(false);
    setError(null);
  }, [isOpen, initialSourceDeck, decks]);

  const source = decks.find((d) => d.id === sourceId);
  const others = decks.filter((d) => d.id !== sourceId);
  const target = mode === 'existing' ? decks.find((d) => d.id === targetId) : undefined;
  const moving = source ? getDeckCardCount(source.id) : 0;
  const after = mode === 'existing' && target ? getDeckCardCount(target.id) + moving : moving;
  const canSubmit = !isSubmitting && moving > 0 && (mode === 'existing' ? !!target : !!newName.trim());

  const changeSource = (id: string) => {
    setSourceId(id);
    if (targetId === id) {
      const next = decks.find((d) => d.id !== id);
      if (next) setTargetId(next.id);
      else setMode('new');
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onMergeDecks(
        sourceId,
        mode === 'existing' ? targetId : '',
        { deleteSourceDeck: deleteSource, tagMergedCards: tagCards },
        mode === 'new' ? { name: newName.trim(), icon: '', color: '#ffd2e5' } : undefined
      );
      sounds.playRating(4);
      onClose();
    } catch (err) {
      console.error('Combining decks failed:', err);
      setError('The decks couldn’t be combined. Nothing was changed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const destination = mode === 'existing' ? `“${target?.name ?? '…'}”` : `a new deck called “${newName.trim() || '…'}”`;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      busy={isSubmitting}
      tint="#c9f0dc"
      title="Combine decks"
      description="Move every card from one deck into another. Each card keeps its progress."
      footer={
        <>
          <button className="st-btn st-btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className="st-btn st-btn-primary" onClick={submit} disabled={!canSubmit}>
            {isSubmitting ? <span className="st-spinner" aria-label="Moving" /> : `Move ${plural(moving, 'card')}`}
          </button>
        </>
      }
    >
      {error && (
        <div className="st-alert st-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <Field label="Move the cards from" htmlFor="merge-source">
        <select id="merge-source" className="st-text" value={sourceId} onChange={(e) => changeSource(e.target.value)}>
          {decks.map((d) => (
            <option key={d.id} value={d.id}>{d.name} ({plural(getDeckCardCount(d.id), 'card')})</option>
          ))}
        </select>
      </Field>

      <Field label="Into">
        <div style={{ display: 'grid', gap: 8 }}>
          {others.length > 0 && (
            <button type="button" className="st-option" aria-pressed={mode === 'existing'} onClick={() => setMode('existing')}>
              <span>
                <span className="st-option-title">Another of my decks</span>
                <span className="st-option-sub">{target ? target.name : 'Pick a deck'}</span>
              </span>
            </button>
          )}
          {mode === 'existing' && others.length > 0 && (
            <select className="st-text" value={targetId} onChange={(e) => setTargetId(e.target.value)} aria-label="Deck to move the cards into">
              {others.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({plural(getDeckCardCount(d.id), 'card')})</option>
              ))}
            </select>
          )}
          <button type="button" className="st-option" aria-pressed={mode === 'new'} onClick={() => setMode('new')}>
            <span>
              <span className="st-option-title">A new deck</span>
              <span className="st-option-sub">Give it a name below</span>
            </span>
          </button>
          {mode === 'new' && (
            <input className="st-text" value={newName} onChange={(e) => setNewName(e.target.value)} aria-label="Name of the new deck" />
          )}
        </div>
      </Field>

      <div style={{ display: 'grid', gap: 10 }}>
        <label className="st-option" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={deleteSource} onChange={(e) => setDeleteSource(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#d6307c' }} />
          <span>
            <span className="st-option-title">Delete “{source?.name ?? 'the old deck'}” afterwards</span>
            <span className="st-option-sub">It will be empty once its cards have moved.</span>
          </span>
        </label>
        <label className="st-option" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={tagCards} onChange={(e) => setTagCards(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#d6307c' }} />
          <span>
            <span className="st-option-title">Tag the moved cards</span>
            <span className="st-option-sub">So you can still find which deck they came from.</span>
          </span>
        </label>
      </div>

      {source && (
        <div className="st-alert st-alert-info" role="status">
          <span>
            {moving === 0
              ? `“${source.name}” has no cards to move.`
              : `${plural(moving, 'card')} will move into ${destination}, which will then have ${plural(after, 'card')}.`}
          </span>
        </div>
      )}
    </Dialog>
  );
};
