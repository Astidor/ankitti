// Runs after `vite build` and `vite build --ssr src/prerender.tsx --outDir dist-ssr`.
// Writes the landing page markup into dist/index.html, the guides as static pages, and the sitemap.

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

// The storage module reads localStorage when it loads; give it an empty one.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  key: (i) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
};

const entry = (await fs.readdir(ssrDir)).find((f) => /^prerender\.(m?js)$/.test(f));
if (!entry) throw new Error('prerender: no SSR bundle found in dist-ssr');
const mod = await import(pathToFileURL(path.join(ssrDir, entry)).href);

const indexPath = path.join(dist, 'index.html');
let index = await fs.readFile(indexPath, 'utf8');
if (!index.includes('<div id="root"></div>')) throw new Error('prerender: empty #root not found in dist/index.html');
index = index
  .replace('<div id="root"></div>', `<div id="root">${mod.landingMarkup()}</div>`)
  .replace('</head>', `${mod.landingHeadExtras()}\n  </head>`);
await fs.writeFile(indexPath, index);

const cssLinks = [...index.matchAll(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+\.css"[^>]*>/g)].map((m) => m[0]);
if (cssLinks.length === 0) throw new Error('prerender: no built stylesheet found in dist/index.html');

const pages = mod.staticPages(cssLinks.join('\n'));
for (const page of pages) {
  const file = path.join(dist, page.path);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, page.html);
}

await fs.writeFile(path.join(dist, 'sitemap.xml'), mod.sitemapXml());
await fs.rm(ssrDir, { recursive: true, force: true });

console.log(`prerender: index.html + ${pages.length} static pages + sitemap.xml`);
