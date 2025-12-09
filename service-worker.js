// My Safety - Service Worker
const CACHE_NAME = 'my-safety-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/auth.html',
    '/dashboard.html',
    '/dashboard-mobile.html',
    '/css/dashboard.css',
    '/css/mobile-dashboard.css',
    '/css/emergency-calls.css',
    '/css/permissions.css',
    '/js/emergency-calls.js',
    '/js/permissions.js',
    '/firebase-config.js'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, responseClone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
