const CACHE_NAME = 'sales-app-v3';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', event => {
  // 即座に有効化（skipWaiting）
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 古いキャッシュを自動削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // POSTリクエストはキャッシュしない
  if (event.request.method !== 'GET') return;

  // ネットワーク優先（最新を取得、失敗時のみキャッシュ）
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // 成功したらキャッシュも更新
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
