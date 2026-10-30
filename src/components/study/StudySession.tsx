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
  Heart
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
      if (isCompleted || !currentCard) return;

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

  // Progress Percentage
  const progressPercent = queue.length > 0 
    ? Math.round(((currentCardIndex + 1) / queue.length) * 100) 
    : 100;

  // 🌸 COMPLETION CELEBRATION SCREEN 🌸
  if (isCompleted || !currentCard) {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-fadeIn max-w-xl mx-auto select-none">
        {/* Mascot Celebrate Illustration */}
        <div className="w-36 h-36 mb-4 relative flex items-center justify-center animate-bouncyPop">
          <AestheticMascot pose="celebrate" className="w-full h-full object-contain" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-matcha-50 border border-matcha-200 text-matcha-700 text-xs font-bold mb-3 shadow-2xs">
          <CheckCircle2 size={14} className="text-matcha-600" />
          <span>Session Completed ✨</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3E2D28] tracking-tight mb-2">
          Otsukaresama! Great Job! 🌸
        </h2>
        
        <p className="text-xs sm:text-sm text-cocoa-500 max-w-md mb-6 leading-relaxed font-medium">
          You finished all scheduled cards for <strong className="text-[#3E2D28] font-bold">{deck.name}</strong>. Your spaced repetition intervals are locked in.
        </p>

        {/* Bento Recap Metrics */}
        <div className="grid grid-cols-2 gap-3.5 w-full max-w-xs mb-6">
          <div className="bg-white border-2 border-[#FFD1DC] p-4 rounded-3xl shadow-bento">
            <div className="text-3xl font-extrabold text-strawberry-600">{studiedCount}</div>
            <div className="text-[11px] font-bold text-cocoa-500 mt-0.5">Cards Reviewed</div>
          </div>
          <div className="bg-white border-2 border-[#C5ECD2] p-4 rounded-3xl shadow-bento">
            <div className="text-3xl font-extrabold text-matcha-600">{elapsedMinutes}m</div>
            <div className="text-[11px] font-bold text-cocoa-500 mt-0.5">Focus Duration</div>
          </div>
        </div>

        {/* Relearn / Continue Practice Bento Box */}
        <div className="w-full bg-white border border-[#EFE8DE] p-5 rounded-3xl shadow-bento mb-6 space-y-3">
          <span className="text-xs font-bold text-[#3E2D28] block text-left">
            Drill & Relearn Anytime
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => handleRelearn('all')}
              className="px-4 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#3E2D28] font-bold text-xs flex items-center justify-center space-x-1.5 border border-[#EFE8DE] transition-all squishy-btn cursor-pointer"
            >
              <RotateCcw size={13} className="text-strawberry-500" />
              <span>Review All ({cards.length})</span>
            </button>

            <button
              onClick={() => handleRelearn('highYield')}
              className="px-4 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#3E2D28] font-bold text-xs flex items-center justify-center space-x-1.5 border border-[#EFE8DE] transition-all squishy-btn cursor-pointer"
            >
              <Zap size={13} className="text-amber-500" />
              <span>High Yield Only</span>
            </button>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-[#3E2D28] hover:bg-[#2C1F1B] text-white font-bold text-xs shadow-squishy flex items-center space-x-2 transition-all squishy-btn cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Return to Decks Shelf</span>
        </button>
      </div>
    );
  }

  // 🌸 ACTIVE STUDY CARD ROOM 🌸
  return (
    <div className="flex flex-col max-w-2xl w-full mx-auto px-4 py-2 select-none">
      
      {/* Top Navigation & Progress Bar */}
      <div className="flex items-center justify-between py-2 mb-3 gap-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-cocoa-600 hover:text-[#3E2D28] transition-colors px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DE] shadow-2xs squishy-btn cursor-pointer"
        >
          <ChevronLeft size={15} />
          <span>Shelf</span>
        </button>

        {/* Study Mode Filter */}
        <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#EFE8DE] text-xs font-bold shadow-2xs">
          <button
            onClick={() => handleRelearn('due')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'due' ? 'bg-white text-strawberry-700 shadow-xs' : 'text-cocoa-400 hover:text-[#3E2D28]'
            }`}
          >
            Due Today
          </button>
          <button
            onClick={() => handleRelearn('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'all' ? 'bg-white text-strawberry-700 shadow-xs' : 'text-cocoa-400 hover:text-[#3E2D28]'
            }`}
          >
            All Cards
          </button>
          <button
            onClick={() => handleRelearn('highYield')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'highYield' ? 'bg-white text-strawberry-700 shadow-xs' : 'text-cocoa-400 hover:text-[#3E2D28]'
            }`}
          >
            ⭐ High Yield
          </button>
        </div>

        {/* Card Edit Trigger */}
        <button
          onClick={() => onEditCard(currentCard)}
          className="p-2 rounded-xl bg-white border border-[#EFE8DE] text-cocoa-500 hover:text-[#3E2D28] hover:bg-[#FAF7F2] transition-colors shadow-2xs squishy-btn cursor-pointer"
          title="Edit Card (Shortcut: E)"
        >
          <Edit3 size={14} />
        </button>
      </div>

      {/* Progress Strip */}
      <div className="w-full bg-[#EFE8DE]/60 h-2 rounded-full overflow-hidden mb-4">
        <div 
          className="bg-strawberry-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 🌸 THE PILLOWY 3D FLASHCARD 🌸 */}
      <div 
        onClick={handleFlip}
        className="w-full cursor-pointer select-none"
        title="Click anywhere on card or press Space to flip"
      >
        {!isFlipped ? (
          /* CARD FRONT FACE */
          <div className="w-full min-h-[380px] bg-white rounded-[32px] border-2 border-[#EFE8DE] hover:border-[#FFD1DC] shadow-bento p-6 sm:p-8 flex flex-col justify-between transition-all duration-200">
            
            {/* Front Header */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#EFE8DE]">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF0F5] text-strawberry-700 border border-[#FFD1DC]">
                  {currentCard.type === 'cloze' ? 'Cloze Deletion' : 'Question'}
                </span>
                {currentCard.state && (
                  <span className="text-[10px] font-bold text-cocoa-400 font-mono uppercase">
                    {currentCard.state}
                  </span>
                )}
              </div>
              <KittyBow size={18} className="text-strawberry-400" />
            </div>

            {/* Front Content */}
            <div className="my-auto py-6 text-center">
              <div className="text-xl sm:text-2xl text-[#3E2D28] leading-relaxed font-bold">
                <RichCardContent
                  content={currentCard.front || (currentCard.frontImage ? '' : '*(No question provided)*')}
                  showClozeAnswers={false}
                  className="text-xl sm:text-2xl text-[#3E2D28] leading-relaxed font-bold"
                />
              </div>

              {/* Front Screenshot Attachment */}
              {currentCard.frontImage && (
                <div className="flex justify-center pt-4">
                  <div 
                    className="relative group cursor-zoom-in inline-block rounded-2xl overflow-hidden border border-[#EFE8DE] shadow-2xs hover:border-strawberry-300 transition-all max-w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ src: currentCard.frontImage!, title: 'Question Diagram' });
                    }}
                    title="Click to view full size"
                  >
                    <img 
                      src={currentCard.frontImage} 
                      alt="Front Attachment" 
                      className="max-h-60 sm:max-h-72 max-w-full rounded-2xl object-contain bg-[#FAF7F2]" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-[#3E2D28] text-xs font-bold shadow-md flex items-center space-x-1">
                        <ZoomIn size={13} />
                        <span>Zoom</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between text-xs text-cocoa-400 font-medium border-t border-[#EFE8DE] pt-3.5 mt-4">
              <span>Card {currentCardIndex + 1} of {queue.length}</span>
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-[#3E2D28] font-bold text-[11px] border border-[#EFE8DE]">
                <span>Tap or Space to Flip 🎀</span>
              </span>
            </div>
          </div>
        ) : (
          /* CARD BACK FACE */
          <div className="w-full min-h-[380px] bg-white rounded-[32px] border-2 border-[#FFD1DC] shadow-bento p-6 sm:p-8 flex flex-col justify-between transition-all animate-fadeIn">
            
            {/* Back Header */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#EFE8DE]">
              <span className="text-strawberry-600 font-extrabold text-xs flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-strawberry-500" />
                <span>Answer Revealed</span>
              </span>
              <KittyBow size={18} className="text-strawberry-500" />
            </div>

            {/* Back Body */}
            <div className="my-auto py-5 space-y-4">
              {/* Question prompt badge */}
              {(currentCard.front || currentCard.frontImage) && (
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFE8DE] text-xs text-cocoa-600 leading-relaxed text-left">
                  <span className="font-bold text-cocoa-400 block text-[10px] uppercase tracking-wider mb-0.5">
                    Question Prompt
                  </span>
                  {currentCard.front ? (
                    <RichCardContent
                      content={currentCard.front}
                      showClozeAnswers={true}
                      className="line-clamp-2 text-xs sm:text-sm text-[#3E2D28] font-semibold"
                    />
                  ) : (
                    <span className="text-xs text-cocoa-400 italic">[Image Card]</span>
                  )}
                </div>
              )}

              {/* Answer Content */}
              {currentCard.back && (
                <div className="text-lg sm:text-xl text-[#3E2D28] leading-relaxed font-bold text-left">
                  <RichCardContent
                    content={currentCard.back}
                    showClozeAnswers={true}
                    className="text-lg sm:text-xl text-[#3E2D28] leading-relaxed font-bold"
                  />
                </div>
              )}

              {/* Back Image Attachment */}
              {currentCard.backImage && (
                <div className="flex justify-center pt-2">
                  <div 
                    className="relative group cursor-zoom-in inline-block rounded-2xl overflow-hidden border border-[#EFE8DE] shadow-2xs hover:border-strawberry-300 transition-all max-w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ src: currentCard.backImage!, title: 'Back Diagram' });
                    }}
                    title="Click to view full size"
                  >
                    <img 
                      src={currentCard.backImage} 
                      alt="Back Attachment" 
                      className="max-h-60 sm:max-h-72 max-w-full rounded-2xl object-contain bg-[#FAF7F2]" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-[#3E2D28] text-xs font-bold shadow-md flex items-center space-x-1">
                        <ZoomIn size={13} />
                        <span>Zoom</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Takeaway / Concept Note Box */}
              {(currentCard.medicalMeta?.takeaway || currentCard.medicalMeta?.clinicalPearl) && (
                <div className="p-3.5 bg-honey-50 rounded-2xl border border-honey-200 text-xs sm:text-sm text-honey-900 flex items-start space-x-2.5 shadow-2xs text-left">
                  <Award size={16} className="text-honey-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-extrabold text-honey-800 block text-[10px] uppercase tracking-wider mb-0.5">
                      Key Takeaway
                    </strong>
                    <span className="leading-relaxed font-medium">
                      {currentCard.medicalMeta.takeaway || currentCard.medicalMeta.clinicalPearl}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between text-xs text-cocoa-400 font-medium border-t border-[#EFE8DE] pt-3.5 mt-4">
              <span>Card {currentCardIndex + 1} of {queue.length}</span>
              <span>Rate recall below (Keys 1-4)</span>
            </div>
          </div>
        )}
      </div>

      {/* 🌸 SQUISHY TACTILE RATING CONTROLS 🌸 */}
      <div className="mt-4 pb-safe">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full h-13 rounded-2xl bg-strawberry-500 hover:bg-strawberry-600 active:scale-95 text-white font-extrabold shadow-squishy-pink transition-all text-sm flex items-center justify-center space-x-2 squishy-btn cursor-pointer"
          >
            <RotateCw size={16} />
            <span>Show Answer (Space) 🎀</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-cocoa-500 text-center tracking-wider uppercase">
              How well did you remember this?
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              
              {/* Again (1) */}
              <button
                onClick={() => handleRating(1)}
                className="relative py-2.5 sm:py-3 px-2 rounded-2xl bg-[#FFF0F5] hover:bg-[#FFE4EE] text-[#BE124C] border-2 border-[#FFD1DC] font-bold transition-all text-center squishy-btn shadow-squishy active:scale-95 cursor-pointer flex flex-col items-center justify-center"
                title="Rating: Again (Shortcut: 1)"
              >
                <span className="hidden sm:inline-block absolute top-1.5 right-2 text-[9px] font-mono text-strawberry-600 bg-white px-1.5 py-0.2 rounded-md border border-[#FFD1DC]">1</span>
                <div className="text-xs font-black">Again 💔</div>
                <div className="text-[11px] font-mono font-bold text-cocoa-600 mt-0.5">{previews.again}</div>
              </button>

              {/* Hard (2) */}
              <button
                onClick={() => handleRating(2)}
                className="relative py-2.5 sm:py-3 px-2 rounded-2xl bg-[#FFFDF0] hover:bg-[#FEF9D9] text-[#B45309] border-2 border-[#FEF0A3] font-bold transition-all text-center squishy-btn shadow-squishy active:scale-95 cursor-pointer flex flex-col items-center justify-center"
                title="Rating: Hard (Shortcut: 2)"
              >
                <span className="hidden sm:inline-block absolute top-1.5 right-2 text-[9px] font-mono text-honey-600 bg-white px-1.5 py-0.2 rounded-md border border-[#FEF0A3]">2</span>
                <div className="text-xs font-black">Hard 💭</div>
                <div className="text-[11px] font-mono font-bold text-cocoa-600 mt-0.5">{previews.hard}</div>
              </button>

              {/* Good (3) */}
              <button
                onClick={() => handleRating(3)}
                className="relative py-2.5 sm:py-3 px-2 rounded-2xl bg-[#F0FAF3] hover:bg-[#E2F6E8] text-[#1B652A] border-2 border-[#C5ECD2] font-bold transition-all text-center squishy-btn shadow-squishy-matcha active:scale-95 cursor-pointer flex flex-col items-center justify-center"
                title="Rating: Good (Shortcut: 3 or Space)"
              >
                <span className="hidden sm:inline-block absolute top-1.5 right-2 text-[9px] font-mono text-matcha-600 bg-white px-1.5 py-0.2 rounded-md border border-[#C5ECD2]">3</span>
                <div className="text-xs font-black">Good 🌸</div>
                <div className="text-[11px] font-mono font-bold text-[#1B652A] mt-0.5">{previews.good}</div>
              </button>

              {/* Easy (4) */}
              <button
                onClick={() => handleRating(4)}
                className="relative py-2.5 sm:py-3 px-2 rounded-2xl bg-[#F0F8FF] hover:bg-[#E0F2FE] text-[#0369A1] border-2 border-[#BAE6FD] font-bold transition-all text-center squishy-btn shadow-squishy active:scale-95 cursor-pointer flex flex-col items-center justify-center"
                title="Rating: Easy (Shortcut: 4)"
              >
                <span className="hidden sm:inline-block absolute top-1.5 right-2 text-[9px] font-mono text-sky-600 bg-white px-1.5 py-0.2 rounded-md border border-[#BAE6FD]">4</span>
                <div className="text-xs font-black">Easy ✨</div>
                <div className="text-[11px] font-mono font-bold text-cocoa-600 mt-0.5">{previews.easy}</div>
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
