import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layers, 
  Search, 
  BarChart2, 
  Timer,
  Home,
  Plus,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  FileEdit,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import { Deck, Card, UserAccount, ReviewLog, DeckStats } from './types/anki';
import { storage } from './services/storage';
import { api } from './services/api';
import { sounds } from './services/audio';
import { ImportResult } from './services/ankiImporter';

import { LandingPage } from './components/landing/LandingPage';
import { DeckList, deckColour } from './components/decks/DeckList';
import { DeckModal } from './components/decks/DeckModal';
import { MergeDeckModal } from './components/decks/MergeDeckModal';
import { StudySession, StudyFilterMode } from './components/study/StudySession';
import { CardEditorModal } from './components/cardEditor/CardEditorModal';
import { AnkiImportModal } from './components/ankiImport/AnkiImportModal';
import { StatsModal } from './components/stats/StatsModal';
import { DEFAULT_DECK_SETTINGS } from './services/scheduler';
import { AccountModal } from './components/account/AccountModal';
import { AuthModal } from './components/auth/AuthModal';
import { AiDeckModal } from './components/ai/AiDeckModal';
import { CardBrowser } from './components/browser/CardBrowser';
import { PomodoroWidget } from './components/common/PomodoroWidget';
import { KittyBow, KittyAvatar } from './components/common/KittyIllustrations';
import { CreateButton, CreateSheet } from './components/studio/Menus';
import './components/studio/studio.css';
import { PwaInstallModal } from './components/common/PwaInstallModal';
import { setThemePreference, useTheme } from './services/themePreference';
import { isAndroidApp, saveFile } from './services/nativeApp';

export function App() {
  const [account, setAccount] = useState<UserAccount>(storage.getActiveAccount());
  const [decks, setDecks] = useState<Deck[]>(storage.getDecks());
  const [cards, setCards] = useState<Card[]>(storage.getCards());
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>(storage.getReviewLogs());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(account.soundEnabled ?? true);

  // Opened as an app (the Android app and installed PWA launch with ?view=app): skip the
  // website and go straight to the decks, asking signed-out people to sign up or log in.
  const [launchedAsApp] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      isAndroidApp() ||
      new URLSearchParams(window.location.search).get('view') === 'app' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    );
  });

  // View state: 'landing' or 'app' (Default to landing page for web visitors)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'landing') return 'landing';
    }
    return launchedAsApp ? 'app' : 'landing';
  });

  // App Studio state
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [currentTab, setCurrentTab] = useState<'decks' | 'browser' | 'stats'>(
    (searchParams.get('tab') as any) || 'decks'
  );
  const [activeStudyDeck, setActiveStudyDeck] = useState<Deck | null>(() => {
    if (searchParams.get('study') === '1' && storage.getDecks().length > 0) {
      return storage.getDecks()[0];
    }
    return null;
  });
  const [studyMode, setStudyMode] = useState<StudyFilterMode>('due');
  const [isPomodoroOpen, setIsPomodoroOpen] = useState<boolean>(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState<boolean>(false);

  // Modals
  const [isCardEditorOpen, setIsCardEditorOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [targetDeckForCard, setTargetDeckForCard] = useState<Deck | null>(null);

  const [isDeckModalOpen, setIsDeckModalOpen] = useState<boolean>(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);
  const [mergeSourceDeck, setMergeSourceDeck] = useState<Deck | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // Auth & AI Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => launchedAsApp && !account.email);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [isAiDeckModalOpen, setIsAiDeckModalOpen] = useState<boolean>(false);
  const [aiDeckTargetDeck, setAiDeckTargetDeck] = useState<Deck | null>(null);

  // PWA & Offline State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  const { theme } = useTheme();
  const themeButton = (size: number) => (
    <button
      className="st-icon-btn"
      onClick={() => { sounds.playClick(); setThemePreference(theme === 'dark' ? 'light' : 'dark'); }}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );

  // The decks have replaced the prerendered website, so app launches can show #root again.
  useEffect(() => {
    document.documentElement.classList.remove('app-launch');
  }, []);

  // The Android app calls this on Back: close what's on top, else step back to My decks.
  // Returning false lets the app go back a page or close.
  useEffect(() => {
    (window as any).__ankittiBack = () => {
      if (document.querySelector('[role=dialog]')) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return true;
      }
      if (viewMode === 'landing') { setViewMode('app'); return true; }
      if (activeStudyDeck) { setActiveStudyDeck(null); return true; }
      if (currentTab !== 'decks') { setCurrentTab('decks'); return true; }
      return false;
    };
  }, [viewMode, activeStudyDeck, currentTab]);

  // Monitor connectivity & PWA install status
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone === true;
      setIsStandalone(Boolean(isStandaloneMode));
    };
    checkStandalone();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4500);

      if (account.email) {
        Promise.all([api.getDecks(), api.getCards()]).then(([remoteDecks, remoteCards]) => {
          if (remoteDecks && remoteDecks.length > 0) setDecks(remoteDecks);
          if (remoteCards && remoteCards.length > 0) setCards(remoteCards);
        }).catch(() => {});
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [account.email]);

  // Auto-sync with real cloud database if logged in
  useEffect(() => {
    async function initUserSession() {
      try {
        const user = await api.getMe();
        if (user) {
          storage.setActiveAccount(user.id);
          setAccount(user);
          const [remoteDecks, remoteCards] = await Promise.all([
            api.getDecks(),
            api.getCards(),
          ]);
          if (remoteDecks && remoteDecks.length > 0) setDecks(remoteDecks);
          if (remoteCards && remoteCards.length > 0) setCards(remoteCards);
        }
      } catch (err) {
        console.warn('Session init error:', err);
      }
    }
    initUserSession();
  }, []);

  // Track draft count for auto-save notifications
  const [hasAnyDraft, setHasAnyDraft] = useState<boolean>(false);

  const refreshDraftStatus = useCallback(() => {
    const drafts = storage.getAllDrafts();
    setHasAnyDraft(drafts.length > 0);
  }, []);

  useEffect(() => {
    refreshDraftStatus();
  }, [refreshDraftStatus, isCardEditorOpen]);

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewCard();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingDeck(null);
        setIsDeckModalOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsImportModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [decks]);

  const reloadData = async () => {
    const acc = storage.getActiveAccount();
    setAccount(acc);
    try {
      const [remoteDecks, remoteCards] = await Promise.all([
        api.getDecks(),
        api.getCards(),
      ]);
      setDecks(remoteDecks);
      setCards(remoteCards);
    } catch {
      setDecks(storage.getDecks());
      setCards(storage.getCards());
    }
    setReviewLogs(storage.getReviewLogs());
    setSoundEnabled(acc.soundEnabled ?? true);
    refreshDraftStatus();
  };

  const requireAuth = (action: () => void, mode: 'login' | 'signup' = 'signup') => {
    if (!account?.email) {
      setAuthModalMode(mode);
      setIsAuthModalOpen(true);
      return;
    }
    action();
  };

  const handleAuthSuccess = async (user: UserAccount) => {
    storage.setActiveAccount(user.id);
    setAccount(user);
    setIsAuthModalOpen(false);
    setViewMode('app');
    try {
      const [remoteDecks, remoteCards] = await Promise.all([
        api.getDecks(),
        api.getCards(),
      ]);
      setDecks(remoteDecks);
      setCards(remoteCards);
      sounds.playRating(4);
    } catch (err) {
      console.warn('Post-login sync error:', err);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    const guestAccount = storage.getActiveAccount();
    delete (guestAccount as any).email;
    setAccount(guestAccount);
    setDecks(storage.getDecks());
    setCards(storage.getCards());
    if (launchedAsApp) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    } else {
      setViewMode('landing');
    }
    sounds.playClick();
  };

  const handleOpenAiDeck = (deck?: Deck) => {
    sounds.playClick();
    setAiDeckTargetDeck(deck || null);
    setIsAiDeckModalOpen(true);
  };

  const handleAiDeckCreated = async (deck: Deck, newCards: Card[]) => {
    try {
      const exists = decks.some(d => d.id === deck.id);
      if (!exists) {
        await api.createDeck(deck);
      }
      for (const card of newCards) {
        await api.createCard(card);
      }
    } catch (err) {
      console.warn('AI deck cloud sync error (preserved locally):', err);
    }
    setDecks(storage.getDecks());
    setCards(storage.getCards());
    setIsAiDeckModalOpen(false);
    setAiDeckTargetDeck(null);
    sounds.playRating(4);
  };

  const handleSaveCard = async (card: Card) => {
    try {
      const exists = cards.some(c => c.id === card.id);
      if (exists) {
        await api.updateCard(card);
      } else {
        await api.createCard(card);
      }
    } catch (err) {
      storage.saveCard(card);
    }
    setCards(storage.getCards());
    refreshDraftStatus();
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await api.deleteCard(cardId);
    } catch {
      storage.deleteCard(cardId);
    }
    setCards(storage.getCards());
    refreshDraftStatus();
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setTargetDeckForCard(decks.find(d => d.id === card.deckId) || null);
    setIsCardEditorOpen(true);
  };

  const handleOpenNewCard = (deck?: Deck) => {
    sounds.playClick();
    setEditingCard(null);
    setTargetDeckForCard(deck || decks[0] || null);
    setIsCardEditorOpen(true);
  };

  const handleSaveDeck = async (deck: Deck) => {
    try {
      const exists = decks.some(d => d.id === deck.id);
      if (exists) {
        await api.updateDeck(deck);
      } else {
        await api.createDeck(deck);
      }
    } catch {
      storage.saveDeck(deck);
    }
    setDecks(storage.getDecks());
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck and all its flashcards?')) {
      try {
        await api.deleteDeck(deckId);
      } catch {
        storage.deleteDeck(deckId);
      }
      setDecks(storage.getDecks());
      setCards(storage.getCards());
      if (activeStudyDeck?.id === deckId) {
        setActiveStudyDeck(null);
      }
      sounds.playClick();
    }
  };

  const handleExportDeck = (deck: Deck) => {
    const deckCards = cards.filter(c => c.deckId === deck.id);
    const exportData = {
      deck,
      cards: deckCards,
      exportedAt: Date.now(),
      version: 'ankitti-1.0',
    };

    saveFile(`${deck.name.toLowerCase().replace(/\s+/g, '-')}-ankitti.json`, 'application/json', JSON.stringify(exportData, null, 2));
    sounds.playRating(4);
  };

  const handleOpenMergeDeck = (deck?: Deck) => {
    sounds.playClick();
    setMergeSourceDeck(deck || null);
    setIsMergeModalOpen(true);
  };

  const handleMergeDecks = async (
    sourceDeckId: string,
    targetDeckId: string,
    options: { deleteSourceDeck: boolean; tagMergedCards: boolean },
    newDeckData?: { name: string; icon: string; color: string }
  ) => {
    let finalTargetDeckId = targetDeckId;

    if (newDeckData) {
      const newDeck: Deck = {
        id: `deck_${Date.now()}`,
        name: newDeckData.name,
        description: `Merged from ${decks.find(d => d.id === sourceDeckId)?.name || 'deck'}`,
        icon: newDeckData.icon,
        color: newDeckData.color,
        settings: DEFAULT_DECK_SETTINGS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      try {
        await api.createDeck(newDeck);
      } catch {
        storage.saveDeck(newDeck);
      }
      finalTargetDeckId = newDeck.id;
    }

    try {
      await api.mergeDecks(sourceDeckId, finalTargetDeckId, options);
    } catch {
      storage.mergeDecks(sourceDeckId, finalTargetDeckId, options);
    }

    setDecks(storage.getDecks());
    setCards(storage.getCards());

    if (activeStudyDeck?.id === sourceDeckId && options.deleteSourceDeck) {
      setActiveStudyDeck(null);
    }
  };

  const handleUpdateCardAfterReview = (updatedCard: Card, rating: 1 | 2 | 3 | 4) => {
    storage.saveCard(updatedCard);
    api.updateCard(updatedCard).catch(e => console.warn(e));
    setCards(storage.getCards());

    const log: ReviewLog = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      cardId: updatedCard.id,
      deckId: updatedCard.deckId,
      rating,
      timeTakenMs: 1500,
      timestamp: Date.now(),
      prevInterval: 0,
      newInterval: updatedCard.interval,
      prevEase: 2.5,
      newEase: updatedCard.easeFactor,
    };

    storage.logReview(log);
    api.logReview(updatedCard.id, rating, updatedCard.state, updatedCard.interval, 0).catch(e => console.warn(e));
    setReviewLogs(storage.getReviewLogs());
    setAccount(storage.getActiveAccount());
  };

  const handleImportComplete = async (result: ImportResult, targetDeckId?: string) => {
    const cardsToImport = targetDeckId
      ? result.cards.map(c => ({ ...c, deckId: targetDeckId }))
      : result.cards;

    if (!targetDeckId) {
      result.decks.forEach(d => storage.saveDeck(d));
      setDecks(prev => {
        const existingIds = new Set(prev.map(d => d.id));
        const newDecks = result.decks.filter(d => !existingIds.has(d.id));
        return [...newDecks, ...prev];
      });
    }

    storage.bulkAddCards(cardsToImport);
    setCards(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const freshCards = cardsToImport.filter(c => !existingIds.has(c.id));
      return [...freshCards, ...prev];
    });

    sounds.playRating(4);

    try {
      if (!targetDeckId) {
        for (const d of result.decks) {
          await api.createDeck(d);
        }
      }
      await api.bulkCreateCards(cardsToImport);
    } catch (e) {
      console.warn('D1 sync on import error:', e);
    }
  };

  const getDeckStats = useCallback((deckId: string): DeckStats => {
    const deckCards = cards.filter(c => c.deckId === deckId);
    const now = Date.now();

    let newCount = 0;
    let learnCount = 0;
    let dueCount = 0;
    let matureCount = 0;
    let youngCount = 0;

    for (const card of deckCards) {
      if (card.suspended) continue;
      if (card.state === 'new') {
        newCount++;
      } else if (card.state === 'learning' || card.state === 'relearning') {
        learnCount++;
      } else if (card.due <= now) {
        dueCount++;
      }

      if (card.state === 'review') {
        if (card.interval >= 21) {
          matureCount++;
        } else {
          youngCount++;
        }
      }
    }

    return {
      total: deckCards.length,
      newCount,
      learnCount,
      dueCount,
      matureCount,
      youngCount,
    };
  }, [cards]);

  const hasDraftForDeck = (deckId: string): boolean => {
    return !!storage.getDraft(deckId);
  };

  // If in Landing Page mode, render LandingPage
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          decks={decks}
          user={account.email ? account : null}
          onLaunchApp={() => requireAuth(() => setViewMode('app'), 'signup')}
          onOpenDeck={(deck) => {
            requireAuth(() => {
              setActiveStudyDeck(deck);
              setStudyMode('due');
              setViewMode('app');
            }, 'login');
          }}
          onOpenImport={() => {
            requireAuth(() => {
              setViewMode('app');
              setIsImportModalOpen(true);
            }, 'signup');
          }}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />

        {!isOnline && (
          <div className="st st-banner st-banner-offline" role="status" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
            <WifiOff size={16} /> You’re offline. You can keep studying; changes save on this device.
          </div>
        )}

        {showOnlineToast && (
          <div className="st st-banner st-banner-online" role="status" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
            <CheckCircle2 size={16} /> Back online. Everything is synced.
          </div>
        )}

        <AnkiImportModal
          isOpen={isImportModalOpen}
          decks={decks}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={handleImportComplete}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        <AiDeckModal
          isOpen={isAiDeckModalOpen}
          decks={decks}
          initialDeckId={aiDeckTargetDeck?.id || null}
          onClose={() => {
            setIsAiDeckModalOpen(false);
            setAiDeckTargetDeck(null);
          }}
          onDeckCreated={handleAiDeckCreated}
          onNeedSignIn={() => {
            setIsAiDeckModalOpen(false);
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
        />

        <PwaInstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          installPrompt={installPrompt}
          onInstallSuccess={() => setIsStandalone(true)}
        />
      </>
    );
  }

  // ── Studio: sidebar on desktop, top bar and bottom dock on phones ──
  const totalDueToday = decks.reduce((sum, d) => {
    const st = getDeckStats(d.id);
    return sum + st.newCount + st.learnCount + st.dueCount;
  }, 0);

  const goTab = (tab: 'decks' | 'browser' | 'stats') => {
    sounds.playClick();
    setActiveStudyDeck(null);
    setCurrentTab(tab);
  };

  const createActions = {
    onAddCard: () => handleOpenNewCard(),
    onNewDeck: () => { setEditingDeck(null); setIsDeckModalOpen(true); },
    onImport: () => setIsImportModalOpen(true),
    onAi: () => handleOpenAiDeck(),
  };

  const isOn = (tab: 'decks' | 'browser' | 'stats') => (currentTab === tab && !activeStudyDeck ? 'page' : undefined);

  const NAV = [
    { tab: 'decks' as const, label: 'My decks', short: 'Decks', icon: Layers, count: totalDueToday, due: true },
    { tab: 'browser' as const, label: 'All cards', short: 'Cards', icon: Search, count: cards.length, due: false },
    { tab: 'stats' as const, label: 'Progress', short: 'Progress', icon: BarChart2, count: null as number | null, due: false },
  ];

  return (
    <div className="st st-shell">
      <aside className="st-side" aria-label="Studio">
        <button className="st-brand" onClick={() => goTab('decks')} aria-label="Ankitti, my decks">
          <KittyBow size={30} />
          ankitti
        </button>

        <CreateButton actions={createActions} />

        <nav className="st-nav" aria-label="Main">
          {NAV.map((n) => (
            <button key={n.tab} className="st-nav-item" aria-current={isOn(n.tab)} onClick={() => goTab(n.tab)}>
              <n.icon size={19} strokeWidth={2.4} />
              <span>{n.label}</span>
              {n.count !== null && n.count > 0 && (
                <span className={`st-count ${n.due ? 'st-count-due' : ''}`} title={n.due ? `${n.count} cards to review today` : `${n.count} cards`}>
                  {n.count}
                </span>
              )}
            </button>
          ))}
          <button
            className="st-nav-item"
            aria-pressed={isPomodoroOpen}
            onClick={() => { sounds.playClick(); setIsPomodoroOpen(!isPomodoroOpen); }}
          >
            <Timer size={19} strokeWidth={2.4} />
            <span>Focus timer</span>
          </button>
        </nav>

        {isPomodoroOpen && (
          <PomodoroWidget isOpen={true} isInline={true} />
        )}

        <div className="st-side-foot">
          {hasAnyDraft && (
            <button className="st-ghost" onClick={() => handleOpenNewCard()}>
              <FileEdit size={17} /> Finish your unsaved card
            </button>
          )}

          {!account.email && (
            <div className="st-guest">
              <p>You’re studying as a guest. Sign in to keep your cards on every device.</p>
              <button
                className="st-btn st-btn-secondary st-btn-sm st-btn-block"
                onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
              >
                Sign in or sign up
              </button>
            </div>
          )}

          <div className="st-account">
            <button className="st-account-btn" onClick={() => setIsAccountModalOpen(true)} title="Account and settings">
              <KittyAvatar size={36} />
              <span className="min-w-0">
                <span className="st-account-name block">{account.name}</span>
                <span className="st-account-sub">{account.email ? 'Saved to your account' : 'Guest'}</span>
              </span>
            </button>
            <button
              className="st-icon-btn"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
                if (next) sounds.playRating(4);
              }}
              aria-label={soundEnabled ? 'Turn sounds off' : 'Turn sounds on'}
              title={soundEnabled ? 'Turn sounds off' : 'Turn sounds on'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {themeButton(18)}
            <button
              className="st-icon-btn"
              onClick={() => { sounds.playClick(); setViewMode('landing'); }}
              aria-label="Go to the Ankitti website"
              title="Go to the Ankitti website"
            >
              <Home size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="st-main">
        <header className="st-topbar">
          <button className="st-brand" onClick={() => goTab('decks')} aria-label="Ankitti, my decks">
            <KittyBow size={26} />
            ankitti
          </button>
          <div className="flex items-center gap-1">
            <button
              className="st-icon-btn"
              onClick={() => setIsPomodoroOpen((prev) => !prev)}
              aria-label="Focus timer"
              title="Focus timer"
            >
              <Timer size={20} />
            </button>
            {themeButton(20)}
            <button className="st-icon-btn" onClick={() => setIsAccountModalOpen(true)} aria-label="Account and settings">
              <KittyAvatar size={30} />
            </button>
          </div>
        </header>

        {!isOnline && (
          <div className="st-banner st-banner-offline" role="status">
            <WifiOff size={16} /> You’re offline. You can keep studying; changes save on this device.
          </div>
        )}
        {showOnlineToast && (
          <div className="st-banner st-banner-online" role="status">
            <CheckCircle2 size={16} /> Back online. Everything is synced.
          </div>
        )}

        <main className="st-canvas">
          {activeStudyDeck ? (
            <StudySession
              deck={activeStudyDeck}
              cards={cards.filter(c => c.deckId === activeStudyDeck.id)}
              initialFilterMode={studyMode}
              initialMode={studyMode}
              onBack={() => setActiveStudyDeck(null)}
              onUpdateCard={handleUpdateCardAfterReview}
              onEditCard={handleEditCard}
            />
          ) : (
            <>
              {currentTab === 'decks' && (
                <DeckList
                  decks={decks}
                  getDeckStats={getDeckStats}
                  hasDraftForDeck={hasDraftForDeck}
                  onStudyDeck={(deck, mode = 'due') => {
                    setActiveStudyDeck(deck);
                    setStudyMode(mode);
                  }}
                  onAddCardToDeck={(deck) => handleOpenNewCard(deck)}
                  onEditDeck={(deck) => { setEditingDeck(deck); setIsDeckModalOpen(true); }}
                  onDeleteDeck={handleDeleteDeck}
                  onExportDeck={handleExportDeck}
                  onCreateDeck={() => { setEditingDeck(null); setIsDeckModalOpen(true); }}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onOpenAiDeck={(deck) => handleOpenAiDeck(deck)}
                  onMergeDeck={handleOpenMergeDeck}
                />
              )}

              {currentTab === 'browser' && (
                <CardBrowser
                  decks={decks}
                  cards={cards}
                  onEditCard={handleEditCard}
                  onDeleteCard={handleDeleteCard}
                  onNewCard={() => handleOpenNewCard()}
                />
              )}

              {currentTab === 'stats' && (
                <div className="max-w-4xl mx-auto">
                  <StatsModal
                    isOpen={true}
                    isInline={true}
                    account={account}
                    decks={decks}
                    cards={cards}
                    reviewLogs={reviewLogs}
                    onClose={() => setCurrentTab('decks')}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating focus timer on phones */}
      <div className="md:hidden">
        <PomodoroWidget isOpen={isPomodoroOpen} onClose={() => setIsPomodoroOpen(false)} />
      </div>

      {!activeStudyDeck && (
        <nav className="st-dock" aria-label="Main">
          {NAV.slice(0, 2).map((n) => (
            <button key={n.tab} className="st-dock-item" aria-current={isOn(n.tab)} onClick={() => goTab(n.tab)}>
              <n.icon size={22} strokeWidth={2.4} />
              {n.short}
            </button>
          ))}
          <button className="st-dock-create" onClick={() => { sounds.playClick(); setIsCreateSheetOpen(true); }} aria-label="Create">
            <Plus size={26} strokeWidth={3} />
          </button>
          <button className="st-dock-item" aria-current={isOn('stats')} onClick={() => goTab('stats')}>
            <BarChart2 size={22} strokeWidth={2.4} />
            Progress
          </button>
          <button className="st-dock-item" onClick={() => setIsAccountModalOpen(true)}>
            <KittyAvatar size={24} />
            Me
          </button>
        </nav>
      )}

      <CreateSheet open={isCreateSheetOpen} onClose={() => setIsCreateSheetOpen(false)} actions={createActions} />

      {/* Global Modals */}
      {(targetDeckForCard || decks[0]) && (
        <CardEditorModal
          isOpen={isCardEditorOpen}
          editingCard={editingCard}
          deck={targetDeckForCard || decks[0]}
          decks={decks}
          onClose={() => setIsCardEditorOpen(false)}
          onSaveCard={handleSaveCard}
        />
      )}

      <DeckModal
        isOpen={isDeckModalOpen}
        editingDeck={editingDeck}
        displayColour={editingDeck ? deckColour(editingDeck, Math.max(0, decks.findIndex((d) => d.id === editingDeck.id))) : undefined}
        onClose={() => setIsDeckModalOpen(false)}
        onSaveDeck={handleSaveDeck}
      />

      <MergeDeckModal
        isOpen={isMergeModalOpen}
        decks={decks}
        initialSourceDeck={mergeSourceDeck}
        getDeckCardCount={(deckId) => cards.filter(c => c.deckId === deckId).length}
        onClose={() => setIsMergeModalOpen(false)}
        onMergeDecks={handleMergeDecks}
      />

      <AnkiImportModal
        isOpen={isImportModalOpen}
        decks={decks}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        currentAccount={account}
        onClose={() => setIsAccountModalOpen(false)}
        onAccountChange={(acc) => {
          setAccount(acc);
          reloadData();
        }}
        onResetData={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onOpenAuth={(mode) => {
          setIsAccountModalOpen(false);
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenInstall={isAndroidApp() ? undefined : () => setIsInstallModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <AiDeckModal
        isOpen={isAiDeckModalOpen}
        decks={decks}
        initialDeckId={aiDeckTargetDeck?.id || null}
        onClose={() => {
          setIsAiDeckModalOpen(false);
          setAiDeckTargetDeck(null);
        }}
        onDeckCreated={handleAiDeckCreated}
        onNeedSignIn={() => {
          setIsAiDeckModalOpen(false);
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
        }}
      />

      <PwaInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        installPrompt={installPrompt}
        onInstallSuccess={() => setIsStandalone(true)}
      />
    </div>
  );
}

export default App;
