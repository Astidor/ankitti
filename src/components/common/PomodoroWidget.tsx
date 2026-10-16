import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Sparkles } from 'lucide-react';
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
          alert('🎀 Ding! Pomodoro session finished, Dr. Kitty! Time for a refreshing break.');
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
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    sounds.playClick();
    setIsActive(false);
    setTimerMode(mode);
  };

  if (!isOpen) return null;

  const totalSeconds = mode === 'focus' ? 25 * 60 : mode === 'break' ? 5 * 60 : 50 * 60;
  const currentTotal = minutes * 60 + seconds;
  const progressPercent = ((totalSeconds - currentTotal) / totalSeconds) * 100;

  return (
    <div className="fixed top-12 right-6 z-40 animate-fadeIn">
      <div className="mac-window rounded-3xl p-4 w-72 shadow-mac-lg border border-pink-200">
        
        {/* Widget Header with Kitty Ears */}
        <div className="flex items-center justify-between pb-2 border-b border-pink-100">
          <div className="flex items-center space-x-1.5">
            <span className="text-base">🎀</span>
            <span className="font-extrabold text-kitty-dark text-xs">Kitty Study Timer</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-kitty-subtle hover:text-kitty-dark hover:bg-pink-100"
          >
            <X size={14} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-center space-x-1 my-3 bg-pink-100/60 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setTimerMode('focus')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mode === 'focus' ? 'bg-white text-kitty-600 shadow-sm' : 'text-kitty-subtle hover:text-kitty-600'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => setTimerMode('break')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mode === 'break' ? 'bg-white text-kitty-600 shadow-sm' : 'text-kitty-subtle hover:text-kitty-600'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => setTimerMode('block')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mode === 'block' ? 'bg-white text-kitty-600 shadow-sm' : 'text-kitty-subtle hover:text-kitty-600'
            }`}
          >
            50m Block
          </button>
        </div>

        {/* Big Clock Display with Circular Glow Ring */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          <div className="text-4xl font-black font-mono tracking-wider text-kitty-dark drop-shadow-sm">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-pink-600 font-bold uppercase tracking-wider mt-1">
            {isActive ? '🩺 Deep Study Synapses Active' : 'Paused • Ready to Learn'}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-pink-100 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-kitty-subtle hover:text-kitty-dark transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggleTimer}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-mac hover:opacity-95 transition-all flex items-center space-x-2 active:scale-95"
          >
            {isActive ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
