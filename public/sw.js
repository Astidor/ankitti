// Ankitti 🎀 Service Worker — Full Offline Support & Mobile PWA Cache
const CACHE_NAME = 'ankitti-pwa-v2';

// Essential App Shell assets to precache on installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/apple-touch-icon.png',
  '/sql-wasm.wasm'
];

// Install Event: precache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precache each asset safely so a missing asset doesn't abort the entire install
      for (const url of PRECACHE_ASSETS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn(`[SW] Precache skipped for ${url}:`, err);
        }
      }
    })
  );
});

// Activate Event: clean up obsolete caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] Purging outdated cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: intercept network requests and serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests (e.g. POST, PUT, DELETE to API)
  if (request.method !== 'GET') {
    return;
  }

  // 2. Navigation requests (HTML pages) -> Network-first with offline fallback to /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online and response is good, update the cache with latest index.html
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Device is offline or network timed out — serve cached index.html
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html') || await cache.match('/');
          if (cachedIndex) return cachedIndex;

          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head><meta charset="utf-8"/><title>Ankitti 🎀 Offline</title></head>
            <body style="font-family:sans-serif;text-align:center;padding:50px;background:#fff8fa;color:#333;">
              <h1 style="color:#ff3366;">Ankitti 🎀</h1>
              <p>You are currently offline. Please open the app again when reconnected to save initial offline assets.</p>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 3. Cloudflare D1 API Requests -> Network-first, fallback to offline error payload
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(async () => {
        // Return structured offline JSON response
        return new Response(
          JSON.stringify({ offline: true, error: 'Network unavailable. Using local offline storage.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // 4. Static assets (JS, CSS, images, wasm, fonts) -> Cache-First with background revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh version in background if online (stale-while-revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {
            // Silently ignore background refresh errors when offline
          });

        return cachedResponse;
      }

      // Not in cache yet, fetch from network and cache for next time
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// Listen for message events (e.g. skipWaiting trigger from UI)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
