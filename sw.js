const CACHE='mofumori-shell-v7.3.1';
const SHELL=[
  '/','/index.html',
  '/style.css?v=7.3.1','/pet-system.css?v=7.3.1','/v52-ui.css?v=7.3.1','/v6-ui.css?v=7.3.1','/v7-ui.css?v=7.3.1','/daily-events.css?v=7.3.1',
  '/social.js?v=7.3.1','/main.js?v=7.3.1','/pet-system.js?v=7.3.1','/v52-ui.js?v=7.3.1','/v6-ui.js?v=7.3.1','/v7-ui.js?v=7.3.1','/daily-events.js?v=7.3.1',
  '/manifest.webmanifest?v=7.3.1','/icon.svg','/vendor/wllama.js','/wasm/wllama.wasm'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response&&response.ok)await cache.put(request,response.clone());
    return response;
  }catch(error){
    const cached=await cache.match(request,{ignoreSearch:false});
    if(cached)return cached;
    if(request.mode==='navigate')return cache.match('/index.html');
    throw error;
  }
}

self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/'))return;
  event.respondWith(networkFirst(request));
});
