const CACHE='mofumori-shell-v7.3.4';
const SHELL=[
  '/','/index.html',
  '/style.css?v=7.3.4','/pet-system.css?v=7.3.4','/v52-ui.css?v=7.3.4','/v6-ui.css?v=7.3.4','/v7-ui.css?v=7.3.4','/daily-events.css?v=7.3.4',
  '/social.js?v=7.3.4','/main.js?v=7.3.4','/push-client.js?v=7.3.4','/pet-system.js?v=7.3.4','/v52-ui.js?v=7.3.4','/v6-ui.js?v=7.3.4','/v7-ui.js?v=7.3.4','/daily-events.js?v=7.3.4',
  '/manifest.webmanifest?v=7.3.4','/icon.svg','/vendor/wllama.js','/wasm/wllama.wasm'
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


function pushB64ToBytes(value){
  const pad='='.repeat((4-value.length%4)%4);
  const raw=atob((value+pad).replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from(raw,ch=>ch.charCodeAt(0));
}

self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?.json?.()||{}}catch{try{data={body:event.data?.text?.()||''}}catch{}}
  const title=data.title||'Mofumori';
  const options={
    body:data.body||'森で変化がありました。',
    icon:data.icon||'/icon.svg',
    badge:data.badge||'/icon.svg',
    tag:data.tag||'mofumori',
    renotify:false,
    data:{url:data.url||'/',...(data.data||{})}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification?.data?.url||'/',self.location.origin).href;
  event.waitUntil((async()=>{
    const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clientsList){
      if(new URL(client.url).origin===self.location.origin){
        try{await client.navigate(target)}catch{}
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});

self.addEventListener('pushsubscriptionchange',event=>{
  event.waitUntil((async()=>{
    try{
      const cfgRes=await fetch('/api/push',{credentials:'include',cache:'no-store'});
      if(!cfgRes.ok)return;
      const cfg=await cfgRes.json();
      if(!cfg.publicKey)return;
      const sub=await self.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushB64ToBytes(cfg.publicKey)});
      await fetch('/api/push',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',subscription:sub.toJSON()})});
    }catch{}
  })());
});
