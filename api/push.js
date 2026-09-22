const crypto=require('node:crypto');
const {allowMethods,json,requireUser,requireSameOrigin}=require('../server/auth.cjs');
const {configured,getSupabase}=require('../server/supabase.cjs');
const petsApi=require('./pets.js');

const VAPID_PUBLIC_KEY='BEQCJhhLzgSN7HlWdBWxcyw9ieVIUBdnQEXbRL-8nronrdy9aIWw_iSGzTv8_HdM4FbGZeQs8L7OwJ6sXXs9-cQ';
const PUSH_CRON_SHA256='9d4617a8e62e53966658be9fab842be8ae33eba9965f9605c9a16bf43a3a786b';
const PUSH_SUBJECT='https://buntyousodateri.vercel.app';
let cachedPrivateKey=null,cachedPrivateKeyAt=0;

const b64u=b=>Buffer.from(b).toString('base64url');
const fromB64u=s=>Buffer.from(String(s||''),'base64url');
const hmac=(key,data)=>crypto.createHmac('sha256',key).update(data).digest();

function safeHexEqual(a,b){
  try{
    const aa=Buffer.from(String(a),'hex'),bb=Buffer.from(String(b),'hex');
    return aa.length===bb.length&&aa.length>0&&crypto.timingSafeEqual(aa,bb);
  }catch{return false}
}
function cronAuthorized(req){
  const token=String(req.headers['x-mofumori-push-cron']||'');
  const hash=crypto.createHash('sha256').update(token).digest('hex');
  return safeHexEqual(hash,PUSH_CRON_SHA256);
}
async function vapidPrivate(sb){
  if(cachedPrivateKey&&Date.now()-cachedPrivateKeyAt<5*60*1000)return cachedPrivateKey;
  const {data,error}=await sb.rpc('mofumori_push_secret',{p_name:'mofumori_push_vapid_private'});
  if(error||!data)throw new Error('push_vapid_secret_missing');
  cachedPrivateKey=String(data);cachedPrivateKeyAt=Date.now();return cachedPrivateKey;
}
function vapidKeyObject(privateB64){
  const raw=fromB64u(VAPID_PUBLIC_KEY);
  if(raw.length!==65||raw[0]!==4)throw new Error('invalid_vapid_public');
  return crypto.createPrivateKey({key:{
    kty:'EC',crv:'P-256',
    x:b64u(raw.subarray(1,33)),
    y:b64u(raw.subarray(33,65)),
    d:String(privateB64)
  },format:'jwk'});
}
function makeVapidJwt(endpoint,privateB64){
  const aud=new URL(endpoint).origin;
  const head=b64u(Buffer.from(JSON.stringify({typ:'JWT',alg:'ES256'})));
  const body=b64u(Buffer.from(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+12*3600,sub:PUSH_SUBJECT})));
  const input=head+'.'+body;
  const sig=crypto.sign('sha256',Buffer.from(input),{key:vapidKeyObject(privateB64),dsaEncoding:'ieee-p1363'});
  return input+'.'+b64u(sig);
}
function encryptPushPayload(payload,p256dh,auth){
  const uaPublic=fromB64u(p256dh),authSecret=fromB64u(auth);
  if(uaPublic.length!==65||uaPublic[0]!==4||authSecret.length<16)throw new Error('invalid_push_keys');

  const sender=crypto.createECDH('prime256v1');
  const asPublic=sender.generateKeys();
  const ecdhSecret=sender.computeSecret(uaPublic);
  const prkKey=hmac(authSecret,ecdhSecret);
  const keyInfo=Buffer.concat([Buffer.from('WebPush: info'),Buffer.from([0]),uaPublic,asPublic]);
  const ikm=hmac(prkKey,Buffer.concat([keyInfo,Buffer.from([1])]));

  const salt=crypto.randomBytes(16);
  const prk=hmac(salt,ikm);
  const cekInfo=Buffer.concat([Buffer.from('Content-Encoding: aes128gcm'),Buffer.from([0,1])]);
  const nonceInfo=Buffer.concat([Buffer.from('Content-Encoding: nonce'),Buffer.from([0,1])]);
  const cek=hmac(prk,cekInfo).subarray(0,16);
  const nonce=hmac(prk,nonceInfo).subarray(0,12);

  const raw=Buffer.from(JSON.stringify(payload));
  if(raw.length>3500)throw new Error('push_payload_too_large');
  const plain=Buffer.concat([raw,Buffer.from([2])]);
  const cipher=crypto.createCipheriv('aes-128-gcm',cek,nonce);
  const encrypted=Buffer.concat([cipher.update(plain),cipher.final(),cipher.getAuthTag()]);

  const header=Buffer.alloc(21);
  salt.copy(header,0);
  header.writeUInt32BE(4096,16);
  header[20]=asPublic.length;
  return Buffer.concat([header,asPublic,encrypted]);
}
async function sendWebPush(sub,payload,privateB64){
  const body=encryptPushPayload(payload,sub.p256dh,sub.auth);
  const token=makeVapidJwt(sub.endpoint,privateB64);
  const r=await fetch(sub.endpoint,{
    method:'POST',
    headers:{
      'TTL':'86400',
      'Content-Encoding':'aes128gcm',
      'Content-Type':'application/octet-stream',
      'Authorization':`vapid t=${token}, k=${VAPID_PUBLIC_KEY}`,
      'Urgency':'normal'
    },
    body
  });
  if(!r.ok){
    const e=new Error('push_service_'+r.status);e.statusCode=r.status;throw e;
  }
  return r.status;
}
function validSubscription(raw){
  const endpoint=String(raw?.endpoint||'');
  const p256dh=String(raw?.keys?.p256dh||raw?.p256dh||'');
  const auth=String(raw?.keys?.auth||raw?.auth||'');
  if(!/^https:\/\//.test(endpoint)||endpoint.length>2500)throw Object.assign(new Error('通知購読情報が不正です。'),{status:400});
  if(!/^[A-Za-z0-9_-]{40,200}$/.test(p256dh)||!/^[A-Za-z0-9_-]{16,80}$/.test(auth))throw Object.assign(new Error('通知暗号鍵が不正です。'),{status:400});
  return{endpoint,p256dh,auth};
}
function pref(sub,key){return sub?.preferences?.[key]!==false}
function lifePush(e){
  if(e.event_type==='egg_laid')return{eventKey:'life:'+e.id,type:'lifecycle',title:'🥚 卵が生まれた！',body:'交配が完了して、新しい卵が生まれました。',tag:'life-'+e.pet_id,url:'/?push=life&pet='+encodeURIComponent(e.pet_id)};
  if(e.event_type==='hatched')return{eventKey:'life:'+e.id,type:'lifecycle',title:'🐣 雛が生まれた！',body:'卵が孵化しました。新しい雛に会いに行こう！',tag:'life-'+e.pet_id,url:'/?push=life&pet='+encodeURIComponent(e.pet_id)};
  if(e.event_type==='adult')return{eventKey:'life:'+e.id,type:'lifecycle',title:'🐦 成鳥になった！',body:'育てていた雛が立派な成鳥になりました。',tag:'life-'+e.pet_id,url:'/?push=life&pet='+encodeURIComponent(e.pet_id)};
  return null;
}
async function userEvents(sb,userKey){
  const now=new Date(),recent7=new Date(now.getTime()-7*86400000).toISOString(),recent2=new Date(now.getTime()-2*86400000).toISOString();
  try{await petsApi._internal?.resolveBreedingAndLifecycle?.(sb,{id:userKey})}catch(e){console.warn('[push] lifecycle resolve skipped',e?.message||e)}
  const [{data:life},{data:visits},{data:reqs},{data:challenges},{data:gifts}]=await Promise.all([
    sb.from('mofumori_lifecycle_events').select('id,pet_id,event_type,created_at').eq('owner_key',userKey).is('seen_at',null).gte('created_at',recent7).order('created_at',{ascending:true}).limit(30),
    sb.from('mofumori_visits').select('id,host_key,visitor_key,expires_at,ended_at,started_at').or(`host_key.eq.${userKey},visitor_key.eq.${userKey}`).gte('started_at',recent2).order('started_at',{ascending:false}).limit(40),
    sb.from('mofumori_friend_requests').select('id,sender_key,created_at').eq('recipient_key',userKey).eq('status','pending').gte('created_at',recent2).limit(30),
    sb.from('mofumori_arena_challenges').select('id,sender_key,game_type,created_at').eq('recipient_key',userKey).eq('status','pending').gte('created_at',new Date(now.getTime()-10*60000).toISOString()).limit(20),
    sb.from('mofumori_gifts').select('id,sender_key,item_code,quantity,created_at').eq('recipient_key',userKey).is('claimed_at',null).gte('created_at',recent7).limit(30)
  ]);

  const senderKeys=[...(reqs||[]).map(x=>x.sender_key),...(challenges||[]).map(x=>x.sender_key),...(gifts||[]).map(x=>x.sender_key)];
  let names=new Map();
  if(senderKeys.length){
    const {data}=await sb.from('mofumori_profiles').select('user_key,display_name').in('user_key',[...new Set(senderKeys)]);
    names=new Map((data||[]).map(x=>[x.user_key,x.display_name||'フレンド']));
  }
  const out=(life||[]).map(lifePush).filter(Boolean);
  for(const v of visits||[]){
    if(v.host_key===userKey&&Date.now()-Date.parse(v.started_at)<24*3600000){
      out.push({eventKey:'visit-arrive:'+v.id,type:'visits',title:'🐦 お客さんが来た！',body:'フレンドの鳥が遊びに来ています。いっしょにお世話できます。',tag:'visit-'+v.id,url:'/?push=visits'});
    }
    if(v.visitor_key===userKey&&(v.ended_at||Date.parse(v.expires_at)<=Date.now())){
      out.push({eventKey:'visit-return:'+v.id,type:'visits',title:'🏠 おかえり！',body:'訪問に出ていた鳥が帰ってきました。',tag:'visit-'+v.id,url:'/?push=visits'});
    }
  }
  for(const f of reqs||[])out.push({eventKey:'friend:'+f.id,type:'social',title:'👋 フレンド申請が届いた！',body:`${names.get(f.sender_key)||'フレンド'}さんから申請が届いています。`,tag:'friend-'+f.id,url:'/?push=friends'});
  for(const a of challenges||[])out.push({eventKey:'arena:'+a.id,type:'arena',title:'⚔️ 対戦のお誘い！',body:`${names.get(a.sender_key)||'フレンド'}さんから対戦申請が届きました。`,tag:'arena-'+a.id,url:'/?push=arena'});
  for(const g of gifts||[])out.push({eventKey:'gift:'+g.id,type:'gifts',title:'🎁 仕送りが届いた！',body:`${names.get(g.sender_key)||'フレンド'}さんから ${Number(g.quantity||1)}個 届いています。`,tag:'gift-'+g.id,url:'/?push=gifts'});
  return out;
}
async function recordSuccess(sb,sub,eventKey,eventType){
  await Promise.all([
    sb.from('mofumori_push_deliveries').upsert({user_key:sub.user_key,subscription_id:sub.id,event_key:eventKey,event_type:eventType,status:'sent',sent_at:new Date().toISOString()},{onConflict:'subscription_id,event_key'}),
    sb.from('mofumori_push_subscriptions').update({last_success_at:new Date().toISOString(),failure_count:0,last_seen_at:new Date().toISOString()}).eq('id',sub.id)
  ]);
}
async function recordFailure(sb,sub,error){
  const code=Number(error?.statusCode||0),permanent=code===404||code===410;
  const patch={failure_count:Number(sub.failure_count||0)+1,updated_at:new Date().toISOString()};
  if(permanent){patch.enabled=false;patch.disabled_at=new Date().toISOString()}
  await sb.from('mofumori_push_subscriptions').update(patch).eq('id',sub.id);
}
async function dispatch(sb){
  const {data:subs,error}=await sb.from('mofumori_push_subscriptions')
    .select('id,user_key,endpoint,p256dh,auth,preferences,failure_count')
    .eq('enabled',true).is('disabled_at',null).order('last_seen_at',{ascending:false}).limit(500);
  if(error)throw error;if(!subs?.length)return{users:0,sent:0,failed:0,events:0};

  const privateKey=await vapidPrivate(sb),groups=new Map();
  for(const s of subs){if(!groups.has(s.user_key))groups.set(s.user_key,[]);groups.get(s.user_key).push(s)}
  let sent=0,failed=0,eventCount=0;
  for(const [userKey,userSubs] of groups){
    const events=await userEvents(sb,userKey);eventCount+=events.length;
    if(!events.length)continue;
    const subIds=userSubs.map(x=>x.id),keys=events.map(x=>x.eventKey);
    const {data:done}=await sb.from('mofumori_push_deliveries').select('subscription_id,event_key').in('subscription_id',subIds).in('event_key',keys);
    const delivered=new Set((done||[]).map(x=>x.subscription_id+'|'+x.event_key));
    for(const sub of userSubs){
      for(const ev of events){
        if(!pref(sub,ev.type)||delivered.has(sub.id+'|'+ev.eventKey))continue;
        const payload={title:ev.title,body:ev.body,icon:'/icon.svg',badge:'/icon.svg',tag:ev.tag,url:ev.url,data:{type:ev.type,eventKey:ev.eventKey}};
        try{await sendWebPush(sub,payload,privateKey);await recordSuccess(sb,sub,ev.eventKey,ev.type);sent++}
        catch(e){failed++;await recordFailure(sb,sub,e)}
      }
    }
  }
  await sb.from('mofumori_push_subscriptions').delete().eq('enabled',false).lt('disabled_at',new Date(Date.now()-30*86400000).toISOString());
  return{users:groups.size,sent,failed,events:eventCount};
}

module.exports=async function handler(req,res){
  if(!allowMethods(req,res,['GET','POST']))return;
  try{
    if(!configured())return json(res,503,{ok:false,message:'通知サーバーは準備中です。'});
    const sb=getSupabase();
    if(req.method==='GET'){
      let user=null;try{user=await requireUser(req)}catch{}
      let subscribed=false,count=0;
      if(user){
        const {data,error}=await sb.from('mofumori_push_subscriptions').select('id').eq('user_key',user.id).eq('enabled',true).is('disabled_at',null);
        if(error)throw error;count=(data||[]).length;subscribed=count>0;
      }
      return json(res,200,{ok:true,publicKey:VAPID_PUBLIC_KEY,authenticated:!!user,subscribed,count});
    }

    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    const action=String(body.action||'');
    if(action==='dispatch'){
      if(!cronAuthorized(req))return json(res,403,{ok:false,message:'forbidden'});
      const result=await dispatch(sb);
      return json(res,200,{ok:true,...result});
    }

    requireSameOrigin(req);
    const user=await requireUser(req);
    if(action==='subscribe'){
      const s=validSubscription(body.subscription);
      const preferences={lifecycle:true,visits:true,social:true,arena:true,gifts:true,...(body.preferences||{})};
      const row={user_key:user.id,endpoint:s.endpoint,p256dh:s.p256dh,auth:s.auth,user_agent:String(req.headers['user-agent']||'').slice(0,500),preferences,enabled:true,disabled_at:null,updated_at:new Date().toISOString(),last_seen_at:new Date().toISOString(),failure_count:0};
      const {error}=await sb.from('mofumori_push_subscriptions').upsert(row,{onConflict:'endpoint'});
      if(error)throw error;
      const {data:all}=await sb.from('mofumori_push_subscriptions').select('id').eq('user_key',user.id).eq('enabled',true).order('last_seen_at',{ascending:false});
      for(const stale of (all||[]).slice(8))await sb.from('mofumori_push_subscriptions').update({enabled:false,disabled_at:new Date().toISOString()}).eq('id',stale.id);
      return json(res,200,{ok:true,subscribed:true});
    }
    if(action==='unsubscribe'){
      const endpoint=String(body.endpoint||'');
      if(endpoint)await sb.from('mofumori_push_subscriptions').update({enabled:false,disabled_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('user_key',user.id).eq('endpoint',endpoint);
      else await sb.from('mofumori_push_subscriptions').update({enabled:false,disabled_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('user_key',user.id);
      return json(res,200,{ok:true,subscribed:false});
    }
    if(action==='test'){
      const {data:rows,error}=await sb.from('mofumori_push_subscriptions').select('id,user_key,endpoint,p256dh,auth,preferences,failure_count').eq('user_key',user.id).eq('enabled',true).is('disabled_at',null).limit(8);
      if(error)throw error;if(!rows?.length)throw Object.assign(new Error('通知登録がありません。'),{status:409});
      const privateKey=await vapidPrivate(sb);let sent=0;
      for(const sub of rows){
        try{await sendWebPush(sub,{title:'🔔 Mofumori通知テスト',body:'アプリを閉じていても、このようにお知らせします。',icon:'/icon.svg',badge:'/icon.svg',tag:'mofumori-test',url:'/?push=test',data:{type:'test'}},privateKey);sent++}
        catch(e){await recordFailure(sb,sub,e)}
      }
      return json(res,200,{ok:true,sent});
    }
    throw Object.assign(new Error('未対応の通知操作です。'),{status:400});
  }catch(error){
    console.error('[push]',error?.message||error);
    return json(res,error.status||500,{ok:false,message:error.message||'通知処理に失敗しました。'});
  }
};
