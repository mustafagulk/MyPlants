// ── Plant Nutrient Guide — Service Worker ─────────────────────────────────────
// Strategy: Cache-first for app shell, network-first for external CDN assets.
// Bump CACHE_NAME when you deploy a new version so old caches are cleared.

const CACHE_NAME = 'png-v1';

const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
];

// ── Install: pre-cache app shell ───────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for same-origin, network-first for CDN ─────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http(s) requests (e.g. chrome-extension://)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Network-first for external CDN (Tabler icons, etc.)
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache a copy of the CDN response for offline fallback
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for app shell assets
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      });
    })
  );
});
