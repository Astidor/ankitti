import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layers, 
  Search, 
  BarChart2, 
  Timer,
  Clock,
  Home,
  Plus,
  Volume2,
  VolumeX,
  FileEdit,
  ArrowLeft,
  Sparkles,
  LogOut,
  Smartphone,
  WifiOff,
  Cloud,
  CheckCircle2,
  Sprout
} from 'lucide-react';
import { Deck, Card, UserAccount, ReviewLog, DeckStats } from './types/anki';
import { storage } from './services/storage';
import { api } from './services/api';
import { sounds } from './services/audio';
import { ImportResult } from './services/ankiImporter';

import { LandingPage } from './components/landing/LandingPage';
import { DeckList } from './components/decks/DeckList';
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
import { KittyBow, KittyAvatar, AestheticMascot } from './components/common/KittyIllustrations';
import { PwaInstallModal } from './components/common/PwaInstallModal';

export function App() {
  const [account, setAccount] = useState<UserAccount>(storage.getActiveAccount());
  const [decks, setDecks] = useState<Deck[]>(storage.getDecks());
  const [cards, setCards] = useState<Card[]>(storage.getCards());
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>(storage.getReviewLogs());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(account.soundEnabled ?? true);

  // View state: 'landing' or 'app' (Default to app)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('app');

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isAiDeckModalOpen, setIsAiDeckModalOpen] = useState<boolean>(false);
  const [aiDeckTargetDeck, setAiDeckTargetDeck] = useState<Deck | null>(null);

  // PWA & Offline State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

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
    setViewMode('landing');
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

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.toLowerCase().replace(/\s+/g, '-')}-ankitti.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center space-x-2 shadow-md">
            <WifiOff size={14} className="shrink-0 animate-pulse" />
            <span>📡 Offline Mode Active — Studying works completely offline!</span>
          </div>
        )}

        {showOnlineToast && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-matcha-600 text-white text-xs font-bold py-2 px-5 rounded-full text-center flex items-center justify-center space-x-2 shadow-lg animate-fadeIn">
            <span>✨ Back online! Synced smoothly with cloud.</span>
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

  // 🌸 APP STUDIO: REFINED SIDEBAR CADDY + ATELIER WORKSPACE 🌸
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-cocoa-900 flex flex-col md:flex-row font-sans select-auto relative overflow-x-hidden">
      
      {/* 🍱 REFINED LEFT SIDEBAR CADDY (DESKTOP & TABLET) 🍱 */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 h-screen sticky top-0 bg-white border-r border-[#EAE4DC] p-4 justify-between shrink-0 shadow-xs z-30 select-none">
        
        {/* Top Segment: Brand, Nav & Add Action */}
        <div className="space-y-4">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-1">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveStudyDeck(null);
                setCurrentTab('decks');
              }}
              className="flex items-center space-x-2.5 text-left group cursor-pointer"
              title="Ankitti Studio"
            >
              <div className="w-8 h-8 rounded-xl bg-strawberry-50 border border-strawberry-100 text-strawberry-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <KittyBow size={18} />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-cocoa-900 block leading-tight">
                  Ankitti
                </span>
                <span className="text-[10px] font-semibold text-strawberry-600 tracking-wider uppercase block">
                  Study Studio
                </span>
              </div>
            </button>
          </div>

          {/* Primary Action Button: Add Flashcard */}
          <button
            onClick={() => handleOpenNewCard()}
            className="w-full py-2 px-3 rounded-xl bg-strawberry-500 hover:bg-strawberry-600 active:scale-98 text-white font-semibold text-xs shadow-rose-btn hover:shadow-rose-btn-hover flex items-center justify-center space-x-2 transition-all atelier-btn cursor-pointer"
            title="Create a new flashcard (Shortcut: Cmd/Ctrl+N)"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>New Flashcard</span>
            <kbd className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-mono font-normal">⌘N</kbd>
          </button>

          {/* Persistent Sidebar Navigation Links */}
          <nav className="space-y-1 text-xs font-medium pt-1">
            
            {/* Decks Tab */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveStudyDeck(null);
                setCurrentTab('decks');
              }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'decks' && !activeStudyDeck
                  ? 'bg-strawberry-50 text-strawberry-700 font-bold border border-strawberry-100 shadow-2xs'
                  : 'text-cocoa-600 hover:bg-cocoa-50 hover:text-cocoa-900'
              }`}
            >
              <Layers size={15} className={currentTab === 'decks' && !activeStudyDeck ? 'text-strawberry-600' : 'text-cocoa-400'} />
              <span className="flex-1 text-left">My Decks</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cocoa-100/80 text-cocoa-600 font-semibold">
                {decks.length}
              </span>
            </button>

            {/* Card Browser Tab */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveStudyDeck(null);
                setCurrentTab('browser');
              }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'browser' && !activeStudyDeck
                  ? 'bg-strawberry-50 text-strawberry-700 font-bold border border-strawberry-100 shadow-2xs'
                  : 'text-cocoa-600 hover:bg-cocoa-50 hover:text-cocoa-900'
              }`}
            >
              <Search size={15} className={currentTab === 'browser' && !activeStudyDeck ? 'text-strawberry-600' : 'text-cocoa-400'} />
              <span className="flex-1 text-left">Card Catalog</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cocoa-100/80 text-cocoa-600 font-semibold">
                {cards.length}
              </span>
            </button>

            {/* Study Garden & Stats Tab */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveStudyDeck(null);
                setCurrentTab('stats');
              }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'stats' && !activeStudyDeck
                  ? 'bg-strawberry-50 text-strawberry-700 font-bold border border-strawberry-100 shadow-2xs'
                  : 'text-cocoa-600 hover:bg-cocoa-50 hover:text-cocoa-900'
              }`}
            >
              <BarChart2 size={15} className={currentTab === 'stats' && !activeStudyDeck ? 'text-strawberry-600' : 'text-cocoa-400'} />
              <span className="flex-1 text-left">Garden & Stats</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-matcha-100 text-matcha-800 font-semibold">
                Heatmap
              </span>
            </button>

            {/* Collapsible Focus Pomodoro */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsPomodoroOpen(!isPomodoroOpen);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                isPomodoroOpen
                  ? 'bg-cocoa-100 text-cocoa-900 font-semibold border border-[#EAE4DC]'
                  : 'text-cocoa-600 hover:bg-cocoa-50 hover:text-cocoa-900'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Clock size={15} className="text-strawberry-500" />
                <span>Focus Timer</span>
              </span>
              <span className="text-[10px] font-mono text-cocoa-400 bg-cocoa-100 px-1.5 py-0.5 rounded">25m</span>
            </button>
          </nav>

          {/* Embedded Pomodoro Dropdown if Active */}
          {isPomodoroOpen && (
            <div className="p-3 bg-cocoa-50 rounded-2xl border border-[#EAE4DC] shadow-subtle animate-fadeIn">
              <PomodoroWidget 
                isOpen={true} 
                isInline={true} 
              />
            </div>
          )}
        </div>

        {/* Bottom Segment: Companion Mascot, User Profile & Status */}
        <div className="space-y-2.5 pt-3 border-t border-[#EAE4DC]">
          
          {hasAnyDraft && (
            <button
              onClick={() => handleOpenNewCard()}
              className="w-full flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-honey-50 border border-honey-200 text-honey-800 text-xs font-medium shadow-2xs cursor-pointer hover:bg-honey-100 transition-colors"
            >
              <FileEdit size={12} className="text-honey-600 shrink-0" />
              <span className="truncate">Draft Card Saved</span>
            </button>
          )}

          {/* Mascot Study Companion Mini Pill */}
          <div className="p-2.5 rounded-xl bg-cocoa-50 border border-[#EAE4DC] flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#EAE4DC] p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
              <img 
                src="/assets/reading_mascot.png" 
                alt="Companion" 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-cocoa-900 truncate">
                Study Buddy 🌸
              </div>
              <div className="text-[10px] text-cocoa-500 truncate">
                {activeStudyDeck ? `In: ${activeStudyDeck.name}` : 'Ready for focus session!'}
              </div>
            </div>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EAE4DC]">
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center space-x-2 min-w-0 text-left cursor-pointer group"
              title="Open Account Preferences"
            >
              <KittyAvatar size={26} />
              <div className="min-w-0">
                <div className="text-xs font-bold text-cocoa-900 truncate group-hover:text-strawberry-600 transition-colors">
                  {account.name}
                </div>
                <div className="text-[10px] text-cocoa-400 flex items-center space-x-1">
                  {account.email ? (
                    <span className="text-matcha-600 font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-matcha-500" />
                      <span>Synced</span>
                    </span>
                  ) : (
                    <span>Guest</span>
                  )}
                </div>
              </div>
            </button>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  sounds.enabled = next;
                  if (next) sounds.playRating(4);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  soundEnabled ? 'text-strawberry-500 hover:bg-cocoa-50' : 'text-cocoa-400 hover:bg-cocoa-50'
                }`}
                title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
              >
                {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>

              <button
                onClick={() => { sounds.playClick(); setViewMode('landing'); }}
                className="p-1.5 rounded-lg hover:bg-cocoa-50 text-cocoa-400 hover:text-cocoa-700 transition-colors cursor-pointer"
                title="Landing Page & Overview"
              >
                <Home size={13} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 🍱 MAIN STAGE: THE BENTO DESK MAT WORKSPACE 🍱 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Top Header (Phone Only) */}
        <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4DC] px-4 py-3 flex items-center justify-between shadow-2xs">
          <div 
            onClick={() => {
              sounds.playClick();
              setActiveStudyDeck(null);
              setCurrentTab('decks');
            }}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <KittyBow size={20} />
            <span className="font-extrabold text-base tracking-tight text-cocoa-900">Ankitti 🎀</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPomodoroOpen(prev => !prev)}
              className="p-2 rounded-xl bg-cocoa-50 text-strawberry-600 border border-[#EAE4DC] cursor-pointer"
              title="Focus Timer"
            >
              <Timer size={16} />
            </button>

            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="cursor-pointer"
            >
              <KittyAvatar size={28} />
            </button>
          </div>
        </header>

        {/* Offline Status Alert Banner */}
        {!isOnline && (
          <div className="bg-amber-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center space-x-2 shadow-xs animate-fadeIn">
            <WifiOff size={14} className="shrink-0" />
            <span>Offline Mode Active — Studying works completely offline without internet.</span>
          </div>
        )}

        {/* Online Restored Toast */}
        {showOnlineToast && (
          <div className="bg-matcha-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center space-x-2 shadow-xs animate-fadeIn">
            <span>Back online! Synced smoothly with cloud. ✨</span>
          </div>
        )}



        {/* Workspace Canvas (Natural Scroll Area) */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 md:pb-12 min-w-0">
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

      {/* Floating Pomodoro Widget for Mobile / Small Screens */}
      <div className="md:hidden">
        <PomodoroWidget 
          isOpen={isPomodoroOpen} 
          onClose={() => setIsPomodoroOpen(false)} 
        />
      </div>

      {/* Mobile Bottom Navigation Dock (Phone Only) */}
      {!activeStudyDeck && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#EFE8DE] px-4 pt-1 pb-safe shadow-[0_-4px_20px_rgba(62,45,40,0.06)] flex items-center justify-around select-none">
          <button
            onClick={() => { sounds.playClick(); setCurrentTab('decks'); }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'decks' ? 'text-strawberry-600 font-extrabold' : 'text-cocoa-500 font-semibold'
            }`}
          >
            <Layers size={19} className={currentTab === 'decks' ? 'text-strawberry-500' : 'text-cocoa-400'} />
            <span className="text-[11px] mt-0.5">Decks</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setCurrentTab('browser'); }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'browser' ? 'text-strawberry-600 font-extrabold' : 'text-cocoa-500 font-semibold'
            }`}
          >
            <Search size={19} className={currentTab === 'browser' ? 'text-strawberry-500' : 'text-cocoa-400'} />
            <span className="text-[11px] mt-0.5">Cards</span>
          </button>

          <button
            onClick={() => handleOpenNewCard()}
            className="w-12 h-12 -mt-5 rounded-full bg-strawberry-500 active:bg-strawberry-600 text-white flex items-center justify-center shadow-lg shadow-strawberry-500/30 border-2 border-white transition-transform active:scale-95 cursor-pointer"
            title="Create New Card"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => { sounds.playClick(); setCurrentTab('stats'); }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'stats' ? 'text-strawberry-600 font-extrabold' : 'text-cocoa-500 font-semibold'
            }`}
          >
            <BarChart2 size={19} className={currentTab === 'stats' ? 'text-strawberry-500' : 'text-cocoa-400'} />
            <span className="text-[11px] mt-0.5">Garden</span>
          </button>

          <button
            onClick={() => handleOpenAiDeck()}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all text-taro-600 font-semibold cursor-pointer active:scale-95"
            title="AI Deck Architect"
          >
            <Sparkles size={19} className="text-taro-500" />
            <span className="text-[11px] mt-0.5">AI Deck</span>
          </button>
        </nav>
      )}

      {/* Global Modals */}
      {(targetDeckForCard || decks[0]) && (
        <CardEditorModal
          isOpen={isCardEditorOpen}
          editingCard={editingCard}
          deck={targetDeckForCard || decks[0]}
          onClose={() => setIsCardEditorOpen(false)}
          onSaveCard={handleSaveCard}
        />
      )}

      <DeckModal
        isOpen={isDeckModalOpen}
        editingDeck={editingDeck}
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
