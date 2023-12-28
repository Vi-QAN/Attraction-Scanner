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
// registerRoute(
//     // check for post, same origin, path
//     // add to background sync queue first
//     //
// )

// Register the new route
// var staticCacheName = "django-pwa-v" + 1;
// var filesToCache = [
//     '/',
//     '/manifest.json'
// ];
//
// var requests = [];
//
// Cache on install
// self.addEventListener("install", event => {
//     console.log("installing")
//     event.waitUntil(
//         caches.open(staticCacheName)
//             .then(cache => {
//                 return cache.addAll(filesToCache);
//             })
//             .catch(err => console.error('install', err))
//     )
// });
//
// Clear cache on activate
// self.addEventListener('activate', event => {
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return Promise.all(
//                 cacheNames
//                     .filter(cacheName => (cacheName.startsWith("django-pwa-")))
//                     .filter(cacheName => (cacheName !== staticCacheName))
//                     .map(cacheName => caches.delete(cacheName))
//             );
//         })
//     )
// });
//
// // Serve from Cache
// self.addEventListener("fetch", event => {
//     if (event.request.method === "GET") {
//         if (event.request.destination === "image"){
//             return;
//         }
//         else {
//             // Open the cache
//             event.respondWith(caches.open(staticCacheName).then((cache) => {
//                 // Go to the network first
//                 return fetch(event.request.url).then((fetchedResponse) => {
//                     cache.put(event.request, fetchedResponse.clone());
//
//                     return fetchedResponse;
//                 }).catch(() => {
//                     // If the network is unavailable, get
//                     return cache.match(event.request.url);
//                 });
//             }));
//         }
//
//     }
//     else {
//         requests.push(event.request);
//
//         event.respondWith(caches.open(staticCacheName).then((cache) => {
//             return fetch(event.request.url).catch(() => {
//                 cache.match('/user?')
//             })
//         }))
//         console.log(requests)
//     }
// });
//
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'sync-deletes') {
//     event.waitUntil(syncDeletes());
//   }
//
//   if (event.tag === 'sync-posts'){
//       event.waitUntil(syncPosts());
//   }
// });
//
// function syncPosts(){
//     const postRequests = requests.filter(r => r.method === 'POST')
//
//     return Promise.all(postRequests.map(r => {
//         return new Promise(((resolve,reject) => {
//             fetch(r).then((response) => {
//             if (response.ok) {
//                 // Deletion was successful
//                 resolve();
//             } else {
//                 // Handle error, e.g., by rejecting the promise
//                 reject(new Error(`Post failed for ${r.url}`));
//             }
//             })
//             .catch((error) => {
//                 // Handle network or other errors
//                 reject(error);
//             });
//         }));
//     }))
// }
//
// function syncDeletes(){
//     const delRequests = requests.filter(r => r.method === 'DELETE')
//
//     return Promise.all(delRequests.map(r => {
//         return new Promise(((resolve,reject) => {
//             fetch(r).then((response) => {
//             if (response.ok) {
//                 // Deletion was successful
//                 resolve();
//             } else {
//                 // Handle error, e.g., by rejecting the promise
//                 reject(new Error(`Deletion failed for ${r.url}`));
//             }
//             })
//             .catch((error) => {
//                 // Handle network or other errors
//                 reject(error);
//             });
//         }));
//     }))
// }

