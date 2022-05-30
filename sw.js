const cacheName = 'notes-v1';

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all');
      await cache.addAll(['/']);
    })()
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keyList) =>
        Promise.all(
          keyList.map((key) =>
            key === cacheName ? Promise.resolve() : caches.delete(key)
          )
        )
      )
  );
});

const fetchAndCache = async (req) => {
  const response = await fetch(req);
  const cache = await caches.open(cacheName);
  await cache.put(req, response.clone());
  return response;
};

self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      if (r) {
        // Fetch and cache in the background
        e.waitUntil(fetchAndCache(e.request));
        // Return cached request
        return r;
      }
      return fetchAndCache(e.request);
    })()
  );
});
