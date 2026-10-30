import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Bell } from 'lucide-react';
import { sounds } from '../../services/audio';

interface PomodoroWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  const totalSeconds = mode === 'focus' ? 25 * 60 : mode === 'break' ? 5 * 60 : 50 * 60;
  const currentTotal = minutes * 60 + seconds;
  const progressPercent = ((totalSeconds - currentTotal) / totalSeconds) * 100;

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-50 animate-fadeIn max-w-[calc(100vw-24px)]">
      <div className="bg-white rounded-2xl p-4 w-72 max-w-full shadow-xl border border-slate-200">
        
        {/* Widget Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Clock size={15} className="text-rose-500" />
            <span className="font-bold text-slate-900 text-xs">Focus Timer</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Finished Notice */}
        {showFinishedNotice && (
          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-medium flex items-center space-x-1.5 animate-fadeIn">
            <Bell size={13} className="text-emerald-600 shrink-0" />
            <span>Time is up! Great focus session.</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex items-center justify-center space-x-1 my-3 bg-slate-100 p-1 rounded-xl text-[11px] font-medium">
          <button
            onClick={() => setTimerMode('focus')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'focus' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => setTimerMode('break')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'break' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => setTimerMode('block')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'block' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            50m Block
          </button>
        </div>

        {/* Clock Display */}
        <div className="relative my-3 flex flex-col items-center justify-center">
          <div className="text-4xl font-extrabold font-mono tracking-wider text-slate-900">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">
            {isActive ? 'Focus active' : 'Paused'}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-2 pt-1">
          <button
            onClick={resetTimer}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={toggleTimer}
            className="flex-1 py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
          >
            {isActive ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
