interface Env {
  DEEPSEEK_API_KEY?: string;
  ENVIRONMENT?: string;
  DB?: any;
  ASSETS?: any;
}

// ==========================================
// UTILITY: PBKDF2 Password Hashing (Web Crypto)
// ==========================================
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 1000,
      hash: 'SHA-512'
    },
    keyMaterial,
    512
  );
  const hash = bytesToHex(new Uint8Array(derivedBits));
  return { hash, salt: bytesToHex(salt) };
}

async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed.hash === hash;
}

function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    }
  });
}

// ==========================================
// D1 Schema Auto-Initialization
// ==========================================
let schemaInitialized = false;
async function ensureSchema(db: any) {
  if (schemaInitialized || !db) return;
  try {
    await db.exec(`
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
        expires_at INTEGER NOT NULL
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
        updated_at INTEGER NOT NULL
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
        created_at INTEGER NOT NULL
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
        time_taken INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS drafts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        deck_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_decks_user ON decks(user_id);
      CREATE INDEX IF NOT EXISTS idx_cards_user_deck ON cards(user_id, deck_id);
      CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(due);
    `);
    schemaInitialized = true;
  } catch (err) {
    console.error('Schema initialization error:', err);
  }
}

// Starter deck seeding for newly registered users
async function seedStarterDecks(db: any, userId: string) {
  const now = Date.now();
  const deckId = `deck_welcome_${Date.now()}`;
  
  await db.prepare(`
    INSERT INTO decks (id, user_id, name, description, icon, color, settings_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    deckId,
    userId,
    '🌸 Welcome to Ankitti 🎀',
    'Starter deck with tips on how to master spaced repetition and Ankitti magic.',
    '🎀',
    '#ff4d88',
    JSON.stringify({ learningSteps: [1, 10], relearningSteps: [10], graduatingInterval: 1, easyInterval: 4 }),
    now,
    now
  ).run();

  const starterCards = [
    {
      front: 'How does Ankitti spaced repetition help you remember everything?',
      back: 'Ankitti schedules flashcards using the SM-2 algorithm right before you are about to forget them, converting short-term memories into permanent neural pathways.',
      takeaway: 'Active recall + Spaced intervals = Long term mastery'
    },
    {
      front: 'How do you attach diagrams or screenshots to cards?',
      back: 'Simply paste from your clipboard (Ctrl+V / Cmd+V) directly into the Front or Back editor, or click the camera/upload button!',
      takeaway: 'Supports diagrams, histology, math, and visual mnemonics'
    },
    {
      front: 'Can you generate instant flashcard decks with AI?',
      back: 'Yes! Click the Magic Wand 🪄 in the studio to turn any study topic or lecture notes into an exam-ready deck in seconds.',
      takeaway: 'AI produces high-yield takeaways and intuitive memory hooks automatically'
    }
  ];

  for (let i = 0; i < starterCards.length; i++) {
    const card = starterCards[i];
    await db.prepare(`
      INSERT INTO cards (
        id, user_id, deck_id, type, front, back, front_image, back_image, tags_json,
        due, interval, ease_factor, repetitions, lapses, state, step_index,
        medical_meta_json, flagged, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `card_welcome_${i}_${Date.now()}`,
      userId,
      deckId,
      'basic',
      card.front,
      card.back,
      null,
      null,
      JSON.stringify(['Welcome', 'Ankitti']),
      now + i * 60000,
      0,
      2.5,
      0,
      0,
      'new',
      0,
      JSON.stringify({ takeaway: card.takeaway, mnemonic: '' }),
      0,
      now
    ).run();
  }
}

// Session authentication helper
async function authenticateUser(request: Request, db: any): Promise<any | null> {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const session = await db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?').bind(token, Date.now()).first();
  if (!session) return null;

  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first();
  if (!user) return null;

  return {
    ...user,
    soundEnabled: Boolean(user.sound_enabled),
    targetExam: user.target_exam,
    examDate: user.exam_date,
    streakDays: user.streak_days,
    dailyGoal: user.daily_goal,
    sessionToken: token
  };
}

// ==========================================
// WORKER ENTRYPOINT
// ==========================================
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Forward non-API requests directly to Cloudflare Static Assets
    if (!url.pathname.startsWith('/api') && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'Ankitti Cloudflare Edge Worker API',
        databaseBound: Boolean(env.DB),
        time: Date.now(),
      });
    }

    // AI deck generation endpoint
    if (url.pathname === '/api/ai/generate-deck' && request.method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        const { topic, cardCount = 8, notes = '', style = 'mixed', apiKey: clientKey } = body;

        if (!topic || !String(topic).trim()) {
          return jsonResponse({ error: 'Please provide a topic or prompt for AI deck generation.' }, 400);
        }

        const apiKey = (clientKey || env.DEEPSEEK_API_KEY || '').trim();

        if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
          return jsonResponse({
            error: 'AI_API_KEY_MISSING',
            message: 'AI Service API Key is missing. Please add DEEPSEEK_API_KEY to your Cloudflare environment variables or Settings.'
          }, 400);
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
  "deck": {
    "name": "string",
    "description": "string",
    "icon": "emoji",
    "color": "#hex"
  },
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

        const userPrompt = `Topic: "${String(topic).trim()}"
${notes && String(notes).trim() ? `Additional Source Notes/Text:\n${String(notes).trim()}\n` : ''}
Card Style Preference: ${style}
Number of Cards: ${cardCount}
Remember: return ONLY the JSON object, with no markdown code blocks and no commentary.`;

        const aiRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          return jsonResponse({ error: `AI Service returned status ${aiRes.status}: ${errText}` }, aiRes.status);
        }

        const data: any = await aiRes.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          return jsonResponse({ error: 'AI service returned empty content.' }, 500);
        }

        let jsonStr = content.trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        const parsed = JSON.parse(jsonStr);

        // Normalize response to ensure client always gets matching AiDeckResponse
        const deckName = parsed.deck?.name || parsed.deckName || String(topic).trim();
        const deckDesc = parsed.deck?.description || parsed.description || `AI generated deck for ${topic}`;
        const deckIcon = parsed.deck?.icon || parsed.icon || '🎀';
        const deckColor = parsed.deck?.color || parsed.color || '#ff4d88';
        const rawCards = Array.isArray(parsed.cards) ? parsed.cards : [];
        const normalizedCards = rawCards.map((c: any) => ({
          type: c.type === 'cloze' ? 'cloze' : 'basic',
          front: c.front || '',
          back: c.back || '',
          tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : [topic.slice(0, 20)],
          takeaway: c.takeaway || '',
          mnemonic: c.mnemonic || ''
        }));

        return jsonResponse({
          success: true,
          deck: {
            name: deckName,
            description: deckDesc,
            icon: deckIcon,
            color: deckColor
          },
          cards: normalizedCards
        });
      } catch (err: any) {
        return jsonResponse({ error: err.message || 'AI Generation failed on Cloudflare Worker.' }, 500);
      }
    }

    // ==========================================
    // DATABASE ENDPOINTS (Cloudflare D1)
    // ==========================================
    if (url.pathname.startsWith('/api/')) {
      if (!env.DB) {
        return jsonResponse({
          error: 'D1_NOT_BOUND',
          message: 'Cloudflare D1 Database binding "DB" is not connected. Please ensure [[d1_databases]] binding = "DB" in wrangler.toml.'
        }, 500);
      }

      await ensureSchema(env.DB);

      // --- 1. SIGNUP ---
      if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
        try {
          const body: any = await request.json().catch(() => ({}));
          const { email, password, name, role, targetExam, examDate } = body;

          if (!email || !password || !name) {
            return jsonResponse({ error: 'Email, password, and name are required' }, 400);
          }

          if (String(password).length < 8) {
            return jsonResponse({ error: 'Password must be at least 8 characters long for security.' }, 400);
          }

          const cleanEmail = String(email).trim().toLowerCase();
          const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
          if (existing) {
            return jsonResponse({ error: 'An account with this email already exists' }, 409);
          }

          const randomBytes = crypto.getRandomValues(new Uint8Array(4));
          const userId = `user_${Date.now()}_${bytesToHex(randomBytes)}`;
          const { hash, salt } = await hashPassword(password);
          const now = Date.now();

          await env.DB.prepare(`
            INSERT INTO users (
              id, email, password_hash, salt, name, role, avatar, 
              target_exam, exam_date, sound_enabled, streak_days, daily_goal, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            userId,
            cleanEmail,
            hash,
            salt,
            String(name).trim(),
            role || 'Student',
            'kitty',
            targetExam || 'General Studies',
            examDate || new Date(now + 90 * 86400000).toISOString().split('T')[0],
            1,
            1,
            25,
            now
          ).run();

          // Seed default starter deck
          await seedStarterDecks(env.DB, userId);

          // Generate Session Token (valid for 30 days)
          const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
          const token = `tok_${bytesToHex(tokenBytes)}`;
          const expiresAt = now + 30 * 86400000;

          await env.DB.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(
            token,
            userId,
            now,
            expiresAt
          ).run();

          const user = {
            id: userId,
            email: cleanEmail,
            name: String(name).trim(),
            role: role || 'Student',
            avatar: 'kitty',
            targetExam: targetExam || 'General Studies',
            examDate: examDate || new Date(now + 90 * 86400000).toISOString().split('T')[0],
            soundEnabled: true,
            streakDays: 1,
            dailyGoal: 25,
            createdAt: now
          };

          return jsonResponse({ user, token, message: 'Welcome to Ankitti! 🎀' }, 201);
        } catch (err: any) {
          console.error('Signup error:', err);
          return jsonResponse({ error: err.message || 'Failed to create account.' }, 500);
        }
      }

      // --- 2. LOGIN ---
      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        try {
          const body: any = await request.json().catch(() => ({}));
          const { email, password } = body;

          if (!email || !password) {
            return jsonResponse({ error: 'Email and password are required' }, 400);
          }

          const cleanEmail = String(email).trim().toLowerCase();
          const row = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(cleanEmail).first();

          if (!row) {
            return jsonResponse({ error: 'Invalid email or password' }, 401);
          }

          const isValid = await verifyPassword(password, row.password_hash, row.salt);
          if (!isValid) {
            return jsonResponse({ error: 'Invalid email or password' }, 401);
          }

          const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
          const token = `tok_${bytesToHex(tokenBytes)}`;
          const now = Date.now();
          const expiresAt = now + 30 * 86400000;

          await env.DB.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(
            token,
            row.id,
            now,
            expiresAt
          ).run();

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

          return jsonResponse({ user, token, message: 'Welcome back! 🎀' });
        } catch (err: any) {
          console.error('Login error:', err);
          return jsonResponse({ error: err.message || 'Login failed.' }, 500);
        }
      }

      // Authenticate request for all subsequent user routes
      const user = await authenticateUser(request, env.DB);
      if (!user) {
        return jsonResponse({ error: 'Authentication required or session expired.' }, 401);
      }

      // --- 3. LOGOUT ---
      if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
        await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(user.sessionToken).run();
        return jsonResponse({ success: true, message: 'Logged out successfully' });
      }

      // --- 4. CURRENT USER / PROFILE ---
      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        return jsonResponse({ user });
      }

      if (url.pathname === '/api/auth/profile' && request.method === 'PUT') {
        const body: any = await request.json().catch(() => ({}));
        const { name, role, targetExam, examDate, soundEnabled, streakDays, dailyGoal } = body;

        await env.DB.prepare(`
          UPDATE users SET 
            name = COALESCE(?, name),
            role = COALESCE(?, role),
            target_exam = COALESCE(?, target_exam),
            exam_date = COALESCE(?, exam_date),
            sound_enabled = COALESCE(?, sound_enabled),
            streak_days = COALESCE(?, streak_days),
            daily_goal = COALESCE(?, daily_goal)
          WHERE id = ?
        `).bind(
          name !== undefined ? String(name).trim() : null,
          role !== undefined ? role : null,
          targetExam !== undefined ? targetExam : null,
          examDate !== undefined ? examDate : null,
          soundEnabled !== undefined ? (soundEnabled ? 1 : 0) : null,
          streakDays !== undefined ? streakDays : null,
          dailyGoal !== undefined ? dailyGoal : null,
          user.id
        ).run();

        const updated = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
        return jsonResponse({
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
      }

      // --- 5. DECKS LIST & CREATE ---
      if (url.pathname === '/api/decks') {
        if (request.method === 'GET') {
          const { results = [] } = await env.DB.prepare('SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC').bind(user.id).all();
          const decks = results.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description || '',
            icon: r.icon || '🎀',
            color: r.color || '#ff4d88',
            settings: r.settings_json ? JSON.parse(r.settings_json) : {},
            createdAt: r.created_at,
            updatedAt: r.updated_at
          }));
          return jsonResponse(decks);
        }

        if (request.method === 'POST') {
          const body: any = await request.json().catch(() => ({}));
          const { id, name, description, icon, color, settings } = body;
          if (!name) return jsonResponse({ error: 'Deck name is required' }, 400);

          const randomBytes = crypto.getRandomValues(new Uint8Array(3));
          const deckId = id || `deck_${Date.now()}_${bytesToHex(randomBytes)}`;
          const now = Date.now();

          await env.DB.prepare(`
            INSERT INTO decks (id, user_id, name, description, icon, color, settings_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            deckId,
            user.id,
            String(name).trim(),
            description || '',
            icon || '🎀',
            color || '#ff4d88',
            JSON.stringify(settings || {}),
            now,
            now
          ).run();

          return jsonResponse({
            id: deckId,
            name: String(name).trim(),
            description: description || '',
            icon: icon || '🎀',
            color: color || '#ff4d88',
            settings: settings || {},
            createdAt: now,
            updatedAt: now
          }, 201);
        }
      }

      // --- 6. DECKS UPDATE & DELETE ---
      const deckMatch = url.pathname.match(/^\/api\/decks\/([^/]+)$/);
      if (deckMatch) {
        const deckId = deckMatch[1];
        if (request.method === 'PUT') {
          const body: any = await request.json().catch(() => ({}));
          const { name, description, icon, color, settings } = body;
          const now = Date.now();

          await env.DB.prepare(`
            UPDATE decks SET
              name = COALESCE(?, name),
              description = COALESCE(?, description),
              icon = COALESCE(?, icon),
              color = COALESCE(?, color),
              settings_json = COALESCE(?, settings_json),
              updated_at = ?
            WHERE id = ? AND user_id = ?
          `).bind(
            name !== undefined ? name : null,
            description !== undefined ? description : null,
            icon !== undefined ? icon : null,
            color !== undefined ? color : null,
            settings ? JSON.stringify(settings) : null,
            now,
            deckId,
            user.id
          ).run();

          const row = await env.DB.prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?').bind(deckId, user.id).first();
          if (!row) return jsonResponse({ error: 'Deck not found' }, 404);

          return jsonResponse({
            id: row.id,
            name: row.name,
            description: row.description,
            icon: row.icon,
            color: row.color,
            settings: row.settings_json ? JSON.parse(row.settings_json) : {},
            createdAt: row.created_at,
            updatedAt: row.updated_at
          });
        }

        if (request.method === 'DELETE') {
          await env.DB.prepare('DELETE FROM cards WHERE deck_id = ? AND user_id = ?').bind(deckId, user.id).run();
          await env.DB.prepare('DELETE FROM decks WHERE id = ? AND user_id = ?').bind(deckId, user.id).run();
          return jsonResponse({ success: true, message: 'Deck deleted' });
        }
      }

      // --- 7. CARDS LIST & CREATE ---
      if (url.pathname === '/api/cards') {
        if (request.method === 'GET') {
          const deckId = url.searchParams.get('deckId');
          const query = deckId
            ? env.DB.prepare('SELECT * FROM cards WHERE user_id = ? AND deck_id = ? ORDER BY due ASC').bind(user.id, deckId)
            : env.DB.prepare('SELECT * FROM cards WHERE user_id = ? ORDER BY due ASC').bind(user.id);

          const { results = [] } = await query.all();
          const cards = results.map((r: any) => ({
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
          return jsonResponse(cards);
        }

        if (request.method === 'POST') {
          const body: any = await request.json().catch(() => ({}));
          const {
            id, deckId, type, front, back, frontImage, backImage, tags,
            due, interval, easeFactor, repetitions, lapses, state, stepIndex,
            medicalMeta, flagged
          } = body;

          if (!deckId || !front) {
            return jsonResponse({ error: 'Deck and front content are required' }, 400);
          }

          const randomBytes = crypto.getRandomValues(new Uint8Array(3));
          const cardId = id || `card_${Date.now()}_${bytesToHex(randomBytes)}`;
          const now = Date.now();

          await env.DB.prepare(`
            INSERT INTO cards (
              id, user_id, deck_id, type, front, back, front_image, back_image, tags_json,
              due, interval, ease_factor, repetitions, lapses, state, step_index,
              medical_meta_json, flagged, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            cardId,
            user.id,
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
          ).run();

          await env.DB.prepare('UPDATE decks SET updated_at = ? WHERE id = ?').bind(now, deckId).run();

          return jsonResponse({
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
          }, 201);
        }
      }

      // --- 7.5 CARDS BATCH INSERT ---
      if (url.pathname === '/api/cards/batch' && request.method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const cardsToInsert = Array.isArray(body.cards) ? body.cards : [];
        if (cardsToInsert.length === 0) {
          return jsonResponse({ success: true, count: 0 });
        }

        const now = Date.now();
        const statements = [];

        for (const card of cardsToInsert) {
          if (!card.deckId || !card.front) continue;
          const cardId = card.id || `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          statements.push(
            env.DB.prepare(`
              INSERT OR REPLACE INTO cards (
                id, user_id, deck_id, type, front, back, front_image, back_image, tags_json,
                due, interval, ease_factor, repetitions, lapses, state, step_index,
                medical_meta_json, flagged, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              cardId,
              user.id,
              card.deckId,
              card.type || 'basic',
              card.front,
              card.back || '',
              card.frontImage || null,
              card.backImage || null,
              JSON.stringify(card.tags || []),
              card.due !== undefined ? card.due : now,
              card.interval || 0,
              card.easeFactor || 2.5,
              card.repetitions || 0,
              card.lapses || 0,
              card.state || 'new',
              card.stepIndex || 0,
              JSON.stringify(card.medicalMeta || {}),
              card.flagged ? 1 : 0,
              card.createdAt || now
            )
          );
        }

        if (statements.length > 0) {
          await env.DB.batch(statements);
        }

        return jsonResponse({ success: true, count: statements.length }, 201);
      }

      // --- 8. CARDS UPDATE & DELETE ---
      const cardMatch = url.pathname.match(/^\/api\/cards\/([^/]+)$/);
      if (cardMatch) {
        const cardId = cardMatch[1];
        if (request.method === 'PUT') {
          const body: any = await request.json().catch(() => ({}));
          const {
            deckId, type, front, back, frontImage, backImage, tags,
            due, interval, easeFactor, repetitions, lapses, state, stepIndex,
            medicalMeta, flagged
          } = body;

          await env.DB.prepare(`
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
          `).bind(
            deckId !== undefined ? deckId : null,
            type !== undefined ? type : null,
            front !== undefined ? front : null,
            back !== undefined ? back : null,
            frontImage !== undefined ? frontImage : null,
            backImage !== undefined ? backImage : null,
            tags ? JSON.stringify(tags) : null,
            due !== undefined ? due : null,
            interval !== undefined ? interval : null,
            easeFactor !== undefined ? easeFactor : null,
            repetitions !== undefined ? repetitions : null,
            lapses !== undefined ? lapses : null,
            state !== undefined ? state : null,
            stepIndex !== undefined ? stepIndex : null,
            medicalMeta ? JSON.stringify(medicalMeta) : null,
            flagged !== undefined ? (flagged ? 1 : 0) : null,
            cardId,
            user.id
          ).run();

          const r = await env.DB.prepare('SELECT * FROM cards WHERE id = ? AND user_id = ?').bind(cardId, user.id).first();
          if (!r) return jsonResponse({ error: 'Card not found' }, 404);

          return jsonResponse({
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
        }

        if (request.method === 'DELETE') {
          await env.DB.prepare('DELETE FROM cards WHERE id = ? AND user_id = ?').bind(cardId, user.id).run();
          return jsonResponse({ success: true, message: 'Card deleted' });
        }
      }

      // --- 9. REVIEWS ---
      if (url.pathname === '/api/reviews') {
        if (request.method === 'GET') {
          const { results = [] } = await env.DB.prepare('SELECT * FROM review_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 500').bind(user.id).all();
          const reviews = results.map((r: any) => ({
            id: r.id,
            cardId: r.card_id,
            timestamp: r.timestamp,
            rating: r.rating,
            reviewState: r.review_state,
            interval: r.interval,
            lastInterval: r.last_interval,
            timeTaken: r.time_taken
          }));
          return jsonResponse(reviews);
        }

        if (request.method === 'POST') {
          const body: any = await request.json().catch(() => ({}));
          const { cardId, rating, reviewState, interval, lastInterval, timeTaken } = body;
          const randomBytes = crypto.getRandomValues(new Uint8Array(3));
          const logId = `rev_${Date.now()}_${bytesToHex(randomBytes)}`;
          const now = Date.now();

          await env.DB.prepare(`
            INSERT INTO review_logs (id, user_id, card_id, timestamp, rating, review_state, interval, last_interval, time_taken)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            logId,
            user.id,
            cardId,
            now,
            rating || 3,
            reviewState || 'review',
            interval || 1,
            lastInterval || 0,
            timeTaken || 0
          ).run();

          return jsonResponse({ success: true, id: logId }, 201);
        }
      }

      // --- 10. DRAFTS ---
      if (url.pathname === '/api/drafts') {
        if (request.method === 'GET') {
          const { results = [] } = await env.DB.prepare('SELECT * FROM drafts WHERE user_id = ?').bind(user.id).all();
          const drafts = results.map((r: any) => JSON.parse(r.data_json));
          return jsonResponse(drafts);
        }

        if (request.method === 'POST') {
          const body: any = await request.json().catch(() => ({}));
          const { id, deckId, cardId, ...rest } = body;
          const draftId = id || `draft_${deckId}`;
          const now = Date.now();
          const fullDraft = { id: draftId, deckId, cardId, ...rest, lastSavedAt: now };

          await env.DB.prepare(`
            INSERT OR REPLACE INTO drafts (id, user_id, deck_id, data_json, updated_at)
            VALUES (?, ?, ?, ?, ?)
          `).bind(
            draftId,
            user.id,
            deckId,
            JSON.stringify(fullDraft),
            now
          ).run();

          return jsonResponse({ success: true, draft: fullDraft });
        }
      }

      const draftMatch = url.pathname.match(/^\/api\/drafts\/([^/]+)$/);
      if (draftMatch && request.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM drafts WHERE id = ? AND user_id = ?').bind(draftMatch[1], user.id).run();
        return jsonResponse({ success: true });
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404);
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const response = await env.ASSETS.fetch(request);
      if (url.pathname === '/sw.js') {
        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'application/javascript; charset=utf-8');
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Service-Worker-Allowed', '/');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }
      return response;
    }

    return new Response('Not Found', { status: 404 });
  }
};
