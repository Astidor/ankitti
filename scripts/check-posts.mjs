// Checks every blog post in content/blog/ before the build (see content/WRITING.md).
// Exits with an error, failing the build, when a post breaks a rule, so a bad post never goes live.
// Run on its own with: node scripts/check-posts.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'content', 'blog');

const STATIC_PAGES = new Set(['/', '/guides/', '/blog/', '/privacy/', '/anki-alternative/', '/open-apkg-file/', '/sm2-algorithm/', '/spaced-repetition/']);
const FILE_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const today = new Date().toISOString().slice(0, 10);

const parseFrontMatter = (raw) => {
  const m = raw.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^(["'])(.*)\1$/, '$2');
  }
  return { fields, body: m[2] };
};

if (!fs.existsSync(dir)) {
  console.log('check-posts: no content/blog folder, nothing to check');
  process.exit(0);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
const slugs = new Set(files.map((f) => f.match(FILE_RE)?.[2]).filter(Boolean));
const seenTitles = new Map();
const problems = [];

for (const file of files) {
  const fail = (msg) => problems.push(`${file}: ${msg}`);
  const name = file.match(FILE_RE);
  if (!name) {
    fail('file name must look like YYYY-MM-DD-slug.md (lowercase words joined by hyphens)');
    continue;
  }
  const [, fileDate, slug] = name;
  const parsed = parseFrontMatter(fs.readFileSync(path.join(dir, file), 'utf8'));
  if (!parsed) {
    fail('missing front matter between --- lines');
    continue;
  }
  const { fields, body } = parsed;

  // Front matter
  for (const key of ['title', 'description', 'date', 'keywords']) if (!fields[key]) fail(`front matter is missing "${key}"`);
  if (fields.title && (fields.title.length < 20 || fields.title.length > 65)) fail(`title must be 20–65 characters (is ${fields.title.length})`);
  if (fields.description && (fields.description.length < 110 || fields.description.length > 165))
    fail(`description must be 110–165 characters (is ${fields.description.length})`);
  if (fields.date && fields.date !== fileDate) fail(`date ${fields.date} doesn't match the file name date ${fileDate}`);
  if (fields.date && isNaN(Date.parse(fields.date))) fail(`date ${fields.date} isn't a real date`);
  if (fileDate > today) fail(`date ${fileDate} is in the future`);
  const keywords = (fields.keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
  if (keywords.length > 5) fail('use at most 5 keywords');
  if (fields.title) {
    const key = fields.title.toLowerCase();
    if (seenTitles.has(key)) fail(`same title as ${seenTitles.get(key)}`);
    seenTitles.set(key, file);
  }

  // Body
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 800 || words > 2200) fail(`body must be 800–2,200 words (is ${words})`);
  const lines = body.split(/\r?\n/);
  if (lines.some((l) => /^#\s/.test(l))) fail('don\'t use a "# " heading; the title is the page heading');
  const h2 = lines.filter((l) => /^##\s/.test(l)).length;
  if (h2 < 3) fail(`needs at least 3 "## " section headings (has ${h2})`);
  const prose = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  if (/<\/?[a-zA-Z][^>]*>/.test(prose)) fail('raw HTML isn\'t allowed; use Markdown');
  if (/\b(TODO|TBD|lorem ipsum)\b|\[insert/i.test(body)) fail('contains placeholder text');
  if (/!\[[^\]]*\]\((?!\/)/.test(body)) fail('images must be served from this site (start with /)');

  // Links
  for (const [, href] of body.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (href.startsWith('http://')) fail(`use https for ${href}`);
    else if (href.startsWith('https://')) continue;
    else if (href.startsWith('/')) {
      const clean = href.split('#')[0];
      const blog = clean.match(/^\/blog\/([a-z0-9-]+)\/$/);
      if (!(STATIC_PAGES.has(clean) || (blog && slugs.has(blog[1])))) fail(`link to a page that doesn't exist: ${href}`);
    } else if (!href.startsWith('#') && !href.startsWith('mailto:')) fail(`link must be absolute (start with / or https://): ${href}`);
  }
  if (slug.length > 70) fail('slug is too long (70 characters at most)');
}

if (problems.length) {
  console.error(`check-posts: ${problems.length} problem(s) found\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`check-posts: ${files.length} post(s) OK`);
