(()=>{'use strict';
const RR={N:[1,'★'],R:[2,'★★'],SR:[3,'★★★'],SSR:[4,'★★★★'],UR:[5,'★★★★★']},C={1:180,10:1600},W={buncho_sakura:16,buncho_white:14,buncho_cinnamon:11,buncho_silver:9,canary:8,inko_green:7,inko_blue:7,buncho_pied:6,buncho_black:5,finch_zebra:5,lovebird:4,cockatiel:4,cat:4,penguin:4,beaver:3,fox:3,owl:2};
const A={greet:'👋 あいさつ',pet:'✋ なでる',play:'🎾 遊ぶ',share_seed:'🌾 シードを見せる'},VCARE={feed:'🍚',pet:'✋',play:'🎾',bath:'🛁',treat:'🍬',sing:'🎵'},N={mode:'local',friends:[],requests:{incoming:[],outgoing:[]},visits:{incoming:[],outgoing:[]},breeding:{jobs:[],events:[]},breedMale:null,breedFemale:null,eventQueue:[],eventBusy:false,currentLifeEvent:null,lifecycleDueRefreshAt:0,visitFocus:0,last:0,busy:false,debugFriend:false,adminFriend:false,admin:null,gachaConfig:null,gachaBanner:'standard'};
const DEV_MODE=['localhost','127.0.0.1','::1'].includes(location.hostname)||location.hostname.endsWith('.local');
const DEBUG_FRIEND_CODE='MF-DEBUGBIRD';
const ADMIN_BIRD_CODE='MF::M0FUM0RI-ADMIN::BIRD-7Z2::OWNER';
let dispatchFriend=null,dispatchPet=null,timer=null;
const O={ensureNewSettings,getCurrentBirdName,setCurrentBirdName,renderBirdGrid,updateBuyBtn,buyBird,updateUI,showModal,renderSocial,renderFriendList,addFriendById,setSocialTab,initIdentityAndSocial,logoutGoogle,renderText:window.render_game_to_text};
const id=()=>`local-${crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2)}`,rar=x=>RR[x]?x:'N';
function norm(p){let s=birds[p?.species]?p.species:'buncho_sakura',r=rar(p?.rarity),b=birds[s],stage=['egg','chick','adult'].includes(p?.lifeStage)?p.lifeStage:'adult';return{id:String(p?.id||id()),species:s,speciesName:String(p?.speciesName||b.name),icon:String(p?.icon||b.icon),name:String(p?.name||p?.speciesName||b.name).trim().slice(0,12)||b.name,rarity:r,rank:Math.max(1,Math.min(5,+p?.rank||RR[r][0])),source:['starter','legacy','gacha','reward','bred'].includes(p?.source)?p.source:'legacy',obtainedAt:p?.obtainedAt||new Date().toISOString(),stats:p?.stats&&typeof p.stats==='object'?{...p.stats}:undefined,lifeStage:stage,fatherId:p?.fatherId||null,motherId:p?.motherId||null,generation:Math.max(0,Number(p?.generation)||0),genetics:p?.genetics&&typeof p.genetics==='object'?p.genetics:{},phenotype:p?.phenotype&&typeof p.phenotype==='object'?p.phenotype:{},laidAt:p?.laidAt||null,hatchAt:p?.hatchAt||null,hatchedAt:p?.hatchedAt||null,adultEarliestAt:p?.adultEarliestAt||null,adultLatestAt:p?.adultLatestAt||null,adultAt:p?.adultAt||null,growthPoints:Math.max(0,Number(p?.growthPoints)||0),bredAt:p?.bredAt||null,customNamed:p?.customNamed===true,fusionLevel:Math.max(0,Math.min(20,Number(p?.fusionLevel)||0)),fusionCount:Math.max(0,Number(p?.fusionCount)||0),fusedAt:p?.fusedAt||null,sexKnown:p?.sexKnown===true,sex:p?.sex||null,sexDeterminedAt:p?.sexDeterminedAt||null}}
function ensure(){if(!Array.isArray(G.petCollection)||!G.petCollection.length){G.petCollection=[...new Set(G.unlocked?.length?G.unlocked:[G.species||'buncho_sakura'])].filter(s=>birds[s]).map(s=>norm({species:s,name:G.birdNames?.[s],source:s==='buncho_sakura'?'starter':'legacy'}))}G.petCollection=G.petCollection.filter(p=>birds[p.species]).slice(0,1000).map(norm);if(!G.petCollection.length)G.petCollection=[norm({species:'buncho_sakura',name:'文鳥',source:'starter'})];let p=G.petCollection.find(x=>String(x.id)===String(G.activePetId))||G.petCollection.find(x=>x.species===G.species)||G.petCollection[0];G.activePetId=p.id;G.species=p.species;G.name=p.name;G.birdNames=G.birdNames||{};G.birdNames[p.species]=p.name;G.unlocked=[...new Set([...G.petCollection.map(x=>x.species),...(G.unlocked||[]).filter(x=>birds[x]?.hidden)])];return p}
const active=()=>ensure(),meta=p=>{let base=birds[p?.species]||birds.buncho_sakura,r=rar(p?.rarity),icon=p?.lifeStage==='egg'?'🥚':p?.lifeStage==='chick'?'🐣':(p?.icon||base.icon),name=p?.speciesName||base.name,b={...base,icon,name};return{b,r,rank:RR[r][0],stars:RR[r][1]}};
function syncPets(ps){if(!Array.isArray(ps)||!ps.length)return;let old=active();G.petCollection=ps.map(norm);let p=G.petCollection.find(x=>x.id===G.activePetId)||G.petCollection.find(x=>x.species===old.species&&x.name===old.name)||G.petCollection[0];G.activePetId=p.id;G.species=p.species;G.name=p.name}
function rnd(){if(crypto.getRandomValues){let a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}return Math.random()}
function currentBanner(){
  const cfg=N.gachaConfig,banners=Array.isArray(cfg?.banners)?cfg.banners.filter(b=>b?.enabled!==false):[];
  return banners.find(b=>b.id===N.gachaBanner)||banners.find(b=>b.id===cfg?.activeBanner)||banners[0]||{id:'standard',name:'森の仲間ガチャ',price1:180,price10:1600,rates:{N:55,R:27,SR:13,SSR:4,UR:1},speciesWeights:{...W}};
}
function drawR(min='N',rates=currentBanner().rates){
  const order=['N','R','SR','SSR','UR'];let total=order.reduce((s,k)=>s+Math.max(0,Number(rates?.[k]||0)),0)||100,x=rnd()*total,r='N';
  for(const k of order){x-=Math.max(0,Number(rates?.[k]||0));if(x<=0){r=k;break}}
  return min==='R'&&r==='N'?'R':r;
}
function draw(weights=currentBanner().speciesWeights){
  let es=Object.entries(weights||W).filter(([species,w])=>birds[species]&&species!=='fuga'&&Number(w)>0&&(species!=='beaver'||Math.max(1,Number(G.level)||1)>=3));
  if(!es.length)es=Object.entries(W).filter(([species])=>species!=='beaver'||Math.max(1,Number(G.level)||1)>=3);
  let t=es.reduce((n,[,w])=>n+Number(w),0),x=rnd()*t,s='buncho_sakura';for(let[e,w]of es){x-=Number(w);if(x<=0){s=e;break}}return s;
}
function renderGachaHub(){
  const mount=document.getElementById('gachaMount');if(!mount)return;
  let e=document.getElementById('gachaHub');
  if(!e){e=document.createElement('div');e.id='gachaHub';e.className='gacha-hub';mount.appendChild(e)}
  const cfg=N.gachaConfig,banners=(cfg?.banners||[]).filter(b=>b?.enabled!==false),b=currentBanner();
  if(!banners.some(x=>x.id===N.gachaBanner))N.gachaBanner=b.id;
  const rates=b.rates||{},rateText=['N','R','SR','SSR','UR'].map(k=>`${k} ${Number(rates[k]||0)}%`).join('　');
  e.innerHTML=`<div class="gacha-copy"><small>MOFUMORI CAPSULE</small><b>${escapeHtml(b.name||'どうぶつガチャ')}</b><span>同じ種類でも別個体。個体ランク付き。</span></div>
    ${banners.length>1?`<select id="gachaBannerSelect">${banners.map(x=>`<option value="${escapeHtml(x.id)}" ${x.id===b.id?'selected':''}>${escapeHtml(x.name||x.id)}</option>`).join('')}</select>`:''}
    <div class="gacha-actions"><button data-g="1">1回 <b>${Number(b.price1||0)}💰</b></button><button class="ten" data-g="10">10回 <b>${Number(b.price10||0)}💰</b><small>10体目 R以上</small></button></div><div class="gacha-rates">${rateText}</div>`;
  e.querySelectorAll('[data-g]').forEach(btn=>btn.onclick=()=>gacha(+btn.dataset.g));
  e.querySelector('#gachaBannerSelect')?.addEventListener('change',ev=>{N.gachaBanner=ev.target.value;renderGachaHub()});
}
async function loadPublicGachaConfig(){
  try{const r=await fetch('/api/config',{cache:'no-store',credentials:'same-origin'}),j=await r.json();if(r.ok&&j?.data){N.gachaConfig=j.data;if(!N.gachaBanner)N.gachaBanner=j.data.activeBanner||'standard';renderGachaHub()}}catch(e){}
}
function ui(){
  renderGachaHub();
  if(!document.getElementById('gachaReveal')){
    const e=document.createElement('div');e.id='gachaReveal';e.className='gacha-reveal';
    e.innerHTML='<button class="gacha-skip">SKIP</button><div class="gacha-stage"><div class="gacha-orbit"><i></i><i></i><i></i></div><div class="gacha-capsule">🐣</div><div class="gacha-flash"></div><div class="gacha-results"></div><button class="gacha-close">仲間一覧へ</button></div>';
    document.body.appendChild(e);e.querySelector('.gacha-skip').onclick=closeReveal;e.querySelector('.gacha-close').onclick=()=>{closeReveal(true);showModal('birdModal')};
  }
  const sort=document.getElementById('petSortSelect');
  if(sort&&!sort.dataset.bound){sort.dataset.bound='1';sort.value=localStorage.getItem('mofumoriPetSort')||'rank';sort.onchange=()=>{localStorage.setItem('mofumoriPetSort',sort.value);collection()}}
  fusionUi();breedingUi();lifecycleUi();stageUi();visitUi();debugUi();adminUi();
}

const BREED_BIRDS=new Set(['buncho_sakura','buncho_white','buncho_cinnamon','buncho_silver','buncho_pied','buncho_black','canary','inko_green','inko_blue','finch_zebra','lovebird','cockatiel','owl','penguin']);
function breedCompatible(a,b){
  if(!a||!b)return{ok:false,msg:'オスとメスを1羽ずつ選択'};
  if(a.id===b.id)return{ok:false,msg:'同じ個体は選べません'};
  if(a.lifeStage!=='adult'||b.lifeStage!=='adult')return{ok:false,msg:'成鳥だけ交配できます'};
  if(!a.sexKnown||a.sex!=='male'||!b.sexKnown||b.sex!=='female')return{ok:false,msg:'性別判定済みのオスとメスを選択'};
  const speciesOk=(a.species.startsWith('buncho_')&&b.species.startsWith('buncho_'))||(a.species===b.species&&BREED_BIRDS.has(a.species));
  if(!speciesOk)return{ok:false,msg:'文鳥系同士、または同じ種類同士で交配できます'};
  if(a.id===b.fatherId||a.id===b.motherId||b.id===a.fatherId||b.id===a.motherId)return{ok:false,msg:'親子の交配はできません'};
  const ap=[a.fatherId,a.motherId].filter(Boolean),bp=[b.fatherId,b.motherId].filter(Boolean);
  if(ap.some(x=>bp.includes(x)))return{ok:false,msg:'きょうだいの交配はできません'};
  return{ok:true,msg:'交配できます'};
}
function breedingBusySet(){const s=new Set();for(const j of N.breeding?.jobs||[]){if(j.status==='running'){s.add(String(j.malePetId));s.add(String(j.femalePetId))}}return s}
function fmtRemain(iso){
  const ms=Math.max(0,Date.parse(iso||0)-Date.now()),sec=Math.ceil(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
  return h>0?`${h}時間${m}分`:`${m}分${String(s).padStart(2,'0')}秒`;
}
function breedingUi(){
  const toolbar=document.querySelector('.v72-companion-toolbar');
  if(toolbar&&!document.getElementById('openBreedingBtn')){
    const b=document.createElement('button');b.type='button';b.id='openBreedingBtn';b.className='modal-btn breeding-open-btn';b.textContent='🪺 交配';b.onclick=openBreeding;toolbar.appendChild(b);
  }
  if(document.getElementById('breedingModal'))return;
  const m=document.createElement('div');m.id='breedingModal';m.className='modal';
  m.innerHTML='<div class="modal-content breeding-modal"><div class="breeding-head"><div><small>GENETIC BREEDING</small><div class="modal-title">🪺 交配・遺伝</div></div><button data-breed-close>×</button></div><p class="breeding-note">性別判定済みの成鳥からオスとメスを選択。交配は3〜24時間、卵は産まれてから2〜10時間で孵化します。子は両親の遺伝子・色・体格・能力傾向を受け継ぎます。</p><div id="breedingJobs"></div><div class="breeding-pair-grid"><section><h3>♂ オス</h3><div id="breedMaleList" class="breed-pet-list"></div></section><section><h3>♀ メス</h3><div id="breedFemaleList" class="breed-pet-list"></div></section></div><div id="breedPairState" class="breed-pair-state"></div><button id="breedStartBtn" class="breed-start-btn">🧬 交配を開始</button><div class="modal-buttons"><button class="modal-btn secondary" data-breed-close>閉じる</button></div></div>';
  document.body.appendChild(m);m.querySelectorAll('[data-breed-close]').forEach(x=>x.onclick=()=>hideModal('breedingModal'));m.querySelector('#breedStartBtn').onclick=startBreedingNow;
}
async function openBreeding(){
  breedingUi();if(identityUser){N.last=0;await refresh(true)}renderBreeding();showModal('breedingModal');
}
function breedPetCard(p,selected,busy){
  const m=meta(p),ph=p.phenotype||{},gene=p.generation>0?` ・ G${p.generation}`:'';
  return `<button class="breed-pet ${selected?'selected':''}" data-breed-id="${escapeHtml(p.id)}" ${busy?'disabled':''}><span>${escapeHtml(m.b.icon)}</span><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(m.b.name)}${gene} ・ ${p.rarity}</small><em>${busy?'交配中':ph.colorName?'遺伝色 '+escapeHtml(ph.colorName):'選択'}</em></div></button>`;
}
function renderBreeding(){
  const maleRoot=document.getElementById('breedMaleList'),femaleRoot=document.getElementById('breedFemaleList'),jobsRoot=document.getElementById('breedingJobs'),state=document.getElementById('breedPairState'),start=document.getElementById('breedStartBtn');
  if(!maleRoot||!femaleRoot||!jobsRoot||!state||!start)return;
  if(!identityUser){maleRoot.innerHTML=femaleRoot.innerHTML='<div class="breeding-empty">ログインすると交配できます。</div>';jobsRoot.innerHTML='';start.disabled=true;return}
  const busy=breedingBusySet(),eligible=G.petCollection.filter(p=>p.lifeStage==='adult'&&p.sexKnown&&BREED_BIRDS.has(p.species));
  const males=eligible.filter(p=>p.sex==='male'),females=eligible.filter(p=>p.sex==='female');
  if(N.breedMale&&!males.some(p=>p.id===N.breedMale))N.breedMale=null;if(N.breedFemale&&!females.some(p=>p.id===N.breedFemale))N.breedFemale=null;
  maleRoot.innerHTML=males.length?males.map(p=>breedPetCard(p,p.id===N.breedMale,busy.has(String(p.id)))).join(''):'<div class="breeding-empty">性別判定済みのオスがいません</div>';
  femaleRoot.innerHTML=females.length?females.map(p=>breedPetCard(p,p.id===N.breedFemale,busy.has(String(p.id)))).join(''):'<div class="breeding-empty">性別判定済みのメスがいません</div>';
  maleRoot.querySelectorAll('[data-breed-id]:not([disabled])').forEach(b=>b.onclick=()=>{N.breedMale=b.dataset.breedId;renderBreeding()});
  femaleRoot.querySelectorAll('[data-breed-id]:not([disabled])').forEach(b=>b.onclick=()=>{N.breedFemale=b.dataset.breedId;renderBreeding()});
  const jobs=N.breeding?.jobs||[];
  jobsRoot.innerHTML=jobs.length?`<section class="breeding-running"><h3>🪺 交配中</h3>${jobs.map(j=>{const m=G.petCollection.find(p=>p.id===j.malePetId),f=G.petCollection.find(p=>p.id===j.femalePetId);return`<article><div><b>${escapeHtml(m?.name||'オス')} × ${escapeHtml(f?.name||'メス')}</b><small>卵ができるまで</small></div><strong data-breed-end="${escapeHtml(j.completesAt)}">${fmtRemain(j.completesAt)}</strong></article>`}).join('')}</section>`:'';
  const m=G.petCollection.find(p=>p.id===N.breedMale),f=G.petCollection.find(p=>p.id===N.breedFemale),check=breedCompatible(m,f);
  state.className='breed-pair-state '+(check.ok?'ok':'');
  state.innerHTML=`<span>${check.ok?'🧬':'ℹ️'}</span><div><b>${escapeHtml(check.msg)}</b><small>${check.ok?`${escapeHtml(m.name)} × ${escapeHtml(f.name)} / 子の遺伝子は両親から1本ずつ継承`:'性別判定は鳥のプロフィールからできます'}</small></div>`;
  start.disabled=!check.ok||busy.has(String(m?.id))||busy.has(String(f?.id));
}
async function startBreedingNow(){
  const m=G.petCollection.find(p=>p.id===N.breedMale),f=G.petCollection.find(p=>p.id===N.breedFemale),check=breedCompatible(m,f);if(!check.ok)return showToast(check.msg,'warning');
  const btn=document.getElementById('breedStartBtn');btn.disabled=true;btn.textContent='開始中…';
  try{
    const r=await api('startBreeding',{malePetId:m.id,femalePetId:f.id});apply(r.data);N.breedMale=N.breedFemale=null;renderBreeding();
    showToast(`🪺 交配開始！ 卵まで約${fmtRemain(r.breedingJob?.completesAt)}`,'achievement');
  }catch(e){showToast(e.message||'交配を開始できませんでした','warning');await refresh(true);renderBreeding()}
  finally{btn.textContent='🧬 交配を開始'}
}
function updateBreedCountdowns(){
  document.querySelectorAll('[data-breed-end]').forEach(el=>el.textContent=fmtRemain(el.dataset.breedEnd));renderLifeStagePresence();
  if(!identityUser||document.hidden||N.busy)return;
  const now=Date.now(),dueJob=(N.breeding?.jobs||[]).some(j=>Date.parse(j.completesAt||0)<=now),dueEgg=G.petCollection.some(p=>p.lifeStage==='egg'&&Date.parse(p.hatchAt||0)<=now),dueAdult=G.petCollection.some(p=>p.lifeStage==='chick'&&Date.parse(p.adultLatestAt||0)<=now);
  if((dueJob||dueEgg||dueAdult)&&now-Number(N.lifecycleDueRefreshAt||0)>5000){N.lifecycleDueRefreshAt=now;N.last=0;refresh(true)}
}
function lifecycleUi(){
  if(document.getElementById('lifeReveal'))return;
  const e=document.createElement('div');e.id='lifeReveal';e.className='life-reveal';e.innerHTML='<div class="life-reveal-glow"></div><div class="life-reveal-card"><small id="lifeRevealKicker">NEW LIFE</small><div id="lifeRevealIcon" class="life-reveal-icon">🥚</div><h2 id="lifeRevealTitle"></h2><p id="lifeRevealCopy"></p><div id="lifeRevealTraits"></div><button id="lifeRevealOk">確認する</button></div>';document.body.appendChild(e);document.getElementById('lifeRevealOk').onclick=closeLifeReveal;
}
function queueLifecycleEvents(events){
  if(!Array.isArray(events)||!events.length)return;
  const known=new Set([...(N.eventQueue||[]).map(e=>e.id),N.currentLifeEvent?.id].filter(Boolean));
  for(const ev of events)if(ev?.id&&!known.has(ev.id)){N.eventQueue.push(ev);known.add(ev.id)}
  showNextLifeEvent();
}
function showNextLifeEvent(){
  if(N.eventBusy||!N.eventQueue.length)return;N.eventBusy=true;N.currentLifeEvent=N.eventQueue.shift();lifecycleUi();
  const ev=N.currentLifeEvent,p=G.petCollection.find(x=>x.id===ev.petId),type=ev.type,ph=p?.phenotype||ev.payload?.phenotype||{},icon=type==='egg_laid'?'🥚':type==='hatched'?'🐣':meta(p||{}).b.icon;
  document.getElementById('lifeRevealKicker').textContent=type==='egg_laid'?'EGG ARRIVED':type==='hatched'?'HATCHED':'GROWN UP';
  document.getElementById('lifeRevealIcon').textContent=icon;
  document.getElementById('lifeRevealTitle').textContent=type==='egg_laid'?'卵が生まれた！':type==='hatched'?'雛が生まれた！':'成鳥になった！';
  document.getElementById('lifeRevealCopy').textContent=type==='egg_laid'?`鳥一覧に卵が追加されました。孵化まで ${fmtRemain(p?.hatchAt)}。`:type==='hatched'?`${p?.name||'雛'}が孵化しました。お世話すると成長が早まります。`:`${p?.name||'鳥'}が成鳥になりました。性別判定後、次の世代へ交配できます。`;
  document.getElementById('lifeRevealTraits').innerHTML=ph.colorName?`<span>🎨 ${escapeHtml(ph.colorName)}</span><span>📏 ${escapeHtml(ph.sizeClass||'標準')}</span><span>💚 ${escapeHtml(ph.personality||'個性的')}</span>`:'';
  document.getElementById('lifeReveal').classList.add('show');
}
async function closeLifeReveal(){
  const ev=N.currentLifeEvent;document.getElementById('lifeReveal')?.classList.remove('show');
  if(ev&&identityUser)try{await api('ackLifecycleEvent',{eventId:ev.id})}catch(e){}
  if(N.breeding?.events)N.breeding.events=N.breeding.events.filter(x=>x.id!==ev?.id);
  N.currentLifeEvent=null;N.eventBusy=false;setTimeout(showNextLifeEvent,180);
}
function stageUi(){
  if(document.getElementById('lifeStageDock'))return;
  const d=document.createElement('div');d.id='lifeStageDock';d.className='life-stage-dock';d.addEventListener('click',e=>e.stopPropagation());document.querySelector('.main-display')?.appendChild(d);
}
function renderLifeStagePresence(){
  stageUi();const p=active(),d=document.getElementById('lifeStageDock'),main=document.querySelector('.main-display');if(!d||!main)return;
  if(p.lifeStage==='adult'){d.classList.remove('show');d.innerHTML='';main.classList.remove('life-stage-active');return}
  main.classList.add('life-stage-active');d.classList.add('show');
  if(p.lifeStage==='egg'){
    d.innerHTML=`<div class="stage-big">🥚</div><div><small>GENERATION ${p.generation}</small><b>孵化を待っています</b><em>あと ${fmtRemain(p.hatchAt)}</em></div>`;
  }else{
    const gp=Number(p.growthPoints||0),earliest=Date.parse(p.adultEarliestAt||0),ready=gp>=6&&Date.now()>=earliest;
    d.innerHTML=`<div class="stage-big chick">🐣</div><div><small>GENERATION ${p.generation}</small><b>雛を育てよう</b><em>成長ポイント ${gp}/6 ${ready?'・もうすぐ成鳥！':earliest>Date.now()?'・最短 '+fmtRemain(p.adultEarliestAt):'・お世話で成長'}</em></div>`;
  }
}
function fusionUi(){
  const toolbar=document.querySelector('.v72-companion-toolbar');
  if(toolbar&&!document.getElementById('openFusionBtn')){
    const b=document.createElement('button');b.type='button';b.id='openFusionBtn';b.className='modal-btn fusion-open-btn';b.textContent='🧬 手動合成';b.onclick=openFusion;toolbar.appendChild(b);
  }
  if(document.getElementById('fusionModal'))return;
  const m=document.createElement('div');m.id='fusionModal';m.className='modal';
  m.innerHTML='<div class="modal-content fusion-modal"><div class="fusion-head"><div><small>MANUAL FUSION</small><div class="modal-title">🧬 文鳥を手動合成</div></div><button data-fusion-close>×</button></div><p class="fusion-note">①強化するメインの鳥を選択 → ②同じ種類の素材を好きな数だけ選択。名前変更済み・卵・雛・交配中・訪問中・家系図の親個体・装備中の素材は保護されます。</p><div id="fusionGroups"></div><div class="modal-buttons"><button class="modal-btn secondary" data-fusion-close>閉じる</button></div></div>';
  document.body.appendChild(m);m.querySelectorAll('[data-fusion-close]').forEach(b=>b.onclick=()=>hideModal('fusionModal'));
}
function fusionProtectedSets(){
  const away=new Set(N.visits.outgoing.map(v=>String(v.pet?.id||''))),busy=breedingBusySet(),parents=new Set(G.petCollection.flatMap(x=>[x.fatherId,x.motherId]).filter(Boolean).map(String));
  return{away,busy,parents};
}
function fusionTargets(){
  ensure();const {away,busy}=fusionProtectedSets();
  return G.petCollection.filter(p=>p.lifeStage==='adult'&&!p.customNamed&&!String(p.id).startsWith('local-')&&!away.has(String(p.id))&&!busy.has(String(p.id))&&Number(p.fusionLevel||0)<20);
}
function fusionMaterialsFor(target){
  if(!target)return[];const{away,busy,parents}=fusionProtectedSets(),capacity=Math.max(0,20-Number(target.fusionLevel||0));
  return G.petCollection.filter(p=>
    String(p.id)!==String(target.id)&&p.species===target.species&&p.lifeStage==='adult'&&!p.customNamed&&!String(p.id).startsWith('local-')&&
    !away.has(String(p.id))&&!busy.has(String(p.id))&&Number(p.fusionLevel||0)===0&&String(p.id)!==String(G.activePetId)&&!parents.has(String(p.id))
  ).slice(0,Math.max(40,capacity));
}
function renderFusionPet(p,mode,selected=false){
  const m=meta(p),dna=p.generation>0?' ・ G'+p.generation:'',lv=Number(p.fusionLevel||0);
  return `<button class="fusion-pick ${selected?'selected':''}" data-fusion-${mode}="${escapeHtml(p.id)}"><span>${escapeHtml(m.b.icon)}</span><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(m.b.name)} ・ ${p.rarity} / Rank ${p.rank}${dna}</small><em>${lv?'🧬 合成Lv '+lv:'未強化'}</em></div>${selected?'<i>✓</i>':''}</button>`;
}
function renderFusion(){
  const root=document.getElementById('fusionGroups');if(!root)return;
  if(!identityUser){root.innerHTML='<div class="fusion-empty"><span>☁️</span><b>ログインすると合成できます</b><small>合成はサーバー上で安全に処理します。</small></div>';return}
  const targets=fusionTargets();
  if(N.fusionTarget&&!targets.some(p=>String(p.id)===String(N.fusionTarget))){N.fusionTarget=null;N.fusionMaterials.clear()}
  const target=targets.find(p=>String(p.id)===String(N.fusionTarget))||null;
  if(!target){
    root.innerHTML='<section class="fusion-step"><header><span>1</span><div><b>強化するメイン文鳥を選ぶ</b><small>この鳥は消えず、能力と合成Lvが上がります。</small></div></header><div class="fusion-pick-list">'+(targets.length?targets.map(p=>renderFusionPet(p,'target')).join(''):'<div class="fusion-empty"><span>🐦</span><b>メインにできる鳥がいません</b><small>名前変更済み・卵・雛・交配中などは対象外です。</small></div>')+'</div></section>';
    root.querySelectorAll('[data-fusion-target]').forEach(b=>b.onclick=()=>{N.fusionTarget=b.dataset.fusionTarget;N.fusionMaterials.clear();renderFusion()});
    return;
  }
  const mats=fusionMaterialsFor(target),capacity=Math.max(0,20-Number(target.fusionLevel||0));
  for(const id of [...N.fusionMaterials])if(!mats.some(p=>String(p.id)===String(id)))N.fusionMaterials.delete(id);
  const selected=mats.filter(p=>N.fusionMaterials.has(String(p.id))).slice(0,capacity),m=meta(target);
  root.innerHTML=`<section class="fusion-step target-set"><header><span>1</span><div><b>メイン文鳥</b><small>変更する場合は「選び直す」</small></div><button id="fusionResetTarget">選び直す</button></header>${renderFusionPet(target,'locked',true)}</section>
  <section class="fusion-step"><header><span>2</span><div><b>素材にする鳥を選ぶ</b><small>同じ種類のみ。最大 ${capacity}羽 / 選択 ${selected.length}羽</small></div></header><div class="fusion-pick-list materials">${mats.length?mats.map(p=>renderFusionPet(p,'material',N.fusionMaterials.has(String(p.id)))).join(''):'<div class="fusion-empty"><span>🔒</span><b>使える素材がありません</b><small>名前変更済みや家系図の親個体などは保護されています。</small></div>'}</div></section>
  <section class="fusion-confirm"><div><span>${escapeHtml(m.b.icon)}</span><div><small>合成結果</small><b>${escapeHtml(target.name)}　Lv ${Number(target.fusionLevel||0)} → ${Number(target.fusionLevel||0)+selected.length}</b><em>能力 +${(selected.length*2.5).toFixed(1)} / 各主要能力</em></div></div><button id="fusionExecute" ${selected.length?'':'disabled'}>🧬 選択した ${selected.length}羽を合成</button></section>`;
  document.getElementById('fusionResetTarget').onclick=()=>{N.fusionTarget=null;N.fusionMaterials.clear();renderFusion()};
  root.querySelectorAll('[data-fusion-material]').forEach(b=>b.onclick=()=>{const id=b.dataset.fusionMaterial;if(N.fusionMaterials.has(id))N.fusionMaterials.delete(id);else if(N.fusionMaterials.size<capacity)N.fusionMaterials.add(id);else showToast('これ以上選べません','warning');renderFusion()});
  document.getElementById('fusionExecute').onclick=()=>fuseManual(target,selected);
}
function openFusion(){fusionUi();N.fusionTarget=null;N.fusionMaterials.clear();renderFusion();showModal('fusionModal')}
async function fuseManual(target,materials){
  if(!target||!materials?.length||!identityUser)return;
  if(!confirm(`${target.name}をメインに、選択した${materials.length}羽を合成します。\n素材の鳥は消えます。\n\n合成Lv ${Number(target.fusionLevel||0)} → ${Number(target.fusionLevel||0)+materials.length}`))return;
  const root=document.getElementById('fusionGroups');root?.classList.add('busy');
  try{
    const z=await api('fusePets',{targetPetId:target.id,materialPetIds:materials.map(p=>p.id)});
    apply(z.data);N.fusionTarget=z.fusion?.targetId||target.id;N.fusionMaterials.clear();renderFusion();collection();
    showToast(`🧬 合成成功！ ${target.name}が合成Lv ${z.fusion?.fusionLevel||Number(target.fusionLevel||0)+materials.length}になりました`,'achievement');
  }catch(e){showToast(e.message||'合成に失敗しました','warning');await refresh(true);renderFusion()}
  finally{root?.classList.remove('busy')}
}
function fusionHint(){
  if(!identityUser)return;
  const groups=fusionGroups();if(groups.length)setTimeout(()=>showToast(`🧬 被りが${groups.reduce((n,g)=>n+g.materials.length,0)}羽あります。仲間一覧から合成できます`,'achievement'),1100);
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
  const away=new Set(N.visits.outgoing.map(v=>v.pet?.id)),breeding=breedingBusySet();
  g.innerHTML=sortedPets().map((p,index)=>{
    const stage=p.lifeStage||'adult',sel=p.id===G.activePetId;
    if(stage==='egg'){
      return `<button class="pet-card stage-egg mystery-egg ${sel?'selected':''}" data-p="${escapeHtml(p.id)}" style="--pet-i:${index}"><span class="pet-rarity hidden-rarity">?</span><span class="pet-stars">•••</span><span class="pet-icon">🥚</span><b>なぞの卵</b><small>種類・ランク・見た目は孵化するまで不明</small><em>🥚 孵化まで ${fmtRemain(p.hatchAt)}</em></button>`;
    }
    const{b,r,stars}=meta(p),rate=Number(p.stats?.rating||0);
    const stageInfo=stage==='chick'? `🐣 雛 ・ 成長 ${Number(p.growthPoints||0)}/6`:p.customNamed?'🔒 名前保護':breeding.has(String(p.id))?'🪺 交配中':away.has(p.id)?'🧳 おでかけ中':sel?'● いま一緒':'タップで選択';
    const dna=p.generation>0?` ・ G${p.generation}${p.phenotype?.colorName?' / '+escapeHtml(p.phenotype.colorName):''}`:'';
    return`<button class="pet-card rarity-${r.toLowerCase()} ${sel?'selected':''} ${p.customNamed?'name-protected':''} stage-${stage}" data-p="${escapeHtml(p.id)}" style="--pet-i:${index}"><span class="pet-rarity">${r}</span><span class="pet-stars">${stars}</span><span class="pet-icon">${escapeHtml(b.icon)}</span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(b.name)} ・ 個体ランク ${p.rank}${dna}${Number(p.fusionLevel||0)>0?' ・ 🧬合成Lv '+Number(p.fusionLevel):''}${rate&&stage==='adult'?' ・ RATING '+rate:''}</small><em>${stageInfo}</em></button>`;
  }).join('');
  g.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>choose(b.dataset.p));
}
async function choose(pid){let p=G.petCollection.find(x=>x.id===pid);if(!p)return;G.activePetId=p.id;G.species=p.species;G.name=p.name;G.birdNames[p.species]=p.name;save();updateUI();collection();if(identityUser&&!pid.startsWith('local-'))try{apply((await api('selectPet',{petId:pid})).data)}catch(e){showToast(e.message,'warning')}hideModal('birdModal')}
function localGacha(n){const b=currentBanner(),cost=n===10?Number(b.price10||0):Number(b.price1||0);G.coins-=cost;let a=Array.from({length:n},(_,i)=>{let s=draw(b.speciesWeights),r=drawR(n===10&&i===9?'R':'N',b.rates);return norm({species:s,name:birds[s].name,rarity:r,rank:RR[r][0],source:'gacha'})});G.petCollection.push(...a);return a}
async function gacha(n){n=n===10?10:1;const banner=currentBanner(),cost=n===10?Number(banner.price10||0):Number(banner.price1||0);if(G.coins<cost)return showToast('💰が足りません','warning');document.querySelectorAll('[data-g]').forEach(b=>b.disabled=true);try{let a;if(identityUser){let rec={version:'7.2.1',savedAt:new Date().toISOString(),data:stateForStorage()},r=await fetch('/api/cloud-save',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(rec)}),j=await r.json().catch(()=>({}));if(r.ok){let z=await api('gacha',{count:n,bannerId:banner.id});if(z.gameState)G=normalizeGameState({...G,...z.gameState});apply(z.data);a=(z.results||[]).map(norm)}else if(j.configured===false){showToast('クラウド未接続: この端末だけのガチャ','warning');a=localGacha(n)}else throw Error(j.message||'同期に失敗しました')}else a=localGacha(n);if(a?.length){reveal(a);save();updateUI();collection();fusionHint()}}catch(e){showToast(e.message||'ガチャに失敗しました','warning')}finally{document.querySelectorAll('[data-g]').forEach(b=>b.disabled=false)}}
function reveal(a){ui();clearTimeout(timer);let w=document.getElementById('gachaReveal'),hi=Math.max(...a.map(x=>x.rank)),top=Object.keys(RR).find(k=>RR[k][0]===hi)||'N';w.className=`gacha-reveal show rarity-${top.toLowerCase()}`;w.querySelector('.gacha-results').innerHTML=a.map((p,i)=>{const m=meta(p),r=rar(p.rarity),stars=RR[r]?.[1]||'★',speciesName=p.speciesName||m.b.name,icon=p.icon||m.b.icon;return`<article class="gacha-result rarity-${r.toLowerCase()}" data-pet-id="${escapeHtml(p.id)}" style="--i:${i}"><span class="result-rarity">${r}</span><span class="result-stars">${stars}</span><div class="result-icon">${escapeHtml(icon)}</div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(speciesName)} ・ 個体ランク ${p.rank}</small></article>`}).join('');timer=setTimeout(()=>w.classList.add('revealed'),850)}
function closeReveal(force=false){clearTimeout(timer);let w=document.getElementById('gachaReveal');if(!force&&!w.classList.contains('revealed'))return w.classList.add('revealed');w.className='gacha-reveal'}
async function api(action,payload={}){let r=await fetch('/api/pets',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action,payload})}),j=await r.json().catch(()=>({}));if(!r.ok){let e=Error(j.message||`HTTP ${r.status}`);e.configured=j.configured;throw e}return j}
function apply(d){if(!d)return;N.mode='cloud';N.last=Date.now();if(d.gachaConfig){N.gachaConfig=d.gachaConfig;renderGachaHub()}N.friends=d.friends||[];N.requests=d.requests||{incoming:[],outgoing:[]};N.visits=d.visits||{incoming:[],outgoing:[]};N.breeding=d.breeding||{jobs:[],events:[]};socialState.friends=N.friends;if(d.playerId)socialState.playerId=d.playerId;syncPets(d.pets);if((d.newUnlocks||[]).includes('fuga'))showToast('🎁 通常どうぶつコンプリート！ 隠しキャラ「ふうが」解放！','achievement');social();presence();renderLifeStagePresence();queueLifecycleEvents(N.breeding.events);if(document.getElementById('birdModal')?.classList.contains('show'))collection();if(document.getElementById('breedingModal')?.classList.contains('show'))renderBreeding()}
async function refresh(force=false){if(!identityUser||N.busy||(!force&&Date.now()-N.last<8000))return;N.busy=true;try{apply((await api('dashboard')).data)}catch(e){if(e.configured===false)N.mode='local'}finally{N.busy=false}}
function visitUi(){let f=document.getElementById('socialFriendsTab');if(f&&!document.getElementById('friendRequests')){let x=document.createElement('div');x.id='friendRequests';x.className='friend-request-box';f.insertBefore(x,document.getElementById('friendList'))}let t=document.querySelector('.social-tabs');if(t&&!t.querySelector('[data-social-tab="visits"]')){let b=document.createElement('button');b.dataset.socialTab='visits';b.textContent='🧳 訪問';b.onclick=()=>setSocialTab('visits');t.appendChild(b);let p=document.createElement('div');p.id='socialVisitsTab';p.className='social-tab-page';p.innerHTML='<div id="visitList"></div>';t.parentNode.appendChild(p)}
if(!document.getElementById('visitModal')){let m=document.createElement('div');m.id='visitModal';m.className='modal';m.innerHTML='<div class="modal-content visit-dispatch-modal"><div class="modal-title">🐦 遊びに行かせる</div><p id="visitCopy" class="visit-copy"></p><div id="visitChoices" class="visit-pet-choices"></div><div class="modal-buttons"><button class="modal-btn secondary" data-x>キャンセル</button><button class="modal-btn primary" id="visitGo">12時間の訪問を開始</button></div></div>';document.body.appendChild(m);m.querySelector('[data-x]').onclick=()=>hideModal('visitModal');m.querySelector('#visitGo').onclick=startVisit}
if(!document.getElementById('visitGuestLive')){let b=document.createElement('div');b.id='visitGuestLive';b.className='visit-guest-live';b.addEventListener('click',e=>e.stopPropagation());document.querySelector('.main-display')?.appendChild(b)}if(!document.getElementById('petAwayOverlay')){let d=document.createElement('div');d.id='petAwayOverlay';d.className='pet-away-overlay';document.querySelector('.main-display')?.appendChild(d)}}
function social(){visitUi();requests();friends();visits()}
function requests(){let b=document.getElementById('friendRequests');if(!b)return;if(!identityUser){b.hidden=true;return}b.hidden=false;let i=N.requests.incoming||[],o=N.requests.outgoing||[];b.innerHTML=`<b>フレンド申請</b><small>相手の承認後にフレンドになります</small>${i.map(x=>`<div class="request-row"><span>${escapeHtml(x.player?.displayName||x.player?.playerId||'')}</span><span><button data-ok="${x.id}">承認</button><button class="quiet" data-no="${x.id}">断る</button></span></div>`).join('')||'<div class="request-empty">届いている申請はありません</div>'}${o.length?`<div class="outgoing-requests">申請中 ${o.length}件</div>`:''}`;b.querySelectorAll('[data-ok]').forEach(x=>x.onclick=()=>answer(x.dataset.ok,true));b.querySelectorAll('[data-no]').forEach(x=>x.onclick=()=>answer(x.dataset.no,false))}
async function answer(i,a){try{apply((await api('respondFriendRequest',{requestId:i,accept:a})).data);showToast(a?'フレンドになりました！':'申請を断りました',a?'achievement':'')}catch(e){showToast(e.message,'warning')}}
function debugFriend(){
  return {playerId:DEBUG_FRIEND_CODE,displayName:'デバッグ飼育員',character:{icon:'🐦',name:'デバッグ文鳥',species:'buncho_sakura'},debug:true};
}
function friendPool(){const base=N.friends.slice();if(N.adminFriend&&N.admin&&!base.some(f=>f.admin))base.unshift(adminFriend());if(DEV_MODE&&N.debugFriend&&!base.some(f=>f.playerId===DEBUG_FRIEND_CODE))base.unshift(debugFriend());return base}
function friends(){
  if(!identityUser&&!DEV_MODE)return O.renderFriendList();
  const l=document.getElementById('friendList');if(!l)return;const pool=friendPool();
  l.innerHTML=pool.length?pool.map(f=>`<div class="friend-card friend-card-v5 ${f.debug?'debug-friend':''} ${f.admin?'admin-friend':''}"><div class="friend-avatar">${escapeHtml(f.character?.icon||'🐦')}</div><div class="friend-main"><b>${escapeHtml(f.character?.name||f.displayName)}</b><small>${escapeHtml(f.displayName||'')} ・ ${escapeHtml(f.playerId)}</small></div><div class="friend-actions">${f.admin?'<button data-admin-open>🔐 管理者モード</button>':f.debug?'<button data-debug-open>🧪 デバッグ</button>':`<button data-view="${f.playerId}">🏠 見る</button><button data-visit="${f.playerId}">🐦 訪問</button>`}</div></div>`).join(''):'<div class="social-empty">IDで申請し、相手が承認するとフレンドになります。</div>';
  l.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>openFriendPet(x.dataset.view));
  l.querySelectorAll('[data-visit]').forEach(x=>x.onclick=()=>dispatch(x.dataset.visit));
  l.querySelectorAll('[data-debug-open]').forEach(x=>x.onclick=openDebugPanel);l.querySelectorAll('[data-admin-open]').forEach(x=>x.onclick=openAdminPanel);
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
const adminApi=async(action,payload={})=>{const r=await fetch('/api/admin',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...payload})}),j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.message||'管理操作に失敗しました');return j.data};
function adminFriend(){return {playerId:'MF-ADMIN',displayName:'Mofumori Administration',character:{icon:'🐦',name:'管理者文鳥',species:'buncho_sakura'},admin:true}}
function rememberAdminBird(data){
  N.admin=data;N.adminFriend=true;localStorage.setItem('mofumoriAdminBird','1');sessionStorage.setItem('mofumoriAdminBird','1');friends();
}
async function summonAdminBird(persist=true,silent=false){
  try{const data=await adminApi(persist?'summonBird':'status');rememberAdminBird(data);if(!silent)showToast('管理者文鳥が現れました 🔐🐦','achievement');return true}
  catch(e){N.adminFriend=false;localStorage.removeItem('mofumoriAdminBird');sessionStorage.removeItem('mofumoriAdminBird');if(!silent)showToast('そのプレイヤーには管理者権限がありません','warning');return false}
}
async function restoreAdminBird(){
  if(!identityUser)return false;
  try{
    let data=await adminApi('status');
    const localKnown=localStorage.getItem('mofumoriAdminBird')==='1'||sessionStorage.getItem('mofumoriAdminBird')==='1';
    if(data?.adminBirdEnabled===true){rememberAdminBird(data);return true}
    if(localKnown){data=await adminApi('summonBird');rememberAdminBird(data);return true}
  }catch(e){
    if(N.adminFriend){N.adminFriend=false;friends()}
  }
  return false;
}
function adminUi(){
  if(document.getElementById('adminModeModal'))return;
  const m=document.createElement('div');m.id='adminModeModal';m.className='modal';
  m.innerHTML='<div class="modal-content v721-admin-modal"><div class="v721-admin-head"><div><small>SERVER AUTHORIZED</small><div class="modal-title">🔐 管理者モード</div></div><button data-admin-close>×</button></div><div id="adminRoleState"></div><div class="v721-admin-tabs"><button data-atab="gacha" class="active">ガチャ</button><button data-atab="economy">通貨</button><button data-atab="diag">診断</button></div><div id="adminModeBody"></div></div>';
  document.body.appendChild(m);m.querySelector('[data-admin-close]').onclick=()=>hideModal('adminModeModal');m.querySelectorAll('[data-atab]').forEach(b=>b.onclick=()=>renderAdminTab(b.dataset.atab));
}
async function openAdminPanel(){
  try{adminUi();N.admin=await adminApi('status');showModal('adminModeModal');renderAdminTab('gacha')}catch(e){showToast(e.message,'warning')}
}
function renderAdminTab(tab){
  const root=document.getElementById('adminModeBody');if(!root||!N.admin)return;document.querySelectorAll('[data-atab]').forEach(b=>b.classList.toggle('active',b.dataset.atab===tab));
  const state=document.getElementById('adminRoleState');if(state)state.innerHTML=`<span>ROLE</span><b>${escapeHtml(N.admin.role||'admin')}</b>`;
  if(tab==='economy'){
    root.innerHTML=`<section class="v721-admin-card"><h3>💰 通貨付与 / 回収</h3><label>対象プレイヤーID<input id="adminCurrencyPlayer" maxlength="16" value="${escapeHtml(socialState?.playerId||'')}" placeholder="MF-XXXXXXXX"></label><div class="v721-admin-grid"><label>コイン増減<input id="adminCoinsDelta" type="number" value="1000"></label><label>ジェム増減<input id="adminGemsDelta" type="number" value="0"></label></div><button id="adminApplyCurrency">反映</button><pre id="adminCurrencyResult"></pre></section>`;
    document.getElementById('adminApplyCurrency').onclick=async()=>{try{const target=document.getElementById('adminCurrencyPlayer').value.trim().toUpperCase(),d=await adminApi('adjustCurrency',{playerId:target,coinsDelta:Number(document.getElementById('adminCoinsDelta').value||0),gemsDelta:Number(document.getElementById('adminGemsDelta').value||0)});document.getElementById('adminCurrencyResult').textContent=JSON.stringify(d,null,2);if(target===String(socialState?.playerId||'').toUpperCase()){G.coins=Number(d.coins||0);G.gems=Number(d.gems||0);save();updateUI()}showToast('通貨を更新しました','achievement')}catch(e){showToast(e.message,'warning')}};return;
  }
  if(tab==='diag'){
    root.innerHTML='<section class="v721-admin-card"><h3>🧪 サーバー診断</h3><button id="adminRunDiag">診断を取得</button><pre id="adminDiagResult">未取得</pre></section>';
    document.getElementById('adminRunDiag').onclick=async()=>{try{document.getElementById('adminDiagResult').textContent=JSON.stringify(await adminApi('diagnostics'),null,2)}catch(e){showToast(e.message,'warning')}};return;
  }
  renderAdminGacha(root);
}
function renderAdminGacha(root){
  const source=N.admin.gacha||N.gachaConfig||{activeBanner:'standard',banners:[]};
  const cfg=typeof structuredClone==='function'?structuredClone(source):JSON.parse(JSON.stringify(source));
  N.adminEdit=cfg;let selected=cfg.activeBanner||cfg.banners?.[0]?.id||'';
  const shell=()=>{root.innerHTML=`<section class="v721-admin-card"><div class="v721-admin-row"><h3>✨ ガチャ管理</h3><button id="adminAddBanner">＋ 新ガチャ</button></div><label>編集するガチャ<select id="adminBannerSelect">${(cfg.banners||[]).map(x=>`<option value="${escapeHtml(x.id)}" ${x.id===selected?'selected':''}>${escapeHtml(x.name||x.id)}</option>`).join('')}</select></label><div id="adminBannerEditor"></div><button id="adminSaveGacha">サーバーへ保存</button></section>`;bindShell();renderEditor()};
  const capture=(id=selected)=>{const x=cfg.banners.find(y=>y.id===id);if(!x||!document.getElementById('abName'))return;x.name=document.getElementById('abName').value||x.name;x.enabled=document.getElementById('abEnabled').checked;x.price1=Number(document.getElementById('abP1').value||0);x.price10=Number(document.getElementById('abP10').value||0);x.rates={};document.querySelectorAll('[data-rate]').forEach(el=>x.rates[el.dataset.rate]=Number(el.value||0));try{x.speciesWeights=JSON.parse(document.getElementById('abWeights').value||'{}')}catch(e){throw Error('排出ウェイトJSONが不正です')}};
  const renderEditor=()=>{const x=cfg.banners.find(y=>y.id===selected);if(!x)return;const rates=x.rates||{};document.getElementById('adminBannerEditor').innerHTML=`<label>表示名<input id="abName" value="${escapeHtml(x.name||'')}"></label><label class="v721-admin-check"><input id="abEnabled" type="checkbox" ${x.enabled!==false?'checked':''}> 有効</label><div class="v721-admin-grid"><label>1回価格<input id="abP1" type="number" value="${Number(x.price1||0)}"></label><label>10回価格<input id="abP10" type="number" value="${Number(x.price10||0)}"></label></div><h4>レア度確率（合計100%）</h4><div class="v721-admin-rates">${['N','R','SR','SSR','UR'].map(k=>`<label>${k}<input data-rate="${k}" type="number" step="0.1" value="${Number(rates[k]||0)}"></label>`).join('')}</div><label>排出ウェイト(JSON)<textarea id="abWeights" spellcheck="false">${escapeHtml(JSON.stringify(x.speciesWeights||{},null,2))}</textarea></label><button id="adminDeleteBanner" class="danger">このガチャを削除</button>`;document.getElementById('adminDeleteBanner').onclick=()=>{if(cfg.banners.length<=1)return showToast('最低1つは必要です','warning');cfg.banners=cfg.banners.filter(y=>y.id!==selected);selected=cfg.banners[0].id;cfg.activeBanner=selected;shell()}};
  function bindShell(){
    document.getElementById('adminBannerSelect').onchange=e=>{try{capture(selected)}catch(err){showToast(err.message,'warning');e.target.value=selected;return}selected=e.target.value;cfg.activeBanner=selected;renderEditor()};
    document.getElementById('adminAddBanner').onclick=()=>{try{capture(selected)}catch(err){return showToast(err.message,'warning')}const id='banner_'+Date.now().toString(36);cfg.banners.push({id,name:'新しいガチャ',enabled:true,price1:180,price10:1600,rates:{N:55,R:27,SR:13,SSR:4,UR:1},speciesWeights:{...W}});selected=id;cfg.activeBanner=id;shell()};
    document.getElementById('adminSaveGacha').onclick=async()=>{try{capture(selected);cfg.activeBanner=selected;const data=await adminApi('setGachaConfig',{config:cfg});N.admin.gacha=data;N.gachaConfig=data;N.gachaBanner=data.activeBanner;renderGachaHub();renderAdminGacha(root);showToast('ガチャ設定を保存しました','achievement')}catch(e){showToast(e.message,'warning')}};
  }
  shell();
}
function dispatch(pid){dispatchFriend=N.friends.find(x=>x.playerId===pid);if(!dispatchFriend)return;let busy=new Set([...N.visits.outgoing.map(v=>v.pet?.id),...breedingBusySet()]);document.getElementById('visitCopy').textContent=`${dispatchFriend.displayName||pid} のところへ12時間遊びに行きます。`;let b=document.getElementById('visitChoices');b.innerHTML=G.petCollection.map(p=>{let m=meta(p),off=busy.has(p.id)||p.id.startsWith('local-')||p.lifeStage!=='adult';return`<button ${off?'disabled':''} data-vp="${p.id}" class="rarity-${m.r.toLowerCase()}"><span>${m.b.icon}</span><b>${escapeHtml(p.name)}</b><small>${m.r} ${m.stars}${off?' ・ 利用不可':''}</small></button>`}).join('');dispatchPet=null;b.querySelectorAll('[data-vp]:not([disabled])').forEach(x=>x.onclick=()=>{dispatchPet=x.dataset.vp;b.querySelectorAll('button').forEach(y=>y.classList.toggle('selected',x===y))});showModal('visitModal')}
async function startVisit(){if(!dispatchFriend||!dispatchPet)return showToast('連れていく子を選んでください','warning');try{apply((await api('startVisit',{playerId:dispatchFriend.playerId,petId:dispatchPet})).data);hideModal('visitModal');showToast('遊びに行きました！🧳','achievement')}catch(e){showToast(e.message,'warning')}}
function visits(){let l=document.getElementById('visitList');if(!l)return;if(!identityUser){l.innerHTML='<div class="social-empty">ログインするとフレンド訪問が使えます。</div>';return}let card=(v,inc)=>{let p=v.pet||{},m=meta(p),peer=inc?v.owner:v.host;return`<article class="visit-card rarity-${m.r.toLowerCase()}"><div class="visit-pet-icon">${m.b.icon}</div><div class="visit-info"><b>${escapeHtml(p.name||m.b.name)}</b><small>${inc?'飼い主':'訪問先'}: ${escapeHtml(peer?.displayName||'フレンド')}</small><small>交流 ${v.interactionCount||0}回</small></div>${inc?`<div class="visit-actions">${Object.entries(A).map(([a,n])=>`<button data-act="${a}" data-id="${v.id}">${n}</button>`).join('')}</div>`:`<button class="return-visit" data-back="${v.id}">戻す</button>`}</article>`};l.innerHTML=`<section class="visit-section"><h3>🏠 遊びに来ている子</h3>${N.visits.incoming.map(v=>card(v,true)).join('')||'<div class="social-empty">いません</div>'}</section><section class="visit-section"><h3>🧳 おでかけ中</h3>${N.visits.outgoing.map(v=>card(v,false)).join('')||'<div class="social-empty">いません</div>'}</section>`;l.querySelectorAll('[data-act]').forEach(x=>x.onclick=async()=>{try{apply((await api('interactVisit',{visitId:x.dataset.id,interaction:x.dataset.act})).data);showToast('交流しました！','achievement')}catch(e){showToast(e.message,'warning')}});l.querySelectorAll('[data-back]').forEach(x=>x.onclick=()=>back(x.dataset.back))}
async function back(i){try{apply((await api('endVisit',{visitId:i})).data);showToast('おうちに戻りました')}catch(e){showToast(e.message,'warning')}}
async function careVisitor(visitId,care){
  const g=document.getElementById('visitGuestLive');if(g)g.classList.add('busy');
  try{
    const r=await api('careVisit',{visitId,care});apply(r.data);
    const labels={feed:'ごはん',pet:'なでなで',play:'遊び',bath:'水浴び',treat:'おやつ',sing:'歌'};
    showToast(`🐦 訪問中の子に${labels[care]||'お世話'}しました`,'achievement');
  }catch(e){showToast(e.message||'お世話できませんでした','warning')}
  finally{g?.classList.remove('busy')}
}
function visitorBirdSvg(p){
  const b=birds[p?.species]||birds.buncho_sakura,c=b.colors||birds.buncho_sakura.colors,cheek=b.hasCheek!==false;
  if(b.isCat)return `<svg viewBox="0 0 200 220" aria-hidden="true"><ellipse cx="100" cy="145" rx="51" ry="38" fill="${c.body}"/><circle cx="100" cy="94" r="40" fill="${c.head}"/><path d="M68 68 76 34 92 67M108 67 125 34 132 69" fill="${c.head}"/><ellipse cx="82" cy="96" rx="5" ry="7" fill="#161616"/><ellipse cx="118" cy="96" rx="5" ry="7" fill="#161616"/><path d="M96 110 Q100 114 104 110" stroke="${c.beak}" stroke-width="4" fill="none"/><path d="M146 150 Q178 138 163 174" stroke="${c.tail}" stroke-width="12" fill="none" stroke-linecap="round"/></svg>`;
  if(b.isFox)return `<svg viewBox="0 0 200 220" aria-hidden="true"><ellipse cx="100" cy="146" rx="53" ry="37" fill="${c.body}"/><circle cx="100" cy="92" r="39" fill="${c.head}"/><path d="M66 66 76 28 92 67M108 67 126 28 134 68" fill="${c.head}"/><ellipse cx="100" cy="111" rx="20" ry="15" fill="${c.cheek}"/><circle cx="84" cy="94" r="5" fill="#161616"/><circle cx="116" cy="94" r="5" fill="#161616"/><circle cx="100" cy="108" r="5" fill="#33251f"/><path d="M150 150 Q180 132 174 180 Q157 190 143 170" fill="${c.tail}"/></svg>`;
  if(b.isPenguin)return `<svg viewBox="0 0 200 220" aria-hidden="true"><ellipse cx="100" cy="140" rx="46" ry="53" fill="${c.body}"/><ellipse cx="100" cy="148" rx="29" ry="38" fill="${c.belly}"/><circle cx="100" cy="87" r="36" fill="${c.head}"/><ellipse cx="87" cy="88" rx="5" ry="6" fill="#111"/><ellipse cx="113" cy="88" rx="5" ry="6" fill="#111"/><path d="M92 101 L108 101 100 113Z" fill="${c.beak}"/><ellipse cx="50" cy="137" rx="11" ry="29" fill="${c.wing}"/><ellipse cx="150" cy="137" rx="11" ry="29" fill="${c.wing}"/></svg>`;
  return `<svg viewBox="0 0 200 220" aria-hidden="true"><path d="M83 172 Q70 205 93 190M117 172 Q130 205 107 190" stroke="${c.tail}" stroke-width="12" stroke-linecap="round" fill="none"/><ellipse cx="100" cy="142" rx="48" ry="43" fill="${c.body}"/><ellipse cx="100" cy="153" rx="34" ry="31" fill="${c.belly}"/><ellipse cx="55" cy="137" rx="14" ry="35" fill="${c.wing}" transform="rotate(10 55 137)"/><ellipse cx="145" cy="137" rx="14" ry="35" fill="${c.wing}" transform="rotate(-10 145 137)"/><circle cx="100" cy="86" r="42" fill="${c.head}"/>${cheek?`<circle cx="70" cy="97" r="16" fill="${c.cheek}"/><circle cx="130" cy="97" r="16" fill="${c.cheek}"/>`:''}<circle cx="82" cy="83" r="5" fill="#111"/><circle cx="118" cy="83" r="5" fill="#111"/><circle cx="80.5" cy="81.5" r="1.7" fill="#fff"/><circle cx="116.5" cy="81.5" r="1.7" fill="#fff"/><path d="M88 104 L112 104 100 119Z" fill="${c.beak}"/><path d="M82 181 Q78 191 72 194M118 181 Q122 191 128 194" stroke="${c.feet}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
}
function renderVisitorPresence(){
  const g=document.getElementById('visitGuestLive');if(!g)return;
  const incoming=(N.visits.incoming||[]).filter(v=>v?.pet);
  if(!incoming.length){g.classList.remove('show');g.innerHTML='';return}
  const shown=incoming.slice(0,3);
  g.innerHTML=`<div class="visit-birds-row">${shown.map((v,i)=>{const p=v.pet,m=meta(p),owner=v?.owner?.displayName||'フレンド';return `<div class="visit-bird-unit" data-visit-unit="${escapeHtml(v.id)}" style="--visitor-i:${i}"><div class="visit-bird-render">${visitorBirdSvg(p)}</div><div class="visit-bird-tag"><small>${escapeHtml(owner)}の子</small><b>${escapeHtml(p.name||m.b.name)}</b><span>VISITING</span></div><div class="visit-inline-care">${Object.entries(VCARE).map(([a,icon])=>`<button data-vcare="${a}" data-vid="${escapeHtml(v.id)}" title="${a}">${icon}</button>`).join('')}</div></div>`}).join('')}</div>${incoming.length>3?`<div class="visit-more">＋${incoming.length-3}羽 訪問中</div>`:''}`;
  g.classList.add('show');
  g.querySelectorAll('[data-vcare]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();careVisitor(btn.dataset.vid,btn.dataset.vcare)});
}
function presence(){visitUi();renderVisitorPresence();renderLifeStagePresence();let p=active(),o=N.visits.outgoing.find(v=>v.pet?.id===p.id),d=document.querySelector('.main-display'),z=document.getElementById('petAwayOverlay');d?.classList.toggle('pet-away',!!o);if(z){if(o){z.innerHTML=`<div><span>🧳</span><b>${escapeHtml(p.name)}はおでかけ中</b><small>${escapeHtml(o.host?.displayName||'フレンド')}のところにいます</small><button data-home>呼び戻す</button></div>`;z.classList.add('show');z.querySelector('[data-home]').onclick=()=>back(o.id)}else{z.classList.remove('show');z.innerHTML=''}}document.querySelectorAll('[data-care]').forEach(b=>{b.disabled=!!o||p.lifeStage==='egg'||(G.isSleeping&&b.id!=='sleepBtn')})}

ensureNewSettings=function(){O.ensureNewSettings();ensure()};getCurrentBirdName=function(){return active().name};setCurrentBirdName=function(n){let p=active(),s=String(n||'').trim().slice(0,12)||birds[p.species].name;p.name=s;G.name=s;G.birdNames[p.species]=s;if(identityUser&&!p.id.startsWith('local-'))api('renamePet',{petId:p.id,name:s}).then(x=>apply(x.data)).catch(()=>{})};renderBirdGrid=function(){ui();collection()};updateBuyBtn=function(){let b=document.getElementById('buyBirdBtn');if(b){b.hidden=true;b.disabled=true}};buyBird=function(){gacha(1)};showModal=function(i){O.showModal(i);if(i==='birdModal'){ui();collection()}if(i==='gachaModal'){ui()}};updateUI=function(){ensure();O.updateUI();presence()};renderSocial=function(){O.renderSocial();social()};renderFriendList=function(){identityUser?friends():O.renderFriendList()};addFriendById=async function(){let x=document.getElementById('friendIdInput'),raw=String(x?.value||'').trim(),p=raw.toUpperCase();if(p===ADMIN_BIRD_CODE){if(x)x.value='';if(!identityUser)return showToast('管理者文鳥を呼ぶにはログインしてください','warning');await summonAdminBird(true,false);return}if(DEV_MODE&&p===DEBUG_FRIEND_CODE){N.debugFriend=true;sessionStorage.setItem('mofumoriDebugFriend','1');if(x)x.value='';social();showToast('デバッグ文鳥がフレンドになりました 🧪🐦','achievement');return}if(!identityUser)return O.addFriendById();if(!/^MF-[A-Z0-9]{8,12}$/.test(p))return showToast('IDは MF- に続く8〜12文字で入力してください','warning');try{let r=await api('sendFriendRequest',{playerId:p});x.value='';apply(r.data);showToast(r.autoAccepted?'フレンドになりました！':'フレンド申請を送りました','achievement')}catch(e){showToast(e.message,'warning')}};setSocialTab=function(t){
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
};initIdentityAndSocial=async function(f=false){await O.initIdentityAndSocial(f);ensure();ui();if(identityUser){await refresh(true);await restoreAdminBird()}else social()};logoutGoogle=async function(){await O.logoutGoogle();N.mode='local';N.friends=[];N.requests={incoming:[],outgoing:[]};N.visits={incoming:[],outgoing:[]};social();presence()};
window.mofumoriRefreshPets=()=>{N.last=0;return refresh(true)};
window.render_game_to_text=function(){let b={};try{b=JSON.parse(O.renderText?.()||'{}')}catch(e){}let p=active();return JSON.stringify({...b,pets:{active:{id:p.id,species:p.species,rarity:p.rarity,rank:p.rank},owned:G.petCollection.length,friendRequests:N.requests.incoming.length,visitors:N.visits.incoming.length,away:N.visits.outgoing.length}})};
function boot(){
  N.debugFriend=DEV_MODE&&sessionStorage.getItem('mofumoriDebugFriend')==='1';N.adminFriend=localStorage.getItem('mofumoriAdminBird')==='1'||sessionStorage.getItem('mofumoriAdminBird')==='1';
  ui();ensure();collection();social();presence();loadPublicGachaConfig();if(identityUser)restoreAdminBird();setInterval(updateBreedCountdowns,1000);
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