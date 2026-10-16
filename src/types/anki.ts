export type CardType = 'basic' | 'cloze' | 'concept';

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export interface CardMeta {
  highYield?: boolean;
  category?: string; // e.g. "Japanese JLPT", "Computer Science", "Biology", "Trivia"
  system?: string; // for compatibility
  mnemonic?: string; // Memory hook or mnemonic
  reference?: string; // Book, chapter, or reference
  firstAidRef?: string;
  takeaway?: string; // Key takeaway, pro tip, or clinical pearl
  clinicalPearl?: string;
  difficulty?: 'Normal' | 'Hard' | 'Extreme';
}

export type MedicalMeta = CardMeta;

export interface Card {
  id: string;
  deckId: string;
  type: CardType;
  front: string; // Question, Prompt, or Cloze Text with {{c1::answer}}
  back: string;  // Answer, explanation, translation, or extra info
  frontImage?: string | null; // Attached screenshot or diagram
  backImage?: string | null;  // Attached screenshot or diagram
  clozeHint?: string;
  tags: string[];
  createdAt: number;
  due: number; // timestamp in ms when card is due
  interval: number; // in days
  easeFactor: number; // starts at 2.5 (250%)
  repetitions: number;
  lapses: number;
  state: CardState;
  stepIndex: number; // index in deck's learning steps
  medicalMeta?: CardMeta;
  flagged?: boolean;
  suspended?: boolean;
}

export interface DeckSettings {
  newCardsPerDay: number;
  reviewsPerDay: number;
  learningSteps: number[]; // in minutes, e.g. [1, 10]
  graduatingInterval: number; // in days, e.g. 1
  easyInterval: number; // in days, e.g. 4
  easeBonus: number; // e.g. 1.3
  hardIntervalMultiplier: number; // e.g. 1.2
  intervalModifier: number; // e.g. 1.0
  maximumInterval: number; // e.g. 36500 days
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  tags?: string[];
  parentId?: string | null;
  settings: DeckSettings;
  createdAt: number;
  updatedAt: number;
}

export interface DeckStats {
  total: number;
  newCount: number;
  learnCount: number;
  dueCount: number;
  matureCount: number; // interval >= 21 days
  youngCount: number;  // interval < 21 days
}

export interface CardDraft {
  id: string;
  deckId: string;
  cardId?: string; // if editing an existing card
  type: CardType;
  front: string;
  back: string;
  frontImage?: string | null;
  backImage?: string | null;
  tags: string;
  medicalMeta: CardMeta;
  lastSavedAt: number;
}

export interface UserAccount {
  id: string;
  email?: string;
  name: string;
  role: string; // e.g. "Lifelong Learner", "Japanese Student", "Software Engineer"
  avatar: string; // Avatar identifier
  targetExam: string; // e.g. "JLPT N5 Japanese", "Full-Stack Interview", "General Learning"
  examDate: string; // YYYY-MM-DD
  dailyGoal: number; // cards per day
  streakDays: number;
  lastStudiedDate?: string;
  soundEnabled: boolean;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  rating: 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
  timeTakenMs: number;
  timestamp: number;
  prevInterval: number;
  newInterval: number;
  prevEase: number;
  newEase: number;
}

export interface AuthResponse {
  user: UserAccount;
  token: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  role?: string;
  targetExam?: string;
  examDate?: string;
}

export interface AiDeckCardItem {
  type: 'basic' | 'cloze';
  front: string;
  back: string;
  tags: string[];
  takeaway?: string;
  mnemonic?: string;
}

export interface AiDeckResponse {
  success: boolean;
  deck: {
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  cards: AiDeckCardItem[];
}

