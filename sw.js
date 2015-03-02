importScripts('js/serviceworker-cache-polyfill.js');

var CACHE_NAME = 'my-site-cache-v1';

var urlsToCache = [
  'index.html',
	'favicon.png',
	'apple-touch-icon.png',
  'css/impress-demo.css',
  'js/impress.js'

	'css/activate.png',
	'css/browsers.png',
	'css/cache.png',
	'css/chart.png',
	'css/composer.png',
	'css/fetch.png',
	'css/install.png',
	'css/mwjs.png',
	'css/programmer.jpg',
	'css/promises.png',
	'css/register.png',
	'css/star-map.png'
];

self.addEventListener('install', function(event) {
	// Pre-fetch all resources and make available offline
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(function(cache) {
			return cache.addAll(urlsToCache);
		})
	);
})

self.addEventListener('activate', function(event) {
	// Clear out any old caches that are no longer active
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			cacheNames.map(function(cacheName) {
				if(CACHE_NAME !== cacheName) {
					return caches.delete(cacheName);
				}
			});
		})
	)
});


self.addEventListener('fetch', function(event) {
	// Intercept all fetch requests from the parent page
	event.respondWith(
		caches.match(event.request)
		.then(function(response) {
			// Immediately respond if request exists in the cache
			if (response) {
				return response;
			}

			// IMPORTANT: Clone the request. A request is a stream and
			// can only be consumed once. Since we are consuming this
			// once by cache and once by the browser for fetch, we need
			// to clone the response
			var fetchRequest = event.request.clone();

			// Make the external resource request
			return fetch(fetchRequest).then(
				function(response) {
					// If we do not have a valid response, immediately return the error response
					// so that we do not put the bad response into cache
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}

					// IMPORTANT: Clone the response. A response is a stream
					// and because we want the browser to consume the response
					// as well as the cache consuming the response, we need
					// to clone it so we have 2 stream.
					var responseToCache = response.clone();

					// Place the request response within the cache
					caches.open(CACHE_NAME)
						.then(function(cache) {
							cache.put(event.request, responseToCache);
						});

					return response;
				}
			);
		})
	);
});
