const birds={
  buncho_sakura:{name:'桜文鳥',icon:'🐦',price:0,curr:'coins',colors:{head:'#1a1a1a',cheek:'#fff',body:'#7a7a7a',belly:'#e8d8d0',wing:'#5a5a5a',tail:'#2a2a2a',beak:'#ff6b6b',eyeRing:'#ff5555',feet:'#ffb8b8'},hasCheek:true,defaultNames:['さくら','ピーちゃん','ブンちゃん','チュン太','もち','おもち','ぴよ']},
  buncho_white:{name:'白文鳥',icon:'🕊️',price:200,curr:'coins',colors:{head:'#fefefe',cheek:'#fefefe',body:'#faf8f5',belly:'#fff5f0',wing:'#f0f0f0',tail:'#e8e8e8',beak:'#ff7777',eyeRing:'#ff6666',feet:'#ffc0c0'},hasCheek:false,defaultNames:['しろ','ゆき','ましろ','ミルク','とうふ','しらたま','もふ']},
  buncho_cinnamon:{name:'シナモン',icon:'🐤',price:300,curr:'coins',colors:{head:'#8b6914',cheek:'#fff5e6',body:'#c9a070',belly:'#f0e0d0',wing:'#b08050',tail:'#7b5414',beak:'#ffa080',eyeRing:'#ff7755',feet:'#ffc8b0'},hasCheek:true,defaultNames:['シナモン','きなこ','モカ','くるみ','あずき','ココア','チャイ']},
  buncho_silver:{name:'シルバー',icon:'🪿',price:320,curr:'coins',colors:{head:'#505050',cheek:'#f8f8f8',body:'#a8a8a8',belly:'#e0d8d0',wing:'#888',tail:'#404040',beak:'#ff8080',eyeRing:'#ff6060',feet:'#ffb0b0'},hasCheek:true,defaultNames:['シルバー','ぎん','ルナ','プラチナ','しずく','ぺる','アッシュ']},
  canary:{name:'カナリア',icon:'🐥',price:420,curr:'coins',colors:{head:'#ffeb3b',cheek:'#fff59d',body:'#ffeb3b',belly:'#fff9c4',wing:'#fdd835',tail:'#f9a825',beak:'#ff8a65',eyeRing:'#ffab91',feet:'#ffcc80'},hasCheek:false,defaultNames:['カナリア','ひまわり','レモン','こがね','ソレイユ','ひなた','サニー']},
  inko_green:{name:'セキセイインコ',icon:'🦜',price:520,curr:'coins',colors:{head:'#c8e6c9',cheek:'#a5d6a7',body:'#66bb6a',belly:'#a5d6a7',wing:'#43a047',tail:'#2e7d32',beak:'#ffb74d',eyeRing:'#fff59d',feet:'#bcaaa4'},hasCheek:false,defaultNames:['みどり','わかば','リーフ','メロン','キウイ','ミント','モス']},
  inko_blue:{name:'青インコ',icon:'💙',price:520,curr:'coins',colors:{head:'#bbdefb',cheek:'#90caf9',body:'#42a5f5',belly:'#90caf9',wing:'#1e88e5',tail:'#1565c0',beak:'#ffb74d',eyeRing:'#fff59d',feet:'#bcaaa4'},hasCheek:false,defaultNames:['そら','あお','スカイ','うみ','アクア','ブルー','セイラ']},
  buncho_pied:{name:'白黒文鳥',icon:'🤍',price:620,curr:'coins',colors:{head:'#2b2b2b',cheek:'#ffffff',body:'#dadada',belly:'#f1ece6',wing:'#707070',tail:'#1b1b1b',beak:'#ff7b7b',eyeRing:'#ff8a8a',feet:'#ffc0c0'},hasCheek:true,defaultNames:['パンダ','ゴマ','ミル','ダンゴ','黒豆','こはく','しろくろ']},
  buncho_black:{name:'黒文鳥',icon:'🖤',price:760,curr:'coins',colors:{head:'#0b0b0b',cheek:'#3b3b3b',body:'#1d1d1d',belly:'#2a2a2a',wing:'#111',tail:'#050505',beak:'#ff7b7b',eyeRing:'#ff6b6b',feet:'#ffb0b0'},hasCheek:false,defaultNames:['くろ','よぞら','カゲ','ルーク','しぐれ','ナイト','ビター']},
  finch_zebra:{name:'キンカチョウ',icon:'🤎',price:840,curr:'coins',colors:{head:'#cfcfcf',cheek:'#ff6b6b',body:'#b0b0b0',belly:'#f0ece6',wing:'#7d7d7d',tail:'#4a4a4a',beak:'#ff8a65',eyeRing:'#ffd180',feet:'#ffb0b0'},hasCheek:true,defaultNames:['しま','ゼブラ','カノン','ラテ','モノ','ビス','マーブル']},
  lovebird:{name:'コザクラインコ',icon:'💚',price:3,curr:'gems',colors:{head:'#ff9ea8',cheek:'#ffd1d9',body:'#7ed957',belly:'#b6f18c',wing:'#54c45c',tail:'#2e7d32',beak:'#ffb74d',eyeRing:'#ffeb3b',feet:'#bcaaa4'},hasCheek:false,defaultNames:['ラブ','ハート','ピーチ','さくら','メロ','ルル','ハニー']},
  cockatiel:{name:'オカメインコ',icon:'🧡',price:3,curr:'gems',colors:{head:'#ffcc80',cheek:'#ff8a65',body:'#bdbdbd',belly:'#e0e0e0',wing:'#9e9e9e',tail:'#757575',beak:'#8d6e63',eyeRing:'#ffcc80',feet:'#bcaaa4'},hasCheek:true,defaultNames:['オカメ','ピーチ','サンセット','あかり','コーラル','もみじ','ルビー']},
  owl:{name:'フクロウ',icon:'🦉',price:6,curr:'gems',colors:{head:'#8d6e63',cheek:'#d7ccc8',body:'#6d4c41',belly:'#bcaaa4',wing:'#5d4037',tail:'#4e342e',beak:'#ffd54f',eyeRing:'#ffd54f',feet:'#a1887f'},hasCheek:false,isOwl:true,defaultNames:['ふくろう','ホー太','ミミズク','よる','ウィズダム','アウル','ナイト']},
  cat:{name:'ねこ',icon:'🐱',price:720,curr:'coins',colors:{head:'#e0c39a',cheek:'#f5e2c6',body:'#cfa67a',belly:'#f2dec8',wing:'#b78961',tail:'#b07b51',beak:'#d07a4a',eyeRing:'#ffd39d',feet:'#c98d6c'},hasCheek:false,isCat:true,defaultNames:['みけ','こむぎ','そら','もか','こはく','あんず','まる']},
  fox:{name:'きつね',icon:'🦊',price:4,curr:'gems',colors:{head:'#e07a3f',cheek:'#ffe0c4',body:'#d2652f',belly:'#ffe8d6',wing:'#c35628',tail:'#b24b1f',beak:'#d26839',eyeRing:'#ffd6b8',feet:'#b35b32'},hasCheek:false,isFox:true,defaultNames:['こん','おこん','あさひ','ひばり','こはる','ほたる','しの']},
  penguin:{name:'ペンギン',icon:'🐧',price:880,curr:'coins',colors:{head:'#1f2b3a',cheek:'#dfe9f2',body:'#1b2633',belly:'#f4f7fb',wing:'#101820',tail:'#1f2b3a',beak:'#f3c05a',eyeRing:'#d5dee8',feet:'#f0c872'},hasCheek:false,isPenguin:true,defaultNames:['ペン','ゆきまる','こおり','ましろ','しらたま','あお','ちる']},
  fuga:{name:'ふうが',icon:'🧑‍🎤',price:0,curr:'coins',colors:{head:'#f1d6c8',cheek:'#f6c2c2',body:'#1d2026',belly:'#3b3f48',wing:'#2b3038',tail:'#16181d',beak:'#c08778',eyeRing:'#6c7a89',feet:'#3b3b3b'},hasCheek:false,isHuman:true,hidden:true,defaultNames:['ふうが','風牙','ユウ','ソラ','レン']}
};
const minigameCategories={all:'すべて',quick:'サクッと',brain:'ひらめき',action:'アクション'};
const minigames=[
  {id:'catch',name:'シードキャッチ',icon:'🌾',desc:'動くシードを見つけてキャッチ',cost:8,type:'catch',category:'quick',difficulty:'かんたん'},
  {id:'timing',name:'ぴったりストップ',icon:'🎯',desc:'緑のゾーンで止めよう',cost:8,type:'timing',category:'quick',difficulty:'ふつう'},
  {id:'tap',name:'もぐもぐ連打',icon:'👆',desc:'15秒でどこまで連打できる？',cost:8,type:'tap',category:'quick',difficulty:'かんたん'},
  {id:'sort',name:'ごはん仕分け',icon:'🥣',desc:'食べてよい物をすばやく判断',cost:10,type:'sort',category:'quick',difficulty:'ふつう',isNew:true},
  {id:'memory',name:'なかま神経衰弱',icon:'🧠',desc:'同じ絵柄のペアを探そう',cost:12,type:'memory',category:'brain',difficulty:'ふつう'},
  {id:'quiz',name:'どうぶつクイズ',icon:'❓',desc:'鳥や動物の豆知識に挑戦',cost:10,type:'quiz',category:'brain',difficulty:'ふつう'},
  {id:'sing',name:'メロディまねっこ',icon:'🎹',desc:'光った音の順番を再現',cost:12,type:'sing',category:'brain',difficulty:'むずかしい'},
  {id:'path',name:'ひかりの足あと',icon:'✨',desc:'番号どおりに足あとをたどる',cost:10,type:'path',category:'brain',difficulty:'ふつう'},
  {id:'maze',name:'おうちへ帰ろう',icon:'🏡',desc:'迷路を抜けておうちを目指す',cost:12,type:'maze',category:'brain',difficulty:'ふつう',isNew:true},
  {id:'rhythm',name:'リズムステップ',icon:'🎵',desc:'ノーツが線に来たらタップ',cost:10,type:'rhythm',category:'action',difficulty:'むずかしい'},
  {id:'fly',name:'フライトラン',icon:'🕊️',desc:'障害物をよけて進もう',cost:12,type:'fly',category:'action',difficulty:'むずかしい'},
  {id:'balance',name:'しっぽバランス',icon:'⚖️',desc:'左右を押して中央をキープ',cost:10,type:'balance',category:'action',difficulty:'ふつう'},
  {id:'treasure',name:'森の宝探し',icon:'💎',desc:'少ない手数で宝を探そう',cost:10,type:'treasure',category:'action',difficulty:'ふつう'},
  {id:'dodge',name:'しずくよけ',icon:'☔',desc:'左右に動いて雨粒をよける',cost:10,type:'dodge',category:'action',difficulty:'むずかしい'}
];
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
    {id:'cold_medicine',name:'かぜ薬',desc:'病気を回復 ×2',price:90,icon:'🧫',curr:'coins',amt:2},
    {id:'shampoo',name:'シャンプー',desc:'清潔全回復 ×3',price:50,icon:'🧴',curr:'coins',amt:3},
    {id:'toys',name:'おもちゃ',desc:'遊び効果UP',price:120,icon:'🎾',curr:'coins',amt:1},
    {id:'sleep_box',name:'スリープボックス',desc:'状態維持スリープ 1回',price:90,icon:'🛏️',curr:'coins',amt:1}
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
  cold_medicine:{name:'かぜ薬',icon:'🧫',usable:true,effect:'病気を回復'},
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
  return list;
}
const missionCatalog=buildMissionCatalog();
const dialogBySpecies={
  default:{
    idle:['鳥があなたを見ています...','チュン♪今日は何する？','のんびり過ごそう。'],
    feed:['パクパク...おいしい！🌾','チュン♪ありがとう！','カリカリ最高！'],
    treat:['わーい！おやつ！🍬','甘くて幸せ〜','もっとちょうだい！'],
    pet:['チュンチュン♪うれしい！','もっとなでて〜💕','眠れる...'],
    play:['わーい！楽しい！🎉','もっと遊ぼう！'],
    bath:['バシャバシャ！💦','きれいになった〜'],
    train:['賢くなった！📚','新しいこと覚えた！'],
    sing:['チュンチュン〜♪🎵','上手に歌えた！','いい鳴き声でしょ？🎤'],
    sleep:['おやすみ...💤','すやすや...']
  },
  cat:{
    idle:['にゃ〜ん。','おひるねしたいにゃ。','そばにいて。'],
    feed:['もぐもぐ...おいしいにゃ！','にゃにゃ♪','おかわり！'],
    treat:['おやつ最高にゃ！','しあわせ〜','もっと欲しいにゃ'],
    pet:['ごろごろ...','気持ちいいにゃ','もっとなでて。'],
    play:['追いかけっこしよう！','じゃらし大好き！'],
    bath:['お水はちょっと苦手...','さっぱりしたにゃ'],
    train:['覚えたにゃ！','えらいでしょ？'],
    sing:['にゃ〜ん♪','気分がいいにゃ'],
    sleep:['まるくなって寝るにゃ','すや...']
  },
  fox:{
    idle:['こんこん♪','きらきらしてるね。','冒険に出たいな。'],
    feed:['うまうま！','元気が出たよ。','もりもり食べる！'],
    treat:['甘いのだいすき！','しあわせ〜'],
    pet:['ふわふわだよ。','もっとなでて。'],
    play:['かけっこしよう！','しっぽで遊ぶ？'],
    bath:['ちょっと冷たい...','さっぱり！'],
    train:['うまくできた！','上達したよ。'],
    sing:['ふふん♪','いい音だね。'],
    sleep:['おやすみ、月夜だよ。','静かに寝るね。']
  },
  penguin:{
    idle:['ペタペタ歩くよ。','氷が恋しいな。','のんびりしよう。'],
    feed:['ぱくぱく！','おいしいね。'],
    treat:['ひんやり最高！','うれしい〜'],
    pet:['ふわふわ？','いい気分。'],
    play:['すべって遊ぼう！','海が好きだよ。'],
    bath:['水浴びは得意！','さっぱり！'],
    train:['できた！','覚えたよ。'],
    sing:['ぺたぺたリズム♪','いい感じ！'],
    sleep:['おやすみ...','すやすや。']
  },
  human:{
    idle:['静かに見守っている。','気分転換しよう。','少し休もう。'],
    feed:['いただきます。','元気が出た。','ありがと。'],
    treat:['ちょっと嬉しい。','甘いね。'],
    pet:['やさしくしてくれてるね。','安心する。'],
    play:['少し動こう。','いいリズムだ。'],
    bath:['さっぱりした。','気分が変わるね。'],
    train:['集中できた。','悪くない。'],
    sing:['小さく口ずさむ。','いい音だ。'],
    sleep:['おやすみ。','静かに休もう。']
  }
};
function pickDialog(type,fallback){
  const key=birds[G.species].isHuman?'human':birds[G.species].isCat?'cat':birds[G.species].isFox?'fox':birds[G.species].isPenguin?'penguin':'default';
  const options=(dialogBySpecies[key]&&dialogBySpecies[key][type])||(dialogBySpecies.default[type])||fallback;
  return options[Math.floor(Math.random()*options.length)];
}
let G={name:'文鳥',species:'buncho_sakura',birdNames:{buncho_sakura:'文鳥'},unlocked:['buncho_sakura'],hunger:80,happiness:80,health:100,energy:100,cleanliness:100,age:0,theme:'day',weather:'none',animationMode:'fine',resolutionScale:1,soundMode:'chirp',beta3d:false,sleepBoxUntil:null,sleepBoxLock:null,sleepBoxRate:0,chatHistory:[],bugReports:[],errorLogs:[],threeDRotX:10,threeDRotY:-8,autoTheme:true,autoWeather:false,geo:null,missions:{active:[],completed:0,history:[]},minigameStats:{plays:0,bestScores:{},lastPlayed:null,lastPlayedDate:null},social:{bond:0,streakDays:0,lastCareDate:'',todayCare:0,todayDate:''},lastWeatherFetch:0,lastUpdate:Date.now(),sleepStart:null,tFeeds:0,tPets:0,tBaths:0,tPlays:0,tSings:0,level:1,exp:0,coins:100,gems:5,inv:{seeds:10,treats:3,fruits:0,premium_food:0,energy_drink:1,vitamins:0,medicine:1,cold_medicine:0,shampoo:2,toys:0,super_energy:0,mirror:0,bell:0,swing:0,sleep_box:0},sickLevel:0,isSleeping:false,bannerDismissed:false};
const DEFAULT_GAME_STATE=JSON.parse(JSON.stringify(G));
const bounded=(value,min,max,fallback)=>{
  const n=Number(value);
  return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
};
function normalizeGameState(raw){
  const source=raw&&typeof raw==='object'?raw:{};
  const next={...DEFAULT_GAME_STATE,...source};
  const rawInv=source.inv&&typeof source.inv==='object'?source.inv:{};
  next.inv={...DEFAULT_GAME_STATE.inv};
  Object.keys(next.inv).forEach(id=>{next.inv[id]=Math.floor(bounded(rawInv[id],0,9999,DEFAULT_GAME_STATE.inv[id]));});
  ['hunger','happiness','health','energy','cleanliness','sickLevel'].forEach(key=>{next[key]=bounded(next[key],0,100,DEFAULT_GAME_STATE[key]);});
  ['age','tFeeds','tPets','tBaths','tPlays','tSings'].forEach(key=>{next[key]=Math.floor(bounded(next[key],0,1e9,0));});
  next.coins=Math.floor(bounded(next.coins,0,1e9,DEFAULT_GAME_STATE.coins));
  next.gems=Math.floor(bounded(next.gems,0,1e7,DEFAULT_GAME_STATE.gems));
  next.level=Math.floor(bounded(next.level,1,9999,1));
  next.exp=Math.floor(bounded(next.exp,0,1e9,0));
  next.lastUpdate=bounded(next.lastUpdate,0,Date.now()+60000,Date.now());
  next.lastWeatherFetch=bounded(next.lastWeatherFetch,0,Date.now()+60000,0);
  next.unlocked=Array.from(new Set((Array.isArray(source.unlocked)?source.unlocked:[]).filter(id=>birds[id])));
  if(!next.unlocked.includes('buncho_sakura'))next.unlocked.unshift('buncho_sakura');
  next.species=birds[source.species]&&next.unlocked.includes(source.species)?source.species:'buncho_sakura';
  next.birdNames={};
  const rawNames=source.birdNames&&typeof source.birdNames==='object'?source.birdNames:{};
  next.unlocked.forEach(id=>{
    const proposed=typeof rawNames[id]==='string'?rawNames[id].trim().slice(0,12):'';
    next.birdNames[id]=proposed||birds[id].name;
  });
  next.name=next.birdNames[next.species];
  next.theme=['day','sunset','night'].includes(source.theme)?source.theme:'day';
  next.weather=['none','rain','snow','sleet','hail'].includes(source.weather)?source.weather:'none';
  next.animationMode=['ultra','fine','normal','simple'].includes(source.animationMode)?source.animationMode:'fine';
  next.resolutionScale=[0.8,1,1.6].includes(Number(source.resolutionScale))?Number(source.resolutionScale):1;
  next.soundMode=['off','chirp','bell'].includes(source.soundMode)?source.soundMode:'chirp';
  next.chatHistory=(Array.isArray(source.chatHistory)?source.chatHistory:[]).filter(m=>m&&['user','ai'].includes(m.role)&&typeof m.text==='string').slice(-24).map(m=>({role:m.role,text:m.text.slice(0,600)}));
  next.bugReports=(Array.isArray(source.bugReports)?source.bugReports:[]).filter(x=>x&&typeof x.text==='string').slice(-30);
  next.errorLogs=(Array.isArray(source.errorLogs)?source.errorLogs:[]).filter(x=>x&&typeof x.msg==='string').slice(-40);
  const rawMissions=source.missions&&typeof source.missions==='object'?source.missions:{};
  const missionIds=new Set(missionCatalog.map(m=>m.id));
  next.missions={
    active:(Array.isArray(rawMissions.active)?rawMissions.active:[]).filter(m=>m&&missionIds.has(m.id)).slice(0,5).map(m=>({...m,progress:bounded(m.progress,0,bounded(m.goal,1,1e6,1),0),done:m.done===true})),
    completed:Math.floor(bounded(rawMissions.completed,0,1e9,0)),
    history:(Array.isArray(rawMissions.history)?rawMissions.history:[]).filter(id=>missionIds.has(id)).slice(-missionCatalog.length)
  };
  const rawStats=source.minigameStats&&typeof source.minigameStats==='object'?source.minigameStats:{};
  const rawBest=rawStats.bestScores&&typeof rawStats.bestScores==='object'?rawStats.bestScores:{};
  next.minigameStats={plays:Math.floor(bounded(rawStats.plays,0,1e9,0)),bestScores:{},lastPlayed:typeof rawStats.lastPlayed==='string'?rawStats.lastPlayed:null,lastPlayedDate:typeof rawStats.lastPlayedDate==='string'?rawStats.lastPlayedDate.slice(0,10):null};
  minigames.forEach(m=>{if(Number.isFinite(Number(rawBest[m.id])))next.minigameStats.bestScores[m.id]=Math.floor(bounded(rawBest[m.id],0,1e9,0));});
  const rawSocial=source.social&&typeof source.social==='object'?source.social:{};
  next.social={
    bond:Math.floor(bounded(rawSocial.bond,0,1e9,0)),
    streakDays:Math.floor(bounded(rawSocial.streakDays,0,36500,0)),
    lastCareDate:typeof rawSocial.lastCareDate==='string'?rawSocial.lastCareDate.slice(0,10):'',
    todayCare:Math.floor(bounded(rawSocial.todayCare,0,10000,0)),
    todayDate:typeof rawSocial.todayDate==='string'?rawSocial.todayDate.slice(0,10):''
  };
  next.isSleeping=source.isSleeping===true;
  next.bannerDismissed=source.bannerDismissed===true;
  next.autoTheme=source.autoTheme!==false;
  next.autoWeather=source.autoWeather===true;
  next.beta3d=source.beta3d===true;
  return next;
}
let action=null,animF=0,blink=false,mgActive=false,mgScore=0,mgTimer=null,selBird=null,shopTab='food',selItem=null;
let currentMg=null,mgData={},mgInterval=null,mgTimeouts=[],mgRunToken=0,minigameFilter='all';
let lastWeatherRender={type:null,mode:null};
let scanCache={};
const SAVE_KEY_NAME='birdG3_key';
const SAVE_NAME_NAME='birdG3_name';
let saveKeySeed=null;

function persistBackup(key,json){
  const encoded=encPayload(json);
  try{localStorage.setItem(key,encoded);}catch(e){}
  try{sessionStorage.setItem(key,encoded);}catch(e){}
}
function writeRawCookie(name,value){
  document.cookie=`${name}=${value};expires=${new Date(Date.now()+365*864e5).toUTCString()};path=/;SameSite=Lax`;
}
function readRawCookie(name){
  const row=document.cookie.split('; ').find(r=>r.startsWith(name+'='));
  if(!row)return null;
  return row.split('=')[1];
}
function getSaveKeySeed(){
  if(saveKeySeed)return saveKeySeed;
  try{saveKeySeed=localStorage.getItem(SAVE_KEY_NAME);}catch(e){}
  if(!saveKeySeed){
    try{saveKeySeed=sessionStorage.getItem(SAVE_KEY_NAME);}catch(e){}
  }
  if(!saveKeySeed){
    saveKeySeed=readRawCookie(SAVE_KEY_NAME);
  }
  if(!saveKeySeed){
    saveKeySeed=`k${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
    try{localStorage.setItem(SAVE_KEY_NAME,saveKeySeed);}catch(e){}
    try{sessionStorage.setItem(SAVE_KEY_NAME,saveKeySeed);}catch(e){}
    writeRawCookie(SAVE_KEY_NAME,saveKeySeed);
  }
  return saveKeySeed;
}
function getCipherKey(seed){
  return (seed+'|buncho_save').split('').reduce((a,c)=>a+c.charCodeAt(0),0)%131+17;
}
function legacyKeyFrom(name,level){
  const salt=String(level||1);
  return (salt+name).split('').reduce((a,c)=>a+c.charCodeAt(0),0)%97+13;
}
function bytesToBase64(bytes){
  let bin='';
  bytes.forEach(b=>{bin+=String.fromCharCode(b);});
  return btoa(bin);
}
function base64ToBytes(b64){
  const bin=atob(b64);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return bytes;
}
function encPayload(payload){
  try{
    const key=getCipherKey(getSaveKeySeed());
    const bytes=new TextEncoder().encode(payload);
    const out=bytes.map(b=>b^key);
    return bytesToBase64(out);
  }catch(e){return payload;}
}
function decodeWithKey(payload,key){
  const bytes=base64ToBytes(payload);
  const out=bytes.map(b=>b^key);
  return new TextDecoder().decode(out);
}
function decPayload(payload){
  try{
    return decodeWithKey(payload,getCipherKey(getSaveKeySeed()));
  }catch(e){return null;}
}
function writeCookie(name,value){
  document.cookie=`${name}=${encPayload(value)};expires=${new Date(Date.now()+365*864e5).toUTCString()};path=/;SameSite=Lax`;
}
function readCookie(name){
  const row=document.cookie.split('; ').find(r=>r.startsWith(name+'='));
  if(!row)return null;
  const encoded=row.split('=')[1];
  return decPayload(encoded);
}
function setCookieChunks(n,payload){
  const maxLen=3000;
  const parts=Math.ceil(payload.length/maxLen);
  for(let i=0;i<parts;i++){
    const slice=payload.slice(i*maxLen,(i+1)*maxLen);
    writeCookie(`${n}_p${i}`,slice);
  }
  writeCookie(`${n}_parts`,String(parts));
}
function clearCookieChunks(n){
  const partsRaw=readCookie(`${n}_parts`);
  const parts=partsRaw?parseInt(partsRaw,10):0;
  if(parts){
    for(let i=0;i<parts;i++)writeCookie(`${n}_p${i}`,'');
    writeCookie(`${n}_parts`,'');
  }
}
function setCookie(n,v){
  const json=JSON.stringify(v);
  const payload=encodeURIComponent(json);
  clearCookieChunks(n);
  if(payload.length>3000){
    setCookieChunks(n,payload);
  }else{
    writeCookie(n,payload);
  }
  if(!document.cookie.split('; ').some(r=>r.startsWith(n+'='))&&!readCookie(`${n}_parts`)){logError('storage','cookie_write_failed');}
  if(payload.length>12000){logError('storage','cookie_size_warning');}
  persistBackup(n,json);
}
function parseStoredValue(raw){
  if(!raw)return null;
  const decoded=decPayload(raw);
  if(decoded){
    try{return JSON.parse(decoded);}catch(e){}
  }
  const savedNameRaw=readRawCookie(SAVE_NAME_NAME);
  const savedName=savedNameRaw?decodeURIComponent(savedNameRaw):'';
  const legacyNames=[G.name,savedName].filter(Boolean);
  for(const nm of legacyNames){
    try{
      const decodedLegacy=decodeWithKey(raw,legacyKeyFrom(nm,G.level));
      const parsed=JSON.parse(decodedLegacy);
      if(parsed)return parsed;
    }catch(e){}
  }
  try{return JSON.parse(raw);}catch(e){}
  try{return JSON.parse(decodeURIComponent(raw));}catch(e){}
  return null;
}
function getCookie(n){
  const partsRaw=readCookie(`${n}_parts`);
  if(partsRaw){
    const parts=parseInt(partsRaw,10);
    if(parts>0){
      let combined='';
      for(let i=0;i<parts;i++){
        const chunk=readCookie(`${n}_p${i}`);
        if(chunk===null)break;
        combined+=chunk;
      }
      const parsed=parseStoredValue(combined);
      if(parsed)return parsed;
    }
  }
  const v=readCookie(n);
  if(v){
    const parsed=parseStoredValue(v);
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
  clearCookieChunks(n);
  try{localStorage.removeItem(n);}catch(e){}
  try{sessionStorage.removeItem(n);}catch(e){}
}
const SAVE_DB_NAME='mofumori-v4';
const SAVE_STORE='state';
const SAVE_RECORD='current';
const ACCOUNT_SAVE_PREFIX='account:';
let saveDbPromise=null,pendingSave=Promise.resolve(),cloudSaveTimer=null,identityUser=null,activeSaveUserId=null,cloudSyncSuspended=false,cloudSaveEnabled=null;
function accountSaveRecordKey(userId){return `${ACCOUNT_SAVE_PREFIX}${String(userId||'').slice(0,160)}`;}
function activeSaveRecordKey(){return activeSaveUserId?accountSaveRecordKey(activeSaveUserId):SAVE_RECORD;}
function openSaveDb(){
  if(saveDbPromise)return saveDbPromise;
  saveDbPromise=new Promise((resolve,reject)=>{
    if(!window.indexedDB){reject(new Error('indexeddb_unavailable'));return;}
    const request=indexedDB.open(SAVE_DB_NAME,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(SAVE_STORE))request.result.createObjectStore(SAVE_STORE);};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('indexeddb_open_failed'));
  });
  return saveDbPromise;
}
async function saveDbGet(key){
  const db=await openSaveDb();
  return new Promise((resolve,reject)=>{const request=db.transaction(SAVE_STORE,'readonly').objectStore(SAVE_STORE).get(key);request.onsuccess=()=>resolve(request.result??null);request.onerror=()=>reject(request.error);});
}
async function saveDbSet(key,value){
  const db=await openSaveDb();
  return new Promise((resolve,reject)=>{const tx=db.transaction(SAVE_STORE,'readwrite');tx.objectStore(SAVE_STORE).put(value,key);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);});
}
async function saveDbDelete(key){
  const db=await openSaveDb();
  return new Promise((resolve,reject)=>{const tx=db.transaction(SAVE_STORE,'readwrite');tx.objectStore(SAVE_STORE).delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
}
function stateForStorage(){
  const data=JSON.parse(JSON.stringify(G));
  delete data.chatApiKey;delete data.chatApiDraft;delete data.chatApiEnabled;
  return data;
}
function cancelQueuedCloudSave(){
  if(cloudSaveTimer)clearTimeout(cloudSaveTimer);
  cloudSaveTimer=null;
}
async function putCloudSave(record){
  const response=await fetch('/api/cloud-save',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(record)});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok){if(payload.configured===false)cloudSaveEnabled=false;throw new Error(payload.message||`cloud_save_${response.status}`);}
  cloudSaveEnabled=true;
  document.body.dataset.sync='cloud';
  renderIdentity();
  return payload;
}
function queueCloudSave(record){
  const userId=activeSaveUserId;
  if(!identityUser||!userId||String(identityUser.id)!==userId||cloudSyncSuspended||cloudSaveEnabled===false)return;
  cancelQueuedCloudSave();
  cloudSaveTimer=setTimeout(async()=>{
    cloudSaveTimer=null;
    if(cloudSyncSuspended||!identityUser||String(identityUser.id)!==userId)return;
    try{
      const payload=await putCloudSave(record);
      const key=accountSaveRecordKey(userId),latest=await saveDbGet(key).catch(()=>null);
      if(payload.savedAt&&latest?.savedAt===record.savedAt)await saveDbSet(key,{...record,savedAt:payload.savedAt});
    }catch(error){document.body.dataset.sync='local';console.warn('Cloud save skipped',error);renderIdentity();}
  },1200);
}
function clearLegacySave(){
  delCookie('birdG3');
  ['birdG3_key','birdG3_name'].forEach(name=>{document.cookie=`${name}=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;});
  try{['birdG3','birdG3_key','birdG3_name'].forEach(key=>localStorage.removeItem(key));}catch(e){}
  try{['birdG3','birdG3_key','birdG3_name'].forEach(key=>sessionStorage.removeItem(key));}catch(e){}
}
function save(){
  G.lastUpdate=Date.now();
  const record={version:'4.0.0',savedAt:new Date().toISOString(),data:stateForStorage()};
  const recordKey=activeSaveRecordKey();
  pendingSave=pendingSave.catch(()=>{}).then(()=>saveDbSet(recordKey,record)).catch(error=>{if(!scanCache.idb){scanCache.idb=true;console.error('IndexedDB save failed',error);}});
  queueCloudSave(record);
  return pendingSave;
}
function exportSave(){
  const payload={version:'4.0.0',savedAt:new Date().toISOString(),data:stateForStorage()};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`buncho_save_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('セーブデータを保存しました','achievement');
}
function triggerImport(){
  const input=document.getElementById('saveFileInput');
  if(input){input.value='';input.click();}
}
function importSaveFile(event){
  const file=event.target.files&&event.target.files[0];
  if(!file){return;}
  if(file.size>2*1024*1024){showToast('セーブファイルが大きすぎます','warning');return;}
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const raw=String(reader.result||'');
      const parsed=JSON.parse(raw);
      const data=parsed&&parsed.data?parsed.data:parsed;
      if(!data||typeof data!=='object'){throw new Error('invalid');}
      G=normalizeGameState({...G,...data});
      ensureNewSettings();
      G.name=getCurrentBirdName();
      save();
      updateUI();
      renderInv();
      renderShop();
      renderCustomize();
      renderMissions();
      renderBird();
      showToast('セーブデータを読み込みました','achievement');
    }catch(e){
      logError('save_import','invalid_file');
      showToast('セーブデータの読み込みに失敗しました','warning');
    }
  };
  reader.readAsText(file);
}
async function load(){
  let record=null;
  try{record=await saveDbGet(SAVE_RECORD);}catch(error){console.error('IndexedDB load failed',error);}
  let s=record&&record.data&&typeof record.data==='object'?record.data:null;
  if(!s){
    s=getCookie('birdG3');
    if(s){
      try{await saveDbSet(SAVE_RECORD,{version:'4.0.0',savedAt:new Date().toISOString(),data:s});clearLegacySave();showToast('新しいセーブ方式へ安全に移行しました','achievement');}
      catch(error){console.error('Save migration failed',error);}
    }
  }
  if(s){
    G=normalizeGameState({...G,...s});
    const now=Date.now(),mins=Math.max(0,Math.min(10080,(now-G.lastUpdate)/60000));
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
  G=normalizeGameState(G);
  ensureNewSettings();
  G.name=getCurrentBirdName();
  // 最初の操作を邪魔しないよう、インストール案内は十分に遊んだ後に表示する。
  if(!G.bannerDismissed&&!isStandalone())setTimeout(maybeShowInstallBanner,45000);
}

function maybeShowInstallBanner(){
  if(G.bannerDismissed||isStandalone())return;
  if(document.querySelector('.panel.show,.modal.show')){setTimeout(maybeShowInstallBanner,30000);return;}
  document.getElementById('installBanner')?.classList.add('show');
}

function getCurrentBirdName(){const species=birds[G.species]?G.species:'buncho_sakura';return (G.birdNames&&G.birdNames[species])||birds[species].name}
function setCurrentBirdName(name){if(!G.birdNames)G.birdNames={};const safe=String(name||'').trim().slice(0,12);G.birdNames[G.species]=safe||birds[G.species].name;G.name=G.birdNames[G.species]}
function ensureNewSettings(){
  if(!G.birdNames||typeof G.birdNames!=='object')G.birdNames={};
  if(!G.birdNames[G.species])G.birdNames[G.species]=G.name||birds[G.species].name;
  if(!G.animationMode)G.animationMode='fine';
  if(typeof G.resolutionScale!=='number')G.resolutionScale=1;
  if(!G.soundMode)G.soundMode='chirp';
  if(typeof G.beta3d!=='boolean')G.beta3d=false;
  if(typeof G.sleepBoxUntil!=='number')G.sleepBoxUntil=null;
  if(typeof G.sleepBoxLock!=='object'&&G.sleepBoxLock!==null)G.sleepBoxLock=null;
  if(typeof G.sleepBoxRate!=='number')G.sleepBoxRate=0;
  if(typeof G.sickLevel!=='number')G.sickLevel=0;
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
  if(!G.minigameStats||typeof G.minigameStats!=='object')G.minigameStats={plays:0,bestScores:{},lastPlayed:null,lastPlayedDate:null};
  if(!G.minigameStats.bestScores||typeof G.minigameStats.bestScores!=='object')G.minigameStats.bestScores={};
  if(typeof G.minigameStats.plays!=='number')G.minigameStats.plays=0;
  if(!G.social||typeof G.social!=='object')G.social={bond:0,streakDays:0,lastCareDate:'',todayCare:0,todayDate:''};
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
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}
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
function togglePanel(p){
  ['shop','inventory','minigame','customize','chat','social','logs','missions'].forEach(x=>{const el=document.getElementById(x+'Panel');if(!el)return;el.classList.toggle('show',x===p&&!el.classList.contains('show'))});
  if(p==='shop')renderShop();if(p==='inventory')renderInv();if(p==='minigame'){renderMinigameGrid();document.getElementById('minigameSelect').style.display='block';document.getElementById('minigamePlay').style.display='none';currentMg=null;}if(p==='chat')renderChat();if(p==='social')renderSocial();if(p==='logs'){renderChangeLog();renderErrorLogs();}if(p==='missions')renderMissions();
  const active=document.getElementById(p+'Panel');if(active?.classList.contains('show'))setTimeout(()=>active.scrollIntoView({behavior:'smooth',block:'start'}),60);
  document.querySelectorAll('.quick-dock [data-panel]').forEach(button=>{const selected=button.dataset.panel===p&&Boolean(active?.classList.contains('show'));button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
}

function updateUI(){
  const b=birds[G.species];
  checkHiddenUnlocks();
  document.getElementById('headerIcon').textContent=b.icon;
  const messageAvatar=document.getElementById('messageAvatar');if(messageAvatar)messageAvatar.textContent=b.icon;
  const speciesLabel=document.getElementById('speciesLabel');if(speciesLabel)speciesLabel.textContent=b.name;
  document.getElementById('birdName').textContent=getCurrentBirdName();
  document.getElementById('level').textContent=G.level;
  document.getElementById('coins').textContent=G.coins;
  document.getElementById('gems').textContent=G.gems;
  const d=Math.floor(G.age/86400),h=Math.floor((G.age%86400)/3600),m=Math.floor((G.age%3600)/60);
  document.getElementById('age').textContent=d>0?d+'日':h>0?h+'時間':m+'分';
  const avg=(G.hunger+G.happiness+G.health+G.energy+G.cleanliness)/5;
  document.getElementById('mood').textContent=G.sickLevel>0?'🤒':avg>80?'😊':avg>60?'🙂':avg>40?'😐':'😢';
  const moodOrb=document.getElementById('moodOrb');if(moodOrb)moodOrb.textContent=document.getElementById('mood').textContent;
  document.getElementById('expBar').style.width=(G.exp/(G.level*50)*100)+'%';
  renderStats();
  document.getElementById('tFeeds').textContent=G.tFeeds;
  document.getElementById('tPets').textContent=G.tPets;
  document.getElementById('tPlays').textContent=G.tPlays;
  document.getElementById('tBaths').textContent=G.tBaths;
  document.getElementById('sleepBtn').innerHTML=G.isSleeping?'☀️起こす':'💤寝かす';
  if(G.sleepBoxUntil&&Date.now()<G.sleepBoxUntil){document.getElementById('sleepBtn').innerHTML='🛏️解除';}
  document.body.className=G.theme;
  const svg=document.getElementById('birdSvg');svg.setAttribute('width','260');svg.setAttribute('height','286');svg.dataset.quality=G.resolutionScale>=1.6?'high':G.resolutionScale<=0.8?'low':'normal';svg.style.imageRendering='auto';svg.classList.toggle('bird-3d',G.beta3d===true);svg.classList.toggle('bird-3d-real',G.beta3d===true);svg.style.setProperty('--rx',`${G.threeDRotX}deg`);svg.style.setProperty('--ry',`${G.threeDRotY}deg`);
  document.querySelectorAll('[data-care]').forEach(btn=>{btn.disabled=G.isSleeping&&btn.id!=='sleepBtn';});
  const chatBtn=document.getElementById('chatOpenBtn');if(chatBtn)chatBtn.style.display='inline-flex';
  const loadingIcon=document.getElementById('loadingIcon');
  if(loadingIcon)loadingIcon.textContent=b.icon;
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
  document.getElementById('birdGrid').innerHTML=Object.entries(birds).filter(([id,b])=>!b.hidden||G.unlocked.includes(id)).map(([id,b])=>{
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
function checkHiddenUnlocks(){
  const hiddenId=Object.keys(birds).find(id=>birds[id].hidden);
  if(!hiddenId||G.unlocked.includes(hiddenId))return;
  const baseIds=Object.keys(birds).filter(id=>!birds[id].hidden);
  const done=baseIds.every(id=>G.unlocked.includes(id));
  if(done){
    G.unlocked.push(hiddenId);
    G.birdNames[hiddenId]=G.birdNames[hiddenId]||birds[hiddenId].name;
    showToast(`🎁 隠しキャラ「${birds[hiddenId].name}」解放！`,'achievement');
    save();
  }
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
    case'medicine':G.health=100;G.sickLevel=Math.max(0,G.sickLevel-35);playBirdSound('feed');setMsg('体調が落ち着いた！💊');break;
    case'cold_medicine':G.sickLevel=0;G.health=Math.min(100,G.health+12);playBirdSound('feed');setMsg('病気が良くなった！🧫');break;
    case'shampoo':G.cleanliness=100;G.happiness=Math.min(100,G.happiness+6);playBirdSound('bath');setMsg('ふんわり清潔になった！🧴');break;
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
      if(G.missions.completed%5===0){
        G.gems+=2;
        showToast('💎 ミッション5個達成ボーナス +2','achievement');
      }
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
  const summary=document.getElementById('missionSummary');
  if(summary){const remaining=5-(G.missions.completed%5||0);summary.innerHTML=`<strong>${G.missions.completed}</strong>個クリア済み <span>あと${remaining}個で 💎2</span>`;}
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
  const isCat=b.isCat===true;
  const isFox=b.isFox===true;
  const isPenguin=b.isPenguin===true;
  const isHuman=b.isHuman===true;
  const bodyCenterY=isPenguin?140:(isCat||isFox?134:132);
  const bodyRx=isPenguin?46:(isCat||isFox?52:48);
  const bodyRy=isPenguin?50:(isCat||isFox?36:42);
  const bellyRx=isPenguin?28:(isCat||isFox?30:34);
  const bellyRy=isPenguin?34:(isCat||isFox?24:30);
  const wingOffsetX=isPenguin?58:52;
  const wingOffsetY=isPenguin?126:120;
  const wingRx=isPenguin?12:14;
  const wingRy=isPenguin?26:35;
  const headR=isPenguin?36:(isCat||isFox?38:42);
  const bounce=Math.sin(animF*0.14*speed)*3.2*amp,tilt=Math.sin(animF*0.07*speed)*2*amp;
  const tailWiggle=Math.sin(animF*0.2*speed)*4*amp;
  const wingFlap=action==='play'||action==='bath'||action==='sing'?Math.sin(animF*0.38*speed)*12*amp:Math.sin(animF*0.04*speed)*2*amp;
  const headTilt=action==='pet'?Math.sin(animF*0.18*speed)*6*amp:tilt;
  const eyesClosed=G.isSleeping||blink||action==='pet';
  const jumpY=action==='play'?Math.abs(Math.sin(animF*0.28*speed))*16*amp:0;
  const eatBob=action==='feed'||action==='treat'?Math.max(0,Math.sin(animF*0.32*speed))*3*amp:0;
  const shake=action==='bath'?Math.sin(animF*0.5*speed)*4*amp:0;
  const singBob=action==='sing'?Math.sin(animF*0.32*speed)*4*amp:0;
  const bellyPulse=Math.sin(animF*0.12*speed)*1.3*amp;
  const mouthActive=action==='feed'||action==='treat'||action==='sing';
  const mouthOpenBase=mouthActive?1.6:0.15;
  const mouthOpen=G.isSleeping?0:mouthOpenBase+Math.abs(Math.sin(animF*0.4*speed))*(mouthActive?1.4:0.2);
  if(isHuman){
    const bob=bounce*0.45-jumpY*0.45;
    const armSwing=(action==='play'?Math.sin(animF*0.28*speed)*24:Math.sin(animF*0.12*speed)*5)*amp;
    svg.innerHTML=`
      <defs>
        <linearGradient id="humanBody" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#323842"/><stop offset="100%" stop-color="#16191f"/></linearGradient>
        <linearGradient id="humanSkin" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffe1d2"/><stop offset="100%" stop-color="#dcae9b"/></linearGradient>
        <filter id="humanSh"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity="0.24"/></filter>
      </defs>
      <ellipse cx="100" cy="203" rx="52" ry="9" fill="rgba(31,26,38,.18)"/>
      <g transform="translate(0,${-bob})" filter="url(#humanSh)">
        <g transform="rotate(${armSwing},65,132)"><rect x="53" y="126" width="19" height="57" rx="10" fill="url(#humanBody)"/><circle cx="63" cy="181" r="9" fill="url(#humanSkin)"/></g>
        <g transform="rotate(${-armSwing},135,132)"><rect x="128" y="126" width="19" height="57" rx="10" fill="url(#humanBody)"/><circle cx="137" cy="181" r="9" fill="url(#humanSkin)"/></g>
        <rect x="72" y="171" width="23" height="31" rx="8" fill="#252a33"/><rect x="105" y="171" width="23" height="31" rx="8" fill="#252a33"/>
        <path d="M68 198 h30 q2 10 -10 10 H68z" fill="#f1f3f5"/><path d="M102 198 h30 v10 h-22 q-8 0 -8-10z" fill="#f1f3f5"/>
        <path d="M61 120 Q100 102 139 120 L132 178 Q100 188 68 178 Z" fill="url(#humanBody)"/>
        <path d="M78 118 Q100 139 122 118 L119 150 Q100 161 81 150Z" fill="#424956" opacity=".8"/>
        <path d="M83 152 h34 l8 24 H75z" fill="#23272f"/><text x="100" y="171" text-anchor="middle" font-size="18" font-weight="900" fill="#72e6c7">F</text>
        <rect x="93" y="103" width="14" height="21" rx="7" fill="url(#humanSkin)"/>
        <circle cx="100" cy="76" r="33" fill="url(#humanSkin)"/>
        <path d="M68 74 Q69 37 101 38 Q132 39 134 68 Q122 55 110 53 Q92 67 68 74Z" fill="#16181d"/>
        <path d="M71 68 Q84 51 99 44 Q91 64 73 79Z" fill="#202329"/>
        ${eyesClosed?`<path d="M80 78 q8 7 16 0 M105 78 q8 7 16 0" stroke="#342827" stroke-width="3.2" fill="none" stroke-linecap="round"/>`:`<ellipse cx="88" cy="79" rx="6" ry="7" fill="#2c2525"/><ellipse cx="113" cy="79" rx="6" ry="7" fill="#2c2525"/><circle cx="90" cy="77" r="2" fill="#fff"/><circle cx="115" cy="77" r="2" fill="#fff"/>`}
        <path d="M91 99 Q100 ${102+mouthOpen} 110 98" stroke="#a65e64" stroke-width="2.3" fill="none" stroke-linecap="round"/>
      </g>
      ${action==='sing'?`<text x="151" y="62" font-size="22" fill="#7b61ff">♪</text><text x="166" y="43" font-size="15" fill="#ff6b9d">♫</text>`:''}
      ${G.isSleeping?`<text x="148" y="48" font-size="24" fill="#756cf2">Z</text><text x="169" y="29" font-size="16" fill="#756cf2">z</text>`:''}`;
    return;
  }
  if(isCat){
    const wag=Math.sin(animF*.16*speed)*12*amp;
    svg.innerHTML=`<defs><linearGradient id="catFur" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f2d5aa"/><stop offset="1" stop-color="${c.body}"/></linearGradient><filter id="catSh"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity=".22"/></filter></defs>
      <ellipse cx="100" cy="198" rx="69" ry="13" fill="rgba(83,55,38,.16)"/>
      <g transform="translate(0,${-bounce-jumpY*.7})" filter="url(#catSh)">
        <path d="M137 151 C181 ${146-wag*.15} 176 ${187+wag*.3} 145 184 C165 178 164 160 143 166" fill="none" stroke="${c.tail}" stroke-width="18" stroke-linecap="round"/>
        <ellipse cx="100" cy="145" rx="48" ry="45" fill="url(#catFur)"/><ellipse cx="100" cy="153" rx="27" ry="31" fill="${c.belly}" opacity=".82"/>
        <ellipse cx="68" cy="174" rx="24" ry="20" fill="${c.body}"/><ellipse cx="132" cy="174" rx="24" ry="20" fill="${c.body}"/>
        <ellipse cx="76" cy="192" rx="20" ry="10" fill="${c.cheek}"/><ellipse cx="124" cy="192" rx="20" ry="10" fill="${c.cheek}"/>
        <g transform="rotate(${headTilt},100,82)"><circle cx="100" cy="84" r="42" fill="url(#catFur)"/>
          <path d="M66 58 L77 22 L96 52Z M134 58 L123 22 L104 52Z" fill="${c.head}"/><path d="M73 51 L78 32 L88 50Z M127 51 L122 32 L112 50Z" fill="#e9a6a0"/>
          <path d="M84 49 q7 -8 13 0 M103 49 q7 -8 13 0" stroke="#a67955" stroke-width="3" fill="none"/>
          ${eyesClosed?`<path d="M72 78 q10 9 20 0 M108 78 q10 9 20 0" stroke="#3f3028" stroke-width="4" fill="none" stroke-linecap="round"/>`:`<ellipse cx="82" cy="78" rx="9" ry="12" fill="#315943"/><ellipse cx="118" cy="78" rx="9" ry="12" fill="#315943"/><ellipse cx="82" cy="79" rx="2" ry="8" fill="#101814"/><ellipse cx="118" cy="79" rx="2" ry="8" fill="#101814"/><circle cx="85" cy="74" r="2.5" fill="#fff"/><circle cx="121" cy="74" r="2.5" fill="#fff"/>`}
          <ellipse cx="100" cy="100" rx="22" ry="15" fill="${c.cheek}"/><path d="M95 96 Q100 91 105 96 Q100 102 95 96Z" fill="#8d554b"/><path d="M100 101 q-8 ${7+mouthOpen} -15 1 M100 101 q8 ${7+mouthOpen} 15 1" stroke="#604137" stroke-width="2" fill="none"/>
          <path d="M76 101 L47 95 M76 106 L44 107 M124 101 L153 95 M124 106 L156 107" stroke="#755747" stroke-width="2" stroke-linecap="round"/>
        </g>
        ${action==='pet'?`<text x="47" y="44" font-size="20">💕</text><text x="139" y="57" font-size="16">💕</text>`:''}${action==='bath'?[0,1,2,3,4].map(i=>`<circle cx="${60+i*20}" cy="${142+(i%2)*18}" r="${3+i%2}" fill="#8dd8ff" opacity=".8"/>`).join(''):''}
      </g>${G.isSleeping?`<text x="153" y="54" font-size="25" fill="#6c63d9">Z</text>`:''}`;
    return;
  }
  if(isFox){
    const wag=Math.sin(animF*.2*speed)*10*amp;
    svg.innerHTML=`<defs><linearGradient id="foxFur" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f49a55"/><stop offset="1" stop-color="${c.body}"/></linearGradient><filter id="foxSh"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity=".23"/></filter></defs>
      <ellipse cx="101" cy="200" rx="70" ry="12" fill="rgba(80,43,27,.16)"/><g transform="translate(0,${-bounce-jumpY*.7})" filter="url(#foxSh)">
        <g transform="rotate(${wag},53,159)"><path d="M78 141 C35 123 24 174 55 190 C76 201 89 183 73 174 C58 166 49 177 57 184" fill="none" stroke="${c.tail}" stroke-width="27" stroke-linecap="round"/><path d="M48 186 C37 180 35 167 43 160" fill="none" stroke="#fff2dc" stroke-width="26" stroke-linecap="round"/></g>
        <ellipse cx="108" cy="148" rx="42" ry="47" fill="url(#foxFur)"/><path d="M88 119 Q108 166 128 119 L126 175 Q108 190 89 174Z" fill="#fff1df"/>
        <path d="M84 166 q-5 27 -3 31 h19 v-30 M116 166 q5 27 3 31 h-19 v-30" fill="#442f2b"/>
        <ellipse cx="89" cy="195" rx="16" ry="8" fill="#352724"/><ellipse cx="121" cy="195" rx="16" ry="8" fill="#352724"/>
        <g transform="rotate(${headTilt},104,78)"><path d="M65 60 L78 19 L98 53 M143 60 L129 19 L109 53" fill="${c.head}"/><path d="M74 51 L79 31 L89 51 M134 51 L128 31 L118 51" fill="#442f2b"/>
          <path d="M69 72 Q104 38 139 72 L130 105 Q104 124 78 105Z" fill="url(#foxFur)"/><path d="M79 89 Q104 118 129 89 Q122 116 104 121 Q86 115 79 89Z" fill="#fff1df"/>
          ${eyesClosed?`<path d="M77 75 q9 8 18 0 M113 75 q9 8 18 0" stroke="#3b2823" stroke-width="4" fill="none" stroke-linecap="round"/>`:`<path d="M76 75 q10 -9 20 0 q-10 10 -20 0 M112 75 q10 -9 20 0 q-10 10 -20 0" fill="#2d231f"/><circle cx="87" cy="73" r="2.5" fill="#fff"/><circle cx="123" cy="73" r="2.5" fill="#fff"/>`}
          <circle cx="104" cy="101" r="6" fill="#30231f"/><path d="M104 107 q-8 ${6+mouthOpen} -15 1 M104 107 q8 ${6+mouthOpen} 15 1" stroke="#5d4037" stroke-width="2" fill="none"/>
        </g>${action==='play'?`<text x="144" y="39" font-size="19">✨</text><text x="52" y="54" font-size="15">✨</text>`:''}${action==='sing'?`<text x="148" y="70" font-size="20" fill="#ad4ee0">♪</text>`:''}
      </g>${G.isSleeping?`<text x="150" y="51" font-size="25" fill="#6c63d9">Z</text>`:''}`;
    return;
  }
  if(isPenguin){
    const waddle=Math.sin(animF*.16*speed)*3.5*amp;
    svg.innerHTML=`<defs><linearGradient id="penguinBody" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#34485d"/><stop offset="1" stop-color="#111b27"/></linearGradient><filter id="penguinSh"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity=".22"/></filter></defs>
      <ellipse cx="100" cy="202" rx="62" ry="12" fill="rgba(20,54,80,.14)"/><path d="M45 196 Q100 174 155 196 Q132 213 67 211Z" fill="#e8f8ff" opacity=".9"/>
      <g transform="translate(${waddle},${-bounce-jumpY*.75}) rotate(${waddle*.35},100,160)" filter="url(#penguinSh)">
        <ellipse cx="100" cy="141" rx="48" ry="62" fill="url(#penguinBody)"/><ellipse cx="100" cy="151" rx="31" ry="47" fill="#f7fbff"/>
        <g transform="rotate(${-wingFlap},62,126)"><path d="M67 105 Q42 131 51 169 Q66 151 76 122Z" fill="#172332"/></g><g transform="rotate(${wingFlap},138,126)"><path d="M133 105 Q158 131 149 169 Q134 151 124 122Z" fill="#172332"/></g>
        <ellipse cx="80" cy="194" rx="24" ry="9" fill="#f4c35d"/><ellipse cx="120" cy="194" rx="24" ry="9" fill="#f4c35d"/>
        <g transform="rotate(${headTilt},100,75)"><circle cx="100" cy="78" r="42" fill="url(#penguinBody)"/><path d="M64 78 Q100 41 136 78 Q127 53 100 45 Q73 53 64 78Z" fill="#101a26"/><ellipse cx="100" cy="89" rx="31" ry="28" fill="#f7fbff"/>
          ${eyesClosed?`<path d="M76 76 q9 8 18 0 M106 76 q9 8 18 0" stroke="#1d2732" stroke-width="4" fill="none" stroke-linecap="round"/>`:`<circle cx="84" cy="77" r="8" fill="#16202b"/><circle cx="116" cy="77" r="8" fill="#16202b"/><circle cx="87" cy="74" r="3" fill="#fff"/><circle cx="119" cy="74" r="3" fill="#fff"/>`}
          <path d="M89 92 L100 ${104+mouthOpen*.35} L111 92 Q100 85 89 92Z" fill="#f4bd4d"/>
        </g>${action==='bath'?[0,1,2,3,4,5].map(i=>`<circle cx="${57+i*17}" cy="${119+(i%3)*18}" r="${2+i%3}" fill="#73cfff" opacity=".82"/>`).join(''):''}${action==='play'?`<text x="145" y="43" font-size="18">❄️</text>`:''}
      </g>${G.isSleeping?`<text x="150" y="48" font-size="25" fill="#6c63d9">Z</text>`:''}`;
    return;
  }
  svg.innerHTML=`
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c.body}"/><stop offset="100%" stop-color="${c.wing}"/></linearGradient>
      <linearGradient id="bel" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c.belly}"/><stop offset="100%" stop-color="${c.body}" stop-opacity="0.7"/></linearGradient>
      <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity="0.2"/></filter>
    </defs>
    <g transform="translate(0,${-bounce-jumpY+eatBob+singBob}) rotate(${shake},100,120)">
      <g transform="translate(100,158) rotate(${-10+tilt+tailWiggle})"><path d="M0,0 L-18,42 L0,44 L18,42 Z" fill="${c.tail}"/></g>
    </g>
    <rect x="28" y="188" width="144" height="10" rx="5" fill="#a07818"/>
    <g transform="translate(0,${-bounce-jumpY+eatBob+singBob}) rotate(${shake},100,120)" filter="url(#sh)">
      <ellipse cx="100" cy="198" rx="${50+jumpY/2}" ry="7" fill="rgba(0,0,0,0.1)"/>
      <g transform="translate(82,175)"><path d="M0,0 L-9,16 M0,0 L0,18 M0,0 L9,16" stroke="${c.feet}" stroke-width="4" stroke-linecap="round" fill="none"/></g>
      <g transform="translate(118,175)"><path d="M0,0 L-9,16 M0,0 L0,18 M0,0 L9,16" stroke="${c.feet}" stroke-width="4" stroke-linecap="round" fill="none"/></g>
      <ellipse cx="100" cy="${bodyCenterY}" rx="${bodyRx}" ry="${bodyRy}" fill="url(#bg)"/>
      <ellipse cx="100" cy="${bodyCenterY+13}" rx="${bellyRx}" ry="${bellyRy+bellyPulse}" fill="url(#bel)"/>
      <ellipse cx="92" cy="120" rx="12" ry="8" fill="rgba(255,255,255,0.14)"/>
      ${quality?'<path d="M70,128 Q100,98 132,126" stroke="rgba(255,255,255,0.16)" stroke-width="2" fill="none"/>':''}
      <path d="M72,150 Q100,164 128,150" stroke="rgba(0,0,0,0.08)" stroke-width="2" fill="none"/>
      <path d="M76,160 Q100,172 124,160" stroke="rgba(0,0,0,0.06)" stroke-width="2" fill="none"/>
      <g transform="translate(${wingOffsetX},${wingOffsetY}) rotate(${-wingFlap})"><ellipse cx="0" cy="18" rx="${wingRx}" ry="${wingRy}" fill="${c.wing}"/></g>
      <g transform="translate(${200-wingOffsetX},${wingOffsetY}) rotate(${wingFlap})"><ellipse cx="0" cy="18" rx="${wingRx}" ry="${wingRy}" fill="${c.wing}"/></g>
      <g transform="rotate(${headTilt},100,78)">
        <circle cx="100" cy="78" r="${headR}" fill="${c.head}"/>
        ${isCat?`<path d="M68,52 L82,30 L94,56 Z" fill="${c.head}"/><path d="M132,52 L118,30 L106,56 Z" fill="${c.head}"/>`:''}
        ${isFox?`<path d="M66,54 L82,26 L96,56 Z" fill="${c.head}"/><path d="M134,54 L118,26 L104,56 Z" fill="${c.head}"/>`:''}
        ${isPenguin?`<path d="M100,44 C84,40 76,30 74,22 C86,26 94,30 100,36 C106,30 114,26 126,22 C124,30 116,40 100,44 Z" fill="${c.head}"/>`:''}
        ${b.hasCheek?`<ellipse cx="70" cy="88" rx="18" ry="16" fill="${c.cheek}"/><ellipse cx="130" cy="88" rx="18" ry="16" fill="${c.cheek}"/>`:''}
        <circle cx="78" cy="72" r="14" fill="${c.eyeRing}"/><circle cx="122" cy="72" r="14" fill="${c.eyeRing}"/>
        ${eyesClosed?`<path d="M67,72 Q78,82 89,72" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M111,72 Q122,82 133,72" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>`:`<circle cx="78" cy="72" r="10" fill="#0a0505"/><circle cx="122" cy="72" r="10" fill="#0a0505"/><circle cx="82" cy="68" r="4" fill="white"/><circle cx="126" cy="68" r="4" fill="white"/>`}
        ${isCat?`<path d="M60,84 L48,82 M60,88 L46,90 M60,92 L48,96" stroke="#6b4b3a" stroke-width="2" stroke-linecap="round"/><path d="M140,84 L152,82 M140,88 L154,90 M140,92 L152,96" stroke="#6b4b3a" stroke-width="2" stroke-linecap="round"/>`:''}
        ${isFox?`<path d="M86,92 Q100,108 114,92 Q100,100 86,92 Z" fill="#f6e4d0"/><circle cx="100" cy="96" r="4" fill="#4b2b1e"/>`:''}
        ${isPenguin?`<ellipse cx="100" cy="90" rx="18" ry="14" fill="#f4f7fb"/><circle cx="100" cy="94" r="4" fill="#1c1c1c"/>`:''}
        <g transform="translate(100,98) rotate(${eatBob>0?Math.sin(animF*0.5)*4:0})">
          ${isCat||isFox?`<path d="M-6,-6 Q0,${1.5+mouthOpen*0.3} 6,-6 Z" fill="${c.beak}"/><circle cx="0" cy="${1.5+mouthOpen*0.15}" r="${2+mouthOpen*0.08}" fill="#402318"/><path d="M-6,${1.8+mouthOpen*0.4} Q0,${3+mouthOpen*0.6} 6,${1.8+mouthOpen*0.4}" stroke="#402318" stroke-width="1.3" fill="none" stroke-linecap="round"/>`:(isPenguin?`<path d="M-6,-6 L0,${7+mouthOpen*0.2} L6,-6 Z" fill="${c.beak}"/>`:(b.isOwl?`<path d="M-5,-8 L0,${5.5+mouthOpen*0.25} L5,-8 Z" fill="${c.beak}"/>`:`<ellipse cx="0" cy="-3" rx="14" ry="10" fill="${c.beak}"/><ellipse cx="0" cy="${4+mouthOpen*0.15}" rx="11" ry="${5.6+mouthOpen*0.25}" fill="${c.beak}" opacity="0.85"/><path d="M-10,${2.2+mouthOpen*0.4} Q0,${4.2+mouthOpen*0.6} 10,${2.2+mouthOpen*0.4}" stroke="#b85c5c" stroke-width="1.2" fill="none" stroke-linecap="round"/>`))}
          <ellipse cx="-4" cy="-6" rx="4" ry="3" fill="rgba(255,255,255,0.35)"/>
        </g>
        ${action==='sing'?`<text x="145" y="50" font-size="16" fill="#ff6b9d" opacity="${0.4+Math.sin(animF*0.25)*0.6}">♪</text><text x="158" y="35" font-size="12" fill="#9c27b0" opacity="${0.4+Math.sin(animF*0.25+1)*0.6}">♫</text>`:''}
      </g>
      ${G.isSleeping?`<text x="152" y="46" font-size="22" fill="#6a6aff" font-weight="bold" opacity="${0.35+Math.sin(animF*0.12)*0.65}">Z</text><text x="170" y="28" font-size="15" fill="#6a6aff" font-weight="bold" opacity="${0.35+Math.sin(animF*0.12+1)*0.65}">z</text>`:''}
      ${action==='feed'||action==='treat'?[0,1,2,3,4].map(i=>`<ellipse cx="${90+i*6+Math.sin(animF*0.12+i)*2}" cy="${108+((animF*0.8+i*7)%16)}" rx="${1.6+((i%2)*0.5)}" ry="${1.1+((i%3)*0.3)}" fill="#c89a62" opacity="${0.9-((animF*0.8+i*7)%16)/18}"/>`).join(''):''}
      ${action==='pet'?[0,1,2].map(i=>`<text x="${55+i*42}" y="${38+Math.sin(animF*0.2+i)*12}" font-size="18" opacity="${0.45+Math.sin(animF*0.2+i)*0.55}">💕</text>`).join(''):''}
      ${action==='play'?[0,1,2,3].map(i=>`<text x="${44+i*38}" y="${28+Math.abs(Math.sin(animF*0.3+i*0.6))*30}" font-size="15">✨</text>`).join(''):''}
      ${action==='bath'?[0,1,2,3,4,5,6].map(i=>`<ellipse cx="${58+i*12+Math.sin(animF*0.25+i)*4}" cy="${154+(animF*1.4+i*9)%44}" rx="${1.4+Math.sin(animF*0.1+i)*0.6}" ry="${2.2+Math.cos(animF*0.12+i)*0.7}" fill="#9bd7ff" opacity="${1-((animF*1.4+i*9)%44)/45}"/>`).join(''):''}
    </g>`;
}
function doAction(n,cb){if(action||(G.isSleeping&&n!=='wake')){if(G.isSleeping)setMsg('いまは眠っているよ。起こしてからお世話してね。');return false}action=n;recordBondAction(n);cb();updateUI();setTimeout(()=>{action=null;updateUI();},1400);return true}
function addCoins(amount,opts={}){
  if(!amount)return;
  G.coins=Math.max(0,G.coins+amount);
  if(amount>0&&!opts.ignoreMission)addMissionProgress('coins',amount);
}
function spendCoins(amount){G.coins=Math.max(0,G.coins-amount);}
function feedBird(){if(G.inv.seeds<=0){playBirdSound('feed');setMsg('シードがない！');return}doAction('feed',()=>{playBirdSound('feed');G.inv.seeds--;G.hunger=Math.min(100,G.hunger+18);G.happiness=Math.min(100,G.happiness+3);G.tFeeds++;addMissionProgress('feed',1);addExp(2);setMsg(pickDialog('feed',['パクパク...おいしい！🌾']));save()})}
function petBird(){doAction('pet',()=>{playBirdSound('pet');G.happiness=Math.min(100,G.happiness+10+(G.inv.mirror>0?5:0));G.tPets++;addMissionProgress('pet',1);addExp(1);setMsg(pickDialog('pet',['チュンチュン♪うれしい！']));save()})}
function playBird(){if(G.energy<20){playBirdSound('feed');setMsg('疲れてる...休ませて...');return}doAction('play',()=>{playBirdSound('play');const b=G.inv.swing>0?2:1,tb=G.inv.toys>0?5:0;G.happiness=Math.min(100,G.happiness+(15+tb)*b);G.energy=Math.max(0,G.energy-12);G.hunger=Math.max(0,G.hunger-5);G.tPlays++;addMissionProgress('play',1);addCoins(2);addExp(3);setMsg(pickDialog('play',['わーい！楽しい！🎉']));save()})}
function bathBird(){doAction('bath',()=>{playBirdSound('bath');G.cleanliness=Math.min(100,G.cleanliness+45);G.happiness=Math.min(100,G.happiness+8);G.tBaths++;addMissionProgress('bath',1);addExp(2);setMsg(pickDialog('bath',['水浴びでさっぱりした！💦']));save()})}
function toggleSleep(){
  if(G.sleepBoxUntil&&Date.now()<G.sleepBoxUntil){cancelSleepBox();return;}
  if(G.isSleeping){G.isSleeping=false;G.sleepStart=null;playBirdSound('feed');setMsg('おはよう！🌅')}
  else{G.isSleeping=true;G.sleepStart=Date.now();addMissionProgress('sleep',1);playBirdSound('feed');setMsg(pickDialog('sleep',['おやすみ...💤 閉じても元気が回復！']))}
  save();updateUI();
}
function giveTreat(){if(G.inv.treats<=0){playBirdSound('feed');setMsg('おやつがない！');return}doAction('treat',()=>{playBirdSound('feed');G.inv.treats--;G.happiness=Math.min(100,G.happiness+25);G.hunger=Math.min(100,G.hunger+10);G.tFeeds++;addMissionProgress('feed',1);addMissionProgress('treat',1);addExp(4);setMsg(pickDialog('treat',['わーい！おやつ！🍬']));save()})}
function trainBird(){if(G.energy<25){playBirdSound('feed');setMsg('疲れてる...訓練は無理...');return}doAction('train',()=>{playBirdSound('play');G.energy=Math.max(0,G.energy-15);addMissionProgress('train',1);addCoins(3);addExp(4);setMsg(pickDialog('train',['賢くなった！📚']));save()})}
function singBird(){if(G.energy<15){playBirdSound('feed');setMsg('疲れて歌えない...');return}doAction('sing',()=>{playBirdSound('sing');G.happiness=Math.min(100,G.happiness+12);G.energy=Math.max(0,G.energy-8);G.tSings++;addMissionProgress('sing',1);addCoins(2);addExp(3);setMsg(pickDialog('sing',['チュンチュン〜♪🎵']));save()})}
function buyItem(id,price,curr,amt){if(G[curr]<price){showToast(curr==='gems'?'💎が足りません':'💰が足りません','warning');return}G[curr]-=price;G.inv[id]=(G.inv[id]||0)+amt;addMissionProgress('buy',1);showToast('購入しました！');playBirdSound('feed');setMsg('お買い物ありがとう！🛒');save();updateUI();renderInv()}

// Minigame System
function renderMinigameGrid(){
  const list=minigameFilter==='all'?minigames:minigames.filter(m=>m.category===minigameFilter);
  const filterWrap=document.getElementById('minigameFilters');
  if(filterWrap)filterWrap.innerHTML=Object.entries(minigameCategories).map(([id,label])=>`<button class="minigame-filter ${minigameFilter===id?'active':''}" onclick="setMinigameFilter('${id}')">${label}</button>`).join('');
  document.getElementById('minigameGrid').innerHTML=list.map(mg=>`
    <button class="minigame-card" onclick="selectMinigame('${mg.id}')">
      ${mg.isNew?'<span class="new-ribbon">NEW</span>':''}
      <div class="minigame-card-icon">${mg.icon}</div>
      <div class="minigame-card-name">${mg.name}</div>
      <div class="minigame-card-desc">${mg.desc}</div>
      <div class="minigame-card-meta"><span>${mg.difficulty}</span><span>BEST ${G.minigameStats.bestScores[mg.id]||0}</span></div>
    </button>
  `).join('');
}
function setMinigameFilter(filter){minigameFilter=minigameCategories[filter]?filter:'all';renderMinigameGrid();}
function selectMinigame(id){
  currentMg=minigames.find(m=>m.id===id);
  if(!currentMg)return;
  document.getElementById('minigameSelect').style.display='none';
  document.getElementById('minigamePlay').style.display='block';
  document.getElementById('mgName').textContent=currentMg.name;
  document.getElementById('startMgBtn').textContent=`開始(${currentMg.cost}💰)`;
  const best=document.getElementById('mgBest');if(best)best.textContent=`ベスト ${G.minigameStats.bestScores[currentMg.id]||0}`;
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
function scheduleMgTimeout(fn,delay){
  const token=mgRunToken;
  const id=setTimeout(()=>{mgTimeouts=mgTimeouts.filter(x=>x!==id);if(mgActive&&token===mgRunToken)fn();},delay);
  mgTimeouts.push(id);return id;
}
function clearMinigameRuntime(){
  clearInterval(mgTimer);mgTimer=null;
  if(mgInterval)clearInterval(mgInterval);mgInterval=null;
  mgTimeouts.forEach(clearTimeout);mgTimeouts=[];
  document.removeEventListener('keydown',flyKeyHandler);
  mgRunToken++;
}
function startCurrentMinigame(){
  if(!currentMg||G.coins<currentMg.cost){setMsg('コインが足りない...');return}
  clearMinigameRuntime();
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
    case'sort':startSortGame();break;
    case'maze':startMazeGame();break;
    default:startTapGame(currentMg.variant);break;
  }
  mgTimer=setInterval(()=>{mgData.time--;document.getElementById('mgTime').textContent=mgData.time;if(mgData.time<=0)endMinigame()},1000);
}

function startExtraMinigame(){startTapGame();}

function endMinigame(){
  if(!mgActive)return;
  mgActive=false;clearMinigameRuntime();
  const r=Math.floor(mgScore*3);addCoins(r);G.happiness=Math.min(100,G.happiness+Math.min(mgScore,10));
  const gameId=currentMg&&currentMg.id;
  let newBest=false;
  if(gameId){const oldBest=G.minigameStats.bestScores[gameId]||0;newBest=mgScore>oldBest;G.minigameStats.bestScores[gameId]=Math.max(oldBest,mgScore);G.minigameStats.lastPlayed=gameId;G.minigameStats.lastPlayedDate=new Date().toLocaleDateString('sv-SE');}
  G.minigameStats.plays++;
  addMissionProgress('minigame',1);
  addMissionProgress('minigame_score',mgScore);
  addExp(Math.floor(mgScore/2));
  document.getElementById('startMgBtn').style.display='block';
  document.getElementById('mgTarget').style.display='none';
  document.getElementById('mgContent').innerHTML='';
  showToast(`${newBest?'🏆 NEW BEST! ':'ゲーム終了！'}${r}コイン獲得`,'achievement');
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
      scheduleMgTimeout(()=>{mgData.cards[a].flipped=mgData.cards[b].flipped=false;mgData.flippedCards=[];renderMemoryCards();},800);
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
  scheduleMgTimeout(()=>area.style.transform='scale(1)',50);
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
  scheduleMgTimeout(showQuiz,1000);
}

// 7. Fly Game
function startFlyGame(variant=0){
  mgData.birdY=50;mgData.obstacles=[];mgData.time=18+(variant%4)*3;document.getElementById('mgTime').textContent=mgData.time;
  mgData.flySpeed=2.4+(variant%4)*0.4;
  mgData.flySpawn=0.07+(variant%3)*0.02;
  document.getElementById('mgContent').innerHTML=`<div class="fly-area" id="flyArea"><div class="fly-bird" id="flyBird">🐦</div></div>`;
  document.addEventListener('keydown',flyKeyHandler);
  document.getElementById('flyArea').addEventListener('pointerdown',flyUp);
  mgInterval=setInterval(flyTick,50);
}
function flyKeyHandler(e){if(e.code==='Space'||e.code==='ArrowUp')flyUp();}
function flyUp(){if(!mgActive)return;mgData.birdY=Math.max(10,mgData.birdY-15);}
function flyTick(){
  if(!mgActive)return;
  mgData.birdY=Math.min(90,mgData.birdY+2);
  if(Math.random()<mgData.flySpawn){mgData.obstacles.push({x:100,y:20+Math.random()*60,emoji:['🌲','☁️','⛰️','🌸'][Math.floor(Math.random()*4)],counted:false});}
  mgData.obstacles=mgData.obstacles.filter(o=>{o.x-=mgData.flySpeed;return o.x>-10;});
  const bird=document.getElementById('flyBird');if(bird)bird.style.top=mgData.birdY+'%';
  const area=document.getElementById('flyArea');if(!area)return;
  area.querySelectorAll('.fly-obstacle').forEach(e=>e.remove());
  mgData.obstacles.forEach(o=>{
    const el=document.createElement('div');el.className='fly-obstacle';el.style.left=o.x+'%';el.style.top=o.y+'%';el.textContent=o.emoji;area.appendChild(el);
    if(Math.abs(o.x-15)<8&&Math.abs(o.y-mgData.birdY)<15){mgData.obstacles=mgData.obstacles.filter(ob=>ob!==o);mgScore=Math.max(0,mgScore-2);showToast('ぶつかった！ -2','warning');document.getElementById('mgScore').textContent=mgScore;}
    else if(o.x<7&&!o.counted){o.counted=true;mgScore++;document.getElementById('mgScore').textContent=mgScore;}
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
  let i=0;if(mgInterval)clearInterval(mgInterval);mgInterval=setInterval(()=>{
    if(!mgActive){clearInterval(mgInterval);mgInterval=null;return;}
    document.querySelectorAll('.sing-note').forEach(n=>n.classList.remove('active'));
    const instruction=document.getElementById('singInstruction');
    if(i<mgData.sequence.length){const note=document.getElementById('note'+mgData.sequence[i]);if(note)note.classList.add('active');i++;}
    else{clearInterval(mgInterval);mgInterval=null;mgData.showing=false;if(instruction)instruction.textContent='同じ順番でタップ！';}
  },600);
}
function playNote(n){
  if(!mgActive||mgData.showing)return;
  mgData.playerSeq.push(n);
  const note=document.getElementById('note'+n);if(note){note.classList.add('active');scheduleMgTimeout(()=>note.classList.remove('active'),200);}
  const idx=mgData.playerSeq.length-1;
  if(mgData.playerSeq[idx]!==mgData.sequence[idx]){showToast('間違い！');mgData.playerSeq=[];mgData.sequence=[];for(let i=0;i<3;i++)mgData.sequence.push(Math.floor(Math.random()*5));mgData.showing=true;document.getElementById('singInstruction').textContent='覚えてね...';showSequence();return;}
  if(mgData.playerSeq.length===mgData.sequence.length){
    mgScore+=mgData.sequence.length;document.getElementById('mgScore').textContent=mgScore;showToast(`正解！+${mgData.sequence.length}`,'achievement');
    mgData.playerSeq=[];mgData.sequence.push(Math.floor(Math.random()*5));mgData.showing=true;
    document.getElementById('singInstruction').textContent='覚えてね...';scheduleMgTimeout(showSequence,500);
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
  if(mgData.tries>=8||mgData.treasures.every(t=>mgData.grid[t]))scheduleMgTimeout(endMinigame,500);
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

// 13. Food Sort Game
const sortFoods=[
  {emoji:'🌾',name:'シード',safe:true},{emoji:'🍎',name:'りんご',safe:true},{emoji:'🥬',name:'小松菜',safe:true},
  {emoji:'🍇',name:'ぶどう',safe:true},{emoji:'🧅',name:'たまねぎ',safe:false},{emoji:'🍫',name:'チョコ',safe:false},
  {emoji:'☕',name:'コーヒー',safe:false},{emoji:'🧂',name:'しお',safe:false},{emoji:'🥕',name:'にんじん',safe:true}
];
function startSortGame(){mgData.time=22;mgData.sortStreak=0;document.getElementById('mgTime').textContent=mgData.time;nextSortFood();}
function nextSortFood(){
  if(!mgActive)return;
  mgData.sortFood=sortFoods[Math.floor(Math.random()*sortFoods.length)];
  document.getElementById('mgContent').innerHTML=`<div class="sort-game"><div class="sort-streak">連続正解 <strong>${mgData.sortStreak}</strong></div><div class="sort-food">${mgData.sortFood.emoji}</div><div class="sort-name">${mgData.sortFood.name}</div><div class="sort-actions"><button onclick="answerSort(true)">食べてOK</button><button onclick="answerSort(false)">ちょっと待って</button></div></div>`;
}
function answerSort(answer){
  if(!mgActive||!mgData.sortFood)return;
  if(answer===mgData.sortFood.safe){mgData.sortStreak++;mgScore+=2+(mgData.sortStreak>0&&mgData.sortStreak%5===0?3:0);showToast(mgData.sortStreak%5===0?'5連続！ボーナス +3':'正解！ +2','achievement');}
  else{mgData.sortStreak=0;mgScore=Math.max(0,mgScore-1);showToast('惜しい！ -1','warning');}
  document.getElementById('mgScore').textContent=mgScore;nextSortFood();
}

// 14. Maze Game
const mazeLayouts=[
  ['0','0','0','1','1','1','1','0','1','0','0','0','0','1','0','0','1','1','1','0','0','0','0','0','0'],
  ['0','0','1','0','0','0','0','1','0','1','0','0','0','0','1','0','1','1','1','1','0','0','0','0','0']
];
function startMazeGame(){mgData.time=35;mgData.mazeRound=0;document.getElementById('mgTime').textContent=mgData.time;resetMaze();}
function resetMaze(){mgData.maze=mazeLayouts[mgData.mazeRound%mazeLayouts.length];mgData.mazePos=0;renderMaze();}
function renderMaze(){
  const cells=mgData.maze.map((cell,index)=>`<div class="maze-cell ${cell==='1'?'wall':'path'} ${index===mgData.mazePos?'player':''} ${index===24?'goal':''}">${index===mgData.mazePos?birds[G.species].icon:index===24?'🏡':''}</div>`).join('');
  document.getElementById('mgContent').innerHTML=`<div class="maze-game"><div class="maze-grid">${cells}</div><div class="maze-controls"><span></span><button onclick="moveMaze(0,-1)">▲</button><span></span><button onclick="moveMaze(-1,0)">◀</button><button onclick="moveMaze(0,1)">▼</button><button onclick="moveMaze(1,0)">▶</button></div></div>`;
}
function moveMaze(dx,dy){
  if(!mgActive)return;
  const x=mgData.mazePos%5,y=Math.floor(mgData.mazePos/5),nx=x+dx,ny=y+dy;
  if(nx<0||nx>4||ny<0||ny>4||mgData.maze[ny*5+nx]==='1'){showToast('そっちは通れないよ');return;}
  mgData.mazePos=ny*5+nx;
  if(mgData.mazePos===24){mgScore+=10;mgData.mazeRound++;document.getElementById('mgScore').textContent=mgScore;showToast('おうちに到着！ +10','achievement');resetMaze();return;}
  renderMaze();
}

function startSleepBoxPrompt(){
  const hoursRaw=prompt('スリープボックス何時間？ (1〜10)');
  if(hoursRaw===null){renderInv();return;}
  const parsed=Number(hoursRaw);
  if(!Number.isInteger(parsed)||parsed<1||parsed>10){showToast('1〜10の整数で入力してください','warning');renderInv();return;}
  const hours=parsed;
  const cost=hours*hours*6;
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
async function fetchWeather(lat,lon){
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`);
  if(!r.ok)throw new Error(`weather_${r.status}`);
  const d=await r.json();
  if(!d.current||typeof d.current.weather_code!=='number')throw new Error('weather_invalid_response');
  const code=d.current.weather_code;
  G.weather=weatherCodeToType(code);
  G.lastWeatherFetch=Date.now();save();updateUI();
}
function getGeoAndWeather(){
  if(G.geo&&typeof G.geo.lat==='number'&&typeof G.geo.lon==='number'){
    fetchWeather(G.geo.lat,G.geo.lon).catch(e=>{logError('weather',String(e));showToast('天気取得に失敗','warning');});
    return;
  }
  if(!navigator.geolocation){showToast('位置情報が使えません','warning');return;}
  navigator.geolocation.getCurrentPosition(async pos=>{
    const lat=pos.coords.latitude,lon=pos.coords.longitude;G.geo={lat,lon};
    try{
      await fetchWeather(lat,lon);
    }catch(e){logError('weather',String(e));showToast('天気取得に失敗','warning');}
  },err=>{logError('geolocation',err.message||'geo error');showToast('位置情報が拒否されました','warning');});
}
function setTheme(t){G.autoTheme=false;G.theme=t;addMissionProgress('customize',1);document.body.className=t;save();renderCustomize()}
function setWeather(w){G.autoWeather=false;G.weather=w;addMissionProgress('customize',1);save();renderCustomize();renderWeather()}
function setAnimationMode(m){G.animationMode=m;addMissionProgress('customize',1);save();renderCustomize();renderWeather()}
function setResolution(scale){G.resolutionScale=scale;addMissionProgress('customize',1);save();updateUI();renderCustomize()}
function setSoundMode(mode){G.soundMode=mode;addMissionProgress('customize',1);save();renderCustomize()}
function setBeta3d(v){G.beta3d=v===true||v==='true';addMissionProgress('customize',1);save();updateUI()}
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
const AI_CACHE_URL='https://local-model.mofumori.invalid/qwen2.5-1.5b-instruct-q4_k_m.gguf';
const AI_TERMS_VERSION='local-ai-v1';
const AI_MIN_BYTES=64*1024*1024;
let aiModule=null,aiCache=null,aiEngine=null,aiModelBytes=0,aiStatus='idle',aiBusy=false,aiEmotion='calm',aiRequest=null,aiInferenceCount=0;
function formatBytes(bytes){if(!Number.isFinite(bytes)||bytes<=0)return'0B';if(bytes>=1024**3)return`${(bytes/1024**3).toFixed(2)}GB`;return`${Math.round(bytes/1024**2)}MB`;}
async function ensureAiModule(){
  if(aiModule)return aiModule;
  aiModule=await import('./vendor/wllama.js');
  aiCache=new aiModule.CacheManager();
  return aiModule;
}
function setAiStatus(status,text,progress=null){
  aiStatus=status;
  const statusText=document.getElementById('aiStatusText'),dot=document.getElementById('aiStatusDot'),bar=document.getElementById('aiLoadProgress');
  if(statusText)statusText.textContent=text;
  if(dot)dot.className=status==='ready'?'ready':status==='error'?'error':'';
  if(bar){bar.classList.toggle('active',progress!==null);if(progress!==null)bar.value=Math.max(0,Math.min(100,progress));}
  renderAiChatState();
}
function renderAiChatState(){
  const box=document.getElementById('aiChatState');if(!box)return;
  const ready=aiStatus==='ready'||aiStatus==='generating';
  box.className=`ai-chat-state ${aiStatus}`;
  box.innerHTML=ready?`<span>${aiStatus==='generating'?'ことばを考えています…':`端末内AI 稼働中・${formatBytes(aiModelBytes)}`}</span><button onclick="showAiModelSettings()">モデル設定</button>`:`<span>簡易会話モード</span><button onclick="showAiModelSettings()">モデルを読み込む</button>`;
}
async function initLocalAi(){
  try{
    const accepted=await saveDbGet('ai-terms');
    const checkbox=document.getElementById('aiTerms');if(checkbox)checkbox.checked=accepted===AI_TERMS_VERSION;
    await ensureAiModule();
    const blob=await aiCache.open(AI_CACHE_URL);
    if(blob&&blob.size>=AI_MIN_BYTES){aiModelBytes=blob.size;setAiStatus('idle',`端末キャッシュに ${formatBytes(blob.size)} 保存済み`);document.getElementById('aiPrimaryBtn').textContent='キャッシュから起動';document.getElementById('aiDeleteBtn').style.display='inline-flex';}
  }catch(error){setAiStatus('error','このブラウザでは端末キャッシュを確認できませんでした');console.warn(error);}
}
function showAiModelSettings(){showModal('aiModelModal');renderAiChatState();}
async function setAiTerms(accepted){if(accepted)await saveDbSet('ai-terms',AI_TERMS_VERSION);else await saveDbDelete('ai-terms');}
async function selectOrLoadAiModel(){
  const accepted=document.getElementById('aiTerms').checked;
  if(!accepted){setAiStatus('error','利用条件への同意が必要です');return;}
  if(aiModelBytes>=AI_MIN_BYTES){await loadAiModel();return;}
  document.getElementById('aiModelFile').click();
}
async function cacheAiModel(event){
  const file=event.target.files&&event.target.files[0];event.target.value='';
  if(!file)return;
  if(!document.getElementById('aiTerms').checked){setAiStatus('error','利用条件への同意が必要です');return;}
  if(!file.name.toLowerCase().endsWith('.gguf')||file.size<AI_MIN_BYTES){setAiStatus('error','64MB以上のGGUFモデルを選んでください');return;}
  try{
    setAiStatus('caching','端末ストレージの空きを確認しています…',0);
    await navigator.storage?.persist?.();
    const estimate=await navigator.storage?.estimate?.(),available=(estimate?.quota??Number.MAX_SAFE_INTEGER)-(estimate?.usage??0);
    if(available<file.size*1.08)throw new Error(`空き容量が足りません。約${formatBytes(file.size*1.08)}必要です。`);
    await ensureAiModule();
    let loaded=0;
    const stream=file.stream().pipeThrough(new TransformStream({transform(chunk,controller){loaded+=chunk.byteLength;setAiStatus('caching',`端末へ保存中 ${Math.round(loaded/file.size*100)}%`,Math.round(loaded/file.size*100));controller.enqueue(chunk);}}));
    const key=await aiCache.getNameFromURL(AI_CACHE_URL);
    await aiCache.write(key,stream,{etag:`local-${file.size}-${file.lastModified}`,originalSize:file.size,originalURL:AI_CACHE_URL});
    aiModelBytes=file.size;document.getElementById('aiPrimaryBtn').textContent='キャッシュから起動';document.getElementById('aiDeleteBtn').style.display='inline-flex';
    setAiStatus('idle',`保存完了・${formatBytes(file.size)}`,100);
    await loadAiModel();
  }catch(error){setAiStatus('error',error instanceof Error?error.message:'モデルの保存に失敗しました');}
}
async function loadAiModel(){
  if(aiEngine?.isModelLoaded()){setAiStatus('ready',`端末内AI 稼働中・${formatBytes(aiModelBytes)}`);hideModal('aiModelModal');return;}
  try{
    await ensureAiModule();
    const blob=await aiCache.open(AI_CACHE_URL);if(!blob||blob.size<AI_MIN_BYTES)throw new Error('保存済みモデルがありません');
    const instance=new aiModule.Wllama({default:'/wasm/wllama.wasm'},{allowOffline:true,logger:aiModule.LoggerWithoutDebug,suppressNativeLog:true});
    const useWebGpu=instance.isSupportWebGPU();setAiStatus('loading',useWebGpu?'WebGPUでモデルを起動しています…':'省メモリWASMでモデルを起動しています…',15);
    await instance.loadModel([blob],{n_ctx:2048,n_batch:256,n_threads:1,n_gpu_layers:useWebGpu?99:0,cache_type_k:'q8_0',cache_type_v:'q8_0'});
    aiEngine=instance;aiModelBytes=blob.size;setAiStatus('ready',`端末内AI 稼働中・${useWebGpu?'WebGPU':'WASM'}`);hideModal('aiModelModal');
    setTimeout(()=>{if(!aiBusy&&!document.getElementById('chatInput')?.matches(':focus'))generateLocalAi(null,true);},30000);
  }catch(error){await aiEngine?.exit().catch(()=>{});aiEngine=null;setAiStatus('error',error instanceof Error?error.message:'モデルの起動に失敗しました');}
}
async function deleteAiModel(){
  if(aiEngine){await aiEngine.exit().catch(()=>{});aiEngine=null;}
  await ensureAiModule();await aiCache.delete(AI_CACHE_URL).catch(()=>{});aiModelBytes=0;document.getElementById('aiPrimaryBtn').textContent='GGUFを選んで保存';document.getElementById('aiDeleteBtn').style.display='none';setAiStatus('idle','端末キャッシュを削除しました');
}
function inferAiRequest(){if(G.hunger<48)return'feed';if(G.energy<40)return'sleep';if(G.happiness<48)return'pet';if(G.health>55&&G.energy>55&&G.happiness<75)return'play';return null;}
function parseAiReply(raw){
  const block=String(raw||'').match(/\{[\s\S]*\}/)?.[0];let parsed={};try{parsed=JSON.parse(block||'{}');}catch(e){}
  const validEmotions=['calm','happy','excited','hungry','sleepy','lonely','curious'];
  const emotion=validEmotions.includes(parsed.emotion)?parsed.emotion:(G.hunger<48?'hungry':G.energy<40?'sleepy':G.happiness<48?'lonely':'happy');
  const message=String(parsed.message||raw||'').replace(/```(?:json)?/gi,'').replace(/[{}\[\]"]/g,'').replace(/\s+/g,' ').trim().slice(0,100)||`${getCurrentBirdName()}はそっとこちらを見ている。`;
  return{message,emotion,request:inferAiRequest()};
}
function applyAiReply(reply,addToChat=true){
  aiEmotion=reply.emotion;aiRequest=reply.request;setMsg(reply.message);
  const svg=document.getElementById('birdSvg');if(svg){[...svg.classList].filter(name=>name.startsWith('ai-')).forEach(name=>svg.classList.remove(name));svg.classList.add(`ai-${aiEmotion}`);}
  const button=document.getElementById('aiRequestBtn');if(button){const labels={feed:'🍚 ごはんをあげる',sleep:'💤 休ませる',pet:'✋ なでてあげる',play:'🎾 一緒に遊ぶ'};button.style.display=aiRequest?'inline-flex':'none';button.textContent=aiRequest?labels[aiRequest]:'';}
  if(addToChat){G.chatHistory.push({role:'ai',text:reply.message});G.chatHistory=G.chatHistory.slice(-24);renderChat();save();}
}
async function generateLocalAi(userText=null,proactive=false){
  if(!aiEngine?.isModelLoaded()||aiBusy)return null;
  aiBusy=true;setAiStatus('generating','ことばを考えています…');
  try{
    const recent=G.chatHistory.slice(-6).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}));
    const response=await aiEngine.createChatCompletion({messages:[{role:'system',content:`あなたは育成ゲームの${birds[G.species].name}「${getCurrentBirdName()}」本人。一人称はぼく/わたし。一般AIの定型文は禁止。短くかわいい日本語で文鳥や動物らしい仕草と気持ちを話す。状態は${getBirdInfoCompact()}。必ずJSONだけ: {"message":"60文字以内","emotion":"calm|happy|excited|hungry|sleepy|lonely|curious"}`},...recent,{role:'user',content:proactive?'今の状態を見て飼い主へ自分から一言話しかけて。':userText||'今の気持ちを話して。'}],max_tokens:120,temperature:.72,top_k:40,top_p:.9,penalty_repeat:1.12});
    const reply=parseAiReply(response.choices?.[0]?.message?.content||'');aiInferenceCount++;applyAiReply(reply,proactive);return reply;
  }catch(error){setAiStatus('error',error instanceof Error?error.message:'AIの応答に失敗しました');return null;}
  finally{aiBusy=false;if(aiEngine?.isModelLoaded())setAiStatus('ready',`端末内AI 稼働中・${formatBytes(aiModelBytes)}`);}
}
function fulfillAiRequest(){
  const request=aiRequest;aiRequest=null;document.getElementById('aiRequestBtn').style.display='none';
  if(request==='feed')feedBird();else if(request==='pet')petBird();else if(request==='play')playBird();else if(request==='sleep'&&!G.isSleeping)toggleSleep();
  setTimeout(()=>{applyAiReply({message:'お願いをかなえてくれて、ありがとう！',emotion:'happy',request:null},true);},350);
}
function renderChat(){
  const wrap=document.getElementById('chatWrap');
  if(!wrap)return;
  const rows=G.chatHistory.slice(-16).map(m=>`<div class="chat-msg ${m.role}"><div>${escapeHtml(m.text)}</div></div>`).join('');
  wrap.innerHTML=rows||'<div class="chat-empty">名前を呼んだり、今日のお世話を相談してみよう。</div>';
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
  const input=document.getElementById('chatInput');
  const text=input.value.trim();
  if(!text)return;
  input.value='';
  G.chatHistory.push({role:'user',text});
  addMissionProgress('chat',1);
  renderChat();
  const thinking=document.getElementById('chatThinking');thinking.style.display='flex';
  try{
    let out='';
    if(aiEngine?.isModelLoaded()){
      const waitStarted=Date.now();while(aiBusy&&Date.now()-waitStarted<180000)await new Promise(resolve=>setTimeout(resolve,250));
      const reply=await generateLocalAi(text,false);out=reply?.message||'';
    }
    if(!out)out=localChatReply(text);
    await typewriterAppend(out);
    G.chatHistory.push({role:'ai',text:out});
    save();
    setMsg(out);
  }catch(e){
    console.warn('Local AI fallback',e);
    const out=localChatReply(text);
    await typewriterAppend(out);
    G.chatHistory.push({role:'ai',text:out});
    showToast('オフライン会話に切り替えました','warning');
  }finally{thinking.style.display='none';save();}
}
function localChatReply(text){
  const name=getCurrentBirdName(),species=birds[G.species];
  if(/名前|だれ/.test(text))return `${name}だよ。${species.name}の姿で、ずっと一緒にいるよ。`;
  if(/元気|体調|大丈夫/.test(text)){
    if(G.sickLevel>0||G.health<45)return '少し休みたいな。お薬と睡眠があると安心できそう。';
    if(G.energy<35)return 'ちょっと眠たいかも。ひと休みしたら、また遊ぼう。';
    return '今日は元気！いっしょにミニゲームで遊びたいな。';
  }
  if(/お腹|ごはん|食べ/.test(text))return G.hunger<45?'お腹がすいたよ。シードを少しもらえるとうれしいな。':'今はお腹いっぱい。ありがとう！';
  if(/好き|かわいい|大事/.test(text))return `${name}も、あなたと過ごす時間が大好き！`;
  if(/遊|ゲーム/.test(text))return 'ミニゲームなら「ごはん仕分け」と「おうちへ帰ろう」が新しく増えたよ！';
  return pickDialog('idle',[`${name}はうれしそうにうなずいた。`]);
}
function renderChangeLog(){
  const el=document.getElementById('changeLogArea');if(!el)return;
  el.innerHTML=`<div><strong>v3.0 まるごとリニューアル</strong></div><ul><li>お部屋・UI・動物テクスチャを全面刷新</li><li>ミニゲームを14種類に整理し、新作2種類を追加</li><li>セーブ復旧、残留タイマー、睡眠入力、状態変化を安定化</li><li>ミッション5個ごとにダイヤ+2</li></ul>`;
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
  const rows=G.errorLogs.slice().reverse().slice(0,14).map(e=>`<div>• [${escapeHtml(e.at)}] (${escapeHtml(e.src)}) ${escapeHtml(e.msg)}</div>`).join('');
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
}
function init3dControl(){
  const area=document.querySelector('.main-display');let down=false,lastX=0,lastY=0;
  area.addEventListener('pointerdown',e=>{if(!G.beta3d)return;down=true;lastX=e.clientX;lastY=e.clientY;area.setPointerCapture(e.pointerId);});
  area.addEventListener('pointermove',e=>{if(!G.beta3d||!down)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;G.threeDRotY=Math.max(-35,Math.min(35,G.threeDRotY+dx*0.25));G.threeDRotX=Math.max(-25,Math.min(35,G.threeDRotX-dy*0.2));updateUI();});
  area.addEventListener('pointerup',()=>{down=false;save();});
}

function addExp(a){
  G.exp+=Math.max(0,Number(a)||0);
  let levels=0;
  while(G.exp>=G.level*50&&levels<100){const need=G.level*50;G.exp-=need;G.level++;addCoins(G.level*10);G.gems++;levels++;}
  if(levels>0)showToast(`レベルアップ！Lv.${G.level} / 💎+${levels}`,'levelup');
}
function gameTick(){
  if(G.autoTheme)applyAutoTheme();
  if(G.autoWeather&&Date.now()-G.lastWeatherFetch>30*60*1000)getGeoAndWeather();
  if(G.sleepBoxUntil&&Date.now()<G.sleepBoxUntil)applySleepBoxLock();
  if(!G.isSleeping){
    G.hunger=Math.max(0,G.hunger-0.0042);G.happiness=Math.max(0,G.happiness-0.002);G.cleanliness=Math.max(0,G.cleanliness-0.0013);G.energy=Math.max(0,G.energy-0.0008);
    const avg=(G.hunger+G.cleanliness)/2;if(avg<30)G.health=Math.max(0,G.health-0.012);else if(avg>70)G.health=Math.min(100,G.health+0.005);
    const risk=(G.hunger<20||G.cleanliness<20)?0.006:(G.hunger<35||G.cleanliness<35)?0.002:0;
    if(Math.random()<risk&&G.sickLevel<100){G.sickLevel=Math.min(100,G.sickLevel+4);if(G.sickLevel>=20)setMsg('体調が悪そう...');}
    if(G.sickLevel>0){
      G.health=Math.max(0,G.health-0.05*(1+G.sickLevel/60));
      G.happiness=Math.max(0,G.happiness-0.03);
    }
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
async function resetGame(){if(!confirm('本当にリセットしますか？'))return;await saveDbDelete(SAVE_RECORD).catch(()=>{});clearLegacySave();location.reload()}
async function toggleFullscreen(event){
  if(event)event.stopPropagation();
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
  catch(e){showToast('このブラウザでは全画面表示を使えません','warning');}
}
function renderGameToText(){
  const openPanel=document.querySelector('.panel.show');
  return JSON.stringify({
    coordinateSystem:'DOM UI. Mini-game positions use top-left origin; x increases right, y increases down.',
    mode:mgActive?'minigame':G.isSleeping?'sleeping':openPanel?openPanel.id.replace('Panel',''):'care',
    character:{name:getCurrentBirdName(),species:G.species,speciesName:birds[G.species].name,unlocked:G.unlocked.length},
    status:{hunger:Math.round(G.hunger),happiness:Math.round(G.happiness),health:Math.round(G.health),energy:Math.round(G.energy),cleanliness:Math.round(G.cleanliness),sick:Math.round(G.sickLevel),sleeping:G.isSleeping},
    resources:{coins:G.coins,gems:G.gems,level:G.level,exp:G.exp},
    localAI:{status:aiStatus,modelCached:aiModelBytes>0,emotion:aiEmotion,request:aiRequest,inferences:aiInferenceCount},
    social:{playerId:socialState?.playerId||null,mode:socialState?.mode||'local',friends:socialState?.friends?.length||0,bond:G.social?.bond||0,streakDays:G.social?.streakDays||0},
    missions:{completed:G.missions.completed,active:G.missions.active.map(m=>({id:m.id,progress:m.progress,goal:m.goal,done:m.done}))},
    minigame:mgActive&&currentMg?{id:currentMg.id,name:currentMg.name,score:mgScore,time:mgData.time,player:mgData.mazePos??mgData.dodgeX??mgData.birdY??null}:null
  });
}
window.render_game_to_text=renderGameToText;
let deterministicRemainder=0;
window.advanceTime=(ms)=>{deterministicRemainder+=Math.max(0,Number(ms)||0);while(deterministicRemainder>=1000){deterministicRemainder-=1000;gameTick();}renderBird();};
async function init(){
  await load();initMissions();renderStars();renderShop();renderInv();renderCustomize();renderMissions();updateUI();
  void initLocalAi();
  void initIdentityAndSocial();
  setInterval(gameTick,1000);setInterval(blinkLoop,2500);animLoop();
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)hideModal(m.id)}));
  document.getElementById('nameInput').addEventListener('keypress',e=>{if(e.key==='Enter')saveName()});
  const chatInput=document.getElementById('chatInput');
  chatInput.addEventListener('keypress',e=>{if(e.key==='Enter')sendChatMessage()});
  window.addEventListener('error',e=>logError('window',e.message||'unknown'));
  window.addEventListener('unhandledrejection',e=>logError('promise',String(e.reason||'rejection')));
  window.addEventListener('beforeunload',save);
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();toggleFullscreen();}});
  document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('is-fullscreen',Boolean(document.fullscreenElement));window.dispatchEvent(new Event('resize'));});
  setInterval(save,5000);
  setInterval(()=>{if(aiStatus==='ready'&&!document.hidden&&!aiBusy)generateLocalAi(null,true);},90000);
  setInterval(runErrorScan,20000);
  init3dControl();renderChangeLog();renderErrorLogs();renderChat();runErrorScan();
  if(G.autoTheme)applyAutoTheme();
  if(G.autoWeather&&(!G.lastWeatherFetch||Date.now()-G.lastWeatherFetch>30*60*1000))getGeoAndWeather();
  setMsg(pickDialog('idle',['鳥があなたを見ています...']));
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
  const overlay=document.getElementById('loadingOverlay');
  if(overlay){setTimeout(()=>overlay.classList.add('hide'),600);}
  if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/sw.js').catch(error=>console.warn('Offline cache registration skipped',error));
}
function saveName(){const n=document.getElementById('nameInput').value.trim();if(n){setCurrentBirdName(n);playBirdSound('feed');setMsg(`名前が「${n}」になった！`);save();updateUI()}hideModal('nameModal')}
init();
