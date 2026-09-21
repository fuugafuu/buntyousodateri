(function dailyEventsClient(){
'use strict';
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const S={data:null,busy:false,game:null,lastIdentity:null,loadedAt:0};
const MODE_NAME={forage:'採集チャレンジ',rhythm:'リズムチャレンジ',care:'お世話チャレンジ',explore:'森の探索',memory:'記憶チャレンジ',boss:'ボス戦'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function loggedIn(){try{return !!identityUser}catch(e){return false}}
function toast(m,t='achievement'){try{showToast?.(m,t)}catch(e){}}
async function post(action,extra={}){
  const r=await fetch('/api/daily-event',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action,...extra})});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.message||'イベント通信に失敗しました。');return j;
}
async function load(force=false){
  if(S.busy||(!force&&Date.now()-S.loadedAt<8000))return;S.busy=true;
  try{
    let j;
    if(loggedIn()){try{j=await post('status')}catch(e){}}
    if(!j){const r=await fetch('/api/daily-event',{cache:'no-store',headers:{Accept:'application/json'}});j=await r.json();if(!r.ok)throw new Error(j.message||'イベントを取得できませんでした。')}
    S.data=j;S.loadedAt=Date.now();render();
  }catch(e){console.warn('[daily-events]',e)}
  finally{S.busy=false}
}
function ensureCard(){
  let card=$('#v723DailyEvent');if(card)return card;
  card=document.createElement('section');card.id='v723DailyEvent';card.className='v723-event-card';
  const anchor=$('.v7-journey')||$('.game-shell')||$('.habitat-card')||document.querySelector('main')||document.body.firstElementChild;
  anchor?.insertAdjacentElement('afterend',card);
  return card;
}
function ensureModal(){
  let m=$('#v723EventModal');if(m)return m;
  m=document.createElement('div');m.id='v723EventModal';m.className='v723-event-overlay';m.innerHTML='<div class="v723-event-modal"><button class="v723-event-close" aria-label="閉じる">×</button><div id="v723EventModalBody"></div></div>';
  document.body.appendChild(m);m.querySelector('.v723-event-close').onclick=closeModal;m.addEventListener('click',e=>{if(e.target===m)closeModal()});return m;
}
function state(){return S.data?.state||null}
function event(){return S.data?.event||null}
function progressPct(){
  const e=event(),s=state();if(!e||!s)return 0;
  if(e.type==='boss')return clamp((1-Number(s.bossHpRemaining??e.boss?.hp)/Math.max(1,Number(e.boss?.hp||1)))*100,0,100);
  return clamp(Number(s.progress||0)/Math.max(1,Number(s.target||e.target||1))*100,0,100);
}
function actionLabel(){
  const s=state(),e=event();if(!loggedIn())return'ログインして参加';if(s?.claimed)return'✓ 本日クリア済み';if(s?.completed)return'🎁 報酬を受け取る';return e?.type==='boss'?'⚔️ ボス戦へ':'▶ イベントに挑戦';
}
function render(){
  const d=S.data,e=d?.event;if(!d||!e)return;const s=state(),card=ensureCard(),boss=e.type==='boss',pct=progressPct();
  card.className='v723-event-card'+(boss?' boss':'')+(s?.claimed?' cleared':'');
  const progressCopy=boss
    ?(s?`BOSS HP ${Number(s.bossHpRemaining??e.boss.hp).toLocaleString()} / ${Number(e.boss.hp).toLocaleString()}${s.attempts?` ・ 挑戦 ${s.attempts}回`:''}`:`BOSS HP ${Number(e.boss.hp).toLocaleString()}`)
    :(s?`${Number(s.progress||0)} / ${Number(s.target||e.target)} pt`:`目標 ${Number(e.target)} pt`);
  card.innerHTML=`<div class="v723-event-day"><small>DAILY EVENT</small><b>${Number(d.slot)+1}</b><span>/ 100</span></div>
    <div class="v723-event-icon">${esc(e.icon)}</div>
    <div class="v723-event-main"><div class="v723-event-kicker">${boss?'BOSS EVENT':esc(MODE_NAME[e.mode]||'TODAY')}</div><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p>
      <div class="v723-event-progress"><i><em style="width:${pct}%"></em></i><span>${esc(progressCopy)}</span></div>
      <div class="v723-event-reward">報酬　🪙 ${Number(e.reward?.coins||0).toLocaleString()}　✨ ${Number(e.reward?.xp||0)} XP</div>
    </div>
    <button class="v723-event-action" ${s?.claimed?'disabled':''}>${actionLabel()}</button>`;
  card.querySelector('.v723-event-action')?.addEventListener('click',mainAction);
}
async function mainAction(){
  const s=state(),e=event();if(!e)return;
  if(!loggedIn()){try{openAccountHub?.()}catch(err){}toast('イベント報酬にはログインが必要です','warning');return}
  if(s?.claimed)return;
  if(s?.completed){await claimReward();return}
  openEvent();
}
function openEvent(){
  const e=event(),s=state();if(!e)return;const m=ensureModal(),body=$('#v723EventModalBody');m.classList.add('show');document.body.classList.add('v723-event-open');
  const boss=e.type==='boss',pct=progressPct();
  body.innerHTML=`<div class="v723-event-hero ${boss?'boss':''}"><span>${esc(e.icon)}</span><div><small>${boss?'BOSS EVENT':'DAILY EVENT '+(Number(S.data.slot)+1)+'/100'}</small><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p></div></div>
    <div class="v723-event-detail">
      <div><small>${boss?'残りHP':'進捗'}</small><b>${boss?Number(s?.bossHpRemaining??e.boss.hp).toLocaleString():(Number(s?.progress||0)+' / '+Number(s?.target||e.target))}</b></div>
      <div><small>報酬</small><b>🪙 ${Number(e.reward?.coins||0).toLocaleString()} / ✨ ${Number(e.reward?.xp||0)} XP</b></div>
      <div><small>切替</small><b>毎日 0:00</b></div>
    </div>
    <div class="v723-event-progress big"><i><em style="width:${pct}%"></em></i></div>
    <section id="v723GameArea" class="v723-game-area">
      <div class="v723-event-rules">${rules(e)}</div>
      <button id="v723StartGame" class="v723-primary">${boss?'⚔️ ボス戦を開始':'▶ チャレンジ開始'}</button>
    </section>`;
  $('#v723StartGame').onclick=()=>boss?startBoss():startNormal(e.mode);
}
function rules(e){
  if(e.type==='boss')return`<b>18回の攻撃を回避して反撃</b><p>赤く光る危険レーンから逃げよう。素早い回避は PERFECT になり、追加ダメージ。ボスHPは今日中持ち越されます。</p>`;
  const map={
    forage:['実りを集める','光った実りを素早くタップ。連続成功でボーナス。'],
    rhythm:['24拍のリズム','合図の中心でタップ。PERFECTほど高得点。'],
    care:['12回のお世話','表示されたお願いに合うお世話を選択。'],
    explore:['危険を避けて進む','3レーンを移動して障害物を回避。'],
    memory:['止まり木を記憶','光った順番を覚えて同じ順番を入力。']
  },r=map[e.mode]||['チャレンジ','今日のイベントに挑戦。'];return`<b>${r[0]}</b><p>${r[1]}</p>`;
}
function closeModal(){if(S.game?.stop)S.game.stop();S.game=null;$('#v723EventModal')?.classList.remove('show');document.body.classList.remove('v723-event-open')}
function gameRoot(){return $('#v723GameArea')}
async function countdown(root,label='START'){
  for(const x of ['3','2','1',label]){root.innerHTML=`<div class="v723-countdown">${x}</div>`;await sleep(x===label?350:550)}
}
async function startNormal(mode){
  if(S.game)return;const root=gameRoot();if(!root)return;await countdown(root);
  if(mode==='forage')return forageGame(root);
  if(mode==='rhythm')return rhythmGame(root);
  if(mode==='care')return careGame(root);
  if(mode==='explore')return exploreGame(root);
  if(mode==='memory')return memoryGame(root);
}
async function submitNormal(metrics){
  S.game=null;const root=gameRoot();if(!root)return;
  root.innerHTML='<div class="v723-submit"><span>☁️</span><b>結果を保存中…</b></div>';
  try{
    const j=await post('play',{metrics});S.data=j;render();const p=j.result?.points||0;
    root.innerHTML=`<div class="v723-result"><span>✨</span><h3>+${p} pt</h3><p>${j.state?.completed?'イベントクリア！ 報酬を受け取れます。':'進捗をサーバーに保存しました。'}</p><button class="v723-primary" id="v723ResultNext">${j.state?.completed?'報酬を受け取る':'もう一度挑戦'}</button></div>`;
    $('#v723ResultNext').onclick=()=>j.state?.completed?claimReward():startNormal(event().mode);
  }catch(e){root.innerHTML=`<div class="v723-result error"><span>⚠️</span><h3>保存できませんでした</h3><p>${esc(e.message)}</p><button class="v723-primary" id="v723Retry">戻る</button></div>`;$('#v723Retry').onclick=openEvent}
}
function forageGame(root){
  let hits=0,misses=0,combo=0,maxCombo=0,done=false,target=null,start=performance.now(),timer,spawn;
  root.innerHTML='<div class="v723-game-head"><b>🌰 実りを集めよう</b><span id="v723Time">12.0</span></div><div class="v723-forage-field" id="v723Forage"><div class="v723-score">GET <b id="v723Hits">0</b>　COMBO <b id="v723Combo">0</b></div></div>';
  const field=$('#v723Forage');
  const make=()=>{target?.remove();target=document.createElement('button');target.className='v723-forage-target';target.textContent=['🌰','🍓','🫐','🌾'][Math.floor(Math.random()*4)];target.style.left=(8+Math.random()*78)+'%';target.style.top=(16+Math.random()*66)+'%';target.onclick=e=>{e.stopPropagation();if(done)return;hits++;combo++;maxCombo=Math.max(maxCombo,combo);$('#v723Hits').textContent=hits;$('#v723Combo').textContent=combo;make()};field.appendChild(target)};
  field.onclick=e=>{if(e.target===field){misses++;combo=0;$('#v723Combo').textContent='0'}};
  const finish=()=>{if(done)return;done=true;clearInterval(timer);clearInterval(spawn);submitNormal({durationMs:Math.round(performance.now()-start),hits,misses,maxCombo})};
  make();spawn=setInterval(()=>{if(!done){combo=0;make()}},850);
  timer=setInterval(()=>{const left=Math.max(0,12000-(performance.now()-start));$('#v723Time').textContent=(left/1000).toFixed(1);if(left<=0)finish()},80);
  S.game={stop(){done=true;clearInterval(timer);clearInterval(spawn)}};
}
function rhythmGame(root){
  let idx=0,hits=0,perfects=0,misses=0,done=false,noteStart=0,tapped=false,start=performance.now(),timer;
  root.innerHTML='<div class="v723-game-head"><b>🌾 リズムチャレンジ</b><span><b id="v723RhythmN">0</b>/24</span></div><div class="v723-rhythm-stage"><div class="v723-rhythm-ring" id="v723Ring"><i></i></div><button id="v723RhythmTap">TAP</button><div class="v723-rhythm-grade" id="v723Grade">READY</div></div>';
  const ring=$('#v723Ring'),btn=$('#v723RhythmTap'),grade=$('#v723Grade');
  const finish=async()=>{if(done)return;done=true;const elapsed=performance.now()-start;if(elapsed<8000)await sleep(8000-elapsed);submitNormal({durationMs:Math.round(performance.now()-start),hits,perfects,misses})};
  const next=()=>{if(done)return;if(idx>=24)return finish();idx++;tapped=false;noteStart=performance.now();$('#v723RhythmN').textContent=idx;ring.classList.remove('pulse');void ring.offsetWidth;ring.classList.add('pulse');grade.textContent='…';timer=setTimeout(()=>{if(!tapped){misses++;grade.textContent='MISS'}setTimeout(next,120)},480)};
  btn.onclick=()=>{if(done||tapped)return;tapped=true;clearTimeout(timer);const dt=performance.now()-noteStart;hits++;if(dt>=185&&dt<=315){perfects++;grade.textContent='PERFECT'}else grade.textContent='GOOD';setTimeout(next,Math.max(80,480-dt)+120)};
  S.game={stop(){done=true;clearTimeout(timer)}};setTimeout(next,250);
}
function careGame(root){
  const choices=[['ごはん','🍚'],['なでる','✋'],['水浴び','💧']],prompts=Array.from({length:12},()=>Math.floor(Math.random()*3));
  let idx=0,correct=0,wrong=0,done=false,start=performance.now(),timeout;
  root.innerHTML='<div class="v723-game-head"><b>🪶 お世話チャレンジ</b><span><b id="v723CareN">1</b>/12</span></div><div class="v723-care-stage"><div id="v723CarePrompt" class="v723-care-prompt"></div><div class="v723-care-buttons"></div><div id="v723CareGrade" class="v723-rhythm-grade"></div></div>';
  const prompt=$('#v723CarePrompt'),buttons=$('.v723-care-buttons'),grade=$('#v723CareGrade');
  buttons.innerHTML=choices.map((x,i)=>`<button data-care="${i}">${x[1]}<b>${x[0]}</b></button>`).join('');
  const finish=async()=>{if(done)return;done=true;const elapsed=performance.now()-start;if(elapsed<8000)await sleep(8000-elapsed);submitNormal({durationMs:Math.round(performance.now()-start),correct,wrong})};
  const show=()=>{if(done)return;if(idx>=12)return finish();$('#v723CareN').textContent=idx+1;const p=prompts[idx];prompt.innerHTML=`<span>🐦</span><b>「${choices[p][0]}して！」</b>`;grade.textContent='';clearTimeout(timeout);timeout=setTimeout(()=>answer(-1),900)};
  const answer=v=>{if(done)return;clearTimeout(timeout);if(v===prompts[idx]){correct++;grade.textContent='GOOD!'}else{wrong++;grade.textContent='MISS'}idx++;setTimeout(show,180)};
  $$('[data-care]',buttons).forEach(b=>b.onclick=()=>answer(Number(b.dataset.care)));
  S.game={stop(){done=true;clearTimeout(timeout)}};show();
}
function exploreGame(root){
  let lane=1,round=0,gates=0,collisions=0,done=false,start=performance.now(),timer;
  root.innerHTML='<div class="v723-game-head"><b>🌿 森の探索</b><span><b id="v723ExploreN">0</b>/12</span></div><div class="v723-explore-field"><div class="v723-lanes"><i></i><i></i></div><div class="v723-explore-bird" id="v723ExploreBird">🐦</div><div class="v723-danger" id="v723Danger"></div></div><div class="v723-lane-buttons"><button data-lane="0">← 左</button><button data-lane="1">中央</button><button data-lane="2">右 →</button></div><div id="v723ExploreGrade" class="v723-rhythm-grade"></div>';
  const bird=$('#v723ExploreBird'),danger=$('#v723Danger'),grade=$('#v723ExploreGrade');
  const setLane=n=>{lane=clamp(n,0,2);bird.style.left=[17,50,83][lane]+'%'};
  $$('[data-lane]',root).forEach(b=>b.onclick=()=>setLane(Number(b.dataset.lane)));
  const key=e=>{if(e.key==='ArrowLeft')setLane(lane-1);if(e.key==='ArrowRight')setLane(lane+1)};addEventListener('keydown',key);
  const finish=async()=>{if(done)return;done=true;removeEventListener('keydown',key);const elapsed=performance.now()-start;if(elapsed<8000)await sleep(8000-elapsed);submitNormal({durationMs:Math.round(performance.now()-start),gates,collisions})};
  const next=()=>{if(done)return;if(round>=12)return finish();round++;$('#v723ExploreN').textContent=round;const bad=Math.floor(Math.random()*3);danger.style.left=[17,50,83][bad]+'%';danger.classList.remove('strike');void danger.offsetWidth;danger.classList.add('strike');timer=setTimeout(()=>{if(lane===bad){collisions++;grade.textContent='💥 HIT'}else{gates++;grade.textContent='✓ DODGE'}setTimeout(next,170)},680)};
  S.game={stop(){done=true;clearTimeout(timer);removeEventListener('keydown',key)}};setLane(1);setTimeout(next,300);
}
function memoryGame(root){
  const tiles=['🌰','🌿','💧','🌸'];let round=0,correct=0,done=false,start=performance.now(),locked=true,sequence=[],input=[],cancelled=false;
  root.innerHTML='<div class="v723-game-head"><b>🎋 記憶チャレンジ</b><span><b id="v723MemoryN">1</b>/8</span></div><div class="v723-memory-copy" id="v723MemoryCopy">光る順番を覚えてね</div><div class="v723-memory-grid">'+tiles.map((x,i)=>`<button data-memory="${i}">${x}</button>`).join('')+'</div>';
  const btns=$$('[data-memory]',root),copy=$('#v723MemoryCopy');
  const flash=async i=>{btns[i].classList.add('flash');await sleep(310);btns[i].classList.remove('flash');await sleep(120)};
  const finish=async()=>{if(done)return;done=true;const elapsed=performance.now()-start;if(elapsed<8000)await sleep(8000-elapsed);submitNormal({durationMs:Math.round(performance.now()-start),rounds:8,correct})};
  const showRound=async()=>{if(done||cancelled)return;if(round>=8)return finish();round++;$('#v723MemoryN').textContent=round;sequence=Array.from({length:Math.min(2+Math.floor((round-1)/2),5)},()=>Math.floor(Math.random()*4));input=[];locked=true;copy.textContent='覚えて…';await sleep(250);for(const n of sequence){if(cancelled)return;await flash(n)}locked=false;copy.textContent='同じ順番でタップ！'};
  btns.forEach(b=>b.onclick=()=>{if(locked||done)return;const n=Number(b.dataset.memory),expected=sequence[input.length];b.classList.add(n===expected?'ok':'bad');setTimeout(()=>b.classList.remove('ok','bad'),180);if(n!==expected){locked=true;copy.textContent='MISS';setTimeout(showRound,450);return}input.push(n);if(input.length===sequence.length){correct++;locked=true;copy.textContent='CLEAR';setTimeout(showRound,450)}});
  S.game={stop(){done=true;cancelled=true}};showRound();
}
async function startBoss(){
  if(S.game)return;const root=gameRoot(),e=event();if(!root||!e)return;
  if(!loggedIn()){toast('ボス戦にはログインが必要です','warning');return}
  const petId=String(G?.activePetId||'');if(!/^[0-9a-f-]{36}$/i.test(petId)){toast('クラウドに同期された文鳥を選んでください','warning');return}
  await countdown(root,'FIGHT');
  let lane=1,round=0,dodges=0,perfects=0,hitsTaken=0,combo=0,done=false,danger=1,telegraphAt=0,timer,start=performance.now();
  root.innerHTML=`<div class="v723-boss-head"><div><span>${esc(e.boss.icon)}</span><div><small>BOSS Lv.${e.boss.level}</small><b>${esc(e.boss.name)}</b></div></div><div class="v723-boss-hp"><i><em id="v723BossHpBar"></em></i><b id="v723BossHpText">${Number(state()?.bossHpRemaining??e.boss.hp).toLocaleString()} HP</b></div></div>
    <div class="v723-boss-field"><div class="v723-boss-sprite">${esc(e.boss.icon)}</div><div class="v723-boss-lanes"><i></i><i></i></div><div id="v723BossWarning" class="v723-boss-warning"></div><div id="v723BossBird" class="v723-boss-bird">🐦</div><div id="v723BossFx" class="v723-boss-fx"></div></div>
    <div class="v723-boss-hud"><span>ROUND <b id="v723BossRound">0</b>/18</span><span>COMBO <b id="v723BossCombo">0</b></span><span>DODGE <b id="v723BossDodge">0</b></span></div>
    <div class="v723-lane-buttons"><button data-boss-lane="0">← 左</button><button data-boss-lane="1">中央</button><button data-boss-lane="2">右 →</button></div><div id="v723BossGrade" class="v723-boss-grade">攻撃を見切れ！</div>`;
  const bird=$('#v723BossBird'),warn=$('#v723BossWarning'),grade=$('#v723BossGrade'),fx=$('#v723BossFx');
  const maxHp=Number(e.boss.hp),initialHp=Number(state()?.bossHpRemaining??maxHp);$('#v723BossHpBar').style.width=(initialHp/maxHp*100)+'%';
  const setLane=n=>{const old=lane;lane=clamp(n,0,2);bird.style.left=[17,50,83][lane]+'%';if(old!==lane){bird.classList.add('dash');setTimeout(()=>bird.classList.remove('dash'),130)}};
  $$('[data-boss-lane]',root).forEach(b=>b.onclick=()=>setLane(Number(b.dataset.bossLane)));
  const key=e=>{if(e.key==='ArrowLeft'||e.key==='a')setLane(lane-1);if(e.key==='ArrowRight'||e.key==='d')setLane(lane+1)};addEventListener('keydown',key);
  const finish=async()=>{if(done)return;done=true;clearTimeout(timer);removeEventListener('keydown',key);const elapsed=performance.now()-start;if(elapsed<16000)await sleep(16000-elapsed);submitBoss({durationMs:Math.round(performance.now()-start),rounds:18,dodges,perfects,hitsTaken},petId)};
  const next=()=>{if(done)return;if(round>=18)return finish();round++;$('#v723BossRound').textContent=round;danger=Math.floor(Math.random()*3);telegraphAt=performance.now();warn.style.left=[17,50,83][danger]+'%';warn.className='v723-boss-warning telegraph';grade.textContent='⚠️ MOVE!';timer=setTimeout(resolve,780)};
  const resolve=()=>{if(done)return;warn.className='v723-boss-warning strike';if(lane===danger){hitsTaken++;combo=0;grade.textContent='💥 HIT!';bird.classList.add('hit');setTimeout(()=>bird.classList.remove('hit'),260)}
    else{dodges++;combo++;const dt=performance.now()-telegraphAt;if(dt<430){perfects++;grade.textContent='✨ PERFECT DODGE'}else grade.textContent='✓ DODGE';fx.textContent='⚡';fx.classList.remove('pop');void fx.offsetWidth;fx.classList.add('pop')}
    $('#v723BossCombo').textContent=combo;$('#v723BossDodge').textContent=dodges;setTimeout(next,180)};
  S.game={stop(){done=true;clearTimeout(timer);removeEventListener('keydown',key)}};setLane(1);setTimeout(next,350);
}
async function submitBoss(metrics,petId){
  S.game=null;const root=gameRoot();root.innerHTML='<div class="v723-submit"><span>⚔️</span><b>戦闘結果を判定中…</b></div>';
  try{
    const j=await post('bossSubmit',{metrics,petId});S.data=j;render();const r=j.result||{},remain=Number(j.state?.bossHpRemaining||0);
    root.innerHTML=`<div class="v723-result boss-result"><span>${remain<=0?'🏆':'⚔️'}</span><h3>${remain<=0?'BOSS DEFEATED!':'-'+Number(r.damage||0).toLocaleString()+' DAMAGE'}</h3><p>${remain<=0?'ボスを撃破しました。報酬を受け取れます。':'残りHP '+remain.toLocaleString()+'。ダメージは今日中保存されます。'}</p><button class="v723-primary" id="v723BossNext">${remain<=0?'報酬を受け取る':'もう一度挑戦'}</button></div>`;
    $('#v723BossNext').onclick=()=>remain<=0?claimReward():startBoss();
  }catch(e){root.innerHTML=`<div class="v723-result error"><span>⚠️</span><h3>戦闘結果を保存できませんでした</h3><p>${esc(e.message)}</p><button class="v723-primary" id="v723BossRetry">戻る</button></div>`;$('#v723BossRetry').onclick=openEvent}
}
async function claimReward(){
  if(S.busy)return;S.busy=true;
  try{
    const j=await post('claim');S.data=j;const reward=j.result?.reward||{};
    if(Number.isFinite(Number(reward.coins))&&typeof G!=='undefined'){G.coins=Number(reward.coins);try{save?.();updateUI?.()}catch(e){}}
    try{window.v7RefreshProgress?.(true)}catch(e){}
    render();toast(`🎁 報酬獲得！ +${Number(reward.rewardCoins||event()?.reward?.coins||0)}コイン / +${Number(reward.rewardXp||event()?.reward?.xp||0)}XP`,'achievement');
    const body=$('#v723EventModalBody');if(body){body.innerHTML=`<div class="v723-reward-burst"><span>🎁</span><h2>イベントクリア！</h2><p>🪙 ${Number(event()?.reward?.coins||0).toLocaleString()}　✨ ${Number(event()?.reward?.xp||0)} XP</p><button class="v723-primary" id="v723RewardClose">森へ戻る</button></div>`;$('#v723RewardClose').onclick=closeModal}
  }catch(e){toast(e.message,'warning')}
  finally{S.busy=false}
}
function boot(){
  load(true);setInterval(()=>{if(!document.hidden)load(false)},60000);
  setInterval(()=>{let id='guest';try{id=loggedIn()?String(identityUser?.id||identityUser?.email||'user'):'guest'}catch(e){}if(id!==S.lastIdentity){S.lastIdentity=id;load(true)}},5000);
  addEventListener('focus',()=>load(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(true)});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,500),{once:true}):setTimeout(boot,500);
})();
