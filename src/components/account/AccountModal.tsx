import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw, 
  Check, 
  Mail, 
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* iOS Grabber & Header */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-slate-50 sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-500 border border-rose-100 flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight">
                Account & Preferences
              </div>
              <div className="text-[11px] text-slate-500">Manage your study profile and data backups</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* User Identity & Cloud Sync Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  <KittyAvatar size={32} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{currentAccount.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                    <Mail size={12} className="text-slate-400" />
                    <span>{currentAccount.email || 'Local Guest Mode (This Device)'}</span>
                  </div>
                </div>
              </div>

              {currentAccount.email ? (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                  <Cloud size={12} className="text-emerald-600" />
                  <span>Cloud Synced</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold">
                  <CloudOff size={12} className="text-amber-600" />
                  <span>Local Only</span>
                </div>
              )}
            </div>

            {/* Cloud Storage CTA */}
            {!currentAccount.email && (
              <div className="pt-2 border-t border-slate-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-600 leading-snug">
                    <strong className="text-slate-800 font-semibold">Want to study across multiple devices?</strong> Create an account for automatic cloud backup.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth?.('signup');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-[11px] flex items-center justify-center space-x-1.5 shadow-2xs shrink-0 cursor-pointer transition-all"
                  >
                    <Cloud size={13} />
                    <span>Enable Cloud Sync</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Details Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="font-semibold text-slate-800 text-xs flex items-center space-x-1.5 border-b border-slate-100 pb-2">
              <Sparkles size={14} className="text-rose-500" />
              <span>Study Preferences</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Learner Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Role / Specialization
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Student, Engineer, Polyglot"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Primary Learning Goal
                </label>
                <input
                  type="text"
                  list="goal-options"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="e.g. Japanese JLPT N5, USMLE"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-2xs"
                />
                <datalist id="goal-options">
                  {GOAL_OPTIONS.map(opt => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Daily Card Target
                  </label>
                  <span className="text-xs font-semibold text-rose-600 font-mono">
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
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                {soundEnabled ? <Volume2 size={16} className="text-rose-500" /> : <VolumeX size={16} className="text-slate-400" />}
                <div>
                  <span className="font-semibold text-slate-800 block text-xs">Audio Feedback</span>
                  <span className="text-[10px] text-slate-500">Audio chimes on card flips and rating choices</span>
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
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? <Check size={14} /> : <Sparkles size={14} />}
                <span>{saveSuccess ? 'Changes Saved' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>

          {/* Backup & Data Management */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <span className="font-semibold text-slate-800 block text-xs">
              Data Management & Backup
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Download size={13} className="text-slate-500" />
                <span>Export Backup (.json)</span>
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
                className="px-3.5 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-medium text-xs shadow-2xs flex items-center space-x-1.5 ml-auto cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset to Starters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
