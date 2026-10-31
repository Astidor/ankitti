import React, { useEffect, useState } from 'react';
import { Bell, Pause, Play, RotateCcw, X } from 'lucide-react';
import { sounds } from '../../services/audio';

interface PomodoroWidgetProps {
  isOpen: boolean;
  isInline?: boolean;
  onClose?: () => void;
}

type Mode = 'focus' | 'break' | 'block';

const MODES: { id: Mode; minutes: number; label: string }[] = [
  { id: 'focus', minutes: 25, label: '25 min focus' },
  { id: 'break', minutes: 5, label: '5 min break' },
  { id: 'block', minutes: 50, label: '50 min deep' },
];

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ isOpen, isInline = false, onClose }) => {
  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [finished, setFinished] = useState(false);

  const total = MODES.find((m) => m.id === mode)!.minutes * 60;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        setIsActive(false);
        setFinished(true);
        sounds.playCelebration();
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const pick = (next: Mode) => {
    sounds.playClick();
    setMode(next);
    setIsActive(false);
    setFinished(false);
    setSecondsLeft(MODES.find((m) => m.id === next)!.minutes * 60);
  };

  const toggle = () => {
    sounds.playClick();
    setFinished(false);
    if (secondsLeft === 0) setSecondsLeft(total);
    setIsActive((a) => !a);
  };

  const reset = () => pick(mode);

  if (!isOpen && !isInline) return null;

  const clock = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const progress = ((total - secondsLeft) / total) * 100;

  const body = (
    <>
      {finished && (
        <div className="st-alert st-alert-ok" role="status" style={{ padding: '8px 12px' }}>
          <Bell size={16} />
          <span>Time’s up. Nice session!</span>
        </div>
      )}
      <div className="st-timer-clock st-display" aria-live="polite" aria-label={`${clock} left`}>{clock}</div>
      <div className="st-progress" style={{ marginTop: 0, height: 10 }} aria-hidden="true">
        <div style={{ width: `${progress}%`, transition: 'width 1s linear' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="st-btn st-btn-primary st-btn-sm" style={{ flex: 1 }} onClick={toggle}>
          {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {secondsLeft < total && secondsLeft > 0 ? 'Resume' : 'Start'}</>}
        </button>
        <button className="st-btn st-btn-secondary st-btn-sm" onClick={reset} aria-label="Reset timer" title="Reset timer" style={{ padding: '0 12px' }}>
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="st-seg" role="group" aria-label="Timer length">
        {MODES.map((m) => (
          <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => pick(m.id)} title={m.label} aria-label={m.label}>
            {m.minutes}m
          </button>
        ))}
      </div>
    </>
  );

  if (isInline) return <div className="st-timer">{body}</div>;

  return (
    <div className="st-timer st-timer-float" role="dialog" aria-label="Focus timer">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong className="st-display">Focus timer</strong>
        {onClose && (
          <button className="st-icon-btn" onClick={onClose} aria-label="Close focus timer">
            <X size={18} />
          </button>
        )}
      </div>
      {body}
    </div>
  );
};
