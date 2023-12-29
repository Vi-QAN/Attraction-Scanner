// Base Service Worker implementation.  To use your own Service Worker, set the PWA_SERVICE_WORKER_PATH variable in settings.py
import { registerRoute, Route } from 'workbox-routing';
import { precacheAndRoute } from "workbox-precaching";
import {CacheFirst, NetworkFirst} from 'workbox-strategies';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';
import {Queue} from 'workbox-background-sync';



precacheAndRoute(self.__WB_MANIFEST);

const queue = new Queue('offline_queue')

// A new route that matches same-origin image requests and handles
// them with the cache-first, falling back to network strategy:
const imageRoute = new Route(({ request, sameOrigin }) => {
  return sameOrigin && request.destination === 'image'
}, new CacheFirst({
    cacheName: 'images'
}));

// Handle scripts:
const scriptsRoute = new Route(({ request }) => {
  return request.destination === 'script';
}, new CacheFirst({
  cacheName: 'scripts'
}));

// Handle styles:
const stylesRoute = new Route(({ request }) => {
  return request.destination === 'style';
}, new CacheFirst({
  cacheName: 'styles'
}));

// Register routes
registerRoute(imageRoute);
registerRoute(scriptsRoute);
registerRoute(stylesRoute);
registerRoute(
    ({request, sameOrigin}) => {
        return sameOrigin && /\/user\/\d+/.test(request.url)
    },
    new NetworkFirst({
      cacheName: 'cache-main',
      plugins: [
          new CacheableResponsePlugin({
            statuses: [200]
          })
      ]
    })
)

registerRoute(
    ({request, sameOrigin}) => {
        return sameOrigin && request.url.includes('/user/attractions')
    },
    new NetworkFirst({
        cacheName: 'attractions-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200]
            }),
            {
                cacheKeyWillBeUsed: async ({request, mode, params, event, state}) => {
                    // `request` is the `Request` object that would otherwise be used as the cache key.
                    // `mode` is either 'read' or 'write'.
                    // Return either a string, or a `Request` whose `url` property will be used as the cache key.
                    // Returning the original `request` will make this a no-op.
                    return '/user/attractions';
                },
            }
        ]
    })
)

registerRoute(
    ({request, sameOrigin}) => {
        return sameOrigin && request.url.includes('countryPolygon')
    },
    new CacheFirst({
        cacheName: 'country_polygon'
    })
)

self.addEventListener('fetch', event => {
  // Add in your own criteria here to return early if this
  // isn't a request that should use background sync.
  if (event.request.method === 'GET') {
    return;
  }

  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (error) {
        console.log(error)
        await queue.pushRequest({request: event.request});
      return error;
    }
  };

  event.respondWith(bgSyncLogic());
});

// Listen for push events
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
  };

  event.waitUntil(
    self.registration.showNotification('Attraction Scanner', options)
  );
});

