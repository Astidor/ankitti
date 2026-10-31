import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Edit3, Info, RotateCcw, Zap } from 'lucide-react';
import { Card, Deck } from '../../types/anki';
import { answerCard, getIntervalPreviews } from '../../services/scheduler';
import { sounds } from '../../services/audio';
import { Ears, FaceG, KittyShape } from '../landing/kitty';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { RichCardContent } from '../common/RichCardContent';

export type StudyFilterMode = 'due' | 'all' | 'flagged' | 'highYield';

interface StudySessionProps {
  deck: Deck;
  cards: Card[];
  initialFilterMode?: StudyFilterMode;
  initialMode?: StudyFilterMode;
  onUpdateCard: (card: Card, rating: 1 | 2 | 3 | 4) => void;
  onEditCard: (card: Card) => void;
  onBack: () => void;
}

const TIP_KEY = 'ankitti_rating_tip_seen';

const RATES = [
  { rating: 1 as const, label: 'Again', meaning: 'Forgot it', key: 'again' as const, bg: 'var(--c-pink-soft)' },
  { rating: 2 as const, label: 'Hard', meaning: 'Took effort', key: 'hard' as const, bg: 'var(--c-peach)' },
  { rating: 3 as const, label: 'Good', meaning: 'Got it', key: 'good' as const, bg: 'var(--c-mint)' },
  { rating: 4 as const, label: 'Easy', meaning: 'Too easy', key: 'easy' as const, bg: 'var(--c-sky)' },
];

const isHighYield = (c: Card) => !!(c.medicalMeta?.highYield || c.tags?.some((t) => t.toLowerCase().includes('high')));

export const StudySession: React.FC<StudySessionProps> = ({
  deck,
  cards,
  initialFilterMode,
  initialMode,
  onUpdateCard,
  onEditCard,
  onBack,
}) => {
  const [filterMode, setFilterMode] = useState<StudyFilterMode>(initialFilterMode || initialMode || 'due');
  const [queue, setQueue] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);
  const [showTip, setShowTip] = useState(() => {
    try {
      return !localStorage.getItem(TIP_KEY);
    } catch {
      return false;
    }
  });

  // The queue is built when a session starts, from the cards as they are then.
  // Ratings update the deck's cards, which must not reshuffle a session in progress.
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  const buildQueue = useCallback(
    (mode: StudyFilterMode) => {
      const cards = cardsRef.current;
      const now = Date.now();
      let selected: Card[] = [];
      if (mode === 'due') {
        selected = cards.filter((c) => c.due <= now || c.state === 'new' || c.state === 'learning');
        if (selected.length === 0) selected = [...cards];
      } else if (mode === 'all') {
        selected = [...cards];
      } else if (mode === 'flagged') {
        selected = cards.filter((c) => c.flagged);
        if (selected.length === 0) selected = [...cards];
      } else if (mode === 'highYield') {
        selected = cards.filter(isHighYield);
        if (selected.length === 0) selected = [...cards];
      }
      const shuffled = [...selected].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsCompleted(shuffled.length === 0);
    },
    []
  );

  useEffect(() => {
    buildQueue(filterMode);
  }, [buildQueue, filterMode]);

  // Show the latest version of the queued card, so an edit made mid-session appears at once.
  const queued = queue[currentCardIndex];
  const currentCard = queued ? cards.find((c) => c.id === queued.id) ?? queued : null;

  const dismissTip = () => {
    setShowTip(false);
    try {
      localStorage.setItem(TIP_KEY, '1');
    } catch {
      /* private mode: the tip just shows again next time */
    }
  };

  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRating = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!currentCard) return;
      sounds.playRating(rating);
      // Only cards that are actually due get rescheduled. Practising a card early
      // ("Practise anyway", "Practise all again") leaves its schedule alone.
      const isDue = currentCard.due <= Date.now() || currentCard.state === 'new' || currentCard.state === 'learning';
      if (isDue) onUpdateCard(answerCard(currentCard, rating, deck.settings), rating);
      setStudiedCount((prev) => prev + 1);

      if (rating === 1) {
        // A forgotten card comes back a few cards later in this session.
        setQueue((prev) => {
          const nextQueue = [...prev];
          const current = nextQueue.splice(currentCardIndex, 1)[0];
          nextQueue.splice(Math.min(nextQueue.length, currentCardIndex + 3), 0, current);
          return nextQueue;
        });
        setIsFlipped(false);
      } else if (currentCardIndex + 1 < queue.length) {
        setCurrentCardIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setIsCompleted(true);
        sounds.playCelebration();
      }
    },
    [currentCard, currentCardIndex, deck.settings, onUpdateCard, queue.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isCompleted) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped) handleFlip();
        else handleRating(3);
      } else if (isFlipped && ['1', '2', '3', '4'].includes(e.key)) {
        handleRating(Number(e.key) as 1 | 2 | 3 | 4);
      } else if (e.key.toLowerCase() === 'e' && currentCard) {
        e.preventDefault();
        onEditCard(currentCard);
      } else if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isCompleted, handleFlip, handleRating, currentCard, onEditCard, onBack]);

  const restart = (mode: StudyFilterMode) => {
    sounds.playClick();
    setStudiedCount(0);
    setSessionStartTime(Date.now());
    setFilterMode(mode);
    buildQueue(mode);
  };

  /* ─── Finished ─── */
  if (isCompleted || !currentCard) {
    const minutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    const highYieldCount = cards.filter(isHighYield).length;
    return (
      <div className="st-done">
        <KittyShape fill="var(--c-mint)" mood="happy" style={{ width: 150, margin: '0 auto' }} />
        <h1 className="st-display">{studiedCount > 0 ? 'Nice work!' : 'Nothing to review here'}</h1>
        <p>
          {studiedCount > 0
            ? `You finished ${deck.name}. Each card is now scheduled for the right day.`
            : `${deck.name} has no cards yet. Add some, then come back.`}
        </p>

        {studiedCount > 0 && (
          <div className="st-done-stats">
            <div>
              <b>{studiedCount}</b>
              <span>{studiedCount === 1 ? 'card reviewed' : 'cards reviewed'}</span>
            </div>
            <div>
              <b>{minutes}</b>
              <span>{minutes === 1 ? 'minute' : 'minutes'}</span>
            </div>
          </div>
        )}

        <div className="st-done-actions">
          <button className="st-btn st-btn-primary st-btn-lg" onClick={onBack}>
            Back to my decks
          </button>
          {cards.length > 0 && (
            <button className="st-btn st-btn-secondary" onClick={() => restart('all')}>
              <RotateCcw size={17} strokeWidth={2.75} /> Practise all {cards.length} cards again
            </button>
          )}
          {highYieldCount > 0 && highYieldCount < cards.length && (
            <button className="st-btn st-btn-secondary" onClick={() => restart('highYield')}>
              <Zap size={17} strokeWidth={2.75} /> Practise the {highYieldCount} high-yield cards
            </button>
          )}
          {cards.length > 0 && <p className="st-hint">Practising again doesn’t change when cards are due.</p>}
        </div>
      </div>
    );
  }

  /* ─── Reviewing ─── */
  const previews = getIntervalPreviews(currentCard, deck.settings);
  const isPractice = !(currentCard.due <= Date.now() || currentCard.state === 'new' || currentCard.state === 'learning');
  const progress = queue.length > 0 ? (currentCardIndex / queue.length) * 100 : 0;
  const position = `Card ${currentCardIndex + 1} of ${queue.length}`;

  return (
    <div className="st-study">
      <div className="st-study-bar">
        <button className="st-ghost" onClick={onBack} aria-label="Stop and go back to my decks">
          <ArrowLeft size={18} strokeWidth={2.75} /> Done
        </button>
        <div className="st-study-title">
          <strong className="st-display">{deck.name}</strong>
          <span>{position}</span>
        </div>
        <button className="st-ghost" onClick={() => onEditCard(currentCard)} title="Edit this card (E)">
          <Edit3 size={17} strokeWidth={2.5} /> Edit
        </button>
      </div>
      <div className="st-progress" role="progressbar" aria-label="Session progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${progress}%` }} />
      </div>

      <div
        key={currentCard.id + String(isFlipped)}
        className="st-card st-eared"
        onClick={() => !isFlipped && handleFlip()}
        role={isFlipped ? undefined : 'button'}
        tabIndex={isFlipped ? undefined : 0}
        aria-label={isFlipped ? undefined : 'Show the answer'}
        onKeyDown={(e) => {
          if (!isFlipped && e.key === 'Enter') handleFlip();
        }}
      >
        <Ears fill="var(--c-paper)" />
        <div className="st-card-face" aria-hidden="true">
          <svg width="140" height="52" viewBox="-70 -22 140 50">
            <FaceG x={0} y={0} s={1.2} mood={isFlipped ? 'happy' : 'think'} />
          </svg>
        </div>

        <div className="st-card-body">
          {!isFlipped ? (
            <>
              <div className="st-card-q">
                <RichCardContent
                  content={currentCard.front || (currentCard.frontImage ? '' : '*(This card has no question)*')}
                  showClozeAnswers={false}
                  className="st-card-q"
                />
              </div>
              {currentCard.frontImage && (
                <img
                  className="st-card-img"
                  src={currentCard.frontImage}
                  alt="Picture on the question side"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage({ src: currentCard.frontImage!, title: 'Question picture' });
                  }}
                />
              )}
            </>
          ) : (
            <>
              {currentCard.front && (
                <div className="st-card-q-small">
                  <RichCardContent content={currentCard.front} showClozeAnswers={true} className="st-card-q-small" />
                </div>
              )}
              {currentCard.back && (
                <div className="st-card-a">
                  <RichCardContent content={currentCard.back} showClozeAnswers={true} className="" />
                </div>
              )}
              {currentCard.backImage && (
                <img
                  className="st-card-img"
                  src={currentCard.backImage}
                  alt="Picture on the answer side"
                  onClick={() => setLightboxImage({ src: currentCard.backImage!, title: 'Answer picture' })}
                />
              )}
              {(currentCard.medicalMeta?.takeaway || currentCard.medicalMeta?.clinicalPearl) && (
                <p className="st-card-note">
                  <strong>Remember: </strong>
                  {currentCard.medicalMeta.takeaway || currentCard.medicalMeta.clinicalPearl}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="st-answer">
        {!isFlipped ? (
          <>
            <button className="st-btn st-btn-primary st-btn-lg st-btn-block" onClick={handleFlip}>
              Show answer
            </button>
            <p className="st-hint">
              Try to remember first. Then tap the card or press <span className="st-kbd">Space</span>
            </p>
          </>
        ) : (
          <>
            {isPractice && (
              <p className="st-tip" role="note">
                <Info size={18} style={{ flex: 'none', marginTop: 2 }} />
                <span>Practice round: this card isn’t due yet, so your answer won’t change its schedule.</span>
              </p>
            )}
            {showTip && !isPractice && (
              <div className="st-tip" role="note">
                <Info size={18} style={{ flex: 'none', marginTop: 2 }} />
                <span>
                  How well did you remember it? Your answer decides when this card comes back. The time under each button
                  is when you’ll see it next.
                </span>
                <button className="st-ghost" onClick={dismissTip}>Got it</button>
              </div>
            )}
            <div className="st-rates" role="group" aria-label="How well did you remember it?">
              {RATES.map((r) => (
                <button
                  key={r.rating}
                  className="st-rate"
                  style={{ background: r.bg }}
                  onClick={() => handleRating(r.rating)}
                  aria-label={isPractice ? `${r.label}: ${r.meaning}` : `${r.label}: ${r.meaning}. Next review in ${previews[r.key]}`}
                  title={`${r.meaning} (key ${r.rating})`}
                >
                  <b>{r.label}</b>
                  <small>{isPractice ? r.meaning : previews[r.key]}</small>
                </button>
              ))}
            </div>
            <p className="st-hint">
              Keys <span className="st-kbd">1</span>–<span className="st-kbd">4</span>, or <span className="st-kbd">Space</span> for Good
            </p>
          </>
        )}
      </div>

      <ImageLightboxModal
        isOpen={!!lightboxImage}
        src={lightboxImage?.src || null}
        title={lightboxImage?.title || 'Picture'}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};
