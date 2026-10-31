import React, { useEffect, useState } from 'react';
import { Check, Download, LogOut, Moon, Smartphone, Sun, Trash2, UserX, Volume2, VolumeX } from 'lucide-react';
import { setThemePreference, useTheme } from '../../services/themePreference';
import { UserAccount } from '../../types/anki';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { sounds } from '../../services/audio';
import { KittyAvatar } from '../common/KittyIllustrations';
import { Dialog, Field } from '../studio/Dialog';

interface AccountModalProps {
  isOpen: boolean;
  currentAccount: UserAccount;
  onClose: () => void;
  onAccountChange: (account: UserAccount) => void;
  onResetData: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onLogout?: () => void;
  onOpenInstall?: () => void;
}

const GOAL_OPTIONS = [
  'JLPT N5 Japanese',
  'Conversational Spanish',
  'Computer science',
  'Medical school',
  'Bar exam',
  'SAT / ACT',
  'General learning',
];

// Values the app fills in by itself; shown as empty so they don't look like the learner's own goal.
const PLACEHOLDER_GOALS = ['Daily Retention', 'General Studies', 'General learning'];
const ownGoal = (goal: string) => (PLACEHOLDER_GOALS.includes(goal) ? '' : goal);

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  currentAccount,
  onClose,
  onAccountChange,
  onResetData,
  onOpenAuth,
  onLogout,
  onOpenInstall,
}) => {
  const [name, setName] = useState(currentAccount.name);
  const [targetExam, setTargetExam] = useState(ownGoal(currentAccount.targetExam));
  const [examDate, setExamDate] = useState(currentAccount.examDateSet ? currentAccount.examDate : '');
  const [soundEnabled, setSoundEnabled] = useState(currentAccount.soundEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, preference } = useTheme();

  // Start from the account as it is now each time the dialog opens.
  useEffect(() => {
    if (!isOpen) return;
    setName(currentAccount.name);
    setTargetExam(ownGoal(currentAccount.targetExam));
    setExamDate(currentAccount.examDateSet ? currentAccount.examDate : '');
    setSoundEnabled(currentAccount.soundEnabled ?? true);
    setSaved(false);
    setDeleteOpen(false);
    setDeletePassword('');
    setDeleteError('');
  }, [isOpen, currentAccount]);

  const isGuest = !currentAccount.email;

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    const updated: UserAccount = {
      ...currentAccount,
      name: name.trim() || currentAccount.name,
      targetExam: targetExam.trim(),
      // The server needs a date; an empty field keeps the old one but marks it as not set.
      examDate: examDate || currentAccount.examDate,
      examDateSet: !!examDate,
      soundEnabled,
    };
    try {
      if (currentAccount.email) await api.updateProfile(updated);
    } catch {
      // Offline: saved on this device and synced later.
    }
    storage.saveAccount(updated);
    sounds.enabled = soundEnabled;
    onAccountChange(updated);
    sounds.playRating(4);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportBackup = () => {
    const data = storage.exportAllAsJSON();
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ankitti-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playRating(4);
  };

  const handleErase = () => {
    const message = isGuest
      ? 'This deletes every deck, card and review on this device. It can’t be undone. Download a backup first if you might want them back.\n\nErase everything?'
      : 'This removes everything stored on this device and signs you out. Cards saved to your account stay there and come back when you sign in again.\n\nErase this device?';
    if (confirm(message)) {
      onResetData();
      onClose();
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.deleteAccount(deletePassword);
      onResetData();
      onClose();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete the account.');
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      tint="var(--c-lilac)"
      title="Account and settings"
      description={isGuest ? 'You’re using Ankitti as a guest. Everything is saved on this device only.' : `Signed in as ${currentAccount.email}.`}
      footer={
        <>
          <button className="st-btn st-btn-secondary" onClick={onClose}>Close</button>
          <button className="st-btn st-btn-primary" onClick={() => handleSave()} disabled={isSaving}>
            {saved ? (<><Check size={18} strokeWidth={3} /> Saved</>) : 'Save changes'}
          </button>
        </>
      }
    >
      {/* Who you are */}
      <section style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <KittyAvatar size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="st-display" style={{ margin: 0, fontSize: '1.25rem' }}>{currentAccount.name}</p>
          <p className="st-muted" style={{ margin: 0, fontWeight: 600, overflowWrap: 'anywhere' }}>{currentAccount.email || 'Guest on this device'}</p>
        </div>
        {!isGuest && onLogout && (
          <button className="st-btn st-btn-secondary st-btn-sm" onClick={() => { onClose(); onLogout(); }}>
            <LogOut size={16} /> Sign out
          </button>
        )}
      </section>

      {isGuest && (
        <div className="st-alert st-alert-warn">
          <span style={{ flex: 1 }}>
            <strong>Keep your cards safe.</strong> Create a free account and your decks follow you to every phone and computer.
          </span>
          <button className="st-btn st-btn-secondary st-btn-sm" onClick={() => { onClose(); onOpenAuth?.('signup'); }}>
            Sign in or sign up
          </button>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gap: 16 }}>
        <Field label="Your name" htmlFor="acc-name">
          <input id="acc-name" className="st-text" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <Field label="What you’re studying for" htmlFor="acc-goal">
            <input
              id="acc-goal"
              className="st-text"
              type="text"
              list="acc-goal-options"
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              placeholder="JLPT N5"
            />
            <datalist id="acc-goal-options">
              {GOAL_OPTIONS.map((opt) => <option key={opt} value={opt} />)}
            </datalist>
          </Field>
          <Field label="Exam date (optional)" htmlFor="acc-date" hint="Progress counts down to it.">
            <input id="acc-date" className="st-text" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </Field>
        </div>

        <button
          type="button"
          className="st-option"
          role="switch"
          aria-checked={soundEnabled}
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sounds.enabled = next;
            if (next) sounds.playRating(4);
          }}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <span style={{ flex: 1 }}>
            <span className="st-option-title">Sounds</span>
            <span className="st-option-sub">Soft clicks when you flip and rate cards</span>
          </span>
          <span className="st-option-title">{soundEnabled ? 'On' : 'Off'}</span>
        </button>
        <div className="st-option" style={{ cursor: 'default' }}>
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          <span style={{ flex: 1 }}>
            <span className="st-option-title">Appearance</span>
            <span className="st-option-sub">{preference === 'system' ? 'Follows this device' : 'Saved on this device'}</span>
          </span>
        </div>
        <div className="st-seg" role="group" aria-label="Appearance" style={{ marginTop: -8 }}>
          {(['system', 'light', 'dark'] as const).map((p) => (
            <button key={p} type="button" aria-pressed={preference === p} onClick={() => { sounds.playClick(); setThemePreference(p); }}>
              {p === 'system' ? 'System' : p === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        {onOpenInstall && (
          <button type="button" className="st-option" onClick={() => { onClose(); onOpenInstall(); }}>
            <Smartphone size={20} />
            <span style={{ flex: 1 }}>
              <span className="st-option-title">Install on this device</span>
              <span className="st-option-sub">Open Ankitti like an app, even offline</span>
            </span>
          </button>
        )}
        {/* Lets Enter in a field save the form */}
        <button type="submit" hidden />
      </form>

      <section style={{ display: 'grid', gap: 10 }}>
        <h3 className="st-display" style={{ margin: 0, fontSize: '1.125rem' }}>Your data</h3>
        <button type="button" className="st-option" onClick={handleExportBackup}>
          <Download size={20} />
          <span>
            <span className="st-option-title">Download a backup</span>
            <span className="st-option-sub">Every deck, card and review as one .json file</span>
          </span>
        </button>
        <button type="button" className="st-option" onClick={handleErase} style={{ color: 'var(--c-due)' }}>
          <Trash2 size={20} />
          <span>
            <span className="st-option-title">{isGuest ? 'Erase everything' : 'Erase this device'}</span>
            <span className="st-option-sub">
              {isGuest ? 'Deletes all decks and cards here and starts fresh' : 'Clears this device and signs you out. Your account keeps its cards.'}
            </span>
          </span>
        </button>
        {!isGuest && !deleteOpen && (
          <button type="button" className="st-option" onClick={() => setDeleteOpen(true)} style={{ color: 'var(--c-due)' }}>
            <UserX size={20} />
            <span>
              <span className="st-option-title">Delete account</span>
              <span className="st-option-sub">Erases your account and every deck, card and review saved to it</span>
            </span>
          </button>
        )}
        {!isGuest && deleteOpen && (
          <form onSubmit={handleDeleteAccount} className="st-alert st-alert-error" style={{ display: 'grid', gap: 12 }}>
            <span>
              <strong>Delete your account for good?</strong> Your decks, cards, reviews and drafts are erased from
              our servers straight away, and this can’t be undone. Download a backup first if you might want them.
            </span>
            <Field label="Type your password to confirm" htmlFor="acc-delete-pw">
              <input
                id="acc-delete-pw"
                className="st-text"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
            </Field>
            {deleteError && <span role="alert" style={{ fontWeight: 700 }}>{deleteError}</span>}
            <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="st-btn st-btn-secondary st-btn-sm" onClick={() => setDeleteOpen(false)}>Keep my account</button>
              <button type="submit" className="st-btn st-btn-primary st-btn-sm" disabled={isDeleting || !deletePassword}>
                {isDeleting ? 'Deleting…' : 'Delete account'}
              </button>
            </span>
          </form>
        )}
        <a href="/privacy/" className="st-muted" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Privacy policy</a>
      </section>
    </Dialog>
  );
};
