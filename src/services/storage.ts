import { Card, Deck, CardDraft, UserAccount, ReviewLog, DeckStats } from '../types/anki';
import { DEFAULT_DECK_SETTINGS } from './scheduler';

const STORAGE_PREFIX = 'ankitti_';

export const DEFAULT_GUEST_ACCOUNT: UserAccount = {
  id: 'guest',
  name: 'Learner',
  role: 'General Studies',
  avatar: 'kitty',
  targetExam: 'Daily Retention',
  examDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  dailyGoal: 25,
  streakDays: 1,
  soundEnabled: true,
};

export const INITIAL_DECKS: Deck[] = [
  // 1. Japanese Deck
  {
    id: 'deck_japanese',
    name: 'Japanese: Core Words & Essential Kanji',
    description: 'High-frequency vocabulary, hiragana, katakana, and everyday conversation (JLPT N5)',
    icon: 'book',
    color: '#D84570',
    settings: { ...DEFAULT_DECK_SETTINGS, newCardsPerDay: 20, reviewsPerDay: 150 },
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now(),
  },
  // 2. Computer Science Deck
  {
    id: 'deck_cs',
    name: 'Computer Science: Algorithms & Data Structures',
    description: 'Hash maps, binary trees, dynamic programming, time complexities, and system design patterns',
    icon: 'code',
    color: '#D84570',
    settings: { ...DEFAULT_DECK_SETTINGS, newCardsPerDay: 15, reviewsPerDay: 100 },
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now(),
  },
  // 3. Human Biology & Health
  {
    id: 'deck_bio',
    name: 'Human Biology: Physiology & Anatomy',
    description: 'Cardiovascular system, neurotransmitters, cranial nerves, and organ functions',
    icon: 'activity',
    color: '#D84570',
    settings: { ...DEFAULT_DECK_SETTINGS, newCardsPerDay: 20, reviewsPerDay: 120 },
    createdAt: Date.now() - 8 * 86400000,
    updatedAt: Date.now(),
  },
  // 4. Spanish Deck
  {
    id: 'deck_spanish',
    name: 'Spanish: Conversational Phrases & Travel',
    description: 'Essential phrases, common verbs, greetings, questions, and restaurant dining',
    icon: 'sun',
    color: '#D84570',
    settings: { ...DEFAULT_DECK_SETTINGS, newCardsPerDay: 15, reviewsPerDay: 80 },
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now(),
  },
];

export const INITIAL_CARDS: Card[] = [
  // JAPANESE CARDS
  {
    id: 'c_jp_1',
    deckId: 'deck_japanese',
    type: 'concept',
    front: 'What does the verb **食べる (たべる - taberu)** mean, and what is its polite present form?',
    back: '### **食べる (taberu)** = **To Eat**\n\n- **Polite Form**: **食べます (tabemasu)**\n- **Past Polite**: **食べました (tabemashita)** — "ate"\n- **Negative**: **食べません (tabemasen)** — "do not eat"',
    tags: ['Japanese', 'Verbs', 'JLPT-N5'],
    createdAt: Date.now() - 10 * 86400000,
    due: Date.now() - 3600000,
    interval: 3,
    easeFactor: 2.5,
    repetitions: 2,
    lapses: 0,
    state: 'review',
    stepIndex: 0,
    medicalMeta: {
      highYield: true,
      category: 'Japanese Language',
      mnemonic: 'Think of "table" — you sit at a table to eat (taberu)!',
      takeaway: 'This is an Ichidan (Group 2) verb, so drop "ru" and add "masu".',
      difficulty: 'Normal',
    },
    flagged: true,
  },
  {
    id: 'c_jp_2',
    deckId: 'deck_japanese',
    type: 'cloze',
    front: 'Essential animals in Japanese:\n1. Cat = {{c1::猫 (ねこ - neko)}}\n2. Dog = {{c2::犬 (いぬ - inu)}}\n3. Bird = {{c3::鳥 (とり - tori)}}',
    back: '### Pets & Animals Mnemonic\n- **Neko**: a cat says "nya", so "neko" sounds like a purr!\n- **Inu**: Shiba Inu dog breed!',
    tags: ['Vocabulary', 'Animals', 'Kanji'],
    createdAt: Date.now() - 8 * 86400000,
    due: Date.now() - 7200000,
    interval: 4,
    easeFactor: 2.6,
    repetitions: 3,
    lapses: 0,
    state: 'review',
    stepIndex: 0,
    medicalMeta: {
      highYield: true,
      category: 'Vocabulary',
      mnemonic: 'Neko = a cat curled up on your "knee" (ne-ko)!',
      difficulty: 'Normal',
    },
  },
  {
    id: 'c_jp_3',
    deckId: 'deck_japanese',
    type: 'basic',
    front: 'How do you say "Thank you very much" formally in Japanese?',
    back: '### **ありがとうございます (Arigatou gozaimasu)**\n\n- Casual: **ありがとう (Arigatou)**\n- Past formal (for something already done): **ありがとうございました (Arigatou gozaimashita)**',
    tags: ['Phrases', 'Conversation'],
    createdAt: Date.now() - 3 * 86400000,
    due: Date.now() - 1000,
    interval: 1,
    easeFactor: 2.5,
    repetitions: 1,
    lapses: 0,
    state: 'learning',
    stepIndex: 1,
    medicalMeta: {
      highYield: true,
      category: 'Polite Phrases',
      takeaway: 'Always add "gozaimasu" when speaking to teachers, store staff, or seniors.',
    },
  },

  // COMPUTER SCIENCE CARDS
  {
    id: 'c_cs_1',
    deckId: 'deck_cs',
    type: 'cloze',
    front: 'The average time complexity of **QuickSort** is {{c1::O(n log n)::average}}, but in the worst case (already sorted array without random pivot) it degrades to {{c2::O(n^2)::worst case}}.',
    back: '### QuickSort Complexity Summary\n- **Best Case**: O(n log n)\n- **Average Case**: O(n log n)\n- **Worst Case**: O(n²)\n- **Space**: O(log n) call stack space.',
    tags: ['Algorithms', 'Sorting', 'Big-O'],
    createdAt: Date.now() - 12 * 86400000,
    due: Date.now() - 1800000,
    interval: 5,
    easeFactor: 2.55,
    repetitions: 3,
    lapses: 0,
    state: 'review',
    stepIndex: 0,
    medicalMeta: {
      highYield: true,
      category: 'Algorithms',
      mnemonic: 'Randomized 3-way partition avoids O(n²) worst case!',
      takeaway: 'Use MergeSort when stable sorting is required (e.g. sorting objects by multiple keys).',
      difficulty: 'Normal',
    },
  },
  {
    id: 'c_cs_2',
    deckId: 'deck_cs',
    type: 'basic',
    front: 'What is the average time complexity for Insertion, Deletion, and Lookup in a **Hash Map**, and how are collisions handled?',
    back: '### **Hash Map Complexity: O(1) Average**\n\n- **Lookup**: O(1) average, O(n) worst case.\n- **Insertion**: O(1) average, O(n) worst case.\n- **Collision Resolution Methods**:\n  1. **Separate Chaining**: Linked lists or self-balancing BSTs at each bucket.\n  2. **Open Addressing**: Linear probing, quadratic probing, or double hashing.',
    tags: ['Data-Structures', 'Hash-Table'],
    createdAt: Date.now() - 5 * 86400000,
    due: Date.now() - 500,
    interval: 2,
    easeFactor: 2.45,
    repetitions: 1,
    lapses: 0,
    state: 'review',
    stepIndex: 0,
    medicalMeta: {
      highYield: true,
      category: 'Data Structures',
      takeaway: 'Java 8+ converts linked list buckets to red-black trees when bucket length exceeds 8 (O(log n) worst case).',
    },
  },

  // BIOLOGY CARDS
  {
    id: 'c_bio_1',
    deckId: 'deck_bio',
    type: 'concept',
    front: 'Which valve prevents backflow of blood from the aorta into the left ventricle, and what occurs during **systole** versus **diastole**?',
    back: '### **The Aortic Valve**\n\n- **Systole (Contraction)**: The aortic valve opens as left ventricular pressure exceeds aortic pressure (~80-120 mmHg), ejecting blood.\n- **Diastole (Relaxation)**: The aortic valve snaps shut (producing the **S2 heart sound** component A2), preventing regurgitation back into the ventricle.',
    tags: ['Cardiovascular', 'Physiology', 'Heart'],
    createdAt: Date.now() - 9 * 86400000,
    due: Date.now() - 10000,
    interval: 3,
    easeFactor: 2.5,
    repetitions: 2,
    lapses: 0,
    state: 'review',
    stepIndex: 0,
    medicalMeta: {
      highYield: true,
      category: 'Physiology',
      takeaway: 'Coronary arteries receive most of their blood flow during diastole!',
    },
  },

  // SPANISH CARDS
  {
    id: 'c_es_1',
    deckId: 'deck_spanish',
    type: 'basic',
    front: 'How do you ask "Where is the bathroom, please?" in Spanish?',
    back: '### **¿Dónde está el baño, por favor?**\n\n- **¿Dónde está...?** = Where is...?\n- **el baño** = the bathroom / restroom\n- **por favor** = please',
    tags: ['Spanish', 'Travel', 'Phrases'],
    createdAt: Date.now() - 4 * 86400000,
    due: Date.now() + 86400000,
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    lapses: 0,
    state: 'new',
    stepIndex: 0,
    medicalMeta: {
      highYield: true,
      category: 'Spanish Language',
      takeaway: 'Remember that Spanish questions use opening inverted marks "¿" at the beginning!',
    },
  },
];

export class StorageService {
  private activeAccountId: string;

  constructor() {
    this.activeAccountId = this.getStoredActiveAccountId();
    this.ensureInitialized();
  }

  private getStoredActiveAccountId(): string {
    const id = localStorage.getItem(`${STORAGE_PREFIX}active_account_id`);
    return id || DEFAULT_GUEST_ACCOUNT.id;
  }

  public setActiveAccount(accountId: string) {
    this.activeAccountId = accountId;
    localStorage.setItem(`${STORAGE_PREFIX}active_account_id`, accountId);
  }

  public getActiveAccount(): UserAccount {
    const accounts = this.getAccounts();
    return accounts.find(a => a.id === this.activeAccountId) || accounts[0] || DEFAULT_GUEST_ACCOUNT;
  }

  public getAccounts(): UserAccount[] {
    const data = localStorage.getItem(`${STORAGE_PREFIX}accounts`);
    if (!data) {
      return [DEFAULT_GUEST_ACCOUNT];
    }
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_GUEST_ACCOUNT];
    } catch {
      return [DEFAULT_GUEST_ACCOUNT];
    }
  }

  public saveAccount(account: UserAccount) {
    const accounts = this.getAccounts().map(a => (a.id === account.id ? account : a));
    if (!accounts.some(a => a.id === account.id)) {
      accounts.push(account);
    }
    localStorage.setItem(`${STORAGE_PREFIX}accounts`, JSON.stringify(accounts));
  }

  private ensureInitialized() {
    const deckKey = `${STORAGE_PREFIX}decks_${this.activeAccountId}`;
    const cardKey = `${STORAGE_PREFIX}cards_${this.activeAccountId}`;

    if (!localStorage.getItem(deckKey)) {
      localStorage.setItem(deckKey, JSON.stringify(INITIAL_DECKS));
    }
    if (!localStorage.getItem(cardKey)) {
      localStorage.setItem(cardKey, JSON.stringify(INITIAL_CARDS));
    }
    if (!localStorage.getItem(`${STORAGE_PREFIX}accounts`)) {
      localStorage.setItem(`${STORAGE_PREFIX}accounts`, JSON.stringify([DEFAULT_GUEST_ACCOUNT]));
    }
  }

  // DECKS
  public getDecks(): Deck[] {
    const key = `${STORAGE_PREFIX}decks_${this.activeAccountId}`;
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : INITIAL_DECKS;
    } catch {
      return INITIAL_DECKS;
    }
  }

  public saveDeck(deck: Deck) {
    const decks = this.getDecks();
    const idx = decks.findIndex(d => d.id === deck.id);
    if (idx >= 0) {
      decks[idx] = { ...deck, updatedAt: Date.now() };
    } else {
      decks.push({ ...deck, createdAt: Date.now(), updatedAt: Date.now() });
    }
    localStorage.setItem(`${STORAGE_PREFIX}decks_${this.activeAccountId}`, JSON.stringify(decks));
  }

  public saveDecks(decks: Deck[]) {
    localStorage.setItem(`${STORAGE_PREFIX}decks_${this.activeAccountId}`, JSON.stringify(decks));
  }

  public deleteDeck(deckId: string) {
    const decks = this.getDecks().filter(d => d.id !== deckId);
    localStorage.setItem(`${STORAGE_PREFIX}decks_${this.activeAccountId}`, JSON.stringify(decks));
    
    const cards = this.getCards().filter(c => c.deckId !== deckId);
    localStorage.setItem(`${STORAGE_PREFIX}cards_${this.activeAccountId}`, JSON.stringify(cards));

    this.clearDraftsForDeck(deckId);
  }

  public mergeDecks(
    sourceDeckId: string,
    targetDeckId: string,
    options: {
      deleteSourceDeck?: boolean;
      tagMergedCards?: boolean;
    } = {}
  ): { mergedCardCount: number } {
    const { deleteSourceDeck = true, tagMergedCards = true } = options;
    const decks = this.getDecks();
    const sourceDeck = decks.find(d => d.id === sourceDeckId);
    const targetDeck = decks.find(d => d.id === targetDeckId);

    if (!sourceDeck || !targetDeck) {
      throw new Error('Source or target deck not found');
    }

    const allCards = this.getCards();
    let mergedCardCount = 0;
    const cleanName = sourceDeck.name.replace(/[^a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff-]/g, '').slice(0, 24);
    const tagName = cleanName ? `from-${cleanName}` : 'merged-deck';

    const updatedCards = allCards.map(card => {
      if (card.deckId === sourceDeckId) {
        mergedCardCount++;
        const currentTags = card.tags || [];
        const newTags = tagMergedCards && !currentTags.includes(tagName)
          ? [...currentTags, tagName]
          : currentTags;
        return {
          ...card,
          deckId: targetDeckId,
          tags: newTags,
        };
      }
      return card;
    });

    this.saveCards(updatedCards);

    const targetIdx = decks.findIndex(d => d.id === targetDeckId);
    if (targetIdx >= 0) {
      decks[targetIdx] = { ...decks[targetIdx], updatedAt: Date.now() };
    }

    if (deleteSourceDeck) {
      const remainingDecks = decks.filter(d => d.id !== sourceDeckId);
      this.saveDecks(remainingDecks);
      this.clearDraftsForDeck(sourceDeckId);
    } else {
      this.saveDecks(decks);
    }

    return { mergedCardCount };
  }

  // CARDS
  public getCards(deckId?: string): Card[] {
    const key = `${STORAGE_PREFIX}cards_${this.activeAccountId}`;
    const data = localStorage.getItem(key);
    let cards: Card[] = [];
    try {
      cards = data ? JSON.parse(data) : INITIAL_CARDS;
    } catch {
      cards = INITIAL_CARDS;
    }
    if (deckId) {
      return cards.filter(c => c.deckId === deckId);
    }
    return cards;
  }

  public saveCard(card: Card) {
    const cards = this.getCards();
    const idx = cards.findIndex(c => c.id === card.id);
    if (idx >= 0) {
      cards[idx] = card;
    } else {
      cards.push(card);
    }
    localStorage.setItem(`${STORAGE_PREFIX}cards_${this.activeAccountId}`, JSON.stringify(cards));
  }

  public saveCards(cards: Card[]) {
    localStorage.setItem(`${STORAGE_PREFIX}cards_${this.activeAccountId}`, JSON.stringify(cards));
  }

  public deleteCard(cardId: string) {
    const cards = this.getCards().filter(c => c.id !== cardId);
    localStorage.setItem(`${STORAGE_PREFIX}cards_${this.activeAccountId}`, JSON.stringify(cards));
  }

  public bulkAddCards(newCards: Card[]) {
    const cards = this.getCards();
    const map = new Map(cards.map(c => [c.id, c]));
    for (const c of newCards) {
      map.set(c.id, c);
    }
    localStorage.setItem(`${STORAGE_PREFIX}cards_${this.activeAccountId}`, JSON.stringify(Array.from(map.values())));
  }

  // DECK STATS
  public getDeckStats(deckId: string): DeckStats {
    const cards = this.getCards(deckId);
    const now = Date.now();

    let newCount = 0;
    let learnCount = 0;
    let dueCount = 0;
    let matureCount = 0;
    let youngCount = 0;

    for (const card of cards) {
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
      total: cards.length,
      newCount,
      learnCount,
      dueCount,
      matureCount,
      youngCount,
    };
  }

  // AUTO-SAVE / DRAFT SYSTEM
  public saveDraft(draft: CardDraft) {
    const key = `${STORAGE_PREFIX}drafts_${this.activeAccountId}`;
    const drafts = this.getAllDrafts();
    const idx = drafts.findIndex(d => d.id === draft.id || (d.deckId === draft.deckId && d.cardId === draft.cardId && !d.cardId));
    
    const updatedDraft = { ...draft, lastSavedAt: Date.now() };
    if (idx >= 0) {
      drafts[idx] = updatedDraft;
    } else {
      drafts.push(updatedDraft);
    }
    localStorage.setItem(key, JSON.stringify(drafts));
  }

  public getDraft(deckId: string, cardId?: string): CardDraft | null {
    const drafts = this.getAllDrafts();
    if (cardId) {
      return drafts.find(d => d.cardId === cardId) || null;
    }
    return drafts.find(d => d.deckId === deckId && !d.cardId) || null;
  }

  public getAllDrafts(): CardDraft[] {
    const key = `${STORAGE_PREFIX}drafts_${this.activeAccountId}`;
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public clearDraft(draftId: string) {
    const key = `${STORAGE_PREFIX}drafts_${this.activeAccountId}`;
    const drafts = this.getAllDrafts().filter(d => d.id !== draftId);
    localStorage.setItem(key, JSON.stringify(drafts));
  }

  public clearDraftsForDeck(deckId: string) {
    const key = `${STORAGE_PREFIX}drafts_${this.activeAccountId}`;
    const drafts = this.getAllDrafts().filter(d => d.deckId !== deckId);
    localStorage.setItem(key, JSON.stringify(drafts));
  }

  // REVIEW LOGS & STREAK
  public logReview(log: ReviewLog) {
    const key = `${STORAGE_PREFIX}reviews_${this.activeAccountId}`;
    const logs = this.getReviewLogs();
    logs.push(log);
    if (logs.length > 5000) logs.shift();
    localStorage.setItem(key, JSON.stringify(logs));

    const account = this.getActiveAccount();
    const today = new Date().toISOString().split('T')[0];
    if (account.lastStudiedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (account.lastStudiedDate === yesterday) {
        account.streakDays = (account.streakDays || 0) + 1;
      } else {
        account.streakDays = 1;
      }
      account.lastStudiedDate = today;
      this.saveAccount(account);
    }
  }

  public getReviewLogs(): ReviewLog[] {
    const key = `${STORAGE_PREFIX}reviews_${this.activeAccountId}`;
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public exportAllAsJSON(): string {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      account: this.getActiveAccount(),
      decks: this.getDecks(),
      cards: this.getCards(),
      reviews: this.getReviewLogs(),
    }, null, 2);
  }

  public resetToSampleData() {
    const deckKey = `${STORAGE_PREFIX}decks_${this.activeAccountId}`;
    const cardKey = `${STORAGE_PREFIX}cards_${this.activeAccountId}`;
    const draftKey = `${STORAGE_PREFIX}drafts_${this.activeAccountId}`;
    localStorage.setItem(deckKey, JSON.stringify(INITIAL_DECKS));
    localStorage.setItem(cardKey, JSON.stringify(INITIAL_CARDS));
    localStorage.removeItem(draftKey);
  }
}

export const storage = new StorageService();
