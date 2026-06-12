/* PathForge service worker — conservative, launch-safe caching.
 *
 * Strategy (deliberately cautious so nothing is ever stale):
 *  - Navigations (HTML): NETWORK-FIRST. Cached copy of the branded /offline
 *    page is the only fallback — users always get fresh pages when online.
 *  - /_next/static/* : CACHE-FIRST. These files are content-hashed by the
 *    build, so a cached copy is immutable by construction.
 *  - Same-origin images/fonts: STALE-WHILE-REVALIDATE with a small cap.
 *  - Everything else (API calls, Supabase, POSTs, auth callback): UNTOUCHED —
 *    passed straight to the network so auth/data can never be cached.
 *
 * Bump VERSION to invalidate all caches on deploy of breaking changes.
 */

const VERSION = "pf-v1";
const OFFLINE_CACHE = `${VERSION}-offline`;
const STATIC_CACHE = `${VERSION}-static`;
const MEDIA_CACHE = `${VERSION}-media`;
const OFFLINE_URL = "/offline";
const MEDIA_LIMIT = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

async function trimCache(name, limit) {
  try {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    if (keys.length > limit) await cache.delete(keys[0]);
  } catch {
    /* non-fatal */
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin (Supabase, analytics)
  if (url.pathname.startsWith("/api/")) return; // never cache API/auth

  // Page navigations: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL, { cacheName: OFFLINE_CACHE });
        return (
          cached ||
          new Response("You are offline.", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          })
        );
      })
    );
    return;
  }

  // Immutable build assets: cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  // Images / fonts / icons: stale-while-revalidate.
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) {
              cache.put(request, res.clone());
              trimCache(MEDIA_CACHE, MEDIA_LIMIT);
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
