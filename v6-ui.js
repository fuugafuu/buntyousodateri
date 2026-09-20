(()=>{'use strict';

const GAME={
  flight:{icon:'🪽',name:'飛行バトル',desc:'同じ障害物コースを2羽で同時飛行',stat:'飛行力・体力・敏捷性・体重'},
  kale:{icon:'🥬',name:'小松菜もぐもぐ',desc:'2羽を見ながら10秒の食べ比べ',stat:'食いしん坊度・くちばし速度・集中力'},
  perch:{icon:'🪵',name:'とまり木反射',desc:'同じ合図に2羽が反応する反射勝負',stat:'敏捷性・バランス・集中力・性格'},
  seedrace:{icon:'🌾',name:'シードダッシュ',desc:'シードを集めて2羽が並走するスプリント',stat:'敏捷性・集中力・くちばし速度'},
  ring:{icon:'⭕',name:'リングラッシュ',desc:'同じリング列をくぐるタイミング勝負',stat:'飛行力・集中力・バランス'}
};
const A={dash:null,game:'flight',petId:null,target:null,match:null,refreshing:false,poll:null,matchPoll:null,playing:false,queueing:false,lastProgress:0,gameState:null,lastArenaInteraction:0,arenaScroll:{pets:0,games:0,body:0},preparing:false,ready:false,voiceAt:0,audio:null};
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const logged=()=>typeof identityUser!=='undefined'&&!!identityUser;
const activePet=()=>Array.isArray(G?.petCollection)?(G.petCollection.find(p=>String(p.id)===String(G.activePetId))||G.petCollection[0]):null;
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''));
const isBuncho=p=>String(p?.species||'').startsWith('buncho_');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function clamp(n,a,b){return Math.max(a,Math.min(b,Number(n)||0))}
function stat(p,k,d=50){return Number(p?.stats?.[k]??d)}
function sexLabel(p){if(p?.lifeStage==='egg')return'🥚 未孵化';if(p?.lifeStage==='chick')return'🐣 雛・未判定';return p?.sexKnown?(p.sex==='male'?'♂ オス':'♀ メス'):'？ 未判定'}
function petIcon(p){if(p?.lifeStage==='egg')return'🥚';if(p?.lifeStage==='chick')return'🐣';const b=typeof birds!=='undefined'?birds[p?.species]:null;return b?.icon||'🐦'}
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
function eligiblePets(){return (A.dash?.pets||[]).filter(p=>isBuncho(p)&&(p.lifeStage||'adult')==='adult'&&p.eligible!==false)}
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
  if(!$('#v72ArenaTutorial')){
    const t=document.createElement('div');t.id='v72ArenaTutorial';t.className='modal';
    t.innerHTML='<div class="modal-content v72-arena-tutorial"><div class="modal-title">⚔ はじめてのオンライン対戦</div><div class="v72-tutorial-steps"><article><span>1</span><div><b>文鳥と競技を選ぶ</b><small>いま一緒にいる文鳥が最初から選ばれます。</small></div></article><article><span>2</span><div><b>相手を探す</b><small>プレイヤー同士を最優先。10秒以上見つからない時だけCPUが参加します。</small></div></article><article><span>3</span><div><b>接続チェック</b><small>整合性・セキュリティ・通信安定性を確認してから同時スタート。</small></div></article><article><span>4</span><div><b>2羽を同時表示</b><small>相手の動きも見えます。鳥同士はぶつかりませんが、障害物には当たります。</small></div></article></div><div class="modal-buttons"><button class="modal-btn primary" id="v72TutorialStart">わかった、対戦する</button></div></div>';
    document.body.appendChild(t);$('#v72TutorialStart',t).onclick=()=>{localStorage.setItem('mofumoriArenaTutorialV72','1');hideModal?.('v72ArenaTutorial')};
  }
  organizeCareButtons();renderOverview();renderPetSheet();patchCare();watchFriends();
}
function navigate(k){
  $$('[data-v6]').forEach(b=>b.classList.toggle('active',b.dataset.v6===k));
  if(k==='home')return $('.game-shell')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(k==='bird')return openBirdCollection();
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
function openBirdCollection(){
  closeSheet($('#v6PetSheet'));closeSheet($('#v6More'));
  const modal=$('#birdModal');
  if(!modal){showToast?.('文鳥一覧を開けませんでした','warning');return;}
  if(typeof window.showModal==='function')window.showModal('birdModal');
  else modal.classList.add('show');
  requestAnimationFrame(()=>{
    $('#gachaHub')?.scrollIntoView({block:'start'});
    $('#birdGrid')?.scrollIntoView({block:'nearest'});
  });
}
function openPet(){renderPetSheet();openSheet($('#v6PetSheet'));refreshArena(true).catch(()=>{})}

function metric(label,val,suffix=''){return `<div class="v6-metric"><span>${esc(label)}</span><b>${Number(val||0).toFixed(suffix==='g'||suffix==='cm'?1:0)}${suffix}</b><i><em style="width:${clamp(val,0,100)}%"></em></i></div>`}
function lifeStageLabel(p){
  return p?.lifeStage==='egg'?'🥚 卵':p?.lifeStage==='chick'?'🐣 雛':'成鳥';
}
function familyPet(id){return (G?.petCollection||[]).find(p=>String(p.id)===String(id))||null}
function familyNode(p,depth=0,seen=new Set()){
  if(!p)return '<div class="v730-family-missing">記録なし</div>';
  if(seen.has(String(p.id)))return '<div class="v730-family-missing">↻</div>';
  const next=new Set(seen);next.add(String(p.id));
  const hasParents=(p.fatherId||p.motherId)&&depth<5;
  return '<div class="v730-family-node depth-'+depth+'"><div class="v730-family-person"><span>'+petIcon(p)+'</span><div><b>'+esc(p.name||petName(p))+'</b><small>G'+Number(p.generation||0)+' ・ '+esc(sexLabel(p))+'</small></div></div>'+(hasParents?'<div class="v730-family-parents"><div><em>父</em>'+familyNode(familyPet(p.fatherId),depth+1,next)+'</div><div><em>母</em>'+familyNode(familyPet(p.motherId),depth+1,next)+'</div></div>':'')+'</div>';
}
function geneticsSummary(p){
  const ph=p?.phenotype||{},g=p?.genetics||{},colors=Array.isArray(g.color)?g.color.join(' × '):'未解析',mut=Array.isArray(ph.mutations)?ph.mutations.length:Array.isArray(g.mutations)?g.mutations.length:0;
  return '<section class="v730-genetics"><div class="v730-genetics-head"><div><small>GENETICS</small><h3>遺伝・特徴</h3></div><span>G'+Number(p?.generation||0)+'</span></div><div class="v730-gene-chips"><span>🎨 '+esc(ph.colorName||'標準')+'</span><span>📏 '+esc(ph.sizeClass||'標準')+'</span><span>💚 '+esc(ph.personality||'個性的')+'</span><span>🧬 '+esc(colors)+'</span>'+(mut?'<span>✨ 変異 '+mut+'</span>':'')+'</div></section>';
}
function familyTreeHtml(p){
  if(!(p?.fatherId||p?.motherId||Number(p?.generation||0)>0))return'';
  return '<section class="v730-family"><div class="v730-family-head"><small>FAMILY TREE</small><h3>関係図</h3><p>交配で生まれた個体だけ表示。世代が増えるほど枝が伸びます。</p></div><div class="v730-family-scroll">'+familyNode(p,0,new Set())+'</div></section>';
}
function renderOverview(){
  const root=$('#v6Overview');if(!root)return;
  const p=activePet(),s=p?.stats,stage=lifeStageLabel(p);
  root.innerHTML=`<button class="v6-profile-mini" id="v6OpenProfile">
    <span class="v6-avatar">${petIcon(p)}</span><span><small>${p?.lifeStage==='adult'?'いま一緒':stage}</small><b>${esc(petName(p))}</b><em>${esc(sexLabel(p))} ・ ${p?.rarity||'N'} / Rank ${p?.rank||1}${Number(p?.generation||0)>0?' ・ G'+Number(p.generation):''}</em></span>
  </button>
  <div class="v6-key-stats">
    <span><small>体重</small><b>${s?Number(s.weightG).toFixed(1)+'g':'--'}</b></span>
    <span><small>${p?.lifeStage==='chick'?'成長':'体力'}</small><b>${p?.lifeStage==='chick'?Number(p.growthPoints||0)+'/6':s?Math.round(s.endurance):'--'}</b></span>
    <span><small>敏捷</small><b>${s?Math.round(s.agility):'--'}</b></span>
    <span><small>レート</small><b>${p?.lifeStage==='adult'&&s?Math.round(s.rating):'--'}</b></span>
  </div>
  <button class="v6-arena-cta" id="v6ArenaCta" ${p?.lifeStage!=='adult'?'disabled':''}><span>⚔</span><b>対戦する</b><small>${p?.lifeStage==='adult'?'ランダム / フレンド':'成鳥になると参加可能'}</small></button>`;
  $('#v6OpenProfile')?.addEventListener('click',openPet);$('#v6ArenaCta')?.addEventListener('click',()=>{if(p?.lifeStage==='adult')openArena()});
}
function renderPetSheet(){
  const root=$('#v6PetDetail');if(!root)return;const p=activePet();if(!p){root.innerHTML='<p>文鳥がいません。</p>';return}
  const s=p.stats,stage=p.lifeStage||'adult',ph=p.phenotype||{};
  const stageCard=stage==='egg'
    ?`<section class="v730-stage-profile egg"><span>🥚</span><div><small>EGG ・ GENERATION ${Number(p.generation||0)}</small><b>孵化を待っています</b><p>孵化予定 ${p.hatchAt?new Date(p.hatchAt).toLocaleString('ja-JP'):'--'}</p></div></section>`
    :stage==='chick'
      ?`<section class="v730-stage-profile chick"><span>🐣</span><div><small>CHICK ・ GENERATION ${Number(p.generation||0)}</small><b>成長ポイント ${Number(p.growthPoints||0)} / 6</b><p>ごはん・遊び・訓練などのお世話で早く成長します。</p></div></section>`
      :'';
  const sexCard=stage==='adult'
    ?`<section class="v6-sex-card"><div><small>SEX</small><b>${esc(sexLabel(p))}</b><p>${p.sexKnown?'判定済み。この個体の性別は固定です。交配にも使えます。':'交配するには先に性別判定が必要です。'}</p></div>${p.sexKnown?'':'<button id="v6SexCheck">性別を判定</button>'}</section>`
    :`<section class="v6-sex-card locked"><div><small>SEX</small><b>${esc(sexLabel(p))}</b><p>性別判定は成鳥になってからできます。</p></div></section>`;
  root.innerHTML=`<section class="v6-pet-hero"><div class="v6-big-bird">${petIcon(p)}</div><div><small>${esc(p.speciesName||birds?.[p.species]?.name||'文鳥')}</small><h3>${esc(petName(p))}</h3><div class="v6-tags"><span>${p.rarity||'N'}</span><span>Rank ${p.rank||1}</span><span>${esc(lifeStageLabel(p))}</span><span>${esc(sexLabel(p))}</span>${Number(p.generation||0)>0?'<span>G'+Number(p.generation)+'</span>':''}</div></div></section>
  ${stageCard}${sexCard}
  ${Number(p.generation||0)>0||p.fatherId||p.motherId?geneticsSummary(p):''}
  ${s?`<section class="v6-body-grid"><div><small>体重</small><b>${Number(s.weightG).toFixed(1)} g</b><em>適正 ${Number(s.idealWeightG).toFixed(1)} g</em></div><div><small>体長</small><b>${Number(s.bodyLengthCm).toFixed(1)} cm</b><em>翼幅 ${Number(s.wingSpanCm).toFixed(1)} cm</em></div><div><small>特徴</small><b>${esc(ph.personality||s.personality||'個性的')}</b><em>${esc(ph.sizeClass||'標準')} ・ 体格 ${Math.round(s.frame||0)}</em></div><div><small>対戦</small><b>${stage==='adult'?s.rating||1000:'--'}</b><em>${stage==='adult'?((s.wins||0)+'勝 '+(s.losses||0)+'敗 '+(s.draws||0)+'分'):'成鳥から参加可能'}</em></div></section>
  <section class="v6-stat-grid">${metric('食いしん坊',s.appetite)}${metric('体格',s.frame)}${metric('代謝',s.metabolism)}${metric('落ち着き',s.temperament)}${metric('好奇心',s.curiosity)}${metric('社交性',s.sociability)}${metric('体力',s.endurance)}${metric('敏捷性',s.agility)}${metric('飛行力',s.flightPower)}${metric('集中力',s.focus)}${metric('くちばし速度',s.beakSpeed)}${metric('バランス',s.balance)}${metric('フィットネス',s.fitness)}</section>`:'<div class="v6-cloud-note">ログインすると個体ステータスが同期されます。</div>'}
  ${familyTreeHtml(p)}`;
  $('#v6SexCheck')?.addEventListener('click',determineSex);
}
async function determineSex(){
  const p=activePet();if(p?.lifeStage!=='adult')return showToast?.('性別判定は成鳥になってからできます','warning');if(!logged())return showToast?.('Googleログインすると性別判定できます','warning');
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
  if(!logged()){A.dash=null;if(force)renderArena(true);return null}
  if(A.refreshing)return A.dash;A.refreshing=true;
  try{
    const root=$('#v6ArenaBody'),petList=$('.v6-pet-list'),gameList=$('.v6-game-list');
    if(root){A.arenaScroll.body=root.scrollTop;A.arenaScroll.pets=petList?.scrollTop||0;A.arenaScroll.games=gameList?.scrollTop||0}
    const r=await arena('dashboard');A.dash=r.data;mergePets(r.data?.pets);ensurePetSelection();
    const arenaOpen=$('#v6Arena')?.classList.contains('show'),recent=Date.now()-A.lastArenaInteraction<1400;
    if(force||!arenaOpen||!recent)renderArena(true);
    if(r.data?.activeMatch&&!A.playing&&!A.preparing){A.match=r.data.activeMatch;openMatch(A.match)}
    return r.data;
  }catch(e){if(force)showToast?.(e.message,'warning');return null}finally{A.refreshing=false}
}
async function openArena(friendId=null){
  if(friendId)A.target=(socialState?.friends||[]).find(f=>f.playerId===friendId)||null;
  const equipped=eligiblePets().find(p=>String(p.id)===String(G?.activePetId));
  if(equipped)A.petId=equipped.id;
  openSheet($('#v6Arena'));renderArena(false);
  if(localStorage.getItem('mofumoriArenaTutorialV72')!=='1')setTimeout(()=>showModal?.('v72ArenaTutorial'),180);
  if(logged())await refreshArena(true);
}
function gameCards(){return Object.entries(GAME).map(([id,g])=>`<button class="v6-game-card ${A.game===id?'active':''}" data-game="${id}"><span>${g.icon}</span><div><b>${g.name}</b><small>${g.desc}</small><em>${g.stat}</em></div></button>`).join('')}
function petOptions(){
  const all=eligiblePets();if(!all.length)return '<p class="v6-empty">対戦できる文鳥がいません。</p>';
  return all.map(p=>`<button class="v6-pet-choice ${String(p.id)===String(A.petId)?'active':''}" data-pet="${p.id}"><span>${petIcon(p)}</span><b>${esc(p.name)}</b><small>${esc(sexLabel(p))} ・ RATING ${p.stats?.rating||1000}${Number(p.fusionLevel||0)>0?' ・ 🧬Lv '+Number(p.fusionLevel):''}</small></button>`).join('');
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
function renderArena(preserve=false){
  const root=$('#v6ArenaBody');if(!root)return;
  const saved=preserve?{body:A.arenaScroll.body,pets:A.arenaScroll.pets,games:A.arenaScroll.games}:{body:root.scrollTop,pets:$('.v6-pet-list')?.scrollTop||0,games:$('.v6-game-list')?.scrollTop||0};
  if(!logged()){root.innerHTML='<div class="v6-login-gate"><span>⚔</span><h3>オンライン対戦</h3><p>ログインするとランダムマッチとフレンド対戦が使えます。</p><button id="v6LoginArena">ログイン画面を開く</button></div>';$('#v6LoginArena')?.addEventListener('click',()=>{closeSheet($('#v6Arena'));openAccountHub?.()});return}
  const q=A.dash?.queue,gameCount=Object.keys(GAME).length;
  root.innerHTML=`<section class="v6-arena-intro"><div><small>BUNCHO ARENA v7.2</small><h3>${gameCount}つの競技を2羽同時表示で対戦</h3></div><span>SECURE MATCH</span></section>
    <section class="v6-mode"><h3>ゲームを選ぶ</h3><div class="v6-game-list">${gameCards()}</div></section>
    <section class="v6-mode"><h3>出場する文鳥</h3><div class="v6-pet-list">${petOptions()}</div></section>
    <section class="v6-random"><div><small>RANDOM MATCH</small><b>オンラインランダムマッチ</b><p>プレイヤー同士を優先。10秒待って相手がいない場合はCPUが参加します。</p></div>${q?`<button id="v6CancelQueue" class="waiting"><i></i>待機中… 取消</button>`:A.queueing?'<button id="v6RandomMatch" disabled><i></i>接続中…</button>':'<button id="v6RandomMatch">相手を探す</button>'}</section>
    ${friendRows()}${challengeRows()}`;
  const petsEl=$('.v6-pet-list',root),gamesEl=$('.v6-game-list',root);
  requestAnimationFrame(()=>{root.scrollTop=saved.body||0;if(petsEl)petsEl.scrollTop=saved.pets||0;if(gamesEl)gamesEl.scrollTop=saved.games||0});
  const touch=()=>{A.lastArenaInteraction=Date.now();A.arenaScroll.body=root.scrollTop;A.arenaScroll.pets=petsEl?.scrollTop||0;A.arenaScroll.games=gamesEl?.scrollTop||0};
  root.addEventListener('pointerdown',touch,{passive:true});root.addEventListener('scroll',touch,{passive:true});
  petsEl?.addEventListener('scroll',touch,{passive:true});gamesEl?.addEventListener('scroll',touch,{passive:true});
  $$('[data-game]',root).forEach(b=>b.onclick=()=>{touch();A.game=b.dataset.game;$$('[data-game]',root).forEach(x=>x.classList.toggle('active',x===b));const t=$('.v6-target p',root);if(t)t.textContent=`${GAME[A.game].name} / ${petName(activeArenaPet())}`});
  $$('[data-pet]',root).forEach(b=>b.onclick=()=>{touch();A.petId=b.dataset.pet;$$('[data-pet]',root).forEach(x=>x.classList.toggle('active',x===b));const t=$('.v6-target p',root);if(t)t.textContent=`${GAME[A.game].name} / ${petName(activeArenaPet())}`});
  $('#v6RandomMatch')?.addEventListener('click',startRandom);$('#v6CancelQueue')?.addEventListener('click',cancelQueue);
  $('#v6SendChallenge')?.addEventListener('click',sendChallenge);$('#v6ClearTarget')?.addEventListener('click',()=>{A.target=null;renderArena(true)});
  $$('[data-friend-battle]',root).forEach(b=>b.onclick=()=>{A.target=(socialState?.friends||[]).find(f=>f.playerId===b.dataset.friendBattle)||null;renderArena(true)});
  $$('[data-accept]',root).forEach(b=>b.onclick=()=>respondChallenge(b.dataset.accept,true,b.dataset.cgame));
  $$('[data-decline]',root).forEach(b=>b.onclick=()=>respondChallenge(b.dataset.decline,false));
}
async function startRandom(){
  if(A.queueing)return;
  const p=activeArenaPet();if(!p)return showToast?.('出場する文鳥を選んでください','warning');
  A.queueing=true;renderArena();
  try{
    const r=await arena('queue',{petId:p.id,gameType:A.game});A.dash=r.data;
    if(r.matchmaking?.status==='matched'){
      const m=await arena('match',{matchId:r.matchmaking.matchId});
      A.match=m.data;A.queueing=false;openMatch(A.match);
    }else{
      A.queueing=false;renderArena();showToast?.('対戦相手を探しています…');
    }
  }catch(e){
    A.queueing=false;
    const recovered=await refreshArena().catch(()=>null);
    if(recovered?.activeMatch)return;
    renderArena();showToast?.(e.message,'warning');
  }
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

function arenaVoice(text){
  if(G?.soundMode==='off'||!('speechSynthesis'in window))return;
  const now=Date.now();if(now-A.voiceAt<420)return;A.voiceAt=now;
  try{
    const synth=window.speechSynthesis,voices=synth.getVoices?.()||[];
    const ja=voices.filter(v=>String(v.lang||'').toLowerCase().startsWith('ja'));
    const preferred=ja.find(v=>/kyoko|oto ya|otoya|haruka|nanami|japanese/i.test(v.name||''))||ja[0]||voices[0];
    synth.cancel();
    const u=new SpeechSynthesisUtterance(String(text||'').slice(0,80));
    u.lang='ja-JP';u.rate=.98;u.pitch=1.02;u.volume=.92;if(preferred)u.voice=preferred;
    synth.speak(u);
  }catch(e){}
}
function arenaSfx(kind='tick'){
  if(G?.soundMode==='off')return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    A.audio=A.audio||new AC();if(A.audio.state==='suspended')A.audio.resume?.();
    const ctx=A.audio,t=ctx.currentTime,g=ctx.createGain(),o1=ctx.createOscillator(),o2=ctx.createOscillator();
    const cfg=kind==='go'?{a:660,b:990,d:.22,v:.11,type:'triangle'}:kind==='hit'?{a:150,b:92,d:.18,v:.13,type:'sawtooth'}:kind==='match'?{a:440,b:740,d:.28,v:.10,type:'sine'}:{a:520,b:640,d:.09,v:.075,type:'sine'};
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(cfg.v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+cfg.d);
    o1.type=cfg.type;o2.type=kind==='hit'?'square':'sine';o1.frequency.setValueAtTime(cfg.a,t);o2.frequency.setValueAtTime(cfg.b,t);
    if(kind==='go'){o1.frequency.exponentialRampToValueAtTime(820,t+cfg.d);o2.frequency.exponentialRampToValueAtTime(1180,t+cfg.d)}
    o1.connect(g);o2.connect(g);g.connect(ctx.destination);o1.start(t);o2.start(t+.018);o1.stop(t+cfg.d+.03);o2.stop(t+cfg.d+.03);
    if(navigator.vibrate){if(kind==='hit')navigator.vibrate([35,25,35]);else if(kind==='go')navigator.vibrate(24)}
  }catch(e){}
}
function openMatch(m){
  if(!m||A.playing||A.preparing)return;
  A.match=m;A.preparing=true;A.ready=false;A.counting=false;closeSheet($('#v6Arena'));arenaSfx('match');
  const b=$('#v6Battle');b.classList.add('show');renderMatchLobby(m);clearInterval(A.matchPoll);
  A.matchPoll=setInterval(pollMatch,700);arenaVoice('対戦相手が見つかりました。接続を確認します。');prepareMatch();
}
function renderMatchLobby(m){
  const b=$('#v6Battle'),g=GAME[m.gameType]||GAME.flight,isBot=!!m.opponent?.profile?.isBot;
  b.innerHTML=`<div class="v6-match-top"><button id="v6LeaveBattle">×</button><div><small>${g.icon} ${g.name}</small><b id="v6MatchStatus">接続チェック中</b></div><span id="v6OpponentLive">${isBot?'CPU READY':'相手を確認中'}</span></div>
  <div class="v6-versus v72-match-found"><article><span>${petIcon(m.me.pet)}</span><b>${esc(m.me.pet?.name)}</b><small>YOU / ${m.me.pet?.stats?.rating||1000}</small></article><strong>VS</strong><article><span>${petIcon(m.opponent.pet)}</span><b>${esc(m.opponent.pet?.name)}</b><small>${esc(m.opponent.profile?.displayName||'RIVAL')} / ${m.opponent.pet?.stats?.rating||1000} ${isBot?'<i class="v72-cpu-badge">CPU</i>':''}</small></article></div>
  <div class="v72-connection-check" id="v72ConnectionCheck"><div class="v72-loading-ring"></div><div><b>対戦環境を確認しています</b><small class="v72-security-step active" data-check="auth">参加権限と対戦IDを検証</small><small class="v72-security-step" data-check="sync">時刻・seed・ゲーム整合性を確認</small><small class="v72-security-step" data-check="network">通信安定性を測定</small><small class="v72-security-step" data-check="rival">相手のREADYを待機</small></div></div>
  <div class="v71-live-duel"><div><small>YOU</small><i><em id="v71MeLive"></em></i><b id="v71MeLiveText">0%</b></div><div><small>RIVAL</small><i><em id="v71RivalLive"></em></i><b id="v71RivalLiveText">0%</b></div></div>
  <div id="v6Countdown" class="v6-countdown"></div><div id="v6GameStage" class="v6-game-stage"></div><div id="v6Result" class="v6-result"></div><button id="v721ExitBattle" class="v721-exit-battle">対戦から出る</button>`;
  $('#v6LeaveBattle').onclick=leaveBattle;$('#v721ExitBattle').onclick=leaveBattle;
}
function setCheck(name,state='ok'){
  const el=$(`[data-check="${name}"]`);if(!el)return;el.classList.add(state);if(state==='active')el.classList.add('active');
}
async function prepareMatch(){
  if(!A.match)return;const status=$('#v6MatchStatus');let samples=[];
  try{
    setCheck('auth','active');
    for(let i=0;i<3;i++){
      const t=performance.now(),r=await arena('match',{matchId:A.match.id});samples.push(performance.now()-t);
      if(!r.data)throw new Error('対戦情報を確認できません');A.match=r.data;if(i===0)setCheck('auth');
      await sleep(90);
    }
    setCheck('sync','active');
    if(!GAME[A.match.gameType]||!Number.isFinite(Number(A.match.seed)))throw new Error('対戦データの整合性を確認できません');
    setCheck('sync');setCheck('network','active');
    const sorted=samples.slice().sort((a,b)=>a-b),rtt=Math.round(sorted[Math.floor(sorted.length/2)]||0);
    if(rtt>2800)throw new Error('通信が不安定です。再接続してください');
    const h=await arena('handshake',{matchId:A.match.id,rttMs:rtt,clientVersion:'7.2.1'});
    A.match=h.data||A.match;A.ready=true;setCheck('network');setCheck('rival','active');
    if(status)status.textContent=`READY / ${rtt}ms`;
    await waitForBothReady();
  }catch(e){
    A.preparing=false;if(status)status.textContent='接続チェック失敗';
    const box=$('#v72ConnectionCheck');if(box)box.innerHTML=`<div><b>接続を開始できませんでした</b><small>${esc(e.message||'通信を確認してください')}</small><button id="v72RetryConnect">再チェック</button></div>`;
    $('#v72RetryConnect')?.addEventListener('click',()=>{A.preparing=true;renderMatchLobby(A.match);prepareMatch()});arenaVoice('接続を確認できませんでした。');
  }
}
async function waitForBothReady(){
  const deadline=Date.now()+22000;
  while(A.match&&Date.now()<deadline){
    const r=await arena('heartbeat',{matchId:A.match.id});if(r.data)A.match=r.data;updateOpponent(A.match);
    const conn=A.match?.connection||{};
    if(conn.meReady&&conn.opponentReady&&conn.opponentFresh&&conn.startLocked){
      setCheck('rival');const box=$('#v72ConnectionCheck');if(box){box.classList.add('complete');setTimeout(()=>box.remove(),420)}
      A.preparing=false;arenaVoice('接続は安定しています。対戦を開始します。');countdownToStart();return;
    }
    const status=$('#v6MatchStatus');if(status&&!conn.opponentFresh)status.textContent='相手の接続を待っています…';
    await sleep(400);
  }
  throw new Error('相手の接続を確認できませんでした');
}
async function countdownToStart(){
  if(A.counting)return;A.counting=true;
  try{
    while(A.match&&!A.playing){
      const r=await arena('heartbeat',{matchId:A.match.id});if(r.data)A.match=r.data;
      const conn=A.match?.connection||{};
      if(!conn.startLocked||!conn.opponentFresh){A.counting=false;const el=$('#v6Countdown');if(el)el.innerHTML='<small>相手の再接続を待っています…</small>';await waitForBothReady();return}
      const left=Date.parse(A.match.startsAt)-Date.now(),el=$('#v6Countdown');
      if(left<=0){if(el)el.innerHTML='<b>GO!</b>';arenaSfx('go');arenaVoice('スタート');$('#v6Battle')?.classList.add('v72-battle-flash');setTimeout(()=>$('#v6Battle')?.classList.remove('v72-battle-flash'),480);setTimeout(()=>el?.classList.add('gone'),350);startGame(A.match.gameType);return}
      const n=Math.max(1,Math.ceil(left/1000));if(el)el.innerHTML=`<b>${n}</b><small>SYNC READY</small>`;if(n<=3)arenaSfx('tick');await sleep(320);
    }
  }catch(e){A.counting=false;const status=$('#v6MatchStatus');if(status)status.textContent='再接続中…'}
}
async function pollMatch(){
  if(!A.match)return;
  try{
    const r=await arena('heartbeat',{matchId:A.match.id});if(!r.data)return;A.match=r.data;updateOpponent(r.data);
    const status=$('#v6MatchStatus');if(status&&A.playing&&status.textContent==='再接続中…')status.textContent='対戦中';
    if(r.data.status==='finished'||r.data.status==='abandoned')showResult(r.data);
  }catch(e){const status=$('#v6MatchStatus');if(status&&A.playing)status.textContent='再接続中…'}
}
function livePercent(game,p){
  if(game==='flight')return clamp(Number(p?.height||0)/21600*100,0,100);
  if(game==='kale')return clamp(Number(p?.count||0)/181*100,0,100);
  if(game==='seedrace')return clamp(Number(p?.count||0)/120*100,0,100);
  if(game==='ring')return clamp(Number(p?.hits||0)/16*100,0,100);
  return clamp(Number(p?.hits||0)/12*100,0,100);
}
function updateLiveMeter(side,p){
  const pct=livePercent(A.match?.gameType,p),bar=$(side==='me'?'#v71MeLive':'#v71RivalLive'),label=$(side==='me'?'#v71MeLiveText':'#v71RivalLiveText');
  if(bar)bar.style.width=pct.toFixed(1)+'%';if(label)label.textContent=Math.round(pct)+'%';
}
function updateOpponent(m){
  const el=$('#v6OpponentLive');if(!el)return;const p=m.opponent?.progress||{};updateLiveMeter('rival',p);
  const rival=$('#flightRivalBird');if(rival){rival.style.left=`${clamp((Number(p.x||0)+1)/2*100,6,94)}%`;rival.style.top=`${clamp((Number(p.y||0)+1)/2*72+10,10,82)}%`;rival.style.opacity=p.ready===false?'.35':'.86'}
  const perch=$('#perchRivalBird');if(perch)perch.style.left=`${[17,50,83][clamp(Math.round((Number(p.x||0)+1)),0,2)]}%`;
  const seed=$('#seedRivalBird');if(seed)seed.style.left=`${clamp(Number(p.count||0)/120*88+5,5,93)}%`;
  const ring=$('#ringRivalBird');if(ring)ring.style.left=`${clamp(Number(p.hits||0)/16*88+5,5,93)}%`;
  const rc=$('#v72RivalCount');
  if(rc){
    const value=String(p.count||p.hits||0),prev=rc.dataset.last||'';
    rc.textContent=value;rc.dataset.last=value;
    if(prev&&prev!==value){const visual=$('.v72-rival-bird,#perchRivalBird,#seedRivalBird,#ringRivalBird,.v72-rival-kale');visual?.classList.remove('v72-rival-action');void visual?.offsetWidth;visual?.classList.add('v72-rival-action')}
  }
  if(m.gameType==='flight')el.textContent=`RIVAL ${Math.round((p.height||0)/10)}m / HP ${Math.round(p.hp??100)}`;
  else if(m.gameType==='kale')el.textContent=`RIVAL ${p.count||0} bite`;
  else if(m.gameType==='seedrace')el.textContent=`RIVAL ${p.count||0} seed`;
  else el.textContent=`RIVAL ${p.hits||0} hit`;
}
async function progress(obj){
  updateLiveMeter('me',obj);if(!A.match||Date.now()-A.lastProgress<520)return;A.lastProgress=Date.now();
  try{await arena('progress',{matchId:A.match.id,progress:obj})}catch(e){}
}
function seeded(seed){let x=(Number(seed)||123456789)>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function startGame(type){
  if(A.playing)return;A.playing=true;A.preparing=false;const status=$('#v6MatchStatus');if(status)status.textContent='対戦中';
  if(type==='flight')flightGame();else if(type==='kale')kaleGame();else if(type==='perch')perchGame();else if(type==='seedrace')seedRaceGame();else ringGame();
}
function flightGame(){
  const stage=$('#v6GameStage'),p=A.match.me.pet,rnd=seeded(A.match.seed),duration=30000;
  stage.innerHTML='<div class="flight-hud"><span>DIST <b id="fHeight">0</b>m</span><span>HP <b id="fHp">100</b></span><span>体力 <b id="fStamina">100</b>%</span></div><div class="flight-field v72-dual-field v721-flight-2d" id="flightField"><div class="flight-clouds"></div><div class="flight-bird v72-me-bird" id="flightBird">🐦<small>YOU</small></div><div class="flight-bird v72-rival-bird" id="flightRivalBird">🐦<small>RIVAL</small></div><div class="flight-obstacles" id="flightObs"></div></div><div class="v721-flight-pad"><button id="fUp">↑</button><div><button id="fLeft">←</button><button id="fDown">↓</button><button id="fRight">→</button></div><small>画面をドラッグして上下左右にも移動できます</small></div>';
  const field=$('#flightField'),bird=$('#flightBird'),obsRoot=$('#flightObs');
  let x=.24,y=.5,distance=0,collisions=0,stamina=100,hp=100,last=performance.now(),t0=last,nextSpawn=650,raf=0,done=false,obs=[];
  const weightFit=1-Math.min(Math.abs(stat(p,'weightG',24.5)-stat(p,'idealWeightG',24.5))/Math.max(1,stat(p,'idealWeightG',24.5)),.35);
  const speed=.29+stat(p,'flightPower')*.0018+stat(p,'endurance')*.0008+weightFit*.05,handling=.055+stat(p,'agility')*.0009;
  function setPos(nx,ny){x=clamp(nx,.07,.93);y=clamp(ny,.10,.86);bird.style.left=`${x*100}%`;bird.style.top=`${y*100}%`}
  function pointer(e){const r=field.getBoundingClientRect();setPos((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)}
  field.addEventListener('pointerdown',e=>{field.setPointerCapture?.(e.pointerId);pointer(e)});field.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')pointer(e)});
  $('#fLeft').onpointerdown=()=>setPos(x-handling,y);$('#fRight').onpointerdown=()=>setPos(x+handling,y);$('#fUp').onpointerdown=()=>setPos(x,y-handling);$('#fDown').onpointerdown=()=>setPos(x,y+handling);
  function addObs(spawnAt){
    const oy=.12+rnd()*.68,ow=.075+rnd()*.075,oh=.12+rnd()*.18,el=document.createElement('div');
    el.className='v721-flight-block';obsRoot.appendChild(el);obs.push({spawnAt,x:1.08,y:oy,w:ow,h:oh,hit:false,el});
  }
  function hit(){collisions++;distance=Math.max(0,distance-170);stamina=Math.max(0,stamina-10);hp=Math.max(0,hp-16);field.classList.add('hit','v72-hit-shake');arenaSfx('hit');setTimeout(()=>field.classList.remove('hit','v72-hit-shake'),290)}
  function frame(now){
    const dt=Math.min(34,now-last);last=now;const t=now-t0;if(done)return;
    stamina=Math.max(0,100-t/1000*(1.35-stat(p,'endurance')*.0055));distance+=dt*speed*(.72+stamina/360)*(hp<=0?.68:1);
    while(t>=nextSpawn){addObs(nextSpawn);nextSpawn+=760}
    for(const o of obs){
      o.x=1.08-Math.max(0,t-o.spawnAt)*.00048;o.el.style.left=`${o.x*100}%`;o.el.style.top=`${o.y*100}%`;o.el.style.width=`${o.w*100}%`;o.el.style.height=`${o.h*100}%`;
      const bx=x,by=y,bw=.055,bh=.075;if(!o.hit&&Math.abs(bx-o.x)<(bw+o.w)/2&&Math.abs(by-o.y)<(bh+o.h)/2){o.hit=true;hit()}
    }
    obs=obs.filter(o=>{if(o.x<-.15){o.el.remove();return false}return true});
    $('#fHeight').textContent=Math.round(distance/10);$('#fStamina').textContent=Math.round(stamina);$('#fHp').textContent=Math.round(hp);
    progress({t:Math.round(t),x:x*2-1,y:y*2-1,height:Math.round(distance),hp});
    if(t>=duration){done=true;cancelAnimationFrame(raf);submitGame({durationMs:duration,height:distance,collisions});return}raf=requestAnimationFrame(frame)
  }
  setPos(x,y);raf=requestAnimationFrame(frame);A.gameState={stop:()=>{done=true;cancelAnimationFrame(raf)}}
}
function kaleGame(){
  const stage=$('#v6GameStage'),p=A.match.me.pet,duration=10000;let taps=0,done=false,t0=Date.now(),timer;
  stage.innerHTML=`<div class="kale-hud"><span>TIME <b id="kTime">10.0</b></span><span>YOU <b id="kCount">0</b></span><span>RIVAL <b id="v72RivalCount">0</b></span></div><div class="v72-kale-duel"><article><div class="v72-duel-bird v72-me-bird">${petIcon(A.match.me.pet)}</div><b>YOU</b><button id="kaleTap" class="kale-tap"><span>🥬</span><strong>連打！</strong><i></i></button></article><article><div class="v72-duel-bird v72-rival-bird">${petIcon(A.match.opponent.pet)}</div><b>RIVAL</b><div class="v72-rival-kale">🥬<small>相手も食べています</small></div></article></div><p class="kale-power" id="kPower"></p>`;
  const btn=$('#kaleTap');btn.onclick=()=>{if(done)return;taps++;$('#kCount').textContent=taps;btn.classList.remove('bite');void btn.offsetWidth;btn.classList.add('bite');$('#kPower').textContent=`食いしん坊 ${Math.round(stat(p,'appetite'))} / くちばし速度 ${Math.round(stat(p,'beakSpeed'))}`;progress({t:Date.now()-t0,count:taps})};
  timer=setInterval(()=>{const left=Math.max(0,duration-(Date.now()-t0));$('#kTime').textContent=(left/1000).toFixed(1);if(left<=0){clearInterval(timer);done=true;btn.disabled=true;submitGame({durationMs:duration,taps})}},50);A.gameState={stop:()=>{done=true;clearInterval(timer)}}
}
function perchGame(){
  const stage=$('#v6GameStage'),p=A.match.me.pet,rnd=seeded(A.match.seed^0x51f15e),rounds=12;let round=0,hits=0,misses=0,reactions=[],target=-1,started=0,timeout=null,done=false;
  stage.innerHTML='<div class="perch-hud"><span>ROUND <b id="pRound">1/12</b></span><span>YOU <b id="pHits">0</b></span><span>RIVAL <b id="v72RivalCount">0</b></span></div><div class="perch-stage v72-dual-perch"><div class="perch-bird v72-me-bird" id="perchBird">🐦<small>YOU</small></div><div class="perch-bird v72-rival-bird" id="perchRivalBird">🐦<small>RIVAL</small></div><button data-perch="0">左</button><button data-perch="1">中央</button><button data-perch="2">右</button></div><p id="pGuide">同じ合図を2羽が見ています。光ったとまり木をタップ！</p>';
  const buttons=$$('[data-perch]',stage),bird=$('#perchBird');
  function next(){if(done)return;if(round>=rounds)return finish();buttons.forEach(b=>b.classList.remove('target','wrong'));target=Math.floor(rnd()*3);buttons[target].classList.add('target');started=performance.now();$('#pRound').textContent=`${round+1}/${rounds}`;const limit=900+stat(p,'focus')*5+stat(p,'temperament')*2;timeout=setTimeout(()=>{misses++;round++;progress({t:round*1000,hits,x:target-1});next()},limit)}
  buttons.forEach(b=>b.onclick=()=>{if(done||target<0)return;clearTimeout(timeout);const n=+b.dataset.perch;if(n===target){hits++;reactions.push(performance.now()-started);bird.style.left=[17,50,83][n]+'%';$('#pHits').textContent=hits;arenaSfx('tick')}else{misses++;b.classList.add('wrong');arenaSfx('hit')}round++;progress({t:round*1000,hits,x:n-1});setTimeout(next,120)});
  function finish(){done=true;buttons.forEach(b=>b.disabled=true);const avg=reactions.length?reactions.reduce((a,b)=>a+b,0)/reactions.length:1500;submitGame({hits,misses,avgReactionMs:avg})}
  next();A.gameState={stop:()=>{done=true;clearTimeout(timeout)}}
}
function seedRaceGame(){
  const stage=$('#v6GameStage'),duration=15000;let count=0,done=false,t0=Date.now(),timer;
  stage.innerHTML=`<div class="perch-hud"><span>TIME <b id="srTime">15.0</b></span><span>YOU <b id="srCount">0</b></span><span>RIVAL <b id="v72RivalCount">0</b></span></div><div class="v72-race-track"><i class="lane one"></i><i class="lane two"></i><div class="v72-race-bird v72-me-bird" id="seedMeBird">${petIcon(A.match.me.pet)}<small>YOU</small></div><div class="v72-race-bird v72-rival-bird" id="seedRivalBird">${petIcon(A.match.opponent.pet)}<small>RIVAL</small></div><div class="v72-finish">🏁</div></div><button id="seedRaceTap" class="v72-race-tap">🌾 シードを取る！</button>`;
  const btn=$('#seedRaceTap'),me=$('#seedMeBird');btn.onclick=()=>{if(done)return;count++;$('#srCount').textContent=count;me.style.left=`${clamp(count/120*88+5,5,93)}%`;btn.classList.remove('pop');void btn.offsetWidth;btn.classList.add('pop');progress({t:Date.now()-t0,count})};
  timer=setInterval(()=>{const left=Math.max(0,duration-(Date.now()-t0));$('#srTime').textContent=(left/1000).toFixed(1);if(left<=0){clearInterval(timer);done=true;btn.disabled=true;submitGame({durationMs:duration,count})}},50);A.gameState={stop:()=>{done=true;clearInterval(timer)}}
}
function ringGame(){
  const stage=$('#v6GameStage'),rnd=seeded(A.match.seed^0x77331),rounds=16,duration=20000;
  let round=0,hits=0,misses=0,errors=[],roundStart=0,raf=0,done=false,t0=performance.now(),locked=true,unlockTimer=null,missTimer=null;
  stage.innerHTML=`<div class="perch-hud"><span>RING <b id="rgRound">1/${rounds}</b></span><span>YOU <b id="rgHits">0</b></span><span>RIVAL <b id="v72RivalCount">0</b></span></div><div class="v72-ring-track"><div class="v72-race-bird v72-me-bird" id="ringMeBird">${petIcon(A.match.me.pet)}</div><div class="v72-race-bird v72-rival-bird" id="ringRivalBird">${petIcon(A.match.opponent.pet)}</div><div class="v72-ring">⭕</div></div><div class="v72-timing-track"><i></i><em id="ringCursor"></em></div><button id="ringTap" class="v72-race-tap" disabled>待って…</button>`;
  const cur=$('#ringCursor'),btn=$('#ringTap'),me=$('#ringMeBird');
  function clearRoundTimers(){clearTimeout(unlockTimer);clearTimeout(missTimer)}
  function begin(){
    if(done)return;if(round>=rounds)return finish();clearRoundTimers();locked=true;btn.disabled=true;btn.textContent='タイミングを見て…';
    roundStart=performance.now()-(rnd()*.06)*900;$('#rgRound').textContent=`${round+1}/${rounds}`;
    const thisRound=round;
    unlockTimer=setTimeout(()=>{if(done||round!==thisRound)return;locked=false;btn.disabled=false;btn.textContent='今！'},450);
    missTimer=setTimeout(()=>{if(done||round!==thisRound)return;locked=true;btn.disabled=true;misses++;errors.push(900);round++;arenaSfx('hit');progress({t:Math.round(performance.now()-t0),hits,x:0});setTimeout(begin,90)},1100);
  }
  function frame(now){if(done)return;const phase=((now-roundStart)%900)/900;cur.style.left=`${phase*100}%`;raf=requestAnimationFrame(frame)}
  btn.onclick=()=>{
    if(done||locked)return;locked=true;btn.disabled=true;clearRoundTimers();
    const phase=((performance.now()-roundStart)%900)/900,error=Math.abs(phase-.5)*1800;errors.push(error);
    if(error<=190){hits++;arenaSfx('tick')}else{misses++;arenaSfx('hit')}
    round++;$('#rgHits').textContent=hits;me.style.left=`${clamp(hits/rounds*88+5,5,93)}%`;
    progress({t:Math.round(performance.now()-t0),hits,x:(phase-.5)*2});
    setTimeout(begin,650);
  };
  begin();raf=requestAnimationFrame(frame);
  function finish(){
    if(done)return;done=true;clearRoundTimers();cancelAnimationFrame(raf);btn.disabled=true;btn.textContent='FINISH';
    misses=Math.max(misses,rounds-hits);const avg=errors.length?errors.reduce((a,b)=>a+b,0)/errors.length:900;
    const elapsed=performance.now()-t0,wait=Math.max(0,15500-elapsed);
    setTimeout(()=>submitGame({durationMs:duration,hits,misses,avgReactionMs:avg}),wait);
  }
  A.gameState={stop:()=>{done=true;clearRoundTimers();cancelAnimationFrame(raf)}}
}
async function submitGame(raw){
  $('#v6MatchStatus').textContent='結果を送信中…';
  try{
    const r=await arena('submit',{matchId:A.match.id,raw});A.match=r.data||r.submission?.match||A.match;A.playing=false;
    if(A.match.status==='finished')showResult(A.match);else{$('#v6MatchStatus').textContent='相手の結果を待っています…';$('#v6GameStage').innerHTML='<div class="v6-wait-rival"><i></i><b>RIVAL PLAYING</b><small>相手のゲーム終了を待っています</small></div>'}
  }catch(e){A.playing=false;$('#v6MatchStatus').textContent='送信エラー';showToast?.(e.message,'warning')}
}
function showResult(m){
  A.playing=false;A.gameState?.stop?.();const root=$('#v6Result');if(!root)return;
  if(m.status==='abandoned'){
    $('#v6MatchStatus').textContent='CANCELLED';$('#v6GameStage').innerHTML='';
    root.innerHTML='<div class="result-burst draw"><small>CANCELLED</small><h2>対戦を終了しました</h2><p>接続切れ、時間切れ、または両者未完了のため中止されました。</p><div class="v71-result-actions"><button id="v6ResultAgain">もう一戦</button><button id="v6ResultClose" class="subtle">閉じる</button></div></div>';
    clearInterval(A.matchPoll);arenaVoice('対戦は中止されました。');$('#v6ResultAgain').onclick=()=>{closeBattle();openArena()};$('#v6ResultClose').onclick=()=>{closeBattle();refreshArena(true)};return;
  }
  const me=m.me?.profile?.playerId,w=m.winnerPlayerId,draw=!w,win=w===me,reward=win?m.reward:null;
  if(reward&&Number.isFinite(Number(reward.currentCoins))&&typeof G!=='undefined'){G.coins=Number(reward.currentCoins);try{updateUI?.()}catch(e){}}
  const rewardHtml=reward&&Number(reward.coins||0)>0?`<div class="v724-win-reward"><small>WIN REWARD</small><b>🪙 +${Number(reward.coins).toLocaleString()}　✨ +${Number(reward.xp||0)} XP</b><span>サーバーに受取済み</span></div>`:'';
  $('#v6MatchStatus').textContent='FINISHED';$('#v6GameStage').innerHTML='';
  root.innerHTML=`<div class="result-burst ${draw?'draw':win?'win':'lose'}"><small>${draw?'DRAW':win?'WIN':'LOSE'}</small><h2>${draw?'引き分け':win?'勝利！':'惜敗'}</h2><div><span><b>${Number(m.me.score||0).toLocaleString()}</b><small>YOU</small></span><strong>:</strong><span><b>${Number(m.opponent.score||0).toLocaleString()}</b><small>RIVAL</small></span></div><p>RATING ${m.me.pet?.stats?.rating||1000}${Number(m.me.pet?.fusionLevel||0)>0?' ・ 🧬 合成Lv '+Number(m.me.pet.fusionLevel):''}</p>${rewardHtml}<div class="v71-result-actions"><button id="v6ResultAgain">もう一戦</button><button id="v6ResultClose" class="subtle">閉じる</button></div></div>`;
  clearInterval(A.matchPoll);arenaSfx(win?'go':draw?'match':'hit');arenaVoice(draw?'引き分けです。おつかれさまでした。':win?'勝利です！ 報酬を獲得しました。':'対戦終了です。次は取り返しましょう。');if(reward)showToast?.(`🏆 勝利報酬！ +${Number(reward.coins||0)}コイン / +${Number(reward.xp||0)}XP`,'achievement');window.v7RefreshProgress?.(true);
  $('#v6ResultAgain').onclick=()=>{closeBattle();openArena()};
  $('#v6ResultClose').onclick=()=>{closeBattle();refreshArena(true)}
}
async function leaveBattle(){
  if(A.playing&&!confirm('対戦を途中で終了しますか？'))return;
  try{if(A.match&&['ready','running'].includes(A.match.status))await arena('abandon',{matchId:A.match.id})}catch(e){}
  closeBattle();
}
function closeBattle(){A.gameState?.stop?.();clearInterval(A.matchPoll);A.matchPoll=null;A.playing=false;A.preparing=false;A.ready=false;A.counting=false;A.match=null;A.gameState=null;try{speechSynthesis?.cancel?.()}catch(e){}$('#v6Battle')?.classList.remove('show');$('#v6Battle').innerHTML=''}
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
  try{const r=await arena('care',{petId:p.id,care:action});if(r.data){if(r.data.lifeStage)p.lifeStage=r.data.lifeStage;if(Number.isFinite(Number(r.data.growthPoints)))p.growthPoints=Number(r.data.growthPoints);p.stats={...(p.stats||{}),...r.data};renderOverview();renderPetSheet();window.v7RefreshProgress?.();if(p.lifeStage==='adult'&&typeof refresh==='function'){N.last=0;refresh(true)}}}catch(e){}
}
function startPolling(){clearInterval(A.poll);A.poll=setInterval(()=>{if(logged()&&(!document.hidden||$('#v6Arena')?.classList.contains('show')))refreshArena()},2200)}
function boot(){build();startPolling();if(logged())setTimeout(()=>refreshArena(),600)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,100),{once:true}):setTimeout(boot,100);
})();