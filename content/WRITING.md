# How Ankitti blog posts are written

Posts live in `content/blog/` as `YYYY-MM-DD-slug.md`. The build turns each one into a static page at
`/blog/slug/`, adds it to `/blog/`, the RSS feed and the sitemap. `scripts/check-posts.mjs` runs before
every build and **fails the build** if a post breaks the hard rules below, so a bad post can never go live.

## Who we write for

Learners who use flashcards: students preparing for exams (medicine, law, school), language learners
(Japanese, Spanish, French…), people learning to code, and anyone who wants to remember what they study.
They arrive from a search with one question. Answer it well and they may try Ankitti.

## Voice

- Warm, calm and practical. A smart friend explaining something, not a marketer.
- Plain words, short sentences, active voice. Second person ("you").
- British spelling, to match the site: practise (verb), colour, organise, favourite.
- No hype: no "ultimate", "game-changer", "unlock", "supercharge", "hack", "secret".
- No emoji.

## Shape of a post

1. **Front matter** (exactly these fields):

   ```
   ---
   title: How many flashcards should you study a day?
   description: A plain answer for beginners and heavy users, how reviews pile up over time, and how to pick a daily number you can keep.
   date: 2026-11-15
   keywords: flashcards per day, anki new cards per day, spaced repetition workload
   ---
   ```

   - `title`: 20–65 characters, the question or promise in plain words, sentence case.
   - `description`: 110–165 characters, says what the reader will get. Used in search results.
   - `date`: today's date; must match the file name.
   - `keywords`: 1–5 comma-separated phrases people actually search for.

2. **Body** (Markdown, 900–1,600 words; the hard limits are 800–2,200):
   - Start with the answer in the first two or three sentences. No throat-clearing.
   - 4–7 sections with `##` headings (at least 3). `###` for sub-points. Never use `#` (the title is the H1).
   - Concrete and useful: steps, examples, numbers the reader can use, small tables where they help.
   - One short section or paragraph near the end may say how Ankitti helps, only with features
     listed below, and without pressure ("If you use Ankitti…").
   - Link to 1–2 guides and, when relevant, 1–2 earlier posts (see "Links").
   - End with a short takeaway, not "In conclusion".

## Accuracy rules (the most important part)

- **Never invent** statistics, percentages, studies, researchers, quotes, testimonials, users or anecdotes.
- Only cite research that is famous and that you are certain of, described in general terms, for example:
  Hermann Ebbinghaus's forgetting-curve experiments (1885); the spacing effect; the testing effect
  (Roediger and Karpicke, 2006); Piotr Woźniak's SM-2 algorithm (1987, SuperMemo). If unsure, leave it out.
- Prefer advice and reasoning over numbers. Numbers from Ankitti's own scheduler are fine (see below).
- No medical, legal or financial advice beyond study technique.
- Be fair to Anki and other apps. Say what they do well; don't claim things about them you can't check.
- Don't promise results ("pass your exam", "fluent in 3 months").

## What Ankitti really does (only mention these)

- Free spaced-repetition flashcards in the browser, installable as an app, works offline; Android app.
- Anki-style SM-2 scheduling: learning steps of 1 and 10 minutes, 1-day graduating interval, 4-day easy
  interval, starting ease 2.5 (minimum 1.3), Again/Hard/Good/Easy buttons.
- "Practise anyway" / Relearn: review any deck any time without changing its schedule.
- Imports Anki `.apkg` (text, cloze, tags, review history; not images or audio yet), `.csv`, `.tsv`, `.json`.
- Cloze cards (`{{c1::…}}`), pictures on cards, card drafts saved as you type, keyboard shortcuts
  (Space to flip, 1–4 to rate), focus timer, progress page with a 12-week calendar.
- AI deck drafts from a topic (needs a free account).
- Light and dark themes. Free, no ads.

## Links

Internal links must point at pages that exist:

- `/` (home), `/guides/`, `/blog/`, `/privacy/`
- Guides: `/anki-alternative/`, `/open-apkg-file/`, `/sm2-algorithm/`, `/spaced-repetition/`
- Earlier posts: `/blog/<slug>/` for a file that exists in `content/blog/`

External links: only to well-known, stable sources (Wikipedia, official Anki docs at docs.ankiweb.net,
official exam bodies). Use `https://`. Never link to a page you haven't seen exist.

## Hard rules the build checks

File name format, the four front-matter fields and their lengths, date matches the file name and isn't in
the future, 800–2,200 words, at least three `##` headings, no `#` heading, no raw HTML, no placeholder text
(TODO, lorem ipsum, [insert…]), no duplicate title or slug, internal links only to existing pages.
