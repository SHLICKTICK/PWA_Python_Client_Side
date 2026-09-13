const CACHE_NAME = 'Micky-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/py-worker.js',
];

// 1. INSTALL: Pre-cache static assets & take over immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force the waiting service worker to become the active service worker
  );
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // purge old cache versions
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of uncontrolled clients immediately
  )
});


// 3. FETCH: Intercept requests safely
self.addEventListener('fetch', (event) => {
  // Only handle GET requests (caches API doesn't support POST, PUT, DELETE)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fall back to network if not in cache
      return fetch(event.request).catch((error) => {
        console.error('Fetch failed; returning offline fallback if available.', error);
        // Optional: Return a dedicated offline HTML page here if navigating
      });
    })
  );
});