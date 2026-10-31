import React, { useEffect, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserAccount } from '../../types/anki';
import { api } from '../../services/api';
import { sounds } from '../../services/audio';
import { Dialog, Field } from '../studio/Dialog';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

const MIN_PASSWORD = 6;

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Open in the mode the caller asked for, every time.
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
    }
  }, [isOpen, initialMode]);

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (mode === 'signup' && password.length < MIN_PASSWORD) {
      setErrorMessage(`Your password needs at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setIsLoading(true);
    try {
      const res =
        mode === 'login'
          ? await api.login({ email, password })
          : await api.signup({
              email,
              password,
              name: name.trim() || 'Learner',
              targetExam: targetExam.trim() || 'General learning',
              role: 'Active Student',
            });
      sounds.playRating(4);
      onSuccess(res.user);
      onClose();
    } catch (err: unknown) {
      sounds.playRating(1);
      setErrorMessage(err instanceof Error ? err.message : 'That didn’t work. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      busy={isLoading}
      size="sm"
      tint="var(--c-lilac)"
      title={isLogin ? 'Welcome back' : 'Create your account'}
      description={
        isLogin
          ? 'Sign in to get your decks and progress on this device.'
          : 'Free. Your decks and progress are saved to your account and follow you to every device.'
      }
    >
      <div className="st-seg" role="group" aria-label="Sign in or create an account">
        <button type="button" aria-pressed={isLogin} onClick={() => switchMode('login')}>
          Sign in
        </button>
        <button type="button" aria-pressed={!isLogin} onClick={() => switchMode('signup')}>
          Create account
        </button>
      </div>

      {errorMessage && (
        <div className="st-alert st-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        {!isLogin && (
          <Field label="Your name" htmlFor="auth-name">
            <input
              id="auth-name"
              className="st-text"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
            />
          </Field>
        )}

        <Field label="Email" htmlFor="auth-email">
          <input
            id="auth-email"
            className="st-text"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="auth-password"
          hint={!isLogin ? <span id="auth-password-hint">At least {MIN_PASSWORD} characters.</span> : undefined}
        >
          <div className="st-text-wrap">
            <input
              id="auth-password"
              className="st-text"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={isLogin ? undefined : MIN_PASSWORD}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              aria-describedby={!isLogin ? 'auth-password-hint' : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="st-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        {!isLogin && (
          <Field label="What are you studying for? (optional)" htmlFor="auth-goal" hint="For example JLPT N5 or a biology exam. Add the date later in your account to see a countdown.">
            <input
              id="auth-goal"
              className="st-text"
              type="text"
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              placeholder="JLPT N5"
            />
          </Field>
        )}

        <button type="submit" className="st-btn st-btn-primary st-btn-lg st-btn-block" disabled={isLoading}>
          {isLoading ? <span className="st-spinner" aria-label="Working" /> : isLogin ? 'Sign in' : 'Create account'}
        </button>

        <p className="st-center st-muted" style={{ margin: 0, fontWeight: 600 }}>
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <button type="button" className="st-link-btn" onClick={() => switchMode(isLogin ? 'signup' : 'login')}>
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </form>
    </Dialog>
  );
};
