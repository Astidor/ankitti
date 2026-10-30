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
    if (count === 0) return 'bg-pink-100/60 border border-pink-200/60 hover:border-pink-300';
    if (count < 10) return 'bg-matcha-200 border border-matcha-300 hover:bg-matcha-300';
    if (count < 25) return 'bg-matcha-300 border border-matcha-400 hover:bg-matcha-400';
    if (count < 50) return 'bg-matcha-500 border border-matcha-600 hover:bg-matcha-600';
    return 'bg-matcha-700 border border-matcha-800 hover:bg-matcha-800';
  };

  const statsBody = (
    <div className="space-y-4 text-xs">
      {/* Garden & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-cocoa-900 tracking-tight flex items-center space-x-2">
            <span>Study Garden & Insights</span>
            <KittyBow size={20} />
          </h2>
          <p className="text-xs text-cocoa-500 mt-0.5">
            Track your memory retention, daily streak momentum, and review heatmap.
          </p>
        </div>
      </div>
      
      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Target Goal / Exam */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(255,77,121,0.04)] border border-pink-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cocoa-500">Target Goal</span>
            <Calendar size={15} className="text-strawberry-500" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-cocoa-900 tracking-tight font-display">{daysUntilExam} Days</div>
            <div className="text-xs font-semibold text-strawberry-700 truncate mt-0.5">until {account.targetExam}</div>
          </div>
          <div className="text-[10px] text-cocoa-400 font-mono">Exam Date: {account.examDate}</div>
        </div>

        {/* Study Garden Daily Streak */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(255,77,121,0.04)] border border-pink-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cocoa-500">Daily Streak</span>
            <Flame size={16} className="text-honey-500" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-cocoa-900 tracking-tight font-display">
              {account.streakDays} {account.streakDays === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-xs font-semibold text-honey-700 mt-0.5">Consistent spaced reviews</div>
          </div>
          <div className="text-[10px] text-matcha-600 font-semibold flex items-center space-x-1">
            <Sprout size={12} />
            <span>Memory garden blooming 🌱</span>
          </div>
        </div>

        {/* Retention Rate */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(255,77,121,0.04)] border border-pink-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cocoa-500">SM-2 Retention</span>
            <CheckCircle2 size={16} className="text-matcha-600" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-cocoa-900 tracking-tight font-display">{retentionRate}%</div>
            <div className="text-xs font-semibold text-matcha-700 mt-0.5">Recall accuracy</div>
          </div>
          <div className="text-[10px] text-cocoa-400 font-medium">Optimal target: 85% - 95%</div>
        </div>

      </div>

      {/* Spaced Review Garden Heatmap */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-[0_4px_16px_rgba(255,77,121,0.04)] p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-cocoa-900 text-xs sm:text-sm font-display">
              Study Garden Activity Heatmap
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-matcha-50 text-matcha-700 border border-matcha-200">
              12 Weeks
            </span>
          </div>

          <span className="text-[11px] text-cocoa-400 font-mono font-medium">
            {reviewLogs.length} total reviews
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto p-3.5 bg-pink-50/40 rounded-xl border border-pink-100">
          {heatmapDays.map((d, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-md transition-all cursor-pointer ${getIntensityColor(d.count)}`}
              title={`${d.date}: ${d.count} flashcards reviewed`}
            />
          ))}
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-end space-x-1.5 text-[10px] text-cocoa-400 pt-1 font-semibold">
          <span>Less</span>
          <span className="w-3 h-3 rounded-md bg-pink-100/60 border border-pink-200/60" />
          <span className="w-3 h-3 rounded-md bg-matcha-200" />
          <span className="w-3 h-3 rounded-md bg-matcha-300" />
          <span className="w-3 h-3 rounded-md bg-matcha-500" />
          <span className="w-3 h-3 rounded-md bg-matcha-700" />
          <span>More</span>
        </div>
      </div>

      {/* Card Maturity Breakdown */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-[0_4px_16px_rgba(255,77,121,0.04)] p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-cocoa-900 text-xs sm:text-sm flex items-center space-x-2 font-display">
            <TrendingUp size={15} className="text-strawberry-500" />
            <span>Card Maturity Distribution</span>
          </h4>
          <span className="text-xs font-semibold text-cocoa-500 font-mono">
            {cards.length} Cards in Collection
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-pink-100 border border-pink-200/60">
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
            className="bg-strawberry-400 h-full transition-all" 
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-semibold">
          <div className="flex items-center space-x-2.5 p-3 bg-pink-50/40 rounded-xl border border-pink-100">
            <span className="w-2.5 h-2.5 rounded-full bg-taro-400" />
            <div>
              <div className="text-base font-bold text-cocoa-900">{newCardsCount}</div>
              <div className="text-[10px] text-cocoa-500 font-medium">New Cards</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-3 bg-pink-50/40 rounded-xl border border-pink-100">
            <span className="w-2.5 h-2.5 rounded-full bg-honey-400" />
            <div>
              <div className="text-base font-bold text-cocoa-900">{learnCardsCount}</div>
              <div className="text-[10px] text-cocoa-500 font-medium">Learning</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-3 bg-pink-50/40 rounded-xl border border-pink-100">
            <span className="w-2.5 h-2.5 rounded-full bg-strawberry-400" />
            <div>
              <div className="text-base font-bold text-cocoa-900">{youngCardsCount}</div>
              <div className="text-[10px] text-cocoa-500 font-medium">Young (&lt;21d)</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-3 bg-pink-50/40 rounded-xl border border-pink-100">
            <span className="w-2.5 h-2.5 rounded-full bg-matcha-500" />
            <div>
              <div className="text-base font-bold text-cocoa-900">{matureCardsCount}</div>
              <div className="text-[10px] text-cocoa-500 font-medium">Mature (&ge;21d)</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden border border-pink-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-pink-100">
          <div className="flex items-center space-x-2">
            <KittyBow size={18} />
            <h3 className="text-base font-bold text-cocoa-900 font-display">Study Garden Analytics</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-cocoa-500 hover:text-cocoa-900 flex items-center justify-center transition-colors cursor-pointer"
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
