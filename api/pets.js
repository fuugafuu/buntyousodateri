const crypto = require('node:crypto');
async function bestEffortRpc(sb,name,args){try{const {error}=await sb.rpc(name,args);if(error)console.warn('[mofumori] best-effort RPC failed',name,error.message)}catch(error){console.warn('[mofumori] best-effort RPC exception',name,error?.message||error)}}
const { allowMethods, json, requireUser, requireSameOrigin } = require('../server/auth.cjs');
const { configured, getSupabase } = require('../server/supabase.cjs');

const SPECIES_META = {
  buncho_sakura:['桜文鳥','🐦'], buncho_white:['白文鳥','🕊️'], buncho_cinnamon:['シナモン文鳥','🐤'],
  buncho_silver:['シルバー文鳥','🩶'], canary:['カナリア','🐥'], inko_green:['セキセイインコ','🦜'],
  inko_blue:['青インコ','💙'], buncho_pied:['白黒文鳥','🤍'], buncho_black:['黒文鳥','🖤'],
  finch_zebra:['キンカチョウ','🤎'], lovebird:['コザクラインコ','💚'], cockatiel:['オカメインコ','🧡'],
  owl:['フクロウ','🦉'], cat:['ねこ','🐱'], fox:['きつね','🦊'], penguin:['ペンギン','🐧'], beaver:['ビーバー','🦫'], fuga:['ふうが','🧑‍🎤']
};
const SPECIES = new Set(Object.keys(SPECIES_META));
const SPECIES_WEIGHTS = {
  buncho_sakura:16,buncho_white:14,buncho_cinnamon:11,buncho_silver:9,canary:8,inko_green:7,inko_blue:7,
  buncho_pied:6,buncho_black:5,finch_zebra:5,lovebird:4,cockatiel:4,cat:4,penguin:4,beaver:3,fox:3,owl:2
};
const GACHA_SPECIES = new Set(Object.keys(SPECIES_WEIGHTS));
const RARITY_META = { N:{rank:1}, R:{rank:2}, SR:{rank:3}, SSR:{rank:4}, UR:{rank:5} };
const DEFAULT_GACHA_CONFIG={
  activeBanner:'standard',
  banners:[{id:'standard',name:'森の仲間ガチャ',enabled:true,price1:180,price10:1600,rates:{N:55,R:27,SR:13,SSR:4,UR:1},speciesWeights:{...SPECIES_WEIGHTS}}]
};
const VISIT_ACTIONS = new Set(['greet','pet','play','share_seed']);

function playerIdFor(userKey) {
  return `MF-${crypto.createHash('sha256').update(String(userKey)).digest('hex').slice(0, 10).toUpperCase()}`;
}
function text(value, max, fallback = '') {
  const out = String(value || '').trim().slice(0, max);
  return out || fallback;
}
function uuid(value) {
  const out = String(value || '');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(out) ? out : null;
}
function randomFloat() { return crypto.randomInt(0, 1_000_000) / 1_000_000; }
function normalizeGachaConfig(raw){
  const cfg=raw&&typeof raw==='object'?raw:DEFAULT_GACHA_CONFIG;
  const banners=Array.isArray(cfg.banners)&&cfg.banners.length?cfg.banners:DEFAULT_GACHA_CONFIG.banners;
  return {activeBanner:String(cfg.activeBanner||banners[0].id),banners};
}
async function loadGachaConfig(supabase){
  const {data,error}=await supabase.from('mofumori_game_config').select('value').eq('key','gacha').maybeSingle();
  if(error)throw error;return normalizeGachaConfig(data?.value);
}
function selectBanner(config,rawId){
  const enabled=(config.banners||[]).filter(b=>b&&b.enabled!==false);
  return enabled.find(b=>String(b.id)===String(rawId||''))||enabled.find(b=>String(b.id)===String(config.activeBanner))||enabled[0]||DEFAULT_GACHA_CONFIG.banners[0];
}
function drawRarity(minRarity='N',rates=DEFAULT_GACHA_CONFIG.banners[0].rates){
  const order=['N','R','SR','SSR','UR'],total=order.reduce((s,k)=>s+Math.max(0,Number(rates?.[k]||0)),0)||100;
  let cursor=randomFloat()*total,rarity='N';
  for(const key of order){cursor-=Math.max(0,Number(rates?.[key]||0));if(cursor<=0){rarity=key;break}}
  if(minRarity==='R'&&rarity==='N')rarity='R';
  return rarity;
}
function drawSpecies(allowBeaver=true,weights=SPECIES_WEIGHTS){
  const entries=Object.entries(weights||SPECIES_WEIGHTS).filter(([species,w])=>GACHA_SPECIES.has(species)&&Number(w)>0&&(allowBeaver||species!=='beaver'));
  const safeEntries=entries.length?entries:Object.entries(SPECIES_WEIGHTS).filter(([species])=>allowBeaver||species!=='beaver');
  const total=safeEntries.reduce((sum,[,weight])=>sum+Number(weight),0);
  let cursor=randomFloat()*total;
  for(const [species,weight] of safeEntries){cursor-=Number(weight);if(cursor<=0)return species}
  return 'buncho_sakura';
}
function drawPet(minRarity='N',allowBeaver=true,banner=DEFAULT_GACHA_CONFIG.banners[0]){
  const species=drawSpecies(allowBeaver,banner.speciesWeights),rarity=drawRarity(minRarity,banner.rates),meta=SPECIES_META[species];
  return {species,rarity,rank:RARITY_META[rarity].rank,name:meta[0],source:'gacha'};
}
function petToClient(row) {
  const meta = SPECIES_META[row.species] || SPECIES_META.buncho_sakura;
  const weight = Number(row.weight_g || 24.5), ideal = Number(row.ideal_weight_g || 24.5);
  const stats = row.appetite == null ? null : {
    appetite:Number(row.appetite||0), frame:Number(row.frame||0), metabolism:Number(row.metabolism||0),
    temperament:Number(row.temperament||0), curiosity:Number(row.curiosity||0), sociability:Number(row.sociability||0),
    endurance:Number(row.endurance||0), agility:Number(row.agility||0), flightPower:Number(row.flight_power||0),
    focus:Number(row.focus||0), beakSpeed:Number(row.beak_speed||0), balance:Number(row.balance||0),
    weightG:weight, idealWeightG:ideal, bodyLengthCm:Number(row.body_length_cm||0), wingSpanCm:Number(row.wing_span_cm||0),
    fitness:Number(row.fitness||0), careCounters:row.care_counters||{},
    rating:Number(row.arena_rating||1000), wins:Number(row.arena_wins||0), losses:Number(row.arena_losses||0), draws:Number(row.arena_draws||0)
  };
  return {
    id: row.id, species: row.species, speciesName: meta[0], icon: meta[1],
    name: row.name || meta[0], rarity: row.rarity || 'N', rank: Number(row.rank || 1),
    source: row.source || 'legacy', obtainedAt: row.obtained_at || null,
    sexKnown: row.sex_known === true, sex: row.sex_known === true ? row.sex : null,
    sexDeterminedAt: row.sex_determined_at || null, stats
  };
}
function profileToClient(row, ownKey) {
  return {
    playerId: row.player_id, displayName: row.display_name, score: Number(row.score || 0),
    character: row.character || {}, isMe: row.user_key === ownKey
  };
}
async function takeLimit(supabase, userKey, action, windowSeconds, limit) {
  const { data, error } = await supabase.rpc('mofumori_take_rate_limit', {
    p_user: userKey, p_action: action, p_window_seconds: windowSeconds, p_limit: limit
  });
  if (error) throw error;
  if (data !== true) throw Object.assign(new Error('操作が多すぎます。少し時間をおいてください。'), { status: 429 });
}
async function ensureProfile(supabase, user) {
  const { data: existing, error: existingError } = await supabase.from('mofumori_profiles')
    .select('user_key,player_id,display_name,score,character,active_pet_id').eq('user_key', user.id).maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing;
  const { data: saveRow, error: saveError } = await supabase.from('mofumori_saves').select('state').eq('user_key', user.id).maybeSingle();
  if (saveError) throw saveError;
  const game = saveRow?.state?.data || {};
  const species = SPECIES.has(game.species) ? game.species : 'buncho_sakura';
  const meta = SPECIES_META[species], level = Math.max(1, Math.min(9999, Math.floor(Number(game.level) || 1)));
  const record = {
    user_key: user.id, player_id: playerIdFor(user.id), display_name: text(user.name, 50, 'Googleユーザー'),
    score: 0, character: { name: text(game.name, 12, meta[0]), species, speciesName: meta[0], icon: meta[1], level, bond: Number(game.social?.bond || 0) }
  };
  const { data, error } = await supabase.from('mofumori_profiles').insert(record)
    .select('user_key,player_id,display_name,score,character,active_pet_id').single();
  if (error) throw error;
  return data;
}
async function ensureLegacyPets(supabase, user) {
  const { data: profile, error: profileError } = await supabase.from('mofumori_profiles')
    .select('pets_migrated_at').eq('user_key', user.id).single();
  if (profileError) throw profileError;
  if (profile?.pets_migrated_at) return;

  const { data: saveRow, error: saveError } = await supabase.from('mofumori_saves').select('state').eq('user_key', user.id).maybeSingle();
  if (saveError) throw saveError;
  const game = saveRow?.state?.data || {};
  const unlocked = Array.isArray(game.unlocked) ? game.unlocked.filter(id => SPECIES.has(id)) : [];
  const speciesList = [...new Set(unlocked.length ? unlocked : [SPECIES.has(game.species) ? game.species : 'buncho_sakura'])].slice(0, 30);
  const rows = speciesList.map(species => {
    const meta = SPECIES_META[species];
    return {
      owner_key: user.id, species, rarity: 'N', rank: 1, source: 'legacy',
      migration_key: `legacy:${species}`, name: text(game.birdNames?.[species], 12, meta[0])
    };
  });
  if (rows.length) {
    const { error } = await supabase.from('mofumori_pets').upsert(rows, { onConflict: 'owner_key,migration_key', ignoreDuplicates: true });
    if (error) throw error;
  }
  const { error: migratedError } = await supabase.from('mofumori_profiles')
    .update({ pets_migrated_at: new Date().toISOString() }).eq('user_key', user.id);
  if (migratedError) throw migratedError;
}
async function ensureHiddenReward(supabase, user) {
  const { data: existing, error: existingError } = await supabase.from('mofumori_pets')
    .select('id').eq('owner_key', user.id).eq('species', 'fuga').limit(1);
  if (existingError) throw existingError;
  if (existing?.length) return false;

  const { data: owned, error: ownedError } = await supabase.from('mofumori_pets')
    .select('species').eq('owner_key', user.id);
  if (ownedError) throw ownedError;
  const ownedSpecies = new Set((owned || []).map(row => row.species));
  if (![...GACHA_SPECIES].every(species => ownedSpecies.has(species))) return false;

  const { error } = await supabase.from('mofumori_pets').upsert({
    owner_key: user.id,
    species: 'fuga',
    rarity: 'UR',
    rank: 5,
    name: SPECIES_META.fuga[0],
    source: 'reward',
    migration_key: 'reward:fuga'
  }, { onConflict: 'owner_key,migration_key', ignoreDuplicates: true });
  if (error) throw error;
  return true;
}
async function loadDashboard(supabase, user) {
  await ensureLegacyPets(supabase, user);
  const hiddenUnlocked = await ensureHiddenReward(supabase, user);
  const now = new Date().toISOString();
  const [{ data: pets, error: petError }, { data: links, error: linkError }, { data: requests, error: requestError }, { data: visits, error: visitError }] = await Promise.all([
    supabase.from('mofumori_pets').select('id,owner_key,species,rarity,rank,name,source,obtained_at,sex,sex_known,sex_determined_at,appetite,frame,metabolism,temperament,curiosity,sociability,endurance,agility,flight_power,focus,beak_speed,balance,weight_g,ideal_weight_g,body_length_cm,wing_span_cm,fitness,care_counters,arena_rating,arena_wins,arena_losses,arena_draws').eq('owner_key', user.id).order('obtained_at', { ascending: true }).limit(250),
    supabase.from('mofumori_friendships').select('friend_key').eq('owner_key', user.id).limit(200),
    supabase.from('mofumori_friend_requests').select('id,sender_key,recipient_key,status,created_at').eq('status', 'pending')
      .or(`sender_key.eq.${user.id},recipient_key.eq.${user.id}`).order('created_at', { ascending: false }).limit(100),
    supabase.from('mofumori_visits').select('id,host_key,visitor_key,pet_id,started_at,expires_at,ended_at,last_action,interaction_count')
      .is('ended_at', null).gt('expires_at', now).or(`host_key.eq.${user.id},visitor_key.eq.${user.id}`)
      .order('started_at', { ascending: false }).limit(100)
  ]);
  if (petError) throw petError;
  if (linkError) throw linkError;
  if (requestError) throw requestError;
  if (visitError) throw visitError;

  const friendKeys = (links || []).map(row => row.friend_key);
  const requestKeys = (requests || []).flatMap(row => [row.sender_key, row.recipient_key]);
  const visitKeys = (visits || []).flatMap(row => [row.host_key, row.visitor_key]);
  const profileKeys = [...new Set([...friendKeys, ...requestKeys, ...visitKeys, user.id])];
  let profiles = [];
  if (profileKeys.length) {
    const { data, error } = await supabase.from('mofumori_profiles')
      .select('user_key,player_id,display_name,score,character,active_pet_id').in('user_key', profileKeys);
    if (error) throw error;
    profiles = data || [];
  }
  const profileMap = new Map(profiles.map(row => [row.user_key, row]));
  const visitPetIds = [...new Set((visits || []).map(row => row.pet_id).filter(Boolean))];
  let visitPets = [];
  if (visitPetIds.length) {
    const { data, error } = await supabase.from('mofumori_pets')
      .select('id,owner_key,species,rarity,rank,name,source,obtained_at,sex,sex_known,sex_determined_at,appetite,frame,metabolism,temperament,curiosity,sociability,endurance,agility,flight_power,focus,beak_speed,balance,weight_g,ideal_weight_g,body_length_cm,wing_span_cm,fitness,care_counters,arena_rating,arena_wins,arena_losses,arena_draws').in('id', visitPetIds);
    if (error) throw error;
    visitPets = data || [];
  }
  const visitPetMap = new Map(visitPets.map(row => [row.id, row]));
  const ownProfile = profileMap.get(user.id) || await ensureProfile(supabase, user);

  const gachaConfig=await loadGachaConfig(supabase);
  return {
    playerId: ownProfile.player_id,
    gachaConfig,
    newUnlocks: hiddenUnlocked ? ['fuga'] : [],
    pets: (pets || []).map(petToClient),
    friends: friendKeys.map(key => profileMap.get(key)).filter(Boolean).map(row => profileToClient(row, user.id)),
    requests: {
      incoming: (requests || []).filter(row => row.recipient_key === user.id).map(row => ({
        id: row.id, player: profileToClient(profileMap.get(row.sender_key) || {}, user.id), createdAt: row.created_at
      })),
      outgoing: (requests || []).filter(row => row.sender_key === user.id).map(row => ({
        id: row.id, player: profileToClient(profileMap.get(row.recipient_key) || {}, user.id), createdAt: row.created_at
      }))
    },
    visits: {
      incoming: (visits || []).filter(row => row.host_key === user.id).map(row => ({
        id: row.id, direction: 'incoming', owner: profileToClient(profileMap.get(row.visitor_key) || {}, user.id),
        pet: visitPetMap.get(row.pet_id) ? petToClient(visitPetMap.get(row.pet_id)) : null,
        startedAt: row.started_at, expiresAt: row.expires_at, lastAction: row.last_action || null, interactionCount: Number(row.interaction_count || 0)
      })),
      outgoing: (visits || []).filter(row => row.visitor_key === user.id).map(row => ({
        id: row.id, direction: 'outgoing', host: profileToClient(profileMap.get(row.host_key) || {}, user.id),
        pet: visitPetMap.get(row.pet_id) ? petToClient(visitPetMap.get(row.pet_id)) : null,
        startedAt: row.started_at, expiresAt: row.expires_at, lastAction: row.last_action || null, interactionCount: Number(row.interaction_count || 0)
      }))
    }
  };
}
async function gacha(supabase,user,count,bannerId) {
  const rolls=count===10?10:1;
  await takeLimit(supabase,user.id,'gacha',60,12);
  const config=await loadGachaConfig(supabase),banner=selectBanner(config,bannerId);
  if(!banner||banner.enabled===false)throw Object.assign(new Error('このガチャは現在利用できません。'),{status:400});
  const cost=rolls===10?Math.round(Number(banner.price10||0)):Math.round(Number(banner.price1||0));
  const {data:progress,error:progressError}=await supabase.from('mofumori_profiles').select('forest_xp').eq('user_key',user.id).single();
  if(progressError)throw progressError;
  const forestLevel=Math.floor(Math.sqrt(Math.max(0,Number(progress?.forest_xp)||0)/75))+1;
  const results=Array.from({length:rolls},(_,index)=>drawPet(rolls===10&&index===9?'R':'N',forestLevel>=3,banner));
  const {data,error}=await supabase.rpc('mofumori_award_gacha',{p_owner:user.id,p_cost:cost,p_pets:results});
  if(error){
    if(String(error.message).includes('not_enough_coins'))throw Object.assign(new Error('コインが足りません。'),{status:400});
    throw error;
  }
  await bestEffortRpc(supabase,'mofumori_progress_event',{p_user:user.id,p_event:'gacha'});
  return {bannerId:banner.id,results:(data?.pets||[]).map(petToClient),gameState:data?.state?.data||null};
}
async function sendFriendRequest(supabase, user, rawPlayerId) {
  await takeLimit(supabase, user.id, 'friend_request', 3600, 20);
  const playerId = text(rawPlayerId, 16).toUpperCase();
  if (!/^MF-[A-Z0-9]{8,12}$/.test(playerId)) throw Object.assign(new Error('プレイヤーIDの形式が正しくありません。'), { status: 400 });
  const { data: target, error } = await supabase.from('mofumori_profiles').select('user_key,player_id').eq('player_id', playerId).maybeSingle();
  if (error) throw error;
  if (!target || String(target.user_key || '').startsWith('bot:arena:')) throw Object.assign(new Error('そのプレイヤーは見つかりません。'), { status: 404 });
  if (target.user_key === user.id) throw Object.assign(new Error('自分自身には申請できません。'), { status: 400 });
  const { data: linked, error: linkedError } = await supabase.from('mofumori_friendships').select('friend_key')
    .eq('owner_key', user.id).eq('friend_key', target.user_key).maybeSingle();
  if (linkedError) throw linkedError;
  if (linked) throw Object.assign(new Error('すでにフレンドです。'), { status: 400 });

  const [{ data: same, error: sameError }, { data: reverse, error: reverseError }] = await Promise.all([
    supabase.from('mofumori_friend_requests').select('id').eq('sender_key', user.id).eq('recipient_key', target.user_key).eq('status', 'pending').maybeSingle(),
    supabase.from('mofumori_friend_requests').select('id').eq('sender_key', target.user_key).eq('recipient_key', user.id).eq('status', 'pending').maybeSingle()
  ]);
  if (sameError) throw sameError;
  if (reverseError) throw reverseError;
  if (same) throw Object.assign(new Error('すでに申請中です。'), { status: 400 });
  if (reverse) {
    const { error: acceptError } = await supabase.rpc('mofumori_respond_friend_request', { p_user: user.id, p_request: reverse.id, p_accept: true });
    if (acceptError) throw acceptError;
    return { autoAccepted: true };
  }
  const { error: insertError } = await supabase.from('mofumori_friend_requests').insert({ sender_key: user.id, recipient_key: target.user_key });
  if (insertError) throw insertError;
  return { autoAccepted: false };
}
async function respondFriendRequest(supabase, user, requestId, accept) {
  const id = uuid(requestId);
  if (!id) throw Object.assign(new Error('フレンド申請が不正です。'), { status: 400 });
  const { error } = await supabase.rpc('mofumori_respond_friend_request', { p_user: user.id, p_request: id, p_accept: accept === true });
  if (error) {
    if (String(error.message).includes('request_missing')) throw Object.assign(new Error('申請は見つからないか処理済みです。'), { status: 404 });
    throw error;
  }
}
async function removeFriend(supabase, user, rawPlayerId) {
  const playerId = text(rawPlayerId, 16).toUpperCase();
  const { data: target, error } = await supabase.from('mofumori_profiles').select('user_key').eq('player_id', playerId).maybeSingle();
  if (error) throw error;
  if (!target) throw Object.assign(new Error('フレンドが見つかりません。'), { status: 404 });
  const { error: rpcError } = await supabase.rpc('mofumori_remove_friend', { p_user: user.id, p_friend: target.user_key });
  if (rpcError) throw rpcError;
}
async function selectPet(supabase, user, rawPetId) {
  const petId = uuid(rawPetId);
  if (!petId) throw Object.assign(new Error('どうぶつIDが不正です。'), { status: 400 });
  const { data: pet, error } = await supabase.from('mofumori_pets').select('id,species,rarity,rank,name').eq('id', petId).eq('owner_key', user.id).maybeSingle();
  if (error) throw error;
  if (!pet) throw Object.assign(new Error('その子はあなたのどうぶつではありません。'), { status: 403 });
  const meta = SPECIES_META[pet.species] || SPECIES_META.buncho_sakura;
  const { data: profile, error: profileError } = await supabase.from('mofumori_profiles').select('character').eq('user_key', user.id).single();
  if (profileError) throw profileError;
  const character = { ...(profile.character || {}), name: pet.name, species: pet.species, speciesName: meta[0], icon: meta[1], rarity: pet.rarity, rank: pet.rank };
  const { error: updateError } = await supabase.from('mofumori_profiles').update({ active_pet_id: pet.id, character, updated_at: new Date().toISOString() }).eq('user_key', user.id);
  if (updateError) throw updateError;
  return petToClient({ ...pet, source: 'gacha', obtained_at: null });
}
async function renamePet(supabase, user, rawPetId, rawName) {
  const petId = uuid(rawPetId), name = text(rawName, 12);
  if (!petId || !name) throw Object.assign(new Error('名前が不正です。'), { status: 400 });
  const { data: pet, error } = await supabase.from('mofumori_pets').update({ name }).eq('id', petId).eq('owner_key', user.id)
    .select('id,species,rarity,rank,name,source,obtained_at,sex,sex_known,sex_determined_at,appetite,frame,metabolism,temperament,curiosity,sociability,endurance,agility,flight_power,focus,beak_speed,balance,weight_g,ideal_weight_g,body_length_cm,wing_span_cm,fitness,care_counters,arena_rating,arena_wins,arena_losses,arena_draws').maybeSingle();
  if (error) throw error;
  if (!pet) throw Object.assign(new Error('その子の名前は変更できません。'), { status: 403 });
  return petToClient(pet);
}
async function determinePetSex(supabase, user, rawPetId) {
  const petId = uuid(rawPetId);
  if (!petId) throw Object.assign(new Error('どうぶつIDが不正です。'), { status: 400 });
  const { data, error } = await supabase.rpc('mofumori_determine_pet_sex', { p_owner: user.id, p_pet: petId });
  if (error) throw error;
  return data;
}
async function startVisit(supabase, user, rawPlayerId, rawPetId) {
  await takeLimit(supabase, user.id, 'start_visit', 3600, 30);
  const playerId = text(rawPlayerId, 16).toUpperCase(), petId = uuid(rawPetId);
  if (!petId) throw Object.assign(new Error('連れていくどうぶつを選んでください。'), { status: 400 });
  const { data: target, error } = await supabase.from('mofumori_profiles').select('user_key').eq('player_id', playerId).maybeSingle();
  if (error) throw error;
  if (!target) throw Object.assign(new Error('フレンドが見つかりません。'), { status: 404 });
  const { data, error: rpcError } = await supabase.rpc('mofumori_start_visit', { p_visitor: user.id, p_host: target.user_key, p_pet: petId });
  if (rpcError) {
    const message = String(rpcError.message);
    if (message.includes('not_friends')) throw Object.assign(new Error('フレンドだけ訪問できます。'), { status: 403 });
    if (message.includes('pet_busy')) throw Object.assign(new Error('その子はすでにお出かけ中です。'), { status: 400 });
    throw rpcError;
  }
  await bestEffortRpc(supabase,'mofumori_progress_event',{p_user:user.id,p_event:'visit'});
  return data;
}
async function endVisit(supabase, user, rawVisitId) {
  const visitId = uuid(rawVisitId);
  if (!visitId) throw Object.assign(new Error('訪問情報が不正です。'), { status: 400 });
  const { error } = await supabase.rpc('mofumori_end_visit', { p_user: user.id, p_visit: visitId });
  if (error) throw error;
}
async function interactVisit(supabase, user, rawVisitId, rawAction) {
  await takeLimit(supabase, user.id, 'visit_interaction', 60, 30);
  const visitId = uuid(rawVisitId), action = text(rawAction, 20);
  if (!visitId || !VISIT_ACTIONS.has(action)) throw Object.assign(new Error('交流内容が不正です。'), { status: 400 });
  const { data, error } = await supabase.rpc('mofumori_visit_interaction', { p_user: user.id, p_visit: visitId, p_action: action });
  if (error) {
    if (String(error.message).includes('visit_forbidden')) throw Object.assign(new Error('この訪問には参加できません。'), { status: 403 });
    throw error;
  }
  return data;
}

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    requireSameOrigin(req);
    const user = await requireUser(req);
    if (!configured()) return json(res, 503, { ok: false, configured: false, message: 'オンライン機能は準備中です。端末モードで遊べます。' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!body || typeof body !== 'object') throw Object.assign(new Error('リクエストが不正です。'), { status: 400 });
    const action = text(body.action, 40, 'dashboard'), payload = body.payload && typeof body.payload === 'object' ? body.payload : {};
    const supabase = getSupabase();
    await ensureProfile(supabase, user);
    let extra = {};
    if (action === 'gacha') extra = await gacha(supabase,user,Number(payload.count)===10?10:1,payload.bannerId);
    else if (action === 'sendFriendRequest') extra = await sendFriendRequest(supabase, user, payload.playerId);
    else if (action === 'respondFriendRequest') await respondFriendRequest(supabase, user, payload.requestId, payload.accept === true);
    else if (action === 'removeFriend') await removeFriend(supabase, user, payload.playerId);
    else if (action === 'selectPet') extra.selectedPet = await selectPet(supabase, user, payload.petId);
    else if (action === 'renamePet') extra.renamedPet = await renamePet(supabase, user, payload.petId, payload.name);
    else if (action === 'determinePetSex') extra.sexResult = await determinePetSex(supabase, user, payload.petId);
    else if (action === 'startVisit') extra.visit = await startVisit(supabase, user, payload.playerId, payload.petId);
    else if (action === 'endVisit') await endVisit(supabase, user, payload.visitId);
    else if (action === 'interactVisit') extra.interaction = await interactVisit(supabase, user, payload.visitId, payload.interaction);
    else if (action !== 'dashboard') throw Object.assign(new Error('未対応の操作です。'), { status: 400 });
    return json(res, 200, { ok: true, configured: true, data: await loadDashboard(supabase, user), ...extra });
  } catch (error) {
    return json(res, error.status || 400, { ok: false, message: error.message || 'オンライン機能の処理に失敗しました。' });
  }
};