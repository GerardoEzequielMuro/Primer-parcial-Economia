// Service Worker - Economía I Parcial 1
// Permite usar toda la pagina sin internet despues de la primera visita.

const CACHE = 'economia-i-v2';

// Rutas relativas al scope del SW (la raiz del sitio)
const ASSETS = [
  './',
  './index.html',
  './parciales.html',
  './mapa-mental.html',
  './formulas.html',

  // Imagenes U1 (embedded graphics del PPTX)
  './img/u1/image45.png',
  './img/u1/image46.png',
  './img/u1/image47.png',
  './img/u1/image54.png',
  './img/u1/image78.png',
  './img/u1/image79.png',
  './img/u1/image80.png',
  './img/u1/image81.png',
  './img/u1/image82.png',
  './img/u1/image83.png',

  // Imagenes U2 (embedded graphics del apunte)
  './img/u2/p04_3.jpeg',
  './img/u2/p05_2.png',
  './img/u2/p06_2.jpeg',
  './img/u2/p07_2.jpeg',
  './img/u2/p12_2.jpeg',
  './img/u2/p13_2.jpeg',
  './img/u2/p14_3.jpeg',
  './img/u2/p15_2.jpeg',
  './img/u2/p17_2.jpeg',
  './img/u2/p20_5.jpeg',
  './img/u2/p21_3.jpeg',
  './img/u2/p23_3.jpeg',

  // Video
  './video/economia-ciencia-eleccion.mp4',

  // Manifest e icono
  './manifest.webmanifest',
  './icon.svg',
];

// CDN externos que necesita el mapa mental
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/markmap-autoloader@0.18',
  'https://cdn.jsdelivr.net/npm/d3@7',
  'https://cdn.jsdelivr.net/npm/markmap-view',
  'https://cdn.jsdelivr.net/npm/markmap-lib',
];

// Install: pre-cache assets locales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      // Cachear locales primero (criticos para que la pagina cargue)
      return cache.addAll(ASSETS).then(() => {
        // Cachear CDN best-effort (si fallan, la pagina sigue funcionando)
        return Promise.allSettled(
          CDN_ASSETS.map((url) => cache.add(url).catch(() => null))
        );
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fallback a red, y si no hay nada devolver la home
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo GET
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((resp) => {
        // Solo cachear respuestas validas
        if (!resp || resp.status !== 200) return resp;

        // Clonar porque la respuesta se consume una sola vez
        const clone = resp.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(req, clone).catch(() => null);
        });
        return resp;
      }).catch(() => {
        // Sin internet y sin cache: devolver la home como fallback
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
