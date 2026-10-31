import React, { useEffect, useState } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Deck, Card, AiDeckResponse } from '../../types/anki';
import { DEFAULT_DECK_SETTINGS } from '../../services/scheduler';
import { api } from '../../services/api';
import { sounds } from '../../services/audio';
import { Dialog, Field } from '../studio/Dialog';

interface AiDeckModalProps {
  isOpen: boolean;
  decks?: Deck[];
  initialDeckId?: string | null;
  onClose: () => void;
  onDeckCreated: (deck: Deck, cards: Card[]) => void;
  /** Called when the AI needs an account; should open sign-up. */
  onNeedSignIn?: () => void;
}

const KEY_STORAGE = 'ankitti_custom_deepseek_key';
const EXAMPLES = ['Japanese N5 verbs', 'The Krebs cycle', 'Spanish for travel', 'Big-O of common algorithms', 'Cranial nerves'];
const COUNTS = [5, 10, 15];
const STYLES = [
  { id: 'mixed' as const, label: 'A mix' },
  { id: 'basic' as const, label: 'Questions' },
  { id: 'cloze' as const, label: 'Fill in the blank' },
];

const readKey = () => {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
};

export const AiDeckModal: React.FC<AiDeckModalProps> = ({ isOpen, decks = [], initialDeckId, onClose, onDeckCreated, onNeedSignIn }) => {
  const [destination, setDestination] = useState<'new' | 'existing'>('new');
  const [targetDeckId, setTargetDeckId] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [style, setStyle] = useState<'mixed' | 'basic' | 'cloze'>('mixed');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAccount, setNeedsAccount] = useState(false);
  const [result, setResult] = useState<AiDeckResponse | null>(null);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [apiKey, setApiKey] = useState(readKey);
  const [showMore, setShowMore] = useState(false);

  // Opened from a deck: add to that deck. Opened from Create: make a new deck.
  useEffect(() => {
    if (!isOpen) return;
    setResult(null);
    setError(null);
    setNeedsAccount(false);
    if (initialDeckId && decks.some((d) => d.id === initialDeckId)) {
      setDestination('existing');
      setTargetDeckId(initialDeckId);
    } else {
      setDestination('new');
      setTargetDeckId(decks[0]?.id || '');
    }
  }, [isOpen, initialDeckId, decks]);

  const saveKey = (val: string) => {
    setApiKey(val);
    try {
      if (val.trim()) localStorage.setItem(KEY_STORAGE, val.trim());
      else localStorage.removeItem(KEY_STORAGE);
    } catch {
      /* storage unavailable: the key is used for this session only */
    }
  };

  const targetDeck = decks.find((d) => d.id === targetDeckId);
  const addingToExisting = destination === 'existing' && !!targetDeck;
  const selectedCount = result ? result.cards.filter((_, i) => selected[i] !== false).length : 0;

  const generate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    setNeedsAccount(false);
    setResult(null);
    try {
      const res = await api.generateAiDeck({
        topic: topic.trim(),
        cardCount,
        notes: notes.trim(),
        style,
        apiKey: apiKey.trim() || undefined,
      });
      setResult(res);
      setSelected(Object.fromEntries(res.cards.map((_, i) => [i, true])));
      sounds.playRating(4);
    } catch (err: unknown) {
      sounds.playRating(1);
      const msg = err instanceof Error ? err.message : '';
      if (/auth|sign in|log in|unauthori[sz]ed/i.test(msg)) {
        setNeedsAccount(true);
        setError('Making cards with AI needs a free account, so we can keep it fair for everyone.');
      } else if (msg === 'KEY_MISSING' || msg === 'AI_API_KEY_MISSING') {
        setShowMore(true);
        setError('AI decks aren’t switched on for this site yet. If you have your own DeepSeek API key, add it under “More options” and try again.');
      } else {
        setError(msg || 'The AI couldn’t make cards just now. Please try again in a moment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addCards = async () => {
    if (!result) return;
    setIsLoading(true);
    try {
      const now = Date.now();
      let deck: Deck;
      if (addingToExisting) {
        deck = targetDeck!;
      } else {
        deck = {
          id: `deck_ai_${now}`,
          name: result.deck.name,
          description: result.deck.description,
          icon: result.deck.icon || '✨',
          color: 'var(--c-butter)',
          settings: { ...DEFAULT_DECK_SETTINGS, newCardsPerDay: 20, reviewsPerDay: 100 },
          createdAt: now,
          updatedAt: now,
        };
        await api.createDeck(deck);
      }

      const created: Card[] = [];
      const picked = result.cards.filter((_, i) => selected[i] !== false);
      for (let i = 0; i < picked.length; i++) {
        const item = picked[i];
        const card: Card = {
          id: `card_ai_${i}_${now}`,
          deckId: deck.id,
          type: item.type,
          front: item.front,
          back: item.back,
          tags: item.tags || ['AI'],
          createdAt: now,
          due: now,
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          lapses: 0,
          state: 'new',
          stepIndex: 0,
          medicalMeta: { highYield: true, takeaway: item.takeaway, mnemonic: item.mnemonic, clinicalPearl: item.takeaway },
        };
        created.push(await api.createCard(card));
      }
      sounds.playRating(4);
      onDeckCreated(deck, created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'The cards couldn’t be saved. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const footer = result ? (
    <>
      <span className="st-foot-note">Untick any card you don’t want.</span>
      <button className="st-btn st-btn-secondary" onClick={() => setResult(null)} disabled={isLoading}>Back</button>
      <button className="st-btn st-btn-primary" onClick={addCards} disabled={isLoading || selectedCount === 0}>
        {isLoading ? <span className="st-spinner" aria-label="Saving" /> : addingToExisting ? `Add ${selectedCount} cards` : `Create deck with ${selectedCount} cards`}
      </button>
    </>
  ) : (
    <>
      <button className="st-btn st-btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
      <button className="st-btn st-btn-primary" onClick={() => generate()} disabled={isLoading || !topic.trim()}>
        {isLoading ? (<><span className="st-spinner" /> Writing cards…</>) : (<><Sparkles size={18} /> Make cards</>)}
      </button>
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      busy={isLoading}
      size="lg"
      tint="var(--c-butter)"
      title={result ? 'Check your new cards' : 'Make cards with AI'}
      description={
        result
          ? addingToExisting
            ? `They’ll be added to “${targetDeck!.name}”. AI can make mistakes, so give them a quick read.`
            : `They’ll go into a new deck called “${result.deck.name}”. AI can make mistakes, so give them a quick read.`
          : 'Type a topic and get a first draft of flashcards. You choose which ones to keep.'
      }
      footer={footer}
    >
      {error && (
        <div className="st-alert st-alert-error" role="alert">
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          {needsAccount && onNeedSignIn && (
            <button type="button" className="st-btn st-btn-secondary st-btn-sm" onClick={onNeedSignIn}>
              Sign in or sign up
            </button>
          )}
        </div>
      )}

      {!result && (
        <form onSubmit={generate} style={{ display: 'grid', gap: 18 }}>
          <Field label="What should the cards be about?" htmlFor="ai-topic">
            <input
              id="ai-topic"
              className="st-text"
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The Krebs cycle"
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" className="st-ghost" style={{ minHeight: 34, border: '2px solid var(--st-line)', borderRadius: 999 }} onClick={() => setTopic(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </Field>

          <Field label="How many cards?">
            <div className="st-seg" role="group" aria-label="How many cards">
              {COUNTS.map((n) => (
                <button key={n} type="button" aria-pressed={cardCount === n} onClick={() => setCardCount(n)}>{n}</button>
              ))}
            </div>
          </Field>

          {decks.length > 0 && (
            <Field label="Where should they go?">
              <div style={{ display: 'grid', gap: 8 }}>
                <button type="button" className="st-option" aria-pressed={destination === 'new'} onClick={() => setDestination('new')}>
                  <span>
                    <span className="st-option-title">A new deck</span>
                    <span className="st-option-sub">Named after the topic</span>
                  </span>
                </button>
                <button type="button" className="st-option" aria-pressed={destination === 'existing'} onClick={() => setDestination('existing')}>
                  <span>
                    <span className="st-option-title">One of my decks</span>
                    <span className="st-option-sub">{targetDeck ? targetDeck.name : 'Pick a deck'}</span>
                  </span>
                </button>
                {destination === 'existing' && (
                  <select className="st-text" value={targetDeckId} onChange={(e) => setTargetDeckId(e.target.value)} aria-label="Deck">
                    {decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
              </div>
            </Field>
          )}

          <details open={showMore} onToggle={(e) => setShowMore((e.target as HTMLDetailsElement).open)}>
            <summary style={{ cursor: 'pointer', fontWeight: 800 }}>More options</summary>
            <div style={{ display: 'grid', gap: 16, marginTop: 14 }}>
              <Field label="Your notes (optional)" htmlFor="ai-notes" hint="Paste lecture notes or a chapter and the cards will stick to it.">
                <textarea id="ai-notes" className="st-text" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
              <Field label="Kind of cards">
                <div className="st-seg" role="group" aria-label="Kind of cards">
                  {STYLES.map((s) => (
                    <button key={s.id} type="button" aria-pressed={style === s.id} onClick={() => setStyle(s.id)}>{s.label}</button>
                  ))}
                </div>
              </Field>
              <Field
                label="Your own DeepSeek API key (optional)"
                htmlFor="ai-key"
                hint="Only needed if AI decks aren’t switched on for this site. Kept in this browser only."
              >
                <input id="ai-key" className="st-text" type="password" value={apiKey} onChange={(e) => saveKey(e.target.value)} placeholder="sk-…" autoComplete="off" />
              </Field>
            </div>
          </details>
          <button type="submit" hidden />
        </form>
      )}

      {result && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <strong>{selectedCount} of {result.cards.length} cards selected</strong>
            <button
              type="button"
              className="st-link-btn"
              onClick={() => {
                const all = selectedCount < result.cards.length;
                setSelected(Object.fromEntries(result.cards.map((_, i) => [i, all])));
              }}
            >
              {selectedCount < result.cards.length ? 'Select all' : 'Select none'}
            </button>
          </div>
          {result.cards.map((card, i) => {
            const on = selected[i] !== false;
            return (
              <label key={i} className="st-option" style={{ alignItems: 'flex-start', opacity: on ? 1 : 0.6 }} aria-checked={on}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => setSelected((prev) => ({ ...prev, [i]: !on }))}
                  style={{ width: 20, height: 20, marginTop: 2, accentColor: 'var(--c-pink)', flex: 'none' }}
                />
                <span style={{ minWidth: 0 }}>
                  <span className="st-option-title" style={{ overflowWrap: 'anywhere' }}>{card.front}</span>
                  <span className="st-option-sub" style={{ overflowWrap: 'anywhere' }}>{card.back}</span>
                  {card.takeaway && <span className="st-option-sub" style={{ marginTop: 4 }}>Remember: {card.takeaway}</span>}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </Dialog>
  );
};
