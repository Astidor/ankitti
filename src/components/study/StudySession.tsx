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
  ZoomIn,
  Sparkles,
  ArrowRight
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

  // Build review queue based on filter mode
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

    if (rating === 1) {
      setQueue(prev => {
        const nextQueue = [...prev];
        const current = nextQueue.splice(currentCardIndex, 1)[0];
        const reinsertPos = Math.min(nextQueue.length, currentCardIndex + 3);
        nextQueue.splice(reinsertPos, 0, current);
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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped) {
          handleFlip();
        } else {
          handleRating(3); // Default space rating = Good
        }
      } else if (isFlipped) {
        if (e.key === '1') handleRating(1);
        else if (e.key === '2') handleRating(2);
        else if (e.key === '3') handleRating(3);
        else if (e.key === '4') handleRating(4);
      } else if (e.key.toLowerCase() === 'e' && currentCard) {
        e.preventDefault();
        onEditCard(currentCard);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleFlip, handleRating, currentCard, onEditCard]);

  const handleRelearn = (mode: StudyFilterMode) => {
    sounds.playClick();
    setFilterMode(mode);
    buildQueue(mode);
  };

  const cleanDeckTitle = (name: string) => {
    return name
      .replace(/^(\p{Extended_Pictographic}|\p{Regional_Indicator}{2})\s*/u, '')
      .replace(/^(JP|ES|CS:?)\s*/i, '')
      .trim() || name;
  };

  const previews = currentCard
    ? getIntervalPreviews(currentCard, deck.settings)
    : { again: '<10m', hard: '1d', good: '2d', easy: '4d' };

  const progressPercent = queue.length > 0 ? (currentCardIndex / queue.length) * 100 : 100;
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));

  // 🌸 CELEBRATION COMPLETION VIEW 🌸
  if (isCompleted || queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 max-w-lg mx-auto text-center animate-fadeIn select-none">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-[#EAE4DC] p-2 mb-4 shadow-subtle flex items-center justify-center">
          <img 
            src="/assets/celebrate_mascot.png" 
            alt="Celebrate" 
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-matcha-50 text-matcha-700 text-xs font-semibold mb-2 border border-matcha-200">
          <CheckCircle2 size={13} className="text-matcha-600" />
          <span>Session Finished!</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-cocoa-900 tracking-tight">
          Otsukaresama! 🌸
        </h2>
        <p className="text-xs text-cocoa-500 mt-1 max-w-sm leading-relaxed">
          You finished studying <strong className="text-cocoa-800">{cleanDeckTitle(deck.name)}</strong>. Memory intervals updated smoothly.
        </p>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 w-full my-5">
          <div className="p-3.5 bg-white rounded-xl border border-[#EAE4DC] shadow-subtle text-center">
            <div className="text-2xl font-extrabold text-cocoa-900">{studiedCount}</div>
            <div className="text-[11px] font-medium text-cocoa-500 mt-0.5">Cards Reviewed</div>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#EAE4DC] shadow-subtle text-center">
            <div className="text-2xl font-extrabold text-matcha-600">{elapsedMinutes}m</div>
            <div className="text-[11px] font-medium text-cocoa-500 mt-0.5">Focus Duration</div>
          </div>
        </div>

        {/* Drill & Relearn Actions */}
        <div className="w-full bg-white border border-[#EAE4DC] p-4 rounded-2xl shadow-subtle mb-5 space-y-2.5">
          <span className="text-xs font-bold text-cocoa-900 block text-left">
            Drill & Relearn Anytime
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleRelearn('all')}
              className="px-3 py-2 rounded-xl bg-cocoa-50 hover:bg-cocoa-100 text-cocoa-800 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-[#EAE4DC] transition-colors cursor-pointer"
            >
              <RotateCcw size={12} className="text-strawberry-500" />
              <span>Review All ({cards.length})</span>
            </button>

            <button
              onClick={() => handleRelearn('highYield')}
              className="px-3 py-2 rounded-xl bg-cocoa-50 hover:bg-cocoa-100 text-cocoa-800 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-[#EAE4DC] transition-colors cursor-pointer"
            >
              <Zap size={12} className="text-amber-500" />
              <span>High Yield Only</span>
            </button>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl bg-cocoa-900 hover:bg-cocoa-800 text-white font-semibold text-xs shadow-subtle flex items-center justify-center space-x-1.5 transition-all atelier-btn cursor-pointer"
        >
          <ChevronLeft size={15} />
          <span>Back to Decks</span>
        </button>
      </div>
    );
  }

  // 🌸 ACTIVE STUDY CARD ROOM 🌸
  return (
    <div className="flex flex-col max-w-2xl w-full mx-auto px-2 sm:px-4 select-none">
      
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between pb-3 mb-2 gap-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs font-semibold text-cocoa-600 hover:text-cocoa-900 px-3 py-1.5 rounded-xl bg-white border border-[#EAE4DC] hover:border-strawberry-200 transition-colors shadow-2xs atelier-btn cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Decks</span>
        </button>

        {/* Deck Title in Center */}
        <div className="flex items-center space-x-1.5 text-xs font-bold text-cocoa-900 truncate">
          <KittyBow size={14} />
          <span className="truncate max-w-[180px] sm:max-w-xs">{cleanDeckTitle(deck.name)}</span>
        </div>

        {/* Action / Edit */}
        <div className="flex items-center space-x-1.5">
          <div className="hidden sm:inline-flex items-center p-0.5 bg-cocoa-100/70 rounded-lg border border-[#EAE4DC] text-[11px] font-semibold">
            <button
              onClick={() => handleRelearn('due')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                filterMode === 'due' ? 'bg-white text-strawberry-700 shadow-2xs' : 'text-cocoa-500 hover:text-cocoa-800'
              }`}
            >
              Due
            </button>
            <button
              onClick={() => handleRelearn('all')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-white text-strawberry-700 shadow-2xs' : 'text-cocoa-500 hover:text-cocoa-800'
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={() => onEditCard(currentCard)}
            className="p-1.5 rounded-xl bg-white border border-[#EAE4DC] text-cocoa-500 hover:text-cocoa-900 hover:border-strawberry-200 transition-colors shadow-2xs atelier-btn cursor-pointer"
            title="Edit Card (E)"
          >
            <Edit3 size={13} />
          </button>
        </div>
      </div>

      {/* Sleek Progress Bar */}
      <div className="w-full bg-cocoa-100 h-1.5 rounded-full overflow-hidden mb-4">
        <div 
          className="bg-strawberry-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 🌸 THE FLASHCARD 🌸 */}
      <div 
        onClick={handleFlip}
        className="w-full cursor-pointer select-none"
        title="Click anywhere on card or press Space to flip"
      >
        {!isFlipped ? (
          /* CARD FRONT FACE */
          <div className="w-full min-h-[360px] bg-white rounded-2xl border border-[#EAE4DC] hover:border-strawberry-200 shadow-card p-6 sm:p-8 flex flex-col justify-between transition-all duration-200">
            
            {/* Front Header */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#EAE4DC]">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[11px] px-2.5 py-0.5 rounded-full bg-strawberry-50 text-strawberry-700 border border-strawberry-100">
                  {currentCard.type === 'cloze' ? 'Cloze Deletion' : 'Question'}
                </span>
                {currentCard.state && (
                  <span className="text-[10px] font-medium text-cocoa-400 font-mono uppercase">
                    {currentCard.state}
                  </span>
                )}
              </div>
              <KittyBow size={16} />
            </div>

            {/* Front Content */}
            <div className="my-auto py-6 text-center">
              <div className="text-lg sm:text-2xl text-cocoa-900 leading-relaxed font-bold">
                <RichCardContent
                  content={currentCard.front || (currentCard.frontImage ? '' : '*(No question provided)*')}
                  showClozeAnswers={false}
                  className="text-lg sm:text-2xl text-cocoa-900 leading-relaxed font-bold"
                />
              </div>

              {/* Front Screenshot Attachment */}
              {currentCard.frontImage && (
                <div className="flex justify-center pt-4">
                  <div 
                    className="relative group cursor-zoom-in inline-block rounded-xl overflow-hidden border border-[#EAE4DC] shadow-2xs hover:border-strawberry-300 transition-all max-w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ src: currentCard.frontImage!, title: 'Question Diagram' });
                    }}
                    title="Click to view full size"
                  >
                    <img 
                      src={currentCard.frontImage} 
                      alt="Front Attachment" 
                      className="max-h-60 sm:max-h-72 max-w-full rounded-xl object-contain bg-cocoa-50" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-cocoa-900 text-xs font-bold shadow-md flex items-center space-x-1">
                        <ZoomIn size={13} />
                        <span>Zoom</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between text-xs text-cocoa-400 font-medium border-t border-[#EAE4DC] pt-3 mt-4">
              <span>Card {currentCardIndex + 1} of {queue.length}</span>
              <span className="text-[11px] text-cocoa-500 font-medium">
                Tap card or press Space to flip
              </span>
            </div>
          </div>
        ) : (
          /* CARD BACK FACE */
          <div className="w-full min-h-[360px] bg-white rounded-2xl border border-strawberry-200 shadow-card p-6 sm:p-8 flex flex-col justify-between transition-all animate-fadeIn">
            
            {/* Back Header */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#EAE4DC]">
              <span className="text-strawberry-600 font-bold text-xs flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-strawberry-500" />
                <span>Answer</span>
              </span>
              <KittyBow size={16} />
            </div>

            {/* Back Body */}
            <div className="my-auto py-4 space-y-3">
              {/* Question prompt badge */}
              {(currentCard.front || currentCard.frontImage) && (
                <div className="p-3 bg-cocoa-50 rounded-xl border border-[#EAE4DC] text-xs text-cocoa-600 leading-relaxed text-left">
                  <span className="font-semibold text-cocoa-400 block text-[10px] uppercase tracking-wider mb-0.5">
                    Question
                  </span>
                  {currentCard.front ? (
                    <RichCardContent
                      content={currentCard.front}
                      showClozeAnswers={true}
                      className="line-clamp-2 text-xs sm:text-sm text-cocoa-900 font-medium"
                    />
                  ) : (
                    <span className="text-xs text-cocoa-400 italic">[Image Card]</span>
                  )}
                </div>
              )}

              {/* Answer Content */}
              {currentCard.back && (
                <div className="text-base sm:text-xl text-cocoa-900 leading-relaxed font-bold text-left">
                  <RichCardContent
                    content={currentCard.back}
                    showClozeAnswers={true}
                    className="text-base sm:text-xl text-cocoa-900 leading-relaxed font-bold"
                  />
                </div>
              )}

              {/* Back Image Attachment */}
              {currentCard.backImage && (
                <div className="flex justify-center pt-2">
                  <div 
                    className="relative group cursor-zoom-in inline-block rounded-xl overflow-hidden border border-[#EAE4DC] shadow-2xs hover:border-strawberry-300 transition-all max-w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ src: currentCard.backImage!, title: 'Back Diagram' });
                    }}
                    title="Click to view full size"
                  >
                    <img 
                      src={currentCard.backImage} 
                      alt="Back Attachment" 
                      className="max-h-60 sm:max-h-72 max-w-full rounded-xl object-contain bg-cocoa-50" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-cocoa-900 text-xs font-bold shadow-md flex items-center space-x-1">
                        <ZoomIn size={13} />
                        <span>Zoom</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Takeaway / Concept Note Box */}
              {(currentCard.medicalMeta?.takeaway || currentCard.medicalMeta?.clinicalPearl) && (
                <div className="p-3 bg-honey-50 rounded-xl border border-honey-200 text-xs text-honey-900 flex items-start space-x-2 text-left">
                  <Award size={15} className="text-honey-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold text-honey-800 block text-[10px] uppercase tracking-wider mb-0.5">
                      Key Concept
                    </strong>
                    <span className="leading-relaxed font-medium">
                      {currentCard.medicalMeta.takeaway || currentCard.medicalMeta.clinicalPearl}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between text-xs text-cocoa-400 font-medium border-t border-[#EAE4DC] pt-3 mt-4">
              <span>Card {currentCardIndex + 1} of {queue.length}</span>
              <span>Rate recall below (Keys 1-4)</span>
            </div>
          </div>
        )}
      </div>

      {/* 🌸 RATING BAR CONTROLS 🌸 */}
      <div className="mt-4 pb-safe">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full py-3 rounded-xl bg-cocoa-900 hover:bg-cocoa-800 active:scale-98 text-white font-semibold text-xs shadow-subtle transition-all flex items-center justify-center space-x-2 atelier-btn cursor-pointer"
          >
            <span>Show Answer</span>
            <kbd className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">Space</kbd>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              
              {/* Again (1) */}
              <button
                onClick={() => handleRating(1)}
                className="py-2.5 sm:py-3 px-2 rounded-xl bg-strawberry-50 hover:bg-strawberry-100 text-strawberry-800 border border-strawberry-200 font-semibold transition-all text-center atelier-btn shadow-2xs active:scale-95 cursor-pointer flex flex-col items-center justify-center"
                title="Rating: Again (Shortcut: 1)"
              >
                <div className="text-xs font-bold">Again</div>
                <div className="text-[11px] font-mono font-medium text-strawberry-600 mt-0.5">{previews.again}</div>
              </button>

              {/* Hard (2) */}
              <button
                onClick={() => handleRating(2)}
                className="py-2.5 sm:py-3 px-2 rounded-xl bg-honey-50 hover:bg-honey-100 text-honey-800 border border-honey-200 font-semibold transition-all text-center atelier-btn shadow-2xs active:scale-95 cursor-pointer flex flex-col items-center justify-center"
                title="Rating: Hard (Shortcut: 2)"
              >
                <div className="text-xs font-bold">Hard</div>
                <div className="text-[11px] font-mono font-medium text-honey-600 mt-0.5">{previews.hard}</div>
              </button>

              {/* Good (3) */}
              <button
                onClick={() => handleRating(3)}
                className="py-2.5 sm:py-3 px-2 rounded-xl bg-matcha-50 hover:bg-matcha-100 text-matcha-800 border border-matcha-200 font-semibold transition-all text-center atelier-btn shadow-2xs active:scale-95 cursor-pointer flex flex-col items-center justify-center"
                title="Rating: Good (Shortcut: 3 or Space)"
              >
                <div className="text-xs font-bold">Good</div>
                <div className="text-[11px] font-mono font-medium text-matcha-600 mt-0.5">{previews.good}</div>
              </button>

              {/* Easy (4) */}
              <button
                onClick={() => handleRating(4)}
                className="py-2.5 sm:py-3 px-2 rounded-xl bg-taro-50 hover:bg-taro-100 text-taro-800 border border-taro-200 font-semibold transition-all text-center atelier-btn shadow-2xs active:scale-95 cursor-pointer flex flex-col items-center justify-center"
                title="Rating: Easy (Shortcut: 4)"
              >
                <div className="text-xs font-bold">Easy</div>
                <div className="text-[11px] font-mono font-medium text-taro-600 mt-0.5">{previews.easy}</div>
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
