import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { UserAccount } from '../../types/anki';
import { api } from '../../services/api';
import { sounds } from '../../services/audio';
import { KittyBow, AestheticMascot } from '../common/KittyIllustrations';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetExam, setTargetExam] = useState('Japanese N5 & General Learning');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        sounds.playRating(4);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.signup({
          email,
          password,
          name: name.trim() || 'Study Buddy',
          targetExam,
          role: 'Active Student',
        });
        sounds.playRating(4);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: unknown) {
      sounds.playRating(1);
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/35 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-pink-200/80 flex flex-col">
        
        {/* iOS Grabber */}
        <div className="pt-2.5 pb-1 flex justify-center bg-white/70">
          <div className="w-10 h-1 bg-pink-200 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-6 pt-3 pb-4 flex items-center justify-between border-b border-pink-100">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-pink-50 rounded-xl border border-pink-200/70 shadow-xs">
              <KittyBow size={18} />
            </span>
            <div>
              <div className="text-sm font-black text-kitty-dark tracking-tight">
                Ankitti Account Studio
              </div>
              <div className="text-[10px] text-kitty-subtle">Real-time database sync & progress backup</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-100/70 hover:bg-pink-200/70 text-kitty-subtle hover:text-kitty-dark flex items-center justify-center transition-colors ios-btn"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mascot Greeting */}
        <div className="px-6 pt-5 pb-2 text-center">
          <div className="w-20 h-20 mx-auto mb-2 relative mascot-float">
            <AestheticMascot pose="reading" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Join Ankitti Today'} 🎀
          </h2>
          <p className="text-xs text-kitty-subtle mt-0.5">
            {mode === 'login' 
              ? 'Sign in to access your spaced repetition decks and streaks' 
              : 'Create your account with a real SQLite database'}
          </p>
        </div>

        {/* iOS Segmented Mode Switcher */}
        <div className="px-6 py-2">
          <div className="p-1 bg-pink-100/60 rounded-2xl border border-pink-200/60 flex shadow-inner">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 rounded-xl font-extrabold text-xs transition-all ios-btn ${
                mode === 'login' 
                  ? 'bg-white text-pink-600 shadow-xs' 
                  : 'text-kitty-subtle hover:text-kitty-dark'
              }`}
            >
              Sign In 🎀
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 rounded-xl font-extrabold text-xs transition-all ios-btn ${
                mode === 'signup' 
                  ? 'bg-white text-pink-600 shadow-xs' 
                  : 'text-kitty-subtle hover:text-kitty-dark'
              }`}
            >
              Create Account ✨
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 my-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start space-x-2">
            <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-3 space-y-3.5 text-xs flex-1">
          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-kitty-dark mb-1 text-[11px]">
                Your Name / Nickname
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kitty-subtle" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Mimi, Alex, or Sakura"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-pink-200 text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-kitty-dark mb-1 text-[11px]">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kitty-subtle" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-pink-200 text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-kitty-dark mb-1 text-[11px]">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kitty-subtle" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-pink-200 text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-kitty-subtle hover:text-kitty-dark"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {mode === 'signup' && (
              <span className="text-[10px] text-kitty-subtle mt-1 block">Must be at least 6 characters</span>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-kitty-dark mb-1 text-[11px]">
                Primary Goal / Exam Focus
              </label>
              <div className="relative">
                <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kitty-subtle" />
                <input
                  type="text"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="e.g. Japanese JLPT N5, USMLE, Full-Stack"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-pink-200 text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs font-medium"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-[#FF4D80] hover:bg-[#F43F5E] text-white font-extrabold text-xs shadow-md shadow-pink-200 hover:shadow-lg transition-all flex items-center justify-center space-x-2 ios-btn cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Studio' : 'Create My Account'} 🎀</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="p-3.5 bg-white/70 border-t border-pink-100 text-center text-[11px] text-kitty-subtle font-medium">
          Secured with SHA-512 PBKDF2 Encryption • Privacy First 🎀
        </div>
      </div>
    </div>
  );
};
