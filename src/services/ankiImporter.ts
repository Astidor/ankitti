import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import * as fzstd from 'fzstd';
import { Card, Deck, CardType } from '../types/anki';
import { DEFAULT_DECK_SETTINGS } from './scheduler';

export interface ImportResult {
  decks: Deck[];
  cards: Card[];
  summary: {
    deckCount: number;
    cardCount: number;
    fileName: string;
    fileType: 'apkg' | 'tsv' | 'csv' | 'json';
  };
}

// Clean HTML tags from Anki fields while preserving safe rich formatting (b, i, u, headings, lists, colors)
export function cleanAnkiHtml(html: string): string {
  if (!html) return '';

  let text = html
    // 1. Remove dangerous script and style blocks
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // 2. Convert common Anki line break wrappers
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<p\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    // 3. Clean entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // 4. Strip unsafe or unnecessary tags while PRESERVING safe rich formatting tags:
  // b, strong, i, em, u, s, strike, del, h1, h2, h3, h4, ul, ol, li, span, code, pre, sub, sup, mark
  text = text.replace(/<\/?(?:applet|base|basefont|body|button|embed|form|frame|frameset|head|html|iframe|input|link|meta|noframes|noscript|object|param|script|style|title)\b[^>]*>/gi, '');

  // 5. Strip dangerous inline event attributes like onclick, onload
  text = text.replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 6. Clean excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

export function detectCardType(content: string): CardType {
  if (/\{\{c\d+::.*?\}\}/.test(content)) {
    return 'cloze';
  }
  return 'basic';
}

export async function parseAnkiFile(file: File, targetDeckId?: string): Promise<ImportResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'apkg') {
    return await parseApkgFile(file, targetDeckId);
  } else if (extension === 'json') {
    return await parseJsonFile(file, targetDeckId);
  } else if (['tsv', 'txt', 'csv'].includes(extension || '')) {
    return await parseTextDelimitedFile(file, targetDeckId);
  } else {
    throw new Error(`Unsupported file type: .${extension}. Please upload an .apkg, .txt, .tsv, or .csv export.`);
  }
}

// Cache the initialized SQL instance to prevent re-instantiation errors and redundant downloads
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlJsInstance: any = null;

async function getSqlInstance() {
  if (sqlJsInstance) {
    return sqlJsInstance;
  }

  // Pre-fetch the WASM binary from local origin or high-speed, CORS-enabled CDNs.
  // Passing `wasmBinary` directly into initSqlJs ensures Emscripten instantiates the
  // WebAssembly module directly from memory, completely eliminating the error:
  // "both async and sync fetching of the wasm failed".
  const wasmSources = [
    '/sql-wasm.wasm',
    'https://cdn.jsdelivr.net/npm/sql.js@1.15.0/dist/sql-wasm.wasm',
    'https://unpkg.com/sql.js@1.15.0/dist/sql-wasm.wasm',
  ];

  let wasmBinary: ArrayBuffer | null = null;
  for (const src of wasmSources) {
    try {
      const res = await fetch(src);
      if (res.ok) {
        wasmBinary = await res.arrayBuffer();
        break;
      }
    } catch {
      // Try next source
    }
  }

  if (wasmBinary) {
    sqlJsInstance = await initSqlJs({ wasmBinary });
    return sqlJsInstance;
  }

  // Fallback: locateFile on jsdelivr
  sqlJsInstance = await initSqlJs({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.15.0/dist/${file}`,
  });
  return sqlJsInstance;
}

// 1. APKG Parser using JSZip, fzstd and sql.js
async function parseApkgFile(file: File, targetDeckId?: string): Promise<ImportResult> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  // Modern Anki packages (Anki 2.1.50+ / V3) use `collection.anki21b` compressed with Zstandard (zstd).
  // Legacy Anki packages use `collection.anki21` or `collection.anki2` (raw SQLite).
  let dbBuffer: Uint8Array | null = null;
  const anki21bFile = zipContent.file('collection.anki21b');
  const anki21File = zipContent.file('collection.anki21');
  const anki2File = zipContent.file('collection.anki2');

  if (anki21bFile) {
    const compressed = await anki21bFile.async('uint8array');
    dbBuffer = fzstd.decompress(compressed);
  } else if (anki21File) {
    dbBuffer = await anki21File.async('uint8array');
  } else if (anki2File) {
    dbBuffer = await anki2File.async('uint8array');
  }

  if (!dbBuffer) {
    throw new Error('Invalid .apkg package: collection database not found in archive.');
  }

  // Initialize SQLite with local/cached WASM
  const SQL = await getSqlInstance();

  const db = new SQL.Database(dbBuffer);

  // 1. Get decks
  let deckMap: Record<string, string> = {};
  const importedDecks: Deck[] = [];

  const defaultDeckName = file.name.replace(/\.apkg$/i, '');
  const primaryDeckId = targetDeckId || `deck_${Date.now()}`;

  // Modern Anki schema: query dedicated `decks` table
  try {
    const decksTable = db.exec('SELECT id, name FROM decks WHERE id != 1');
    if (decksTable.length > 0 && decksTable[0].values.length > 0) {
      for (const row of decksTable[0].values) {
        const id = String(row[0]);
        const name = String(row[1] || '').trim();
        if (name) {
          deckMap[id] = name;
        }
      }
    }
  } catch {
    // Modern decks table absent, proceed to legacy query
  }

  // Legacy Anki schema: query `col.decks` JSON field
  if (Object.keys(deckMap).length === 0) {
    try {
      const colQuery = db.exec('SELECT decks FROM col LIMIT 1');
      if (colQuery.length > 0 && colQuery[0].values.length > 0) {
        const rawJson = colQuery[0].values[0][0];
        if (rawJson) {
          const decksJson = JSON.parse(rawJson as string);
          for (const [id, d] of Object.entries(decksJson as Record<string, { id: number; name: string }>)) {
            if (id !== '1' && d && d.name) {
              deckMap[id] = d.name;
            }
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Query notes and cards first to determine which decks actually have cards
  const notesQuery = db.exec('SELECT id, flds, tags FROM notes');
  const cardsQuery = db.exec('SELECT id, nid, did, ivl, factor, reps, lapses, type, due FROM cards');

  const notesMap = new Map<number, { flds: string[]; tags: string[] }>();
  if (notesQuery.length > 0) {
    for (const row of notesQuery[0].values) {
      const nid = row[0] as number;
      const fldsRaw = (row[1] as string) || '';
      const tagsRaw = (row[2] as string) || '';
      const fields = fldsRaw.split('\x1f').map(cleanAnkiHtml);
      const tags = tagsRaw.trim().split(/\s+/).filter(Boolean);
      notesMap.set(nid, { flds: fields, tags });
    }
  }

  // Find distinct deck IDs that actually contain cards
  const didWithCards = new Set<string>();
  if (cardsQuery.length > 0) {
    for (const row of cardsQuery[0].values) {
      didWithCards.add(String(row[2]));
    }
  }

  if (targetDeckId) {
    importedDecks.push({
      id: targetDeckId,
      name: defaultDeckName,
      description: `Imported from ${file.name}`,
      icon: '🎀',
      color: '#ff4d88',
      settings: { ...DEFAULT_DECK_SETTINGS },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } else if (didWithCards.size <= 1) {
    // Single deck or single subdeck with cards: create 1 clean deck named after the file
    const cleanFileName = defaultDeckName.charAt(0).toUpperCase() + defaultDeckName.slice(1);
    const singleDid = Array.from(didWithCards)[0];
    const ankiName = (singleDid && deckMap[singleDid]) ? deckMap[singleDid].replace(/\x1f/g, '::') : '';
    const chosenName = cleanFileName || (ankiName ? ankiName.split('::').pop() : 'Imported Deck') || 'Imported Deck';

    importedDecks.push({
      id: primaryDeckId,
      name: chosenName,
      description: `Imported from ${file.name}`,
      icon: '🎀',
      color: '#ff4d88',
      settings: { ...DEFAULT_DECK_SETTINGS },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } else {
    // Multiple decks with cards: create ONLY the decks that actually have cards (exclude empty parent shells)
    for (const did of didWithCards) {
      const rawName = deckMap[did] || `Deck ${did}`;
      const cleanName = rawName.replace(/\x1f/g, '::');
      importedDecks.push({
        id: `deck_${did}_${Date.now()}`,
        name: cleanName,
        description: `Imported deck from ${file.name}`,
        icon: '🎀',
        color: '#ff4d88',
        settings: { ...DEFAULT_DECK_SETTINGS },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  const cards: Card[] = [];
  if (cardsQuery.length > 0) {
    for (const row of cardsQuery[0].values) {
      const cid = row[0] as number;
      const nid = row[1] as number;
      const did = String(row[2]);
      const ivl = (row[3] as number) || 0;
      const factor = (row[4] as number) || 2500;
      const reps = (row[5] as number) || 0;
      const lapses = (row[6] as number) || 0;
      const cType = row[7] as number;

      const note = notesMap.get(nid);
      if (!note || note.flds.length === 0) continue;

      const front = note.flds[0] || 'Untitled Card';
      const back = note.flds.slice(1).join('\n\n') || '';

      const detectedType = detectCardType(front);
      const ease = factor > 0 ? factor / 1000 : 2.5;

      let cardDeckId = primaryDeckId;
      if (targetDeckId) {
        cardDeckId = targetDeckId;
      } else if (importedDecks.length === 1) {
        cardDeckId = importedDecks[0].id;
      } else {
        const matchedDeck = importedDecks.find(d => d.id.includes(`_${did}_`)) || importedDecks[0];
        cardDeckId = matchedDeck ? matchedDeck.id : primaryDeckId;
      }

      cards.push({
        id: `c_${cid}_${Date.now()}`,
        deckId: cardDeckId,
        type: detectedType,
        front,
        back,
        tags: note.tags.length > 0 ? note.tags : ['Anki-Import'],
        createdAt: Date.now(),
        due: Date.now(),
        interval: Math.max(0, ivl),
        easeFactor: Math.max(1.3, ease),
        repetitions: reps,
        lapses,
        state: cType === 0 ? 'new' : cType === 1 ? 'learning' : 'review',
        stepIndex: 0,
      });
    }
  }

  db.close();

  return {
    decks: importedDecks,
    cards,
    summary: {
      deckCount: importedDecks.length,
      cardCount: cards.length,
      fileName: file.name,
      fileType: 'apkg',
    },
  };
}

// 2. Text / TSV / CSV Parser
async function parseTextDelimitedFile(file: File, targetDeckId?: string): Promise<ImportResult> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

  const delimiter = file.name.endsWith('.csv') ? ',' : '\t';

  const defaultDeckName = file.name.replace(/\.(txt|tsv|csv)$/i, '');
  const deckId = targetDeckId || `deck_${Date.now()}`;

  const deck: Deck = {
    id: deckId,
    name: defaultDeckName,
    description: `Imported from text file ${file.name}`,
    icon: '📝',
    color: '#ff4d88',
    settings: { ...DEFAULT_DECK_SETTINGS },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const cards: Card[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#')) continue; // Skip Anki header lines like #separator:tab

    const parts = line.split(delimiter);
    if (parts.length < 1) continue;

    const front = cleanAnkiHtml(parts[0]);
    const back = parts.length > 1 ? cleanAnkiHtml(parts[1]) : '';
    const tagPart = parts.length > 2 ? cleanAnkiHtml(parts[2]) : '';
    const tags = tagPart ? tagPart.split(/[, ]+/).filter(Boolean) : ['Anki-Import'];

    if (!front) continue;

    cards.push({
      id: `c_import_${i}_${Date.now()}`,
      deckId,
      type: detectCardType(front),
      front,
      back,
      tags,
      createdAt: Date.now(),
      due: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      lapses: 0,
      state: 'new',
      stepIndex: 0,
    });
  }

  return {
    decks: [deck],
    cards,
    summary: {
      deckCount: 1,
      cardCount: cards.length,
      fileName: file.name,
      fileType: delimiter === '\t' ? 'tsv' : 'csv',
    },
  };
}

// 3. JSON Backup Parser
async function parseJsonFile(file: File, targetDeckId?: string): Promise<ImportResult> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  const decks: Deck[] = parsed.decks || [];
  let cards: Card[] = parsed.cards || [];

  if (targetDeckId) {
    cards = cards.map(c => ({ ...c, deckId: targetDeckId }));
  }

  return {
    decks,
    cards,
    summary: {
      deckCount: decks.length,
      cardCount: cards.length,
      fileName: file.name,
      fileType: 'json',
    },
  };
}
