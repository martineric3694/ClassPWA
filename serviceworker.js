const STATIC_CACHE = 'MyCache-v1-static';
const DYNAMIC_CACHE = 'MyCache-v1-dynamic';
const API_URL = "https://dummyjson.com/carts";
const ASSET = [
    '/',
    '/css/style.css'
]

// Pre Cache
self.addEventListener('install',event=>{
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache=>{
            return cache.addAll(ASSET);
        })
    );
});

// Update Cache
self.addEventListener('activate',event=>{
    event.waitUntil(caches.keys().then(cacheNames=>{
        if(cacheNames==STATIC_CACHE && cacheNames==DYNAMIC_CACHE){
            console.log('Clear Cache ',cacheNames);
            return caches.delete(cacheNames);
        };
    }));
});

// // Cache First - ONLINE MODE (Basic)
// self.addEventListener('fetch',event=>{
//     event.respondWith(
//         caches.match(event.request).then(response=>{
//             return response || fetch(event.request);
//         })
//     )
// });

// Cache First
const cacheFirst = async (request) => {
    const cacheResponse = await caches.match(request);
    console.log('Cache First:',cacheResponse)
    return cacheResponse || fetch(request);
};

// Network First
const networkFirst = async (request) => {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        console.log('Network First Cache:',networkResponse)
        return networkResponse;
    } catch {
        return await caches.match(request);
    }
};

const staleWhileRevalidate = async (request) => {
    console.log('Stale While Revalidate:',request)
    const cachedResponse = await caches.match(request);
    const fetchPromise = fetch(request).then((networkResponse) => {
        caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
        });
        return networkResponse;
    });
    return cachedResponse || fetchPromise;
};

// Fetch Event - Apply Strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.origin === location.origin) {
        // Apply Cache First for Static Files
        if (ASSET.includes(url.pathname)) {
            event.respondWith(cacheFirst(request));
        }
    } else {
        // Apply Network First for API calls
        if (url.href.includes(API_URL)) {
            
            event.respondWith(networkFirst(request));
        } 
        // Apply Stale While Revalidate for Images
        if (request.url.includes('placeholder.com')) {
            console.log('Stale While');
            event.respondWith(staleWhileRevalidate(request));
        }else{
            event.respondWith(fetch(request));
        }

    }
});