const {allowMethods,json,requireUser,requireSameOrigin}=require('./auth.cjs');
const {configured,getSupabase}=require('./supabase.cjs');

const THEMES=[
  ['木の実ひろい','🌰','forage'],['森のお散歩','🌿','explore'],['りんご祭り','🍎','forage'],
  ['シード収穫祭','🌾','rhythm'],['水浴び大会','💧','care'],['ひなたぼっこ','☀️','care'],
  ['月夜の探検','🌙','explore'],['風の日チャレンジ','🍃','explore'],['花びら集め','🌸','forage'],
  ['落ち葉レース','🍂','explore'],['竹林探検','🎋','memory'],['羽づくろいの日','🪶','care'],
  ['小松菜フェス','🥬','rhythm'],['いちご探し','🍓','forage'],['とうもろこし祭り','🌽','rhythm'],
  ['木の実宝探し','🫐','memory'],['にんじん収穫','🥕','forage'],['ひまわり祭り','🌻','rhythm'],
  ['止まり木大会','🪵','memory']
];
const TIERS=[
  ['はじまり',1],['芽吹き',2],['深緑',3],['黄昏',4],['星夜',5]
];
const BOSSES=[
  {name:'森の大カラス',icon:'🐦‍⬛',hp:14500,copy:'黒い翼が森の実りを狙っている。攻撃を見切って追い払おう。'},
  {name:'巨大モフモフ猫',icon:'🐈',hp:16500,copy:'巨大な前足が止まり木を揺らす。素早くかわして反撃しよう。'},
  {name:'暴風ワシ',icon:'🦅',hp:18500,copy:'上空から突風と急降下。安全なレーンを読んで迎え撃とう。'},
  {name:'どんぐりゴーレム',icon:'🗿',hp:21000,copy:'森のどんぐりが集まって巨大化。硬い装甲の隙を狙おう。'},
  {name:'夜のフクロウ王',icon:'🦉',hp:24000,copy:'100日巡回の最終強敵。夜の森を守る王との決戦だ。'}
];

function modeSummary(mode){
  return {
    forage:'画面に現れる実りをすばやく集め、イベントポイントを稼ごう。',
    explore:'危険物をよけながら森を進み、チェックポイントを突破しよう。',
    rhythm:'合図に合わせてタップし、連続成功でイベントポイントを伸ばそう。',
    care:'表示されるお世話を正しく選び、文鳥のごきげんを上げよう。',
    memory:'光る止まり木の順番を覚えて、記憶チャレンジを突破しよう。'
  }[mode]||'今日だけのイベントに挑戦しよう。';
}
function catalog(){
  const all=[];
  for(let tier=0;tier<5;tier++){
    for(let i=0;i<19;i++){
      const n=tier*20+i+1,[base,icon,mode]=THEMES[i],[tierName,level]=TIERS[tier];
      all.push({
        id:'event-'+String(n).padStart(3,'0'),type:'normal',mode,
        title:base+'・'+tierName,icon,
        summary:modeSummary(mode),
        target:28+tier*4+(i%4)*3,
        level,
        reward:{coins:140+tier*70+(i%5)*25,xp:35+tier*18+(i%4)*8}
      });
    }
    const n=tier*20+20,b=BOSSES[tier];
    all.push({
      id:'event-'+String(n).padStart(3,'0'),type:'boss',mode:'boss',
      title:'ボス襲来：'+b.name,icon:b.icon,summary:b.copy,target:b.hp,level:tier+1,
      boss:{name:b.name,icon:b.icon,hp:b.hp,level:tier+1},
      reward:{coins:1100+tier*300,xp:250+tier*70}
    });
  }
  return all;
}
const EVENTS=catalog();

function jstDate(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const v=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return `${v.year}-${v.month}-${v.day}`;
}
function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function shuffle19(cycle,block){
  const a=Array.from({length:19},(_,i)=>block*20+i);
  let x=hash(`mofumori-events:${cycle}:${block}`);
  for(let i=a.length-1;i>0;i--){x=(Math.imul(1664525,x)+1013904223)>>>0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function schedule(){
  const date=jstDate(),epoch=Date.UTC(2026,8,20),day=Math.max(0,Math.floor((Date.parse(date+'T00:00:00Z')-epoch)/86400000));
  const cycle=Math.floor(day/100),slot=day%100,block=Math.floor(slot/20),within=slot%20;
  const idx=within===19?block*20+19:shuffle19(cycle,block)[within];
  return {date,cycle,slot,block,within,event:EVENTS[idx]};
}
async function selectedEvent(sb){
  const s=schedule(),e=s.event;
  if(!sb)return s;
  const row={event_date:s.date,cycle_no:s.cycle,slot_no:s.slot,event_id:e.id,event_type:e.type};
  const {data,error}=await sb.from('mofumori_daily_event_state').upsert(row,{onConflict:'event_date',ignoreDuplicates:true}).select('event_id').maybeSingle();
  if(error)throw error;
  if(data?.event_id&&data.event_id!==e.id){
    const fixed=EVENTS.find(x=>x.id===data.event_id);
    if(fixed)s.event=fixed;
  }
  return s;
}
async function takeLimit(sb,user,action,windowSeconds,limit){
  const {data,error}=await sb.rpc('mofumori_take_rate_limit',{p_user:user,p_action:action,p_window_seconds:windowSeconds,p_limit:limit});
  if(error)throw error;
  if(data!==true)throw Object.assign(new Error('イベント操作が多すぎます。少し待ってください。'),{status:429});
}
async function playerState(sb,user,event,date){
  const initial={
    user_key:user.id,event_date:date,event_id:event.id,progress:0,target:event.target,
    completed:false,claimed:false,boss_hp_remaining:event.type==='boss'?event.boss.hp:null,boss_damage:0,attempts:0
  };
  const {error:upError}=await sb.from('mofumori_daily_event_players').upsert(initial,{onConflict:'user_key,event_date',ignoreDuplicates:true});
  if(upError)throw upError;
  const {data,error}=await sb.from('mofumori_daily_event_players').select('*').eq('user_key',user.id).eq('event_date',date).single();
  if(error)throw error;
  return data;
}
function cleanState(row,event){
  return {
    progress:Number(row?.progress||0),target:Number(row?.target||event.target),completed:row?.completed===true,claimed:row?.claimed===true,
    attempts:Number(row?.attempts||0),bossDamage:Number(row?.boss_damage||0),
    bossHpRemaining:event.type==='boss'?Math.max(0,Number(row?.boss_hp_remaining??event.boss.hp)):null
  };
}
function validateNormal(event,m){
  const duration=Number(m?.durationMs||0);
  if(duration<8000||duration>45000)throw Object.assign(new Error('イベントのプレイ時間が不正です。'),{status:400});
  let points=0,detail={};
  if(event.mode==='forage'){
    const hits=Math.trunc(Number(m.hits||0)),misses=Math.trunc(Number(m.misses||0)),combo=Math.trunc(Number(m.maxCombo||0));
    if(hits<0||hits>40||misses<0||misses>40||combo<0||combo>40)throw Object.assign(new Error('採集結果が不正です。'),{status:400});
    points=Math.max(1,hits*2+Math.min(10,combo)-Math.floor(misses/3));detail={hits,misses,maxCombo:combo};
  }else if(event.mode==='rhythm'){
    const hits=Math.trunc(Number(m.hits||0)),perfects=Math.trunc(Number(m.perfects||0)),misses=Math.trunc(Number(m.misses||0));
    if(hits<0||hits>24||perfects<0||perfects>hits||misses<0||hits+misses!==24)throw Object.assign(new Error('リズム結果が不正です。'),{status:400});
    points=Math.max(1,hits+perfects*2);detail={hits,perfects,misses};
  }else if(event.mode==='care'){
    const correct=Math.trunc(Number(m.correct||0)),wrong=Math.trunc(Number(m.wrong||0));
    if(correct<0||wrong<0||correct+wrong!==12)throw Object.assign(new Error('お世話結果が不正です。'),{status:400});
    points=Math.max(1,correct*3-wrong);detail={correct,wrong};
  }else if(event.mode==='explore'){
    const gates=Math.trunc(Number(m.gates||0)),collisions=Math.trunc(Number(m.collisions||0));
    if(gates<0||gates>20||collisions<0||collisions>20)throw Object.assign(new Error('探索結果が不正です。'),{status:400});
    points=Math.max(1,gates*3-collisions*2);detail={gates,collisions};
  }else if(event.mode==='memory'){
    const rounds=Math.trunc(Number(m.rounds||0)),correct=Math.trunc(Number(m.correct||0));
    if(rounds!==8||correct<0||correct>8)throw Object.assign(new Error('記憶ゲーム結果が不正です。'),{status:400});
    points=Math.max(1,correct*6);detail={rounds,correct};
  }else throw Object.assign(new Error('イベント種別が不正です。'),{status:400});
  return {points:Math.min(80,points),detail:{...detail,durationMs:Math.round(duration)}};
}
async function submitNormal(sb,user,event,date,metrics){
  await takeLimit(sb,user.id,'daily_event_play',60,12);
  const state=await playerState(sb,user,event,date);
  if(state.claimed)return {state:cleanState(state,event),points:0};
  const result=validateNormal(event,metrics);
  const progress=Math.min(event.target,Number(state.progress||0)+result.points),completed=progress>=event.target;
  const {data,error}=await sb.from('mofumori_daily_event_players').update({
    progress,completed,last_played_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq('user_key',user.id).eq('event_date',date).eq('event_id',event.id).select('*').single();
  if(error)throw error;
  return {state:cleanState(data,event),points:result.points,detail:result.detail};
}
async function submitBoss(sb,user,event,date,payload){
  await takeLimit(sb,user.id,'daily_boss_play',60,8);
  const state=await playerState(sb,user,event,date);
  if(state.completed)return {state:cleanState(state,event),damage:0,alreadyDefeated:true};
  const m=payload?.metrics||{},duration=Number(m.durationMs||0),rounds=Math.trunc(Number(m.rounds||0)),
    dodges=Math.trunc(Number(m.dodges||0)),perfects=Math.trunc(Number(m.perfects||0)),hitsTaken=Math.trunc(Number(m.hitsTaken||0));
  if(duration<16000||duration>32000||rounds!==18||dodges<0||hitsTaken<0||dodges+hitsTaken!==18||perfects<0||perfects>dodges)
    throw Object.assign(new Error('ボス戦結果が不正です。'),{status:400});
  const petId=String(payload?.petId||'');
  const {data:pet,error:petError}=await sb.from('mofumori_pets')
    .select('id,rank,agility,flight_power,focus,balance,fitness').eq('id',petId).eq('owner_key',user.id).maybeSingle();
  if(petError)throw petError;if(!pet)throw Object.assign(new Error('ボス戦に参加するどうぶつが見つかりません。'),{status:403});
  const avg=(Number(pet.agility||50)+Number(pet.flight_power||50)+Number(pet.focus||50)+Number(pet.balance||50)+Number(pet.fitness||50))/5;
  const mult=.62+avg/180+Math.min(5,Number(pet.rank||1))*.035;
  const raw=Math.max(300,dodges*500+perfects*210-hitsTaken*80);
  const damage=Math.max(1,Math.round(raw*mult));
  const remaining=Math.max(0,Number(state.boss_hp_remaining??event.boss.hp)-damage),completed=remaining<=0;
  const totalDamage=Number(state.boss_damage||0)+damage,attempts=Number(state.attempts||0)+1;
  const {data,error}=await sb.from('mofumori_daily_event_players').update({
    progress:Math.min(event.target,totalDamage),completed,boss_hp_remaining:remaining,boss_damage:totalDamage,attempts,
    last_played_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq('user_key',user.id).eq('event_date',date).eq('event_id',event.id).select('*').single();
  if(error)throw error;
  return {state:cleanState(data,event),damage,multiplier:Number(mult.toFixed(3)),metrics:{rounds,dodges,perfects,hitsTaken,durationMs:Math.round(duration)}};
}
async function claim(sb,user,event,date){
  const state=await playerState(sb,user,event,date);
  if(!state.completed)throw Object.assign(new Error('イベントをクリアすると受け取れます。'),{status:409});
  if(state.claimed)return {state:cleanState(state,event),alreadyClaimed:true};
  const {data,error}=await sb.rpc('mofumori_claim_daily_event_reward',{
    p_user:user.id,p_event_date:date,p_event_id:event.id,p_coins:event.reward.coins,p_xp:event.reward.xp
  });
  if(error){
    const msg=String(error.message||'');
    if(msg.includes('event_already_claimed'))return {state:{...cleanState(state,event),claimed:true},alreadyClaimed:true};
    throw error;
  }
  const fresh=await playerState(sb,user,event,date);
  return {state:cleanState(fresh,event),reward:data};
}
async function responseFor(sb,user){
  const s=await selectedEvent(sb),state=user&&sb?await playerState(sb,user,s.event,s.date):null;
  return {date:s.date,cycle:s.cycle,slot:s.slot,total:100,nextReset:'00:00 Asia/Tokyo',event:s.event,state:state?cleanState(state,s.event):null};
}

module.exports=async function handler(req,res){
  if(req.method==='GET'){
    if(!allowMethods(req,res,['GET']))return;
    try{
      const sb=configured()?getSupabase():null;
      return json(res,200,{ok:true,...await responseFor(sb,null)});
    }catch(error){return json(res,500,{ok:false,message:error.message||'イベントを取得できませんでした。'})}
  }
  if(!allowMethods(req,res,['POST']))return;
  try{
    requireSameOrigin(req);
    if(!configured())return json(res,503,{ok:false,configured:false,message:'イベントサーバーは準備中です。'});
    const user=await requireUser(req),sb=getSupabase(),body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{}),action=String(body.action||'status');
    const s=await selectedEvent(sb),event=s.event;
    if(action==='status')return json(res,200,{ok:true,...await responseFor(sb,user)});
    if(action==='play'){
      if(event.type!=='normal')throw Object.assign(new Error('今日は通常イベントではありません。'),{status:409});
      const result=await submitNormal(sb,user,event,s.date,body.metrics||{});
      return json(res,200,{ok:true,...await responseFor(sb,user),result});
    }
    if(action==='bossSubmit'){
      if(event.type!=='boss')throw Object.assign(new Error('今日はボスイベントではありません。'),{status:409});
      const result=await submitBoss(sb,user,event,s.date,body);
      return json(res,200,{ok:true,...await responseFor(sb,user),result});
    }
    if(action==='claim'){
      const result=await claim(sb,user,event,s.date);
      return json(res,200,{ok:true,...await responseFor(sb,user),result});
    }
    throw Object.assign(new Error('未対応のイベント操作です。'),{status:400});
  }catch(error){return json(res,error.status||400,{ok:false,message:error.message||'イベント処理に失敗しました。'})}
};
