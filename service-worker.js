const CACHE_NAME = "number-collector-v1";
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./css/style.css",
    "./script/main.js",
    "./add-ons/HP_logo.png"
];

// Install Event - Caching Static Files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching files...");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Activate Event - Cleanup Old Caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Fetch Event - Serve Cached Files
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
