const CACHE_NAME = "farmsense-v12";
const ASSETS = [
    "/",
    "/index.html",
    "/style.css",
    "/app.js",
    "/config.js",
    "/manifest.json",
    "/assets/farm-hero.svg",
    "/vendor/gsap.min.js",
    "/vendor/ScrollTrigger.min.js",
    "/icon-192.png",
    "/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
