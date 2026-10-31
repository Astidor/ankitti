import React from 'react';
import { ArrowRight } from 'lucide-react';
import { GUIDES, guideUrl } from '../../seo/site';
import { Ears, KittyShape, MiniKitty, Sparkle } from '../landing/kitty';
import { GUIDE_CONTENT } from './content';

// Static pages: prerendered to HTML at build time and shipped without the app's JavaScript.

const FOOT_LETTERS = [
  { ch: 'a', h: 70, bg: 'var(--c-pink-soft)' },
  { ch: 'n', h: 86, bg: 'var(--c-lilac)' },
  { ch: 'k', h: 100, bg: 'var(--c-mint)' },
  { ch: 'i', h: 62, bg: 'var(--c-butter)' },
  { ch: 't', h: 90, bg: 'var(--c-peach)' },
  { ch: 't', h: 76, bg: 'var(--c-sky)' },
  { ch: 'i', h: 94, bg: 'var(--c-pink-soft)' },
];

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const Shell: React.FC<{
  crumbs: { href?: string; label: string }[];
  h1: string;
  lead: string;
  meta?: string;
  mood?: 'happy' | 'think' | 'sleep';
  children: React.ReactNode;
}> = ({ crumbs, h1, lead, meta, mood = 'happy', children }) => (
  <div className="lp gp" id="top">
    <header className="lp-grid-paper gp-head">
      <nav className="lp-wrap lp-nav" aria-label="Main">
        <a href="/" className="lp-wordmark" aria-label="Ankitti home">
          <MiniKitty fill="var(--c-pink-soft)" />
          ankitti
        </a>
        <div className="lp-nav-links">
          <a href="/#how">How it works</a>
          <a href="/#features">Features</a>
          <a href="/guides/">Guides</a>
        </div>
        <div className="lp-nav-actions">
          <a className="lp-btn lp-btn-pink lp-btn-sm" href="/">Start free</a>
        </div>
      </nav>

      <div className="lp-wrap gp-hero">
        <div>
          <nav aria-label="Breadcrumb">
            <ol className="gp-crumbs">
              {crumbs.map((c) => (
                <li key={c.label}>{c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}</li>
              ))}
            </ol>
          </nav>
          <h1 className="lp-display">{h1}</h1>
          <p className="gp-lead">{lead}</p>
          {meta && <p className="gp-meta">{meta}</p>}
        </div>
        <div className="gp-hero-art" aria-hidden="true">
          <Sparkle size={36} style={{ top: 0, left: '8%' }} />
          <Sparkle size={22} fill="var(--c-pink-soft)" style={{ bottom: 12, right: '6%' }} />
          <KittyShape fill="var(--c-pink-soft)" mood={mood} style={{ width: '100%', maxWidth: 260 }} />
        </div>
      </div>
    </header>

    {children}

    <footer className="lp-footer gp-footer">
      <div className="lp-wrap">
        <div className="lp-blocks gp-blocks" role="img" aria-label="ankitti">
          {FOOT_LETTERS.map((l, i) => (
            <div
              key={i}
              className="lp-block lp-eared"
              style={{ height: `${l.h}%`, background: l.bg, ['--ear-h' as string]: 'clamp(12px, 2vw, 26px)' }}
              aria-hidden="true"
            >
              <Ears fill={l.bg} />
              {l.ch}
            </div>
          ))}
        </div>
        <div className="lp-foot-row">
          <div>
            <h2 className="gp-foot-h">Study</h2>
            <ul>
              <li><a href="/">Start studying</a></li>
              <li><a href="/#decks">Starter decks</a></li>
            </ul>
          </div>
          <div>
            <h2 className="gp-foot-h">Learn more</h2>
            <ul>
              <li><a href="/#how">How it works</a></li>
              <li><a href="/#features">Features</a></li>
              <li><a href="/#faq">FAQ</a></li>
            </ul>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <h2 className="gp-foot-h">Guides</h2>
            <ul>
              {GUIDES.map((g) => (
                <li key={g.slug}><a href={guideUrl(g.slug)}>{g.linkText}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lp-foot-base">
          <span>
            © {new Date().getFullYear()} Ankitti · Made by <a href="https://github.com/Astidor/ankitti" rel="noreferrer">Astidor</a>
          </span>
          <a href="#top" className="lp-btn lp-btn-paper lp-btn-sm">Back to top</a>
        </div>
      </div>
    </footer>
  </div>
);

const TryCard: React.FC = () => (
  <div className="gp-try lp-eared">
    <Ears fill="var(--c-pink-soft)" />
    <p className="gp-try-h lp-display">Try it in your browser</p>
    <p>Free flashcards with Anki-style spaced repetition. Opens your .apkg decks. Nothing to install.</p>
    <a className="lp-btn lp-btn-pink" href="/">
      Start studying <ArrowRight size={18} strokeWidth={2.75} />
    </a>
  </div>
);

export const GuidePage: React.FC<{ slug: string }> = ({ slug }) => {
  const meta = GUIDES.find((g) => g.slug === slug)!;
  const c = GUIDE_CONTENT[slug];
  const others = GUIDES.filter((g) => g.slug !== slug);
  return (
    <Shell
      crumbs={[{ href: '/', label: 'Ankitti' }, { href: '/guides/', label: 'Guides' }, { label: meta.linkText }]}
      h1={c.h1}
      lead={c.lead}
      meta={`Updated ${formatDate(meta.updated)}`}
    >
      <main className="lp-wrap gp-main">
        <article className="gp-prose">
          {c.body}
          <section aria-labelledby="gp-faq">
            <h2 id="gp-faq">Questions</h2>
            <dl className="gp-faq">
              {c.faq.map((f) => (
                <div key={f.q}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>
        <aside className="gp-aside">
          <TryCard />
          <nav aria-label="More guides" className="gp-more">
            <p className="gp-more-h">More guides</p>
            <ul>
              {others.map((g) => (
                <li key={g.slug}>
                  <a href={guideUrl(g.slug)}>
                    <MiniKitty fill="var(--c-lilac)" />
                    {g.linkText}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </main>
    </Shell>
  );
};

export const GuidesIndex: React.FC = () => (
  <Shell
    crumbs={[{ href: '/', label: 'Ankitti' }, { label: 'Guides' }]}
    h1="Guides to studying with flashcards"
    lead="Plain-language guides to spaced repetition, the SM-2 algorithm, Anki decks and studying a little every day."
    mood="think"
  >
    <main className="lp-wrap gp-index">
      <ul className="gp-index-list">
        {GUIDES.map((g, i) => (
          <li key={g.slug}>
            <a
              href={guideUrl(g.slug)}
              className="gp-index-card lp-eared"
              style={{ background: ['var(--c-pink-soft)', 'var(--c-lilac)', 'var(--c-mint)', 'var(--c-butter)'][i % 4] }}
            >
              <Ears fill={['var(--c-pink-soft)', 'var(--c-lilac)', 'var(--c-mint)', 'var(--c-butter)'][i % 4]} />
              <h2 className="lp-display">{GUIDE_CONTENT[g.slug].h1}</h2>
              <p>{g.description}</p>
              <span className="gp-index-go">Read the guide <ArrowRight size={18} strokeWidth={2.75} /></span>
            </a>
          </li>
        ))}
      </ul>
      <TryCard />
    </main>
  </Shell>
);
