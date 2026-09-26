const CACHE = "innersound-shell-v2";
const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3;
const SHELL = ["/", "/library", "/downloads", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache personal user data (likes, playlists, session).
  if (
    url.pathname.startsWith("/api/me") ||
    url.pathname.startsWith("/api/likes") ||
    url.pathname.startsWith("/api/favorites") ||
    url.pathname.startsWith("/api/playlists") ||
    url.pathname.startsWith("/api/history")
  ) {
    return;
  }

  // Catalog APIs: cache for 3 days, refresh in background.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(staleWhileRevalidate(request, THREE_DAYS_MS));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  );
});

async function staleWhileRevalidate(request, maxAgeMs) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const headers = new Headers(response.headers);
        headers.set("x-innersound-cached-at", String(Date.now()));
        const body = response.clone().body;
        cache.put(request, new Response(body, { status: response.status, statusText: response.statusText, headers }));
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    const cachedAt = Number(cached.headers.get("x-innersound-cached-at") || 0);
    if (!cachedAt || Date.now() - cachedAt < maxAgeMs) {
      // Kick off a background refresh but serve the 3-day-fresh copy immediately.
      eventWaitUntil(fetchPromise);
      return cached;
    }
  }

  const fresh = await fetchPromise;
  return fresh || cached || new Response(JSON.stringify({ error: "offline" }), { status: 503 });
}

function eventWaitUntil(promise) {
  // no-op helper — service worker fetch handler already owns the event lifetime
  void promise;
}
