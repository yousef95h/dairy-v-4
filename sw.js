// يحفظ الدفتر كامل داخل الجوال عشان يفتح بدون نت
const V = 'mothakkerati-v4';
const CORE = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap';

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    try {
      const r = await fetch(FONT_CSS);
      const css = await r.clone().text();
      await c.put(FONT_CSS, r);
      const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]);
      await Promise.all(urls.map(u => fetch(u, { mode: 'cors' }).then(x => c.put(u, x)).catch(() => {})));
    } catch (err) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(e.request);
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(V).then(c => c.put(e.request, copy));
      }
      return res;
    } catch (err) {
      if (e.request.mode === 'navigate') return caches.match('index.html');
      throw err;
    }
  })());
});
