const birds={
  buncho_sakura:{name:'桜文鳥',icon:'🐦',price:0,curr:'coins',colors:{head:'#1a1a1a',cheek:'#fff',body:'#7a7a7a',belly:'#e8d8d0',wing:'#5a5a5a',tail:'#2a2a2a',beak:'#ff6b6b',eyeRing:'#ff5555',feet:'#ffb8b8'},hasCheek:true,defaultNames:['さくら','ピーちゃん','ブンちゃん','チュン太','もち','おもち','ぴよ']},
  buncho_white:{name:'白文鳥',icon:'🕊️',price:200,curr:'coins',colors:{head:'#fefefe',cheek:'#fefefe',body:'#faf8f5',belly:'#fff5f0',wing:'#f0f0f0',tail:'#e8e8e8',beak:'#ff7777',eyeRing:'#ff6666',feet:'#ffc0c0'},hasCheek:false,defaultNames:['しろ','ゆき','ましろ','ミルク','とうふ','しらたま','もふ']},
  buncho_cinnamon:{name:'シナモン',icon:'🐤',price:300,curr:'coins',colors:{head:'#8b6914',cheek:'#fff5e6',body:'#c9a070',belly:'#f0e0d0',wing:'#b08050',tail:'#7b5414',beak:'#ffa080',eyeRing:'#ff7755',feet:'#ffc8b0'},hasCheek:true,defaultNames:['シナモン','きなこ','モカ','くるみ','あずき','ココア','チャイ']},
  buncho_silver:{name:'シルバー',icon:'🪿',price:400,curr:'coins',colors:{head:'#505050',cheek:'#f8f8f8',body:'#a8a8a8',belly:'#e0d8d0',wing:'#888',tail:'#404040',beak:'#ff8080',eyeRing:'#ff6060',feet:'#ffb0b0'},hasCheek:true,defaultNames:['シルバー','ぎん','ルナ','プラチナ','しずく','ぺる','アッシュ']},
  canary:{name:'カナリア',icon:'🐥',price:500,curr:'coins',colors:{head:'#ffeb3b',cheek:'#fff59d',body:'#ffeb3b',belly:'#fff9c4',wing:'#fdd835',tail:'#f9a825',beak:'#ff8a65',eyeRing:'#ffab91',feet:'#ffcc80'},hasCheek:false,defaultNames:['カナリア','ひまわり','レモン','こがね','ソレイユ','ひなた','サニー']},
  inko_green:{name:'セキセイインコ',icon:'🦜',price:800,curr:'coins',colors:{head:'#c8e6c9',cheek:'#a5d6a7',body:'#66bb6a',belly:'#a5d6a7',wing:'#43a047',tail:'#2e7d32',beak:'#ffb74d',eyeRing:'#fff59d',feet:'#bcaaa4'},hasCheek:false,defaultNames:['みどり','わかば','リーフ','メロン','キウイ','ミント','モス']},
  inko_blue:{name:'青インコ',icon:'💙',price:800,curr:'coins',colors:{head:'#bbdefb',cheek:'#90caf9',body:'#42a5f5',belly:'#90caf9',wing:'#1e88e5',tail:'#1565c0',beak:'#ffb74d',eyeRing:'#fff59d',feet:'#bcaaa4'},hasCheek:false,defaultNames:['そら','あお','スカイ','うみ','アクア','ブルー','セイラ']},
  buncho_pied:{name:'白黒文鳥',icon:'🤍',price:950,curr:'coins',colors:{head:'#2b2b2b',cheek:'#ffffff',body:'#dadada',belly:'#f1ece6',wing:'#707070',tail:'#1b1b1b',beak:'#ff7b7b',eyeRing:'#ff8a8a',feet:'#ffc0c0'},hasCheek:true,defaultNames:['パンダ','ゴマ','ミル','ダンゴ','黒豆','こはく','しろくろ']},
  buncho_black:{name:'黒文鳥',icon:'🖤',price:1100,curr:'coins',colors:{head:'#0b0b0b',cheek:'#3b3b3b',body:'#1d1d1d',belly:'#2a2a2a',wing:'#111',tail:'#050505',beak:'#ff7b7b',eyeRing:'#ff6b6b',feet:'#ffb0b0'},hasCheek:false,defaultNames:['くろ','よぞら','カゲ','ルーク','しぐれ','ナイト','ビター']},
  finch_zebra:{name:'キンカチョウ',icon:'🤎',price:1200,curr:'coins',colors:{head:'#cfcfcf',cheek:'#ff6b6b',body:'#b0b0b0',belly:'#f0ece6',wing:'#7d7d7d',tail:'#4a4a4a',beak:'#ff8a65',eyeRing:'#ffd180',feet:'#ffb0b0'},hasCheek:true,defaultNames:['しま','ゼブラ','カノン','ラテ','モノ','ビス','マーブル']},
  lovebird:{name:'コザクラインコ',icon:'💚',price:6,curr:'gems',colors:{head:'#ff9ea8',cheek:'#ffd1d9',body:'#7ed957',belly:'#b6f18c',wing:'#54c45c',tail:'#2e7d32',beak:'#ffb74d',eyeRing:'#ffeb3b',feet:'#bcaaa4'},hasCheek:false,defaultNames:['ラブ','ハート','ピーチ','さくら','メロ','ルル','ハニー']},
  cockatiel:{name:'オカメインコ',icon:'🧡',price:5,curr:'gems',colors:{head:'#ffcc80',cheek:'#ff8a65',body:'#bdbdbd',belly:'#e0e0e0',wing:'#9e9e9e',tail:'#757575',beak:'#8d6e63',eyeRing:'#ffcc80',feet:'#bcaaa4'},hasCheek:true,defaultNames:['オカメ','ピーチ','サンセット','あかり','コーラル','もみじ','ルビー']},
  owl:{name:'フクロウ',icon:'🦉',price:15,curr:'gems',colors:{head:'#8d6e63',cheek:'#d7ccc8',body:'#6d4c41',belly:'#bcaaa4',wing:'#5d4037',tail:'#4e342e',beak:'#ffd54f',eyeRing:'#ffd54f',feet:'#a1887f'},hasCheek:false,isOwl:true,defaultNames:['ふくろう','ホー太','ミミズク','よる','ウィズダム','アウル','ナイト']}
};
const minigames=[
  {id:'catch',name:'シードキャッチ',icon:'🌾',desc:'落ちるシードをキャッチ！',cost:10,type:'catch'},
  {id:'timing',name:'タイミングバー',icon:'🎯',desc:'ぴったりタイミングで！',cost:10,type:'timing'},
  {id:'memory',name:'神経衰弱',icon:'🧠',desc:'絵柄を覚えてペアを探せ！',cost:15,type:'memory'},
  {id:'rhythm',name:'リズムゲーム',icon:'🎵',desc:'リズムに合わせてタップ！',cost:10,type:'rhythm'},
  {id:'tap',name:'連打チャレンジ',icon:'👆',desc:'とにかく連打！',cost:10,type:'tap'},
  {id:'quiz',name:'鳥クイズ',icon:'❓',desc:'鳥に関するクイズ！',cost:15,type:'quiz'},
  {id:'fly',name:'フライトラン',icon:'🕊️',desc:'障害物を避けて飛べ！',cost:15,type:'fly'},
  {id:'sing',name:'音あてゲーム',icon:'🎹',desc:'鳴き声を覚えて再現！',cost:15,type:'sing'},
  {id:'balance',name:'バランス',icon:'⚖️',desc:'バランスを保って立て！',cost:10,type:'balance'},
  {id:'treasure',name:'宝探し',icon:'💎',desc:'隠れたシードを探せ！',cost:10,type:'treasure'}
];
const extraMinigameThemes=['スターラッシュ','スカイグライド','トリックループ','ソウルダッシュ','フォーカス','スパーク','ダイブ','ノヴァ','パルス','ミラージュ','グリント','オーロラ'];
const extraMinigameTypes=['catch','timing','tap','rhythm','balance','treasure','fly','memory','quiz','sing','dodge','path'];
const extraMinigameDescs={
  catch:'落ちるアイテムをすばやくキャッチ！',
  timing:'狭いゾーンを狙え！',
  tap:'リズムに合わせて連打！',
  rhythm:'ノーツを正確にタップ！',
  balance:'姿勢を崩さず耐えろ！',
  treasure:'隠れたアイテムを探し出せ！',
  fly:'障害物をすり抜けろ！',
  memory:'短い時間で覚えよう！',
  quiz:'知識で勝負！',
  sing:'順番を真似しよう！',
  dodge:'落下物を避け続けろ！',
  path:'光る順番をたどろう！'
};
for(let i=1;i<=30;i++){
  const t=extraMinigameThemes[i%extraMinigameThemes.length];
  const type=extraMinigameTypes[i%extraMinigameTypes.length];
  minigames.push({id:`extra_${i}`,name:`${t} ${i}`,icon:['✨','🌀','⚡','🎯','🧩','🌟'][i%6],desc:extraMinigameDescs[type]||'追加チャレンジモード',cost:10+(i%4)*2,type,variant:i});
}
const shopData={
  food:[
    {id:'seeds',name:'シード',desc:'基本のえさ×10',price:30,icon:'🌾',curr:'coins',amt:10},
    {id:'treats',name:'おやつ',desc:'特別なおやつ×3',price:50,icon:'🍬',curr:'coins',amt:3},
    {id:'fruits',name:'フルーツ',desc:'幸福+15 ×5',price:80,icon:'🍎',curr:'coins',amt:5},
    {id:'premium_food',name:'高級えさ',desc:'全ステ+10 ×3',price:150,icon:'✨',curr:'coins',amt:3}
  ],
  items:[
    {id:'energy_drink',name:'エナドリ',desc:'元気+50 ×3',price:60,icon:'🥤',curr:'coins',amt:3},
    {id:'vitamins',name:'ビタミン',desc:'元気+30 ×5',price:80,icon:'💉',curr:'coins',amt:5},
    {id:'medicine',name:'お薬',desc:'健康全回復 ×2',price:100,icon:'💊',curr:'coins',amt:2},
    {id:'shampoo',name:'シャンプー',desc:'清潔全回復 ×3',price:50,icon:'🧴',curr:'coins',amt:3},
    {id:'toys',name:'おもちゃ',desc:'遊び効果UP',price:120,icon:'🎾',curr:'coins',amt:1},
    {id:'sleep_box',name:'スリープボックス',desc:'状態維持スリープ 1回',price:180,icon:'🛏️',curr:'coins',amt:1}
  ],
  premium:[
    {id:'super_energy',name:'Sエナジー',desc:'元気全回復 ×2',price:3,icon:'⚡',curr:'gems',amt:2},
    {id:'mirror',name:'鏡',desc:'幸福ボーナス',price:3,icon:'🪞',curr:'gems',amt:1},
    {id:'bell',name:'鈴',desc:'歌スキルUP',price:5,icon:'🔔',curr:'gems',amt:1},
    {id:'swing',name:'ブランコ',desc:'遊び効果2倍',price:8,icon:'🎠',curr:'gems',amt:1}
  ]
};
const itemInfo={
  seeds:{name:'シード',icon:'🌾',usable:false},
  treats:{name:'おやつ',icon:'🍬',usable:false},
  fruits:{name:'フルーツ',icon:'🍎',usable:true,effect:'幸福+15'},
  premium_food:{name:'高級えさ',icon:'✨',usable:true,effect:'全ステ+10'},
  energy_drink:{name:'エナドリ',icon:'🥤',usable:true,effect:'元気+50'},
  vitamins:{name:'ビタミン',icon:'💉',usable:true,effect:'元気+30'},
  medicine:{name:'お薬',icon:'💊',usable:true,effect:'健康全回復'},
  shampoo:{name:'シャンプー',icon:'🧴',usable:true,effect:'清潔全回復'},
  toys:{name:'おもちゃ',icon:'🎾',usable:false},
  super_energy:{name:'Sエナジー',icon:'⚡',usable:true,effect:'元気全回復'},
  mirror:{name:'鏡',icon:'🪞',usable:false},
  bell:{name:'鈴',icon:'🔔',usable:false},
  swing:{name:'ブランコ',icon:'🎠',usable:false},
  sleep_box:{name:'スリープボックス',icon:'🛏️',usable:true,effect:'1〜10時間の状態維持スリープ'}
};
function buildMissionCatalog(){
  const list=[];
  const push=(id,title,desc,type,goal,reward)=>list.push({id,title,desc,type,goal,reward});
  const rewardFor=(goal,base)=>Math.max(8,Math.round(goal*base));
  [3,6,10,15].forEach(n=>push(`feed_${n}`,`ごはん${n}回`,`シードやおやつを${n}回あげる`, 'feed',n,rewardFor(n,3)));
  [4,8,12].forEach(n=>push(`pet_${n}`,`なでなで${n}回`,`なでるを${n}回行う`,'pet',n,rewardFor(n,2.5)));
  [3,6,9].forEach(n=>push(`play_${n}`,`遊び${n}回`,`遊ぶを${n}回行う`,'play',n,rewardFor(n,3.5)));
  [2,4,6].forEach(n=>push(`bath_${n}`,`お風呂${n}回`,`お風呂に${n}回入れる`,'bath',n,rewardFor(n,4)));
  [3,6,9].forEach(n=>push(`sing_${n}`,`歌${n}回`,`歌うを${n}回行う`,'sing',n,rewardFor(n,3)));
  [2,4,7].forEach(n=>push(`train_${n}`,`訓練${n}回`,`訓練を${n}回行う`,'train',n,rewardFor(n,4)));
  [2,4,6].forEach(n=>push(`treat_${n}`,`おやつ${n}回`,`おやつを${n}回あげる`,'treat',n,rewardFor(n,5)));
  [2,4,6,8].forEach(n=>push(`minigame_${n}`,`ミニゲーム${n}回`,`ミニゲームを${n}回遊ぶ`,'minigame',n,rewardFor(n,6)));
  [30,60,90].forEach(n=>push(`mg_score_${n}`,`ハイスコア${n}`,`ミニゲームで合計${n}点稼ぐ`,'minigame_score',n,rewardFor(n,1)));
  [50,100,150].forEach(n=>push(`coins_${n}`,`コイン${n}`,`コインを合計${n}獲得する`,'coins',n,rewardFor(n,0.8)));
  [1,2,3].forEach(n=>push(`sleep_${n}`,`おやすみ${n}回`,`睡眠を${n}回行う`,'sleep',n,rewardFor(n,8)));
  push('share_1','共有チャレンジ','共有ボタンを1回押す','share',1,25);
  [1,3].forEach(n=>push(`custom_${n}`,`カスタム${n}回`,`カスタマイズを${n}回変更`,'customize',n,rewardFor(n,6)));
  [1,3,5].forEach(n=>push(`buy_${n}`,`買い物${n}回`,`ショップで${n}回購入`,'buy',n,rewardFor(n,7)));
  push('bug_1','不具合報告','バグ報告を1回保存','bug_report',1,20);
  [2,4].forEach(n=>push(`chat_${n}`,`AI会話${n}回`,`AIに${n}回送信`,'chat',n,rewardFor(n,10)));
  return list;
}
const missionCatalog=buildMissionCatalog();
let G={name:'文鳥',species:'buncho_sakura',birdNames:{buncho_sakura:'文鳥'},unlocked:['buncho_sakura'],hunger:80,happiness:80,health:100,energy:100,cleanliness:100,age:0,theme:'day',weather:'none',animationMode:'fine',resolutionScale:1,soundMode:'chirp',chatApiEnabled:false,chatApiKey:'',chatApiDraft:'',beta3d:false,sleepBoxUntil:null,sleepBoxLock:null,sleepBoxRate:0,chatHistory:[],bugReports:[],errorLogs:[],threeDRotX:10,threeDRotY:-8,autoTheme:true,autoWeather:false,geo:null,missions:{active:[],completed:0,history:[]},lastWeatherFetch:0,lastUpdate:Date.now(),sleepStart:null,tFeeds:0,tPets:0,tBaths:0,tPlays:0,tSings:0,level:1,exp:0,coins:100,gems:5,inv:{seeds:10,treats:3,fruits:0,premium_food:0,energy_drink:1,vitamins:0,medicine:1,shampoo:2,toys:0,super_energy:0,mirror:0,bell:0,swing:0,sleep_box:0},isSleeping:false,bannerDismissed:false};
let action=null,animF=0,blink=false,mgActive=false,mgScore=0,mgTimer=null,selBird=null,shopTab='food',selItem=null;
let currentMg=null,mgData={},mgInterval=null;
let lastWeatherRender={type:null,mode:null};
let scanCache={};

function persistBackup(key,json){
  try{localStorage.setItem(key,json);}catch(e){}
  try{sessionStorage.setItem(key,json);}catch(e){}
}
function setCookie(n,v){
  const json=JSON.stringify(v);
  const payload=encodeURIComponent(json);
  document.cookie=`${n}=${payload};expires=${new Date(Date.now()+365*864e5).toUTCString()};path=/;SameSite=Lax`;
  if(!document.cookie.split('; ').some(r=>r.startsWith(n+'='))){logError('storage','cookie_write_failed');}
  if(payload.length>3600){logError('storage','cookie_size_warning');}
  persistBackup(n,json);
}
function parseStoredValue(raw){
  if(!raw)return null;
  try{return JSON.parse(raw);}catch(e){}
  try{return JSON.parse(decodeURIComponent(raw));}catch(e){}
  return null;
}
function getCookie(n){
  const v=document.cookie.split('; ').find(r=>r.startsWith(n+'='));
  if(v){
    const parsed=parseStoredValue(v.split('=')[1]);
    if(parsed)return parsed;
  }
  try{
    const fromLocal=parseStoredValue(localStorage.getItem(n));
    if(fromLocal)return fromLocal;
  }catch(e){}
  try{
    const fromSession=parseStoredValue(sessionStorage.getItem(n));
    if(fromSession)return fromSession;
  }catch(e){}
  return null;
}
function delCookie(n){
  document.cookie=n+'=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/';
  try{localStorage.removeItem(n);}catch(e){}
  try{sessionStorage.removeItem(n);}catch(e){}
}
function save(){G.lastUpdate=Date.now();setCookie('birdG3',G)}
function load(){
  const s=getCookie('birdG3');
  if(s){
    G={...G,...s};
    const now=Date.now(),mins=(now-G.lastUpdate)/60000;
    let msg='';
    if(G.isSleeping&&G.sleepStart){
      const sleepMins=(now-G.sleepStart)/60000;
      const rec=Math.min(sleepMins*0.8,100-(s.energy||0));
      G.energy=Math.min(100,(s.energy||0)+rec);
      if(rec>5)msg=`💤 寝ている間に元気が${Math.round(rec)}回復！`;
      if(G.energy>=100){G.isSleeping=false;G.sleepStart=null;msg='💤 ぐっすり眠って元気満タン！'}
    }else if(mins>0){
      G.hunger=Math.max(0,G.hunger-mins*0.25);
      G.happiness=Math.max(0,G.happiness-mins*0.12);
      G.cleanliness=Math.max(0,G.cleanliness-mins*0.08);
      G.energy=Math.max(0,G.energy-mins*0.05);
    }
    if(msg){const b=document.getElementById('recoveryBanner');b.textContent=msg;b.classList.add('show');setTimeout(()=>b.classList.remove('show'),5000)}
    else if(mins>1)showToast(`${G.name}がお帰りを待っていました！`);
  }
  ensureNewSettings();
  G.name=getCurrentBirdName();
  if(!G.bannerDismissed&&!isStandalone())setTimeout(()=>document.getElementById('installBanner').classList.add('show'),3000);
}

function getCurrentBirdName(){return (G.birdNames&&G.birdNames[G.species])||birds[G.species].name}
function setCurrentBirdName(name){if(!G.birdNames)G.birdNames={};G.birdNames[G.species]=name;G.name=name}
function ensureNewSettings(){
  if(!G.birdNames||typeof G.birdNames!=='object')G.birdNames={};
  if(!G.birdNames[G.species])G.birdNames[G.species]=G.name||birds[G.species].name;
  if(!G.animationMode)G.animationMode='fine';
  if(typeof G.resolutionScale!=='number')G.resolutionScale=1;
  if(!G.soundMode)G.soundMode='chirp';
  if(typeof G.chatApiEnabled!=='boolean')G.chatApiEnabled=false;
  if(typeof G.chatApiKey!=='string')G.chatApiKey='';
  if(typeof G.chatApiDraft!=='string')G.chatApiDraft=G.chatApiKey||'';
  if(typeof G.beta3d!=='boolean')G.beta3d=false;
  if(typeof G.sleepBoxUntil!=='number')G.sleepBoxUntil=null;
  if(typeof G.sleepBoxLock!=='object'&&G.sleepBoxLock!==null)G.sleepBoxLock=null;
  if(typeof G.sleepBoxRate!=='number')G.sleepBoxRate=0;
  if(!Array.isArray(G.chatHistory))G.chatHistory=[];
  if(!Array.isArray(G.bugReports))G.bugReports=[];
  if(!Array.isArray(G.errorLogs))G.errorLogs=[];
  if(typeof G.threeDRotX!=='number')G.threeDRotX=10;
  if(typeof G.threeDRotY!=='number')G.threeDRotY=-8;
  if(typeof G.autoTheme!=='boolean')G.autoTheme=true;
  if(typeof G.autoWeather!=='boolean')G.autoWeather=false;
  if(typeof G.geo!=='object'&&G.geo!==null)G.geo=null;
  if(!G.missions||typeof G.missions!=='object')G.missions={active:[],completed:0,history:[]};
  if(!Array.isArray(G.missions.active))G.missions.active=[];
  if(!Array.isArray(G.missions.history))G.missions.history=[];
  if(typeof G.missions.completed!=='number')G.missions.completed=0;
  if(typeof G.lastWeatherFetch!=='number')G.lastWeatherFetch=0;
}
let audioCtx=null;
function playBirdSound(type='action'){
  if(G.soundMode==='off')return;
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    const t=audioCtx.currentTime;
    const base=type==='sing'?920:type==='feed'?700:type==='play'?800:type==='battle'?520:650;
    const master=audioCtx.createGain();master.gain.value=G.soundMode==='bell'?0.10:0.08;master.connect(audioCtx.destination);
    const partials=[1,2,3.01];
    partials.forEach((p,idx)=>{
      const o=audioCtx.createOscillator();const g=audioCtx.createGain();
      o.type=G.soundMode==='bell'?(idx===0?'triangle':'sine'):(idx===0?'sine':'triangle');
      o.frequency.setValueAtTime(base*p,t);
      o.frequency.exponentialRampToValueAtTime((base*1.22)*(idx===0?1:0.98),t+0.12+idx*0.02);
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime((0.07/(idx+1)),t+0.02+idx*0.01);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.22+idx*0.03);
      o.connect(g);g.connect(master);o.start(t);o.stop(t+0.25+idx*0.03);
    });
  }catch(e){}
}

function isStandalone(){return window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true}
let toastTimer=null;
function showToast(m,t=''){const e=document.getElementById('toast');e.textContent=m;e.className='toast show '+t;if(toastTimer)clearTimeout(toastTimer);toastTimer=setTimeout(()=>{e.classList.remove('show');},2500)}
function setMsg(m){document.getElementById('message').textContent=m}
function showModal(id){
  document.getElementById(id).classList.add('show');
  if(id==='birdModal')renderBirdGrid();
  if(id==='nameModal')renderNameSuggestions();
}
function renderNameSuggestions(){
  const b=birds[G.species];
  const names=b.defaultNames||['ピーちゃん','とりちゃん','ぴよ'];
  document.getElementById('nameSuggestions').innerHTML=names.map(n=>`<span class="name-suggestion" onclick="selectNameSuggestion('${n}')">${n}</span>`).join('');
}
function selectNameSuggestion(name){document.getElementById('nameInput').value=name;}
function hideModal(id){document.getElementById(id).classList.remove('show')}
function showInstallGuide(){hideInstallBanner();showModal('installModal')}
function hideInstallBanner(){document.getElementById('installBanner').classList.remove('show');G.bannerDismissed=true;save()}
function togglePanel(p){['shop','inventory','minigame','customize','chat','logs','missions'].forEach(x=>{const el=document.getElementById(x+'Panel');if(!el)return;el.classList.toggle('show',x===p&&!el.classList.contains('show'))});if(p==='shop')renderShop();if(p==='inventory')renderInv();if(p==='minigame'){renderMinigameGrid();document.getElementById('minigameSelect').style.display='block';document.getElementById('minigamePlay').style.display='none';currentMg=null;}if(p==='chat')renderChat();if(p==='logs'){renderChangeLog();renderErrorLogs();}if(p==='missions')renderMissions();}

function updateUI(){
  const b=birds[G.species];
  document.getElementById('headerIcon').textContent=b.icon;
  document.getElementById('birdName').textContent=getCurrentBirdName();
  document.getElementById('level').textContent=G.level;
  document.getElementById('coins').textContent=G.coins;
  document.getElementById('gems').textContent=G.gems;
  const d=Math.floor(G.age/86400),h=Math.floor((G.age%86400)/3600),m=Math.floor((G.age%3600)/60);
  document.getElementById('age').textContent=d>0?d+'日':h>0?h+'時間':m+'分';
  const avg=(G.hunger+G.happiness+G.health+G.energy+G.cleanliness)/5;
  document.getElementById('mood').textContent=avg>80?'😊':avg>60?'🙂':avg>40?'😐':'😢';
  document.getElementById('expBar').style.width=(G.exp/(G.level*50)*100)+'%';
  renderStats();
  document.getElementById('tFeeds').textContent=G.tFeeds;
  document.getElementById('tPets').textContent=G.tPets;
  document.getElementById('tPlays').textContent=G.tPlays;
  document.getElementById('tBaths').textContent=G.tBaths;
  document.getElementById('sleepBtn').innerHTML=G.isSleeping?'☀️起こす':'💤寝かす';
  if(G.sleepBoxUntil&&Date.now()<G.sleepBoxUntil){document.getElementById('sleepBtn').innerHTML='🛏️解除';}
  document.body.className=G.theme;
  const svg=document.getElementById('birdSvg');svg.setAttribute('width',String(220*G.resolutionScale));svg.setAttribute('height',String(242*G.resolutionScale));svg.style.imageRendering=G.resolutionScale>1?'auto':'-webkit-optimize-contrast';svg.classList.toggle('bird-3d',G.beta3d===true);svg.classList.toggle('bird-3d-real',G.beta3d===true);svg.style.setProperty('--rx',`${G.threeDRotX}deg`);svg.style.setProperty('--ry',`${G.threeDRotY}deg`);
  const chatBtn=document.getElementById('chatOpenBtn');if(chatBtn)chatBtn.style.display=(G.chatApiEnabled&&G.chatApiKey)?'inline-block':'none';
  renderWeather();
  const customizePanel=document.getElementById('customizePanel');
  if(customizePanel&&customizePanel.classList.contains('show'))renderCustomize();
}
function renderStats(){
  const s=[{l:'空腹',v:G.hunger,c:'#ef6c00',i:'🍚'},{l:'幸福',v:G.happiness,c:'#e91e63',i:'💖'},{l:'健康',v:G.health,c:'#4caf50',i:'💪'},{l:'元気',v:G.energy,c:'#2196f3',i:'⚡'},{l:'清潔',v:G.cleanliness,c:'#00bcd4',i:'✨'}];
  document.getElementById('statsGrid').innerHTML=s.map(x=>`<div class="stat-card"><div class="stat-icon">${x.i}</div><div class="stat-label">${x.l}</div><div class="stat-bar"><div class="stat-fill" style="width:${x.v}%;background:${x.c}"></div></div><div class="stat-value">${Math.round(x.v)}%</div></div>`).join('');
}
function renderBirdGrid(){
  selBird=G.species;
  document.getElementById('birdGrid').innerHTML=Object.entries(birds).map(([id,b])=>{
    const owned=G.unlocked.includes(id),sel=G.species===id;
    const pr=b.price===0?'無料':b.price+(b.curr==='gems'?'💎':'💰');
    return`<div class="bird-option ${sel?'selected':''} ${owned?'':'locked'}" onclick="selectBird(event,'${id}')">${owned?'':`<span class="lock-icon">🔒</span>`}<div class="bird-option-icon">${b.icon}</div><div class="bird-option-name">${b.name}</div><div class="bird-option-price">${owned?'所持中':pr}</div></div>`;
  }).join('');
  updateBuyBtn();
}
function selectBird(evt,id){selBird=id;document.querySelectorAll('.bird-option').forEach(e=>e.classList.remove('selected'));if(evt&&evt.currentTarget)evt.currentTarget.classList.add('selected');updateBuyBtn()}
function updateBuyBtn(){
  const btn=document.getElementById('buyBirdBtn'),b=birds[selBird],owned=G.unlocked.includes(selBird);
  btn.textContent=owned?(selBird===G.species?'選択中':'この鳥にする'):`購入(${b.price}${b.curr==='gems'?'💎':'💰'})`;
  btn.disabled=owned&&selBird===G.species;
}
function buyBird(){
  const b=birds[selBird],owned=G.unlocked.includes(selBird);
  if(owned){
    if(selBird!==G.species){
      G.species=selBird;if(!G.birdNames[selBird])G.birdNames[selBird]=b.name;G.name=getCurrentBirdName();playBirdSound('feed');setMsg(b.name+'に変身！');save();updateUI();
    }
    hideModal('birdModal');return;
  }
  if(G[b.curr]<b.price){showToast(b.curr==='gems'?'💎が足りません':'💰が足りません','warning');return}
  G[b.curr]-=b.price;G.unlocked.push(selBird);G.species=selBird;
  G.birdNames[selBird]=G.birdNames[selBird]||b.name;showToast('🎉'+b.name+'をゲット！','achievement');playBirdSound('feed');setMsg(b.name+'がやってきた！あとで名前変更できます。');save();updateUI();renderBirdGrid();
}
function showChangeNameModal(){
  const b=birds[G.species];
  document.getElementById('changeNameTitle').textContent=b.icon+' '+b.name+'の名前';
  document.getElementById('newBirdNames').innerHTML=(b.defaultNames||[]).map(n=>`<span class="name-suggestion" onclick="document.getElementById('newNameInput').value='${n}'">${n}</span>`).join('');
  document.getElementById('newNameInput').value='';
  showModal('changeNameModal');
}
function skipNameChange(){hideModal('changeNameModal');}
function confirmNameChange(){
  const n=document.getElementById('newNameInput').value.trim();
  if(n){setCurrentBirdName(n);playBirdSound('feed');setMsg(`名前が「${n}」になった！`);save();updateUI();}
  hideModal('changeNameModal');
}
function setShopTab(t){shopTab=t;document.querySelectorAll('.shop-tab').forEach(e=>e.classList.toggle('active',e.textContent.includes(t==='food'?'食べ物':t==='items'?'アイテム':'プレミアム')));renderShop()}
function renderShop(){document.getElementById('shopGrid').innerHTML=shopData[shopTab].map(i=>`<div class="shop-item" onclick="buyItem('${i.id}',${i.price},'${i.curr}',${i.amt})"><div class="shop-item-icon">${i.icon}</div><div class="shop-item-name">${i.name}</div><div class="shop-item-desc">${i.desc}</div><div class="shop-item-price">${i.price}${i.curr==='gems'?'💎':'💰'}</div></div>`).join('')}
function renderInv(){
  const items=Object.entries(itemInfo).filter(([id])=>G.inv[id]>0);
  document.getElementById('inventoryGrid').innerHTML=items.length?items.map(([id,i])=>`<div class="inventory-item" onclick="${i.usable?`showUseItem('${id}')`:''}">${i.usable?'':'<div style="position:absolute;top:0;right:0;font-size:0.5rem">🔒</div>'}<div class="inventory-item-count">${G.inv[id]}</div><div class="inventory-item-icon">${i.icon}</div><div class="inventory-item-name">${i.name}</div></div>`).join(''):'<div style="text-align:center;opacity:0.6;width:100%">持ち物がありません</div>';
}
function showUseItem(id){selItem=id;const i=itemInfo[id];document.getElementById('useItemTitle').textContent=i.name+'を使う';document.getElementById('useItemDesc').textContent='効果: '+i.effect;showModal('useItemModal')}
function confirmUseItem(){
  if(!selItem||G.inv[selItem]<=0)return;
  if(selItem==='sleep_box'){startSleepBoxPrompt();return;}
  G.inv[selItem]--;
  switch(selItem){
    case'fruits':G.happiness=Math.min(100,G.happiness+15);playBirdSound('feed');setMsg('フルーツおいしい！🍎');break;
    case'premium_food':G.hunger=Math.min(100,G.hunger+10);G.happiness=Math.min(100,G.happiness+10);G.health=Math.min(100,G.health+10);G.energy=Math.min(100,G.energy+10);playBirdSound('feed');setMsg('高級えさ最高！✨');break;
    case'energy_drink':G.energy=Math.min(100,G.energy+50);playBirdSound('feed');setMsg('元気が出てきた！🥤');break;
    case'vitamins':G.energy=Math.min(100,G.energy+30);playBirdSound('feed');setMsg('ビタミン補給！💉');break;
    case'medicine':G.health=100;playBirdSound('feed');setMsg('健康になった！💊');break;
    case'shampoo':G.cleanliness=100;playBirdSound('feed');setMsg('ピカピカ！🧴');break;
    case'super_energy':G.energy=100;playBirdSound('feed');setMsg('元気MAX！⚡');break;
  }
  hideModal('useItemModal');save();updateUI();renderInv();
}
function getWeatherCount(base){
  const quality=G.animationMode==='ultra'?1:G.animationMode==='fine'?0.85:G.animationMode==='simple'?0.55:0.7;
  const screenFactor=Math.min(1,(window.innerWidth||360)/420);
  return Math.max(4,Math.round(base*quality*screenFactor));
}
function renderWeather(){
  if(lastWeatherRender.type===G.weather&&lastWeatherRender.mode===G.animationMode)return;
  lastWeatherRender={type:G.weather,mode:G.animationMode};
  const c=document.getElementById('weatherEffects');c.innerHTML='';
  if(G.weather==='rain')for(let i=0;i<getWeatherCount(18);i++){const d=document.createElement('div');d.className='raindrop';d.style.left=Math.random()*100+'%';d.style.animationDelay=Math.random()*2+'s';d.style.animationDuration=(0.4+Math.random()*0.3)+'s';c.appendChild(d)}
  else if(G.weather==='snow')for(let i=0;i<getWeatherCount(12);i++){const f=document.createElement('div');f.className='snowflake';f.textContent='❄';f.style.left=Math.random()*100+'%';f.style.fontSize=(5+Math.random()*8)+'px';f.style.animationDelay=Math.random()*4+'s';f.style.animationDuration=(3+Math.random()*3)+'s';c.appendChild(f)}
  else if(G.weather==='sleet')for(let i=0;i<getWeatherCount(14);i++){const s=document.createElement('div');s.className='sleet';s.textContent='❅';s.style.left=Math.random()*100+'%';s.style.animationDelay=Math.random()*2+'s';s.style.animationDuration=(1.4+Math.random()*1.4)+'s';c.appendChild(s)}
  else if(G.weather==='hail')for(let i=0;i<getWeatherCount(16);i++){const h=document.createElement('div');h.className='hail';h.style.left=Math.random()*100+'%';h.style.animationDelay=Math.random()*1.6+'s';h.style.animationDuration=(0.8+Math.random()*0.8)+'s';c.appendChild(h)}
}
function renderStars(){const c=document.getElementById('stars');for(let i=0;i<35;i++){const s=document.createElement('div');s.className='star';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*50+'%';s.style.width=s.style.height=(1+Math.random()*2)+'px';s.style.animationDelay=Math.random()*2+'s';c.appendChild(s)}}
function renderCustomize(){
  document.getElementById('animationOpts').innerHTML=[{id:'ultra',n:'🚀最高'},{id:'fine',n:'✨細かい'},{id:'normal',n:'🎞️標準'},{id:'simple',n:'⚡軽量'}].map(a=>`<button class="customize-btn ${G.animationMode===a.id?'active':''}" onclick="setAnimationMode('${a.id}')">${a.n}</button>`).join('');
  document.getElementById('resolutionOpts').innerHTML=[{id:0.8,n:'低'},{id:1,n:'中'},{id:1.6,n:'高精細'}].map(r=>`<button class="customize-btn ${G.resolutionScale===r.id?'active':''}" onclick="setResolution(${r.id})">${r.n}</button>`).join('');
  document.getElementById('beta3dOpts').innerHTML=[{v:true,n:'ON'},{v:false,n:'OFF'}].map(c=>`<button class="customize-btn ${(G.beta3d===c.v)?'active':''}" onclick="setBeta3d(${c.v})">${c.n}</button>`).join('');
  document.getElementById('themeOpts').innerHTML=[{id:'day',n:'☀️昼'},{id:'sunset',n:'🌅夕'},{id:'night',n:'🌙夜'}].map(t=>`<button class="customize-btn ${G.theme===t.id?'active':''}" onclick="setTheme('${t.id}')">${t.n}</button>`).join('');
  document.getElementById('themeAutoOpts').innerHTML=[{v:true,n:'🕒自動'},{v:false,n:'✋手動'}].map(o=>`<button class="customize-btn ${(G.autoTheme===o.v)?'active':''}" onclick="setAutoTheme(${o.v})">${o.n}</button>`).join('');
  document.getElementById('weatherOpts').innerHTML=[{id:'none',n:'☀️なし'},{id:'rain',n:'🌧️雨'},{id:'snow',n:'❄️雪'},{id:'sleet',n:'🌨️みぞれ'},{id:'hail',n:'🧊ひょう'}].map(w=>`<button class="customize-btn ${G.weather===w.id?'active':''}" onclick="setWeather('${w.id}')">${w.n}</button>`).join('');
  document.getElementById('weatherAutoOpts').innerHTML=[{v:true,n:'📍実天気ON'},{v:false,n:'✋手動'}].map(o=>`<button class="customize-btn ${(G.autoWeather===o.v)?'active':''}" onclick="setAutoWeather(${o.v})">${o.n}</button>`).join('');
  document.getElementById('weatherHint').textContent=G.autoWeather?'実際の天気と連動中（位置情報）':'手動天気モードです。';
  document.getElementById('soundOpts').innerHTML=[{id:'off',n:'🔇OFF'},{id:'chirp',n:'🐤チュン'},{id:'bell',n:'🔔ベル'}].map(s=>`<button class="customize-btn ${G.soundMode===s.id?'active':''}" onclick="setSoundMode('${s.id}')">${s.n}</button>`).join('');
  document.getElementById('chatApiOpts').innerHTML=[{v:true,n:'ON'},{v:false,n:'OFF'}].map(c=>`<button class="customize-btn ${(G.chatApiEnabled===c.v)?'active':''}" onclick="setChatApi(${c.v})">${c.n}</button>`).join('');
  const keyInput=document.getElementById('chatApiKey');
  keyInput.style.display='block';
  const shouldPreserve=document.activeElement===keyInput;
  if(!shouldPreserve)keyInput.value=(G.chatApiDraft||G.chatApiKey||'');
  document.getElementById('chatApiHint').textContent=G.chatApiEnabled?'APIキーはCookieに保存されます。':'OFF中はAPIを使いません。';
}
function initMissions(){
  if(!G.missions||!Array.isArray(G.missions.active))G.missions={active:[],completed:0,history:[]};
  if(G.missions.active.length===0)rollMissions();
}
function rollMissions(){
  const pool=missionCatalog.filter(m=>!G.missions.history.includes(m.id));
  const source=pool.length>=5?pool:missionCatalog;
  if(pool.length<5)G.missions.history=[];
  const picks=[];
  const used=new Set();
  while(picks.length<5&&used.size<source.length){
    const m=source[Math.floor(Math.random()*source.length)];
    if(used.has(m.id))continue;
    used.add(m.id);
    picks.push({...m,progress:0,done:false});
  }
  G.missions.active=picks;
  save();
  renderMissions();
}
function addMissionProgress(type,amount=1){
  if(amount<=0)return;
  if(!G.missions||!Array.isArray(G.missions.active))return;
  let changed=false;
  G.missions.active.forEach(m=>{
    if(m.done||m.type!==type)return;
    m.progress=Math.min(m.goal,m.progress+amount);
    if(m.progress>=m.goal){
      m.done=true;
      addCoins(m.reward,{ignoreMission:true});
      showToast(`✅ ミッション達成！${m.title} +${m.reward}💰`,'achievement');
      G.missions.completed++;
    }
    changed=true;
  });
  if(changed){
    if(G.missions.active.length&&G.missions.active.every(m=>m.done)){
      showToast('全ミッション達成！新しいミッションが出現','achievement');
      rollMissions();
    }else{
      save();
      renderMissions();
    }
  }
}
function renderMissions(){
  const list=document.getElementById('missionList');
  if(!list)return;
  if(!G.missions||!Array.isArray(G.missions.active))return;
  if(G.missions.active.length===0){list.innerHTML='<div class="mission-empty">ミッションがありません</div>';return;}
  list.innerHTML=G.missions.active.map(m=>{
    const pct=Math.min(100,Math.round((m.progress/m.goal)*100));
    return `<div class="mission-card ${m.done?'done':''}">
      <div class="mission-title">${m.title}</div>
      <div class="mission-desc">${m.desc}</div>
      <div class="mission-bar"><span style="width:${pct}%"></span></div>
      <div class="mission-meta">${m.progress}/${m.goal} ・ 報酬 ${m.reward}💰</div>
    </div>`;
  }).join('');
}
function renderBird(){
  const b=birds[G.species],c=b.colors,svg=document.getElementById('birdSvg');
  const speed=G.animationMode==='ultra'?1.05:G.animationMode==='fine'?0.95:G.animationMode==='simple'?0.6:0.8;
  const amp=G.animationMode==='ultra'?1.2:G.animationMode==='fine'?1.05:G.animationMode==='simple'?0.7:0.9;
  const quality=G.resolutionScale>=1.6?1:0;
  const bounce=Math.sin(animF*0.14*speed)*3.2*amp,tilt=Math.sin(animF*0.07*speed)*2*amp;
  const wingFlap=action==='play'||action==='bath'||action==='sing'?Math.sin(animF*0.38*speed)*12*amp:Math.sin(animF*0.04*speed)*2*amp;
  const headTilt=action==='pet'?Math.sin(animF*0.18*speed)*6*amp:tilt;
  const eyesClosed=G.isSleeping||blink||action==='pet';
  const jumpY=action==='play'?Math.abs(Math.sin(animF*0.28*speed))*16*amp:0;
  const eatBob=action==='feed'||action==='treat'?Math.max(0,Math.sin(animF*0.32*speed))*3*amp:0;
  const shake=action==='bath'?Math.sin(animF*0.5*speed)*4*amp:0;
  const singBob=action==='sing'?Math.sin(animF*0.32*speed)*4*amp:0;
  svg.innerHTML=`
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c.body}"/><stop offset="100%" stop-color="${c.wing}"/></linearGradient>
      <linearGradient id="bel" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c.belly}"/><stop offset="100%" stop-color="${c.body}" stop-opacity="0.7"/></linearGradient>
      <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity="0.2"/></filter>
    </defs>
    <g transform="translate(0,${-bounce-jumpY+eatBob+singBob}) rotate(${shake},100,120)" filter="url(#sh)">
      <ellipse cx="100" cy="198" rx="${50+jumpY/2}" ry="7" fill="rgba(0,0,0,0.1)"/>
      <rect x="28" y="188" width="144" height="10" rx="5" fill="#a07818"/>
      <g transform="translate(100,158) rotate(${-10+tilt})"><path d="M0,0 L-18,42 L0,44 L18,42 Z" fill="${c.tail}"/></g>
      <g transform="translate(82,175)"><path d="M0,0 L-9,16 M0,0 L0,18 M0,0 L9,16" stroke="${c.feet}" stroke-width="4" stroke-linecap="round" fill="none"/></g>
      <g transform="translate(118,175)"><path d="M0,0 L-9,16 M0,0 L0,18 M0,0 L9,16" stroke="${c.feet}" stroke-width="4" stroke-linecap="round" fill="none"/></g>
      <ellipse cx="100" cy="132" rx="48" ry="42" fill="url(#bg)"/>
      <ellipse cx="100" cy="145" rx="34" ry="30" fill="url(#bel)"/>
      <ellipse cx="92" cy="120" rx="12" ry="8" fill="rgba(255,255,255,0.14)"/>
      ${quality?'<path d="M70,128 Q100,98 132,126" stroke="rgba(255,255,255,0.16)" stroke-width="2" fill="none"/>':''}
      <path d="M72,150 Q100,164 128,150" stroke="rgba(0,0,0,0.08)" stroke-width="2" fill="none"/>
      <path d="M76,160 Q100,172 124,160" stroke="rgba(0,0,0,0.06)" stroke-width="2" fill="none"/>
      <g transform="translate(52,120) rotate(${-wingFlap})"><ellipse cx="0" cy="18" rx="14" ry="35" fill="${c.wing}"/></g>
      <g transform="translate(148,120) rotate(${wingFlap})"><ellipse cx="0" cy="18" rx="14" ry="35" fill="${c.wing}"/></g>
      <g transform="rotate(${headTilt},100,78)">
        <circle cx="100" cy="78" r="42" fill="${c.head}"/>
        ${b.hasCheek?`<ellipse cx="67" cy="88" rx="20" ry="18" fill="${c.cheek}"/><ellipse cx="133" cy="88" rx="20" ry="18" fill="${c.cheek}"/>`:''}
        <circle cx="78" cy="72" r="14" fill="${c.eyeRing}"/><circle cx="122" cy="72" r="14" fill="${c.eyeRing}"/>
        ${eyesClosed?`<path d="M67,72 Q78,82 89,72" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M111,72 Q122,82 133,72" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>`:`<circle cx="78" cy="72" r="10" fill="#0a0505"/><circle cx="122" cy="72" r="10" fill="#0a0505"/><circle cx="82" cy="68" r="4" fill="white"/><circle cx="126" cy="68" r="4" fill="white"/>`}
        <g transform="translate(100,98) rotate(${eatBob>0?Math.sin(animF*0.5)*4:0})">
          ${b.isOwl?`<path d="M-5,-8 L0,6 L5,-8 Z" fill="${c.beak}"/>`:`<ellipse cx="0" cy="-3" rx="14" ry="10" fill="${c.beak}"/><ellipse cx="0" cy="4" rx="11" ry="6" fill="${c.beak}" opacity="0.85"/>`}
          <ellipse cx="-4" cy="-6" rx="4" ry="3" fill="rgba(255,255,255,0.35)"/>
        </g>
        ${action==='sing'?`<text x="145" y="50" font-size="16" fill="#ff6b9d" opacity="${0.4+Math.sin(animF*0.25)*0.6}">♪</text><text x="158" y="35" font-size="12" fill="#9c27b0" opacity="${0.4+Math.sin(animF*0.25+1)*0.6}">♫</text>`:''}
      </g>
      ${G.isSleeping?`<text x="152" y="46" font-size="22" fill="#6a6aff" font-weight="bold" opacity="${0.35+Math.sin(animF*0.12)*0.65}">Z</text><text x="170" y="28" font-size="15" fill="#6a6aff" font-weight="bold" opacity="${0.35+Math.sin(animF*0.12+1)*0.65}">z</text>`:''}
      ${action==='feed'||action==='treat'?[0,1,2,3,4].map(i=>`<ellipse cx="${78+i*10+Math.sin(animF*0.12+i)*2}" cy="${165+(animF*0.8+i*7)%22}" rx="${1.8+((i%2)*0.6)}" ry="${1.2+((i%3)*0.4)}" fill="#c89a62" opacity="${0.9-((animF*0.8+i*7)%22)/24}"/>`).join(''):''}
      ${action==='pet'?[0,1,2].map(i=>`<text x="${55+i*42}" y="${38+Math.sin(animF*0.2+i)*12}" font-size="18" opacity="${0.45+Math.sin(animF*0.2+i)*0.55}">💕</text>`).join(''):''}
      ${action==='play'?[0,1,2,3].map(i=>`<text x="${44+i*38}" y="${28+Math.abs(Math.sin(animF*0.3+i*0.6))*30}" font-size="15">✨</text>`).join(''):''}
      ${G.animationMode==='ultra'?[0,1,2,3,4].map(i=>`<circle cx="${52+i*26}" cy="${56+Math.sin(animF*0.17+i)*18}" r="${1.5+Math.sin(animF*0.08+i)*0.8}" fill="rgba(255,255,255,0.5)"/>`).join(''):''}
      ${action==='bath'?[0,1,2,3,4,5,6].map(i=>`<ellipse cx="${58+i*12+Math.sin(animF*0.25+i)*4}" cy="${154+(animF*1.4+i*9)%44}" rx="${1.4+Math.sin(animF*0.1+i)*0.6}" ry="${2.2+Math.cos(animF*0.12+i)*0.7}" fill="#9bd7ff" opacity="${1-((animF*1.4+i*9)%44)/45}"/>`).join(''):''}
    </g>`;
}
function doAction(n,cb){if(action||(G.isSleeping&&n!=='wake')){if(G.isSleeping)setMsg('Zzz...寝てるよ...');return false}action=n;cb();setTimeout(()=>action=null,2000);return true}
function addCoins(amount,opts={}){
  if(!amount)return;
  G.coins=Math.max(0,G.coins+amount);
  if(amount>0&&!opts.ignoreMission)addMissionProgress('coins',amount);
}
function spendCoins(amount){G.coins=Math.max(0,G.coins-amount);}
function feedBird(){if(G.inv.seeds<=0){playBirdSound('feed');setMsg('シードがない！');return}doAction('feed',()=>{playBirdSound('feed');G.inv.seeds--;G.hunger=Math.min(100,G.hunger+18);G.happiness=Math.min(100,G.happiness+3);G.tFeeds++;addMissionProgress('feed',1);addExp(2);setMsg(['パクパク...おいしい！🌾','チュン♪ありがとう！','カリカリ最高！'][Math.floor(Math.random()*3)]);save()})}
function petBird(){doAction('pet',()=>{playBirdSound('pet');G.happiness=Math.min(100,G.happiness+10+(G.inv.mirror>0?5:0));G.tPets++;addMissionProgress('pet',1);addExp(1);setMsg(['チュンチュン♪うれしい！','もっとなでて〜💕','眠れる...'][Math.floor(Math.random()*3)]);save()})}
function playBird(){if(G.energy<20){playBirdSound('feed');setMsg('疲れてる...休ませて...');return}doAction('play',()=>{playBirdSound('play');const b=G.inv.swing>0?2:1,tb=G.inv.toys>0?5:0;G.happiness=Math.min(100,G.happiness+(15+tb)*b);G.energy=Math.max(0,G.energy-12);G.hunger=Math.max(0,G.hunger-5);G.tPlays++;addMissionProgress('play',1);addCoins(2);addExp(3);setMsg(['わーい！楽しい！🎉','もっと遊ぼう！'][Math.floor(Math.random()*2)]);save()})}
function bathBird(){doAction('bath',()=>{playBirdSound('bath');const b=G.inv.shampoo>0;if(b)G.inv.shampoo--;G.cleanliness=100;G.happiness=Math.min(100,G.happiness+(b?15:8));G.tBaths++;addMissionProgress('bath',1);addExp(2);setMsg(b?'シャンプーでピカピカ！✨':['バシャバシャ！💦','きれいになった〜'][Math.floor(Math.random()*2)]);save()})}
function toggleSleep(){
  if(G.sleepBoxUntil&&Date.now()<G.sleepBoxUntil){cancelSleepBox();return;}
  if(G.isSleeping){G.isSleeping=false;G.sleepStart=null;playBirdSound('feed');setMsg('おはよう！🌅')}
  else{G.isSleeping=true;G.sleepStart=Date.now();addMissionProgress('sleep',1);playBirdSound('feed');setMsg('おやすみ...💤 閉じても元気が回復！')}
  save();updateUI();
}
function giveTreat(){if(G.inv.treats<=0){playBirdSound('feed');setMsg('おやつがない！');return}doAction('treat',()=>{playBirdSound('feed');G.inv.treats--;G.happiness=Math.min(100,G.happiness+25);G.hunger=Math.min(100,G.hunger+10);addMissionProgress('treat',1);addExp(4);setMsg('わーい！おやつ！🍬');save()})}
function trainBird(){if(G.energy<25){playBirdSound('feed');setMsg('疲れてる...訓練は無理...');return}doAction('train',()=>{playBirdSound('play');G.energy=Math.max(0,G.energy-15);addMissionProgress('train',1);addCoins(3);addExp(4);setMsg(['賢くなった！📚','新しいこと覚えた！'][Math.floor(Math.random()*2)]);save()})}
function singBird(){if(G.energy<15){playBirdSound('feed');setMsg('疲れて歌えない...');return}doAction('sing',()=>{playBirdSound('sing');G.happiness=Math.min(100,G.happiness+12);G.energy=Math.max(0,G.energy-8);G.tSings++;addMissionProgress('sing',1);addCoins(2);addExp(3);setMsg(['チュンチュン〜♪🎵','上手に歌えた！','いい鳴き声でしょ？🎤'][Math.floor(Math.random()*3)]);save()})}
function buyItem(id,price,curr,amt){if(G[curr]<price){showToast(curr==='gems'?'💎が足りません':'💰が足りません','warning');return}G[curr]-=price;G.inv[id]=(G.inv[id]||0)+amt;addMissionProgress('buy',1);showToast('購入しました！');playBirdSound('feed');setMsg('お買い物ありがとう！🛒');save();updateUI();renderInv()}

// Minigame System
function renderMinigameGrid(){
  document.getElementById('minigameGrid').innerHTML=minigames.map(mg=>`
    <div class="minigame-card" onclick="selectMinigame('${mg.id}')">
      <div class="minigame-card-icon">${mg.icon}</div>
      <div class="minigame-card-name">${mg.name}</div>
      <div class="minigame-card-desc">${mg.desc}</div>
    </div>
  `).join('');
}
function selectMinigame(id){
  currentMg=minigames.find(m=>m.id===id);
  document.getElementById('minigameSelect').style.display='none';
  document.getElementById('minigamePlay').style.display='block';
  document.getElementById('mgName').textContent=currentMg.name;
  document.getElementById('startMgBtn').textContent=`開始(${currentMg.cost}💰)`;
  document.getElementById('mgScore').textContent='0';
  document.getElementById('mgTime').textContent='15';
  document.getElementById('mgTarget').style.display='none';
  document.getElementById('mgContent').innerHTML='';
}
function backToMinigameList(){
  if(mgActive)endMinigame();
  document.getElementById('minigameSelect').style.display='block';
  document.getElementById('minigamePlay').style.display='none';
  currentMg=null;
}
function startCurrentMinigame(){
  if(!currentMg||G.coins<currentMg.cost){setMsg('コインが足りない...');return}
  spendCoins(currentMg.cost);mgActive=true;mgScore=0;mgData={time:15};
  document.getElementById('mgScore').textContent=0;document.getElementById('mgTime').textContent=15;
  document.getElementById('startMgBtn').style.display='none';
  save();updateUI();
  const type=currentMg.type||currentMg.id;
  switch(type){
    case'catch':startCatchGame(currentMg.variant);break;
    case'timing':startTimingGame(currentMg.variant);break;
    case'memory':startMemoryGame(currentMg.variant);break;
    case'rhythm':startRhythmGame(currentMg.variant);break;
    case'tap':startTapGame(currentMg.variant);break;
    case'quiz':startQuizGame(currentMg.variant);break;
    case'fly':startFlyGame(currentMg.variant);break;
    case'sing':startSingGame(currentMg.variant);break;
    case'balance':startBalanceGame(currentMg.variant);break;
    case'treasure':startTreasureGame(currentMg.variant);break;
    case'dodge':startDodgeGame(currentMg.variant);break;
    case'path':startPathGame(currentMg.variant);break;
    default:startTapGame(currentMg.variant);break;
  }
  mgTimer=setInterval(()=>{mgData.time--;document.getElementById('mgTime').textContent=mgData.time;if(mgData.time<=0)endMinigame()},1000);
}

function startExtraMinigame(){startTapGame();}

function endMinigame(){
  mgActive=false;clearInterval(mgTimer);if(mgInterval)clearInterval(mgInterval);mgInterval=null;
  document.removeEventListener('keydown',flyKeyHandler);
  const r=Math.floor(mgScore*3);addCoins(r);G.happiness=Math.min(100,G.happiness+Math.min(mgScore,10));
  addMissionProgress('minigame',1);
  addMissionProgress('minigame_score',mgScore);
  addExp(Math.floor(mgScore/2));
  document.getElementById('startMgBtn').style.display='block';
  document.getElementById('mgTarget').style.display='none';
  document.getElementById('mgContent').innerHTML='';
  showToast(`ゲーム終了！${r}コイン獲得！`,'achievement');
  setMsg(`スコア${mgScore}！🎮`);save();updateUI();
}

// 1. Seed Catch Game
function startCatchGame(variant=0){
  const tg=document.getElementById('mgTarget');tg.style.display='flex';
  const emojis=['🌾','🍎','🌻','🫘','🥜','💎'];
  mgData.catchEmoji=emojis[variant%emojis.length];
  mgData.catchScore=1+(variant%3);
  tg.textContent=mgData.catchEmoji;
  moveTarget();
}
function moveTarget(){const tg=document.getElementById('mgTarget'),a=document.getElementById('minigameArea');tg.style.left=(15+Math.random()*(a.offsetWidth-80))+'px';tg.style.top=(25+Math.random()*90)+'px'}
function catchSeed(){if(!mgActive||currentMg?.type!=='catch')return;mgScore+=mgData.catchScore||1;document.getElementById('mgScore').textContent=mgScore;moveTarget()}

// 2. Timing Game
function startTimingGame(variant=0){
  mgData.cursorPos=0;mgData.dir=1;
  mgData.zoneStart=30+((variant*7)%25);
  mgData.zoneEnd=mgData.zoneStart+(12+(variant%5)*3);
  mgData.timingSpeed=2.2+(variant%4)*0.6;
  document.getElementById('mgContent').innerHTML=`
    <div class="timing-bar">
      <div class="timing-zone" style="left:${mgData.zoneStart}%;width:${mgData.zoneEnd-mgData.zoneStart}%"></div>
      <div class="timing-cursor" id="timingCursor" style="left:0%"></div>
    </div>
    <button class="action-btn play" onclick="hitTiming()" style="margin-top:15px">タップ！</button>
  `;
  mgInterval=setInterval(()=>{
    mgData.cursorPos+=mgData.dir*mgData.timingSpeed;
    if(mgData.cursorPos>=100||mgData.cursorPos<=0)mgData.dir*=-1;
    document.getElementById('timingCursor').style.left=mgData.cursorPos+'%';
  },30);
}
function hitTiming(){
  if(!mgActive)return;
  const inZone=mgData.cursorPos>=mgData.zoneStart&&mgData.cursorPos<=mgData.zoneEnd;
  if(inZone){mgScore+=2;showToast('ナイス！+2','achievement');}else{showToast('ミス...');}
  document.getElementById('mgScore').textContent=mgScore;
  mgData.zoneStart=Math.random()*60;mgData.zoneEnd=mgData.zoneStart+15+Math.random()*15;
  document.querySelector('.timing-zone').style.left=mgData.zoneStart+'%';
  document.querySelector('.timing-zone').style.width=(mgData.zoneEnd-mgData.zoneStart)+'%';
}

// 3. Memory Game
function startMemoryGame(variant=0){
  const base=['🌾','🍎','🌻','🐛','💧','🌿','🍇','🌰'];
  const count=6+(variant%3)*2;
  const emojis=base.slice(0,count);
  const pairs=[...emojis,...emojis].sort(()=>Math.random()-0.5);
  mgData.cards=pairs.map((e,i)=>({id:i,emoji:e,flipped:false,matched:false}));
  mgData.flippedCards=[];mgData.time=30;document.getElementById('mgTime').textContent=30;
  renderMemoryCards();
}
function renderMemoryCards(){
  document.getElementById('mgContent').innerHTML=`<div class="memory-grid">${
    mgData.cards.map((c,i)=>`<div class="memory-card${c.flipped||c.matched?' flipped':''}${c.matched?' matched':''}" onclick="flipCard(${i})">${c.flipped||c.matched?c.emoji:'❓'}</div>`).join('')
  }</div>`;
}
function flipCard(i){
  if(!mgActive||mgData.cards[i].flipped||mgData.cards[i].matched||mgData.flippedCards.length>=2)return;
  mgData.cards[i].flipped=true;mgData.flippedCards.push(i);renderMemoryCards();
  if(mgData.flippedCards.length===2){
    const[a,b]=mgData.flippedCards;
    if(mgData.cards[a].emoji===mgData.cards[b].emoji){
      mgData.cards[a].matched=mgData.cards[b].matched=true;mgScore+=3;
      document.getElementById('mgScore').textContent=mgScore;mgData.flippedCards=[];renderMemoryCards();
      if(mgData.cards.every(c=>c.matched)){mgData.time=0;}
    }else{
      setTimeout(()=>{mgData.cards[a].flipped=mgData.cards[b].flipped=false;mgData.flippedCards=[];renderMemoryCards();},800);
    }
  }
}

// 4. Rhythm Game
function startRhythmGame(variant=0){
  mgData.notes=[];mgData.time=20;document.getElementById('mgTime').textContent=20;
  mgData.rhythmRate=0.22+(variant%5)*0.05;
  mgData.rhythmSpeed=3+(variant%4)*0.6;
  document.getElementById('mgContent').innerHTML=`
    <div class="rhythm-lane" id="rhythmLane" onclick="hitRhythm(event)">
      <div class="rhythm-target"></div>
    </div>
  `;
  mgInterval=setInterval(()=>{
    if(Math.random()<mgData.rhythmRate){
      const note={x:20+Math.random()*60,y:-20,id:Date.now()};mgData.notes.push(note);
    }
    mgData.notes=mgData.notes.filter(n=>{n.y+=mgData.rhythmSpeed;return n.y<150;});
    renderRhythmNotes();
  },50);
}
function renderRhythmNotes(){
  const lane=document.getElementById('rhythmLane');if(!lane)return;
  const target=lane.querySelector('.rhythm-target');
  lane.innerHTML='';lane.appendChild(target);
  mgData.notes.forEach(n=>{
    const el=document.createElement('div');el.className='rhythm-note';el.style.left=n.x+'%';el.style.top=n.y+'px';
    el.style.background=n.y>90&&n.y<120?'rgba(76,175,80,0.7)':'rgba(255,107,107,0.7)';el.textContent='🎵';
    el.onclick=(e)=>{e.stopPropagation();hitNote(n.id);};lane.appendChild(el);
  });
}
function hitNote(id){
  const note=mgData.notes.find(n=>n.id===id);
  if(note&&note.y>80&&note.y<130){mgScore+=2;showToast('ナイス！','achievement');mgData.notes=mgData.notes.filter(n=>n.id!==id);}
  else if(note){mgData.notes=mgData.notes.filter(n=>n.id!==id);}
  document.getElementById('mgScore').textContent=mgScore;
}
function hitRhythm(e){
  const lane=document.getElementById('rhythmLane');const rect=lane.getBoundingClientRect();
  const x=(e.clientX-rect.left)/rect.width*100;
  const hit=mgData.notes.find(n=>Math.abs(n.x-x)<15&&n.y>80&&n.y<130);
  if(hit){hitNote(hit.id);}
}

// 5. Tap Game
function startTapGame(variant=0){
  mgData.taps=0;mgData.time=8+(variant%5)*2;document.getElementById('mgTime').textContent=mgData.time;
  document.getElementById('mgContent').innerHTML=`
    <div class="tap-area" id="tapArea" onclick="doTap()">👆</div>
    <div style="margin-top:10px;font-size:0.8rem">タップ数: <span id="tapCount">0</span></div>
  `;
}
function doTap(){
  if(!mgActive)return;mgData.taps++;document.getElementById('tapCount').textContent=mgData.taps;
  mgScore=Math.floor(mgData.taps/5);document.getElementById('mgScore').textContent=mgScore;
  const area=document.getElementById('tapArea');area.style.transform='scale(0.9)';
  setTimeout(()=>area.style.transform='scale(1)',50);
}

// 6. Quiz Game
const quizQuestions=[
  {q:'文鳥の原産地は？',a:['インドネシア','ブラジル','オーストラリア','日本'],c:0},
  {q:'カナリアは何で有名？',a:['歌声','飛行距離','寿命','大きさ'],c:0},
  {q:'インコの仲間で最も小さいのは？',a:['セキセイインコ','オカメインコ','コンゴウインコ','ヨウム'],c:0},
  {q:'フクロウは何目？',a:['フクロウ目','タカ目','スズメ目','ハト目'],c:0},
  {q:'鳥の体温は人間より？',a:['高い','低い','同じ','種類による'],c:0},
  {q:'文鳥の寿命は約何年？',a:['7-8年','2-3年','15-20年','30年以上'],c:0},
  {q:'鳥が持っていない器官は？',a:['歯','翼','くちばし','羽毛'],c:0},
  {q:'セキセイインコの「セキセイ」の意味は？',a:['背黄青','積青','石青','昔青'],c:0},
];
function startQuizGame(variant=0){
  mgData.qIdx=0;mgData.answered=0;mgData.time=24+(variant%4)*3;document.getElementById('mgTime').textContent=mgData.time;
  showQuiz();
}
function showQuiz(){
  if(mgData.qIdx>=quizQuestions.length){mgData.qIdx=0;}
  const q=quizQuestions[mgData.qIdx];
  const shuffled=q.a.map((a,i)=>({a,i})).sort(()=>Math.random()-0.5);
  document.getElementById('mgContent').innerHTML=`
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">${shuffled.map(o=>`<div class="quiz-option" onclick="answerQuiz(${o.i})">${o.a}</div>`).join('')}</div>
  `;
}
function answerQuiz(i){
  if(!mgActive)return;
  const q=quizQuestions[mgData.qIdx];const opts=document.querySelectorAll('.quiz-option');
  opts.forEach(o=>o.style.pointerEvents='none');
  if(i===q.c){mgScore+=3;showToast('正解！+3','achievement');opts.forEach((o,idx)=>{if(o.textContent===q.a[q.c])o.classList.add('correct');});}
  else{showToast('不正解...');opts.forEach((o,idx)=>{if(o.textContent===q.a[q.c])o.classList.add('correct');if(o.textContent===q.a[i])o.classList.add('wrong');});}
  document.getElementById('mgScore').textContent=mgScore;mgData.qIdx++;
  setTimeout(()=>{if(mgActive)showQuiz();},1000);
}

// 7. Fly Game
function startFlyGame(variant=0){
  mgData.birdY=50;mgData.obstacles=[];mgData.time=18+(variant%4)*3;document.getElementById('mgTime').textContent=mgData.time;
  mgData.flySpeed=2.4+(variant%4)*0.4;
  mgData.flySpawn=0.07+(variant%3)*0.02;
  document.getElementById('mgContent').innerHTML=`<div class="fly-area" id="flyArea"><div class="fly-bird" id="flyBird">🐦</div></div>`;
  document.addEventListener('keydown',flyKeyHandler);
  document.getElementById('flyArea').addEventListener('touchstart',flyUp);
  document.getElementById('flyArea').addEventListener('click',flyUp);
  mgInterval=setInterval(flyTick,50);
}
function flyKeyHandler(e){if(e.code==='Space'||e.code==='ArrowUp')flyUp();}
function flyUp(){if(!mgActive)return;mgData.birdY=Math.max(10,mgData.birdY-15);}
function flyTick(){
  if(!mgActive)return;
  mgData.birdY=Math.min(90,mgData.birdY+2);
  if(Math.random()<mgData.flySpawn){mgData.obstacles.push({x:100,y:20+Math.random()*60,emoji:['🌲','☁️','⛰️','🌸'][Math.floor(Math.random()*4)]});}
  mgData.obstacles=mgData.obstacles.filter(o=>{o.x-=mgData.flySpeed;return o.x>-10;});
  const bird=document.getElementById('flyBird');if(bird)bird.style.top=mgData.birdY+'%';
  const area=document.getElementById('flyArea');if(!area)return;
  area.querySelectorAll('.fly-obstacle').forEach(e=>e.remove());
  mgData.obstacles.forEach(o=>{
    const el=document.createElement('div');el.className='fly-obstacle';el.style.left=o.x+'%';el.style.top=o.y+'%';el.textContent=o.emoji;area.appendChild(el);
    if(Math.abs(o.x-15)<8&&Math.abs(o.y-mgData.birdY)<15){mgData.obstacles=mgData.obstacles.filter(ob=>ob!==o);mgScore++;document.getElementById('mgScore').textContent=mgScore;}
  });
}

// 8. Sing Game
function startSingGame(variant=0){
  const notes=['ド','レ','ミ','ファ','ソ'];
  mgData.sequence=[];mgData.playerSeq=[];mgData.showing=true;mgData.time=24+(variant%4)*3;document.getElementById('mgTime').textContent=mgData.time;
  const len=3+(variant%3);
  for(let i=0;i<len;i++)mgData.sequence.push(Math.floor(Math.random()*5));
  document.getElementById('mgContent').innerHTML=`
    <div style="margin-bottom:10px;font-size:0.8rem" id="singInstruction">覚えてね...</div>
    <div class="sing-notes">${notes.map((n,i)=>`<div class="sing-note" id="note${i}" onclick="playNote(${i})">${n}</div>`).join('')}</div>
  `;
  showSequence();
}
function showSequence(){
  let i=0;const int=setInterval(()=>{
    document.querySelectorAll('.sing-note').forEach(n=>n.classList.remove('active'));
    if(i<mgData.sequence.length){document.getElementById('note'+mgData.sequence[i]).classList.add('active');i++;}
    else{clearInterval(int);mgData.showing=false;document.getElementById('singInstruction').textContent='同じ順番でタップ！';}
  },600);
}
function playNote(n){
  if(!mgActive||mgData.showing)return;
  mgData.playerSeq.push(n);
  const note=document.getElementById('note'+n);note.classList.add('active');setTimeout(()=>note.classList.remove('active'),200);
  const idx=mgData.playerSeq.length-1;
  if(mgData.playerSeq[idx]!==mgData.sequence[idx]){showToast('間違い！');mgData.playerSeq=[];mgData.sequence=[];for(let i=0;i<3;i++)mgData.sequence.push(Math.floor(Math.random()*5));mgData.showing=true;document.getElementById('singInstruction').textContent='覚えてね...';showSequence();return;}
  if(mgData.playerSeq.length===mgData.sequence.length){
    mgScore+=mgData.sequence.length;document.getElementById('mgScore').textContent=mgScore;showToast(`正解！+${mgData.sequence.length}`,'achievement');
    mgData.playerSeq=[];mgData.sequence.push(Math.floor(Math.random()*5));mgData.showing=true;
    document.getElementById('singInstruction').textContent='覚えてね...';setTimeout(showSequence,500);
  }
}

// 9. Balance Game
function startBalanceGame(variant=0){
  mgData.pos=50;mgData.vel=0;mgData.time=12+(variant%4)*2;document.getElementById('mgTime').textContent=mgData.time;mgData.balanceScore=0;
  mgData.zoneStart=32+(variant%3)*6;
  mgData.zoneWidth=26-(variant%3)*4;
  document.getElementById('mgContent').innerHTML=`
    <div class="balance-bar">
      <div class="balance-zone" style="left:${mgData.zoneStart}%;width:${mgData.zoneWidth}%"></div>
      <div class="balance-bird" id="balanceBird">🐦</div>
    </div>
    <div style="display:flex;gap:20px;margin-top:15px">
      <button class="action-btn pet" onclick="nudgeBalance(-1)">← 左</button>
      <button class="action-btn play" onclick="nudgeBalance(1)">右 →</button>
    </div>
  `;
  mgInterval=setInterval(()=>{
    if(!mgActive)return;
    mgData.vel+=(Math.random()-0.5)*(0.7+(variant%4)*0.2);mgData.pos+=mgData.vel;mgData.pos=Math.max(5,Math.min(95,mgData.pos));mgData.vel*=0.95;
    document.getElementById('balanceBird').style.left=mgData.pos+'%';
    if(mgData.pos>mgData.zoneStart&&mgData.pos<(mgData.zoneStart+mgData.zoneWidth)){mgData.balanceScore++;if(mgData.balanceScore%20===0){mgScore++;document.getElementById('mgScore').textContent=mgScore;}}
  },50);
}
function nudgeBalance(dir){if(!mgActive)return;mgData.vel+=dir*2;}

// 10. Treasure Game
function startTreasureGame(variant=0){
  mgData.grid=Array(16).fill(null);mgData.treasures=[];mgData.tries=0;mgData.time=18+(variant%4)*2;document.getElementById('mgTime').textContent=mgData.time;
  const tCount=3+(variant%4);
  while(mgData.treasures.length<tCount){const p=Math.floor(Math.random()*16);if(!mgData.treasures.includes(p))mgData.treasures.push(p);}
  renderTreasureGrid();
}
function renderTreasureGrid(){
  document.getElementById('mgContent').innerHTML=`
    <div style="font-size:0.75rem;margin-bottom:8px">残り発掘: ${8-mgData.tries}回</div>
    <div class="treasure-grid">${mgData.grid.map((c,i)=>`<div class="treasure-cell${c!==null?' revealed':''}" onclick="digTreasure(${i})">${c===null?'🌿':c?'🌾':'💨'}</div>`).join('')}</div>
  `;
}
function digTreasure(i){
  if(!mgActive||mgData.grid[i]!==null||mgData.tries>=8)return;
  mgData.tries++;mgData.grid[i]=mgData.treasures.includes(i);
  if(mgData.grid[i]){mgScore+=2;showToast('発見！+2','achievement');}
  document.getElementById('mgScore').textContent=mgScore;renderTreasureGrid();
  if(mgData.tries>=8||mgData.treasures.every(t=>mgData.grid[t])){setTimeout(()=>{if(mgActive)endMinigame();},500);}
}

// 11. Dodge Game
function startDodgeGame(variant=0){
  mgData.dodgeX=50;mgData.dodgeY=70;mgData.obstacles=[];mgData.time=16+(variant%4)*2;document.getElementById('mgTime').textContent=mgData.time;
  mgData.dodgeSpeed=1.6+(variant%4)*0.4;mgData.dodgeSpawn=0.08+(variant%3)*0.03;
  document.getElementById('mgContent').innerHTML=`
    <div class="dodge-area" id="dodgeArea"><div class="dodge-bird" id="dodgeBird">🐦</div></div>
    <div class="dodge-controls">
      <button class="action-btn pet" onclick="moveDodge(-1)">◀ 左へ</button>
      <button class="action-btn play" onclick="moveDodge(1)">右へ ▶</button>
    </div>
  `;
  const bird=document.getElementById('dodgeBird');if(bird)bird.style.left=mgData.dodgeX+'%';
  mgInterval=setInterval(dodgeTick,50);
}
function moveDodge(dir){
  if(!mgActive)return;
  mgData.dodgeX=Math.max(6,Math.min(94,mgData.dodgeX+dir*8));
  const bird=document.getElementById('dodgeBird');if(bird)bird.style.left=mgData.dodgeX+'%';
}
function dodgeTick(){
  if(!mgActive)return;
  if(Math.random()<mgData.dodgeSpawn){mgData.obstacles.push({x:8+Math.random()*84,y:-8,vy:mgData.dodgeSpeed,hit:false});}
  mgData.obstacles=mgData.obstacles.filter(o=>{o.y+=o.vy;return o.y<120;});
  const area=document.getElementById('dodgeArea');if(!area)return;
  area.querySelectorAll('.dodge-obstacle').forEach(e=>e.remove());
  mgData.obstacles.forEach(o=>{
    const el=document.createElement('div');el.className='dodge-obstacle';el.style.left=o.x+'%';el.style.top=o.y+'%';el.textContent='💧';area.appendChild(el);
    if(!o.hit&&Math.abs(o.x-mgData.dodgeX)<6&&Math.abs(o.y-70)<10){o.hit=true;mgScore=Math.max(0,mgScore-1);document.getElementById('mgScore').textContent=mgScore;}
    if(o.y>110&&!o.hit){mgScore++;document.getElementById('mgScore').textContent=mgScore;o.hit=true;}
  });
}

// 12. Path Game
function startPathGame(variant=0){
  mgData.pathIndex=0;mgData.pathCount=4+(variant%4);mgData.time=18+(variant%4)*2;document.getElementById('mgTime').textContent=mgData.time;
  mgData.pathTargets=Array.from({length:mgData.pathCount},(_,i)=>({id:i,x:10+Math.random()*80,y:10+Math.random()*70}));
  renderPathTargets();
}
function renderPathTargets(){
  document.getElementById('mgContent').innerHTML=`
    <div class="path-area">${mgData.pathTargets.map(t=>`<div class="path-target ${t.id<mgData.pathIndex?'done':''}" style="left:${t.x}%;top:${t.y}%" onclick="hitPath(${t.id})">${t.id+1}</div>`).join('')}</div>
    <div class="path-hint">順番にタップ: ${mgData.pathIndex+1} / ${mgData.pathCount}</div>
  `;
}
function hitPath(id){
  if(!mgActive)return;
  if(id!==mgData.pathIndex){showToast('順番が違う...');return;}
  mgData.pathIndex++;mgScore+=2;document.getElementById('mgScore').textContent=mgScore;
  if(mgData.pathIndex>=mgData.pathCount){
    mgScore+=3;document.getElementById('mgScore').textContent=mgScore;
    mgData.pathIndex=0;mgData.pathTargets=mgData.pathTargets.map(t=>({id:t.id,x:10+Math.random()*80,y:10+Math.random()*70}));
  }
  renderPathTargets();
}

function startSleepBoxPrompt(){
  const hoursRaw=prompt('スリープボックス何時間？ (1〜10)');
  if(hoursRaw===null){renderInv();return;}
  const hours=Math.max(1,Math.min(10,parseInt(hoursRaw,10)||0));
  if(!hours){showToast('1〜10時間で入力してください','warning');renderInv();return;}
  const cost=hours*hours*12;
  if(G.coins<cost){showToast('💰が足りません','warning');renderInv();return;}
  spendCoins(cost);
  G.inv.sleep_box=Math.max(0,(G.inv.sleep_box||0)-1);
  G.sleepBoxUntil=Date.now()+hours*3600000;
  G.sleepBoxRate=hours;
  G.sleepBoxLock={hunger:G.hunger,happiness:G.happiness,health:G.health,energy:G.energy,cleanliness:G.cleanliness};
  G.isSleeping=true;G.sleepStart=Date.now();
  playBirdSound('bell');
  setMsg(`スリープボックス開始（${hours}時間）`);
  showToast(`🛏️ 状態維持モード開始 -${cost}💰`,'achievement');
  save();updateUI();renderInv();hideModal('useItemModal');
}
function applySleepBoxLock(){
  if(!(G.sleepBoxUntil&&G.sleepBoxLock))return;
  if(Date.now()>=G.sleepBoxUntil){
    G.sleepBoxUntil=null;G.sleepBoxLock=null;G.sleepBoxRate=0;
    showToast('🛏️ スリープボックス終了');
    return;
  }
  G.hunger=G.sleepBoxLock.hunger;
  G.happiness=G.sleepBoxLock.happiness;
  G.health=G.sleepBoxLock.health;
  G.energy=Math.min(100,G.energy+0.08);
  G.cleanliness=G.sleepBoxLock.cleanliness;
}
function cancelSleepBox(){
  if(!(G.sleepBoxUntil&&Date.now()<G.sleepBoxUntil)){return;}
  G.sleepBoxUntil=null;G.sleepBoxLock=null;G.sleepBoxRate=0;
  G.isSleeping=false;G.sleepStart=null;
  showToast('🛏️ スリープボックスを解除しました');
  setMsg('状態維持を解除しました。');
  save();updateUI();
}


function setAutoTheme(v){G.autoTheme=v===true||v==='true';if(G.autoTheme)applyAutoTheme();save();renderCustomize();updateUI();}
function setAutoWeather(v){
  G.autoWeather=v===true||v==='true';
  if(G.autoWeather)getGeoAndWeather();
  save();renderCustomize();
}
function applyAutoTheme(){
  const h=(new Date()).getHours();
  G.theme=h>=6&&h<17?'day':h>=17&&h<19?'sunset':'night';
}
function weatherCodeToType(code){
  if([79,96,99].includes(code))return'hail';
  if([56,57,66,67].includes(code))return'sleet';
  if([71,73,75,77,85,86].includes(code))return'snow';
  if((code>=51&&code<=67)||(code>=80&&code<=82)||code===95)return'rain';
  return'none';
}
function getGeoAndWeather(){
  if(!navigator.geolocation){showToast('位置情報が使えません','warning');return;}
  navigator.geolocation.getCurrentPosition(async pos=>{
    const lat=pos.coords.latitude,lon=pos.coords.longitude;G.geo={lat,lon};
    try{
      const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`);
      const d=await r.json();
      const code=d.current&&typeof d.current.weather_code==='number'?d.current.weather_code:0;
      G.weather=weatherCodeToType(code);G.lastWeatherFetch=Date.now();save();updateUI();
    }catch(e){logError('weather',String(e));showToast('天気取得に失敗','warning');}
  },err=>{logError('geolocation',err.message||'geo error');showToast('位置情報が拒否されました','warning');});
}
function setTheme(t){G.autoTheme=false;G.theme=t;addMissionProgress('customize',1);document.body.className=t;save();renderCustomize()}
function setWeather(w){G.autoWeather=false;G.weather=w;addMissionProgress('customize',1);save();renderCustomize();renderWeather()}
function setAnimationMode(m){G.animationMode=m;addMissionProgress('customize',1);save();renderCustomize();renderWeather()}
function setResolution(scale){G.resolutionScale=scale;addMissionProgress('customize',1);const svg=document.getElementById('birdSvg');svg.setAttribute('viewBox',scale>=1.6?'0 0 200 220':'0 0 200 220');save();updateUI()}
function setSoundMode(mode){G.soundMode=mode;addMissionProgress('customize',1);save();renderCustomize()}
function setBeta3d(v){G.beta3d=v===true||v==='true';addMissionProgress('customize',1);save();updateUI()}
function setChatApi(enabled){G.chatApiEnabled=enabled===true||enabled==='true';
  const keyInput=document.getElementById('chatApiKey');
  if(G.chatApiEnabled&&!((keyInput.value||G.chatApiDraft||G.chatApiKey||'').trim())){
    G.chatApiEnabled=false;showToast('APIキーを入力してください','warning');
  }
  if(G.chatApiEnabled){G.chatApiKey=(keyInput.value||G.chatApiDraft||G.chatApiKey||'').trim();}
  save();renderCustomize();updateUI();
}
function saveChatApiKey(){
  const key=document.getElementById('chatApiKey').value.trim();
  G.chatApiDraft=key;
  if(!G.chatApiEnabled)return;
  if(!key){showToast('APIキーが空です','warning');return;}
  G.chatApiKey=key;save();showToast('APIキーを保存しました');
}


function shareGame(){
  const text=`🐦 ${getCurrentBirdName()} を育成中！ Lv.${G.level} / 💰${Math.round(G.coins)} / 😊${document.getElementById('mood').textContent}`;
  if(navigator.share){
    navigator.share({title:'鳥育成ゲーム',text,url:location.href}).catch(()=>{});
    addMissionProgress('share',1);
    return;
  }
  navigator.clipboard?.writeText(`${text}
${location.href}`);
  addMissionProgress('share',1);
  showToast('共有文をコピーしました');
}

function getBirdInfoCompact(){
  return `n:${getCurrentBirdName()} sp:${birds[G.species].name} lv:${G.level} mood:${document.getElementById('mood').textContent} c:${Math.round(G.coins)} g:${Math.round(G.gems)} h:${Math.round(G.hunger)} hp:${Math.round(G.health)} e:${Math.round(G.energy)} cl:${Math.round(G.cleanliness)} happy:${Math.round(G.happiness)}`;
}
function renderChat(){
  const wrap=document.getElementById('chatWrap');
  if(!wrap)return;
  const rows=G.chatHistory.slice(-16).map(m=>`<div class="chat-msg ${m.role}"><div>${m.text}</div></div>`).join('');
  wrap.innerHTML=rows||'<div class="chat-empty">APIをONにして会話できます。</div>';
  wrap.scrollTop=wrap.scrollHeight;
}
function typewriterAppend(text){
  return new Promise(resolve=>{
    const wrap=document.getElementById('chatWrap');
    const row=document.createElement('div');row.className='chat-msg ai';const body=document.createElement('div');row.appendChild(body);wrap.appendChild(row);
    let i=0;const timer=setInterval(()=>{body.textContent=text.slice(0,++i);wrap.scrollTop=wrap.scrollHeight;if(i>=text.length){clearInterval(timer);resolve();}},18);
  });
}
async function sendChatMessage(){
  if(!(G.chatApiEnabled&&G.chatApiKey)){showToast('先にAPIをON＋キー保存してください','warning');return;}
  const input=document.getElementById('chatInput');
  const text=input.value.trim();
  if(!text)return;
  input.value='';
  G.chatHistory.push({role:'user',text});
  addMissionProgress('chat',1);
  renderChat();
  const thinking=document.getElementById('chatThinking');thinking.style.display='flex';
  try{
    const recent=G.chatHistory.slice(-6).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}));
    const resp=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+G.chatApiKey},
      body:JSON.stringify({
        model:'gpt-4o-mini',temperature:0.7,max_tokens:180,
        messages:[
          {role:'system',content:'あなたは優しい鳥育成アシスタント。短文で返答。コード生成は禁止。'},
          {role:'system',content:'鳥情報:'+getBirdInfoCompact()},
          ...recent,
          {role:'user',content:text}
        ]
      })
    });
    const data=await resp.json();
    const out=(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content?data.choices[0].message.content:'うまく返事できませんでした。').trim();
    await typewriterAppend(out);
    G.chatHistory.push({role:'ai',text:out});
    save();
    setMsg('AIとおしゃべりしたよ！');
  }catch(e){
    logError('chat',String(e));
    showToast('AI通信に失敗しました','warning');
  }finally{thinking.style.display='none';save();}
}
function renderChangeLog(){
  const el=document.getElementById('changeLogArea');if(!el)return;
  el.innerHTML=`<div>v2.3.4 変更ログ</div><ul><li>保存エラー検知と自動スキャンを追加</li><li>鳥選択のクリック不具合を修正</li><li>継続的な安定化調整</li></ul>`;
}
function submitBugReport(){
  const inp=document.getElementById('bugInput');const text=inp.value.trim();if(!text)return;
  const item={at:new Date().toISOString(),bird:getCurrentBirdName(),text};
  G.bugReports.push(item);if(G.bugReports.length>30)G.bugReports.shift();inp.value='';save();showToast('バグ報告を保存しました');
  addMissionProgress('bug_report',1);
}
function copyBugReport(){
  const last=G.bugReports[G.bugReports.length-1];if(!last){showToast('報告がありません','warning');return;}
  const txt=`[bug] ${last.at} ${last.bird}: ${last.text}`;
  navigator.clipboard?.writeText(txt);showToast('最新報告をコピーしました');
}
function logError(src,msg){
  G.errorLogs.push({at:new Date().toLocaleString(),src,msg});
  if(G.errorLogs.length>40)G.errorLogs.shift();
  renderErrorLogs();save();
}
function renderErrorLogs(){
  const el=document.getElementById('errorLogArea');if(!el)return;
  const rows=G.errorLogs.slice().reverse().slice(0,14).map(e=>`<div>• [${e.at}] (${e.src}) ${e.msg}</div>`).join('');
  el.innerHTML=rows||'エラーログはまだありません。';
}
function runErrorScan(){
  const requiredIds=['birdSvg','shopPanel','inventoryPanel','minigamePanel','customizePanel'];
  requiredIds.forEach(id=>{
    if(!document.getElementById(id)){
      if(!scanCache[id]){logError('scan',`missing:${id}`);scanCache[id]=true;}
    }else{
      scanCache[id]=false;
    }
  });
  if(G.chatApiEnabled&&!G.chatApiKey){
    if(!scanCache.chatApi){logError('scan','chat_api_missing_key');scanCache.chatApi=true;}
  }else{scanCache.chatApi=false;}
}
function init3dControl(){
  const area=document.querySelector('.main-display');let down=false,lastX=0,lastY=0;
  area.addEventListener('pointerdown',e=>{if(!G.beta3d)return;down=true;lastX=e.clientX;lastY=e.clientY;area.setPointerCapture(e.pointerId);});
  area.addEventListener('pointermove',e=>{if(!G.beta3d||!down)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;G.threeDRotY=Math.max(-35,Math.min(35,G.threeDRotY+dx*0.25));G.threeDRotX=Math.max(-25,Math.min(35,G.threeDRotX-dy*0.2));updateUI();});
  area.addEventListener('pointerup',()=>{down=false;save();});
}

function addExp(a){
  G.exp+=a;
  const need=G.level*50;
  if(G.exp>=need){
    G.exp-=need;G.level++;
    addCoins(G.level*10);
    G.gems++;
    showToast(`レベルアップ！Lv.${G.level}`,'levelup');
  }
}
function gameTick(){
  if(G.autoTheme)applyAutoTheme();
  if(G.autoWeather&&Date.now()-G.lastWeatherFetch>30*60*1000)getGeoAndWeather();
  if(G.sleepBoxUntil&&Date.now()<G.sleepBoxUntil)applySleepBoxLock();
  if(!G.isSleeping){
    G.hunger=Math.max(0,G.hunger-0.07);G.happiness=Math.max(0,G.happiness-0.035);G.cleanliness=Math.max(0,G.cleanliness-0.02);G.energy=Math.max(0,G.energy-0.025);
    const avg=(G.hunger+G.cleanliness)/2;if(avg<30)G.health=Math.max(0,G.health-0.08);else if(avg>70)G.health=Math.min(100,G.health+0.02);
  }else{G.energy=Math.min(100,G.energy+0.12);if(G.energy>=100){G.isSleeping=false;G.sleepStart=null;setMsg('ぐっすり眠れた！🌅')}}
  G.age++;if(G.age%30===0)save();updateUI();
}
function animLoop(){
  const step=G.animationMode==='ultra'?0.85:G.animationMode==='fine'?0.7:G.animationMode==='simple'?0.45:0.6;
  animF+=step;
  if(G.beta3d){G.threeDRotY+=(Math.sin(animF*0.02)*0.08);const svg=document.getElementById('birdSvg');if(svg)svg.style.setProperty('--ry',`${G.threeDRotY}deg`);}
  renderBird();requestAnimationFrame(animLoop);
}
function blinkLoop(){if(!G.isSleeping&&Math.random()<0.3){blink=true;setTimeout(()=>blink=false,150)}}
function resetGame(){if(!confirm('本当にリセットしますか？'))return;delCookie('birdG3');location.reload()}
function init(){
  load();initMissions();renderStars();renderShop();renderInv();renderCustomize();renderMissions();updateUI();
  setInterval(gameTick,1000);setInterval(blinkLoop,2500);animLoop();
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)hideModal(m.id)}));
  document.getElementById('nameInput').addEventListener('keypress',e=>{if(e.key==='Enter')saveName()});
  const apiInput=document.getElementById('chatApiKey');
  apiInput.addEventListener('keypress',e=>{if(e.key==='Enter')saveChatApiKey()});
  apiInput.addEventListener('input',e=>{G.chatApiDraft=e.target.value;});
  apiInput.addEventListener('blur',saveChatApiKey);
  const chatInput=document.getElementById('chatInput');
  chatInput.addEventListener('keypress',e=>{if(e.key==='Enter')sendChatMessage()});
  window.addEventListener('error',e=>logError('window',e.message||'unknown'));
  window.addEventListener('unhandledrejection',e=>logError('promise',String(e.reason||'rejection')));
  window.addEventListener('beforeunload',save);
  setInterval(save,5000);
  setInterval(runErrorScan,20000);
  init3dControl();renderChangeLog();renderErrorLogs();renderChat();runErrorScan();
  if(G.autoTheme)applyAutoTheme();
  if(G.autoWeather&&(!G.lastWeatherFetch||Date.now()-G.lastWeatherFetch>30*60*1000))getGeoAndWeather();
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden&&G.isSleeping&&G.sleepStart){
      const sleepMins=(Date.now()-G.sleepStart)/60000,eBefore=G.energy;
      if(G.sleepBoxUntil&&Date.now()<G.sleepBoxUntil){applySleepBoxLock();}else{G.energy=Math.min(100,G.energy+sleepMins*0.8);}
      const rec=G.energy-eBefore;
      if(rec>5){const b=document.getElementById('recoveryBanner');b.textContent=`💤 寝ている間に元気が${Math.round(rec)}回復！`;b.classList.add('show');setTimeout(()=>b.classList.remove('show'),4000)}
      if(G.energy>=100){G.isSleeping=false;G.sleepStart=null;playBirdSound('feed');setMsg('ぐっすり眠って元気満タン！🌅')}
      save();updateUI();
    }
  });
}
function saveName(){const n=document.getElementById('nameInput').value.trim();if(n){setCurrentBirdName(n);playBirdSound('feed');setMsg(`名前が「${n}」になった！`);save();updateUI()}hideModal('nameModal')}
init();
