# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Learners across disciplines—students preparing for exams (medical, bar, university, high school), language learners (Japanese JLPT, Spanish, French), software engineers learning algorithms and system design, and lifelong knowledge workers—who need systematic memory retention without the clunky, dated interface of legacy flashcard software.

## Product Purpose

Ankitti is an elevated, web-native spaced repetition system inspired by Anki. It combines the proven SM-2 spaced repetition memory algorithm with a polished, delightful design aesthetic (clean editorial minimalism meets retro Japanese kawaii mascot craft). It eliminates user friction around data loss, rigid repetition restrictions, and harsh visual styling.

## Positioning

Unlike traditional Anki which enforces a strict daily limit and prevents users from reviewing or relearning mastered cards on the same day, Ankitti gives learners full autonomy to repeat, cram, or relearn any deck whenever they choose. Unlike generic flashcard apps, Ankitti maintains 100% mathematical fidelity to SM-2 scheduling parameters (intervals, ease factors, lapses) and supports full `.apkg` collection imports directly in the browser.

## Operating Context

- Deep study sessions on desktop and tablet browsers (Mac, Windows, iPad).
- Frequent interruptions where users close tabs or navigate away—demanding rock-solid draft persistence so zero cards or edits are lost.
- Review sessions requiring rapid, tactile keyboard navigation (Space to flip, 1-4 for Again/Hard/Good/Easy).

## Capabilities and Constraints

- **Spaced Repetition Engine:** SuperMemo SM-2 algorithm with customizable deck settings (learning steps, graduating interval, ease bonus, maximum interval).
- **Relearn Anytime Mode:** Instant on-demand review for any deck, bypassing Anki's "0 cards due" lock.
- **Draft Auto-Save:** Real-time persistence of active card drafts and edits to LocalStorage with visual status indicators.
- **Anki Import:** Direct browser-side parsing and import of `.apkg` SQLite collections, `.csv`, `.tsv`, and `.json`.
- **Card Formats:** Basic front/back, cloze deletions (`{{c1::answer::hint}}`), code formatting, and tags.
- **Study Analytics:** Spaced review heatmap, retention rates, daily streak counters, and session duration tracking.
- **Focus Pomodoro:** Ambient study timer with audio chimes.

## Brand Commitments

- **Name:** Ankitti 🎀
- **Visual Identity:** High-craft editorial typography paired with warm pastel tones and authentic retro kawaii mascot illustrations (generated via Nano Banana). Not childish clip art or emoji spam—clean, balanced, intentional graphic design.
- **Voice:** Encouraging, calm, distraction-free, and respectful of the learner's focus.

## Evidence on Hand

- Shipped assets: 4 high-resolution flat-vector mascot illustrations (`hero_mascot.png`, `celebrate_mascot.png`, `reading_mascot.png`, `cafe_mascot.png`) in `public/assets/`.
- Pre-loaded starter decks: JLPT N5 Japanese, Computer Science Algorithms, Biology Fundamentals, Everyday Spanish.
- Working browser-side SQLite + JSZip parser for `.apkg` archives.

## Product Principles

1. **Never Trap the Learner:** Memory should be self-directed; allow the learner to relearn cards whenever they want.
2. **Never Lose a Word:** Every keystroke in card creation auto-saves immediately.
3. **Craft Above Novelty:** Every interaction—from flipping a card to rating an interval—must feel tactile, responsive, and legible.
4. **Professional Warmth:** Serious study tools can still be warm and delightful without devolving into amateurish clutter.
