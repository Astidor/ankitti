import React, { useState } from 'react';
import { 
  X, 
  User, 
  Sparkles, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw, 
  Check, 
  Mail, 
  Target,
  ShieldCheck,
  Cloud,
  CloudOff
} from 'lucide-react';
import { UserAccount } from '../../types/anki';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { sounds } from '../../services/audio';
import { KittyBow, KittyAvatar } from '../common/KittyIllustrations';

interface AccountModalProps {
  isOpen: boolean;
  currentAccount: UserAccount;
  onClose: () => void;
  onAccountChange: (account: UserAccount) => void;
  onResetData: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

const GOAL_OPTIONS = [
  'JLPT N5 Japanese',
  'Conversational Spanish',
  'Computer Science & Algorithms',
  'Full-Stack Web Development',
  'AWS Cloud Solutions',
  'USMLE & Human Physiology',
  'Bar Exam / Law School',
  'SAT / ACT Prep',
  'General Knowledge & Lifelong Learning',
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  currentAccount,
  onClose,
  onAccountChange,
  onResetData,
  onOpenAuth,
}) => {
  const [name, setName] = useState<string>(currentAccount.name);
  const [role, setRole] = useState<string>(currentAccount.role);
  const [targetExam, setTargetExam] = useState<string>(currentAccount.targetExam);
  const [examDate, setExamDate] = useState<string>(currentAccount.examDate);
  const [dailyGoal, setDailyGoal] = useState<number>(currentAccount.dailyGoal || 25);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(currentAccount.soundEnabled ?? true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated: UserAccount = {
      ...currentAccount,
      name: name.trim(),
      role: role.trim(),
      targetExam: targetExam.trim(),
      examDate,
      dailyGoal,
      soundEnabled,
    };

    try {
      if (currentAccount.email) {
        await api.updateProfile(updated);
      }
    } catch {
      // Fallback to local storage if offline
    }

    storage.saveAccount(updated);
    sounds.enabled = soundEnabled;
    onAccountChange(updated);
    sounds.playRating(4);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportBackup = () => {
    const data = storage.exportAllAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ankitti_backup_${(currentAccount.email || 'export').replace(/\W+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playRating(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/35 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-[32px] w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-pink-200/80">
        
        {/* iOS Grabber & Header */}
        <div className="pt-2.5 pb-1 px-4 flex justify-center bg-white/70">
          <div className="w-10 h-1 bg-pink-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 bg-white/80 border-b border-pink-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-pink-50 rounded-xl border border-pink-200/60 shadow-xs flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-sm font-black text-kitty-dark tracking-tight">
                Account & Study Settings
              </div>
              <div className="text-[10px] text-kitty-subtle">Personalize your learning profile & backups</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-100/70 hover:bg-pink-200/70 text-kitty-subtle hover:text-kitty-dark flex items-center justify-center transition-colors ios-btn cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* User Identity & Cloud Sync Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 flex items-center justify-center shadow-xs">
                  <KittyAvatar size={34} />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-800">{currentAccount.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                    <Mail size={12} className="text-pink-500" />
                    <span>{currentAccount.email || 'Local Guest Mode (This Device)'}</span>
                  </div>
                </div>
              </div>

              {currentAccount.email ? (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  <Cloud size={12} className="text-emerald-600" />
                  <span>Cloud Synced</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                  <CloudOff size={12} className="text-amber-600" />
                  <span>Local Only</span>
                </div>
              )}
            </div>

            {/* If unauthenticated, show high-yield Cloud Storage CTA */}
            {!currentAccount.email && (
              <div className="pt-2 border-t border-pink-100/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-600 leading-snug">
                    <strong className="text-slate-800">Want to study across your phone & laptop?</strong> Create an account to enable cloud storage and automatic backup.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth?.('signup');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#ff3366] hover:bg-[#e11d48] text-white font-extrabold text-[11px] flex items-center justify-center space-x-1.5 shadow-xs shrink-0 cursor-pointer transition-all"
                  >
                    <Cloud size={13} />
                    <span>Enable Cloud Sync</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Details Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 bg-white p-5 rounded-2xl border border-pink-100 shadow-xs">
            <div className="font-extrabold text-kitty-dark text-xs flex items-center space-x-1.5 border-b border-pink-50 pb-2">
              <Sparkles size={14} className="text-pink-600" />
              <span>Learning Preferences</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Learner Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white font-bold text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Specialization / Persona
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Student, Engineer, Polyglot"
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Primary Learning Goal / Exam
                </label>
                <input
                  type="text"
                  list="goal-options"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="e.g. Japanese JLPT N5, USMLE, Python"
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white font-bold text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs"
                />
                <datalist id="goal-options">
                  {GOAL_OPTIONS.map(opt => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-xs font-mono focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Daily Card Target
                  </label>
                  <span className="text-xs font-bold text-pink-600 font-mono">
                    {dailyGoal} cards / day
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between pt-2.5 border-t border-pink-50">
              <div className="flex items-center space-x-2">
                {soundEnabled ? <Volume2 size={16} className="text-pink-600" /> : <VolumeX size={16} className="text-gray-400" />}
                <div>
                  <span className="font-bold text-kitty-dark block text-xs">Kawaii Sound FX</span>
                  <span className="text-[10px] text-kitty-subtle">Tactile sound effects on card flips & ratings</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    setSoundEnabled(e.target.checked);
                    sounds.enabled = e.target.checked;
                    if (e.target.checked) sounds.playRating(4);
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-pink-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pink-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4D80]"></div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-[#FF4D80] hover:bg-[#F43F5E] text-white font-extrabold text-xs shadow-md shadow-pink-200 hover:shadow-lg transition-all flex items-center space-x-1.5 ios-btn cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? <Check size={14} /> : <Sparkles size={14} />}
                <span>{saveSuccess ? 'Changes Saved!' : 'Save Settings 🎀'}</span>
              </button>
            </div>
          </form>

          {/* Backup & Data Management */}
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200/70 space-y-3">
            <span className="font-extrabold text-kitty-dark block text-xs">
              💾 Data Backup & Disaster Recovery
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-4 py-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-100/70 text-kitty-dark font-bold text-xs shadow-xs flex items-center space-x-1.5 ios-btn cursor-pointer"
              >
                <Download size={13} className="text-pink-600" />
                <span>Export Full Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset your decks and cards to the initial starter collections?')) {
                    onResetData();
                    sounds.playRating(3);
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs shadow-xs flex items-center space-x-1.5 ml-auto ios-btn cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset to Starter Decks</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/80 border-t border-pink-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-pink-100 hover:bg-pink-200/70 text-kitty-dark font-bold text-xs transition-colors ios-btn cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
