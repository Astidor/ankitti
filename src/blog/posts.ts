// Blog posts: Markdown files in content/blog/, named YYYY-MM-DD-slug.md, read at build time.
// Only the prerender bundle imports this; the app itself never ships the posts.

import { marked } from 'marked';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  keywords: string[];
  html: string;
  words: number;
  minutes: number;
}

const files = import.meta.glob('../../content/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Splits "---\nkey: value\n---\nbody" into fields and body. Values may be wrapped in quotes. */
export function parseFrontMatter(raw: string): { fields: Record<string, string>; body: string } {
  const m = raw.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fields: {}, body: raw };
  const fields: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^(["'])(.*)\1$/, '$2');
  }
  return { fields, body: m[2] };
}

const toPost = (path: string, raw: string): BlogPost => {
  const name = path.split('/').pop()!.replace(/\.md$/, '');
  const { fields, body } = parseFrontMatter(raw);
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    slug: name.replace(/^\d{4}-\d{2}-\d{2}-/, ''),
    title: fields.title,
    description: fields.description,
    date: fields.date || name.slice(0, 10),
    keywords: (fields.keywords || '').split(',').map((k) => k.trim()).filter(Boolean),
    html: marked.parse(body, { async: false }) as string,
    words,
    minutes: Math.max(1, Math.round(words / 220)),
  };
};

/** Every published post, newest first. Posts dated in the future wait until their day. */
export function getPosts(today = new Date().toISOString().slice(0, 10)): BlogPost[] {
  return Object.entries(files)
    .map(([path, raw]) => toPost(path, raw))
    .filter((p) => p.date <= today)
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
}

export const postUrl = (slug: string) => `/blog/${slug}/`;
