self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('apimonitor-v2').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/app.js',
                '/image/bee-192.png',
                '/image/bee-512.png',
                '/image/lixeira.png',
                '/image/notificacao.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});