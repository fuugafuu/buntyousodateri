(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);
const S={busy:false,lastSync:0};

function supported(){return 'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window}
function currentUser(){try{return typeof identityUser!=='undefined'?identityUser:null}catch{return null}}
function standalone(){return window.matchMedia?.('(display-mode: standalone)')?.matches||window.navigator.standalone===true}
function ios(){return /iPhone|iPad|iPod/i.test(navigator.userAgent)}
function shell(){
  if($('#v734PushCard'))return $('#v734PushCard');
  const anchor=$('.identity-card');if(!anchor)return null;
  const card=document.createElement('section');card.id='v734PushCard';card.className='v734-push-card';
  card.innerHTML='<div class="v734-push-icon">🔔</div><div class="v734-push-main"><small>BACKGROUND NOTIFICATIONS</small><b id="v734PushTitle">通知</b><span id="v734PushState">確認中…</span></div><div class="v734-push-actions"><button id="v734PushMain">通知をオン</button><button id="v734PushTest" class="quiet" hidden>テスト</button></div>';
  anchor.insertAdjacentElement('afterend',card);
  $('#v734PushMain',card).onclick=mainAction;
  $('#v734PushTest',card).onclick=testPush;
  return card;
}
function b64ToBytes(value){
  const pad='='.repeat((4-value.length%4)%4),raw=atob((value+pad).replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
async function server(action,extra={}){
  const r=await fetch('/api/push',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action,...extra})});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.message||'通知サーバーに接続できませんでした。');return j;
}
async function config(){
  const r=await fetch('/api/push',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.message||'通知設定を取得できませんでした。');return j;
}
async function registration(){return navigator.serviceWorker.ready}
async function currentSubscription(){if(!supported())return null;return(await registration()).pushManager.getSubscription()}
async function syncSubscription(createIfMissing=false){
  if(!supported()||Notification.permission!=='granted'||!currentUser())return null;
  const reg=await registration();let sub=await reg.pushManager.getSubscription();
  if(!sub&&createIfMissing){
    const cfg=await config();
    if(!cfg.publicKey)throw new Error('通知公開鍵がありません。');
    sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(cfg.publicKey)});
  }
  if(sub){
    await server('subscribe',{subscription:sub.toJSON()});
    S.lastSync=Date.now();
  }
  return sub;
}
async function render(){
  const card=shell();if(!card)return;
  const title=$('#v734PushTitle',card),state=$('#v734PushState',card),main=$('#v734PushMain',card),test=$('#v734PushTest',card);
  if(!supported()){
    title.textContent='通知は利用できません';state.textContent='このブラウザはWeb Pushに対応していません。';main.disabled=true;main.textContent='非対応';test.hidden=true;return;
  }
  if(!currentUser()){
    title.textContent='バックグラウンド通知';state.textContent='ログインすると、アプリを閉じていても通知できます。';main.disabled=true;main.textContent='ログイン後に設定';test.hidden=true;return;
  }
  if(ios()&&!standalone()){
    title.textContent='iPhoneの通知';state.textContent='ホーム画面に追加したMofumoriから通知をオンにできます。';main.disabled=false;main.textContent='ホーム画面に追加';main.dataset.action='install';test.hidden=true;return;
  }
  main.dataset.action='';
  if(Notification.permission==='denied'){
    title.textContent='通知はブロック中';state.textContent='端末・ブラウザの設定からMofumoriの通知を許可してください。';main.disabled=true;main.textContent='通知が拒否されています';test.hidden=true;return;
  }
  const sub=Notification.permission==='granted'?await currentSubscription().catch(()=>null):null;
  if(Notification.permission==='granted'&&sub){
    title.textContent='通知 ON';state.textContent='🥚孵化・成長・訪問・フレンド・対戦などを、閉じていても知らせます。';main.disabled=false;main.textContent='通知をオフ';main.dataset.action='disable';test.hidden=false;return;
  }
  title.textContent='バックグラウンド通知';state.textContent='許可すると、Mofumoriを閉じている間も大事な変化を通知します。';main.disabled=false;main.textContent=Notification.permission==='granted'?'通知を登録':'通知をオン';main.dataset.action='enable';test.hidden=true;
}
async function mainAction(){
  if(S.busy)return;const btn=$('#v734PushMain');S.busy=true;if(btn)btn.disabled=true;
  try{
    if(btn?.dataset.action==='install'){
      window.showInstallGuide?.();return;
    }
    if(btn?.dataset.action==='disable'){
      const sub=await currentSubscription();
      if(sub){await server('unsubscribe',{endpoint:sub.endpoint});await sub.unsubscribe()}
      window.showToast?.('🔕 通知をオフにしました','');return;
    }
    if(!currentUser())throw new Error('ログインしてから通知を設定してください。');
    let permission=Notification.permission;
    if(permission==='default')permission=await Notification.requestPermission();
    if(permission!=='granted')throw new Error('通知が許可されませんでした。');
    const sub=await syncSubscription(true);
    if(!sub)throw new Error('通知を登録できませんでした。');
    window.showToast?.('🔔 バックグラウンド通知をオンにしました','achievement');
  }catch(e){window.showToast?.(e.message||'通知設定に失敗しました','warning')}
  finally{S.busy=false;await render().catch(()=>{})}
}
async function testPush(){
  if(S.busy)return;S.busy=true;const b=$('#v734PushTest');if(b){b.disabled=true;b.textContent='送信中…'}
  try{
    await syncSubscription(false);
    const j=await server('test');
    if(!j.sent)throw new Error('テスト通知を送れませんでした。');
    window.showToast?.('🔔 テスト通知を送信しました','achievement');
  }catch(e){window.showToast?.(e.message||'テスト通知に失敗しました','warning')}
  finally{S.busy=false;if(b){b.disabled=false;b.textContent='テスト'}}
}
async function autoSync(){
  shell();await render().catch(()=>{});
  if(!currentUser()||!supported()||Notification.permission!=='granted')return;
  if(Date.now()-S.lastSync<10*60*1000)return;
  try{await syncSubscription(true)}catch(e){}
  await render().catch(()=>{});
}
function handleRoute(){
  const u=new URL(location.href),kind=u.searchParams.get('push');if(!kind)return;
  setTimeout(()=>{
    if(kind==='friends'){window.openAccountHub?.();setTimeout(()=>window.setSocialTab?.('friends'),250)}
    else if(kind==='gifts'){window.openAccountHub?.();setTimeout(()=>window.setSocialTab?.('gifts'),250)}
    else if(kind==='visits'){window.openAccountHub?.();setTimeout(()=>window.setSocialTab?.('visits'),250)}
    else if(kind==='arena'){window.openArena?.();window.openAccountHub?.()}
    else if(kind==='life'){window.showModal?.('birdModal')}
    u.searchParams.delete('push');u.searchParams.delete('pet');history.replaceState(null,'',u.pathname+u.search+u.hash);
  },700);
}
window.mofumoriPushBeforeLogout=async()=>{
  try{
    const sub=await currentSubscription();
    if(sub&&currentUser())await server('unsubscribe',{endpoint:sub.endpoint});
  }catch{}
};
window.mofumoriPushRender=()=>autoSync();
window.mofumoriEnablePush=mainAction;
window.mofumoriTestPush=testPush;

function boot(){shell();autoSync();handleRoute();document.addEventListener('visibilitychange',()=>{if(!document.hidden)autoSync()})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,250),{once:true}):setTimeout(boot,250);
})();