// 離線閱讀：打開過一次之後，沒有網路也能讀。
// 有網路時一律先拿最新版（所以更新內容不用等），沒網路才用存起來的那一份。
const CACHE = 'bible-daily-v2';
const CORE = [
  './',
  './index.html',
  './preview.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(CORE.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('bible-daily-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 字型：先用存的，背景再更新
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(CACHE).then(c => c.match(req).then(hit => {
        const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }

  // 其他網站（例如 bible.com 對照版本）不處理
  if (url.origin !== self.location.origin) return;

  // 本站：先上網拿最新的，拿不到才用存的
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() =>
      caches.match(req, {ignoreSearch: true}).then(hit => {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html').then(p => p || caches.match('./'));
        return Response.error();
      })
    )
  );
});
