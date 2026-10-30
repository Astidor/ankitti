import React from 'react';
import { X, Flame, CheckCircle2, TrendingUp, Calendar, Sprout, Sparkles } from 'lucide-react';
import { UserAccount, ReviewLog, Deck, Card } from '../../types/anki';
import { KittyBow } from '../common/KittyIllustrations';

interface StatsModalProps {
  isOpen: boolean;
  isInline?: boolean;
  account: UserAccount;
  decks: Deck[];
  cards: Card[];
  reviewLogs: ReviewLog[];
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  isInline = false,
  account,
  decks,
  cards,
  reviewLogs,
  onClose,
}) => {
  if (!isOpen) return null;

  // Calculate days until target exam
  const examDate = new Date(account.examDate);
  const today = new Date();
  const diffTime = examDate.getTime() - today.getTime();
  const daysUntilExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate retention rate (ratings 3 and 4 vs total reviews)
  const totalReviews = reviewLogs.length;
  const successfulReviews = reviewLogs.filter(r => r.rating >= 3).length;
  const retentionRate = totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 92;

  // Breakdown of card stages
  const newCardsCount = cards.filter(c => c.state === 'new').length;
  const learnCardsCount = cards.filter(c => c.state === 'learning' || c.state === 'relearning').length;
  const youngCardsCount = cards.filter(c => c.state === 'review' && (c.interval || 0) < 21).length;
  const matureCardsCount = cards.filter(c => c.state === 'review' && (c.interval || 0) >= 21).length;

  // Generate 84 days (12 weeks) Activity Heatmap
  const heatmapDays = [];
  const reviewsByDay: Record<string, number> = {};

  reviewLogs.forEach(r => {
    const d = new Date(r.timestamp).toISOString().split('T')[0];
    reviewsByDay[d] = (reviewsByDay[d] || 0) + 1;
  });

  for (let i = 83; i >= 0; i--) {
    const dateObj = new Date(Date.now() - i * 86400000);
    const dateStr = dateObj.toISOString().split('T')[0];
    const count = reviewsByDay[dateStr] || 0;
    heatmapDays.push({ date: dateStr, count });
  }

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-[#FAF7F2] border border-[#EFE8DE] hover:bg-slate-200';
    if (count < 10) return 'bg-matcha-200 border border-matcha-300 hover:bg-matcha-300';
    if (count < 25) return 'bg-matcha-300 border border-matcha-400 hover:bg-matcha-400';
    if (count < 50) return 'bg-matcha-500 border border-matcha-600 hover:bg-matcha-600';
    return 'bg-matcha-700 border border-matcha-800 hover:bg-matcha-800';
  };

  const statsBody = (
    <div className="space-y-5 text-xs">
      
      {/* 🌸 TOP BENTO: EXAM COUNTDOWN, STREAK GARDEN & RETENTION 🌸 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Target Goal / Exam */}
        <div className="bg-[#FFFDFB] rounded-3xl p-5 shadow-bento border-2 border-[#FFD1DC] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-strawberry-700">Target Goal</span>
            <Calendar size={16} className="text-strawberry-500" />
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-extrabold text-[#3E2D28] tracking-tight">{daysUntilExam} Days</div>
            <div className="text-xs font-bold text-strawberry-700 truncate mt-0.5">until {account.targetExam}</div>
          </div>
          <div className="text-[10px] text-cocoa-400 font-mono font-medium">Exam Date: {account.examDate}</div>
        </div>

        {/* Study Garden Daily Streak */}
        <div className="bg-[#FFFDFB] rounded-3xl p-5 shadow-bento border-2 border-[#FEF0A3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-honey-700">Study Garden Streak</span>
            <Flame size={18} className="text-honey-500" />
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-extrabold text-[#3E2D28] tracking-tight">{account.streakDays} Days</div>
            <div className="text-xs font-bold text-honey-700 mt-0.5">Consistent daily review</div>
          </div>
          <div className="text-[10px] text-matcha-600 font-bold flex items-center space-x-1">
            <Sprout size={12} />
            <span>Sprouting memory garden! 🌱</span>
          </div>
        </div>

        {/* Retention Rate */}
        <div className="bg-[#FFFDFB] rounded-3xl p-5 shadow-bento border-2 border-[#C5ECD2] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-matcha-700">SM-2 Retention</span>
            <CheckCircle2 size={18} className="text-matcha-600" />
          </div>
          <div className="my-2.5">
            <div className="text-3xl font-extrabold text-[#3E2D28] tracking-tight">{retentionRate}%</div>
            <div className="text-xs font-bold text-matcha-700 mt-0.5">Recall accuracy</div>
          </div>
          <div className="text-[10px] text-cocoa-400 font-medium">Optimal target: 85% - 95%</div>
        </div>

      </div>

      {/* 🌸 SPACED REVIEW GARDEN HEATMAP (12 WEEKS) 🌸 */}
      <div className="bento-card p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-extrabold text-[#3E2D28] text-xs sm:text-sm">
              Study Garden Activity Heatmap
            </h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-matcha-50 text-matcha-700 border border-matcha-200">
              12 Weeks
            </span>
          </div>

          <span className="text-[11px] text-cocoa-400 font-mono font-bold">
            {reviewLogs.length} total reviews
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EFE8DE]">
          {heatmapDays.map((d, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-md transition-all cursor-pointer ${getIntensityColor(d.count)}`}
              title={`${d.date}: ${d.count} flashcards reviewed`}
            />
          ))}
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-end space-x-1.5 text-[10px] text-cocoa-400 pt-1 font-bold">
          <span>Less</span>
          <span className="w-3 h-3 rounded-md bg-[#FAF7F2] border border-[#EFE8DE]" />
          <span className="w-3 h-3 rounded-md bg-matcha-200" />
          <span className="w-3 h-3 rounded-md bg-matcha-300" />
          <span className="w-3 h-3 rounded-md bg-matcha-500" />
          <span className="w-3 h-3 rounded-md bg-matcha-700" />
          <span>More</span>
        </div>
      </div>

      {/* 🌸 CARD MATURITY BREAKDOWN BENTO 🌸 */}
      <div className="bento-card p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-[#3E2D28] text-xs sm:text-sm flex items-center space-x-2">
            <TrendingUp size={16} className="text-strawberry-500" />
            <span>Card Maturity Distribution</span>
          </h4>
          <span className="text-xs font-bold text-cocoa-500 font-mono">
            {cards.length} Cards in Collection
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#FAF7F2] border border-[#EFE8DE]">
          <div 
            className="bg-taro-400 h-full transition-all" 
            style={{ width: `${cards.length ? (newCardsCount / cards.length) * 100 : 0}%` }} 
            title={`New: ${newCardsCount}`}
          />
          <div 
            className="bg-honey-400 h-full transition-all" 
            style={{ width: `${cards.length ? (learnCardsCount / cards.length) * 100 : 0}%` }} 
            title={`Learning: ${learnCardsCount}`}
          />
          <div 
            className="bg-sky-400 h-full transition-all" 
            style={{ width: `${cards.length ? (youngCardsCount / cards.length) * 100 : 0}%` }} 
            title={`Young: ${youngCardsCount}`}
          />
          <div 
            className="bg-matcha-500 h-full transition-all" 
            style={{ width: `${cards.length ? (matureCardsCount / cards.length) * 100 : 0}%` }} 
            title={`Mature: ${matureCardsCount}`}
          />
        </div>

        {/* Legend stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-bold">
          <div className="flex items-center space-x-2.5 p-3 bg-taro-50 rounded-2xl border border-taro-200">
            <span className="w-2.5 h-2.5 rounded-full bg-taro-500" />
            <div>
              <div className="text-base font-extrabold text-taro-900">{newCardsCount}</div>
              <div className="text-[10px] text-taro-700">New Cards</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-3 bg-honey-50 rounded-2xl border border-honey-200">
            <span className="w-2.5 h-2.5 rounded-full bg-honey-500" />
            <div>
              <div className="text-base font-extrabold text-honey-900">{learnCardsCount}</div>
              <div className="text-[10px] text-honey-700">Learning</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-3 bg-sky-50 rounded-2xl border border-sky-200">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <div>
              <div className="text-base font-extrabold text-sky-900">{youngCardsCount}</div>
              <div className="text-[10px] text-sky-700">Young (&lt;21d)</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-3 bg-matcha-50 rounded-2xl border border-matcha-200">
            <span className="w-2.5 h-2.5 rounded-full bg-matcha-500" />
            <div>
              <div className="text-base font-extrabold text-matcha-900">{matureCardsCount}</div>
              <div className="text-[10px] text-matcha-700">Mature (&ge;21d)</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  if (isInline) {
    return (
      <div className="animate-fadeIn">
        {statsBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden border border-[#EFE8DE] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#EFE8DE]">
          <div className="flex items-center space-x-2">
            <KittyBow size={18} />
            <h3 className="text-base font-bold text-[#3E2D28]">Study Garden Analytics</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-slate-200 text-cocoa-500 hover:text-[#3E2D28] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {statsBody}
        </div>
      </div>
    </div>
  );
};
