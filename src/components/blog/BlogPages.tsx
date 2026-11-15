import React from 'react';
import { ArrowRight } from 'lucide-react';
import { GUIDES, guideUrl } from '../../seo/site';
import { BlogPost, postUrl } from '../../blog/posts';
import { Shell, TryCard, formatDate } from '../guides/GuidePage';
import { Ears, MiniKitty } from '../landing/kitty';

// Static blog pages, prerendered at build time like the guides.

const CARD_COLOURS = ['var(--c-pink-soft)', 'var(--c-lilac)', 'var(--c-mint)', 'var(--c-butter)', 'var(--c-peach)', 'var(--c-sky)'];

export const BlogPostPage: React.FC<{ post: BlogPost; recent: BlogPost[] }> = ({ post, recent }) => (
  <Shell
    crumbs={[{ href: '/', label: 'Ankitti' }, { href: '/blog/', label: 'Blog' }, { label: post.title }]}
    h1={post.title}
    lead={post.description}
    meta={`${formatDate(post.date)} · ${post.minutes} min read`}
    mood="think"
  >
    <main className="lp-wrap gp-main">
      <article className="gp-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      <aside className="gp-aside">
        <TryCard />
        {recent.length > 0 && (
          <nav aria-label="More from the blog" className="gp-more">
            <p className="gp-more-h">More from the blog</p>
            <ul>
              {recent.map((p) => (
                <li key={p.slug}>
                  <a href={postUrl(p.slug)}>
                    <MiniKitty fill="var(--c-pink-soft)" />
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <nav aria-label="Guides" className="gp-more">
          <p className="gp-more-h">Guides</p>
          <ul>
            {GUIDES.map((g) => (
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

export const BlogIndex: React.FC<{ posts: BlogPost[] }> = ({ posts }) => (
  <Shell
    crumbs={[{ href: '/', label: 'Ankitti' }, { label: 'Blog' }]}
    h1="The Ankitti blog"
    lead="Short, practical reads on studying with flashcards: spaced repetition, Anki decks, languages, exams and building a habit that sticks."
    mood="happy"
  >
    <main className="lp-wrap gp-index">
      {posts.length === 0 ? (
        <p className="gp-lead">The first post is on its way.</p>
      ) : (
        <ul className="gp-index-list">
          {posts.map((p, i) => {
            const bg = CARD_COLOURS[i % CARD_COLOURS.length];
            return (
              <li key={p.slug}>
                <a href={postUrl(p.slug)} className="gp-index-card lp-eared" style={{ background: bg }}>
                  <Ears fill={bg} />
                  <p className="gp-meta" style={{ margin: '0 0 6px' }}>
                    {formatDate(p.date)} · {p.minutes} min read
                  </p>
                  <h2 className="lp-display">{p.title}</h2>
                  <p>{p.description}</p>
                  <span className="gp-index-go">
                    Read the post <ArrowRight size={18} strokeWidth={2.75} />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      <TryCard />
    </main>
  </Shell>
);
