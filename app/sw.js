// Shop Uz Feruzaxon — Service Worker (PWA offline shell + fast reload)
const CACHE = "suf-v1";
const SHELL = [
  "/",
  "/index.html",
  "/catalog.html",
  "/product.html",
  "/cart.html",
  "/auth.html",
  "/profile.html",
  "/admin.html",
  "/chegirma.html",
  "/info/about.html",
  "/info/delivery.html",
  "/info/contact.html",
  "/info/sizes.html",
  "/css/style.css",
  "/js/app.js",
  "/manifest.webmanifest",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // API: hech qachon cache emas, doim tarmoq
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // HTML sahifalar: network-first (yangi versiya darhol ko'rinsin), fallback cache
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("/index.html")).then((r) => r || new Response("Offline", { status: 503 }))
        )
    );
    return;
  }

  // Statik resurslar: cache-first
  event.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res && res.ok && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
        }
        return res;
      })
    )
  );
});

// Kill-switch: agar admin app'ga `postMessage({type:'unregister'})` yuborsa —
// cache tozalanadi va SW o'chadi.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "unregister") {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    self.registration.unregister();
  }
});
