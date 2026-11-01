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

export const PRIVACY = {
  path: '/privacy/',
  title: 'Privacy Policy | Ankitti',
  description:
    'What Ankitti stores when you study as a guest or with an account, how AI deck generation uses DeepSeek, and how to download or delete your data.',
  updated: '2026-10-31',
};

/**
 * Runs in <head> before first paint: applies the saved light/dark choice (or the device setting)
 * as <html data-theme>, and marks app launches so the prerendered website stays hidden.
 * index.html carries a copy of this script; keep the two the same.
 */
export const THEME_BOOT_SCRIPT = `(function(){var d=document.documentElement,m=matchMedia('(prefers-color-scheme: dark)');function saved(){try{return localStorage.getItem('ankitti_theme')}catch(e){return null}}function apply(p){p=p||saved();var t=p==='light'||p==='dark'?p:m.matches?'dark':'light';d.dataset.theme=t;d.style.colorScheme=t;var ms=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<ms.length;i++)ms[i].content=t==='dark'?'#17112a':'#f5f1ff';try{window.AnkittiAndroid&&AnkittiAndroid.setTheme(t)}catch(e){}dispatchEvent(new Event('ankitti-theme'))}window.__ankittiApplyTheme=apply;apply();m.addEventListener('change',function(){apply()});if(navigator.userAgent.indexOf('AnkittiApp/')>-1||new URLSearchParams(location.search).get('view')==='app'||matchMedia('(display-mode: standalone)').matches)d.classList.add('app-launch')})();`;
