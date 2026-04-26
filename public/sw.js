const CACHE_NAME = "easyedu-v3-euler";
const PRECACHE = ["/dashboard", "/crisis", "/euler/canvas", "/euler-tutor", "/logo-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // 외부 origin (Supabase RPC, OpenAI, Anthropic, Railway 등) 은 SW 가로채지 않음
  if (url.origin !== self.location.origin) return;

  // GET 외 메서드 (POST/PUT 등) 도 캐시 안 함
  if (e.request.method !== "GET") return;

  // API·AI 요청은 캐시하지 않음
  if (url.pathname.startsWith("/api/")) return;

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
