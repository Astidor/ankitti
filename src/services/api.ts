import { 
  Deck, 
  Card, 
  UserAccount, 
  ReviewLog, 
  CardDraft, 
  AuthResponse, 
  LoginCredentials, 
  SignupCredentials,
  AiDeckResponse
} from '../types/anki';
import { storage } from './storage';

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('ankitti_token');
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('ankitti_token', token);
    } else {
      localStorage.removeItem('ankitti_token');
    }
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed. Please check credentials.');
    }

    const data: AuthResponse = await res.json();
    this.setToken(data.token);
    storage.saveAccount(data.user);
    storage.setActiveAccount(data.user.id);
    return data;
  }

  public async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Sign up failed' }));
      throw new Error(err.error || 'Failed to create account.');
    }

    const data: AuthResponse = await res.json();
    this.setToken(data.token);
    storage.saveAccount(data.user);
    storage.setActiveAccount(data.user.id);
    return data;
  }

  public async logout(): Promise<void> {
    if (this.token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(),
        });
      } catch (err) {
        console.warn('Logout network error:', err);
      }
    }
    this.setToken(null);
  }

  public async getMe(): Promise<UserAccount | null> {
    if (!this.token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401) this.setToken(null);
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  }

  public async updateProfile(profile: Partial<UserAccount>): Promise<UserAccount> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await res.json();
    storage.saveAccount(data.user);
    return data.user;
  }

  // ==========================================
  // DECKS CRUD
  // ==========================================

  public async getDecks(): Promise<Deck[]> {
    if (!this.token) return storage.getDecks();
    try {
      const res = await fetch(`${API_BASE}/decks`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return storage.getDecks();
      const remoteDecks: Deck[] = await res.json();
      const localDecks = storage.getDecks();
      const remoteMap = new Map(remoteDecks.map(d => [d.id, d]));
      const unSynced = localDecks.filter(ld => !remoteMap.has(ld.id));
      const merged = [...remoteDecks, ...unSynced];
      storage.saveDecks(merged);
      if (unSynced.length > 0) {
        for (const ud of unSynced) {
          this.createDeck(ud).catch(() => {});
        }
      }
      return merged;
    } catch {
      return storage.getDecks();
    }
  }

  public async createDeck(deck: Deck): Promise<Deck> {
    storage.saveDeck(deck);
    if (!this.token) return deck;
    try {
      const res = await fetch(`${API_BASE}/decks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(deck),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('API createDeck error, preserved in local storage:', err);
    }
    return deck;
  }

  public async updateDeck(deck: Deck): Promise<Deck> {
    storage.saveDeck(deck);
    if (!this.token) return deck;
    try {
      const res = await fetch(`${API_BASE}/decks/${deck.id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(deck),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('API updateDeck error, preserved in local storage:', err);
    }
    return deck;
  }

  public async deleteDeck(id: string): Promise<void> {
    storage.deleteDeck(id);
    if (!this.token) return;
    try {
      await fetch(`${API_BASE}/decks/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
    } catch (err) {
      console.warn('API deleteDeck error:', err);
    }
  }

  // ==========================================
  // CARDS CRUD (with attachments)
  // ==========================================

  public async getCards(deckId?: string): Promise<Card[]> {
    if (!this.token) {
      const local = storage.getCards();
      return deckId ? local.filter(c => c.deckId === deckId) : local;
    }

    try {
      const url = deckId ? `${API_BASE}/cards?deckId=${encodeURIComponent(deckId)}` : `${API_BASE}/cards`;
      const res = await fetch(url, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return storage.getCards(deckId);
      const remoteCards: Card[] = await res.json();
      const localCards = storage.getCards();
      const remoteMap = new Map(remoteCards.map(c => [c.id, c]));
      const unSynced = localCards.filter(lc => !remoteMap.has(lc.id));
      const merged = [...remoteCards, ...unSynced];
      storage.saveCards(merged);
      if (unSynced.length > 0) {
        this.bulkCreateCards(unSynced).catch(() => {});
      }
      return deckId ? merged.filter(c => c.deckId === deckId) : merged;
    } catch {
      return storage.getCards();
    }
  }

  public async createCard(card: Card): Promise<Card> {
    storage.saveCard(card);
    if (!this.token) return card;
    try {
      const res = await fetch(`${API_BASE}/cards`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(card),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('API createCard error, preserved in local storage:', err);
    }
    return card;
  }

  public async bulkCreateCards(cards: Card[]): Promise<void> {
    storage.bulkAddCards(cards);
    if (!this.token || cards.length === 0) return;
    try {
      const chunkSize = 50;
      for (let i = 0; i < cards.length; i += chunkSize) {
        const chunk = cards.slice(i, i + chunkSize);
        await fetch(`${API_BASE}/cards/batch`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ cards: chunk }),
        });
      }
    } catch (err) {
      console.warn('API bulkCreateCards error, preserved in local storage:', err);
    }
  }

  public async updateCard(card: Card): Promise<Card> {
    storage.saveCard(card);
    if (!this.token) return card;
    try {
      const res = await fetch(`${API_BASE}/cards/${card.id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(card),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('API updateCard error, preserved in local storage:', err);
    }
    return card;
  }

  public async deleteCard(id: string): Promise<void> {
    storage.deleteCard(id);
    if (!this.token) return;
    try {
      await fetch(`${API_BASE}/cards/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
    } catch (err) {
      console.warn('API deleteCard error:', err);
    }
  }

  // ==========================================
  // REVIEW LOGS
  // ==========================================

  public async getReviews(): Promise<ReviewLog[]> {
    if (!this.token) return storage.getReviewLogs();
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return storage.getReviewLogs();
      const logs = await res.json();
      return logs;
    } catch {
      return storage.getReviewLogs();
    }
  }

  public async logReview(cardId: string, rating: 1 | 2 | 3 | 4, reviewState: string, interval: number, lastInterval: number): Promise<void> {
    storage.logReview({
      id: `rev_${Date.now()}`,
      cardId,
      deckId: '',
      rating,
      timeTakenMs: 0,
      timestamp: Date.now(),
      prevInterval: lastInterval,
      newInterval: interval,
      prevEase: 2.5,
      newEase: 2.5,
    });

    if (!this.token) return;
    try {
      await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cardId,
          rating,
          reviewState,
          interval,
          lastInterval,
          timeTaken: 0,
        }),
      });
    } catch (err) {
      console.warn('API logReview error:', err);
    }
  }

  // ==========================================
  // DRAFTS (Auto-save)
  // ==========================================

  public async saveDraft(draft: CardDraft): Promise<void> {
    storage.saveDraft(draft);
    if (!this.token) return;
    try {
      await fetch(`${API_BASE}/drafts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(draft),
      });
    } catch {}
  }

  public async clearDraft(draftId: string): Promise<void> {
    storage.clearDraft(draftId);
    if (!this.token) return;
    try {
      await fetch(`${API_BASE}/drafts/${draftId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
    } catch {}
  }

  // ==========================================
  // DEEPSEEK AI DECK GENERATION
  // ==========================================

  public async generateAiDeck(params: {
    topic: string;
    cardCount?: number;
    notes?: string;
    style?: 'mixed' | 'basic' | 'cloze';
    apiKey?: string;
  }): Promise<AiDeckResponse> {
    const res = await fetch(`${API_BASE}/ai/generate-deck`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'AI generation failed' }));
      if (err.error === 'DEEPSEEK_API_KEY_MISSING') {
        throw new Error('KEY_MISSING');
      }
      throw new Error(err.error || err.message || 'Failed to generate deck with DeepSeek.');
    }

    return await res.json();
  }
}

export const api = new ApiService();
