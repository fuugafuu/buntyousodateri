const GOOGLE_CLIENT_ID='1027705662725-bn7tbc4rrflvv5sk0redv6043nnmajld.apps.googleusercontent.com';
const LOCAL_SOCIAL_RECORD='social-local';
const DEMO_PROFILES={
  'MF-MOCHI001':{playerId:'MF-MOCHI001',displayName:'もち飼いさん',score:4820,character:{name:'もち',species:'buncho_white',speciesName:'白文鳥',icon:'🕊️',level:18,bond:520}},
  'MF-KINAKO02':{playerId:'MF-KINAKO02',displayName:'きなこの家',score:3910,character:{name:'きなこ',species:'cat',speciesName:'ねこ',icon:'🐱',level:14,bond:370}},
  'MF-SORA0003':{playerId:'MF-SORA0003',displayName:'そらさん',score:3360,character:{name:'そら',species:'penguin',speciesName:'ペンギン',icon:'🐧',level:12,bond:290}}
};
let socialState={playerId:'',friends:[],ranking:[],gifts:[],mode:'local'};
let selectedFriend=null,socialTab='grow',googleRendered=false,identityLoading=false;
function isLocalStaticMode(){return['127.0.0.1','localhost'].includes(location.hostname);}
function isGoogleProductionOrigin(){return location.hostname==='buntyousodateri.vercel.app';}

function localDateKey(offset=0){const d=new Date(Date.now()+offset*86400000);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function createLocalPlayerId(){
  const bytes=new Uint8Array(4);crypto.getRandomValues(bytes);
  return `MF-${[...bytes].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase()}`;
}
function calculatePlayerScore(){
  const best=Object.values(G.minigameStats?.bestScores||{}).reduce((sum,value)=>sum+Math.min(500,Number(value)||0),0);
  return Math.round(G.level*250+(G.missions?.completed||0)*80+(G.social?.bond||0)*3+best+G.unlocked.length*120);
}
function buildPlayerSnapshot(){
  const b=birds[G.species]||birds.buncho_sakura;
  return{displayName:identityUser?.name||'ゲスト飼い主',score:calculatePlayerScore(),character:{name:getCurrentBirdName(),species:G.species,speciesName:b.name,icon:b.icon,level:G.level,bond:G.social?.bond||0}};
}
async function initLocalSocial(){
  const saved=await saveDbGet(LOCAL_SOCIAL_RECORD).catch(()=>null);
  if(saved&&typeof saved==='object')socialState={...socialState,...saved,mode:'local'};
  if(!/^MF-[A-Z0-9]{8}$/.test(socialState.playerId||''))socialState.playerId=createLocalPlayerId();
  if(!Array.isArray(socialState.friends))socialState.friends=[];
  if(!Array.isArray(socialState.gifts))socialState.gifts=[];
  await persistLocalSocial();
}
function persistLocalSocial(){
  const safe={playerId:socialState.playerId,friends:socialState.friends.slice(0,100),gifts:socialState.gifts.slice(-100)};
  return saveDbSet(LOCAL_SOCIAL_RECORD,safe).catch(()=>{});
}
function applyGameState(next){
  if(!next||typeof next!=='object')return;
  G=normalizeGameState(next);ensureNewSettings();updateUI();renderInv();renderSocial();save();
}
function renderSyncedGameState(){
  G=normalizeGameState(G);ensureNewSettings();G.name=getCurrentBirdName();
  updateUI();renderBird();renderInv();renderShop();renderMissions();renderCustomize();renderSocial();
}
async function pullCloudSave(){
  const userId=String(identityUser?.id||'');
  if(!userId)return false;
  const accountKey=accountSaveRecordKey(userId);
  const accountLocal=await saveDbGet(accountKey).catch(()=>null);
  try{
    const response=await fetch('/api/cloud-save',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(payload.configured===false)cloudSaveEnabled=false;
    if(!response.ok)throw new Error(payload.message||`cloud_load_${response.status}`);
    cloudSaveEnabled=true;
    const remote=payload.data;
    if(remote?.data){
      const remoteTime=Date.parse(remote.savedAt||0)||0,accountTime=Date.parse(accountLocal?.savedAt||0)||0;
      if(accountLocal?.data&&accountTime>remoteTime){
        G=normalizeGameState(accountLocal.data);
        const saved=await putCloudSave(accountLocal);
        await saveDbSet(accountKey,{...accountLocal,savedAt:saved.savedAt||accountLocal.savedAt,data:stateForStorage()});
        showToast('この端末に残っていたアカウントデータを同期しました','achievement');
      }else{
        G=normalizeGameState(remote.data);
        await saveDbSet(accountKey,{version:'4.0.0',savedAt:remote.savedAt,data:stateForStorage()});
        document.body.dataset.sync='cloud';
        showToast('Googleアカウントの続きから再開しました','achievement');
      }
    }else{
      const guest=await saveDbGet(SAVE_RECORD).catch(()=>null);
      const initial=accountLocal?.data?accountLocal:(guest?.data?guest:{version:'4.0.0',savedAt:new Date().toISOString(),data:stateForStorage()});
      G=normalizeGameState(initial.data);
      const saved=await putCloudSave(initial);
      await saveDbSet(accountKey,{...initial,savedAt:saved.savedAt||initial.savedAt,data:stateForStorage()});
      showToast('現在の育成データをGoogleアカウントへ引き継ぎました','achievement');
    }
    activeSaveUserId=userId;
    renderSyncedGameState();
    return true;
  }catch(error){
    const guest=await saveDbGet(SAVE_RECORD).catch(()=>null);
    const fallback=accountLocal?.data?accountLocal:(guest?.data?guest:{version:'4.0.0',savedAt:new Date().toISOString(),data:stateForStorage()});
    G=normalizeGameState(fallback.data);
    await saveDbSet(accountKey,{...fallback,data:stateForStorage()}).catch(()=>{});
    activeSaveUserId=userId;
    document.body.dataset.sync='local';
    renderSyncedGameState();
    console.warn('Cloud load skipped',error);
    return false;
  }
}
async function remoteSocialAction(action,payload={}){
  const response=await fetch('/api/social',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,payload,snapshot:buildPlayerSnapshot()})});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(result.message||`social_${response.status}`);
  return result;
}
function applyRemoteDashboard(data){
  if(!data)return;
  socialState={...socialState,...data,mode:'cloud'};
  if(Array.isArray(data.friends))socialState.friends=data.friends;
  if(Array.isArray(data.ranking))socialState.ranking=data.ranking;
  if(Array.isArray(data.gifts))socialState.gifts=data.gifts;
}
async function syncSocialDashboard(){
  if(!identityUser)return false;
  try{const result=await remoteSocialAction('dashboard');applyRemoteDashboard(result.data);return true;}
  catch(error){socialState.mode='local';return false;}
}
async function initIdentityAndSocial(force=false){
  if(identityLoading)return;identityLoading=true;cloudSyncSuspended=true;cancelQueuedCloudSave();
  try{
    if(!socialState.playerId)await initLocalSocial();
    if(!isLocalStaticMode()){
      try{const response=await fetch('/api/auth/me',{headers:{Accept:'application/json'}});if(response.ok){const payload=await response.json();identityUser=payload.data||null;}else identityUser=null;}
      catch(error){identityUser=null;}
    }else identityUser=null;
    if(identityUser){await pullCloudSave();await syncSocialDashboard();}
    else{activeSaveUserId=null;document.body.dataset.sync='local';}
    renderIdentity();renderSocial();scheduleGoogleButton();
  }finally{cloudSyncSuspended=false;identityLoading=false;}
}
function scheduleGoogleButton(attempt=0){
  if(identityUser||googleRendered)return;
  const host=document.getElementById('googleSignInButton');if(!host)return;
  if(!isGoogleProductionOrigin()){host.textContent='公開URLでGoogleログイン';host.classList.add('google-placeholder');return;}
  if(!window.google?.accounts?.id){
    if(!document.getElementById('googleGsiScript')){const script=document.createElement('script');script.id='googleGsiScript';script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;script.onload=()=>scheduleGoogleButton(attempt+1);document.head.appendChild(script);}
    else if(attempt<20)setTimeout(()=>scheduleGoogleButton(attempt+1),300);
    return;
  }
  try{
    host.replaceChildren();
    google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleGoogleCredential,auto_select:false,cancel_on_tap_outside:true});
    google.accounts.id.renderButton(host,{theme:'outline',size:'medium',shape:'pill',text:'signin_with',locale:'ja',width:176});
    googleRendered=true;
  }catch(error){host.textContent='本番URLでGoogleログインできます';}
}
async function handleGoogleCredential(response){
  if(!response?.credential)return;
  try{
    const result=await fetch('/api/auth/google',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:response.credential})});
    const payload=await result.json().catch(()=>({}));if(!result.ok)throw new Error(payload.message||'ログインに失敗しました');
    identityUser=payload.data;googleRendered=false;showToast('Googleログインしました','achievement');await initIdentityAndSocial(true);
  }catch(error){showToast(error.message||'Googleログインに失敗しました','warning');}
}
async function logoutGoogle(){
  cloudSyncSuspended=true;cancelQueuedCloudSave();
  if(identityUser&&activeSaveUserId){
    await save();await pendingSave.catch(()=>{});
    const accountRecord=await saveDbGet(accountSaveRecordKey(activeSaveUserId)).catch(()=>null);
    if(accountRecord?.data)await putCloudSave(accountRecord).catch(()=>{});
  }
  await fetch('/api/auth/logout',{method:'POST'}).catch(()=>{});identityUser=null;activeSaveUserId=null;cloudSaveEnabled=null;socialState.mode='local';googleRendered=false;document.body.dataset.sync='local';
  const guest=await saveDbGet(SAVE_RECORD).catch(()=>null);G=normalizeGameState(guest?.data||DEFAULT_GAME_STATE);renderSyncedGameState();
  cloudSyncSuspended=false;
  try{google.accounts.id.disableAutoSelect();}catch(error){}
  renderIdentity();renderSocial();scheduleGoogleButton();showToast('ログアウトしました');
}
function openAccountHub(){
  const panel=document.getElementById('socialPanel');
  if(!panel)return;
  if(!panel.classList.contains('show'))togglePanel('social');
  setSocialTab('grow');
  setTimeout(()=>{
    panel.scrollIntoView({behavior:'smooth',block:'start'});
    const target=identityUser?document.getElementById('googleLogoutBtn'):document.getElementById('googleSignInButton');
    if(target)target.setAttribute('tabindex','-1');
  },80);
}
function renderIdentity(){
  const name=document.getElementById('identityName'),cloud=document.getElementById('cloudSaveState'),sync=document.getElementById('socialSyncState');
  if(name)name.textContent=identityUser?.name||'ゲスト';
  if(cloud)cloud.textContent=identityUser?(document.body.dataset.sync==='cloud'?'コイン・持ち物まで同期済み':'この端末のアカウント保存（クラウド未接続）'):'ゲストデータをこの端末に保存中';
  if(sync)sync.textContent=socialState.mode==='cloud'?'クラウド同期':'端末モード';
  const signIn=document.getElementById('googleSignInButton'),logout=document.getElementById('googleLogoutBtn');
  if(signIn)signIn.style.display=identityUser?'none':'block';if(logout)logout.style.display=identityUser?'inline-flex':'none';
  const shortcut=document.getElementById('accountShortcutBtn'),label=document.getElementById('accountShortcutLabel'),state=document.getElementById('accountShortcutState'),dock=document.getElementById('socialOpenBtn');
  if(shortcut){shortcut.classList.toggle('signed-in',Boolean(identityUser));shortcut.setAttribute('aria-label',identityUser?'アカウントと同期状態を開く':'Googleログインとデータ同期を開く');}
  if(label)label.textContent=identityUser?'アカウント':'ログイン';
  if(state)state.textContent=identityUser?(document.body.dataset.sync==='cloud'?'同期済み':'端末保存'):'データ同期';
  if(dock){const dockLabel=dock.querySelector('b'),dockIcon=dock.querySelector('.quick-nav-icon');if(dockLabel)dockLabel.textContent=identityUser?'アカウント':'ログイン';if(dockIcon)dockIcon.textContent=identityUser?'🌐':'👤';}
}
function recordBondAction(actionName){
  if(!G.social)G.social={bond:0,streakDays:0,lastCareDate:'',todayCare:0,todayDate:''};
  const today=localDateKey(),yesterday=localDateKey(-1);
  if(G.social.todayDate!==today){G.social.todayDate=today;G.social.todayCare=0;}
  if(G.social.lastCareDate!==today){G.social.streakDays=G.social.lastCareDate===yesterday?G.social.streakDays+1:1;G.social.lastCareDate=today;}
  const gain={feed:3,treat:5,pet:2,play:4,bath:3,train:5,sing:4}[actionName]||1;
  G.social.todayCare++;G.social.bond+=gain;
  if(G.social.bond>0&&G.social.bond%100<gain)showToast('なかよしレベルが上がった！','levelup');
}
function bondInfo(){
  const level=Math.floor((G.social?.bond||0)/100)+1,progress=(G.social?.bond||0)%100;
  const title=level>=20?'ずっと一緒':level>=12?'最高の相棒':level>=7?'大切な家族':level>=4?'なかよし':level>=2?'気になる存在':'はじめまして';
  return{level,progress,title};
}
function setSocialTab(tab){
  socialTab=['grow','friends','ranking','gifts'].includes(tab)?tab:'grow';
  document.querySelectorAll('[data-social-tab]').forEach(button=>button.classList.toggle('active',button.dataset.socialTab===socialTab));
  document.querySelectorAll('.social-tab-page').forEach(page=>page.classList.toggle('active',page.id===`social${socialTab[0].toUpperCase()+socialTab.slice(1)}Tab`));
}
function renderSocial(){
  if(!document.getElementById('socialPanel'))return;
  renderIdentity();
  const id=document.getElementById('playerIdText');if(id)id.textContent=socialState.playerId||'準備中';
  const bond=bondInfo();document.getElementById('bondLevel').textContent=`Lv.${bond.level}`;document.getElementById('bondTitle').textContent=bond.title;document.getElementById('bondBar').style.width=`${bond.progress}%`;
  document.getElementById('bondCopy').textContent=`連続お世話 ${G.social?.streakDays||0}日 ・ 次のレベルまで ${100-bond.progress}`;
  const todayCare=G.social?.todayCare||0,playedToday=G.minigameStats?.lastPlayedDate===localDateKey();
  document.getElementById('growthMissions').innerHTML=[
    {name:'今日のお世話',copy:`${Math.min(todayCare,5)}/5回`,done:todayCare>=5},
    {name:'一緒に遊ぶ',copy:playedToday?'達成！':'ミニゲームを1回',done:playedToday},
    {name:'ごきげんキープ',copy:`幸福 ${Math.round(G.happiness)}/80`,done:G.happiness>=80}
  ].map(m=>`<div class="growth-card ${m.done?'done':''}"><b>${m.done?'✓':'○'} ${m.name}</b>${m.copy}</div>`).join('');
  renderFriendList();renderRanking();renderGiftInbox();setSocialTab(socialTab);
}
function renderFriendList(){
  const list=document.getElementById('friendList');if(!list)return;
  list.innerHTML=socialState.friends.length?socialState.friends.map(friend=>`<div class="friend-card"><div class="friend-avatar">${escapeHtml(friend.character?.icon||'🐦')}</div><div><b>${escapeHtml(friend.character?.name||friend.displayName||'どうぶつ')}</b><small>${escapeHtml(friend.displayName||friend.playerId)} ・ Lv.${Number(friend.character?.level)||1}</small></div><button data-friend-id="${escapeHtml(friend.playerId)}">会いに行く</button></div>`).join(''):'<div class="social-empty">プレイヤーIDを入力して、最初のフレンドを追加しよう。</div>';
  list.querySelectorAll('[data-friend-id]').forEach(button=>button.addEventListener('click',()=>openFriendPet(button.dataset.friendId)));
}
function buildLocalRanking(){
  const me={playerId:socialState.playerId,displayName:identityUser?.name||'あなた',score:calculatePlayerScore(),character:buildPlayerSnapshot().character,isMe:true};
  return[me,...Object.values(DEMO_PROFILES),...socialState.friends].filter((row,index,all)=>all.findIndex(x=>x.playerId===row.playerId)===index).sort((a,b)=>b.score-a.score).slice(0,20);
}
function renderRanking(){
  const list=document.getElementById('rankingList');if(!list)return;const rows=socialState.ranking.length?socialState.ranking:buildLocalRanking();
  list.innerHTML=rows.map((row,index)=>`<div class="rank-row ${row.isMe||row.playerId===socialState.playerId?'me':''}"><div class="rank-no">${index<3?['🥇','🥈','🥉'][index]:index+1}</div><div><b>${escapeHtml(row.displayName||'飼い主')} ${escapeHtml(row.character?.icon||'🐦')}</b><small>${escapeHtml(row.character?.name||'どうぶつ')} ・ ${Number(row.score||0).toLocaleString()}pt</small></div><strong>${Number(row.score||0).toLocaleString()}</strong></div>`).join('');
}
function renderGiftInbox(){
  const list=document.getElementById('giftInbox');if(!list)return;const gifts=socialState.gifts.filter(g=>!g.claimedAt);
  list.innerHTML=gifts.length?gifts.map(g=>`<div class="gift-card"><div class="friend-avatar">${itemInfo[g.itemCode]?.icon||'🎁'}</div><div><b>${escapeHtml(g.senderName||'フレンド')}から ${escapeHtml(itemInfo[g.itemCode]?.name||g.itemCode)} ×${g.quantity||1}</b><small>${g.createdAt?new Date(g.createdAt).toLocaleString('ja-JP'):'仕送りが届いています'}</small></div><button data-gift-id="${escapeHtml(g.id)}">受け取る</button></div>`).join(''):'<div class="social-empty">届いている仕送りはありません。</div>';
  list.querySelectorAll('[data-gift-id]').forEach(button=>button.addEventListener('click',()=>claimGift(button.dataset.giftId)));
}
async function copyPlayerId(){
  if(!socialState.playerId)return;await navigator.clipboard?.writeText(socialState.playerId);showToast('プレイヤーIDをコピーしました','achievement');
}
async function addFriendById(){
  const input=document.getElementById('friendIdInput'),playerId=String(input.value||'').trim().toUpperCase();
  if(!/^MF-[A-Z0-9]{8}$/.test(playerId)){showToast('IDは MF-XXXXXXXX の形で入力してください','warning');return;}
  if(playerId===socialState.playerId){showToast('自分自身は追加できません','warning');return;}
  try{
    if(identityUser){const result=await remoteSocialAction('addFriend',{playerId});applyRemoteDashboard(result.data);}
    else{
      if(socialState.friends.some(f=>f.playerId===playerId)){showToast('すでにフレンドです','warning');return;}
      const friend=DEMO_PROFILES[playerId]||{playerId,displayName:'森のともだち',score:1200,character:{name:'ぴよ',species:'buncho_sakura',speciesName:'桜文鳥',icon:'🐦',level:5,bond:80}};
      socialState.friends.push(friend);await persistLocalSocial();
    }
    input.value='';renderSocial();showToast('フレンドになりました！','achievement');
  }catch(error){showToast(error.message||'フレンド追加に失敗しました','warning');}
}
function openFriendPet(playerId){
  selectedFriend=socialState.friends.find(f=>f.playerId===playerId)||DEMO_PROFILES[playerId];if(!selectedFriend)return;
  const pet=selectedFriend.character||{};document.getElementById('friendPetName').textContent=pet.name||'どうぶつ';
  document.getElementById('friendPetStage').innerHTML=`<div class="friend-pet-character" aria-label="${escapeHtml(pet.speciesName||'どうぶつ')}">${escapeHtml(pet.icon||'🐦')}</div>`;
  document.getElementById('friendPetStats').innerHTML=`<b>${escapeHtml(pet.speciesName||'どうぶつ')}</b> ・ Lv.${Number(pet.level)||1}<br>育成スコア <strong>${Number(selectedFriend.score||0).toLocaleString()}</strong>`;
  const options=Object.entries(G.inv).filter(([,count])=>count>0).map(([code,count])=>`<option value="${escapeHtml(code)}">${itemInfo[code]?.icon||'🎁'} ${escapeHtml(itemInfo[code]?.name||code)}（${count}個）</option>`).join('');
  const select=document.getElementById('giftItemSelect');select.innerHTML=options||'<option value="">送れるアイテムがありません</option>';document.getElementById('giftSendBtn').disabled=!options;showModal('friendPetModal');
}
async function sendGiftToSelectedFriend(){
  const code=document.getElementById('giftItemSelect').value;if(!selectedFriend||!code||!G.inv[code])return;
  try{
    if(identityUser){const result=await remoteSocialAction('sendGift',{playerId:selectedFriend.playerId,itemCode:code,quantity:1});if(result.gameState)applyGameState(result.gameState);applyRemoteDashboard(result.data);}
    else{G.inv[code]--;await persistLocalSocial();save();renderInv();}
    hideModal('friendPetModal');renderSocial();showToast('仕送りを送りました！','achievement');
  }catch(error){showToast(error.message||'仕送りに失敗しました','warning');}
}
async function claimGift(id){
  const gift=socialState.gifts.find(g=>String(g.id)===String(id));if(!gift)return;
  try{
    if(identityUser){const result=await remoteSocialAction('claimGift',{giftId:id});if(result.gameState)applyGameState(result.gameState);applyRemoteDashboard(result.data);}
    else{G.inv[gift.itemCode]=(G.inv[gift.itemCode]||0)+(gift.quantity||1);gift.claimedAt=new Date().toISOString();await persistLocalSocial();save();renderInv();}
    renderSocial();showToast('仕送りを受け取りました！','achievement');
  }catch(error){showToast(error.message||'受け取りに失敗しました','warning');}
}
