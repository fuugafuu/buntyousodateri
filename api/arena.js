const { allowMethods, json, requireUser, requireSameOrigin } = require('../server/auth.cjs');
const { configured, getSupabase } = require('../server/supabase.cjs');

const GAMES = new Set(['flight','kale','perch']);
const PET_SELECT = [
  'id','owner_key','species','rarity','rank','name','source','obtained_at',
  'appetite','frame','metabolism','temperament','curiosity','sociability',
  'endurance','agility','flight_power','focus','beak_speed','balance',
  'weight_g','ideal_weight_g','body_length_cm','wing_span_cm','fitness',
  'care_counters','arena_rating','arena_wins','arena_losses','arena_draws'
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
  source:row.source,obtainedAt:row.obtained_at,eligible:isBuncho(row.species),stats:stats(row)
}:null}
function profile(row){return row?{playerId:row.player_id,displayName:row.display_name,character:row.character||{}}:null}
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
  const pm=new Map((profiles||[]).map(x=>[x.user_key,x])),bm=new Map((pets||[]).map(x=>[x.id,x]));
  const side=m.player1_key===userKey?1:2;
  return {
    id:m.id,gameType:m.game_type,status:m.status,seed:Number(m.seed||0),side,
    startsAt:m.starts_at,expiresAt:m.expires_at,finishedAt:m.finished_at||null,
    winnerPlayerId:m.winner_key?pm.get(m.winner_key)?.player_id||null:null,
    me:{
      profile:profile(pm.get(userKey)),pet:pet(bm.get(side===1?m.pet1_id:m.pet2_id)),
      score:side===1?m.p1_score:m.p2_score,detail:side===1?m.p1_detail:m.p2_detail,
      progress:side===1?(m.p1_progress||{}):(m.p2_progress||{})
    },
    opponent:{
      profile:profile(pm.get(side===1?m.player2_key:m.player1_key)),
      pet:pet(bm.get(side===1?m.pet2_id:m.pet1_id)),
      score:side===1?m.p2_score:m.p1_score,detail:side===1?m.p2_detail:m.p1_detail,
      progress:side===1?(m.p2_progress||{}):(m.p1_progress||{})
    }
  };
}
async function dashboard(sb,user){
  const now=new Date().toISOString();
  await sb.from('mofumori_arena_challenges').update({status:'expired',updated_at:now})
    .eq('status','pending').lt('created_at',new Date(Date.now()-5*60*1000).toISOString());
  await sb.from('mofumori_arena_queue').delete().eq('user_key',user.id).lt('expires_at',now);
  const [{data:pets,error:petErr},{data:q,error:qErr},{data:ch,error:chErr},{data:matches,error:mErr}]=await Promise.all([
    sb.from('mofumori_pets').select(PET_SELECT).eq('owner_key',user.id).order('obtained_at',{ascending:true}).limit(250),
    sb.from('mofumori_arena_queue').select('game_type,pet_id,joined_at,expires_at').eq('user_key',user.id).maybeSingle(),
    sb.from('mofumori_arena_challenges').select('*').eq('status','pending').or(`sender_key.eq.${user.id},recipient_key.eq.${user.id}`).order('created_at',{ascending:false}).limit(50),
    sb.from('mofumori_arena_matches').select('id,status,created_at,expires_at').or(`player1_key.eq.${user.id},player2_key.eq.${user.id}`).in('status',['ready','running']).gt('expires_at',now).order('created_at',{ascending:false}).limit(1)
  ]);
  if(petErr)throw petErr;if(qErr)throw qErr;if(chErr)throw chErr;if(mErr)throw mErr;
  const otherKeys=[...new Set((ch||[]).map(x=>x.sender_key===user.id?x.recipient_key:x.sender_key))];
  let prof=[];
  if(otherKeys.length){const {data,error}=await sb.from('mofumori_profiles').select('user_key,player_id,display_name,character').in('user_key',otherKeys);if(error)throw error;prof=data||[]}
  const pm=new Map(prof.map(x=>[x.user_key,x]));
  return {
    serverNow:new Date().toISOString(),
    pets:(pets||[]).map(pet),
    queue:q?{gameType:q.game_type,petId:q.pet_id,joinedAt:q.joined_at,expiresAt:q.expires_at}:null,
    challenges:{
      incoming:(ch||[]).filter(x=>x.recipient_key===user.id).map(x=>({id:x.id,gameType:x.game_type,createdAt:x.created_at,player:profile(pm.get(x.sender_key))})),
      outgoing:(ch||[]).filter(x=>x.sender_key===user.id).map(x=>({id:x.id,gameType:x.game_type,createdAt:x.created_at,player:profile(pm.get(x.recipient_key))}))
    },
    activeMatch:matches?.[0]?await loadMatch(sb,user.id,matches[0].id):null
  };
}
function calculate(game,raw,s){
  if(game==='flight'){
    const duration=num(raw?.durationMs,5000,36000,30000);
    const maxHeight=duration*.72;
    const height=num(raw?.height,0,maxHeight,0),collisions=Math.round(num(raw?.collisions,0,60,0));
    const weightFit=1-Math.min(Math.abs(s.weightG-s.idealWeightG)/Math.max(1,s.idealWeightG),.35);
    const modifier=.50+s.flightPower/260+s.endurance/360+s.agility/520+s.fitness/700+weightFit*.12;
    return {score:Math.max(0,Math.round(Math.max(0,height-collisions*160)*modifier)),detail:{height:round(height,0),collisions,durationMs:Math.round(duration),modifier:round(modifier,3),weightFit:round(weightFit,3)}};
  }
  if(game==='kale'){
    const duration=num(raw?.durationMs,8000,15000,10000),maxTaps=Math.floor(duration/55);
    const taps=Math.round(num(raw?.taps,0,maxTaps,0));
    const modifier=.50+s.appetite/220+s.beakSpeed/300+s.focus/500+s.fitness/850;
    return {score:Math.max(0,Math.round(taps*100*modifier)),detail:{taps,durationMs:Math.round(duration),modifier:round(modifier,3),maxTaps}};
  }
  const hits=Math.round(num(raw?.hits,0,24,0)),misses=Math.round(num(raw?.misses,0,24,0));
  const avgReaction=num(raw?.avgReactionMs,80,2000,1200);
  const base=Math.max(0,hits*100-misses*30-avgReaction*.12);
  const modifier=.55+s.agility/300+s.balance/280+s.focus/450+s.temperament/900-Math.max(0,s.frame-70)/1200;
  return {score:Math.max(0,Math.round(base*modifier)),detail:{hits,misses,avgReactionMs:round(avgReaction,0),modifier:round(modifier,3)}};
}
async function queue(sb,user,payload){
  await takeLimit(sb,user.id,'arena_queue',60,30);
  const p=await ownPet(sb,user.id,payload.petId);
  if(!isBuncho(p.species))throw Object.assign(new Error('オンライン対戦は文鳥で参加してください。'),{status:400});
  const game=GAMES.has(payload.gameType)?payload.gameType:null;if(!game)throw Object.assign(new Error('ゲームを選んでください。'),{status:400});
  const {data,error}=await sb.rpc('mofumori_arena_enqueue',{p_user:user.id,p_pet:p.id,p_game:game});
  if(error){const m=String(error.message);if(m.includes('already_in_match'))throw Object.assign(new Error('すでに対戦中です。'),{status:409});throw error}
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
async function updateProgress(sb,user,payload){
  await takeLimit(sb,user.id,'arena_progress',60,120);
  const m=await loadMatch(sb,user.id,payload.matchId);if(!m)throw Object.assign(new Error('対戦が見つかりません。'),{status:404});
  if(!['ready','running'].includes(m.status))return m;
  const p=payload.progress&&typeof payload.progress==='object'?payload.progress:{};
  const safe={t:Math.round(num(p.t,0,120000,0)),x:round(num(p.x,-1,1,0),3),height:round(num(p.height,0,30000,0),0),count:Math.round(num(p.count,0,500,0)),hits:Math.round(num(p.hits,0,50,0))};
  const col=m.side===1?'p1_progress':'p2_progress';
  const patch={[col]:safe};
  if(Date.now()>=Date.parse(m.startsAt))patch.status='running';
  const {error}=await sb.from('mofumori_arena_matches').update(patch).eq('id',m.id);if(error)throw error;
  return safe;
}
async function submit(sb,user,payload){
  await takeLimit(sb,user.id,'arena_submit',60,10);
  const m=await loadMatch(sb,user.id,payload.matchId);if(!m)throw Object.assign(new Error('対戦が見つかりません。'),{status:404});
  if(!['ready','running'].includes(m.status))return m;
  const result=calculate(m.gameType,payload.raw||{},m.me.pet.stats);
  const {data,error}=await sb.rpc('mofumori_arena_submit',{p_user:user.id,p_match:m.id,p_score:result.score,p_detail:result.detail});
  if(error)throw error;
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
    }else if(action==='queue'){extra.matchmaking=await queue(sb,user,payload);data=await dashboard(sb,user)}
    else if(action==='cancelQueue'){await sb.from('mofumori_arena_queue').delete().eq('user_key',user.id);data=await dashboard(sb,user)}
    else if(action==='challenge'){extra.challenge=await challenge(sb,user,payload);data=await dashboard(sb,user)}
    else if(action==='respondChallenge'){extra.response=await respond(sb,user,payload);data=await dashboard(sb,user)}
    else if(action==='cancelChallenge'){
      const cid=uuid(payload.challengeId);if(!cid)throw Object.assign(new Error('申請が不正です。'),{status:400});
      const {error}=await sb.from('mofumori_arena_challenges').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',cid).eq('sender_key',user.id).eq('status','pending');if(error)throw error;data=await dashboard(sb,user);
    }else if(action==='match'){data=await loadMatch(sb,user.id,payload.matchId)}
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
