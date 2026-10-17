const CACHE_NAME = 'float-v2';
const APP_SHELL = ['/', '/icon.svg'];
const STATIC_ASSET = /\.(?:svg|png|jpe?g|webp|avif|gif|ico|woff2?|ttf|css|js)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Personal data lives behind these paths: never cache them, never intercept them.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/app') || url.pathname.startsWith('/sign-in')) {
    return;
  }

  // Cache-first for build assets and static files.
  if (url.pathname.startsWith('/_next/static/') || STATIC_ASSET.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Network-first with offline fallback, landing page only.
  if (url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((response) => response || caches.match('/')))
    );
  }
});
