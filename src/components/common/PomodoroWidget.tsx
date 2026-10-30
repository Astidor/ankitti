import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Bell, Sparkles } from 'lucide-react';
import { sounds } from '../../services/audio';

interface PomodoroWidgetProps {
  isOpen: boolean;
  isInline?: boolean;
  onClose?: () => void;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ 
  isOpen, 
  isInline = false, 
  onClose 
}) => {
  const [minutes, setMinutes] = useState<number>(25);
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<'focus' | 'break' | 'block'>('focus');
  const [showFinishedNotice, setShowFinishedNotice] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (minutes > 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else {
          // Timer finished!
          setIsActive(false);
          sounds.playCelebration();
          setShowFinishedNotice(true);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const setTimerMode = (newMode: 'focus' | 'break' | 'block') => {
    sounds.playClick();
    setMode(newMode);
    setIsActive(false);
    setShowFinishedNotice(false);
    if (newMode === 'focus') {
      setMinutes(25);
      setSeconds(0);
    } else if (newMode === 'break') {
      setMinutes(5);
      setSeconds(0);
    } else {
      setMinutes(50);
      setSeconds(0);
    }
  };

  const toggleTimer = () => {
    sounds.playClick();
    setShowFinishedNotice(false);
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    sounds.playClick();
    setIsActive(false);
    setShowFinishedNotice(false);
    setTimerMode(mode);
  };

  if (!isOpen && !isInline) return null;

  const totalSeconds = mode === 'focus' ? 25 * 60 : mode === 'break' ? 5 * 60 : 50 * 60;
  const currentTotal = minutes * 60 + seconds;
  const progressPercent = ((totalSeconds - currentTotal) / totalSeconds) * 100;

  // Inline Caddy Variant (Rendered directly inside persistent sidebar)
  if (isInline) {
    return (
      <div className="bg-[#FFFDFB] rounded-2xl p-3 border border-[#EFE8DE] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#3E2D28]">
            <Clock size={13} className="text-strawberry-500" />
            <span>Focus Pomodoro</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-strawberry-50 text-strawberry-700">
            {mode === 'focus' ? '25m' : mode === 'break' ? '5m' : '50m'}
          </span>
        </div>

        {/* Finished Notice */}
        {showFinishedNotice && (
          <div className="p-1.5 bg-matcha-50 border border-matcha-200 rounded-xl text-matcha-700 text-[10px] font-bold flex items-center space-x-1 animate-fadeIn">
            <Bell size={11} className="shrink-0 text-matcha-600" />
            <span>Time's up! Great session! 🌸</span>
          </div>
        )}

        {/* Digital Counter Display */}
        <div className="flex items-center justify-between bg-[#FAF7F2] py-2 px-3 rounded-xl border border-[#EFE8DE]">
          <div className="text-lg font-bold font-mono tracking-wider text-[#3E2D28]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={toggleTimer}
              className={`p-1.5 rounded-lg text-white font-bold transition-all squishy-btn cursor-pointer ${
                isActive 
                  ? 'bg-amber-500 hover:bg-amber-600' 
                  : 'bg-strawberry-500 hover:bg-strawberry-600 shadow-squishy-pink'
              }`}
              title={isActive ? 'Pause Timer' : 'Start Timer'}
            >
              {isActive ? <Pause size={13} /> : <Play size={13} className="fill-white" />}
            </button>

            <button
              onClick={resetTimer}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-cocoa-500 border border-[#EFE8DE] transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Mode Segment Switcher */}
        <div className="flex items-center space-x-1 text-[10px] font-bold text-cocoa-500">
          <button
            onClick={() => setTimerMode('focus')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              mode === 'focus' ? 'bg-strawberry-100 text-strawberry-700 font-extrabold' : 'hover:bg-slate-100'
            }`}
          >
            25m
          </button>
          <button
            onClick={() => setTimerMode('break')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              mode === 'break' ? 'bg-matcha-100 text-matcha-700 font-extrabold' : 'hover:bg-slate-100'
            }`}
          >
            5m Rest
          </button>
          <button
            onClick={() => setTimerMode('block')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              mode === 'block' ? 'bg-taro-100 text-taro-700 font-extrabold' : 'hover:bg-slate-100'
            }`}
          >
            50m Deep
          </button>
        </div>
      </div>
    );
  }

  // Floating Overlay Variant (Mobile / Floating)
  return (
    <div className="fixed top-16 right-3 sm:right-6 z-50 animate-fadeIn max-w-[calc(100vw-24px)]">
      <div className="bg-white rounded-3xl p-4 w-72 max-w-full shadow-bento border border-[#EFE8DE]">
        {/* Widget Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DE]">
          <div className="flex items-center space-x-2">
            <Clock size={15} className="text-strawberry-500" />
            <span className="font-bold text-[#3E2D28] text-xs">Focus Timer</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-cocoa-400 hover:text-cocoa-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Finished Notice */}
        {showFinishedNotice && (
          <div className="mt-2 p-2 bg-matcha-50 border border-matcha-200 rounded-xl text-matcha-700 text-[11px] font-bold flex items-center space-x-1.5 animate-fadeIn">
            <Bell size={13} className="text-matcha-600 shrink-0" />
            <span>Time is up! Great focus session. 🌸</span>
          </div>
        )}

        {/* Segmented Modes */}
        <div className="grid grid-cols-3 gap-1 bg-[#FAF7F2] p-1 rounded-xl my-3 text-[11px] font-semibold text-cocoa-500">
          <button
            onClick={() => setTimerMode('focus')}
            className={`py-1 rounded-lg transition-all ${mode === 'focus' ? 'bg-white text-strawberry-700 font-bold shadow-xs' : 'hover:text-[#3E2D28]'}`}
          >
            25m Focus
          </button>
          <button
            onClick={() => setTimerMode('break')}
            className={`py-1 rounded-lg transition-all ${mode === 'break' ? 'bg-white text-matcha-700 font-bold shadow-xs' : 'hover:text-[#3E2D28]'}`}
          >
            5m Break
          </button>
          <button
            onClick={() => setTimerMode('block')}
            className={`py-1 rounded-lg transition-all ${mode === 'block' ? 'bg-white text-taro-700 font-bold shadow-xs' : 'hover:text-[#3E2D28]'}`}
          >
            50m Deep
          </button>
        </div>

        {/* Countdown Display */}
        <div className="text-center py-2">
          <div className="text-4xl font-extrabold font-mono tracking-wider text-[#3E2D28]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-cocoa-400 font-medium mt-1">
            {isActive ? 'Session in progress...' : 'Ready to start focus'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#FAF7F2] h-1.5 rounded-full overflow-hidden my-3">
          <div 
            className="bg-strawberry-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all text-white squishy-btn cursor-pointer ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-xs' 
                : 'bg-strawberry-500 hover:bg-strawberry-600 shadow-squishy-pink'
            }`}
          >
            {isActive ? (
              <>
                <Pause size={14} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-white" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-slate-200/80 text-cocoa-600 border border-[#EFE8DE] transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
