const version = "v1";
const cacheName = "my-cache";

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(version + cacheName).then((cache) => {
			return cache.addAll(["/"]);
		})
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			if (response) {
				return response;
			}
			return fetch(event.request);
		})
	);
});

// Cast event to ExtendableEvent
self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});
