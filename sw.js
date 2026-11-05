// Guarda a página no iPad para ela abrir mesmo sem internet.
var CACHE = 'cabeceira-v1';
var ARQUIVOS = ['./', './index.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== CACHE; })
      .map(function (n) { return caches.delete(n); }));
  }));
});

// Páginas do próprio site: tenta a internet primeiro (para pegar atualizações)
// e, se estiver sem conexão, usa a cópia guardada.
// Clima e trânsito (outros sites) não passam por aqui.
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin || e.request.method !== 'GET') { return; }
  e.respondWith(
    fetch(e.request).then(function (resp) {
      var copia = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
