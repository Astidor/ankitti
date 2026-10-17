import React, { useState, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
  RotateCcw, 
  ChevronLeft, 
  Flag, 
  Edit3, 
  Sparkles, 
  Award,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ZoomIn,
  HelpCircle
} from 'lucide-react';
import { Card, Deck } from '../../types/anki';
import { answerCard, getIntervalPreviews } from '../../services/scheduler';
import { sounds } from '../../services/audio';
import { KittyBow, AestheticMascot } from '../common/KittyIllustrations';
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
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [studiedCount, setStudiedCount] = useState<number>(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const [revealedClozeHints, setRevealedClozeHints] = useState<Record<string, boolean>>({});
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  // Build the review queue based on filter mode
  const buildQueue = useCallback((mode: StudyFilterMode) => {
    const now = Date.now();
    let selected: Card[] = [];

    if (mode === 'due') {
      selected = cards.filter(c => c.due <= now || c.state === 'new' || c.state === 'learning');
      // If 0 cards are due, gracefully offer all cards in relearn mode
      if (selected.length === 0) {
        selected = [...cards];
      }
    } else if (mode === 'all') {
      selected = [...cards];
    } else if (mode === 'flagged') {
      selected = cards.filter(c => c.flagged);
      if (selected.length === 0) selected = [...cards];
    } else if (mode === 'highYield') {
      selected = cards.filter(c => c.medicalMeta?.highYield || (c.tags && c.tags.some(t => t.toLowerCase().includes('high'))));
      if (selected.length === 0) selected = [...cards];
    }

    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsCompleted(shuffled.length === 0);
  }, [cards]);

  useEffect(() => {
    buildQueue(filterMode);
  }, [buildQueue, filterMode]);

  const currentCard = queue[currentCardIndex] || null;

  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setIsFlipped(prev => !prev);
  }, []);

  const handleRating = useCallback((rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;

    sounds.playRating(rating);
    const updated = answerCard(currentCard, rating, deck.settings);
    onUpdateCard(updated, rating);
    setStudiedCount(prev => prev + 1);

    // If rated Again (1), re-insert near the end of session for reinforcement
    if (rating === 1) {
      setQueue(prev => {
        const nextQueue = [...prev];
        const current = nextQueue.splice(currentCardIndex, 1)[0];
        const insertIdx = Math.min(nextQueue.length, currentCardIndex + 3);
        nextQueue.splice(insertIdx, 0, current);
        return nextQueue;
      });
      setIsFlipped(false);
    } else {
      if (currentCardIndex + 1 < queue.length) {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
        setRevealedClozeHints({});
      } else {
        setIsCompleted(true);
        sounds.playCelebration();
      }
    }
  }, [currentCard, currentCardIndex, deck.settings, onUpdateCard, queue.length]);

  // Keyboard shortcut listener: Space to flip, 1-4 for ratings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped) {
          handleFlip();
        } else {
          handleRating(3);
        }
      } else if (isFlipped) {
        if (e.key === '1') handleRating(1);
        if (e.key === '2') handleRating(2);
        if (e.key === '3') handleRating(3);
        if (e.key === '4') handleRating(4);
      }

      if (e.key.toLowerCase() === 'e' && currentCard) {
        onEditCard(currentCard);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, handleFlip, handleRating, isCompleted, isFlipped, onEditCard]);

  // Cloze renderer
  const renderCloze = (text: string, showAnswers: boolean) => {
    if (!text) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\{\{c\d+::(.*?)(?:::([^\}]+))?\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>
        );
      }

      const answer = match[1];
      const hint = match[2];
      const clozeKey = `cloze-${match.index}`;
      const isHintRevealed = revealedClozeHints[clozeKey];

      if (showAnswers) {
        parts.push(
          <span key={clozeKey} className="cloze-active mx-1 text-sm md:text-base font-bold">
            {answer}
          </span>
        );
      } else {
        parts.push(
          <button
            key={clozeKey}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setRevealedClozeHints(prev => ({ ...prev, [clozeKey]: !prev[clozeKey] }));
            }}
            className="cloze-badge mx-1 text-sm md:text-base hover:bg-pink-200 transition-colors"
            title="Click to toggle hint"
          >
            {isHintRevealed ? `[Hint: ${hint || answer.substring(0, 2) + '...'}]` : (hint ? `[... ${hint} ...]` : '[...]')}
          </button>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>;
  };

  const previews = currentCard ? getIntervalPreviews(currentCard, deck.settings) : {
    again: '< 10m',
    hard: '12h',
    good: '1d',
    easy: '4d',
  };

  const handleRelearn = (mode: StudyFilterMode) => {
    sounds.playClick();
    setFilterMode(mode);
    buildQueue(mode);
    setIsCompleted(false);
  };

  // Progress Calculation
  const progressPercent = queue.length > 0 
    ? Math.round((currentCardIndex / queue.length) * 100) 
    : 100;

  // COMPLETION SCREEN WITH CELEBRATE MASCOT & UNLIMITED RELEARN
  if (isCompleted || !currentCard) {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));

    return (
      <div className="flex flex-col items-center justify-center min-h-[520px] p-6 text-center animate-in fade-in duration-300">
        
        {/* Celebrate Mascot Art with Floating Bounce */}
        <div className="w-48 h-48 mb-4 relative flex items-center justify-center mascot-float">
          <AestheticMascot pose="celebrate" className="w-full h-full object-contain" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
          <KittyBow size={16} />
          <span>Deck Mastered 🎀</span>
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Splendid Job! Session Complete 🎉
        </h2>
        
        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed font-medium">
          You finished this review for <strong className="text-[#ff3366] font-bold">{deck.name}</strong>.
          Remember: in Ankitti you can <strong className="text-slate-900">repeat or relearn your deck anytime</strong> without waiting for tomorrow!
        </p>

        {/* Session Stats */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
          <div className="bg-white border-2 border-pink-200/90 p-4 rounded-3xl shadow-xs">
            <div className="text-3xl font-black text-[#ff3366]">{studiedCount}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Cards Reviewed</div>
          </div>
          <div className="bg-white border-2 border-pink-200/90 p-4 rounded-3xl shadow-xs">
            <div className="text-3xl font-black text-emerald-600">{elapsedMinutes}m</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Study Duration</div>
          </div>
        </div>

        {/* Immediate Relearn Options */}
        <div className="w-full max-w-md bg-white border-2 border-pink-200 p-5 rounded-[28px] shadow-sm mb-6 space-y-3">
          <span className="text-xs font-black text-slate-700 block text-left flex items-center space-x-1.5">
            <RotateCcw size={14} className="text-[#ff3366]" />
            <span>Decide When to Relearn (Repeat Anytime)</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => handleRelearn('all')}
              className="px-4 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center space-x-2 border border-pink-200 transition-all ios-btn"
            >
              <RotateCcw size={14} />
              <span>🔁 Relearn All ({cards.length})</span>
            </button>

            <button
              onClick={() => handleRelearn('highYield')}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center space-x-2 border border-rose-200 transition-all ios-btn"
            >
              <Zap size={14} />
              <span>⚡ High Priority</span>
            </button>

            <button
              onClick={() => handleRelearn('flagged')}
              className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center space-x-2 border border-amber-200 transition-all ios-btn sm:col-span-2"
            >
              <Flag size={14} />
              <span>⭐ Relearn Flagged Cards</span>
            </button>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-colors ios-btn"
        >
          <ChevronLeft size={16} />
          <span>Return to Decks</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-2xl w-full mx-auto px-4 py-2 select-none">
      
      {/* Top iOS Navigation Bar */}
      <div className="flex items-center justify-between py-2 mb-3 gap-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-pink-600 transition-colors px-3 py-1.5 rounded-full bg-white/90 border border-pink-200 shadow-xs ios-btn"
        >
          <ChevronLeft size={16} />
          <span>Decks</span>
        </button>

        {/* Study Mode Filter */}
        <div className="flex items-center bg-pink-100/70 p-1 rounded-full border border-pink-200 text-xs font-bold shadow-xs">
          <button
            onClick={() => handleRelearn('due')}
            className={`px-3 py-1 rounded-full transition-all ${
              filterMode === 'due' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Due
          </button>
          <button
            onClick={() => handleRelearn('all')}
            className={`px-3 py-1 rounded-full transition-all flex items-center space-x-1 ${
              filterMode === 'all' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Repeat All</span>
          </button>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEditCard(currentCard)}
            className="p-2 rounded-full text-slate-500 hover:text-pink-600 hover:bg-white transition-colors ios-btn"
            title="Edit Card (E)"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => {
              currentCard.flagged = !currentCard.flagged;
              onUpdateCard({ ...currentCard }, 3);
            }}
            className={`p-2 rounded-full transition-colors ios-btn ${
              currentCard.flagged ? 'text-amber-500 bg-amber-50' : 'text-slate-500 hover:text-amber-500 hover:bg-white'
            }`}
            title="Toggle Flag"
          >
            <Flag size={15} fill={currentCard.flagged ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* iOS Progress Bar */}
      <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden mb-4 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-pink-400 to-[#ff3366] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Naturally-Sized Flashcard Frame (NO ABSOLUTE INSET OVERFLOW BUG!) */}
      <div 
        onClick={handleFlip}
        className="w-full cursor-pointer select-none transition-all duration-200"
        title="Click anywhere or press Space to flip"
      >
        {!isFlipped ? (
          /* CARD FRONT FACE */
          <div className="w-full min-h-[360px] bg-white/95 rounded-[32px] border-2 border-pink-200 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:border-pink-300 hover:shadow-lg transition-all animate-in fade-in duration-200">
            {/* Front Header */}
            <div className="flex items-center justify-between text-xs pb-4 border-b border-pink-50">
              <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200/80 font-extrabold flex items-center space-x-1.5">
                <span>{deck.name}</span>
              </span>
              <KittyBow size={24} className="hover:scale-110 transition-transform" />
            </div>

            {/* Front Question Body */}
            <div className="my-auto py-6 text-center space-y-4">
              <RichCardContent
                content={currentCard.front}
                showClozeAnswers={false}
                className="text-xl sm:text-2xl font-black text-slate-800 leading-snug tracking-tight text-center"
              />
            </div>

            {/* Front Screenshot Attachment */}
            {currentCard.frontImage && (
              <div className="flex justify-center pt-2">
                <div 
                  className="relative group cursor-zoom-in inline-block rounded-2xl overflow-hidden border border-pink-200/80 shadow-xs hover:border-pink-400 transition-all max-w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage({ src: currentCard.frontImage!, title: 'Front Diagram / Screenshot' });
                  }}
                  title="Click to view full size"
                >
                  <img 
                    src={currentCard.frontImage} 
                    alt="Front Diagram / Screenshot" 
                    className="max-h-60 sm:max-h-72 max-w-full rounded-2xl object-contain bg-pink-50/20" 
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-white/95 text-slate-800 text-[11px] font-bold shadow-md flex items-center space-x-1">
                      <ZoomIn size={13} />
                      <span>Click to Expand</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Front Footer */}
          <div className="flex items-center justify-between text-xs text-pink-500 font-bold border-t border-pink-100/80 pt-3.5 mt-4">
            <span className="text-slate-500 font-medium">Card {currentCardIndex + 1} of {queue.length}</span>
            <span className="flex items-center space-x-1 bg-pink-50 px-2.5 py-1 rounded-full text-pink-700 border border-pink-200/60">
              <span>Space to Flip</span>
              <KittyBow size={13} />
            </span>
          </div>
        </div>
      ) : (
        /* CARD BACK FACE */
        <div className="w-full min-h-[360px] bg-[#fffdfd] rounded-[32px] border-2 border-rose-300 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all animate-in fade-in duration-200">
          {/* Back Header */}
          <div className="flex items-center justify-between text-xs pb-4 border-b border-rose-100">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-extrabold flex items-center space-x-1.5">
              <span>Answer & Insights</span>
            </span>
            <KittyBow size={24} />
          </div>

          {/* Back Body (Scroll-safe, dynamic height, never clipped!) */}
          <div className="my-auto py-5 space-y-4">
            {/* Question prompt badge */}
            {(currentCard.front || currentCard.frontImage) && (
              <div className="p-3 sm:p-3.5 bg-pink-50/60 rounded-2xl border border-pink-100 text-xs text-slate-600 font-medium leading-relaxed">
                <span className="font-extrabold text-pink-700 block text-[10px] uppercase tracking-wider mb-1">
                  Question
                </span>
                {currentCard.front ? (
                  <RichCardContent
                    content={currentCard.front}
                    showClozeAnswers={true}
                    className="line-clamp-3 text-xs sm:text-sm text-slate-700 font-medium"
                  />
                ) : (
                  <span className="text-xs text-slate-500 italic">🖼️ [Image Flashcard]</span>
                )}
              </div>
            )}

            {/* Answer Content */}
            {currentCard.back && (
              <div className="text-base sm:text-xl text-slate-900 leading-relaxed font-medium">
                <RichCardContent
                  content={currentCard.back}
                  showClozeAnswers={true}
                  className="text-base sm:text-xl text-slate-900 leading-relaxed font-medium"
                />
              </div>
            )}

              {/* Back Screenshot Attachment */}
              {currentCard.backImage && (
                <div className="flex justify-center pt-2">
                  <div 
                    className="relative group cursor-zoom-in inline-block rounded-2xl overflow-hidden border border-rose-200 shadow-xs hover:border-rose-400 transition-all max-w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ src: currentCard.backImage!, title: 'Back Diagram / Screenshot' });
                    }}
                    title="Click to view full size"
                  >
                    <img 
                      src={currentCard.backImage} 
                      alt="Back Diagram / Screenshot" 
                      className="max-h-60 sm:max-h-72 max-w-full rounded-2xl object-contain bg-pink-50/20" 
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-slate-800 text-[11px] font-bold shadow-md flex items-center space-x-1">
                        <ZoomIn size={13} />
                        <span>Click to Expand</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Takeaway / Concept Note Box (Contained inside card body, guaranteed no collision!) */}
              {(currentCard.medicalMeta?.takeaway || currentCard.medicalMeta?.clinicalPearl) && (
                <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50/70 rounded-2xl border border-pink-200/90 text-xs sm:text-sm text-pink-950 flex items-start space-x-3 shadow-xs">
                  <Award size={18} className="text-[#ff3366] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-extrabold text-[#be123c] block text-[10px] uppercase tracking-wider mb-1">
                      💡 High-Yield Concept Note
                    </strong>
                    <span className="leading-relaxed font-medium">
                      {currentCard.medicalMeta.takeaway || currentCard.medicalMeta.clinicalPearl}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between text-xs text-rose-500 font-bold border-t border-rose-100 pt-3.5 mt-4">
              <span className="text-slate-500 font-medium">Card {currentCardIndex + 1} of {queue.length}</span>
              <span>Rate recall below (Keys 1-4)</span>
            </div>
          </div>
        )}
      </div>

      {/* iOS Rating Controls Toolbar (Separate, well-spaced, guaranteed unhidden!) */}
      <div className="mt-5 pb-safe">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full h-14 rounded-2xl bg-[#ff3366] active:bg-[#e11d48] text-white font-black shadow-md active:shadow-sm transition-all text-sm flex items-center justify-center space-x-2 ios-btn cursor-pointer"
          >
            <RotateCw size={18} />
            <span>Show Answer (Tap to Flip)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 text-center tracking-wider uppercase">
              How well did you remember this?
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
              {/* Again (1) */}
              <button
                onClick={() => handleRating(1)}
                className="relative py-2.5 sm:py-3.5 px-1 sm:px-2 min-h-[56px] rounded-2xl bg-rose-50/80 hover:bg-rose-100 text-rose-800 border-2 border-rose-200/90 font-bold transition-all text-center ios-btn shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
                title="Rating: Again (Shortcut: 1)"
              >
                <span className="hidden sm:inline-block absolute top-1 right-1.5 text-[9px] font-mono text-rose-400 bg-white/90 px-1 rounded border border-rose-200/60 font-bold">1</span>
                <div className="text-[10px] sm:text-xs text-rose-600 uppercase tracking-wider font-black">Again</div>
                <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-700 mt-0.5">{previews.again}</div>
              </button>

              {/* Hard (2) */}
              <button
                onClick={() => handleRating(2)}
                className="relative py-2.5 sm:py-3.5 px-1 sm:px-2 min-h-[56px] rounded-2xl bg-amber-50/80 hover:bg-amber-100 text-amber-900 border-2 border-amber-200/90 font-bold transition-all text-center ios-btn shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
                title="Rating: Hard (Shortcut: 2)"
              >
                <span className="hidden sm:inline-block absolute top-1 right-1.5 text-[9px] font-mono text-amber-500 bg-white/90 px-1 rounded border border-amber-200/60 font-bold">2</span>
                <div className="text-[10px] sm:text-xs text-amber-700 uppercase tracking-wider font-black">Hard</div>
                <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-700 mt-0.5">{previews.hard}</div>
              </button>

              {/* Good (3) */}
              <button
                onClick={() => handleRating(3)}
                className="relative py-2.5 sm:py-3.5 px-1 sm:px-2 min-h-[56px] rounded-2xl bg-pink-100 hover:bg-pink-200/80 text-pink-900 border-2 border-pink-400 font-bold transition-all text-center ios-btn shadow-sm active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
                title="Rating: Good (Shortcut: 3 or Space)"
              >
                <span className="hidden sm:inline-block absolute top-1 right-1.5 text-[9px] font-mono text-pink-600 bg-white/90 px-1 rounded border border-pink-300 font-bold">3</span>
                <div className="text-[10px] sm:text-xs text-pink-700 uppercase tracking-wider font-black">Good</div>
                <div className="text-[11px] sm:text-xs font-mono font-bold text-pink-950 mt-0.5">{previews.good}</div>
              </button>

              {/* Easy (4) */}
              <button
                onClick={() => handleRating(4)}
                className="relative py-2.5 sm:py-3.5 px-1 sm:px-2 min-h-[56px] rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-200/90 font-bold transition-all text-center ios-btn shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
                title="Rating: Easy (Shortcut: 4)"
              >
                <span className="hidden sm:inline-block absolute top-1 right-1.5 text-[9px] font-mono text-emerald-500 bg-white/90 px-1 rounded border border-emerald-200/60 font-bold">4</span>
                <div className="text-[10px] sm:text-xs text-emerald-700 uppercase tracking-wider font-black">Easy</div>
                <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-700 mt-0.5">{previews.easy}</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!lightboxImage}
        src={lightboxImage?.src || null}
        title={lightboxImage?.title || 'Diagram Preview'}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};
