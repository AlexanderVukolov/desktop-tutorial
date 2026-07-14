// Минимальный service worker задачника NSL: нужен для установки на телефон.
// Стратегия: сеть в приоритете, кэш — запасной вариант для офлайна.
const CACHE = 'nsl-tasks-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  // Кэшируем только GET-запросы к своим файлам (не API Supabase)
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return
  e.respondWith(
    fetch(request)
      .then((resp) => {
        const copy = resp.clone()
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        return resp
      })
      .catch(() => caches.match(request)),
  )
})
