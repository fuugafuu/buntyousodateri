(()=>{'use strict';
const RR={N:[1,'★'],R:[2,'★★'],SR:[3,'★★★'],SSR:[4,'★★★★'],UR:[5,'★★★★★']},C={1:180,10:1600},W={buncho_sakura:16,buncho_white:14,buncho_cinnamon:11,buncho_silver:9,canary:8,inko_green:7,inko_blue:7,buncho_pied:6,buncho_black:5,finch_zebra:5,lovebird:4,cockatiel:4,cat:4,penguin:4,beaver:3,fox:3,owl:2};
const A={greet:'👋 あいさつ',pet:'✋ なでる',play:'🎾 遊ぶ',share_seed:'🌾 シードを見せる'},N={mode:'local',friends:[],requests:{incoming:[],outgoing:[]},visits:{incoming:[],outgoing:[]},last:0,busy:false,debugFriend:false};
const DEV_MODE=['localhost','127.0.0.1','::1'].includes(location.hostname)||location.hostname.endsWith('.local');
const DEBUG_FRIEND_CODE='MF-DEBUGBIRD';
let dispatchFriend=null,dispatchPet=null,timer=null;
const O={ensureNewSettings,getCurrentBirdName,setCurrentBirdName,renderBirdGrid,updateBuyBtn,buyBird,updateUI,showModal,renderSocial,renderFriendList,addFriendById,setSocialTab,initIdentityAndSocial,logoutGoogle,renderText:window.render_game_to_text};
const id=()=>`local-${crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2)}`,rar=x=>RR[x]?x:'N';
function norm(p){let s=birds[p?.species]?p.species:'buncho_sakura',r=rar(p?.rarity),b=birds[s];return{id:String(p?.id||id()),species:s,name:String(p?.name||b.name).trim().slice(0,12)||b.name,rarity:r,rank:Math.max(1,Math.min(5,+p?.rank||RR[r][0])),source:['starter','legacy','gacha','reward'].includes(p?.source)?p.source:'legacy',obtainedAt:p?.obtainedAt||new Date().toISOString(),stats:p?.stats&&typeof p.stats==='object'?{...p.stats}:undefined,sexKnown:p?.sexKnown===true,sex:p?.sex||null,sexDeterminedAt:p?.sexDeterminedAt||null}}
function ensure(){if(!Array.isArray(G.petCollection)||!G.petCollection.length){G.petCollection=[...new Set(G.unlocked?.length?G.unlocked:[G.species||'buncho_sakura'])].filter(s=>birds[s]).map(s=>norm({species:s,name:G.birdNames?.[s],source:s==='buncho_sakura'?'starter':'legacy'}))}G.petCollection=G.petCollection.filter(p=>birds[p.species]).slice(0,250).map(norm);if(!G.petCollection.length)G.petCollection=[norm({species:'buncho_sakura',name:'文鳥',source:'starter'})];let p=G.petCollection.find(x=>String(x.id)===String(G.activePetId))||G.petCollection.find(x=>x.species===G.species)||G.petCollection[0];G.activePetId=p.id;G.species=p.species;G.name=p.name;G.birdNames=G.birdNames||{};G.birdNames[p.species]=p.name;G.unlocked=[...new Set([...G.petCollection.map(x=>x.species),...(G.unlocked||[]).filter(x=>birds[x]?.hidden)])];return p}
const active=()=>ensure(),meta=p=>{let b=birds[p?.species]||birds.buncho_sakura,r=rar(p?.rarity);return{b,r,rank:RR[r][0],stars:RR[r][1]}};
function syncPets(ps){if(!Array.isArray(ps)||!ps.length)return;let old=active();G.petCollection=ps.map(norm);let p=G.petCollection.find(x=>x.id===G.activePetId)||G.petCollection.find(x=>x.species===old.species&&x.name===old.name)||G.petCollection[0];G.activePetId=p.id;G.species=p.species;G.name=p.name}
function rnd(){if(crypto.getRandomValues){let a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}return Math.random()}
function drawR(min='N'){let x=rnd(),r=x<.01?'UR':x<.05?'SSR':x<.18?'SR':x<.45?'R':'N';return min==='R'&&r==='N'?'R':r}
function draw(){let es=Object.entries(W).filter(([species])=>species!=='beaver'||Math.max(1,Number(G.level)||1)>=3),t=es.reduce((n,[,w])=>n+w,0),x=rnd()*t,s='buncho_sakura';for(let[e,w]of es){x-=w;if(x<=0){s=e;break}}return s}
function ui(){
  const mount=document.getElementById('gachaMount');
  if(mount&&!document.getElementById('gachaHub')){
    const e=document.createElement('div');e.id='gachaHub';e.className='gacha-hub';
    e.innerHTML='<div class="gacha-copy"><small>MOFUMORI CAPSULE</small><b>どうぶつガチャ</b><span>同じ種類でも別個体。個体ランク付き。</span></div><div class="gacha-actions"><button data-g="1">1回 <b>180💰</b></button><button class="ten" data-g="10">10回 <b>1600💰</b><small>10体目 R以上</small></button></div><div class="gacha-rates">N 55%　R 27%　SR 13%　SSR 4%　UR 1%</div>';
    mount.appendChild(e);e.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>gacha(+b.dataset.g));
  }
  if(!document.getElementById('gachaReveal')){
    const e=document.createElement('div');e.id='gachaReveal';e.className='gacha-reveal';
    e.innerHTML='<button class="gacha-skip">SKIP</button><div class="gacha-stage"><div class="gacha-orbit"><i></i><i></i><i></i></div><div class="gacha-capsule">🐣</div><div class="gacha-flash"></div><div class="gacha-results"></div><button class="gacha-close">仲間一覧へ</button></div>';
    document.body.appendChild(e);
    e.querySelector('.gacha-skip').onclick=closeReveal;
    e.querySelector('.gacha-close').onclick=()=>{closeReveal(true);showModal('birdModal')};
  }
  const sort=document.getElementById('petSortSelect');
  if(sort&&!sort.dataset.bound){
    sort.dataset.bound='1';sort.value=localStorage.getItem('mofumoriPetSort')||'rank';
    sort.onchange=()=>{localStorage.setItem('mofumoriPetSort',sort.value);collection()};
  }
  visitUi();debugUi();
}
function sortedPets(){
  const mode=document.getElementById('petSortSelect')?.value||localStorage.getItem('mofumoriPetSort')||'rank';
  const list=G.petCollection.slice(),ts=p=>Date.parse(p.obtainedAt||0)||0,rate=p=>Number(p.stats?.rating||0);
  list.sort((a,b)=>{
    if(mode==='rating')return rate(b)-rate(a)||b.rank-a.rank||ts(b)-ts(a);
    if(mode==='newest')return ts(b)-ts(a)||b.rank-a.rank;
    if(mode==='oldest')return ts(a)-ts(b)||b.rank-a.rank;
    if(mode==='name')return String(a.name||'').localeCompare(String(b.name||''),'ja')||b.rank-a.rank;
    if(mode==='species')return String(birds[a.species]?.name||a.species).localeCompare(String(birds[b.species]?.name||b.species),'ja')||b.rank-a.rank;
    return b.rank-a.rank||rate(b)-rate(a)||ts(b)-ts(a);
  });
  return list;
}
function collection(){
  ensure();const g=document.getElementById('birdGrid');if(!g)return;
  const away=new Set(N.visits.outgoing.map(v=>v.pet?.id));
  g.innerHTML=sortedPets().map((p,index)=>{const{b,r,stars}=meta(p),sel=p.id===G.activePetId,rate=Number(p.stats?.rating||0);
    return`<button class="pet-card rarity-${r.toLowerCase()} ${sel?'selected':''}" data-p="${escapeHtml(p.id)}" style="--pet-i:${index}"><span class="pet-rarity">${r}</span><span class="pet-stars">${stars}</span><span class="pet-icon">${escapeHtml(b.icon)}</span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(b.name)} ・ 個体ランク ${p.rank}${rate?' ・ RATING '+rate:''}</small><em>${away.has(p.id)?'🧳 おでかけ中':sel?'● いま一緒':'タップで選択'}</em></button>`}).join('');
  g.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>choose(b.dataset.p));
}
async function choose(pid){let p=G.petCollection.find(x=>x.id===pid);if(!p)return;G.activePetId=p.id;G.species=p.species;G.name=p.name;G.birdNames[p.species]=p.name;save();updateUI();collection();if(identityUser&&!pid.startsWith('local-'))try{apply((await api('selectPet',{petId:pid})).data)}catch(e){showToast(e.message,'warning')}hideModal('birdModal')}
function localGacha(n){G.coins-=C[n];let a=Array.from({length:n},(_,i)=>{let s=draw(),r=drawR(n===10&&i===9?'R':'N');return norm({species:s,name:birds[s].name,rarity:r,rank:RR[r][0],source:'gacha'})});G.petCollection.push(...a);return a}
async function gacha(n){n=n===10?10:1;if(G.coins<C[n])return showToast('💰が足りません','warning');document.querySelectorAll('[data-g]').forEach(b=>b.disabled=true);try{let a;if(identityUser){let rec={version:'7.2.0',savedAt:new Date().toISOString(),data:stateForStorage()},r=await fetch('/api/cloud-save',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(rec)}),j=await r.json().catch(()=>({}));if(r.ok){let z=await api('gacha',{count:n});if(z.gameState)G=normalizeGameState({...G,...z.gameState});apply(z.data);a=(z.results||[]).map(norm)}else if(j.configured===false){showToast('クラウド未接続: この端末だけのガチャ','warning');a=localGacha(n)}else throw Error(j.message||'同期に失敗しました')}else a=localGacha(n);if(a?.length){reveal(a);save();updateUI();collection()}}catch(e){showToast(e.message||'ガチャに失敗しました','warning')}finally{document.querySelectorAll('[data-g]').forEach(b=>b.disabled=false)}}
function reveal(a){ui();clearTimeout(timer);let w=document.getElementById('gachaReveal'),hi=Math.max(...a.map(x=>x.rank)),r=Object.keys(RR).find(k=>RR[k][0]===hi)||'N';w.className=`gacha-reveal show rarity-${r.toLowerCase()}`;w.querySelector('.gacha-results').innerHTML=a.map((p,i)=>{let{b,r,stars}=meta(p);return`<article class="gacha-result rarity-${r.toLowerCase()}" style="--i:${i}"><span class="result-rarity">${r}</span><span class="result-stars">${stars}</span><div class="result-icon">${b.icon}</div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(b.name)} ・ 個体ランク ${p.rank}</small></article>`}).join('');timer=setTimeout(()=>w.classList.add('revealed'),850)}
function closeReveal(force=false){clearTimeout(timer);let w=document.getElementById('gachaReveal');if(!force&&!w.classList.contains('revealed'))return w.classList.add('revealed');w.className='gacha-reveal'}
async function api(action,payload={}){let r=await fetch('/api/pets',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action,payload})}),j=await r.json().catch(()=>({}));if(!r.ok){let e=Error(j.message||`HTTP ${r.status}`);e.configured=j.configured;throw e}return j}
function apply(d){if(!d)return;N.mode='cloud';N.last=Date.now();N.friends=d.friends||[];N.requests=d.requests||{incoming:[],outgoing:[]};N.visits=d.visits||{incoming:[],outgoing:[]};socialState.friends=N.friends;if(d.playerId)socialState.playerId=d.playerId;syncPets(d.pets);if((d.newUnlocks||[]).includes('fuga'))showToast('🎁 通常どうぶつコンプリート！ 隠しキャラ「ふうが」解放！','achievement');social();presence();if(document.getElementById('birdModal')?.classList.contains('show'))collection()}
async function refresh(force=false){if(!identityUser||N.busy||(!force&&Date.now()-N.last<8000))return;N.busy=true;try{apply((await api('dashboard')).data)}catch(e){if(e.configured===false)N.mode='local'}finally{N.busy=false}}
function visitUi(){let f=document.getElementById('socialFriendsTab');if(f&&!document.getElementById('friendRequests')){let x=document.createElement('div');x.id='friendRequests';x.className='friend-request-box';f.insertBefore(x,document.getElementById('friendList'))}let t=document.querySelector('.social-tabs');if(t&&!t.querySelector('[data-social-tab="visits"]')){let b=document.createElement('button');b.dataset.socialTab='visits';b.textContent='🧳 訪問';b.onclick=()=>setSocialTab('visits');t.appendChild(b);let p=document.createElement('div');p.id='socialVisitsTab';p.className='social-tab-page';p.innerHTML='<div id="visitList"></div>';t.parentNode.appendChild(p)}
if(!document.getElementById('visitModal')){let m=document.createElement('div');m.id='visitModal';m.className='modal';m.innerHTML='<div class="modal-content visit-dispatch-modal"><div class="modal-title">🐦 遊びに行かせる</div><p id="visitCopy" class="visit-copy"></p><div id="visitChoices" class="visit-pet-choices"></div><div class="modal-buttons"><button class="modal-btn secondary" data-x>キャンセル</button><button class="modal-btn primary" id="visitGo">12時間の訪問を開始</button></div></div>';document.body.appendChild(m);m.querySelector('[data-x]').onclick=()=>hideModal('visitModal');m.querySelector('#visitGo').onclick=startVisit}
if(!document.getElementById('visitGuestDock')){let b=document.createElement('button');b.id='visitGuestDock';b.className='visit-guest-dock';b.onclick=()=>{openAccountHub();setSocialTab('visits')};document.querySelector('.habitat-card')?.appendChild(b)}if(!document.getElementById('petAwayOverlay')){let d=document.createElement('div');d.id='petAwayOverlay';d.className='pet-away-overlay';document.querySelector('.main-display')?.appendChild(d)}}
function social(){visitUi();requests();friends();visits()}
function requests(){let b=document.getElementById('friendRequests');if(!b)return;if(!identityUser){b.hidden=true;return}b.hidden=false;let i=N.requests.incoming||[],o=N.requests.outgoing||[];b.innerHTML=`<b>フレンド申請</b><small>相手の承認後にフレンドになります</small>${i.map(x=>`<div class="request-row"><span>${escapeHtml(x.player?.displayName||x.player?.playerId||'')}</span><span><button data-ok="${x.id}">承認</button><button class="quiet" data-no="${x.id}">断る</button></span></div>`).join('')||'<div class="request-empty">届いている申請はありません</div>'}${o.length?`<div class="outgoing-requests">申請中 ${o.length}件</div>`:''}`;b.querySelectorAll('[data-ok]').forEach(x=>x.onclick=()=>answer(x.dataset.ok,true));b.querySelectorAll('[data-no]').forEach(x=>x.onclick=()=>answer(x.dataset.no,false))}
async function answer(i,a){try{apply((await api('respondFriendRequest',{requestId:i,accept:a})).data);showToast(a?'フレンドになりました！':'申請を断りました',a?'achievement':'')}catch(e){showToast(e.message,'warning')}}
function debugFriend(){
  return {playerId:DEBUG_FRIEND_CODE,displayName:'デバッグ飼育員',character:{icon:'🐦',name:'デバッグ文鳥',species:'buncho_sakura'},debug:true};
}
function friendPool(){const base=N.friends.slice();if(DEV_MODE&&N.debugFriend&&!base.some(f=>f.playerId===DEBUG_FRIEND_CODE))base.unshift(debugFriend());return base}
function friends(){
  if(!identityUser&&!DEV_MODE)return O.renderFriendList();
  const l=document.getElementById('friendList');if(!l)return;const pool=friendPool();
  l.innerHTML=pool.length?pool.map(f=>`<div class="friend-card friend-card-v5 ${f.debug?'debug-friend':''}"><div class="friend-avatar">${escapeHtml(f.character?.icon||'🐦')}</div><div class="friend-main"><b>${escapeHtml(f.character?.name||f.displayName)}</b><small>${escapeHtml(f.displayName||'')} ・ ${escapeHtml(f.playerId)}</small></div><div class="friend-actions">${f.debug?'<button data-debug-open>🧪 デバッグ</button>':`<button data-view="${f.playerId}">🏠 見る</button><button data-visit="${f.playerId}">🐦 訪問</button>`}</div></div>`).join(''):'<div class="social-empty">IDで申請し、相手が承認するとフレンドになります。</div>';
  l.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>openFriendPet(x.dataset.view));
  l.querySelectorAll('[data-visit]').forEach(x=>x.onclick=()=>dispatch(x.dataset.visit));
  l.querySelectorAll('[data-debug-open]').forEach(x=>x.onclick=openDebugPanel);
}
function debugUi(){
  if(!DEV_MODE||document.getElementById('debugPetModal'))return;
  const m=document.createElement('div');m.id='debugPetModal';m.className='modal';
  m.innerHTML='<div class="modal-content v72-debug-modal"><div class="modal-title">🧪 開発用デバッグ文鳥</div><p class="social-hint">localhost専用。サーバーや他ユーザーのデータは変更しません。</p><textarea id="debugStateEditor" spellcheck="false"></textarea><div class="modal-buttons"><button class="modal-btn secondary" data-debug-close>閉じる</button><button class="modal-btn primary" data-debug-apply>ローカル状態へ反映</button></div></div>';
  document.body.appendChild(m);m.querySelector('[data-debug-close]').onclick=()=>hideModal('debugPetModal');m.querySelector('[data-debug-apply]').onclick=applyDebugState;
}
function openDebugPanel(){
  if(!DEV_MODE)return;
  debugUi();const p=active(),editor=document.getElementById('debugStateEditor');
  editor.value=JSON.stringify({game:G,activePet:p},null,2);showModal('debugPetModal');
}
function applyDebugState(){
  if(!DEV_MODE)return;const editor=document.getElementById('debugStateEditor');
  try{const parsed=JSON.parse(editor.value);if(parsed.game&&typeof parsed.game==='object')G=normalizeGameState({...G,...parsed.game});if(parsed.activePet&&G.petCollection){const i=G.petCollection.findIndex(p=>String(p.id)===String(G.activePetId));if(i>=0)G.petCollection[i]={...G.petCollection[i],...parsed.activePet}}ensure();save();updateUI();collection();hideModal('debugPetModal');showToast('ローカルのデバッグ状態を反映しました','achievement')}catch(e){showToast('JSONを確認してください','warning')}
}
function dispatch(pid){dispatchFriend=N.friends.find(x=>x.playerId===pid);if(!dispatchFriend)return;let busy=new Set(N.visits.outgoing.map(v=>v.pet?.id));document.getElementById('visitCopy').textContent=`${dispatchFriend.displayName||pid} のところへ12時間遊びに行きます。`;let b=document.getElementById('visitChoices');b.innerHTML=G.petCollection.map(p=>{let m=meta(p),off=busy.has(p.id)||p.id.startsWith('local-');return`<button ${off?'disabled':''} data-vp="${p.id}" class="rarity-${m.r.toLowerCase()}"><span>${m.b.icon}</span><b>${escapeHtml(p.name)}</b><small>${m.r} ${m.stars}${off?' ・ 利用不可':''}</small></button>`}).join('');dispatchPet=null;b.querySelectorAll('[data-vp]:not([disabled])').forEach(x=>x.onclick=()=>{dispatchPet=x.dataset.vp;b.querySelectorAll('button').forEach(y=>y.classList.toggle('selected',x===y))});showModal('visitModal')}
async function startVisit(){if(!dispatchFriend||!dispatchPet)return showToast('連れていく子を選んでください','warning');try{apply((await api('startVisit',{playerId:dispatchFriend.playerId,petId:dispatchPet})).data);hideModal('visitModal');showToast('遊びに行きました！🧳','achievement')}catch(e){showToast(e.message,'warning')}}
function visits(){let l=document.getElementById('visitList');if(!l)return;if(!identityUser){l.innerHTML='<div class="social-empty">ログインするとフレンド訪問が使えます。</div>';return}let card=(v,inc)=>{let p=v.pet||{},m=meta(p),peer=inc?v.owner:v.host;return`<article class="visit-card rarity-${m.r.toLowerCase()}"><div class="visit-pet-icon">${m.b.icon}</div><div class="visit-info"><b>${escapeHtml(p.name||m.b.name)}</b><small>${inc?'飼い主':'訪問先'}: ${escapeHtml(peer?.displayName||'フレンド')}</small><small>交流 ${v.interactionCount||0}回</small></div>${inc?`<div class="visit-actions">${Object.entries(A).map(([a,n])=>`<button data-act="${a}" data-id="${v.id}">${n}</button>`).join('')}</div>`:`<button class="return-visit" data-back="${v.id}">戻す</button>`}</article>`};l.innerHTML=`<section class="visit-section"><h3>🏠 遊びに来ている子</h3>${N.visits.incoming.map(v=>card(v,true)).join('')||'<div class="social-empty">いません</div>'}</section><section class="visit-section"><h3>🧳 おでかけ中</h3>${N.visits.outgoing.map(v=>card(v,false)).join('')||'<div class="social-empty">いません</div>'}</section>`;l.querySelectorAll('[data-act]').forEach(x=>x.onclick=async()=>{try{apply((await api('interactVisit',{visitId:x.dataset.id,interaction:x.dataset.act})).data);showToast('交流しました！','achievement')}catch(e){showToast(e.message,'warning')}});l.querySelectorAll('[data-back]').forEach(x=>x.onclick=()=>back(x.dataset.back))}
async function back(i){try{apply((await api('endVisit',{visitId:i})).data);showToast('おうちに戻りました')}catch(e){showToast(e.message,'warning')}}
function presence(){visitUi();let g=document.getElementById('visitGuestDock'),v=N.visits.incoming[0];if(g){if(v?.pet){g.innerHTML=`<span>${meta(v.pet).b.icon}</span><b>${escapeHtml(v.pet.name)}</b><small>フレンドの子が来ています</small>`;g.classList.add('show')}else{g.classList.remove('show');g.innerHTML=''}}let p=active(),o=N.visits.outgoing.find(v=>v.pet?.id===p.id),d=document.querySelector('.main-display'),z=document.getElementById('petAwayOverlay');d?.classList.toggle('pet-away',!!o);if(z){if(o){z.innerHTML=`<div><span>🧳</span><b>${escapeHtml(p.name)}はおでかけ中</b><small>${escapeHtml(o.host?.displayName||'フレンド')}のところにいます</small><button data-home>呼び戻す</button></div>`;z.classList.add('show');z.querySelector('[data-home]').onclick=()=>back(o.id)}else{z.classList.remove('show');z.innerHTML=''}}document.querySelectorAll('[data-care]').forEach(b=>{b.disabled=!!o||(G.isSleeping&&b.id!=='sleepBtn')})}

ensureNewSettings=function(){O.ensureNewSettings();ensure()};getCurrentBirdName=function(){return active().name};setCurrentBirdName=function(n){let p=active(),s=String(n||'').trim().slice(0,12)||birds[p.species].name;p.name=s;G.name=s;G.birdNames[p.species]=s;if(identityUser&&!p.id.startsWith('local-'))api('renamePet',{petId:p.id,name:s}).then(x=>apply(x.data)).catch(()=>{})};renderBirdGrid=function(){ui();collection()};updateBuyBtn=function(){let b=document.getElementById('buyBirdBtn');if(b){b.hidden=true;b.disabled=true}};buyBird=function(){gacha(1)};showModal=function(i){O.showModal(i);if(i==='birdModal'){ui();collection()}if(i==='gachaModal'){ui()}};updateUI=function(){ensure();O.updateUI();presence()};renderSocial=function(){O.renderSocial();social()};renderFriendList=function(){identityUser?friends():O.renderFriendList()};addFriendById=async function(){let x=document.getElementById('friendIdInput'),p=String(x?.value||'').trim().toUpperCase();if(DEV_MODE&&p===DEBUG_FRIEND_CODE){N.debugFriend=true;sessionStorage.setItem('mofumoriDebugFriend','1');if(x)x.value='';social();showToast('デバッグ文鳥がフレンドになりました 🧪🐦','achievement');return}if(!identityUser)return O.addFriendById();if(!/^MF-[A-Z0-9]{8,12}$/.test(p))return showToast('IDは MF- に続く8〜12文字で入力してください','warning');try{let r=await api('sendFriendRequest',{playerId:p});x.value='';apply(r.data);showToast(r.autoAccepted?'フレンドになりました！':'フレンド申請を送りました','achievement')}catch(e){showToast(e.message,'warning')}};setSocialTab=function(t){
  if(t!=='visits'){
    const out=O.setSocialTab(t);
    if(t==='friends'&&identityUser){N.last=0;refresh(true)}
    return out;
  }
  socialTab='visits';
  document.querySelectorAll('[data-social-tab]').forEach(b=>b.classList.toggle('active',b.dataset.socialTab==='visits'));
  document.querySelectorAll('.social-tab-page').forEach(p=>p.classList.toggle('active',p.id==='socialVisitsTab'));
  visits();
  if(identityUser){N.last=0;refresh(true)}
};initIdentityAndSocial=async function(f=false){await O.initIdentityAndSocial(f);ensure();ui();identityUser?await refresh(true):social()};logoutGoogle=async function(){await O.logoutGoogle();N.mode='local';N.friends=[];N.requests={incoming:[],outgoing:[]};N.visits={incoming:[],outgoing:[]};social();presence()};
window.render_game_to_text=function(){let b={};try{b=JSON.parse(O.renderText?.()||'{}')}catch(e){}let p=active();return JSON.stringify({...b,pets:{active:{id:p.id,species:p.species,rarity:p.rarity,rank:p.rank},owned:G.petCollection.length,friendRequests:N.requests.incoming.length,visitors:N.visits.incoming.length,away:N.visits.outgoing.length}})};
function boot(){
  N.debugFriend=DEV_MODE&&sessionStorage.getItem('mofumoriDebugFriend')==='1';
  ui();ensure();collection();social();presence();
  setInterval(()=>identityUser&&!document.hidden&&refresh(),30000);
  setInterval(()=>{
    if(!identityUser||document.hidden)return;
    const panel=document.getElementById('socialPanel'),friendsTab=document.getElementById('socialFriendsTab');
    if(panel?.classList.contains('show')&&friendsTab?.classList.contains('active'))refresh(true);
  },4000);
  window.addEventListener('focus',()=>{if(identityUser){N.last=0;refresh(true)}});
  document.addEventListener('visibilitychange',()=>{if(identityUser&&!document.hidden){N.last=0;refresh(true)}});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot),{once:true}):setTimeout(boot);
})();