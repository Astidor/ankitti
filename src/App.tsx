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
  FileEdit,
  ArrowLeft,
  Sparkles,
  LogIn,
  LogOut
} from 'lucide-react';
import { Deck, Card, UserAccount, ReviewLog, DeckStats } from './types/anki';
import { storage } from './services/storage';
import { api } from './services/api';
import { sounds } from './services/audio';
import { ImportResult } from './services/ankiImporter';

import { LandingPage } from './components/landing/LandingPage';
import { DeckList } from './components/decks/DeckList';
import { DeckModal } from './components/decks/DeckModal';
import { StudySession, StudyFilterMode } from './components/study/StudySession';
import { CardEditorModal } from './components/cardEditor/CardEditorModal';
import { AnkiImportModal } from './components/ankiImport/AnkiImportModal';
import { StatsModal } from './components/stats/StatsModal';
import { AccountModal } from './components/account/AccountModal';
import { AuthModal } from './components/auth/AuthModal';
import { AiDeckModal } from './components/ai/AiDeckModal';
import { CardBrowser } from './components/browser/CardBrowser';
import { PomodoroWidget } from './components/common/PomodoroWidget';
import { KittyBow, KittyAvatar } from './components/common/KittyIllustrations';
import { FloatingPetals } from './components/common/FloatingPetals';

export function App() {
  const [account, setAccount] = useState<UserAccount>(storage.getActiveAccount());
  const [decks, setDecks] = useState<Deck[]>(storage.getDecks());
  const [cards, setCards] = useState<Card[]>(storage.getCards());
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>(storage.getReviewLogs());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(account.soundEnabled ?? true);

  // View state: 'landing' or 'app'
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  // App Studio state
  const [currentTab, setCurrentTab] = useState<'decks' | 'browser' | 'stats'>('decks');
  const [activeStudyDeck, setActiveStudyDeck] = useState<Deck | null>(null);
  const [studyMode, setStudyMode] = useState<StudyFilterMode>('due');
  const [isPomodoroOpen, setIsPomodoroOpen] = useState<boolean>(false);

  // Modals
  const [isCardEditorOpen, setIsCardEditorOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [targetDeckForCard, setTargetDeckForCard] = useState<Deck | null>(null);

  const [isDeckModalOpen, setIsDeckModalOpen] = useState<boolean>(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // Auth & AI Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isAiDeckModalOpen, setIsAiDeckModalOpen] = useState<boolean>(false);

  // Auto-sync with real database if logged in
  useEffect(() => {
    async function initUserSession() {
      try {
        const user = await api.getMe();
        if (user) {
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

  // Sync sound settings
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Ignore if typing inside input / textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Cmd/Ctrl + N: New card
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewCard();
      }
      // Cmd/Ctrl + Shift + N: New deck
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingDeck(null);
        setIsDeckModalOpen(true);
      }
      // Cmd/Ctrl + I: Import
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsImportModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [decks]);

  // Reload data for active account
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

  // Auth Handlers & Studio Access Guard
  const isAuthenticated = !!(account && account.email);

  const requireAuth = (action: () => void, mode: 'login' | 'signup' = 'signup') => {
    if (!account?.email) {
      setAuthModalMode(mode);
      setIsAuthModalOpen(true);
      return;
    }
    action();
  };

  // Studio Guard: Unauthenticated visitors cannot stay in app studio
  useEffect(() => {
    if (viewMode === 'app' && !account?.email) {
      setViewMode('landing');
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
    }
  }, [viewMode, account]);

  const handleAuthSuccess = async (user: UserAccount) => {
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
    // Clear email so account is strictly unauthenticated
    delete (guestAccount as any).email;
    setAccount(guestAccount);
    setDecks(storage.getDecks());
    setCards(storage.getCards());
    setViewMode('landing');
    sounds.playClick();
  };

  // AI Deck Generation Handler
  const handleAiDeckCreated = async (deck: Deck, newCards: Card[]) => {
    try {
      await api.createDeck(deck);
      for (const card of newCards) {
        await api.createCard(card);
      }
    } catch (err) {
      console.warn('AI deck cloud sync error (preserved locally):', err);
    }
    setDecks(prev => [deck, ...prev]);
    setCards(prev => [...newCards, ...prev]);
    setIsAiDeckModalOpen(false);
    sounds.playRating(4);
  };

  // Card Management
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

  // Deck Management
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

  // Study review callback
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

  // Anki Import callback
  const handleImportComplete = (result: ImportResult, targetDeckId?: string) => {
    if (!targetDeckId) {
      result.decks.forEach(d => {
        storage.saveDeck(d);
        api.createDeck(d).catch(e => console.warn(e));
      });
    }
    storage.bulkAddCards(result.cards);
    result.cards.forEach(c => api.createCard(c).catch(e => console.warn(e)));
    reloadData();
  };

  const getDeckStats = (deckId: string): DeckStats => {
    return storage.getDeckStats(deckId);
  };

  const hasDraftForDeck = (deckId: string): boolean => {
    return !!storage.getDraft(deckId);
  };

  // If in Landing Page mode, render the rich, high-converting LandingPage
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
        />

        {/* Global Modals accessible if opened from Landing */}
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
          onClose={() => setIsAiDeckModalOpen(false)}
          onDeckCreated={handleAiDeckCreated}
        />
      </>
    );
  }

  // App Studio Mode (Operate Mode) with Natural, Responsive Page Scrolling
  return (
    <div className="min-h-screen bg-transparent text-[#2e1065] flex flex-col font-sans select-auto relative overflow-x-hidden">
      
      {/* Falling Sakura Cherry Blossoms in App Studio */}
      <FloatingPetals enabled={true} />

      {/* Focus Pomodoro Timer Overlay */}
      <PomodoroWidget 
        isOpen={isPomodoroOpen} 
        onClose={() => setIsPomodoroOpen(false)} 
      />

      {/* iOS Frosted Glass App Header */}
      <header className="sticky top-0 z-40 ios-glass border-b border-pink-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand & Home Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={() => { sounds.playClick(); setViewMode('landing'); }}
              className="flex items-center space-x-2 text-slate-700 hover:text-pink-600 transition-colors group ios-btn cursor-pointer"
              title="Return to Landing Page"
            >
              <KittyBow size={24} className="group-hover:scale-110 transition-transform" />
              <span className="font-black text-xl tracking-tight text-[#be123c]">
                Ankitti
              </span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setViewMode('landing'); }}
              className="text-xs font-bold px-3 py-1 rounded-full text-pink-700 bg-pink-100/70 hover:bg-pink-100 border border-pink-200/80 transition-colors hidden sm:flex items-center space-x-1.5 ios-btn cursor-pointer shrink-0"
            >
              <Home size={12} />
              <span>Landing</span>
            </button>
          </div>

          {/* iOS Segmented Controller: Decks | Card Browser | Spaced Heatmap (Desktop/Tablet) */}
          {!activeStudyDeck && (
            <div className="hidden md:flex items-center bg-pink-100/70 p-1 rounded-full border border-pink-200/80 text-xs font-bold shadow-xs shrink-0">
              <button
                onClick={() => { sounds.playClick(); setCurrentTab('decks'); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ios-btn whitespace-nowrap cursor-pointer ${
                  currentTab === 'decks' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers size={13} />
                <span>Decks</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setCurrentTab('browser'); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ios-btn whitespace-nowrap cursor-pointer ${
                  currentTab === 'browser' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search size={13} />
                <span>Card Browser</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setCurrentTab('stats'); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ios-btn whitespace-nowrap cursor-pointer ${
                  currentTab === 'stats' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart2 size={13} />
                <span>Spaced Heatmap</span>
              </button>
            </div>
          )}

          {activeStudyDeck && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => { sounds.playClick(); setActiveStudyDeck(null); }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-pink-50 text-slate-700 border border-pink-200 text-xs font-bold transition-colors ios-btn cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft size={13} />
                <span>Exit Study Session</span>
              </button>
              <span className="text-xs font-bold text-pink-800 hidden md:inline truncate max-w-xs">
                Studying: {activeStudyDeck.name}
              </span>
            </div>
          )}

          {/* Right Action Tools */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {hasAnyDraft && (
              <button 
                onClick={() => handleOpenNewCard()}
                className="cursor-pointer hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs hover:bg-amber-100 transition-colors ios-btn shrink-0 whitespace-nowrap"
                title="Unfinished card draft saved in browser"
              >
                <FileEdit size={12} className="text-amber-600" />
                <span>Draft Saved</span>
              </button>
            )}

            {/* Utility Controls (Pomodoro + Sound Toggle) */}
            <div className="flex items-center bg-pink-100/60 p-0.5 rounded-full border border-pink-200/80 shrink-0">
              <button
                onClick={() => setIsPomodoroOpen(prev => !prev)}
                className={`p-1.5 rounded-full transition-all ios-btn cursor-pointer ${
                  isPomodoroOpen 
                    ? 'bg-[#ff3366] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-pink-600 hover:bg-white/80'
                }`}
                title="Focus Pomodoro Timer"
              >
                <Timer size={15} />
              </button>

              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  sounds.enabled = next;
                  if (next) sounds.playRating(4);
                }}
                className={`p-1.5 rounded-full transition-all ios-btn cursor-pointer ${
                  soundEnabled 
                    ? 'text-pink-600 hover:bg-white/80' 
                    : 'text-slate-400 hover:bg-white/80'
                }`}
                title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>

            {/* AI Deck Architect Action Button (Desktop/Tablet) */}
            <button
              onClick={() => { sounds.playClick(); setIsAiDeckModalOpen(true); }}
              className="hidden md:flex px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white rounded-full text-xs font-extrabold transition-all items-center space-x-1.5 shadow-sm hover:shadow-md ios-btn cursor-pointer shrink-0 whitespace-nowrap"
              title="Generate flashcards with AI Deck Architect"
            >
              <Sparkles size={13} className="text-yellow-200 animate-pulse shrink-0" />
              <span>AI Deck 🪄</span>
            </button>

            {/* Add Card Primary Button (Desktop/Tablet) */}
            <button
              onClick={() => handleOpenNewCard()}
              className="hidden md:flex px-3.5 py-1.5 bg-[#ff3366] hover:bg-[#e11d48] text-white rounded-full text-xs font-bold transition-all items-center space-x-1.5 shadow-sm hover:shadow-md ios-btn cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Add Card</span>
            </button>

            {/* User Account / Auth */}
            {account.email ? (
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="flex items-center space-x-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white hover:bg-pink-50 border border-pink-200 text-slate-700 text-xs font-semibold transition-colors ios-btn cursor-pointer"
                  title={`Logged in as ${account.email}`}
                >
                  <KittyAvatar size={20} />
                  <span className="max-w-[75px] truncate hidden md:inline font-bold text-slate-800">{account.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-pink-50 rounded-full transition-colors ios-btn cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { sounds.playClick(); setAuthModalMode('login'); setIsAuthModalOpen(true); }}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white hover:bg-pink-50 border border-pink-300 text-pink-700 text-xs font-bold transition-colors ios-btn shadow-xs cursor-pointer shrink-0"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Frame (Natural Document Scrolling) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24">
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
                onOpenAiDeck={() => { sounds.playClick(); setIsAiDeckModalOpen(true); }}
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
              <div className="max-w-3xl mx-auto">
                <StatsModal
                  isOpen={true}
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

      {/* Modals */}
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
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <AiDeckModal
        isOpen={isAiDeckModalOpen}
        onClose={() => setIsAiDeckModalOpen(false)}
        onDeckCreated={handleAiDeckCreated}
      />

      {/* iOS Mobile Bottom Navigation Bar (Phone Only) */}
      {!activeStudyDeck && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-xl border-t border-pink-200/80 px-2 py-1 shadow-lg flex items-center justify-around select-none">
          {/* Decks Tab */}
          <button
            onClick={() => { sounds.playClick(); setCurrentTab('decks'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'decks' ? 'text-[#ff3366] font-black' : 'text-slate-500 font-semibold'
            }`}
          >
            <Layers size={20} className={currentTab === 'decks' ? 'scale-110' : ''} />
            <span className="text-[10px] mt-0.5 font-bold">Decks</span>
          </button>

          {/* Card Browser Tab */}
          <button
            onClick={() => { sounds.playClick(); setCurrentTab('browser'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'browser' ? 'text-[#ff3366] font-black' : 'text-slate-500 font-semibold'
            }`}
          >
            <Search size={20} className={currentTab === 'browser' ? 'scale-110' : ''} />
            <span className="text-[10px] mt-0.5 font-bold">Cards</span>
          </button>

          {/* Quick Floating Add Card Button */}
          <button
            onClick={() => handleOpenNewCard()}
            className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-[#ff3366] to-[#ff6699] text-white flex items-center justify-center shadow-lg shadow-pink-300/80 border-2 border-white transition-transform active:scale-95 cursor-pointer"
            title="Create New Card"
          >
            <Plus size={22} />
          </button>

          {/* Stats Tab */}
          <button
            onClick={() => { sounds.playClick(); setCurrentTab('stats'); }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'stats' ? 'text-[#ff3366] font-black' : 'text-slate-500 font-semibold'
            }`}
          >
            <BarChart2 size={20} className={currentTab === 'stats' ? 'scale-110' : ''} />
            <span className="text-[10px] mt-0.5 font-bold">Heatmap</span>
          </button>

          {/* AI Deck Architect Modal Trigger */}
          <button
            onClick={() => { sounds.playClick(); setIsAiDeckModalOpen(true); }}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all text-purple-600 font-semibold cursor-pointer"
            title="AI Deck Architect"
          >
            <Sparkles size={20} className="text-purple-500 animate-pulse" />
            <span className="text-[10px] mt-0.5 font-bold">AI Deck</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
