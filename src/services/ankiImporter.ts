import JSZip from 'jszip';
import initSqlJs from 'sql.js';
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

// Clean HTML tags from Anki fields while preserving line breaks and basic formatting
export function cleanAnkiHtml(html: string): string {
  if (!html) return '';
  let text = html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // Keep bold and italics
  text = text.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  text = text.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  text = text.replace(/<em>(.*?)<\/em>/gi, '*$1*');

  // Strip remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');

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

// 1. APKG Parser using JSZip and sql.js
async function parseApkgFile(file: File, targetDeckId?: string): Promise<ImportResult> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  // Look for collection.anki21 or collection.anki2
  let dbFile = zipContent.file('collection.anki21');
  if (!dbFile) {
    dbFile = zipContent.file('collection.anki2');
  }

  if (!dbFile) {
    throw new Error('Invalid .apkg package: collection.anki2 not found in archive.');
  }

  const dbBuffer = await dbFile.async('uint8array');

  // Initialize SQLite
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const db = new SQL.Database(dbBuffer);

  // 1. Get decks from `col` table
  const colQuery = db.exec('SELECT decks, models FROM col LIMIT 1');
  let deckMap: Record<string, string> = {};
  const importedDecks: Deck[] = [];

  const defaultDeckName = file.name.replace(/\.apkg$/i, '');
  const primaryDeckId = targetDeckId || `deck_${Date.now()}`;

  if (colQuery.length > 0 && colQuery[0].values.length > 0) {
    try {
      const decksJson = JSON.parse(colQuery[0].values[0][0] as string);
      for (const [id, d] of Object.entries(decksJson as Record<string, { id: number; name: string }>)) {
        if (id !== '1' && d.name) {
          deckMap[id] = d.name;
        }
      }
    } catch {
      // Use fallback name
    }
  }

  if (Object.keys(deckMap).length === 0) {
    deckMap[primaryDeckId] = defaultDeckName;
    importedDecks.push({
      id: primaryDeckId,
      name: defaultDeckName,
      description: `Imported from ${file.name}`,
      icon: '🎀',
      color: '#ff4d88',
      settings: { ...DEFAULT_DECK_SETTINGS },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } else {
    for (const [id, name] of Object.entries(deckMap)) {
      const cleanName = name.replace(/\x1f/g, '::');
      importedDecks.push({
        id: targetDeckId || `deck_${id}_${Date.now()}`,
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

  // 2. Query notes and cards
  // notes: id, flds, tags
  // cards: id, nid, did, ivl, factor, reps, lapses, type, queue, due
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

  const cards: Card[] = [];
  if (cardsQuery.length > 0) {
    for (const row of cardsQuery[0].values) {
      const cid = row[0] as number;
      const nid = row[1] as number;
      const did = row[2] as number;
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
      const ease = factor / 1000;

      const cardDeckId = targetDeckId || (importedDecks.find(d => d.id.includes(String(did)))?.id || importedDecks[0]?.id || primaryDeckId);

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
        easeFactor: Math.max(1.3, ease || 2.5),
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
