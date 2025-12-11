
const CACHE_NAME = 'fluent-deck-cache-v1';
const CACHEABLE_HOSTS = [
  self.location.origin,
  'https://fonts.gstatic.com',
  'https://fonts.googleapis.com',
];

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Don't cache non-GET requests (e.g., POST to Supabase)
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // For other requests, try to find a match in the cache.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((response) => {
        // Return cached response if found, otherwise fetch from network.
        const fetchPromise = fetch(request).then((networkResponse) => {
          // If the fetch is successful, cache the response for future use.
          if (networkResponse && networkResponse.status === 200) {
            if (CACHEABLE_HOSTS.some(host => request.url.startsWith(host))) {
              cache.put(request, networkResponse.clone());
            }
          }
          return networkResponse;
        }).catch(err => {
          throw err;
        });

        return response || fetchPromise;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});
