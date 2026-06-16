/* Athena — service worker PWA (écrit à la main, indépendant du bundler).
   - Cache léger de l'app-shell (navigation offline minimale)
   - Web Push (VAPID) : affichage + deep-link au clic
   Volontairement simple ; ne touche PAS au flux audio (range requests). */

const CACHE = "athena-shell-v1";
const SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Ne jamais intercepter : audio (range), API, cross-origin.
  if (
    req.headers.has("range") ||
    /\.(mp3|m4a|aac|ogg|wav)$/i.test(url.pathname) ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Navigations : réseau d'abord, fallback cache (offline).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Assets statiques : cache d'abord.
  if (/\/(_next\/static|icons)\//.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((r) => r || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })),
    );
  }
});

/* ---- Web Push ---- */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Athena", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Athena";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: deepLink(data) },
    tag: data.tag,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});

// Construit l'URL de destination à partir du payload { key, id }.
function deepLink(data) {
  if (data.url) return data.url;
  if (data.key && data.id) return `/content/${data.key}/${data.id}`;
  if (data.key) return `/medias/${data.key}`;
  return "/";
}
