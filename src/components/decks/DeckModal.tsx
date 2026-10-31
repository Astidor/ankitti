import React, { useEffect, useState } from 'react';
import { Deck, DeckSettings } from '../../types/anki';
import { DEFAULT_DECK_SETTINGS } from '../../services/scheduler';
import { sounds } from '../../services/audio';
import { Dialog, Field } from '../studio/Dialog';
import { themedColour } from '../../theme';

interface DeckModalProps {
  isOpen: boolean;
  editingDeck?: Deck | null;
  onClose: () => void;
  onSaveDeck: (deck: Deck) => void;
  /** The colour the deck is drawn in now, so settings start from what the learner sees. */
  displayColour?: string;
}

const DECK_ICONS = ['', '📚', '🧠', '🌸', '🔬', '💊', '⭐', '💻', '🎨', '🗾', '⚡', '📝'];
// The same pastels the deck cards are drawn in.
const DECK_COLORS = ['#ffd2e5', '#d9ccfd', '#c9f0dc', '#fff0b0', '#ffdcc4', '#cfe6ff', '#f3e1d3', '#d6f2f0'];
const COLOR_NAMES = ['Pink', 'Lilac', 'Mint', 'Butter', 'Peach', 'Sky', 'Oat', 'Sea'];
const isEmoji = (s?: string) => !!s && /\p{Extended_Pictographic}/u.test(s);

export const DeckModal: React.FC<DeckModalProps> = ({ isOpen, editingDeck, onClose, onSaveDeck, displayColour }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState(DECK_COLORS[0]);
  const [newCardsPerDay, setNewCardsPerDay] = useState(20);
  const [reviewsPerDay, setReviewsPerDay] = useState(150);
  const [learningSteps, setLearningSteps] = useState('1 10');

  useEffect(() => {
    if (!isOpen) return;
    const s = editingDeck?.settings ?? DEFAULT_DECK_SETTINGS;
    setName(editingDeck?.name ?? '');
    setDescription(editingDeck?.description ?? '');
    setIcon(isEmoji(editingDeck?.icon) ? editingDeck!.icon! : '');
    const shown = editingDeck?.color && DECK_COLORS.includes(editingDeck.color) ? editingDeck.color : displayColour;
    setColor(shown && DECK_COLORS.includes(shown) ? shown : DECK_COLORS[0]);
    setNewCardsPerDay(s.newCardsPerDay);
    setReviewsPerDay(editingDeck ? s.reviewsPerDay : 150);
    setLearningSteps(s.learningSteps.join(' '));
  }, [isOpen, editingDeck, displayColour]);

  const save = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    const steps = learningSteps.split(/[\s,]+/).map(parseFloat).filter((n) => !isNaN(n) && n > 0);
    const settings: DeckSettings = {
      // Keep any other settings the deck already has (e.g. from an Anki import).
      ...DEFAULT_DECK_SETTINGS,
      ...editingDeck?.settings,
      newCardsPerDay,
      reviewsPerDay,
      learningSteps: steps.length > 0 ? steps : [1, 10],
    };
    onSaveDeck({
      id: editingDeck?.id || `deck_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      settings,
      createdAt: editingDeck?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
    sounds.playRating(3);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="sm"
      tint={themedColour(color)}
      title={editingDeck ? 'Rename and settings' : 'New deck'}
      description={editingDeck ? 'Changes apply straight away. Your cards and their progress stay as they are.' : 'A deck holds the cards for one subject. You can add cards right after.'}
      footer={
        <>
          <button className="st-btn st-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="st-btn st-btn-primary" onClick={() => save()} disabled={!name.trim()}>
            {editingDeck ? 'Save changes' : 'Create deck'}
          </button>
        </>
      }
    >
      <form onSubmit={save} style={{ display: 'grid', gap: 18 }}>
        <Field label="Name" htmlFor="deck-name">
          <input
            id="deck-name"
            className="st-text"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Japanese N5 or Biology 101"
          />
        </Field>

        <Field label="Description (optional)" htmlFor="deck-desc">
          <input
            id="deck-desc"
            className="st-text"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What’s in this deck?"
          />
        </Field>

        <Field label="Colour">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }} role="group" aria-label="Colour">
            {DECK_COLORS.map((c, i) => (
              <button
                key={c}
                type="button"
                className="st-swatch"
                style={{ background: themedColour(c) }}
                aria-pressed={color === c}
                aria-label={COLOR_NAMES[i]}
                title={COLOR_NAMES[i]}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </Field>

        <Field label="Icon (optional)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="group" aria-label="Icon">
            {DECK_ICONS.map((ic) => (
              <button
                key={ic || 'none'}
                type="button"
                className="st-icon-choice"
                aria-pressed={icon === ic}
                aria-label={ic ? `Icon ${ic}` : 'No icon'}
                onClick={() => setIcon(ic)}
              >
                {ic || <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>None</span>}
              </button>
            ))}
          </div>
        </Field>

        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 800 }}>Daily limits</summary>
          <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="New cards a day" htmlFor="deck-new">
                <input id="deck-new" className="st-text" type="number" min={0} max={999} value={newCardsPerDay} onChange={(e) => setNewCardsPerDay(parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Reviews a day, at most" htmlFor="deck-rev">
                <input id="deck-rev" className="st-text" type="number" min={0} max={9999} value={reviewsPerDay} onChange={(e) => setReviewsPerDay(parseInt(e.target.value) || 0)} />
              </Field>
            </div>
            <Field
              label="First-look gaps, in minutes"
              htmlFor="deck-steps"
              hint="How soon a brand-new card comes back before it moves to days. “1 10” means after 1 minute, then 10."
            >
              <input id="deck-steps" className="st-text" type="text" value={learningSteps} onChange={(e) => setLearningSteps(e.target.value)} placeholder="1 10" />
            </Field>
          </div>
        </details>
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
};
