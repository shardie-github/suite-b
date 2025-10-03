self.addEventListener('install',e=>{
  e.waitUntil(caches.open('suiteb-v1').then(c=>c.addAll(['/','/reports.html','/admin','/admin.html','/manifest.webmanifest'])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).catch(()=> new Response('Offline',{status:200})) ));
});
