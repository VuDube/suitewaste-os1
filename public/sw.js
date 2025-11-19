/**
 * SuiteWaste OS - minimal service worker
 * - Pre-caches core assets
 * - Network-first fetch strategy with cache fallback
 * - skipWaiting + clients.claim for immediate activation
 *
 * Note: Keep this file small and simple to avoid large SW payloads.
 */
const CACHE_NAME = 'suitewaste-os-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.webmanifest'
];
self.addEventListener('install', (event) => {
  // Pre-cache key resources
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      // Activate this SW immediately on install
      return self.skipWaiting();
    })
  );
});
self.addEventListener('activate', (event) => {
  // Clean up old caches if any and take control of clients
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});
/**
 * Network-first strategy with cache fallback.
 * - For GET requests: try network, put in cache, fallback to cache when offline.
 * - For navigation requests (SPA routing): fallback to cached /index.html
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  event.respondWith((async () => {
    try {
      // Try network first
      const networkResponse = await fetch(request);
      // Clone and store in cache for offline use (non opaque and successful)
      // Note: cloning even if opaque; it's fine for basic caching.
      const cache = await caches.open(CACHE_NAME);
      try {
        cache.put(request, networkResponse.clone());
      } catch (err) {
        // Some requests (e.g., cross-origin opaque responses) may fail to be cached
        // Swallow caching errors silently to avoid breaking the fetch.
        console.warn('Failed to cache request:', request.url, err);
      }
      return networkResponse;
    } catch (err) {
      // Network failed — try the cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      // If it's a navigation request (SPA route), return the cached index.html
      const acceptHeader = request.headers.get('accept') || '';
      if (request.mode === 'navigate' || acceptHeader.includes('text/html')) {
        const cachedIndex = await caches.match('/index.html') || await caches.match('/');
        if (cachedIndex) {
          return cachedIndex;
        }
      }
      // Final fallback: return a minimal offline response
      return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  })());
});
// Optional: Allow pages to message the SW to skip waiting (useful during updates)
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});