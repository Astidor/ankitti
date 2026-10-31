import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { sounds } from '../../services/audio';
import { Deck, UserAccount } from '../../types/anki';
import { GUIDES, guideUrl } from '../../seo/site';
import { BLUSH, Ears, FaceG, Heart, INK, KITTY_PATH, KittyShape, MiniKitty, Pencil, Sparkle } from './kitty';
import './landing.css';

interface LandingPageProps {
  decks: Deck[];
  user?: UserAccount | null;
  onLaunchApp: () => void;
  onOpenDeck: (deck: Deck) => void;
  onOpenImport: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onLogout?: () => void;
  onOpenInstall?: () => void;
}

const YEAR = new Date().getFullYear();

/* ─── Content ─── */

const DEMO_CARDS = [
  {
    topic: 'Japanese · JLPT N5',
    front: '食べる',
    back: 'taberu: to eat\n寿司を食べる — I eat sushi',
    previews: ['<10m', '12h', '1d', '4d'],
  },
  {
    topic: 'Algorithms',
    front: 'Average time of QuickSort?',
    back: 'O(n log n)\nWorst case O(n²) with bad pivots',
    previews: ['<10m', '1d', '3d', '6d'],
  },
  {
    topic: 'Biology',
    front: 'What do mitochondria make?',
    back: 'ATP, through cellular respiration',
    previews: ['<10m', '18h', '2d', '5d'],
  },
  {
    topic: 'Spanish',
    front: '¿Dónde está el baño?',
    back: 'Where is the bathroom?',
    previews: ['<10m', '10m', '1d', '4d'],
  },
];

const RATES = [
  { label: 'Again', bg: '#ffd2e5' },
  { label: 'Hard', bg: '#ffdcc4' },
  { label: 'Good', bg: '#c9f0dc' },
  { label: 'Easy', bg: '#cfe6ff' },
];

const DECK_COLOURS = ['#ffd2e5', '#d9ccfd', '#c9f0dc', '#fff0b0', '#ffdcc4', '#cfe6ff'];

const STAGES = [
  { when: '10 minutes', grow: 12, bg: '#fff0b0', text: 'First, a quick second look while it is still fresh.' },
  { when: '1 day', grow: 12, bg: '#ffdcc4', text: 'Remembered it? It graduates and comes back tomorrow.' },
  { when: '3 days', grow: 15, bg: '#ffd2e5', text: 'Then the gap grows by the card’s ease, about 2.5×.' },
  { when: '8 days', grow: 22, bg: '#c9f0dc', text: 'Easy answers stretch it further. Misses pull it back.' },
  { when: '3 weeks and on', grow: 39, bg: '#cfe6ff', text: 'Past 21 days the card is mature. You barely see it.' },
];

// Kept fair to Anki: it is great software, and the guide page says what it still does better.
const COMPARE: { label: string; anki: string; us: string }[] = [
  { label: 'One more go after today’s reviews', anki: 'Set up a Custom Study session', us: 'Tap Relearn on any deck' },
  { label: 'Getting started', anki: 'Download the desktop app', us: 'Open a browser tab' },
  { label: 'On an iPhone', anki: 'AnkiMobile, a paid app', us: 'Free, add to Home Screen' },
  { label: 'Your existing decks', anki: '.apkg files', us: 'Opens the same .apkg, history included' },
  { label: 'Scheduling', anki: 'SM-2 variant or FSRS', us: 'Anki-style SM-2' },
  { label: 'A deck from just a topic', anki: 'Write every card yourself', us: 'An AI first draft to edit' },
  { label: 'How it feels to open', anki: 'Plain and dense', us: 'Pastel, with ears' },
];

export const FAQS = [
  {
    q: 'Can I import my Anki decks?',
    a: 'Yes. Drop in an .apkg file and Ankitti unpacks it right in your browser, with tags, cloze cards and each card’s review history. CSV, TSV and JSON work too.',
    bg: '#ffd2e5',
  },
  {
    q: 'How does “Relearn anytime” work?',
    a: 'Anki locks a deck once the day’s reviews are done. In Ankitti you can open any deck and drill it again, and your real schedule is left alone.',
    bg: '#d9ccfd',
  },
  {
    q: 'Will I lose a card if I close the tab?',
    a: 'No. Every keystroke in the card editor is saved as you type. Reopen the tab and your draft is waiting where you left it.',
    bg: '#c9f0dc',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. No subscription and no ads.',
    bg: '#fff0b0',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes. Ankitti installs as an app from your browser (“Add to Home Screen” on iPhone) and keeps working offline.',
    bg: '#ffdcc4',
  },
];

const FOOT_LETTERS = [
  { ch: 'a', h: 70, bg: '#ffd2e5' },
  { ch: 'n', h: 86, bg: '#d9ccfd' },
  { ch: 'k', h: 100, bg: '#c9f0dc' },
  { ch: 'i', h: 62, bg: '#fff0b0' },
  { ch: 't', h: 90, bg: '#ffdcc4' },
  { ch: 't', h: 76, bg: '#cfe6ff' },
  { ch: 'i', h: 94, bg: '#ffd2e5' },
];

/* ─── Page ─── */

export const LandingPage: React.FC<LandingPageProps> = ({
  decks,
  user,
  onLaunchApp,
  onOpenDeck,
  onOpenImport,
  onOpenAuth,
  onLogout,
  onOpenInstall,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [demoIndex, setDemoIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [deckIndex, setDeckIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const card = DEMO_CARDS[demoIndex];
  const shownDecks = decks.slice(0, 6);
  const activeDeck = shownDecks[Math.min(deckIndex, shownDecks.length - 1)];

  // Section entrances: hidden only once JS is running, revealed as they scroll in.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('lp-in');
    });
    root.classList.add('lp-anim');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('lp-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    root.querySelectorAll('[data-reveal]:not(.lp-in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const flip = () => {
    sounds.playFlip();
    setFlipped(true);
  };

  const rate = (rating: 1 | 2 | 3 | 4) => {
    sounds.playRating(rating);
    setReviewed((n) => n + 1);
    setFlipped(false);
    setDemoIndex((i) => (i + 1) % DEMO_CARDS.length);
  };

  const click = (fn?: () => void) => () => {
    sounds.playClick();
    fn?.();
  };

  const reveal = (d: number, style?: React.CSSProperties) => ({
    'data-reveal': '',
    style: { '--d': d, ...style } as React.CSSProperties,
  });

  return (
    <div ref={rootRef} className="lp" id="top">
      {/* ── Hero ── */}
      <header className="lp-hero lp-grid-paper">
        <KittyShape fill="#d9ccfd" className="lp-hero-giant" />

        <nav className="lp-wrap lp-nav" aria-label="Main">
          <a href="#top" className="lp-wordmark" aria-label="Ankitti home">
            <MiniKitty fill="#ffd2e5" />
            ankitti
          </a>
          <div className="lp-nav-links">
            {shownDecks.length > 0 && <a href="#decks">Decks</a>}
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="lp-nav-actions">
            {onOpenInstall && (
              <button className="lp-link lp-hide-sm" onClick={click(onOpenInstall)}>
                Install
              </button>
            )}
            {user?.email ? (
              <>
                {onLogout && (
                  <button className="lp-link lp-hide-sm" onClick={click(onLogout)}>
                    Sign out
                  </button>
                )}
                <button className="lp-btn lp-btn-pink lp-btn-sm" onClick={click(onLaunchApp)}>
                  Open my decks
                </button>
              </>
            ) : (
              <>
                {onOpenAuth && (
                  <button className="lp-link" onClick={click(() => onOpenAuth('login'))}>
                    Sign in
                  </button>
                )}
                <button className="lp-btn lp-btn-pink lp-btn-sm" onClick={click(onLaunchApp)}>
                  Start free
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="lp-wrap lp-hero-grid">
          <div style={{ position: 'relative' }}>
            <Sparkle size={34} className="lp-twinkle" style={{ top: -36, left: '58%' }} />
            <Sparkle size={20} fill="#ffd2e5" className="lp-twinkle" style={{ top: -6, left: '70%', animationDelay: '-1.4s' }} />
            <h1 className="lp-display" {...reveal(0)}>
              Flashcards, but cute.
            </h1>
            <p className="lp-hero-lead" {...reveal(1)}>
              Ankitti is a free spaced-repetition app. It schedules every card with Anki’s SM-2, opens your .apkg decks, and lets you review whenever you like.
            </p>
            <div className="lp-hero-actions" {...reveal(2)}>
              <button className="lp-btn lp-btn-pink" onClick={click(onLaunchApp)}>
                Start studying <ArrowRight size={18} strokeWidth={2.75} />
              </button>
              <button className="lp-link" onClick={click(onOpenImport)}>
                Import an Anki deck
              </button>
            </div>
            <ul className="lp-hero-notes" {...reveal(3)}>
              <li><MiniKitty fill="#c9f0dc" /> Free, no ads</li>
              <li><MiniKitty fill="#fff0b0" /> Works offline</li>
              <li><MiniKitty fill="#cfe6ff" /> Space to flip, 1–4 to rate</li>
            </ul>
          </div>

          <div className="lp-hero-stage" {...reveal(2)}>
            <Sparkle size={44} className="lp-twinkle" style={{ top: 4, right: '4%', animationDelay: '-0.6s' }} />
            <Heart size={30} className="lp-bob" style={{ bottom: 18, right: -4, ['--rot' as string]: '12deg' }} />
            <Pencil className="lp-bob" style={{ bottom: -30, left: -18, ['--rot' as string]: '-14deg', animationDelay: '-2s' }} />

            <section
              key={demoIndex}
              data-ui
              className={`lp-study lp-eared ${reviewed > 0 ? 'lp-hop' : ''}`}
              aria-label="Try a review"
              aria-live="polite"
            >
              <Ears fill="#fffbf6" />
              <div className="lp-study-top">
                <span>{card.topic}</span>
                <span>{reviewed} reviewed</span>
              </div>
              <div className="lp-study-face">
                <svg width="150" height="56" viewBox="-75 -24 150 54" aria-hidden="true">
                  <FaceG x={0} y={2} s={1.35} mood={flipped ? "happy" : "think"} />
                </svg>
              </div>
              <p className="lp-study-q">{card.front}</p>
              {flipped && <p className="lp-study-a">{card.back}</p>}
              <div className="lp-study-controls">
                {!flipped ? (
                  <button className="lp-btn lp-btn-paper lp-study-flip" onClick={flip}>
                    Show answer
                  </button>
                ) : (
                  <div className="lp-rates" role="group" aria-label="How well did you remember?">
                    {RATES.map((r, i) => (
                      <button
                        key={r.label}
                        className="lp-rate"
                        style={{ background: r.bg }}
                        onClick={() => rate((i + 1) as 1 | 2 | 3 | 4)}
                        aria-label={`${r.label}, next review in ${card.previews[i]}`}
                      >
                        {r.label}
                        <span>{card.previews[i]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </header>

      <main>
        {/* ── Decks: object on a disc ── */}
        {activeDeck && (
          <section id="decks" className="lp-section">
            <div className="lp-wrap lp-decks-grid">
              <div>
                <h2 className="lp-h2 lp-display" {...reveal(0)}>Starter decks, ready to go</h2>
                <p className="lp-decks-intro" {...reveal(1)}>
                  Pick one and do your first review in under a minute. Or make your own, or bring yours over from Anki.
                </p>
                <ul className="lp-deck-names" {...reveal(2)}>
                  {shownDecks.map((d, i) => (
                    <li key={d.id}>
                      <button
                        className="lp-deck-name"
                        aria-pressed={d.id === activeDeck.id}
                        onClick={click(() => setDeckIndex(i))}
                      >
                        <svg className="lp-deck-dot" viewBox="0 0 200 170" aria-hidden="true">
                          <path d={KITTY_PATH} fill={DECK_COLOURS[i % DECK_COLOURS.length]} stroke={INK} strokeWidth="14" strokeLinejoin="round" />
                        </svg>
                        {d.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lp-disc-stage" {...reveal(1)}>
                <div className="lp-disc" style={{ background: DECK_COLOURS[deckIndex % DECK_COLOURS.length] }} />
                <Sparkle size={40} className="lp-twinkle" style={{ top: '8%', left: '10%' }} />
                <Sparkle size={24} fill="#fffbf6" className="lp-twinkle" style={{ bottom: '12%', right: '8%', animationDelay: '-1.8s' }} />
                <article className="lp-deck-card lp-eared">
                  <Ears fill="#fffbf6" />
                  <div className="lp-deck-card-inner" key={activeDeck.id}>
                    <h3 className="lp-display">{activeDeck.name}</h3>
                    <p>{activeDeck.description}</p>
                    <button className="lp-btn lp-btn-pink" onClick={click(() => onOpenDeck(activeDeck))}>
                      Study this deck <ArrowRight size={18} strokeWidth={2.75} />
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </section>
        )}

        {/* ── How it works: one bar ── */}
        <section id="how" className="lp-section lp-band">
          <div className="lp-wrap">
            <h2 className="lp-h2 lp-display" {...reveal(0, { maxWidth: '22ch' })}>
              Cards come back just before you forget
            </h2>
            <p className="lp-band-lead" {...reveal(1)}>
              Ankitti uses SM-2, the same scheduler as Anki. Each time you remember a card it waits longer to ask again. Here is one card on a good run.
            </p>
            <p className="lp-band-more" {...reveal(2)}>
              <a className="lp-link lp-link-light" href={guideUrl('sm2-algorithm')}>How SM-2 works, with the numbers</a>
            </p>
            <div className="lp-bar" data-ui>
              {STAGES.map((s, i) => (
                <div key={s.when} className="lp-seg" {...reveal(i + 1, { flexGrow: s.grow, flexBasis: 0 })}>
                  <div className={`lp-seg-block ${i === STAGES.length - 1 ? 'lp-eared' : ''}`} style={{ background: s.bg }}>
                    {i === STAGES.length - 1 && <Ears fill={s.bg} />}
                    {s.when}
                  </div>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features: close-ups on a board ── */}
        <section id="features" className="lp-section">
          <div className="lp-wrap lp-board">
            <div className="lp-tile lp-tile-h" {...reveal(0)}>
              <h2 className="lp-h2 lp-display">Small things, done with care</h2>
              <p>The parts you touch a hundred times a day, made to feel nice every time.</p>
            </div>

            <div className="lp-tile lp-tile-k" {...reveal(1)}>
              <div data-ui className="lp-tile-art" style={{ fontSize: 'clamp(56px, 7vw, 96px)', top: 26, right: -24, display: 'grid', gap: '0.22em', justifyItems: 'end' }}>
                <span className="lp-key" style={{ minWidth: '3.6em' }}>space</span>
                <span style={{ display: 'flex', gap: '0.18em' }}>
                  <span className="lp-key" style={{ background: '#ffd2e5' }}>1</span>
                  <span className="lp-key" style={{ background: '#ffdcc4' }}>2</span>
                  <span className="lp-key" style={{ background: '#c9f0dc' }}>3</span>
                  <span className="lp-key" style={{ background: '#cfe6ff' }}>4</span>
                </span>
              </div>
              <h3>Made for the keyboard</h3>
              <p className="lp-tile-sub">Space flips the card. 1 to 4 rates it.</p>
            </div>

            <div className="lp-tile lp-tile-r" {...reveal(2)}>
              <div data-ui className="lp-tile-art" style={{ fontSize: 'clamp(72px, 8vw, 112px)', top: 30, left: -28 }}>
                <div className="lp-toggle" />
              </div>
              <h3>Relearn anytime</h3>
              <p className="lp-tile-sub">Drill any deck, even with nothing due.</p>
            </div>

            <div className="lp-tile lp-tile-s" {...reveal(3)}>
              <div data-ui className="lp-tile-art" style={{ fontSize: 'clamp(24px, 5vw, 36px)', top: 18, right: -18 }}>
                <span className="lp-chip"><Check size={30} strokeWidth={3.5} color="#2f855a" /> Saved</span>
              </div>
              <h3>Drafts never vanish</h3>
              <p className="lp-tile-sub">Every keystroke is kept.</p>
            </div>

            <div className="lp-tile lp-tile-p" {...reveal(4)}>
              <div data-ui className="lp-tile-art lp-display" style={{ fontSize: 'clamp(56px, 6vw, 84px)', top: -6, right: -10 }}>
                25:00
              </div>
              <h3>Focus timer</h3>
              <p className="lp-tile-sub">A soft chime when it’s break time.</p>
            </div>

            <div className="lp-tile lp-tile-a" {...reveal(2)}>
              <div data-ui className="lp-tile-art" style={{ fontSize: 'clamp(26px, 3vw, 40px)', top: 22, right: -30 }}>
                <span className="lp-chip">japanese_core.apkg · 4,021 cards</span>
              </div>
              <h3>Imports your Anki decks</h3>
              <p className="lp-tile-sub">.apkg, .csv, .tsv and .json, unpacked in your browser.</p>
            </div>

            <div className="lp-tile lp-tile-i" {...reveal(3)}>
              <div data-ui className="lp-tile-art" style={{ fontSize: 'clamp(24px, 2.6vw, 34px)', top: 24, left: 22, right: -60 }}>
                <span className="lp-chip">Make a deck about: the Krebs cycle</span>
              </div>
              <h3>Decks from a topic</h3>
              <p className="lp-tile-sub">Type a subject and get a first draft to edit.</p>
            </div>

            <div className="lp-tile lp-tile-c" {...reveal(4)}>
              <div data-ui className="lp-tile-art lp-display" style={{ fontSize: 'clamp(28px, 3.2vw, 44px)', top: 22, left: 22, whiteSpace: 'nowrap' }}>
                The <span className="lp-chip" style={{ background: '#ffd2e5' }}>[ … ]</span> makes ATP
              </div>
              <h3>Cloze cards</h3>
              <p className="lp-tile-sub">Hide any word with {'{{c1::…}}'}.</p>
            </div>
          </div>
        </section>

        {/* ── Compared with Anki: a report card ── */}
        <section id="compare" className="lp-section lp-compare">
          <div className="lp-wrap">
            <div className="lp-compare-head">
              <div>
                <h2 className="lp-h2 lp-display" {...reveal(0)}>Like Anki, minus the lock</h2>
                <p className="lp-compare-lead" {...reveal(1)}>
                  Same scheduling maths, same deck files. The difference is what happens when you want one more go, and how it feels to open.
                </p>
                <p {...reveal(2)}>
                  <a className="lp-link" href={guideUrl('anki-alternative')}>Read the full Anki comparison</a>
                </p>
              </div>
              <div className="lp-compare-art" {...reveal(2)}>
                <svg viewBox="40 20 380 340" role="img" aria-label="A stack of sleepy cat-eared flashcards">
                  <g transform="translate(60 205) rotate(-6)">
                    <path d={KITTY_PATH} transform="scale(1.5)" fill="#c9f0dc" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
                  </g>
                  <g transform="translate(95 160) rotate(5)">
                    <path d={KITTY_PATH} transform="scale(1.5)" fill="#fff0b0" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
                  </g>
                  <g transform="translate(70 110) rotate(-2)">
                    <path d={KITTY_PATH} transform="scale(1.5)" fill="#fffbf6" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
                    <path d="M40 30 L46 15 L60 30 Z" transform="scale(1.5)" fill={BLUSH} />
                    <path d="M140 30 L154 15 L160 30 Z" transform="scale(1.5)" fill={BLUSH} />
                    <FaceG x={150} y={140} s={1.4} mood="sleep" />
                  </g>
                  <g fontFamily="Fredoka, sans-serif" fontWeight="600" fill={INK}>
                    <text x="330" y="110" fontSize="44">z</text>
                    <text x="362" y="72" fontSize="32">z</text>
                    <text x="386" y="44" fontSize="22">z</text>
                  </g>
                </svg>
              </div>
            </div>

            <div className="lp-vs-card" {...reveal(2)}>
              <table className="lp-vs">
                <caption className="lp-sr">Anki and Ankitti compared</caption>
                <thead>
                  <tr>
                    <td />
                    <th scope="col" className="lp-vs-anki">Anki</th>
                    <th scope="col" className="lp-vs-us lp-eared">
                      <Ears fill="#ffd2e5" />
                      Ankitti
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td className="lp-vs-anki">{r.anki}</td>
                      <td className="lp-vs-us">
                        <span className="lp-vs-val">
                          <MiniKitty fill="#fffbf6" />
                          {r.us}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="lp-vs-note">
                Anki is wonderful and free on desktop. Ankitti is for when you want the same method somewhere softer.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ: eared index cards ── */}
        <section id="faq" className="lp-section">
          <div className="lp-wrap lp-faq-wrap">
            <h2 className="lp-h2 lp-display" {...reveal(0)}>Questions people ask</h2>
            <div className="lp-faq-stack" {...reveal(1)}>
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={f.q}
                    className="lp-faq-card lp-eared"
                    style={{ background: f.bg, zIndex: i + 1, ['--ear-inset' as string]: `${8 + i * 15}%` }}
                  >
                    <Ears fill={f.bg} />
                    <h3 style={{ margin: 0 }}>
                      <button
                        className="lp-faq-q"
                        aria-expanded={open}
                        aria-controls={`faq-${i}`}
                        onClick={click(() => setOpenFaq(open ? null : i))}
                      >
                        {f.q}
                        <span className="lp-faq-sign" aria-hidden="true"><Plus size={18} strokeWidth={3} /></span>
                      </button>
                    </h3>
                    {open && <p className="lp-faq-a" id={`faq-${i}`}>{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Closing call ── */}
        <section className="lp-section lp-grid-paper lp-cta">
          <div className="lp-wrap lp-cta-grid">
            <div>
              <h2 className="lp-display" {...reveal(0)}>Your first card is waiting.</h2>
              <p {...reveal(1)}>Make a deck, pick a starter one, or bring your Anki collection. It takes about a minute.</p>
              <div className="lp-hero-actions" {...reveal(2)}>
                <button className="lp-btn lp-btn-pink" onClick={click(onLaunchApp)}>
                  Start studying <ArrowRight size={18} strokeWidth={2.75} />
                </button>
                <button className="lp-link" onClick={click(onOpenImport)}>
                  Import an Anki deck
                </button>
              </div>
            </div>
            <div {...reveal(2, { position: 'relative', display: 'flex', justifyContent: 'center' })}>
              <Sparkle size={42} className="lp-twinkle" style={{ top: -10, left: '6%' }} />
              <Sparkle size={26} fill="#ffd2e5" className="lp-twinkle" style={{ bottom: 20, right: '4%', animationDelay: '-1.2s' }} />
              <KittyShape fill="#ffd2e5" mood="happy" className="lp-bob" style={{ width: '100%', maxWidth: 380 }} title="A happy cat-eared flashcard" />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer: the name in eared blocks ── */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-blocks" role="img" aria-label="ankitti">
            {FOOT_LETTERS.map((l, i) => (
              <div
                key={i}
                className="lp-block lp-eared"
                style={{ height: `${l.h}%`, background: l.bg, ['--ear-h' as string]: 'clamp(14px, 2.6vw, 36px)' }}
                aria-hidden="true"
              >
                <Ears fill={l.bg} />
                {l.ch}
              </div>
            ))}
          </div>

          <div className="lp-foot-row">
            <div>
              <h3>Study</h3>
              <ul>
                <li><button onClick={click(onLaunchApp)}>Start studying</button></li>
                <li><button onClick={click(onOpenImport)}>Import a deck</button></li>
              </ul>
            </div>
            <div>
              <h3>Learn more</h3>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3>Account</h3>
              <ul>
                {user?.email ? (
                  onLogout && <li><button onClick={click(onLogout)}>Sign out</button></li>
                ) : (
                  <>
                    {onOpenAuth && <li><button onClick={click(() => onOpenAuth('login'))}>Sign in</button></li>}
                    {onOpenAuth && <li><button onClick={click(() => onOpenAuth('signup'))}>Create an account</button></li>}
                  </>
                )}
                {onOpenInstall && <li><button onClick={click(onOpenInstall)}>Install the app</button></li>}
              </ul>
            </div>
            <div>
              <h3>Guides</h3>
              <ul>
                {GUIDES.map((g) => (
                  <li key={g.slug}><a href={guideUrl(g.slug)}>{g.linkText}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lp-foot-base">
            <span>
              © {YEAR} Ankitti · Made by <a href="https://github.com/Astidor/ankitti" target="_blank" rel="noreferrer">Astidor</a>
            </span>
            <a href="#top" className="lp-btn lp-btn-paper lp-btn-sm">Back to top</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
