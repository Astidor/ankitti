import express from 'express';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { getDatabase, hashPassword, verifyPassword, seedDatabase, seedDecksForUser } from './db.js';

dotenv.config();

const router = express.Router();
const db = getDatabase();
seedDatabase(db);

// Middleware to extract authenticated user from Bearer token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?').get(token, Date.now());

  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  const user = db.prepare(`
    SELECT id, email, name, role, avatar, target_exam, exam_date, 
           sound_enabled, streak_days, daily_goal, created_at 
    FROM users WHERE id = ?
  `).get(session.user_id);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = {
    ...user,
    soundEnabled: Boolean(user.sound_enabled),
    targetExam: user.target_exam,
    examDate: user.exam_date,
    streakDays: user.streak_days,
    dailyGoal: user.daily_goal
  };
  req.sessionToken = token;
  next();
}

// Simple in-memory rate limiter for auth & AI endpoints
const rateLimitMap = new Map();
function rateLimit(limit = 15, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > limit) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }
    next();
  };
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Sign Up
router.post('/auth/signup', rateLimit(10, 60000), (req, res) => {
  try {
    const { email, password, name, role, targetExam, examDate } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long for security.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { hash, salt } = hashPassword(password);
    const now = Date.now();

    const insert = db.prepare(`
      INSERT INTO users (
        id, email, password_hash, salt, name, role, avatar, 
        target_exam, exam_date, sound_enabled, streak_days, daily_goal, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      userId,
      cleanEmail,
      hash,
      salt,
      name.trim(),
      role || 'Student',
      'kitty',
      targetExam || 'General Studies',
      examDate || new Date(now + 90 * 86400000).toISOString().split('T')[0],
      1,
      1,
      25,
      now
    );

    // Seed initial starter decks for the new user
    seedDecksForUser(db, userId);

    // Generate Session Token (valid for 30 days)
    const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = now + 30 * 86400000;
    db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
      token,
      userId,
      now,
      expiresAt
    );

    const user = {
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      role: role || 'Student',
      avatar: 'kitty',
      targetExam: targetExam || 'General Studies',
      examDate: examDate || new Date(now + 90 * 86400000).toISOString().split('T')[0],
      soundEnabled: true,
      streakDays: 1,
      dailyGoal: 25,
      createdAt: now
    };

    res.status(201).json({ user, token, message: 'Welcome to Ankitti! 🎀' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Login
router.post('/auth/login', rateLimit(20, 60000), (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = verifyPassword(password, row.password_hash, row.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate session token
    const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
    const now = Date.now();
    const expiresAt = now + 30 * 86400000;

    db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
      token,
      row.id,
      now,
      expiresAt
    );

    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      avatar: row.avatar,
      targetExam: row.target_exam,
      examDate: row.exam_date,
      soundEnabled: Boolean(row.sound_enabled),
      streakDays: row.streak_days,
      dailyGoal: row.daily_goal,
      createdAt: row.created_at
    };

    res.json({ user, token, message: 'Welcome back! 🎀' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please check credentials.' });
  }
});

// Logout
router.post('/auth/logout', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(req.sessionToken);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Delete Account (asks for the password again)
router.delete('/auth/account', rateLimit(5, 60000), authMiddleware, (req, res) => {
  try {
    const row = db.prepare('SELECT password_hash, salt FROM users WHERE id = ?').get(req.user.id);
    const { password } = req.body || {};
    if (!row || !password || !verifyPassword(String(password), row.password_hash, row.salt)) {
      return res.status(403).json({ error: 'That password is not right.' });
    }
    for (const table of ['review_logs', 'drafts', 'cards', 'decks', 'sessions']) {
      db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(req.user.id);
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete the account' });
  }
});

// Get Current User Profile
router.get('/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Update Profile
router.put('/auth/profile', authMiddleware, (req, res) => {
  try {
    const { name, role, targetExam, examDate, soundEnabled, streakDays, dailyGoal } = req.body;

    const update = db.prepare(`
      UPDATE users SET 
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        target_exam = COALESCE(?, target_exam),
        exam_date = COALESCE(?, exam_date),
        sound_enabled = COALESCE(?, sound_enabled),
        streak_days = COALESCE(?, streak_days),
        daily_goal = COALESCE(?, daily_goal)
      WHERE id = ?
    `);

    update.run(
      name,
      role,
      targetExam,
      examDate,
      soundEnabled !== undefined ? (soundEnabled ? 1 : 0) : null,
      streakDays,
      dailyGoal,
      req.user.id
    );

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    res.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        avatar: updated.avatar,
        targetExam: updated.target_exam,
        examDate: updated.exam_date,
        soundEnabled: Boolean(updated.sound_enabled),
        streakDays: updated.streak_days,
        dailyGoal: updated.daily_goal
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==========================================
// 2. DECKS API
// ==========================================

// Get all decks for current user
router.get('/decks', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id);
    const decks = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      icon: r.icon || '🎀',
      color: r.color || '#ff4d88',
      settings: r.settings_json ? JSON.parse(r.settings_json) : {},
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
    res.json(decks);
  } catch (err) {
    console.error('Fetch decks error:', err);
    res.status(500).json({ error: 'Failed to retrieve decks' });
  }
});

// Create Deck
router.post('/decks', authMiddleware, (req, res) => {
  try {
    const { id, name, description, icon, color, settings } = req.body;
    if (!name) return res.status(400).json({ error: 'Deck name is required' });

    const deckId = id || `deck_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO decks (id, user_id, name, description, icon, color, settings_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      deckId,
      req.user.id,
      name.trim(),
      description || '',
      icon || '🎀',
      color || '#ff4d88',
      JSON.stringify(settings || {}),
      now,
      now
    );

    res.status(201).json({
      id: deckId,
      name: name.trim(),
      description: description || '',
      icon: icon || '🎀',
      color: color || '#ff4d88',
      settings: settings || {},
      createdAt: now,
      updatedAt: now
    });
  } catch (err) {
    console.error('Create deck error:', err);
    res.status(500).json({ error: 'Failed to create deck' });
  }
});

// Update Deck
router.put('/decks/:id', authMiddleware, (req, res) => {
  try {
    const { name, description, icon, color, settings } = req.body;
    const now = Date.now();

    db.prepare(`
      UPDATE decks SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        settings_json = COALESCE(?, settings_json),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name,
      description,
      icon,
      color,
      settings ? JSON.stringify(settings) : null,
      now,
      req.params.id,
      req.user.id
    );

    const row = db.prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: 'Deck not found' });

    res.json({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      settings: row.settings_json ? JSON.parse(row.settings_json) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

// Delete Deck
router.delete('/decks/:id', authMiddleware, (req, res) => {
  try {
    // Delete cards associated with deck
    db.prepare('DELETE FROM cards WHERE deck_id = ? AND user_id = ?').run(req.params.id, req.user.id);
    db.prepare('DELETE FROM decks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Deck deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

// ==========================================
// 3. CARDS API (With Screenshot & Attachment Support)
// ==========================================

// Get cards for user (optionally filtered by deckId)
router.get('/cards', authMiddleware, (req, res) => {
  try {
    const { deckId } = req.query;
    let rows;
    if (deckId) {
      rows = db.prepare('SELECT * FROM cards WHERE user_id = ? AND deck_id = ? ORDER BY due ASC').all(req.user.id, deckId);
    } else {
      rows = db.prepare('SELECT * FROM cards WHERE user_id = ? ORDER BY due ASC').all(req.user.id);
    }

    const cards = rows.map(r => ({
      id: r.id,
      deckId: r.deck_id,
      type: r.type,
      front: r.front,
      back: r.back,
      frontImage: r.front_image || null,
      backImage: r.back_image || null,
      tags: r.tags_json ? JSON.parse(r.tags_json) : [],
      due: r.due,
      interval: r.interval,
      easeFactor: r.ease_factor,
      repetitions: r.repetitions,
      lapses: r.lapses,
      state: r.state,
      stepIndex: r.step_index,
      medicalMeta: r.medical_meta_json ? JSON.parse(r.medical_meta_json) : {},
      flagged: Boolean(r.flagged)
    }));

    res.json(cards);
  } catch (err) {
    console.error('Fetch cards error:', err);
    res.status(500).json({ error: 'Failed to retrieve cards' });
  }
});

// Create Card
router.post('/cards', authMiddleware, (req, res) => {
  try {
    const {
      id, deckId, type, front, back, frontImage, backImage, tags,
      due, interval, easeFactor, repetitions, lapses, state, stepIndex,
      medicalMeta, flagged
    } = req.body;

    if (!deckId || !front) {
      return res.status(400).json({ error: 'Deck and front content are required' });
    }

    const cardId = id || `card_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO cards (
        id, user_id, deck_id, type, front, back, front_image, back_image, tags_json,
        due, interval, ease_factor, repetitions, lapses, state, step_index,
        medical_meta_json, flagged, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      cardId,
      req.user.id,
      deckId,
      type || 'basic',
      front,
      back || '',
      frontImage || null,
      backImage || null,
      JSON.stringify(tags || []),
      due !== undefined ? due : now,
      interval || 0,
      easeFactor || 2.5,
      repetitions || 0,
      lapses || 0,
      state || 'new',
      stepIndex || 0,
      JSON.stringify(medicalMeta || {}),
      flagged ? 1 : 0,
      now
    );

    // Update deck's updated_at
    db.prepare('UPDATE decks SET updated_at = ? WHERE id = ?').run(now, deckId);

    res.status(201).json({
      id: cardId,
      deckId,
      type: type || 'basic',
      front,
      back: back || '',
      frontImage: frontImage || null,
      backImage: backImage || null,
      tags: tags || [],
      due: due !== undefined ? due : now,
      interval: interval || 0,
      easeFactor: easeFactor || 2.5,
      repetitions: repetitions || 0,
      lapses: lapses || 0,
      state: state || 'new',
      stepIndex: stepIndex || 0,
      medicalMeta: medicalMeta || {},
      flagged: Boolean(flagged)
    });
  } catch (err) {
    console.error('Create card error:', err);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update Card
router.put('/cards/:id', authMiddleware, (req, res) => {
  try {
    const {
      deckId, type, front, back, frontImage, backImage, tags,
      due, interval, easeFactor, repetitions, lapses, state, stepIndex,
      medicalMeta, flagged
    } = req.body;

    db.prepare(`
      UPDATE cards SET
        deck_id = COALESCE(?, deck_id),
        type = COALESCE(?, type),
        front = COALESCE(?, front),
        back = COALESCE(?, back),
        front_image = ?,
        back_image = ?,
        tags_json = COALESCE(?, tags_json),
        due = COALESCE(?, due),
        interval = COALESCE(?, interval),
        ease_factor = COALESCE(?, ease_factor),
        repetitions = COALESCE(?, repetitions),
        lapses = COALESCE(?, lapses),
        state = COALESCE(?, state),
        step_index = COALESCE(?, step_index),
        medical_meta_json = COALESCE(?, medical_meta_json),
        flagged = COALESCE(?, flagged)
      WHERE id = ? AND user_id = ?
    `).run(
      deckId,
      type,
      front,
      back,
      frontImage !== undefined ? frontImage : null,
      backImage !== undefined ? backImage : null,
      tags ? JSON.stringify(tags) : null,
      due,
      interval,
      easeFactor,
      repetitions,
      lapses,
      state,
      stepIndex,
      medicalMeta ? JSON.stringify(medicalMeta) : null,
      flagged !== undefined ? (flagged ? 1 : 0) : null,
      req.params.id,
      req.user.id
    );

    const r = db.prepare('SELECT * FROM cards WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!r) return res.status(404).json({ error: 'Card not found' });

    res.json({
      id: r.id,
      deckId: r.deck_id,
      type: r.type,
      front: r.front,
      back: r.back,
      frontImage: r.front_image,
      backImage: r.back_image,
      tags: r.tags_json ? JSON.parse(r.tags_json) : [],
      due: r.due,
      interval: r.interval,
      easeFactor: r.ease_factor,
      repetitions: r.repetitions,
      lapses: r.lapses,
      state: r.state,
      stepIndex: r.step_index,
      medicalMeta: r.medical_meta_json ? JSON.parse(r.medical_meta_json) : {},
      flagged: Boolean(r.flagged)
    });
  } catch (err) {
    console.error('Update card error:', err);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete Card
router.delete('/cards/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM cards WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// ==========================================
// 4. REVIEW LOGS & STATS API
// ==========================================

router.get('/reviews', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM review_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 500').all(req.user.id);
    const reviews = rows.map(r => ({
      id: r.id,
      cardId: r.card_id,
      timestamp: r.timestamp,
      rating: r.rating,
      reviewState: r.review_state,
      interval: r.interval,
      lastInterval: r.last_interval,
      timeTaken: r.time_taken
    }));
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review logs' });
  }
});

router.post('/reviews', authMiddleware, (req, res) => {
  try {
    const { cardId, rating, reviewState, interval, lastInterval, timeTaken } = req.body;
    const logId = `rev_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO review_logs (id, user_id, card_id, timestamp, rating, review_state, interval, last_interval, time_taken)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      req.user.id,
      cardId,
      now,
      rating || 3,
      reviewState || 'review',
      interval || 1,
      lastInterval || 0,
      timeTaken || 0
    );

    res.status(201).json({ success: true, id: logId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record review' });
  }
});

// ==========================================
// 5. DRAFTS API
// ==========================================

router.get('/drafts', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM drafts WHERE user_id = ?').all(req.user.id);
    const drafts = rows.map(r => JSON.parse(r.data_json));
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

router.post('/drafts', authMiddleware, (req, res) => {
  try {
    const { id, deckId, cardId, ...rest } = req.body;
    const draftId = id || `draft_${deckId}`;
    const now = Date.now();
    const fullDraft = { id: draftId, deckId, cardId, ...rest, lastSavedAt: now };

    db.prepare(`
      INSERT OR REPLACE INTO drafts (id, user_id, deck_id, card_id, data_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      draftId,
      req.user.id,
      deckId,
      cardId || null,
      JSON.stringify(fullDraft),
      now
    );

    res.json({ success: true, draft: fullDraft });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

router.delete('/drafts/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM drafts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear draft' });
  }
});

// ==========================================
// 6. DEEPSEEK AI DECK GENERATION API
// ==========================================

router.post('/ai/generate-deck', rateLimit(10, 60000), authMiddleware, async (req, res) => {
  try {
    const { topic, cardCount = 8, notes = '', style = 'mixed', apiKey: clientKey } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Please provide a topic or prompt for AI deck generation.' });
    }

    // Resolve DeepSeek API Key from .env or client override
    const apiKey = clientKey || process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;

    if (!apiKey || !apiKey.trim() || apiKey === 'your_deepseek_api_key_here') {
      return res.status(400).json({
        error: 'AI_API_KEY_MISSING',
        message: 'AI Service API Key is missing. Please add DEEPSEEK_API_KEY to your .env file or enter it in the prompt modal.'
      });
    }

    const systemPrompt = `You are Ankitti AI, an expert pedagogist and spaced repetition flashcard architect.
Your task is to generate high-yield, highly memorable flashcards on the requested topic.
Guidelines:
1. Generate between ${Math.min(20, Math.max(3, cardCount))} cards.
2. For cards, use either 'basic' (Q&A) or 'cloze' (e.g. {{c1::hidden answer}}).
3. Always include a concise, high-yield 'takeaway' (pearl of wisdom) and an intuitive 'mnemonic' (memory hook).
4. Assign 2-3 relevant tags.
5. Provide a cute deck title, a 1-sentence description, a fitting emoji icon, and a pastel hex color (e.g. #ff4d88, #8b5cf6, #06b6d4, #10b981, #f59e0b).
6. Output ONLY valid JSON matching this schema:
{
  "deckName": "string",
  "description": "string",
  "icon": "emoji",
  "color": "#hex",
  "cards": [
    {
      "type": "basic" | "cloze",
      "front": "string",
      "back": "string",
      "tags": ["string"],
      "takeaway": "string",
      "mnemonic": "string"
    }
  ]
}`;

    const userPrompt = `Topic: "${topic.trim()}"
${notes.trim() ? `Additional Source Notes/Text to convert into cards:\n${notes.trim()}\n` : ''}
Card Style Preference: ${style}
Number of Cards: ${cardCount}
Remember: return ONLY the JSON object, with no markdown code blocks and no surrounding commentary.`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI Service HTTP error:', response.status, errText);
      return res.status(response.status).json({
        error: `AI Service returned status ${response.status}: ${errText}`
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'DeepSeek returned an empty response.' });
    }

    let parsed;
    try {
      // Clean possible markdown code fences if returned
      const cleanJson = content.replace(/^```json/m, '').replace(/^```/m, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse DeepSeek JSON response:', content);
      return res.status(500).json({ error: 'Failed to parse AI response into flashcards JSON.' });
    }

    res.json({
      success: true,
      deck: {
        name: parsed.deckName || topic.trim(),
        description: parsed.description || `Generated by DeepSeek AI on ${new Date().toLocaleDateString()}`,
        icon: parsed.icon || '🤖',
        color: parsed.color || '#ff4d88'
      },
      cards: parsed.cards || []
    });
  } catch (err) {
    console.error('AI generation server error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate deck with DeepSeek.' });
  }
});

export default router;
