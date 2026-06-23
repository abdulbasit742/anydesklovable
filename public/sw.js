/// RemoteDesk Service Worker — Minimal PWA Install Readiness
const CACHE_NAME = 'remotedesk-v1';
const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy for all requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
