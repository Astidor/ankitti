import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-cocoa-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF7F2] rounded-t-[28px] sm:rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden border border-[#EFE8DE] flex flex-col ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber */}
        <div className="pt-2 pb-1 flex justify-center bg-white/50 sm:hidden">
          <div className="w-10 h-1 bg-cocoa-200 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#EFE8DE] bg-white">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-strawberry-50 rounded-xl text-strawberry-600 border border-strawberry-100 flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-sm font-extrabold text-[#3E2D28] tracking-tight">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </div>
              <div className="text-[11px] text-cocoa-500">Sync your decks and progress across devices</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-cocoa-50 hover:bg-cocoa-100 text-cocoa-500 hover:text-[#3E2D28] transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mascot Greeting */}
        <div className="px-6 pt-5 pb-2 text-center">
          <div className="w-16 h-16 mx-auto mb-2 relative">
            <AestheticMascot pose="reading" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-lg font-extrabold text-[#3E2D28] tracking-tight">
            {mode === 'login' ? 'Welcome back, Study Buddy 🌸' : 'Start your cozy study journey'}
          </h2>
          <p className="text-xs text-cocoa-600 mt-0.5">
            {mode === 'login' 
              ? 'Enter your credentials to access your spaced repetition decks' 
              : 'Create your account to sync decks across all your devices'}
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="px-6 py-2">
          <div className="p-1 bg-white border border-[#EFE8DE] rounded-xl flex shadow-2xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-strawberry-500 text-white shadow-2xs' 
                  : 'text-cocoa-500 hover:text-[#3E2D28]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-strawberry-500 text-white shadow-2xs' 
                  : 'text-cocoa-500 hover:text-[#3E2D28]'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 my-2 p-3 bg-strawberry-50 border border-strawberry-200 rounded-xl text-strawberry-800 text-xs flex items-start space-x-2">
            <AlertCircle size={15} className="text-strawberry-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-3 space-y-3 text-xs flex-1">
          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-cocoa-700 mb-1 text-[11px]">
                Name / Nickname
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#EFE8DE] text-xs font-bold text-[#3E2D28] focus:outline-none focus:ring-2 focus:ring-strawberry-400/30 focus:border-strawberry-400 shadow-2xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-cocoa-700 mb-1 text-[11px]">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#EFE8DE] text-xs font-bold text-[#3E2D28] focus:outline-none focus:ring-2 focus:ring-strawberry-400/30 focus:border-strawberry-400 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-cocoa-700 mb-1 text-[11px]">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#EFE8DE] text-xs font-bold text-[#3E2D28] focus:outline-none focus:ring-2 focus:ring-strawberry-400/30 focus:border-strawberry-400 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cocoa-400 hover:text-cocoa-700 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {mode === 'signup' && (
              <span className="text-[10px] text-cocoa-400 mt-1 block">At least 6 characters</span>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-cocoa-700 mb-1 text-[11px]">
                Primary Study Goal (Optional)
              </label>
              <div className="relative">
                <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" />
                <input
                  type="text"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="e.g. Japanese JLPT N5, USMLE, Full-Stack"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#EFE8DE] text-xs font-bold text-[#3E2D28] focus:outline-none focus:ring-2 focus:ring-strawberry-400/30 focus:border-strawberry-400 shadow-2xs"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="squishy-btn w-full py-3 rounded-2xl bg-strawberry-500 hover:bg-strawberry-600 text-white font-bold text-xs shadow-squishy-pink transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="p-3 pb-safe bg-white/60 border-t border-[#EFE8DE] text-center text-[11px] text-cocoa-500 font-semibold">
          Secured with PBKDF2 Encryption • Privacy First 🌸
        </div>
      </div>
    </div>
  );
};
