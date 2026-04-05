/* 
  Self-Cleaning Service Worker
  This file resolves 404 errors for sw.js and unregisters any lingering service workers
  from previous projects running on the same localhost port.
*/

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister()
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach(client => client.navigate(client.url));
      })
  );
});

// Clear all caches for the domain
caches.keys().then((names) => {
  for (let name of names) caches.delete(name);
});
