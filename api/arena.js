const { allowMethods, json, requireUser, requireSameOrigin } = require('../server/auth.cjs');
async function bestEffortRpc(sb,name,args){try{const {error}=await sb.rpc(name,args);if(error)console.warn('[mofumori] best-effort RPC failed',name,error.message)}catch(error){console.warn('[mofumori] best-effort RPC exception',name,error?.message||error)}}
const { configured, getSupabase } = require('../server/supabase.cjs');
const { calculate, validateSubmission: validateArenaSubmission } = require('../server/arena-rules.cjs');

const GAMES = new Set(['flight','kale','perch','seedrace','ring']);
const PET_SELECT = [
  'id','owner_key','species','rarity','rank','name','source','obtained_at',
  'appetite','frame','metabolism','temperament','curiosity','sociability',
  'endurance','agility','flight_power','focus','beak_speed','balance',
  'weight_g','ideal_weight_g','body_length_cm','wing_span_cm','fitness',
  'care_counters','arena_rating','arena_wins','arena_losses','arena_draws','sex','sex_known','sex_determined_at'
].join(',');

function text(v,max,fallback=''){const s=String(v??'').trim().slice(0,max);return s||fallback}
function uuid(v){const s=String(v||'');return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)?s:null}
function num(v,min,max,fallback=0){const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback}
function round(v,d=2){const p=10**d;return Math.round(Number(v||0)*p)/p}
function isBuncho(species){return String(species||'').startsWith('buncho_')}
function stats(row){
  const weight=Number(row.weight_g||24.5),ideal=Number(row.ideal_weight_g||24.5);
  const diff=Math.abs(weight-ideal)/Math.max(ideal,1);
  const bodyCondition=diff<.035?'ベスト':diff<.08?'標準':weight>ideal?'ややふっくら':'やや軽め';
  const genes=[
    ['食いしん坊',Number(row.appetite||50)],['好奇心',Number(row.curiosity||50)],
    ['社交性',Number(row.sociability||50)],['落ち着き',Number(row.temperament||50)]
  ].sort((a,b)=>b[1]-a[1]);
  return {
    appetite:round(row.appetite),frame:round(row.frame),metabolism:round(row.metabolism),
    temperament:round(row.temperament),curiosity:round(row.curiosity),sociability:round(row.sociability),
    endurance:round(row.endurance),agility:round(row.agility),flightPower:round(row.flight_power),
    focus:round(row.focus),beakSpeed:round(row.beak_speed),balance:round(row.balance),
    weightG:round(weight),idealWeightG:round(ideal),bodyLengthCm:round(row.body_length_cm),
    wingSpanCm:round(row.wing_span_cm),fitness:round(row.fitness),bodyCondition,
    personality:genes[0]?.[0]||'マイペース',careCounters:row.care_counters||{},
    rating:Number(row.arena_rating||1000),wins:Number(row.arena_wins||0),
    losses:Number(row.arena_losses||0),draws:Number(row.arena_draws||0)
  };
}
function pet(row){return row?{
  id:row.id,species:row.species,name:row.name,rarity:row.rarity,rank:Number(row.rank||1),
  source:row.source,obtainedAt:row.obtained_at,eligible:isBuncho(row.species),sexKnown:row.sex_known===true,sex:row.sex_known===true?row.sex:null,sexDeterminedAt:row.sex_determined_at||null,stats:stats(row)
}:null}
function profile(row){return row?{playerId:row.player_id,displayName:row.display_name,character:row.character||{},isBot:String(row.user_key||'').startsWith('bot:arena:')}:null}
async function takeLimit(sb,userKey,action,windowSeconds,limit){
  const {data,error}=await sb.rpc('mofumori_take_rate_limit',{p_user:userKey,p_action:action,p_window_seconds:windowSeconds,p_limit:limit});
  if(error)throw error;
  if(data!==true)throw Object.assign(new Error('操作が多すぎます。少し待ってから試してください。'),{status:429});
}
async function ownPet(sb,userKey,petId){
  const id=uuid(petId);if(!id)throw Object.assign(new Error('文鳥を選んでください。'),{status:400});
  const {data,error}=await sb.from('mofumori_pets').select(PET_SELECT).eq('id',id).eq('owner_key',userKey).maybeSingle();
  if(error)throw error;
  if(!data)throw Object.assign(new Error('その文鳥は選べません。'),{status:403});
  return data;
}
function rand(seed){
  let x=(Number(seed)||123456789)>>>0;
  return()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296};
}
function gameDuration(game){return game==='flight'?30000:game==='kale'?10000:game==='seedrace'?15000:game==='ring'?20000:15000}
function syntheticBotProgress(game,seed,startsAt,status){
  const start=Date.parse(startsAt||0),dur=gameDuration(game),elapsed=Math.max(0,Math.min(dur,Date.now()-start));
  const r=rand((Number(seed)||1)^0x72b07),skill=.56+r()*.34,ratio=dur?elapsed/dur:0,x=Math.sin(elapsed/620+(seed%17))*.72;
  const moveRand=rand(((Number(seed)||1)^0x431d^Math.floor(elapsed/720))>>>0);
  if(status==='finished')return {};
  if(game==='flight')return {ready:true,bot:true,t:elapsed,x:round(x,3),y:round(Math.sin(elapsed/830+(seed%11))*.62,3),height:Math.round(ratio*(10500+skill*8500)),hp:Math.max(18,Math.round(100-ratio*(1-skill)*62)),count:0,hits:0};
  if(game==='kale')return {ready:true,bot:true,t:elapsed,x:0,count:Math.floor(ratio*(65+skill*104)),height:0,hits:0,hp:100};
  if(game==='seedrace')return {ready:true,bot:true,t:elapsed,x:round(x,3),count:Math.floor(ratio*(62+skill*82)),height:0,hits:0,hp:100};
  if(game==='ring')return {ready:true,bot:true,t:elapsed,x:round(x,3),hits:Math.min(16,Math.floor(ratio*(9+skill*7))),count:0,height:0,hp:100};
  return {ready:true,bot:true,t:elapsed,x:[-1,0,1][Math.floor(moveRand()*3)],hits:Math.min(12,Math.floor(ratio*(7+skill*5))),count:0,height:0,hp:100};
}
function botRaw(game,seed){
  const r=rand((Number(seed)||1)^0x9e3779b9),skill=.56+r()*.36;
  if(game==='flight')return {durationMs:30000,height:Math.round(10500+skill*9100),collisions:Math.max(0,Math.floor((1-skill)*11+r()*3))};
  if(game==='kale')return {durationMs:10000,taps:Math.round(65+skill*105)};
  if(game==='seedrace')return {durationMs:15000,count:Math.round(60+skill*86)};
  if(game==='ring'){const hits=Math.max(0,Math.min(16,Math.round(8+skill*8)));return {durationMs:20000,hits,misses:16-hits,avgReactionMs:Math.round(500-skill*310)}}
  const hits=Math.max(0,Math.min(12,Math.round(6+skill*6)));return {hits,misses:12-hits,avgReactionMs:Math.round(720-skill*390)};
}
async function loadMatch(sb,userKey,matchId){
  const id=uuid(matchId);if(!id)return null;
  const {data:m,error}=await sb.from('mofumori_arena_matches').select('*').eq('id',id).maybeSingle();
  if(error)throw error;if(!m)return null;
  if(m.player1_key!==userKey&&m.player2_key!==userKey)throw Object.assign(new Error('この対戦には参加できません。'),{status:403});
  const [{data:profiles,error:pe},{data:pets,error:pte}]=await Promise.all([
    sb.from('mofumori_profiles').select('user_key,player_id,display_name,character').in('user_key',[m.player1_key,m.player2_key]),
    sb.from('mofumori_pets').select(PET_SELECT).in('id',[m.pet1_id,m.pet2_id])
  ]);
  if(pe)throw pe;if(pte)throw pte;
  const pm=new Map((profiles||[]).map(x=>[x.user_key,x])),bm=new Map((pets||[]).map(x=>[x.id,x])),side=m.player1_key===userKey?1:2;
  const meKey=userKey,oppKey=side===1?m.player2_key:m.player1_key,meProfile=profile(pm.get(meKey)),oppProfile=profile(pm.get(oppKey));
  const meProgress=side===1?(m.p1_progress||{}):(m.p2_progress||{});
  let oppProgress=side===1?(m.p2_progress||{}):(m.p1_progress||{});
  if(oppProfile?.isBot&&!((side===1?m.p2_score:m.p1_score)!=null))oppProgress={...oppProgress,...syntheticBotProgress(m.game_type,m.seed,m.starts_at,m.status)};
  const meSeen=side===1?m.p1_last_seen_at:m.p2_last_seen_at,oppSeen=side===1?m.p2_last_seen_at:m.p1_last_seen_at;
  const opponentFresh=oppProfile?.isBot===true||(oppSeen&&Date.now()-Date.parse(oppSeen)<2500);
  return {
    id:m.id,gameType:m.game_type,status:m.status,seed:Number(m.seed||0),side,
    startsAt:m.starts_at,expiresAt:m.expires_at,finishedAt:m.finished_at||null,
    winnerPlayerId:m.winner_key?pm.get(m.winner_key)?.player_id||null:null,
    connection:{
      meReady:side===1?!!m.p1_ready_at:!!m.p2_ready_at,
      opponentReady:side===1?!!m.p2_ready_at:!!m.p1_ready_at,
      startLocked:m.handshake_locked===true,
      opponentFresh,
      meLastSeenAt:meSeen||null,
      opponentLastSeenAt:oppSeen||null,
      secure:true
    },
    me:{profile:meProfile,pet:pet(bm.get(side===1?m.pet1_id:m.pet2_id)),score:side===1?m.p1_score:m.p2_score,detail:side===1?m.p1_detail:m.p2_detail,progress:meProgress},
    opponent:{profile:oppProfile,pet:pet(bm.get(side===1?m.pet2_id:m.pet1_id)),score:side===1?m.p2_score:m.p1_score,detail:side===1?m.p2_detail:m.p1_detail,progress:oppProgress}
  };
}
async function dashboard(sb,user){
  const now=new Date().toISOString();
  await sb.from('mofumori_arena_challenges').update({status:'expired',updated_at:now}).eq('status','pending').lt('created_at',new Date(Date.now()-5*60*1000).toISOString());
  await sb.from('mofumori_arena_queue').delete().eq('user_key',user.id).lt('expires_at',now);
  const [{data:pets,error:petErr},{data:q,error:qErr},{data:ch,error:chErr},{data:matches,error:mErr}]=await Promise.all([
    sb.from('mofumori_pets').select(PET_SELECT).eq('owner_key',user.id).order('obtained_at',{ascending:true}).limit(250),
    sb.from('mofumori_arena_queue').select('game_type,pet_id,joined_at,expires_at').eq('user_key',user.id).maybeSingle(),
    sb.from('mofumori_arena_challenges').select('*').eq('status','pending').or(`sender_key.eq.${user.id},recipient_key.eq.${user.id}`).order('created_at',{ascending:false}).limit(50),
    sb.from('mofumori_arena_matches').select('id,status,created_at,expires_at').or(`player1_key.eq.${user.id},player2_key.eq.${user.id}`).in('status',['ready','running']).gt('expires_at',now).order('created_at',{ascending:false}).limit(1)
  ]);
  if(petErr)throw petErr;if(qErr)throw qErr;if(chErr)throw chErr;if(mErr)throw mErr;
  let activeId=matches?.[0]?.id||null,queueState=q?{gameType:q.game_type,petId:q.pet_id,joinedAt:q.joined_at,expiresAt:q.expires_at}:null;
  if(!activeId&&q){
    const {data:poll,error:pollError}=await sb.rpc('mofumori_arena_poll',{p_user:user.id});if(pollError)throw pollError;
    if(poll?.status==='matched'&&poll.matchId){activeId=poll.matchId;queueState=null}
    else if(poll?.status==='queued')queueState={...queueState,waitedMs:Number(poll.waitedMs||0)};
  }
  const otherKeys=[...new Set((ch||[]).map(x=>x.sender_key===user.id?x.recipient_key:x.sender_key))];
  let prof=[];if(otherKeys.length){const {data,error}=await sb.from('mofumori_profiles').select('user_key,player_id,display_name,character').in('user_key',otherKeys);if(error)throw error;prof=data||[]}
  const pm=new Map(prof.map(x=>[x.user_key,x]));
  return {
    serverNow:new Date().toISOString(),pets:(pets||[]).map(pet),queue:queueState,
    challenges:{
      incoming:(ch||[]).filter(x=>x.recipient_key===user.id).map(x=>({id:x.id,gameType:x.game_type,createdAt:x.created_at,player:profile(pm.get(x.sender_key))})),
      outgoing:(ch||[]).filter(x=>x.sender_key===user.id).map(x=>({id:x.id,gameType:x.game_type,createdAt:x.created_at,player:profile(pm.get(x.recipient_key))}))
    },
    activeMatch:activeId?await loadMatch(sb,user.id,activeId):null
  };
}
async function queue(sb,user,payload){
  await takeLimit(sb,user.id,'arena_queue',60,30);
  const p=await ownPet(sb,user.id,payload.petId);
  if(!isBuncho(p.species))throw Object.assign(new Error('オンライン対戦は文鳥で参加してください。'),{status:400});
  const game=GAMES.has(payload.gameType)?payload.gameType:null;if(!game)throw Object.assign(new Error('ゲームを選んでください。'),{status:400});
  const {data,error}=await sb.rpc('mofumori_arena_enqueue',{p_user:user.id,p_pet:p.id,p_game:game});
  if(error){
    const message=String(error.message||'');
    if(message.includes('already_in_match')){
      const now=new Date().toISOString();
      const {data:existing,error:existingError}=await sb.from('mofumori_arena_matches')
        .select('id,starts_at').or(`player1_key.eq.${user.id},player2_key.eq.${user.id}`)
        .in('status',['ready','running']).gt('expires_at',now).order('created_at',{ascending:false}).limit(1).maybeSingle();
      if(existingError)throw existingError;
      if(existing?.id)return{status:'matched',matchId:existing.id,startsAt:existing.starts_at,reused:true};
      throw Object.assign(new Error('対戦状態を再確認してください。'),{status:409});
    }
    throw error;
  }
  return data;
}
async function challenge(sb,user,payload){
  await takeLimit(sb,user.id,'arena_challenge',3600,30);
  const p=await ownPet(sb,user.id,payload.petId);if(!isBuncho(p.species))throw Object.assign(new Error('文鳥を選んでください。'),{status:400});
  const game=GAMES.has(payload.gameType)?payload.gameType:null;if(!game)throw Object.assign(new Error('ゲームを選んでください。'),{status:400});
  const pid=text(payload.playerId,16).toUpperCase();
  const {data:target,error}=await sb.from('mofumori_profiles').select('user_key').eq('player_id',pid).maybeSingle();
  if(error)throw error;if(!target)throw Object.assign(new Error('相手が見つかりません。'),{status:404});
  const {data,error:rpcErr}=await sb.rpc('mofumori_arena_create_challenge',{p_sender:user.id,p_recipient:target.user_key,p_pet:p.id,p_game:game});
  if(rpcErr){const m=String(rpcErr.message);if(m.includes('not_friends'))throw Object.assign(new Error('フレンドにだけ申請できます。'),{status:403});throw rpcErr}
  return {challengeId:data};
}
async function respond(sb,user,payload){
  const cid=uuid(payload.challengeId);if(!cid)throw Object.assign(new Error('申請が不正です。'),{status:400});
  let petId=null;
  if(payload.accept===true){const p=await ownPet(sb,user.id,payload.petId);if(!isBuncho(p.species))throw Object.assign(new Error('文鳥を選んでください。'),{status:400});petId=p.id}
  const {data,error}=await sb.rpc('mofumori_arena_respond_challenge',{p_user:user.id,p_challenge:cid,p_accept:payload.accept===true,p_pet:petId});
  if(error)throw error;return data;
}
async function handshake(sb,user,payload){
  await takeLimit(sb,user.id,'arena_handshake',60,30);
  const m=await loadMatch(sb,user.id,payload.matchId);if(!m)throw Object.assign(new Error('対戦が見つかりません。'),{status:404});
  if(!['ready','running'].includes(m.status))return m;
  const version=text(payload.clientVersion,16),rtt=Math.round(num(payload.rttMs,0,10000,9999));
  if(!/^7\.2(?:\.|$)/.test(version))throw Object.assign(new Error('対戦クライアントを更新してください。'),{status:409});
  if(rtt>2800)throw Object.assign(new Error('通信が不安定です。'),{status:409});
  const side=m.side,readyCol=side===1?'p1_ready_at':'p2_ready_at',seenCol=side===1?'p1_last_seen_at':'p2_last_seen_at',progressCol=side===1?'p1_progress':'p2_progress',now=new Date().toISOString();
  const readyProgress={...(m.me.progress||{}),ready:true,rttMs:rtt,clientVersion:version,t:0,x:0,y:0,hp:100};
  const {error}=await sb.from('mofumori_arena_matches').update({[readyCol]:now,[seenCol]:now,[progressCol]:readyProgress}).eq('id',m.id);if(error)throw error;
  const {error:touchError}=await sb.rpc('mofumori_arena_touch',{p_user:user.id,p_match:m.id});if(touchError)throw touchError;
  return loadMatch(sb,user.id,m.id);
}
async function heartbeat(sb,user,payload){
  await takeLimit(sb,user.id,'arena_heartbeat',60,180);
  const mid=uuid(payload.matchId);if(!mid)throw Object.assign(new Error('対戦が不正です。'),{status:400});
  const {error}=await sb.rpc('mofumori_arena_touch',{p_user:user.id,p_match:mid});if(error)throw error;
  return loadMatch(sb,user.id,mid);
}
async function updateProgress(sb,user,payload){
  await takeLimit(sb,user.id,'arena_progress',60,150);
  const m=await loadMatch(sb,user.id,payload.matchId);if(!m)throw Object.assign(new Error('対戦が見つかりません。'),{status:404});
  if(!['ready','running'].includes(m.status))return m;
  if(!m.connection?.startLocked)throw Object.assign(new Error('接続確認が完了していません。'),{status:409});
  const p=payload.progress&&typeof payload.progress==='object'?payload.progress:{};
  const safe={t:Math.round(num(p.t,0,120000,0)),x:round(num(p.x,-1,1,0),3),y:round(num(p.y,-1,1,0),3),height:round(num(p.height,0,30000,0),0),count:Math.round(num(p.count,0,500,0)),hits:Math.round(num(p.hits,0,50,0)),hp:Math.round(num(p.hp,0,100,100))};
  const col=m.side===1?'p1_progress':'p2_progress',seenCol=m.side===1?'p1_last_seen_at':'p2_last_seen_at',patch={[col]:safe,[seenCol]:new Date().toISOString()};
  if(Date.now()>=Date.parse(m.startsAt))patch.status='running';
  const {error}=await sb.from('mofumori_arena_matches').update(patch).eq('id',m.id);if(error)throw error;return safe;
}
async function finishBotIfNeeded(sb,user,match){
  if(!match?.opponent?.profile?.isBot||match.opponent.score!=null)return;
  const {data:row,error}=await sb.from('mofumori_arena_matches').select('player1_key,player2_key,seed,game_type,pet1_id,pet2_id').eq('id',match.id).single();if(error)throw error;
  const botKey=String(row.player1_key).startsWith('bot:arena:')?row.player1_key:String(row.player2_key).startsWith('bot:arena:')?row.player2_key:null;if(!botKey)return;
  const botPetId=botKey===row.player1_key?row.pet1_id:row.pet2_id;
  const {data:botPet,error:petError}=await sb.from('mofumori_pets').select(PET_SELECT).eq('id',botPetId).single();if(petError)throw petError;
  const raw=botRaw(row.game_type,row.seed),result=calculate(row.game_type,raw,stats(botPet));
  const {error:submitError}=await sb.rpc('mofumori_arena_submit',{p_user:botKey,p_match:match.id,p_score:result.score,p_detail:{...result.detail,bot:true}});if(submitError)throw submitError;
}
async function submit(sb,user,payload){
  await takeLimit(sb,user.id,'arena_submit',60,10);
  const m=await loadMatch(sb,user.id,payload.matchId);if(!m)throw Object.assign(new Error('対戦が見つかりません。'),{status:404});
  if(!['ready','running'].includes(m.status))return m;
  if(!m.connection?.meReady||!m.connection?.opponentReady||!m.connection?.startLocked)throw Object.assign(new Error('接続確認が完了していません。'),{status:409});
  if(m.me.score!=null)return {result:null,match:m,stored:null,reused:true};
  const raw=payload.raw&&typeof payload.raw==='object'?payload.raw:{},startAt=Date.parse(m.startsAt||0),expiresAt=Date.parse(m.expiresAt||0),now=Date.now();
  if(!Number.isFinite(startAt)||startAt<=0||now<startAt)throw Object.assign(new Error('まだ対戦は始まっていません。'),{status:409});
  validateArenaSubmission(m.gameType,raw,{elapsedMs:now-startAt,expired:Number.isFinite(expiresAt)&&expiresAt>0&&now>expiresAt+5000});
  const result=calculate(m.gameType,raw,m.me.pet.stats);
  const {data,error}=await sb.rpc('mofumori_arena_submit',{p_user:user.id,p_match:m.id,p_score:result.score,p_detail:result.detail});if(error)throw error;
  await finishBotIfNeeded(sb,user,m);
  await bestEffortRpc(sb,'mofumori_progress_event',{p_user:user.id,p_event:'battle'});
  return {result,match:await loadMatch(sb,user.id,m.id),stored:data};
}

module.exports=async function handler(req,res){
  if(!allowMethods(req,res,['POST']))return;
  try{
    requireSameOrigin(req);
    const user=await requireUser(req);
    if(!configured())return json(res,503,{ok:false,configured:false,message:'オンライン対戦は準備中です。'});
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    const action=text(body.action,40,'dashboard'),payload=body.payload&&typeof body.payload==='object'?body.payload:{};
    const sb=getSupabase();
    let data=null,extra={};
    if(action==='dashboard')data=await dashboard(sb,user);
    else if(action==='care'){
      await takeLimit(sb,user.id,'pet_care',60,45);
      const p=await ownPet(sb,user.id,payload.petId);
      const care=text(payload.care,16);
      const {data:d,error}=await sb.rpc('mofumori_record_pet_care',{p_owner:user.id,p_pet:p.id,p_action:care});
      if(error)throw error;data=d;
      await bestEffortRpc(sb,'mofumori_progress_event',{p_user:user.id,p_event:'care'});
      if(care==='play'||care==='train')await bestEffortRpc(sb,'mofumori_progress_event',{p_user:user.id,p_event:care});
    }else if(action==='queue'){extra.matchmaking=await queue(sb,user,payload);data=await dashboard(sb,user)}
    else if(action==='cancelQueue'){await sb.from('mofumori_arena_queue').delete().eq('user_key',user.id);data=await dashboard(sb,user)}
    else if(action==='challenge'){extra.challenge=await challenge(sb,user,payload);data=await dashboard(sb,user)}
    else if(action==='respondChallenge'){extra.response=await respond(sb,user,payload);data=await dashboard(sb,user)}
    else if(action==='cancelChallenge'){
      const cid=uuid(payload.challengeId);if(!cid)throw Object.assign(new Error('申請が不正です。'),{status:400});
      const {error}=await sb.from('mofumori_arena_challenges').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',cid).eq('sender_key',user.id).eq('status','pending');if(error)throw error;data=await dashboard(sb,user);
    }else if(action==='match'){data=await loadMatch(sb,user.id,payload.matchId)}
    else if(action==='handshake'){data=await handshake(sb,user,payload)}
    else if(action==='heartbeat'){data=await heartbeat(sb,user,payload)}
    else if(action==='progress'){data=await updateProgress(sb,user,payload)}
    else if(action==='submit'){extra.submission=await submit(sb,user,payload);data=extra.submission.match}
    else if(action==='abandon'){
      const mid=uuid(payload.matchId);if(!mid)throw Object.assign(new Error('対戦が不正です。'),{status:400});
      const {error}=await sb.rpc('mofumori_arena_abandon',{p_user:user.id,p_match:mid});if(error)throw error;data=await loadMatch(sb,user.id,mid);
    }else throw Object.assign(new Error('未対応の操作です。'),{status:400});
    return json(res,200,{ok:true,configured:true,data,serverNow:new Date().toISOString(),...extra});
  }catch(error){
    return json(res,error.status||400,{ok:false,message:error.message||'対戦機能の処理に失敗しました。'});
  }
};
