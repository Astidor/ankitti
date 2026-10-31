// Shared SEO facts: the canonical origin and the guide pages that are prerendered as static HTML.

export const SITE_URL = 'https://ankitti.com';

export interface GuideMeta {
  slug: string;
  /** <title>, written for the search result. */
  title: string;
  /** Short label for links between pages. */
  linkText: string;
  description: string;
  /** ISO date the content last changed in a meaningful way. */
  updated: string;
}

export const GUIDES: GuideMeta[] = [
  {
    slug: 'anki-alternative',
    title: 'A Free Anki Alternative You Can Review Anytime | Ankitti',
    linkText: 'Ankitti vs Anki',
    description:
      'An honest comparison of Anki and Ankitti: the same SM-2 scheduling and .apkg decks, review whenever you want, free on iPhone, and runs in your browser.',
    updated: '2026-10-31',
  },
  {
    slug: 'open-apkg-file',
    title: 'How to Open an .apkg File Online, Without Installing Anki | Ankitti',
    linkText: 'Open an .apkg file online',
    description:
      'Open and study an Anki .apkg deck right in your browser. What an .apkg file contains, how to export one from Anki, and how to import it for free.',
    updated: '2026-10-31',
  },
  {
    slug: 'sm2-algorithm',
    title: 'The SM-2 Algorithm Explained, With Real Numbers | Ankitti',
    linkText: 'The SM-2 algorithm, explained',
    description:
      'How the SM-2 spaced repetition algorithm works: the original SuperMemo formula, the Anki-style variant with four buttons, worked intervals and code.',
    updated: '2026-10-31',
  },
  {
    slug: 'spaced-repetition',
    title: 'What Is Spaced Repetition? A Friendly Guide to Studying Less | Ankitti',
    linkText: 'What is spaced repetition?',
    description:
      'Spaced repetition in plain words: the forgetting curve, why testing yourself beats rereading, how many new cards a day to add, and how to write good flashcards.',
    updated: '2026-10-31',
  },
];

export const guideUrl = (slug: string) => `/${slug}/`;
