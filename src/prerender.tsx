// Build-time renderer (bundled with `vite build --ssr`, run by scripts/prerender.mjs).
// It gives crawlers real HTML: the landing page inside index.html, and the guides as static pages.

import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { LandingPage, FAQS } from './components/landing/LandingPage';
import { GuidePage, GuidesIndex } from './components/guides/GuidePage';
import { GUIDE_CONTENT } from './components/guides/content';
import { GUIDES, SITE_URL, guideUrl } from './seo/site';
import { INITIAL_DECKS } from './services/storage';

const noop = () => {};
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

const faqLd = (faq: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

const breadcrumbLd = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
});

/** Markup for <div id="root"> in index.html. The client re-renders over it. */
export function landingMarkup(): string {
  return renderToString(
    <LandingPage
      decks={INITIAL_DECKS}
      user={null}
      onLaunchApp={noop}
      onOpenDeck={noop}
      onOpenImport={noop}
      onOpenAuth={noop}
      onLogout={noop}
      onOpenInstall={noop}
    />
  );
}

/** Extra structured data for the landing page, generated from the FAQ it shows. */
export function landingHeadExtras(): string {
  return jsonLd(faqLd(FAQS.map(({ q, a }) => ({ q, a }))));
}

interface StaticPage {
  path: string; // e.g. "sm2-algorithm/index.html"
  html: string;
}

function documentFor(opts: {
  url: string;
  title: string;
  description: string;
  ogType: 'article' | 'website';
  assetsHead: string;
  ld: unknown[];
  body: string;
}): string {
  const { url, title, description } = opts;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="theme-color" content="#f5f1ff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#17112a" media="(prefers-color-scheme: dark)" />
<meta name="color-scheme" content="light dark" />
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
<meta property="og:type" content="${opts.ogType}" />
<meta property="og:site_name" content="Ankitti" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
${opts.assetsHead}
${opts.ld.map(jsonLd).join('\n')}
</head>
<body style="margin:0">
${opts.body}
</body>
</html>
`;
}

/** Every static page, given the built stylesheet <link> tags from index.html. */
export function staticPages(assetsHead: string): StaticPage[] {
  const home = { name: 'Ankitti', url: `${SITE_URL}/` };
  const guidesHub = { name: 'Guides', url: `${SITE_URL}/guides/` };

  const pages: StaticPage[] = GUIDES.map((g) => {
    const url = `${SITE_URL}${guideUrl(g.slug)}`;
    const c = GUIDE_CONTENT[g.slug];
    return {
      path: `${g.slug}/index.html`,
      html: documentFor({
        url,
        title: g.title,
        description: g.description,
        ogType: 'article',
        assetsHead,
        body: renderToStaticMarkup(<GuidePage slug={g.slug} />),
        ld: [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: c.h1,
            description: g.description,
            image: OG_IMAGE,
            dateModified: g.updated,
            datePublished: g.updated,
            mainEntityOfPage: url,
            author: { '@type': 'Organization', name: 'Ankitti', url: `${SITE_URL}/` },
            publisher: {
              '@type': 'Organization',
              name: 'Ankitti',
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
            },
          },
          breadcrumbLd([home, guidesHub, { name: g.linkText, url }]),
          faqLd(c.faq),
        ],
      }),
    };
  });

  pages.push({
    path: 'guides/index.html',
    html: documentFor({
      url: guidesHub.url,
      title: 'Flashcard and Spaced Repetition Guides | Ankitti',
      description:
        'Plain-language guides to spaced repetition, the SM-2 algorithm, opening Anki .apkg decks and choosing an Anki alternative.',
      ogType: 'website',
      assetsHead,
      body: renderToStaticMarkup(<GuidesIndex />),
      ld: [
        breadcrumbLd([home, guidesHub]),
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Guides',
          url: guidesHub.url,
          hasPart: GUIDES.map((g) => ({ '@type': 'Article', headline: GUIDE_CONTENT[g.slug].h1, url: `${SITE_URL}${guideUrl(g.slug)}` })),
        },
      ],
    }),
  });

  return pages;
}

export function sitemapXml(): string {
  const latest = GUIDES.map((g) => g.updated).sort().at(-1)!;
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: latest, priority: '1.0' },
    { loc: `${SITE_URL}/guides/`, lastmod: latest, priority: '0.7' },
    ...GUIDES.map((g) => ({ loc: `${SITE_URL}${guideUrl(g.slug)}`, lastmod: g.updated, priority: '0.8' })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`;
}
