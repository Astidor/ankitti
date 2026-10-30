import React, { useState, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
  RotateCcw, 
  ChevronLeft, 
  Flag, 
  Edit3, 
  Award,
  Zap,
  CheckCircle2,
  ZoomIn
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
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  // Build the review queue based on filter mode
  const buildQueue = useCallback((mode: StudyFilterMode) => {
    const now = Date.now();
    let selected: Card[] = [];

    if (mode === 'due') {
      selected = cards.filter(c => c.due <= now || c.state === 'new' || c.state === 'learning');
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
    ? Math.round(((currentCardIndex + 1) / queue.length) * 100) 
    : 100;

  // COMPLETION SCREEN
  if (isCompleted || !currentCard) {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-fadeIn max-w-xl mx-auto">
        {/* Mascot Art */}
        <div className="w-36 h-36 mb-4 relative flex items-center justify-center">
          <AestheticMascot pose="celebrate" className="w-full h-full object-contain" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>Session Complete</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Great Job!
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mb-6 leading-relaxed font-normal">
          You finished studying cards for <strong className="text-slate-900 font-bold">{deck.name}</strong>. Your memory intervals have been safely updated.
        </p>

        {/* Session Stats */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-2xl font-extrabold text-rose-500">{studiedCount}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Cards Reviewed</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <div className="text-2xl font-extrabold text-emerald-600">{elapsedMinutes}m</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Study Duration</div>
          </div>
        </div>

        {/* Relearn Options */}
        <div className="w-full bg-white border border-slate-200 p-4 rounded-2xl shadow-xs mb-6 space-y-2.5">
          <span className="text-xs font-semibold text-slate-700 block text-left">
            Continue Practice
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleRelearn('all')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs flex items-center justify-center space-x-1.5 border border-slate-200 transition-all ios-btn cursor-pointer"
            >
              <RotateCcw size={13} className="text-slate-500" />
              <span>Review All ({cards.length})</span>
            </button>

            <button
              onClick={() => handleRelearn('highYield')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs flex items-center justify-center space-x-1.5 border border-slate-200 transition-all ios-btn cursor-pointer"
            >
              <Zap size={13} className="text-amber-500" />
              <span>High Yield Only</span>
            </button>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs flex items-center space-x-2 transition-colors ios-btn cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Return to Decks</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-2xl w-full mx-auto px-4 py-2 select-none">
      
      {/* Top Navigation & Toolbar */}
      <div className="flex items-center justify-between py-2 mb-3 gap-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs ios-btn cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Decks</span>
        </button>

        {/* Study Mode Filter */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium shadow-xs">
          <button
            onClick={() => handleRelearn('due')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'due' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Due
          </button>
          <button
            onClick={() => handleRelearn('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Cards
          </button>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEditCard(currentCard)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors ios-btn cursor-pointer"
            title="Edit Card (E)"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => {
              currentCard.flagged = !currentCard.flagged;
              onUpdateCard({ ...currentCard }, 3);
            }}
            className={`p-1.5 rounded-lg transition-colors ios-btn cursor-pointer ${
              currentCard.flagged ? 'text-amber-500 bg-amber-50 border border-amber-200' : 'text-slate-400 hover:text-amber-500 hover:bg-white'
            }`}
            title="Toggle Flag"
          >
            <Flag size={15} fill={currentCard.flagged ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Modern Progress Bar & Card Counter */}
      <div className="mb-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>{deck.name}</span>
          <span>{currentCardIndex + 1} / {queue.length}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-rose-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Flashcard Frame */}
      <div 
        onClick={handleFlip}
        className="w-full cursor-pointer select-none transition-all duration-200"
        title="Click anywhere or press Space to flip"
      >
        {!isFlipped ? (
          /* CARD FRONT FACE */
          <div className="w-full min-h-[380px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all animate-fadeIn">
            {/* Front Header */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
              <span className="text-slate-500 font-medium text-xs">
                Question
              </span>
              <KittyBow size={18} className="text-rose-400 opacity-60" />
            </div>

            {/* Front Question Body */}
            <div className="my-auto py-6 text-center space-y-4">
              <RichCardContent
                content={currentCard.front}
                showClozeAnswers={false}
                className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight text-center"
              />
            </div>

            {/* Front Screenshot Attachment */}
            {currentCard.frontImage && (
              <div className="flex justify-center pt-2">
                <div 
                  className="relative group cursor-zoom-in inline-block rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:border-slate-400 transition-all max-w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage({ src: currentCard.frontImage!, title: 'Front Diagram / Screenshot' });
                  }}
                  title="Click to view full size"
                >
                  <img 
                    src={currentCard.frontImage} 
                    alt="Front Attachment" 
                    className="max-h-60 sm:max-h-72 max-w-full rounded-xl object-contain bg-slate-50" 
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-white/95 text-slate-800 text-xs font-semibold shadow-md flex items-center space-x-1">
                      <ZoomIn size={13} />
                      <span>Click to Expand</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Front Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-100 pt-3 mt-4">
              <span>Card {currentCardIndex + 1} of {queue.length}</span>
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px]">
                <span>Space to Flip</span>
              </span>
            </div>
          </div>
        ) : (
          /* CARD BACK FACE */
          <div className="w-full min-h-[380px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all animate-fadeIn">
            {/* Back Header */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
              <span className="text-rose-600 font-semibold text-xs flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Answer</span>
              </span>
              <KittyBow size={18} className="text-rose-400 opacity-60" />
            </div>

            {/* Back Body */}
            <div className="my-auto py-5 space-y-4">
              {/* Question prompt badge */}
              {(currentCard.front || currentCard.frontImage) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 font-normal leading-relaxed">
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">
                    Question
                  </span>
                  {currentCard.front ? (
                    <RichCardContent
                      content={currentCard.front}
                      showClozeAnswers={true}
                      className="line-clamp-2 text-xs sm:text-sm text-slate-700 font-medium"
                    />
                  ) : (
                    <span className="text-xs text-slate-500 italic">[Image Flashcard]</span>
                  )}
                </div>
              )}

              {/* Answer Content */}
              {currentCard.back && (
                <div className="text-base sm:text-xl text-slate-900 leading-relaxed font-semibold">
                  <RichCardContent
                    content={currentCard.back}
                    showClozeAnswers={true}
                    className="text-base sm:text-xl text-slate-900 leading-relaxed font-semibold"
                  />
                </div>
              )}

              {/* Back Screenshot Attachment */}
              {currentCard.backImage && (
                <div className="flex justify-center pt-2">
                  <div 
                    className="relative group cursor-zoom-in inline-block rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:border-slate-400 transition-all max-w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ src: currentCard.backImage!, title: 'Back Diagram / Screenshot' });
                    }}
                    title="Click to view full size"
                  >
                    <img 
                      src={currentCard.backImage} 
                      alt="Back Attachment" 
                      className="max-h-60 sm:max-h-72 max-w-full rounded-xl object-contain bg-slate-50" 
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-slate-800 text-xs font-semibold shadow-md flex items-center space-x-1">
                        <ZoomIn size={13} />
                        <span>Click to Expand</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Takeaway / Concept Note Box */}
              {(currentCard.medicalMeta?.takeaway || currentCard.medicalMeta?.clinicalPearl) && (
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start space-x-2.5 shadow-xs">
                  <Award size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-semibold text-amber-900 block text-[10px] uppercase tracking-wider mb-0.5">
                      Key Takeaway
                    </strong>
                    <span className="leading-relaxed font-normal">
                      {currentCard.medicalMeta.takeaway || currentCard.medicalMeta.clinicalPearl}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-100 pt-3 mt-4">
              <span>Card {currentCardIndex + 1} of {queue.length}</span>
              <span>Rate recall below (Keys 1-4)</span>
            </div>
          </div>
        )}
      </div>

      {/* Rating Controls Toolbar */}
      <div className="mt-4 pb-safe">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold shadow-xs transition-all text-sm flex items-center justify-center space-x-2 ios-btn cursor-pointer"
          >
            <RotateCw size={16} />
            <span>Show Answer (Space)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] font-medium text-slate-500 text-center tracking-wider uppercase">
              How well did you remember this?
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {/* Again (1) */}
              <button
                onClick={() => handleRating(1)}
                className="relative py-2.5 sm:py-3 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-medium transition-all text-center ios-btn shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
                title="Rating: Again (Shortcut: 1)"
              >
                <span className="hidden sm:inline-block absolute top-1 right-1.5 text-[9px] font-mono text-rose-500 bg-white/90 px-1 rounded border border-rose-200">1</span>
                <div className="text-xs text-rose-700 font-bold">Again</div>
                <div className="text-[11px] font-mono font-medium text-slate-600 mt-0.5">{previews.again}</div>
              </button>

              {/* Hard (2) */}
              <button
                onClick={() => handleRating(2)}
                className="relative py-2.5 sm:py-3 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium transition-all text-center ios-btn shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
                title="Rating: Hard (Shortcut: 2)"
              >
                <span className="hidden sm:inline-block absolute top-1 right-1.5 text-[9px] font-mono text-amber-600 bg-white/90 px-1 rounded border border-amber-200">2</span>
                <div className="text-xs text-amber-800 font-bold">Hard</div>
                <div className="text-[11px] font-mono font-medium text-slate-600 mt-0.5">{previews.hard}</div>
              </button>

              {/* Good (3) */}
              <button
                onClick={() => handleRating(3)}
                className="relative py-2.5 sm:py-3 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-400 font-semibold transition-all text-center ios-btn shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
                title="Rating: Good (Shortcut: 3 or Space)"
              >
                <span className="hidden sm:inline-block absolute top-1 right-1.5 text-[9px] font-mono text-emerald-600 bg-white/90 px-1 rounded border border-emerald-300">3</span>
                <div className="text-xs text-emerald-700 font-bold">Good</div>
                <div className="text-[11px] font-mono font-bold text-emerald-950 mt-0.5">{previews.good}</div>
              </button>

              {/* Easy (4) */}
              <button
                onClick={() => handleRating(4)}
                className="relative py-2.5 sm:py-3 px-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-medium transition-all text-center ios-btn shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center group"
                title="Rating: Easy (Shortcut: 4)"
              >
                <span className="hidden sm:inline-block absolute top-1 right-1.5 text-[9px] font-mono text-sky-600 bg-white/90 px-1 rounded border border-sky-200">4</span>
                <div className="text-xs text-sky-800 font-bold">Easy</div>
                <div className="text-[11px] font-mono font-medium text-slate-600 mt-0.5">{previews.easy}</div>
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
