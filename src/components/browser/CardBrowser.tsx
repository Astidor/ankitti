import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, Image as ImageIcon, Plus, Search, Trash2, X } from 'lucide-react';
import { Card, Deck } from '../../types/anki';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { deckColour } from '../decks/DeckList';

interface CardBrowserProps {
  decks: Deck[];
  cards: Card[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onNewCard: () => void;
}

const PAGE = 60;
const DAY = 86_400_000;

/** Card text without markdown, cloze braces or HTML, for a one-line preview. */
const plainText = (text: string) =>
  (text || '')
    .replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** When the card comes back, in words. */
const nextReview = (card: Card, now: number): { text: string; tone: 'new' | 'due' | 'later' } => {
  if (card.state === 'new') return { text: 'Not studied yet', tone: 'new' };
  if (card.due <= now) return { text: 'Due now', tone: 'due' };
  const days = Math.ceil((card.due - now) / DAY);
  if (days <= 1) return { text: new Date(card.due).toDateString() === new Date(now).toDateString() ? 'Later today' : 'Tomorrow', tone: 'later' };
  if (days < 30) return { text: `In ${days} days`, tone: 'later' };
  const months = Math.round(days / 30);
  return { text: months < 12 ? `In ${months} month${months === 1 ? '' : 's'}` : 'In over a year', tone: 'later' };
};

const STATUS = [
  { id: 'all', label: 'All' },
  { id: 'due', label: 'Due now' },
  { id: 'new', label: 'Not studied' },
  { id: 'later', label: 'Later' },
];

export const CardBrowser: React.FC<CardBrowserProps> = ({ decks, cards, onEditCard, onDeleteCard, onNewCard }) => {
  const [search, setSearch] = useState('');
  const [deckId, setDeckId] = useState('all');
  const [status, setStatus] = useState('all');
  const [shown, setShown] = useState(PAGE);
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const now = Date.now();

  const deckInfo = useMemo(() => {
    const map = new Map<string, { name: string; colour: string }>();
    decks.forEach((d, i) => map.set(d.id, { name: d.name, colour: deckColour(d, i) }));
    return map;
  }, [decks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((card) => {
      if (deckId !== 'all' && card.deckId !== deckId) return false;
      if (status !== 'all' && nextReview(card, now).tone !== status) return false;
      if (!q) return true;
      return (
        card.front.toLowerCase().includes(q) ||
        card.back.toLowerCase().includes(q) ||
        card.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    // `now` changes every render; filtering by the minute is plenty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, deckId, status, search]);

  useEffect(() => setShown(PAGE), [deckId, status, search]);

  const hasFilters = !!search || deckId !== 'all' || status !== 'all';
  const clearFilters = () => {
    setSearch('');
    setDeckId('all');
    setStatus('all');
  };

  return (
    <div>
      <div className="st-head">
        <div>
          <h1 className="st-h1 st-display">All cards</h1>
          <p className="st-sub">
            {cards.length === 0 ? 'Every card you add shows up here.' : `${cards.length.toLocaleString()} cards in ${decks.length} ${decks.length === 1 ? 'deck' : 'decks'}. Click a card to edit it.`}
          </p>
        </div>
        <button onClick={onNewCard} className="st-btn st-btn-primary">
          <Plus size={18} strokeWidth={3} /> Add a card
        </button>
      </div>

      {cards.length > 0 && (
        <div className="st-filters">
          <label className="st-search" style={{ width: 'auto', flex: '1 1 260px' }}>
            <Search size={17} />
            <input
              className="st-input"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, answers or tags"
              aria-label="Search cards"
            />
          </label>
          <select className="st-text st-select" value={deckId} onChange={(e) => setDeckId(e.target.value)} aria-label="Deck">
            <option value="all">All decks</option>
            {decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <div className="st-seg st-seg-inline" role="group" aria-label="Show">
            {STATUS.map((s) => (
              <button key={s.id} type="button" aria-pressed={status === s.id} onClick={() => setStatus(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="st-empty" style={{ marginTop: 24 }}>
          <p>No cards yet. Add one, or import a deck from Anki.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="st-alert st-alert-info" style={{ marginTop: 20 }}>
          <span style={{ flex: 1 }}>No cards match these filters.</span>
          <button className="st-ghost" onClick={clearFilters}><X size={16} /> Clear filters</button>
        </div>
      ) : (
        <>
          <p className="st-sub" style={{ margin: '20px 0 10px' }}>
            {hasFilters ? `${filtered.length.toLocaleString()} of ${cards.length.toLocaleString()} cards` : `${filtered.length.toLocaleString()} cards`}
          </p>
          <ul className="st-cardlist">
            {filtered.slice(0, shown).map((card) => {
              const info = deckInfo.get(card.deckId);
              const when = nextReview(card, now);
              const q = plainText(card.front) || (card.frontImage ? 'Picture' : 'No question');
              return (
                <li key={card.id} className="st-cardrow">
                  <button className="st-cardrow-main" onClick={() => onEditCard(card)} aria-label={`Edit card: ${q}`}>
                    <span className="st-cardrow-deck">
                      <span className="st-dot" style={{ background: info?.colour }} aria-hidden="true" />
                      {info?.name ?? 'No deck'}
                    </span>
                    <span className="st-cardrow-q">{q}</span>
                    <span className="st-cardrow-a">{plainText(card.back) || (card.backImage ? 'Picture' : '')}</span>
                  </button>
                  <span className={`st-when st-when-${when.tone}`}>{when.text}</span>
                  <span className="st-cardrow-actions">
                    {(card.frontImage || card.backImage) && (
                      <button
                        className="st-icon-btn"
                        onClick={() => setPreview({ url: (card.frontImage || card.backImage)!, title: q.slice(0, 40) })}
                        aria-label="View picture"
                        title="View picture"
                      >
                        <ImageIcon size={18} />
                      </button>
                    )}
                    <button className="st-icon-btn" onClick={() => onEditCard(card)} aria-label="Edit card" title="Edit">
                      <Edit3 size={18} />
                    </button>
                    <button
                      className="st-icon-btn"
                      onClick={() => confirm('Delete this card? This can’t be undone.') && onDeleteCard(card.id)}
                      aria-label="Delete card"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
          {filtered.length > shown && (
            <div className="st-center" style={{ marginTop: 18 }}>
              <button className="st-btn st-btn-secondary" onClick={() => setShown((n) => n + PAGE * 2)}>
                Show more ({(filtered.length - shown).toLocaleString()} left)
              </button>
            </div>
          )}
        </>
      )}

      {preview && <ImageLightboxModal isOpen src={preview.url} title={preview.title} onClose={() => setPreview(null)} />}
    </div>
  );
};
