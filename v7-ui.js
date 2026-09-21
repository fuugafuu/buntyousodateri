(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const V={mode:'login',progress:null,loading:false};

function accountCard(){
  const card=$('.identity-card');if(!card||$('#v7LocalAuth'))return;
  const box=document.createElement('div');box.id='v7LocalAuth';box.className='v7-local-auth';
  box.innerHTML=`<div class="v7-auth-divider"><span>または</span></div>
    <div class="v7-auth-tabs"><button data-auth-mode="login" class="active">Mofumoriログイン</button><button data-auth-mode="register">新規作成</button></div>
    <div id="v7RegisterNameWrap" class="v7-auth-field hidden"><label>表示名</label><input id="v7DisplayName" maxlength="30" autocomplete="nickname" placeholder="森で使う名前"></div>
    <div class="v7-auth-field"><label>ユーザー名</label><input id="v7Username" maxlength="20" autocapitalize="none" autocomplete="username" placeholder="英数字・_ で3〜20文字"></div>
    <div class="v7-auth-field"><label>パスワード</label><input id="v7Password" type="password" maxlength="72" autocomplete="current-password" placeholder="8文字以上"></div>
    <button id="v7LocalSubmit" class="v7-auth-submit">ログイン</button>
    <small id="v7AuthMessage">Googleなしでもクラウド保存・フレンド・対戦を使えます。</small>`;
  const google=$('#googleSignInButton');if(google)google.insertAdjacentElement('afterend',box);else card.appendChild(box);
  $$('[data-auth-mode]',box).forEach(b=>b.onclick=()=>setAuthMode(b.dataset.authMode));
  $('#v7LocalSubmit').onclick=localAuth;
}
function setAuthMode(mode){
  V.mode=mode==='register'?'register':'login';
  $$('[data-auth-mode]').forEach(b=>b.classList.toggle('active',b.dataset.authMode===V.mode));
  $('#v7RegisterNameWrap')?.classList.toggle('hidden',V.mode!=='register');
  const pass=$('#v7Password');if(pass)pass.autocomplete=V.mode==='register'?'new-password':'current-password';
  const btn=$('#v7LocalSubmit');if(btn)btn.textContent=V.mode==='register'?'アカウントを作る':'ログイン';
  const msg=$('#v7AuthMessage');if(msg)msg.textContent=V.mode==='register'?'ユーザー名とパスワードは忘れないようにしてください。':'Googleなしでもクラウド保存・フレンド・対戦を使えます。';
}
async function localAuth(){
  const u=$('#v7Username')?.value.trim(),p=$('#v7Password')?.value,n=$('#v7DisplayName')?.value.trim(),btn=$('#v7LocalSubmit'),msg=$('#v7AuthMessage');
  if(!u||!p){if(msg)msg.textContent='ユーザー名とパスワードを入力してください。';return}
  if(btn){btn.disabled=true;btn.textContent=V.mode==='register'?'作成中…':'ログイン中…'}
  try{
    const r=await fetch('/api/auth/local',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action:V.mode,username:u,password:p,displayName:n})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(j.message||'ログインできませんでした');
    if(msg)msg.textContent=V.mode==='register'?'アカウントを作成しました！':'ログインしました！';
    await initIdentityAndSocial(true);
    window.v7RefreshProgress?.(true);
    showToast?.(V.mode==='register'?'Mofumoriアカウントを作成しました':'Mofumoriにログインしました','achievement');
  }catch(e){if(msg)msg.textContent=e.message;showToast?.(e.message,'warning')}
  finally{if(btn){btn.disabled=false;btn.textContent=V.mode==='register'?'アカウントを作る':'ログイン'}}
}
function renderAuth(){
  accountCard();
  const box=$('#v7LocalAuth'),google=$('#googleSignInButton');
  if(box)box.style.display=identityUser?'none':'block';
  if(google&&!identityUser)google.style.display='block';
  const name=$('#identityName');
  if(name&&identityUser?.provider==='mofumori')name.textContent=identityUser.name+' ・ Mofumori';
  const logout=$('#googleLogoutBtn');if(logout&&identityUser)logout.textContent='ログアウト';
}
window.renderV7Auth=renderAuth;

function progressShell(){
  if($('#v7Journey'))return;
  const anchor=$('#v6Overview')||$('.game-shell');if(!anchor)return;
  const s=document.createElement('section');s.id='v7Journey';s.className='v7-journey';
  anchor.insertAdjacentElement('afterend',s);renderProgress();
}
function guestProgress(){
  const lv=Math.max(1,Number(G?.level||1)),done=Math.min(3,Math.floor((G?.social?.todayCare||0)/2));
  return{level:lv,xp:(lv-1)*(lv-1)*75,nextXp:lv*lv*75,streak:G?.social?.streakDays||0,goals:[
    {id:'local1',name:'3回お世話する',current:Math.min(3,G?.social?.todayCare||0),goal:3,rewardXp:0,claimed:false},
    {id:'local2',name:'ミニゲームで遊ぶ',current:G?.minigameStats?.lastPlayedDate?1:0,goal:1,rewardXp:0,claimed:false},
    {id:'local3',name:'ごきげん80以上',current:Math.min(80,Math.round(G?.happiness||0)),goal:80,rewardXp:0,claimed:false}
  ],unlocks:[{level:1,name:'育成',icon:'🐦'},{level:2,name:'オンライン対戦',icon:'⚔️'},{level:3,name:'ビーバーの出会い',icon:'🦫'}],guest:true};
}
function renderProgress(){
  const root=$('#v7Journey');if(!root)return;const p=V.progress||guestProgress(),curBase=Math.pow(Math.max(0,p.level-1),2)*75,span=Math.max(1,p.nextXp-curBase),pct=Math.max(0,Math.min(100,(p.xp-curBase)/span*100));
  const next=(p.unlocks||[]).find(x=>x.level>p.level);
  root.innerHTML=`<div class="v7-journey-head"><div><small>FOREST JOURNEY</small><h2>森レベル ${p.level}</h2><p>${p.guest?'ログインすると進行をクラウドに保存できます。':`連続お世話 ${p.streak}日`}</p></div><div class="v7-level-orb">${p.level}</div></div>
  <div class="v7-xp"><span style="width:${pct}%"></span></div><div class="v7-xp-copy"><b>${Number(p.xp||0).toLocaleString()} XP</b><small>次のレベル ${Number(p.nextXp||0).toLocaleString()} XP</small></div>
  <div class="v7-goals">${(p.goals||[]).map(g=>{const done=g.current>=g.goal;return`<article class="${done?'done':''}"><span>${g.claimed?'✓':done?'!':'○'}</span><div><b>${g.name}</b><small>${Math.min(g.current,g.goal)}/${g.goal}${g.rewardXp?' ・ +'+g.rewardXp+'XP':''}</small></div>${!p.guest&&done&&!g.claimed?`<button data-claim="${g.id}">受取</button>`:''}</article>`}).join('')}</div>
  <div class="v7-next-unlock">${next?`<span>${next.icon}</span><div><small>NEXT UNLOCK</small><b>Lv.${next.level} ${next.name}</b></div>`:'<span>🌟</span><div><small>FOREST MASTER</small><b>すべての基本機能を解放済み</b></div>'}</div>`;
  $$('[data-claim]',root).forEach(b=>b.onclick=()=>claimGoal(b.dataset.claim));
}
async function claimGoal(goal){
  try{const r=await fetch('/api/progression',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'claim',goal})}),j=await r.json();if(!r.ok)throw new Error(j.message||'受け取れませんでした');V.progress=j.data;renderProgress();showToast?.(`+${j.reward||0} 森XP！`,'achievement')}catch(e){showToast?.(e.message,'warning')}
}
async function refreshProgress(force=false){
  progressShell();
  if(!identityUser){V.progress=null;renderProgress();return}
  if(V.loading&&!force)return;V.loading=true;
  try{const r=await fetch('/api/progression',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}}),j=await r.json();if(r.ok)V.progress=j.data;renderProgress()}catch(e){}finally{V.loading=false}
}
window.v7RefreshProgress=refreshProgress;

function renderCollectionSummary(){
  const modal=$('#birdModal'),box=$('#v7CollectionSummary');if(!modal||!box)return;
  const pets=Array.isArray(G?.petCollection)?G.petCollection:[];
  const active=pets.find(p=>String(p.id)===String(G?.activePetId))||pets.find(p=>p.species===G?.species)||pets[0];
  const b=active?(birds?.[active.species]||{}):{},rank=active?.rank||1,rarity=String(active?.rarity||'N');
  box.innerHTML=active?`<div class="v7-current-pet"><span>${b.icon||'🐦'}</span><div><small>いま一緒</small><b>${escapeHtml?.(active.name||b.name||'なかま')||active.name||'なかま'}</b><em>${escapeHtml?.(b.name||active.species||'')||b.name||''} ・ ${rarity} ・ 個体ランク ${rank}</em></div></div><div class="v7-collection-count"><b>${pets.length}</b><small>仲間</small></div>`:'<div class="v7-current-pet"><span>🐦</span><div><small>いま一緒</small><b>文鳥</b><em>仲間を集めよう</em></div></div>';
}
function enhanceCollection(){
  const modal=$('#birdModal'),content=modal?.querySelector('.modal-content');if(!modal||!content)return;
  content.classList.add('v7-collection-modal','v72-collection-screen');
  if(!$('#v7CollectionHead',modal)){
    const oldTitle=content.querySelector('.modal-title');if(oldTitle)oldTitle.style.display='none';
    const head=document.createElement('div');head.id='v7CollectionHead';head.className='v7-collection-head';
    head.innerHTML='<div><small>MOFUMORI COMPANIONS</small><h2>仲間一覧</h2></div><button type="button" data-v7-close aria-label="閉じる">×</button>';
    content.insertBefore(head,content.firstChild);head.querySelector('[data-v7-close]').onclick=()=>hideModal?.('birdModal');
  }
  if(!$('#v7CollectionSummary',modal)){
    const summary=document.createElement('div');summary.id='v7CollectionSummary';summary.className='v7-collection-summary';
    const toolbar=$('.v72-companion-toolbar',modal),grid=$('#birdGrid',modal);
    content.insertBefore(summary,toolbar||grid);
  }
  renderCollectionSummary();
  const grid=$('#birdGrid',modal);
  if(grid&&!grid.dataset.v7Observed){grid.dataset.v7Observed='1';new MutationObserver(()=>renderCollectionSummary()).observe(grid,{childList:true,subtree:true})}
  const gacha=$('#gachaModal .modal-content');if(gacha)gacha.classList.add('v72-gacha-screen');
}
window.v7EnhanceCollection=enhanceCollection;

function boot(){accountCard();renderAuth();progressShell();enhanceCollection();refreshProgress();setInterval(()=>{if(document.hidden)return;refreshProgress();enhanceCollection();renderCollectionSummary()},20000)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,120),{once:true}):setTimeout(boot,120);

})();