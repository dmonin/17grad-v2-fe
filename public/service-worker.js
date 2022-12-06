const cacheName="v1::17grad";
const cacheUrls=["/offline.html"];
this.addEventListener("install", e => {
  this.skipWaiting();

  e.waitUntil(
    caches.open(cacheName).then(
      e => e.addAll(cacheUrls)
    )
  )
});

this.addEventListener("fetch", e => {
  if (e.request.mode != 'navigate') {
    return;
  }

  const noCors = !!e.request.url.match(/googleapis/);
  const options = noCors ? {
    credentials: 'omit',
    headers: {
      'Access-Control-Request-Method': 'GET'
    }
  } : undefined;
  e.respondWith(caches.match(e.request).then(
    r => r || fetch(e.request, options)
  ).catch(
    e => caches.match("/offline.html")
  ));
});
