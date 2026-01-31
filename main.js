const birds={
  buncho_sakura:{name:'桜文鳥',icon:'🐦',price:0,curr:'coins',colors:{head:'#1a1a1a',cheek:'#fff',body:'#7a7a7a',belly:'#e8d8d0',wing:'#5a5a5a',tail:'#2a2a2a',beak:'#ff6b6b',eyeRing:'#ff5555',feet:'#ffb8b8'},hasCheek:true},
  buncho_white:{name:'白文鳥',icon:'🕊️',price:200,curr:'coins',colors:{head:'#fefefe',cheek:'#fefefe',body:'#faf8f5',belly:'#fff5f0',wing:'#f0f0f0',tail:'#e8e8e8',beak:'#ff7777',eyeRing:'#ff6666',feet:'#ffc0c0'},hasCheek:false},
  buncho_cinnamon:{name:'シナモン',icon:'🐤',price:300,curr:'coins',colors:{head:'#8b6914',cheek:'#fff5e6',body:'#c9a070',belly:'#f0e0d0',wing:'#b08050',tail:'#7b5414',beak:'#ffa080',eyeRing:'#ff7755',feet:'#ffc8b0'},hasCheek:true},
  buncho_silver:{name:'シルバー',icon:'🪿',price:400,curr:'coins',colors:{head:'#505050',cheek:'#f8f8f8',body:'#a8a8a8',belly:'#e0d8d0',wing:'#888',tail:'#404040',beak:'#ff8080',eyeRing:'#ff6060',feet:'#ffb0b0'},hasCheek:true},
  canary:{name:'カナリア',icon:'🐥',price:500,curr:'coins',colors:{head:'#ffeb3b',cheek:'#fff59d',body:'#ffeb3b',belly:'#fff9c4',wing:'#fdd835',tail:'#f9a825',beak:'#ff8a65',eyeRing:'#ffab91',feet:'#ffcc80'},hasCheek:false},
  inko_green:{name:'セキセイインコ',icon:'🦜',price:800,curr:'coins',colors:{head:'#c8e6c9',cheek:'#a5d6a7',body:'#66bb6a',belly:'#a5d6a7',wing:'#43a047',tail:'#2e7d32',beak:'#ffb74d',eyeRing:'#fff59d',feet:'#bcaaa4'},hasCheek:false},
  inko_blue:{name:'青インコ',icon:'💙',price:800,curr:'coins',colors:{head:'#bbdefb',cheek:'#90caf9',body:'#42a5f5',belly:'#90caf9',wing:'#1e88e5',tail:'#1565c0',beak:'#ffb74d',eyeRing:'#fff59d',feet:'#bcaaa4'},hasCheek:false},
  cockatiel:{name:'オカメインコ',icon:'🧡',price:5,curr:'gems',colors:{head:'#ffcc80',cheek:'#ff8a65',body:'#bdbdbd',belly:'#e0e0e0',wing:'#9e9e9e',tail:'#757575',beak:'#8d6e63',eyeRing:'#ffcc80',feet:'#bcaaa4'},hasCheek:true},
  owl:{name:'フクロウ',icon:'🦉',price:15,curr:'gems',colors:{head:'#8d6e63',cheek:'#d7ccc8',body:'#6d4c41',belly:'#bcaaa4',wing:'#5d4037',tail:'#4e342e',beak:'#ffd54f',eyeRing:'#ffd54f',feet:'#a1887f'},hasCheek:false,isOwl:true}
};
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
    {id:'toys',name:'おもちゃ',desc:'遊び効果UP',price:120,icon:'🎾',curr:'coins',amt:1}
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
  swing:{name:'ブランコ',icon:'🎠',usable:false}
};
let G={name:'文鳥',species:'buncho_sakura',unlocked:['buncho_sakura'],hunger:80,happiness:80,health:100,energy:100,cleanliness:100,age:0,theme:'day',weather:'none',lastUpdate:Date.now(),sleepStart:null,tFeeds:0,tPets:0,tBaths:0,tPlays:0,tSings:0,level:1,exp:0,coins:100,gems:5,inv:{seeds:10,treats:3,fruits:0,premium_food:0,energy_drink:1,vitamins:0,medicine:1,shampoo:2,toys:0,super_energy:0,mirror:0,bell:0,swing:0},isSleeping:false,bannerDismissed:false};
let action=null,animF=0,blink=false,mgActive=false,mgScore=0,mgTimer=null,selBird=null,shopTab='food',selItem=null;

function setCookie(n,v){document.cookie=n+'='+encodeURIComponent(JSON.stringify(v))+';expires='+new Date(Date.now()+365*864e5).toUTCString()+';path=/;SameSite=Lax'}
function getCookie(n){const v=document.cookie.split('; ').find(r=>r.startsWith(n+'='));if(v)try{return JSON.parse(decodeURIComponent(v.split('=')[1]))}catch(e){}return null}
function delCookie(n){document.cookie=n+'=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/'}
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
  if(!G.bannerDismissed&&!isStandalone())setTimeout(()=>document.getElementById('installBanner').classList.add('show'),3000);
}
function isStandalone(){return window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true}
function showToast(m,t=''){const e=document.getElementById('toast');e.textContent=m;e.className='toast show '+t;setTimeout(()=>e.classList.remove('show'),2500)}
function setMsg(m){document.getElementById('message').textContent=m}
function showModal(id){document.getElementById(id).classList.add('show');if(id==='birdModal')renderBirdGrid()}
function hideModal(id){document.getElementById(id).classList.remove('show')}
function showInstallGuide(){hideInstallBanner();showModal('installModal')}
function hideInstallBanner(){document.getElementById('installBanner').classList.remove('show');G.bannerDismissed=true;save()}
function togglePanel(p){['shop','inventory','minigame','customize'].forEach(x=>{const el=document.getElementById(x+'Panel');el.classList.toggle('show',x===p&&!el.classList.contains('show'))});if(p==='shop')renderShop();if(p==='inventory')renderInv()}

function updateUI(){
  const b=birds[G.species];
  document.getElementById('headerIcon').textContent=b.icon;
  document.getElementById('birdName').textContent=G.name;
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
  document.body.className=G.theme;
  renderWeather();renderCustomize();
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
    return`<div class="bird-option ${sel?'selected':''} ${owned?'':'locked'}" onclick="selectBird('${id}')">${owned?'':`<span class="lock-icon">🔒</span>`}<div class="bird-option-icon">${b.icon}</div><div class="bird-option-name">${b.name}</div><div class="bird-option-price">${owned?'所持中':pr}</div></div>`;
  }).join('');
  updateBuyBtn();
}
function selectBird(id){selBird=id;document.querySelectorAll('.bird-option').forEach(e=>e.classList.remove('selected'));event.currentTarget.classList.add('selected');updateBuyBtn()}
function updateBuyBtn(){
  const btn=document.getElementById('buyBirdBtn'),b=birds[selBird],owned=G.unlocked.includes(selBird);
  btn.textContent=owned?(selBird===G.species?'選択中':'この鳥にする'):`購入(${b.price}${b.curr==='gems'?'💎':'💰'})`;
  btn.disabled=owned&&selBird===G.species;
}
function buyBird(){
  const b=birds[selBird],owned=G.unlocked.includes(selBird);
  if(owned){if(selBird!==G.species){G.species=selBird;setMsg(b.name+'に変身！');save();updateUI()}hideModal('birdModal');return}
  if(G[b.curr]<b.price){showToast(b.curr==='gems'?'💎が足りません':'💰が足りません','warning');return}
  G[b.curr]-=b.price;G.unlocked.push(selBird);G.species=selBird;
  showToast('🎉'+b.name+'をゲット！','achievement');setMsg(b.name+'がやってきた！');save();updateUI();renderBirdGrid();
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
  G.inv[selItem]--;
  switch(selItem){
    case'fruits':G.happiness=Math.min(100,G.happiness+15);setMsg('フルーツおいしい！🍎');break;
    case'premium_food':G.hunger=Math.min(100,G.hunger+10);G.happiness=Math.min(100,G.happiness+10);G.health=Math.min(100,G.health+10);G.energy=Math.min(100,G.energy+10);setMsg('高級えさ最高！✨');break;
    case'energy_drink':G.energy=Math.min(100,G.energy+50);setMsg('元気が出てきた！🥤');break;
    case'vitamins':G.energy=Math.min(100,G.energy+30);setMsg('ビタミン補給！💉');break;
    case'medicine':G.health=100;setMsg('健康になった！💊');break;
    case'shampoo':G.cleanliness=100;setMsg('ピカピカ！🧴');break;
    case'super_energy':G.energy=100;setMsg('元気MAX！⚡');break;
  }
  hideModal('useItemModal');save();updateUI();renderInv();
}
function renderWeather(){
  const c=document.getElementById('weatherEffects');c.innerHTML='';
  if(G.weather==='rain')for(let i=0;i<20;i++){const d=document.createElement('div');d.className='raindrop';d.style.left=Math.random()*100+'%';d.style.animationDelay=Math.random()*2+'s';d.style.animationDuration=(0.4+Math.random()*0.3)+'s';c.appendChild(d)}
  else if(G.weather==='snow')for(let i=0;i<12;i++){const f=document.createElement('div');f.className='snowflake';f.textContent='❄';f.style.left=Math.random()*100+'%';f.style.fontSize=(5+Math.random()*8)+'px';f.style.animationDelay=Math.random()*4+'s';f.style.animationDuration=(3+Math.random()*3)+'s';c.appendChild(f)}
}
function renderStars(){const c=document.getElementById('stars');for(let i=0;i<35;i++){const s=document.createElement('div');s.className='star';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*50+'%';s.style.width=s.style.height=(1+Math.random()*2)+'px';s.style.animationDelay=Math.random()*2+'s';c.appendChild(s)}}
function renderCustomize(){
  document.getElementById('themeOpts').innerHTML=[{id:'day',n:'☀️昼'},{id:'sunset',n:'🌅夕'},{id:'night',n:'🌙夜'}].map(t=>`<button class="customize-btn ${G.theme===t.id?'active':''}" onclick="setTheme('${t.id}')">${t.n}</button>`).join('');
  document.getElementById('weatherOpts').innerHTML=[{id:'none',n:'☀️なし'},{id:'rain',n:'🌧️雨'},{id:'snow',n:'❄️雪'}].map(w=>`<button class="customize-btn ${G.weather===w.id?'active':''}" onclick="setWeather('${w.id}')">${w.n}</button>`).join('');
}
function renderBird(){
  const b=birds[G.species],c=b.colors,svg=document.getElementById('birdSvg');
  const bounce=Math.sin(animF*0.2)*4,tilt=Math.sin(animF*0.1)*2;
  const wingFlap=action==='play'||action==='bath'||action==='sing'?Math.sin(animF*0.6)*20:Math.sin(animF*0.06)*3;
  const headTilt=action==='pet'?Math.sin(animF*0.3)*12:tilt;
  const eyesClosed=G.isSleeping||blink||action==='pet';
  const jumpY=action==='play'?Math.abs(Math.sin(animF*0.4))*28:0;
  const eatBob=action==='feed'||action==='treat'?Math.abs(Math.sin(animF*0.8))*12:0;
  const shake=action==='bath'?Math.sin(animF*1)*10:0;
  const singBob=action==='sing'?Math.sin(animF*0.6)*6:0;
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
      <g transform="translate(52,120) rotate(${-wingFlap})"><ellipse cx="0" cy="18" rx="14" ry="35" fill="${c.wing}"/></g>
      <g transform="translate(148,120) rotate(${wingFlap})"><ellipse cx="0" cy="18" rx="14" ry="35" fill="${c.wing}"/></g>
      <g transform="rotate(${headTilt},100,78)">
        <circle cx="100" cy="78" r="42" fill="${c.head}"/>
        ${b.hasCheek?`<ellipse cx="67" cy="88" rx="20" ry="18" fill="${c.cheek}"/><ellipse cx="133" cy="88" rx="20" ry="18" fill="${c.cheek}"/>`:''}
        <circle cx="78" cy="72" r="14" fill="${c.eyeRing}"/><circle cx="122" cy="72" r="14" fill="${c.eyeRing}"/>
        ${eyesClosed?`<path d="M67,72 Q78,82 89,72" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M111,72 Q122,82 133,72" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>`:`<circle cx="78" cy="72" r="10" fill="#0a0505"/><circle cx="122" cy="72" r="10" fill="#0a0505"/><circle cx="82" cy="68" r="4" fill="white"/><circle cx="126" cy="68" r="4" fill="white"/>`}
        <g transform="translate(100,98) rotate(${eatBob>0?Math.sin(animF*1.2)*10:0})">
          ${b.isOwl?`<path d="M-5,-8 L0,6 L5,-8 Z" fill="${c.beak}"/>`:`<ellipse cx="0" cy="-3" rx="14" ry="10" fill="${c.beak}"/><ellipse cx="0" cy="4" rx="11" ry="6" fill="${c.beak}" opacity="0.85"/>`}
        </g>
        ${action==='sing'?`<text x="145" y="50" font-size="16" fill="#ff6b9d" opacity="${0.4+Math.sin(animF*0.25)*0.6}">♪</text><text x="158" y="35" font-size="12" fill="#9c27b0" opacity="${0.4+Math.sin(animF*0.25+1)*0.6}">♫</text>`:''}
      </g>
      ${G.isSleeping?`<text x="152" y="46" font-size="22" fill="#6a6aff" font-weight="bold" opacity="${0.35+Math.sin(animF*0.12)*0.65}">Z</text><text x="170" y="28" font-size="15" fill="#6a6aff" font-weight="bold" opacity="${0.35+Math.sin(animF*0.12+1)*0.65}">z</text>`:''}
      ${action==='feed'||action==='treat'?[0,1,2].map(i=>`<circle cx="${84+i*16}" cy="${178-(animF*1.6+i*12)%30}" r="4" fill="#d4a574" opacity="${1-((animF*1.6+i*12)%30)/30}"/>`).join(''):''}
      ${action==='pet'?[0,1,2].map(i=>`<text x="${55+i*42}" y="${38+Math.sin(animF*0.2+i)*12}" font-size="18" opacity="${0.45+Math.sin(animF*0.2+i)*0.55}">💕</text>`).join(''):''}
      ${action==='play'?[0,1,2,3].map(i=>`<text x="${44+i*38}" y="${28+Math.abs(Math.sin(animF*0.3+i*0.6))*30}" font-size="15">✨</text>`).join(''):''}
      ${action==='bath'?[0,1,2,3,4].map(i=>`<circle cx="${65+i*14+Math.sin(animF*0.35+i)*6}" cy="${158+(animF*2+i*10)%38}" r="2.5" fill="#88ccff" opacity="${1-((animF*2+i*10)%38)/38}"/>`).join(''):''}
    </g>`;
}
function doAction(n,cb){if(action||(G.isSleeping&&n!=='wake')){if(G.isSleeping)setMsg('Zzz...寝てるよ...');return false}action=n;cb();setTimeout(()=>action=null,2000);return true}
function feedBird(){if(G.inv.seeds<=0){setMsg('シードがない！');return}doAction('feed',()=>{G.inv.seeds--;G.hunger=Math.min(100,G.hunger+18);G.happiness=Math.min(100,G.happiness+3);G.tFeeds++;addExp(2);setMsg(['もぐもぐ...おいしい！🌾','ピヨ♪ありがとう！','カリカリ最高！'][Math.floor(Math.random()*3)]);save()})}
function petBird(){doAction('pet',()=>{G.happiness=Math.min(100,G.happiness+10+(G.inv.mirror>0?5:0));G.tPets++;addExp(1);setMsg(['ピヨピヨ♪うれしい！','もっとなでて〜💕','きもちいい...'][Math.floor(Math.random()*3)]);save()})}
function playBird(){if(G.energy<20){setMsg('疲れてる...休ませて...');return}doAction('play',()=>{const b=G.inv.swing>0?2:1,tb=G.inv.toys>0?5:0;G.happiness=Math.min(100,G.happiness+(15+tb)*b);G.energy=Math.max(0,G.energy-12);G.hunger=Math.max(0,G.hunger-5);G.tPlays++;G.coins+=2;addExp(3);setMsg(['わーい！楽しい！🎉','もっと遊ぼう！'][Math.floor(Math.random()*2)]);save()})}
function bathBird(){doAction('bath',()=>{const b=G.inv.shampoo>0;if(b)G.inv.shampoo--;G.cleanliness=100;G.happiness=Math.min(100,G.happiness+(b?15:8));G.tBaths++;addExp(2);setMsg(b?'シャンプーでピカピカ！✨':['バシャバシャ！💦','きれいになった〜'][Math.floor(Math.random()*2)]);save()})}
function toggleSleep(){if(G.isSleeping){G.isSleeping=false;G.sleepStart=null;setMsg('おはよう！🌅')}else{G.isSleeping=true;G.sleepStart=Date.now();setMsg('おやすみ...💤 閉じても元気が回復！')}save();updateUI()}
function giveTreat(){if(G.inv.treats<=0){setMsg('おやつがない！');return}doAction('treat',()=>{G.inv.treats--;G.happiness=Math.min(100,G.happiness+25);G.hunger=Math.min(100,G.hunger+10);addExp(4);setMsg('わーい！おやつ！🍬');save()})}
function trainBird(){if(G.energy<25){setMsg('疲れてる...訓練は無理...');return}doAction('train',()=>{G.energy=Math.max(0,G.energy-15);G.coins+=3;addExp(4);setMsg(['賢くなった！📚','新しいこと覚えた！'][Math.floor(Math.random()*2)]);save()})}
function singBird(){if(G.energy<15){setMsg('疲れて歌えない...');return}doAction('sing',()=>{G.happiness=Math.min(100,G.happiness+12);G.energy=Math.max(0,G.energy-8);G.tSings++;G.coins+=2;addExp(3);setMsg(['ピヨピヨ〜♪🎵','上手に歌えた！','いい声でしょ？🎤'][Math.floor(Math.random()*3)]);save()})}
function buyItem(id,price,curr,amt){if(G[curr]<price){showToast(curr==='gems'?'💎が足りません':'💰が足りません','warning');return}G[curr]-=price;G.inv[id]=(G.inv[id]||0)+amt;showToast('購入しました！');setMsg('お買い物ありがとう！🛒');save();updateUI();renderInv()}
function startMinigame(){if(G.coins<10){setMsg('コインが足りない...');return}G.coins-=10;mgActive=true;mgScore=0;let t=15;document.getElementById('mgScore').textContent=mgScore;document.getElementById('mgTime').textContent=t;document.getElementById('startMgBtn').style.display='none';const tg=document.getElementById('mgTarget');tg.style.display='flex';moveTarget();mgTimer=setInterval(()=>{t--;document.getElementById('mgTime').textContent=t;if(t<=0)endMinigame()},1000);save();updateUI()}
function moveTarget(){const tg=document.getElementById('mgTarget'),a=document.getElementById('minigameArea');tg.style.left=(15+Math.random()*(a.offsetWidth-80))+'px';tg.style.top=(25+Math.random()*90)+'px'}
function catchSeed(){if(!mgActive)return;mgScore++;document.getElementById('mgScore').textContent=mgScore;moveTarget()}
function endMinigame(){mgActive=false;clearInterval(mgTimer);const r=mgScore*3;G.coins+=r;G.happiness=Math.min(100,G.happiness+Math.min(mgScore,10));addExp(Math.floor(mgScore/2));document.getElementById('startMgBtn').style.display='block';document.getElementById('mgTarget').style.display='none';showToast(`ゲーム終了！${r}コイン獲得！`,'achievement');setMsg(`${mgScore}個キャッチ！🎮`);save();updateUI()}
function setTheme(t){G.theme=t;document.body.className=t;save();renderCustomize()}
function setWeather(w){G.weather=w;save();renderCustomize();renderWeather()}
function addExp(a){G.exp+=a;const need=G.level*50;if(G.exp>=need){G.exp-=need;G.level++;G.coins+=G.level*10;G.gems++;showToast(`レベルアップ！Lv.${G.level}`,'levelup')}}
function gameTick(){
  if(!G.isSleeping){
    G.hunger=Math.max(0,G.hunger-0.07);G.happiness=Math.max(0,G.happiness-0.035);G.cleanliness=Math.max(0,G.cleanliness-0.02);G.energy=Math.max(0,G.energy-0.025);
    const avg=(G.hunger+G.cleanliness)/2;if(avg<30)G.health=Math.max(0,G.health-0.08);else if(avg>70)G.health=Math.min(100,G.health+0.02);
  }else{G.energy=Math.min(100,G.energy+0.12);if(G.energy>=100){G.isSleeping=false;G.sleepStart=null;setMsg('ぐっすり眠れた！🌅')}}
  G.age++;if(G.age%30===0)save();updateUI();
}
function animLoop(){animF++;renderBird();requestAnimationFrame(animLoop)}
function blinkLoop(){if(!G.isSleeping&&Math.random()<0.3){blink=true;setTimeout(()=>blink=false,150)}}
function resetGame(){if(!confirm('本当にリセットしますか？'))return;delCookie('birdG3');location.reload()}
function init(){
  load();renderStars();renderShop();renderInv();renderCustomize();updateUI();
  setInterval(gameTick,1000);setInterval(blinkLoop,2500);animLoop();
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)hideModal(m.id)}));
  document.getElementById('nameInput').addEventListener('keypress',e=>{if(e.key==='Enter')saveName()});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden&&G.isSleeping&&G.sleepStart){
      const sleepMins=(Date.now()-G.sleepStart)/60000,eBefore=G.energy;
      G.energy=Math.min(100,G.energy+sleepMins*0.8);
      const rec=G.energy-eBefore;
      if(rec>5){const b=document.getElementById('recoveryBanner');b.textContent=`💤 寝ている間に元気が${Math.round(rec)}回復！`;b.classList.add('show');setTimeout(()=>b.classList.remove('show'),4000)}
      if(G.energy>=100){G.isSleeping=false;G.sleepStart=null;setMsg('ぐっすり眠って元気満タン！🌅')}
      save();updateUI();
    }
  });
}
function saveName(){const n=document.getElementById('nameInput').value.trim();if(n){G.name=n;setMsg(`名前が「${n}」になった！`);save();updateUI()}hideModal('nameModal')}
init();