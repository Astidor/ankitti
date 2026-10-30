import React from 'react';
import { X, Flame, CheckCircle2, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { UserAccount, ReviewLog, Deck, Card } from '../../types/anki';

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

  // Calculate days until exam
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
    if (count === 0) return 'bg-slate-100 hover:bg-slate-200';
    if (count < 10) return 'bg-emerald-200 hover:bg-emerald-300';
    if (count < 25) return 'bg-emerald-400 hover:bg-emerald-500';
    if (count < 50) return 'bg-emerald-500 hover:bg-emerald-600';
    return 'bg-emerald-700 hover:bg-emerald-800';
  };

  const statsBody = (
    <div className="space-y-4 text-xs">
      {/* Top Banner: Exam Countdown & Daily Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Exam Countdown */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Target Exam</span>
            <Calendar size={16} className="text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold tracking-tight">{daysUntilExam} Days</div>
            <div className="text-xs font-medium text-slate-300 truncate">until {account.targetExam}</div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Date: {account.examDate}</div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Study Streak</span>
            <Flame size={18} className="text-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{account.streakDays} Days</div>
            <div className="text-xs text-slate-500">Consistent daily study</div>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">Active consistency</div>
        </div>

        {/* Retention Rate */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Retention</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{retentionRate}%</div>
            <div className="text-xs text-slate-500">Recall success rate</div>
          </div>
          <div className="text-[10px] text-slate-400">Target range: 85% - 95%</div>
        </div>
      </div>

      {/* Spaced Activity Heatmap (12 Weeks) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
            12-Week Study Heatmap
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {reviewLogs.length} total reviews
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto p-3 bg-slate-50 rounded-xl border border-slate-100">
          {heatmapDays.map((d, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-[3px] transition-transform cursor-pointer ${getIntensityColor(d.count)}`}
              title={`${d.date}: ${d.count} cards reviewed`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end space-x-1.5 text-[10px] text-slate-400 pt-1">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-100" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700" />
          <span>More</span>
        </div>
      </div>

      {/* Card Maturity Distribution Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2">
          <TrendingUp size={16} className="text-slate-700" />
          <span>Card Maturity Breakdown ({cards.length} Total Cards)</span>
        </h4>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
          <div 
            className="bg-blue-500 h-full" 
            style={{ width: `${cards.length ? (newCardsCount / cards.length) * 100 : 0}%` }} 
            title={`New: ${newCardsCount}`}
          />
          <div 
            className="bg-amber-500 h-full" 
            style={{ width: `${cards.length ? (learnCardsCount / cards.length) * 100 : 0}%` }} 
            title={`Learning: ${learnCardsCount}`}
          />
          <div 
            className="bg-teal-500 h-full" 
            style={{ width: `${cards.length ? (youngCardsCount / cards.length) * 100 : 0}%` }} 
            title={`Young: ${youngCardsCount}`}
          />
          <div 
            className="bg-emerald-600 h-full" 
            style={{ width: `${cards.length ? (matureCardsCount / cards.length) * 100 : 0}%` }} 
            title={`Mature: ${matureCardsCount}`}
          />
        </div>

        {/* Legend stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="flex items-center space-x-2 p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <div>
              <div className="font-bold text-blue-900">{newCardsCount}</div>
              <div className="text-[10px] text-blue-700">New</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2.5 bg-amber-50/70 rounded-xl border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <div>
              <div className="font-bold text-amber-900">{learnCardsCount}</div>
              <div className="text-[10px] text-amber-700">Learning</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2.5 bg-teal-50/70 rounded-xl border border-teal-100">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <div>
              <div className="font-bold text-teal-900">{youngCardsCount}</div>
              <div className="text-[10px] text-teal-700">Young (&lt; 21d)</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <div>
              <div className="font-bold text-emerald-900">{matureCardsCount}</div>
              <div className="text-[10px] text-emerald-700">Mature (&ge; 21d)</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Study Analytics</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
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
