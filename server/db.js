import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'ankitti.db');

export function getDatabase() {
  const db = new DatabaseSync(DB_PATH);
  
  // Enable foreign keys and WAL mode for better concurrency
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // 1. Users table
  db.exec(`
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
      daily_goal INTEGER DEFAULT 20,
      created_at INTEGER NOT NULL
    );
  `);

  // 2. Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Decks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '🎀',
      color TEXT DEFAULT '#ff4d88',
      settings_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. Cards table with front_image and back_image attachments
  db.exec(`
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
  `);

  // 5. Review logs table
  db.exec(`
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
  `);

  // 6. Drafts table for auto-save persistence
  db.exec(`
    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      deck_id TEXT NOT NULL,
      card_id TEXT,
      data_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return db;
}

// Password hashing utility
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Seed demo user and starter decks if users table is empty
export function seedDatabase(db) {
  const checkUser = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkUser.count === 0) {
    console.log('🌸 Seeding initial demo account: kitty@sanrio.com (password: kitty123)...');
    
    const demoUserId = 'user_kitty_demo';
    const { hash, salt } = hashPassword('kitty123');
    const now = Date.now();

    const insertUser = db.prepare(`
      INSERT INTO users (
        id, email, password_hash, salt, name, role, avatar, 
        target_exam, exam_date, sound_enabled, streak_days, daily_goal, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      demoUserId,
      'kitty@sanrio.com',
      hash,
      salt,
      'Dr. Hello Kitty, MD',
      'Chief of Spaced Repetition 🎀',
      'doctor',
      'Japanese N5 & Medicine',
      new Date(now + 90 * 86400000).toISOString().split('T')[0],
      1,
      7,
      30,
      now
    );

    // Seed starter decks for demo user
    seedDecksForUser(db, demoUserId);
  }
}

export function seedDecksForUser(db, userId) {
  const now = Date.now();
  const defaultSettings = JSON.stringify({
    learningSteps: [1, 10],
    relearningSteps: [10],
    graduatingInterval: 1,
    easyInterval: 4,
    startingEase: 2.5,
    minimumEase: 1.3,
    intervalModifier: 1.0,
    newCardsPerDay: 20,
    reviewsPerDay: 100,
    enableFuzz: true,
  });

  const insertDeck = db.prepare(`
    INSERT INTO decks (id, user_id, name, description, icon, color, settings_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCard = db.prepare(`
    INSERT INTO cards (
      id, user_id, deck_id, type, front, back, front_image, back_image, tags_json,
      due, interval, ease_factor, repetitions, lapses, state, step_index,
      medical_meta_json, flagged, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Deck 1: Japanese JLPT N5
  const deck1Id = `deck_jp_${userId}_${now}`;
  insertDeck.run(
    deck1Id,
    userId,
    '🌸 Japanese: JLPT N5 Core Vocabulary',
    'Essential verbs, polite expressions, and daily conversation patterns.',
    '🌸',
    '#ff4d88',
    defaultSettings,
    now,
    now
  );

  const jpCards = [
    {
      front: 'What does the Japanese verb 食べる (taberu) mean?',
      back: 'To eat (dictionary form, Ichidan verb / Group 2). Polite form: 食べます (tabemasu).',
      tags: ['Japanese', 'Verbs', 'JLPT-N5'],
      meta: { highYield: true, takeaway: 'Ichidan verb: drop "ru" and add "masu"', mnemonic: 'Table to eat (taberu)!' }
    },
    {
      front: 'The capital of Japan is {{c1::Tokyo}} (東京).',
      back: 'Tokyo became the official capital of Japan during the Meiji Restoration in 1868.',
      tags: ['Japanese', 'Geography', 'Cloze'],
      meta: { highYield: true, takeaway: '東京 literally means "Eastern Capital"' }
    },
    {
      front: 'Translate to Japanese: "Excuse me / I am sorry"',
      back: 'すみません (Sumimasen). Used both for apologizing and calling a waiter.',
      tags: ['Japanese', 'Daily-Life'],
      meta: { highYield: true, takeaway: 'Universal polite expression in Japan' }
    }
  ];

  jpCards.forEach((c, idx) => {
    insertCard.run(
      `card_jp_${idx}_${now}`,
      userId,
      deck1Id,
      c.front.includes('{{c') ? 'cloze' : 'basic',
      c.front,
      c.back,
      null,
      null,
      JSON.stringify(c.tags),
      now - (idx * 3600000),
      1,
      2.5,
      1,
      0,
      'review',
      0,
      JSON.stringify(c.meta),
      0,
      now
    );
  });

  // Deck 2: Full-Stack Web Development
  const deck2Id = `deck_web_${userId}_${now}`;
  insertDeck.run(
    deck2Id,
    userId,
    '💻 Full-Stack Web Development & TypeScript',
    'Modern React, TypeScript generics, async JavaScript, and RESTful architectures.',
    '💻',
    '#8b5cf6',
    defaultSettings,
    now,
    now
  );

  const webCards = [
    {
      front: 'What is the key difference between null and undefined in JavaScript?',
      back: 'undefined means a variable has been declared but not assigned a value. null is an assignment value that represents an intentional absence of any object value.',
      tags: ['JavaScript', 'Basics', 'Interview'],
      meta: { highYield: true, takeaway: 'typeof undefined is "undefined"; typeof null is "object" (historic bug)' }
    },
    {
      front: 'In React, why should you never mutate state directly?',
      back: 'React relies on reference equality checks (Object.is) to trigger re-renders. Mutating state in-place bypasses change detection and breaks concurrent features.',
      tags: ['React', 'Architecture'],
      meta: { highYield: true, takeaway: 'Always return new objects/arrays using spread operators or immutable updaters' }
    }
  ];

  webCards.forEach((c, idx) => {
    insertCard.run(
      `card_web_${idx}_${now}`,
      userId,
      deck2Id,
      'basic',
      c.front,
      c.back,
      null,
      null,
      JSON.stringify(c.tags),
      now,
      0,
      2.5,
      0,
      0,
      'new',
      0,
      JSON.stringify(c.meta),
      0,
      now
    );
  });
}
