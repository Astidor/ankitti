import React, { useState } from 'react';
import {
  ArrowRight,
  Download,
  FilePlus2,
  FolderPlus,
  GitMerge,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Deck, DeckStats } from '../../types/anki';
import { sounds } from '../../services/audio';
import { Ears, KittyShape } from '../landing/kitty';
import { usePopover } from '../studio/Menus';
import { C, themedColour } from '../../theme';

export type StudyFilterMode = 'due' | 'all' | 'flagged' | 'highYield';

interface DeckListProps {
  decks: Deck[];
  getDeckStats: (deckId: string) => DeckStats;
  hasDraftForDeck: (deckId: string) => boolean;
  onStudyDeck: (deck: Deck, mode?: StudyFilterMode) => void;
  onAddCardToDeck: (deck: Deck) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onExportDeck: (deck: Deck) => void;
  onCreateDeck: () => void;
  onOpenImport: () => void;
  onOpenAiDeck?: (deck?: Deck) => void;
  onMergeDeck?: (deck?: Deck) => void;
}

export const DECK_COLOURS = [C.pinkSoft, C.lilac, C.mint, C.butter, C.peach, C.sky];
const SECONDS_PER_CARD = 10;

/** The deck's own colour, themed, or null to use the next colour in the set. */
const deckPastel = (hex?: string): string | null => {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex) || hex.toLowerCase() === '#d84570') return null; // starter decks share one placeholder colour
  return themedColour(hex);
};
/** The colour a deck is drawn in everywhere: its own pastel, or the next one in the set. */
export const deckColour = (deck: Deck, index: number) => deckPastel(deck.color) ?? DECK_COLOURS[index % DECK_COLOURS.length];

const isEmoji = (s?: string) => !!s && /\p{Extended_Pictographic}/u.test(s);

const dueOf = (s: DeckStats) => s.newCount + s.learnCount + s.dueCount;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ─── One deck ─── */

const DeckCard: React.FC<{
  deck: Deck;
  stats: DeckStats;
  colour: string;
  hasDraft: boolean;
  canMerge: boolean;
  props: DeckListProps;
}> = ({ deck, stats, colour, hasDraft, canMerge, props }) => {
  const menu = usePopover();
  const due = dueOf(stats);
  const isEmpty = stats.total === 0;

  const run = (fn: () => void) => () => {
    sounds.playClick();
    menu.setOpen(false);
    fn();
  };

  return (
    <article className="st-deck st-eared" style={{ background: colour, zIndex: menu.open ? 20 : undefined }}>
      <Ears fill={colour} />
      <div className="st-deck-top">
        <div className="st-deck-title">
          <h3 className="st-display">
            {isEmoji(deck.icon) && <span aria-hidden="true">{deck.icon} </span>}
            {deck.name}
          </h3>
          {deck.description && <p>{deck.description}</p>}
        </div>
        <div className="st-pop-wrap" ref={menu.ref}>
          <button
            className="st-icon-btn"
            aria-label={`More for ${deck.name}`}
            aria-haspopup="menu"
            aria-expanded={menu.open}
            onClick={() => menu.setOpen(!menu.open)}
          >
            <MoreHorizontal size={22} />
          </button>
          {menu.open && (
            <div className="st-pop" role="menu">
              <button role="menuitem" className="st-pop-item st-pop-row" onClick={run(() => props.onAddCardToDeck(deck))}>
                <FilePlus2 size={18} /> <span className="st-pop-title">Add a card</span>
              </button>
              {props.onOpenAiDeck && (
                <button role="menuitem" className="st-pop-item st-pop-row" onClick={run(() => props.onOpenAiDeck!(deck))}>
                  <Sparkles size={18} /> <span className="st-pop-title">Add cards with AI</span>
                </button>
              )}
              <button role="menuitem" className="st-pop-item st-pop-row" onClick={run(() => props.onEditDeck(deck))}>
                <Settings2 size={18} /> <span className="st-pop-title">Rename and settings</span>
              </button>
              <button role="menuitem" className="st-pop-item st-pop-row" onClick={run(() => props.onExportDeck(deck))}>
                <Download size={18} /> <span className="st-pop-title">Download as .apkg</span>
              </button>
              {canMerge && props.onMergeDeck && (
                <button role="menuitem" className="st-pop-item st-pop-row" onClick={run(() => props.onMergeDeck!(deck))}>
                  <GitMerge size={18} /> <span className="st-pop-title">Combine with another deck</span>
                </button>
              )}
              <div className="st-pop-sep" />
              <button role="menuitem" className="st-pop-item st-pop-row st-pop-item-danger" onClick={run(() => props.onDeleteDeck(deck.id))}>
                <Trash2 size={18} /> <span className="st-pop-title">Delete deck…</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="st-deck-status">
        {isEmpty ? (
          <span className="st-muted">No cards yet</span>
        ) : due > 0 ? (
          <span className="st-due">{plural(due, 'card')} to review</span>
        ) : (
          <span className="st-ok">Nothing due today</span>
        )}
        {!isEmpty && <span className="st-muted">{plural(stats.total, 'card')} in total</span>}
        {hasDraft && <span className="st-tag">Unsaved card</span>}
      </div>

      <div className="st-deck-actions">
        {isEmpty ? (
          <button className="st-btn st-btn-primary" onClick={run(() => props.onAddCardToDeck(deck))}>
            <Plus size={18} strokeWidth={3} /> Add your first card
          </button>
        ) : due > 0 ? (
          <button className="st-btn st-btn-secondary" onClick={run(() => props.onStudyDeck(deck, 'due'))}>
            Review now <ArrowRight size={18} strokeWidth={2.75} />
          </button>
        ) : (
          <button
            className="st-btn st-btn-secondary"
            onClick={run(() => props.onStudyDeck(deck, 'all'))}
            title="Go through every card again. Your schedule isn’t changed."
          >
            <RotateCcw size={17} strokeWidth={2.75} /> Practise anyway
          </button>
        )}
        {!isEmpty && (
          <button
            className="st-btn st-btn-secondary"
            style={{ flex: 'none', padding: '0 14px' }}
            onClick={run(() => props.onAddCardToDeck(deck))}
            aria-label={`Add a card to ${deck.name}`}
            title="Add a card"
          >
            <Plus size={19} strokeWidth={3} />
          </button>
        )}
      </div>
    </article>
  );
};

/* ─── Home ─── */

export const DeckList: React.FC<DeckListProps> = (props) => {
  const { decks, getDeckStats, hasDraftForDeck, onStudyDeck, onCreateDeck, onOpenImport, onOpenAiDeck } = props;
  const [search, setSearch] = useState('');

  const withStats = decks.map((deck, i) => ({
    deck,
    stats: getDeckStats(deck.id),
    colour: deckColour(deck, i),
  }));
  const dueDecks = withStats.filter((d) => dueOf(d.stats) > 0).sort((a, b) => dueOf(b.stats) - dueOf(a.stats));
  const totalDue = dueDecks.reduce((n, d) => n + dueOf(d.stats), 0);
  const minutes = Math.max(1, Math.ceil((totalDue * SECONDS_PER_CARD) / 60));
  const next = dueDecks[0];

  const q = search.trim().toLowerCase();
  const shown = q
    ? withStats.filter((d) => d.deck.name.toLowerCase().includes(q) || d.deck.description.toLowerCase().includes(q))
    : withStats;

  /* No decks at all: three clear ways to start. */
  if (decks.length === 0) {
    return (
      <div className="st-empty">
        <KittyShape fill="var(--c-pink-soft)" mood="happy" style={{ width: 150, margin: '0 auto' }} />
        <h1 className="st-display">Let’s make your first deck</h1>
        <p>A deck is a stack of flashcards about one subject. Pick how you’d like to start.</p>
        <div className="st-choices">
          <button className="st-choice" style={{ background: 'var(--c-mint)' }} onClick={() => { sounds.playClick(); onCreateDeck(); }}>
            <FolderPlus size={26} />
            <strong>Start from scratch</strong>
            <span>Make an empty deck and write your own cards.</span>
          </button>
          <button className="st-choice" style={{ background: 'var(--c-sky)' }} onClick={() => { sounds.playClick(); onOpenImport(); }}>
            <Download size={26} />
            <strong>Import from Anki</strong>
            <span>Bring an .apkg, .csv, .tsv or .json file.</span>
          </button>
          {onOpenAiDeck && (
            <button className="st-choice" style={{ background: 'var(--c-butter)' }} onClick={() => { sounds.playClick(); onOpenAiDeck(); }}>
              <Sparkles size={26} />
              <strong>Make one with AI</strong>
              <span>Type a topic and edit the draft it gives you.</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="st-head">
        <div>
          <h1 className="st-h1 st-display">My decks</h1>
          <p className="st-sub">{plural(decks.length, 'deck')} · {plural(withStats.reduce((n, d) => n + d.stats.total, 0), 'card')}</p>
        </div>
      </div>

      {/* Today: the one thing to do next */}
      {totalDue > 0 && next ? (
        <section className="st-today" aria-labelledby="st-today-h">
          <KittyShape fill="var(--c-paper)" mood="think" className="st-today-face" />
          <div>
            <h2 id="st-today-h" className="st-display">{plural(totalDue, 'card')} to review today</h2>
            <p>
              {dueDecks.length > 1 ? `In ${plural(dueDecks.length, 'deck')}, about ${plural(minutes, 'minute')}. ` : `About ${plural(minutes, 'minute')}. `}
              Start with <strong>{next.deck.name}</strong>.
            </p>
          </div>
          <div className="st-today-cta">
            <button className="st-btn st-btn-primary st-btn-lg" onClick={() => { sounds.playClick(); onStudyDeck(next.deck, 'due'); }}>
              Start reviewing <ArrowRight size={20} strokeWidth={2.75} />
            </button>
          </div>
        </section>
      ) : (
        <section className="st-today st-today-done" aria-labelledby="st-today-h">
          <KittyShape fill="var(--c-paper)" mood="happy" className="st-today-face" />
          <div>
            <h2 id="st-today-h" className="st-display">All caught up for today</h2>
            <p>Nothing is due. Come back tomorrow, or practise any deck below whenever you like.</p>
          </div>
        </section>
      )}

      <div className="st-section-h">
        <h2 className="st-display">Decks</h2>
        {decks.length > 6 && (
          <label className="st-search">
            <Search size={17} />
            <input
              className="st-input"
              type="search"
              placeholder="Find a deck"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Find a deck"
            />
          </label>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="st-sub" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          No deck matches “{search}”.
          <button className="st-ghost" onClick={() => setSearch('')}><X size={16} /> Clear</button>
        </p>
      ) : (
        <div className="st-decks">
          {shown.map(({ deck, stats, colour }) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              stats={stats}
              colour={colour}
              hasDraft={hasDraftForDeck(deck.id)}
              canMerge={decks.length >= 2}
              props={props}
            />
          ))}
        </div>
      )}
    </div>
  );
};
