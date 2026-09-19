(()=>{'use strict';

const GAME={
  flight:{icon:'🪽',name:'飛行バトル',desc:'左右に動いて障害物を避け、より高く登る',stat:'飛行力・体力・敏捷性・体重'},
  kale:{icon:'🥬',name:'小松菜もぐもぐ',desc:'10秒間で小松菜をどれだけ食べられるか',stat:'食いしん坊度・くちばし速度・集中力'},
  perch:{icon:'🪵',name:'とまり木反射',desc:'光ったとまり木へ素早く移動して連続成功を狙う',stat:'敏捷性・バランス・集中力・性格'}
};
const A={dash:null,game:'flight',petId:null,target:null,match:null,refreshing:false,poll:null,matchPoll:null,playing:false,lastProgress:0,gameState:null};
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const logged=()=>typeof identityUser!=='undefined'&&!!identityUser;
const activePet=()=>Array.isArray(G?.petCollection)?(G.petCollection.find(p=>String(p.id)===String(G.activePetId))||G.petCollection[0]):null;
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''));
const isBuncho=p=>String(p?.species||'').startsWith('buncho_');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function clamp(n,a,b){return Math.max(a,Math.min(b,Number(n)||0))}
function stat(p,k,d=50){return Number(p?.stats?.[k]??d)}
function sexLabel(p){return p?.sexKnown?(p.sex==='male'?'♂ オス':'♀ メス'):'？ 未判定'}
function petIcon(p){const b=typeof birds!=='undefined'?birds[p?.species]:null;return b?.icon||'🐦'}
function petName(p){return p?.name||birds?.[p?.species]?.name||'文鳥'}
async function post(url,action,payload={}){
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,payload})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw Object.assign(new Error(j.message||`HTTP ${r.status}`),{status:r.status});
  return j;
}
const arena=(action,payload={})=>post('/api/arena',action,payload);
const pets=(action,payload={})=>post('/api/pets',action,payload);

function mergePets(list){
  if(!Array.isArray(list)||!Array.isArray(G?.petCollection))return;
  for(const remote of list){
    const local=G.petCollection.find(p=>String(p.id)===String(remote.id));
    if(local)Object.assign(local,remote);
  }
  renderOverview();renderPetSheet();
}
function activeArenaPet(){
  const all=A.dash?.pets||[];
  return all.find(p=>String(p.id)===String(A.petId))||all.find(p=>String(p.id)===String(G?.activePetId))||all.find(isBuncho)||null;
}
function eligiblePets(){return (A.dash?.pets||[]).filter(isBuncho)}
function ensurePetSelection(){
  const all=eligiblePets();
  if(!all.some(p=>String(p.id)===String(A.petId)))A.petId=(all.find(p=>String(p.id)===String(G?.activePetId))||all[0])?.id||null;
}

function build(){
  document.body.classList.remove('mofumori-v52');
  document.body.classList.add('mofumori-v6');
  $('.v52-deck')?.remove();$('.v52-nav')?.remove();$('.v52-status')?.remove();
  if(!$('#v6Overview')){
    const x=document.createElement('section');x.id='v6Overview';x.className='v6-overview';
    const shell=$('.game-shell');shell?.parentNode?.insertBefore(x,shell);
  }
  if(!$('#v6Nav')){
    const n=document.createElement('nav');n.id='v6Nav';n.className='v6-nav';
    n.innerHTML='<button class="active" data-v6="home"><span>⌂</span><b>ホーム</b></button><button data-v6="bird"><span>🐦</span><b>文鳥</b></button><button class="arena" data-v6="arena"><span>⚔</span><b>対戦</b></button><button data-v6="friends"><span>♧</span><b>フレンド</b></button><button data-v6="more"><span>•••</span><b>その他</b></button>';
    document.body.appendChild(n);
    $$('[data-v6]',n).forEach(b=>b.onclick=()=>navigate(b.dataset.v6));
  }
  if(!$('#v6PetSheet')){
    const s=document.createElement('div');s.id='v6PetSheet';s.className='v6-sheet';
    s.innerHTML='<div class="v6-sheet-card"><header><div><small>BUNCHO PROFILE</small><h2>文鳥プロフィール</h2></div><button data-close>×</button></header><div id="v6PetDetail"></div></div>';
    document.body.appendChild(s);s.querySelector('[data-close]').onclick=()=>closeSheet(s);
  }
  if(!$('#v6Arena')){
    const s=document.createElement('div');s.id='v6Arena';s.className='v6-sheet v6-arena-sheet';
    s.innerHTML='<div class="v6-sheet-card arena-card"><header><div><small>ONLINE ARENA</small><h2>文鳥バトル</h2></div><button data-close>×</button></header><div id="v6ArenaBody"></div></div>';
    document.body.appendChild(s);s.querySelector('[data-close]').onclick=()=>closeSheet(s);
  }
  if(!$('#v6More')){
    const s=document.createElement('div');s.id='v6More';s.className='v6-sheet';
    s.innerHTML='<div class="v6-sheet-card v6-more-card"><header><div><small>MORE</small><h2>その他</h2></div><button data-close>×</button></header><div class="v6-more-list"><button data-tool="shop"><span>🛒</span><div><b>ショップ</b><small>ごはん・アイテムを買う</small></div></button><button data-tool="inventory"><span>🎒</span><div><b>持ち物</b><small>持っている道具を使う</small></div></button><button data-tool="minigame"><span>🎮</span><div><b>ひとり遊び</b><small>オフラインのミニゲーム</small></div></button><button data-tool="missions"><span>✅</span><div><b>ミッション</b><small>今日の目標を見る</small></div></button><button data-tool="chat"><span>🧠</span><div><b>端末AI</b><small>文鳥とおしゃべり</small></div></button><button data-tool="customize"><span>⚙️</span><div><b>設定</b><small>天気・表示・サウンド</small></div></button><button data-tool="logs"><span>🧰</span><div><b>記録</b><small>セーブ・不具合情報</small></div></button></div></div>';
    document.body.appendChild(s);s.querySelector('[data-close]').onclick=()=>closeSheet(s);
    $$('[data-tool]',s).forEach(b=>b.addEventListener('click',()=>openLegacyTool(b.dataset.tool)));
  }
  if(!$('#v6Battle')){
    const b=document.createElement('div');b.id='v6Battle';b.className='v6-battle';document.body.appendChild(b);
  }
  organizeCareButtons();renderOverview();renderPetSheet();patchCare();watchFriends();
}
function navigate(k){
  $$('[data-v6]').forEach(b=>b.classList.toggle('active',b.dataset.v6===k));
  if(k==='home')return $('.game-shell')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(k==='bird')return openPet();
  if(k==='arena')return openArena();
  if(k==='friends'){openAccountHub?.();setTimeout(()=>{try{setSocialTab('friends')}catch(e){}$('#socialPanel')?.scrollIntoView({behavior:'smooth'})},40);return}
  if(k==='more')return openSheet($('#v6More'));
}
function openLegacyTool(name){
  const panel=document.getElementById(name+'Panel');
  if(!panel){showToast?.('この機能を開けませんでした','warning');return;}
  closeSheet($('#v6More'));
  if(typeof window.togglePanel==='function')window.togglePanel(name);
  else{
    ['shop','inventory','minigame','customize','chat','social','logs','missions'].forEach(id=>document.getElementById(id+'Panel')?.classList.toggle('show',id===name));
  }
  requestAnimationFrame(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}));
}
function organizeCareButtons(){
  const grid=$('.care-card .actions-grid');if(!grid||grid.dataset.v6Organized)return;
  grid.dataset.v6Organized='1';
  const extra=[...grid.querySelectorAll('.bath,.treat,.train,.sing')];
  if(!extra.length)return;
  const details=document.createElement('details');details.className='v6-care-more';
  const summary=document.createElement('summary');summary.textContent='＋ その他のお世話';
  const wrap=document.createElement('div');wrap.className='v6-extra-care';
  extra.forEach(btn=>wrap.appendChild(btn));details.append(summary,wrap);
  grid.parentNode.insertBefore(details,grid.nextSibling);
}
function openSheet(s){s?.classList.add('show');document.body.classList.add('v6-sheet-open')}
function closeSheet(s){s?.classList.remove('show');document.body.classList.remove('v6-sheet-open')}
function openPet(){renderPetSheet();openSheet($('#v6PetSheet'));refreshArena(true).catch(()=>{})}

function metric(label,val,suffix=''){return `<div class="v6-metric"><span>${esc(label)}</span><b>${Number(val||0).toFixed(suffix==='g'||suffix==='cm'?1:0)}${suffix}</b><i><em style="width:${clamp(val,0,100)}%"></em></i></div>`}
function renderOverview(){
  const root=$('#v6Overview');if(!root)return;
  const p=activePet(),s=p?.stats;
  root.innerHTML=`<button class="v6-profile-mini" id="v6OpenProfile">
    <span class="v6-avatar">${petIcon(p)}</span><span><small>いま一緒</small><b>${esc(petName(p))}</b><em>${esc(sexLabel(p))} ・ ${p?.rarity||'N'} / Rank ${p?.rank||1}</em></span>
  </button>
  <div class="v6-key-stats">
    <span><small>体重</small><b>${s?Number(s.weightG).toFixed(1)+'g':'--'}</b></span>
    <span><small>体力</small><b>${s?Math.round(s.endurance):'--'}</b></span>
    <span><small>敏捷</small><b>${s?Math.round(s.agility):'--'}</b></span>
    <span><small>レート</small><b>${s?Math.round(s.rating):'--'}</b></span>
  </div>
  <button class="v6-arena-cta" id="v6ArenaCta"><span>⚔</span><b>対戦する</b><small>ランダム / フレンド</small></button>`;
  $('#v6OpenProfile')?.addEventListener('click',openPet);$('#v6ArenaCta')?.addEventListener('click',()=>openArena());
}
function renderPetSheet(){
  const root=$('#v6PetDetail');if(!root)return;const p=activePet();if(!p){root.innerHTML='<p>文鳥がいません。</p>';return}
  const s=p.stats;
  root.innerHTML=`<section class="v6-pet-hero"><div class="v6-big-bird">${petIcon(p)}</div><div><small>${esc(p.speciesName||birds?.[p.species]?.name||'文鳥')}</small><h3>${esc(petName(p))}</h3><div class="v6-tags"><span>${p.rarity||'N'}</span><span>Rank ${p.rank||1}</span><span>${esc(sexLabel(p))}</span></div></div></section>
  <section class="v6-sex-card"><div><small>SEX</small><b>${esc(sexLabel(p))}</b><p>${p.sexKnown?'判定済み。この個体の性別は固定です。':'将来の相性・繁殖などに使える個体情報です。'}</p></div>${p.sexKnown?'':'<button id="v6SexCheck">性別を判定</button>'}</section>
  ${s?`<section class="v6-body-grid"><div><small>体重</small><b>${Number(s.weightG).toFixed(1)} g</b><em>適正 ${Number(s.idealWeightG).toFixed(1)} g</em></div><div><small>体長</small><b>${Number(s.bodyLengthCm).toFixed(1)} cm</b><em>翼幅 ${Number(s.wingSpanCm).toFixed(1)} cm</em></div><div><small>性格</small><b>${esc(s.personality||'個性的')}</b><em>体格 ${Math.round(s.frame||0)}</em></div><div><small>対戦</small><b>${s.rating||1000}</b><em>${s.wins||0}勝 ${s.losses||0}敗 ${s.draws||0}分</em></div></section>
  <section class="v6-stat-grid">${metric('食いしん坊',s.appetite)}${metric('体格',s.frame)}${metric('代謝',s.metabolism)}${metric('落ち着き',s.temperament)}${metric('好奇心',s.curiosity)}${metric('社交性',s.sociability)}${metric('体力',s.endurance)}${metric('敏捷性',s.agility)}${metric('飛行力',s.flightPower)}${metric('集中力',s.focus)}${metric('くちばし速度',s.beakSpeed)}${metric('バランス',s.balance)}${metric('フィットネス',s.fitness)}</section>`:'<div class="v6-cloud-note">ログインすると個体ステータスが同期されます。</div>'}`;
  $('#v6SexCheck')?.addEventListener('click',determineSex);
}
async function determineSex(){
  const p=activePet();if(!logged())return showToast?.('Googleログインすると性別判定できます','warning');
  if(!uuid(p?.id))return showToast?.('この個体はクラウド同期後に判定できます','warning');
  const btn=$('#v6SexCheck');if(btn){btn.disabled=true;btn.textContent='判定中…'}
  try{
    const r=await pets('determinePetSex',{petId:p.id});
    if(r.sexResult){p.sexKnown=true;p.sex=r.sexResult.sex;p.sexDeterminedAt=r.sexResult.sexDeterminedAt}
    showToast?.(p.sex==='male'?'♂ オスと判定されました':'♀ メスと判定されました','achievement');
    renderOverview();renderPetSheet();
  }catch(e){showToast?.(e.message,'warning')}finally{if(btn)btn.disabled=false}
}

async function refreshArena(force=false){
  if(!logged()){A.dash=null;renderArena();return null}
  if(A.refreshing)return A.dash;A.refreshing=true;
  try{
    const r=await arena('dashboard');A.dash=r.data;mergePets(r.data?.pets);ensurePetSelection();renderArena();
    if(r.data?.activeMatch&&!A.playing){A.match=r.data.activeMatch;openMatch(A.match)}
    return r.data;
  }catch(e){if(force)showToast?.(e.message,'warning');return null}finally{A.refreshing=false}
}
async function openArena(friendId=null){
  if(friendId){A.target=(socialState?.friends||[]).find(f=>f.playerId===friendId)||null}
  openSheet($('#v6Arena'));renderArena();
  if(logged())await refreshArena(true);
}
function gameCards(){return Object.entries(GAME).map(([id,g])=>`<button class="v6-game-card ${A.game===id?'active':''}" data-game="${id}"><span>${g.icon}</span><div><b>${g.name}</b><small>${g.desc}</small><em>${g.stat}</em></div></button>`).join('')}
function petOptions(){
  const all=eligiblePets();if(!all.length)return '<p class="v6-empty">対戦できる文鳥がいません。</p>';
  return all.map(p=>`<button class="v6-pet-choice ${String(p.id)===String(A.petId)?'active':''}" data-pet="${p.id}"><span>${petIcon(p)}</span><b>${esc(p.name)}</b><small>${esc(sexLabel(p))} ・ RATING ${p.stats?.rating||1000}</small></button>`).join('');
}
function challengeRows(){
  const incoming=A.dash?.challenges?.incoming||[],out=A.dash?.challenges?.outgoing||[];
  return `<section class="v6-challenges"><h3>対戦申請</h3>${incoming.map(c=>`<article><span>⚡</span><div><b>${esc(c.player?.displayName||c.player?.playerId)}</b><small>${GAME[c.gameType]?.name||c.gameType} を申請中</small></div><button data-accept="${c.id}" data-cgame="${c.gameType}">受ける</button><button class="subtle" data-decline="${c.id}">断る</button></article>`).join('')||'<p>届いている申請はありません。</p>'}${out.length?`<div class="v6-outgoing">申請中：${out.map(c=>`<span>${esc(c.player?.displayName||c.player?.playerId)} / ${GAME[c.gameType]?.name}</span>`).join('')}</div>`:''}</section>`;
}
function friendRows(){
  const fs=socialState?.friends||[];
  if(A.target)return `<section class="v6-target"><small>CHALLENGE</small><b>${esc(A.target.displayName||A.target.playerId)} に挑戦</b><p>${GAME[A.game].name} / ${petName(activeArenaPet())}</p><button id="v6SendChallenge">対戦申請を送る</button><button class="subtle" id="v6ClearTarget">キャンセル</button></section>`;
  return `<section class="v6-friend-arena"><h3>フレンドと対戦</h3>${fs.length?fs.map(f=>`<button data-friend-battle="${f.playerId}"><span>${esc(f.character?.icon||'🐦')}</span><div><b>${esc(f.displayName||f.playerId)}</b><small>${esc(f.playerId)}</small></div><em>申請 →</em></button>`).join(''):'<p class="v6-empty">フレンドになると直接対戦を申請できます。</p>'}</section>`;
}
function renderArena(){
  const root=$('#v6ArenaBody');if(!root)return;
  if(!logged()){root.innerHTML='<div class="v6-login-gate"><span>⚔</span><h3>オンライン対戦</h3><p>Googleログインするとランダムマッチとフレンド対戦が使えます。</p><button id="v6LoginArena">ログイン画面を開く</button></div>';$('#v6LoginArena')?.addEventListener('click',()=>{closeSheet($('#v6Arena'));openAccountHub?.()});return}
  const q=A.dash?.queue;
  root.innerHTML=`<section class="v6-arena-intro"><div><small>BUNCHO ARENA</small><h3>3つの競技で育てた個体を試す</h3></div><span>SERVER MATCH</span></section>
    <section class="v6-mode"><h3>ゲームを選ぶ</h3><div class="v6-game-list">${gameCards()}</div></section>
    <section class="v6-mode"><h3>出場する文鳥</h3><div class="v6-pet-list">${petOptions()}</div></section>
    <section class="v6-random"><div><small>RANDOM MATCH</small><b>オンラインランダムマッチ</b><p>同じゲームを待っているプレイヤーと自動で対戦。</p></div>${q?`<button id="v6CancelQueue" class="waiting"><i></i>待機中… 取消</button>`:'<button id="v6RandomMatch">相手を探す</button>'}</section>
    ${friendRows()}${challengeRows()}`;
  $$('[data-game]',root).forEach(b=>b.onclick=()=>{A.game=b.dataset.game;renderArena()});
  $$('[data-pet]',root).forEach(b=>b.onclick=()=>{A.petId=b.dataset.pet;renderArena()});
  $('#v6RandomMatch')?.addEventListener('click',startRandom);
  $('#v6CancelQueue')?.addEventListener('click',cancelQueue);
  $('#v6SendChallenge')?.addEventListener('click',sendChallenge);
  $('#v6ClearTarget')?.addEventListener('click',()=>{A.target=null;renderArena()});
  $$('[data-friend-battle]',root).forEach(b=>b.onclick=()=>{A.target=(socialState?.friends||[]).find(f=>f.playerId===b.dataset.friendBattle)||null;renderArena()});
  $$('[data-accept]',root).forEach(b=>b.onclick=()=>respondChallenge(b.dataset.accept,true,b.dataset.cgame));
  $$('[data-decline]',root).forEach(b=>b.onclick=()=>respondChallenge(b.dataset.decline,false));
}
async function startRandom(){
  const p=activeArenaPet();if(!p)return showToast?.('出場する文鳥を選んでください','warning');
  try{
    const r=await arena('queue',{petId:p.id,gameType:A.game});A.dash=r.data;renderArena();
    if(r.matchmaking?.status==='matched'){const m=await arena('match',{matchId:r.matchmaking.matchId});A.match=m.data;openMatch(A.match)}
    else showToast?.('対戦相手を探しています…');
  }catch(e){showToast?.(e.message,'warning')}
}
async function cancelQueue(){try{const r=await arena('cancelQueue');A.dash=r.data;renderArena()}catch(e){showToast?.(e.message,'warning')}}
async function sendChallenge(){
  const p=activeArenaPet();if(!p||!A.target)return;
  try{const r=await arena('challenge',{playerId:A.target.playerId,petId:p.id,gameType:A.game});A.dash=r.data;A.target=null;renderArena();showToast?.('対戦申請を送りました ⚡','achievement')}catch(e){showToast?.(e.message,'warning')}
}
async function respondChallenge(id,accept,game){
  if(accept&&game)A.game=game;const p=activeArenaPet();
  try{
    const r=await arena('respondChallenge',{challengeId:id,accept,petId:accept?p?.id:null});A.dash=r.data;renderArena();
    if(r.response?.status==='matched'){const m=await arena('match',{matchId:r.response.matchId});A.match=m.data;openMatch(A.match)}
  }catch(e){showToast?.(e.message,'warning')}
}

function openMatch(m){
  if(!m||A.playing)return;A.match=m;closeSheet($('#v6Arena'));const b=$('#v6Battle');b.classList.add('show');
  renderMatchLobby(m);clearInterval(A.matchPoll);
  A.matchPoll=setInterval(pollMatch,850);countdownToStart();
}
function renderMatchLobby(m){
  const b=$('#v6Battle'),g=GAME[m.gameType]||GAME.flight;
  b.innerHTML=`<div class="v6-match-top"><button id="v6LeaveBattle">×</button><div><small>${g.icon} ${g.name}</small><b id="v6MatchStatus">対戦準備中</b></div><span id="v6OpponentLive">相手接続中</span></div>
  <div class="v6-versus"><article><span>${petIcon(m.me.pet)}</span><b>${esc(m.me.pet?.name)}</b><small>YOU / ${m.me.pet?.stats?.rating||1000}</small></article><strong>VS</strong><article><span>${petIcon(m.opponent.pet)}</span><b>${esc(m.opponent.pet?.name)}</b><small>${esc(m.opponent.profile?.displayName||'RIVAL')} / ${m.opponent.pet?.stats?.rating||1000}</small></article></div>
  <div id="v6Countdown" class="v6-countdown"></div><div id="v6GameStage" class="v6-game-stage"></div><div id="v6Result" class="v6-result"></div>`;
  $('#v6LeaveBattle').onclick=leaveBattle;
}
function countdownToStart(){
  const tick=()=>{if(!A.match||A.playing)return;const left=Date.parse(A.match.startsAt)-Date.now(),el=$('#v6Countdown');if(left>0){if(el)el.innerHTML=`<b>${Math.ceil(left/1000)}</b><small>READY</small>`;setTimeout(tick,150)}else{if(el)el.innerHTML='<b>GO!</b>';setTimeout(()=>el?.classList.add('gone'),350);startGame(A.match.gameType)}};
  tick();
}
async function pollMatch(){
  if(!A.match)return;
  try{
    const r=await arena('match',{matchId:A.match.id});if(!r.data)return;A.match=r.data;updateOpponent(r.data);
    if(r.data.status==='finished')showResult(r.data);
  }catch(e){}
}
function updateOpponent(m){
  const el=$('#v6OpponentLive');if(!el)return;
  const p=m.opponent?.progress||{};
  if(m.gameType==='flight')el.textContent=`RIVAL ${Math.round(p.height||0)}m`;
  else if(m.gameType==='kale')el.textContent=`RIVAL ${p.count||0} bite`;
  else el.textContent=`RIVAL ${p.hits||0} hit`;
}
async function progress(obj){
  if(!A.match||Date.now()-A.lastProgress<650)return;A.lastProgress=Date.now();
  try{await arena('progress',{matchId:A.match.id,progress:obj})}catch(e){}
}
function seeded(seed){let x=(Number(seed)||123456789)>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function startGame(type){if(A.playing)return;A.playing=true;if(type==='flight')flightGame();else if(type==='kale')kaleGame();else perchGame()}
function flightGame(){
  const stage=$('#v6GameStage'),p=A.match.me.pet,s=p.stats||{},rnd=seeded(A.match.seed),duration=30000;
  stage.innerHTML='<div class="flight-hud"><span>HEIGHT <b id="fHeight">0</b>m</span><span>体力 <b id="fStamina">100</b>%</span></div><div class="flight-field" id="flightField"><div class="flight-clouds"></div><div class="flight-bird" id="flightBird">🐦</div><div class="flight-obstacles" id="flightObs"></div></div><div class="flight-controls"><button id="fLeft">←</button><small>ドラッグでも移動</small><button id="fRight">→</button></div>';
  const field=$('#flightField'),bird=$('#flightBird'),obsRoot=$('#flightObs');
  let x=.5,height=0,collisions=0,stamina=100,last=performance.now(),t0=last,spawn=0,raf=0,done=false,obs=[];
  const weightFit=1-Math.min(Math.abs(stat(p,'weightG',24.5)-stat(p,'idealWeightG',24.5))/Math.max(1,stat(p,'idealWeightG',24.5)),.35);
  const climb=.31+stat(p,'flightPower')*.0017+stat(p,'endurance')*.0009+weightFit*.06;
  const handling=.08+stat(p,'agility')*.0012+Math.max(0,30-stat(p,'weightG',24.5))*.001;
  function setX(v){x=clamp(v,.08,.92);bird.style.left=`${x*100}%`}
  function pointer(e){const r=field.getBoundingClientRect();setX((e.clientX-r.left)/r.width)}
  field.addEventListener('pointerdown',e=>{field.setPointerCapture?.(e.pointerId);pointer(e)});field.addEventListener('pointermove',e=>{if(e.buttons)pointer(e)});
  $('#fLeft').onpointerdown=()=>setX(x-handling);$('#fRight').onpointerdown=()=>setX(x+handling);
  function addObs(){const gap=.23+rnd()*.42,w=.28+clamp(stat(p,'agility'),0,100)/900;const el=document.createElement('div');el.className='flight-gate';el.innerHTML='<i></i><i></i>';obsRoot.appendChild(el);obs.push({gap,w,y:-12,hit:false,el});}
  function frame(now){
    const dt=Math.min(34,now-last);last=now;const t=now-t0;if(done)return;
    stamina=Math.max(0,100-t/1000*(1.45-stat(p,'endurance')*.006));
    height+=dt*climb*(.72+stamina/360);
    spawn+=dt;if(spawn>850){spawn=0;addObs()}
    const H=field.clientHeight,birdY=H-86;
    for(const o of obs){o.y+=dt*(.19+height/160000);o.el.style.transform=`translateY(${o.y}px)`;const left=(o.gap-o.w/2)*100,right=(o.gap+o.w/2)*100;o.el.children[0].style.width=`${Math.max(0,left)}%`;o.el.children[1].style.left=`${Math.min(100,right)}%`;o.el.children[1].style.width=`${Math.max(0,100-right)}%`;if(!o.hit&&o.y>birdY-20&&o.y<birdY+22&&(x<o.gap-o.w/2||x>o.gap+o.w/2)){o.hit=true;collisions++;height=Math.max(0,height-150);stamina=Math.max(0,stamina-8);field.classList.add('hit');setTimeout(()=>field.classList.remove('hit'),180)}}obs=obs.filter(o=>{if(o.y>H+30){o.el.remove();return false}return true});
    $('#fHeight').textContent=Math.round(height/10);$('#fStamina').textContent=Math.round(stamina);
    progress({t:Math.round(t),x,height:Math.round(height)});
    if(t>=duration){done=true;cancelAnimationFrame(raf);submitGame({durationMs:duration,height,collisions});return}
    raf=requestAnimationFrame(frame)
  }
  setX(x);raf=requestAnimationFrame(frame);A.gameState={stop:()=>{done=true;cancelAnimationFrame(raf)}};
}
function kaleGame(){
  const stage=$('#v6GameStage'),p=A.match.me.pet,duration=10000;let taps=0,done=false,t0=Date.now(),timer;
  stage.innerHTML='<div class="kale-hud"><span>TIME <b id="kTime">10.0</b></span><span>BITES <b id="kCount">0</b></span></div><button id="kaleTap" class="kale-tap"><span>🥬</span><b>連打！</b><i></i></button><p class="kale-power" id="kPower"></p>';
  const btn=$('#kaleTap');
  btn.onclick=()=>{if(done)return;taps++;$('#kCount').textContent=taps;btn.classList.remove('bite');void btn.offsetWidth;btn.classList.add('bite');btn.style.setProperty('--eat',Math.max(15,100-(taps%20)*4)+'%');$('#kPower').textContent=`食いしん坊 ${Math.round(stat(p,'appetite'))} / くちばし速度 ${Math.round(stat(p,'beakSpeed'))}`;progress({t:Date.now()-t0,count:taps})};
  timer=setInterval(()=>{const left=Math.max(0,duration-(Date.now()-t0));$('#kTime').textContent=(left/1000).toFixed(1);if(left<=0){clearInterval(timer);done=true;btn.disabled=true;submitGame({durationMs:duration,taps})}},50);
  A.gameState={stop:()=>{done=true;clearInterval(timer)}};
}
function perchGame(){
  const stage=$('#v6GameStage'),p=A.match.me.pet;let round=0,hits=0,misses=0,reactions=[],target=-1,started=0,timeout=null,done=false;
  stage.innerHTML='<div class="perch-hud"><span>ROUND <b id="pRound">1/12</b></span><span>HIT <b id="pHits">0</b></span></div><div class="perch-stage"><div class="perch-bird" id="perchBird">🐦</div><button data-perch="0">左</button><button data-perch="1">中央</button><button data-perch="2">右</button></div><p id="pGuide">光ったとまり木をタップ！</p>';
  const buttons=$$('[data-perch]',stage),bird=$('#perchBird');
  function next(){if(done)return;if(round>=12)return finish();buttons.forEach(b=>b.classList.remove('target','wrong'));target=Math.floor(Math.random()*3);buttons[target].classList.add('target');started=performance.now();$('#pRound').textContent=`${round+1}/12`;const limit=900+stat(p,'focus')*5+stat(p,'temperament')*2;timeout=setTimeout(()=>{misses++;round++;next()},limit)}
  buttons.forEach(b=>b.onclick=()=>{if(done||target<0)return;clearTimeout(timeout);const n=+b.dataset.perch;if(n===target){hits++;reactions.push(performance.now()-started);bird.style.left=[17,50,83][n]+'%';$('#pHits').textContent=hits}else{misses++;b.classList.add('wrong')}round++;progress({t:round*1000,hits});setTimeout(next,120)});
  function finish(){done=true;buttons.forEach(b=>b.disabled=true);const avg=reactions.length?reactions.reduce((a,b)=>a+b,0)/reactions.length:1500;submitGame({hits,misses,avgReactionMs:avg})}
  next();A.gameState={stop:()=>{done=true;clearTimeout(timeout)}};
}
async function submitGame(raw){
  $('#v6MatchStatus').textContent='結果を送信中…';
  try{
    const r=await arena('submit',{matchId:A.match.id,raw});A.match=r.data||r.submission?.match||A.match;A.playing=false;
    if(A.match.status==='finished')showResult(A.match);else{$('#v6MatchStatus').textContent='相手の結果を待っています…';$('#v6GameStage').innerHTML='<div class="v6-wait-rival"><i></i><b>RIVAL PLAYING</b><small>相手のゲーム終了を待っています</small></div>'}
  }catch(e){A.playing=false;$('#v6MatchStatus').textContent='送信エラー';showToast?.(e.message,'warning')}
}
function showResult(m){
  A.playing=false;A.gameState?.stop?.();const me=m.me?.profile?.playerId,w=m.winnerPlayerId;const draw=!w,win=w===me;
  const root=$('#v6Result');if(!root)return;$('#v6MatchStatus').textContent='FINISHED';$('#v6GameStage').innerHTML='';
  root.innerHTML=`<div class="result-burst ${draw?'draw':win?'win':'lose'}"><small>${draw?'DRAW':win?'WIN':'LOSE'}</small><h2>${draw?'引き分け':win?'勝利！':'惜敗'}</h2><div><span><b>${Number(m.me.score||0).toLocaleString()}</b><small>YOU</small></span><strong>:</strong><span><b>${Number(m.opponent.score||0).toLocaleString()}</b><small>RIVAL</small></span></div><p>RATING ${m.me.pet?.stats?.rating||1000}</p><button id="v6ResultClose">ホームへ戻る</button></div>`;
  clearInterval(A.matchPoll);$('#v6ResultClose').onclick=()=>{closeBattle();refreshArena(true)}
}
async function leaveBattle(){
  if(A.playing&&!confirm('対戦を途中で終了しますか？'))return;
  try{if(A.match&&['ready','running'].includes(A.match.status))await arena('abandon',{matchId:A.match.id})}catch(e){}
  closeBattle();
}
function closeBattle(){A.gameState?.stop?.();clearInterval(A.matchPoll);A.matchPoll=null;A.playing=false;A.match=null;A.gameState=null;$('#v6Battle')?.classList.remove('show');$('#v6Battle').innerHTML=''}
function watchFriends(){
  const root=$('#friendList');if(!root)return;
  const inject=()=>{$$('.friend-card-v5',root).forEach(card=>{if(card.querySelector('[data-v6-challenge]'))return;const pid=card.querySelector('[data-view]')?.dataset.view;if(!pid)return;const actions=card.querySelector('.friend-actions');if(!actions)return;const b=document.createElement('button');b.dataset.v6Challenge=pid;b.textContent='⚔️ 対戦';b.onclick=()=>openArena(pid);actions.appendChild(b)})};
  inject();new MutationObserver(inject).observe(root,{childList:true,subtree:true});
}
function careSnapshot(action){return {feeds:G.tFeeds,pets:G.tPets,plays:G.tPlays,baths:G.tBaths,sings:G.tSings,energy:G.energy,sleeping:G.isSleeping}}
function careSucceeded(action,b,a){if(action==='feed'||action==='treat')return a.feeds>b.feeds;if(action==='pet')return a.pets>b.pets;if(action==='play')return a.plays>b.plays;if(action==='bath')return a.baths>b.baths;if(action==='sing')return a.sings>b.sings;if(action==='train')return a.energy<b.energy;if(action==='sleep')return !b.sleeping&&a.sleeping;return false}
function patchCare(){
  const map={feedBird:'feed',petBird:'pet',playBird:'play',bathBird:'bath',giveTreat:'treat',trainBird:'train',singBird:'sing',toggleSleep:'sleep'};
  for(const [name,action] of Object.entries(map)){const old=window[name];if(typeof old!=='function'||old.__v6)continue;const fn=function(...args){const b=careSnapshot(action),ret=old.apply(this,args),a=careSnapshot(action);if(careSucceeded(action,b,a))recordCare(action);return ret};fn.__v6=true;window[name]=fn}
}
async function recordCare(action){
  const p=activePet();if(!logged()||!uuid(p?.id))return;
  try{const r=await arena('care',{petId:p.id,care:action});if(r.data){p.stats={...(p.stats||{}),...r.data};renderOverview();renderPetSheet()}}catch(e){}
}
function startPolling(){clearInterval(A.poll);A.poll=setInterval(()=>{if(logged()&&(!document.hidden||$('#v6Arena')?.classList.contains('show')))refreshArena()},2200)}
function boot(){build();startPolling();if(logged())setTimeout(()=>refreshArena(),600)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,100),{once:true}):setTimeout(boot,100);
})();