/* Isla de Walesa v48 · Caché compatible con GitHub Pages */
const CACHE = 'walesa-v48-city-github-pages';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg', './picnic_v31.js', './walesa_v32.js', './native_joystick40.js', './native46/core.js', './native46/worlds.js', './native46/games.js', './native46/pets.js', './native46/arcade.js', './native46/pizza.js', './native46/kitchen.js', './native46/models3d.js', './native46/transport.js', './native46/polish.js', './native46/neighbors.js', './native46/mainworld.js', './native46/mainworld_play.js'];
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