-- Ankitti Cloudflare D1 Database Schema
-- Validated for Cloudflare D1 Console & SQLite

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Student',
  avatar TEXT DEFAULT 'kitty',
  target_exam TEXT DEFAULT 'General Knowledge',
  exam_date TEXT,
  sound_enabled INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 1,
  daily_goal INTEGER DEFAULT 25,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'kitty',
  color TEXT DEFAULT '#ff4d88',
  settings_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  deck_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'basic',
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  front_image TEXT,
  back_image TEXT,
  tags_json TEXT,
  due INTEGER NOT NULL,
  interval INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  repetitions INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'new',
  step_index INTEGER NOT NULL DEFAULT 0,
  medical_meta_json TEXT,
  flagged INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS review_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  review_state TEXT NOT NULL,
  interval INTEGER NOT NULL,
  last_interval INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  deck_id TEXT NOT NULL,
  data_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_decks_user ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_deck ON cards(user_id, deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(due);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON review_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_user ON drafts(user_id);
