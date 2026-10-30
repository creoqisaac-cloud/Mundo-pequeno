/* Isla de Walesa v51 · Caché compatible con GitHub Pages */
const CACHE = 'walesa-v61-metro-red-20261030';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg', './picnic_v31.js', './walesa_v32.js', './native_joystick40.js', './walesa_mainland_v3.js', './topografia_walesa_v2.js', './overworld60.js', './metro61.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('walesa-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(resp => {
      if (!resp.ok) throw Error('network');
      const copy = resp.clone();
      caches.open(CACHE).then(cache => cache.put('./index.html', copy));
      return resp;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp => {
      if (resp.ok) { const copy = resp.clone(); caches.open(CACHE).then(cache => cache.put(req, copy)); }
      return resp;
    })));
  }
});
