const crypto = require('node:crypto');
const { allowMethods, json, requireUser, requireSameOrigin } = require('../server/auth.cjs');
const { configured, getSupabase } = require('../server/supabase.cjs');

const ITEM_CODES = new Set(['seeds','treats','fruits','premium_food','energy_drink','vitamins','medicine','cold_medicine','shampoo','toys','super_energy','mirror','bell','swing','sleep_box']);
const SPECIES = new Set(['buncho_sakura','buncho_white','buncho_cinnamon','buncho_silver','canary','inko_green','inko_blue','buncho_pied','buncho_black','finch_zebra','lovebird','cockatiel','owl','cat','fox','penguin','fuga']);
const SPECIES_META = {
  buncho_sakura:['桜文鳥','🐦'],buncho_white:['白文鳥','🕊️'],buncho_cinnamon:['シナモン','🐤'],buncho_silver:['シルバー','🪿'],canary:['カナリア','🐥'],
  inko_green:['セキセイインコ','🦜'],inko_blue:['青インコ','💙'],buncho_pied:['白黒文鳥','🤍'],buncho_black:['黒文鳥','🖤'],finch_zebra:['キンカチョウ','🤎'],
  lovebird:['コザクラインコ','💚'],cockatiel:['オカメインコ','🧡'],owl:['フクロウ','🦉'],cat:['ねこ','🐱'],fox:['きつね','🦊'],penguin:['ペンギン','🐧'],fuga:['ふうが','🧑‍🎤']
};

function playerIdFor(userKey) {
  return `MF-${crypto.createHash('sha256').update(String(userKey)).digest('hex').slice(0, 8).toUpperCase()}`;
}
function text(value, max, fallback = '') { const out = String(value || '').trim().slice(0, max); return out || fallback; }
function integer(value, min, max, fallback = min) { const number = Number(value); return Number.isFinite(number) ? Math.floor(Math.max(min, Math.min(max, number))) : fallback; }
function cleanSnapshot(user, input, savedGame) {
  const source = input && typeof input === 'object' ? input : {};
  const character = source.character && typeof source.character === 'object' ? source.character : {}, game = savedGame && typeof savedGame === 'object' ? savedGame : {};
  const species = SPECIES.has(game.species) ? game.species : (SPECIES.has(character.species) ? character.species : 'buncho_sakura');
  const level = integer(game.level, 1, 9999, 1), bond = integer(game.social?.bond, 0, 1000000000, 0), completed = integer(game.missions?.completed, 0, 1000000000, 0);
  const best = Object.values(game.minigameStats?.bestScores || {}).reduce((sum, value) => sum + Math.min(500, integer(value, 0, 1000000000, 0)), 0);
  const unlockedCount = Array.isArray(game.unlocked) ? Math.min(SPECIES.size, game.unlocked.filter(id => SPECIES.has(id)).length) : 1;
  const score = level * 250 + completed * 80 + bond * 3 + best + unlockedCount * 120;
  const meta = SPECIES_META[species] || SPECIES_META.buncho_sakura;
  return {
    displayName: text(user.name, 50, 'Googleユーザー'),
    score: integer(score, 0, 1000000000, 0),
    character: {
      name: text(game.birdNames?.[species] || game.name || character.name, 12, 'どうぶつ'), species,
      speciesName: meta[0], icon: meta[1], level, bond
    }
  };
}
function profileToClient(row, ownKey) {
  return { playerId: row.player_id, displayName: row.display_name, score: Number(row.score || 0), character: row.character || {}, isMe: row.user_key === ownKey };
}
function giftToClient(row) {
  return { id: row.id, senderName: row.sender_name || 'フレンド', itemCode: row.item_code, quantity: Number(row.quantity || 1), claimedAt: row.claimed_at, createdAt: row.created_at };
}
async function syncProfile(supabase, user, snapshot) {
  const { data: saveRow, error: saveError } = await supabase.from('mofumori_saves').select('state').eq('user_key', user.id).maybeSingle();
  if (saveError) throw saveError;
  const clean = cleanSnapshot(user, snapshot, saveRow?.state?.data);
  const record = { user_key: user.id, player_id: playerIdFor(user.id), display_name: clean.displayName, score: clean.score, character: clean.character, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('mofumori_profiles').upsert(record, { onConflict: 'user_key' });
  if (error) throw error;
  return record;
}
async function dashboard(supabase, user, ownProfile) {
  const [{ data: links, error: linkError }, { data: ranks, error: rankError }, { data: gifts, error: giftError }] = await Promise.all([
    supabase.from('mofumori_friendships').select('friend_key').eq('owner_key', user.id).limit(100),
    supabase.from('mofumori_profiles').select('user_key,player_id,display_name,score,character').order('score', { ascending: false }).limit(50),
    supabase.from('mofumori_gifts').select('id,sender_key,item_code,quantity,claimed_at,created_at').eq('recipient_key', user.id).order('created_at', { ascending: false }).limit(100)
  ]);
  if (linkError) throw linkError; if (rankError) throw rankError; if (giftError) throw giftError;
  const friendKeys = (links || []).map(row => row.friend_key);
  let friendProfiles = [];
  if (friendKeys.length) {
    const { data, error } = await supabase.from('mofumori_profiles').select('user_key,player_id,display_name,score,character').in('user_key', friendKeys);
    if (error) throw error; friendProfiles = data || [];
  }
  const senderKeys = [...new Set((gifts || []).map(row => row.sender_key))];
  let senderNames = new Map();
  if (senderKeys.length) {
    const { data, error } = await supabase.from('mofumori_profiles').select('user_key,display_name').in('user_key', senderKeys);
    if (error) throw error; senderNames = new Map((data || []).map(row => [row.user_key, row.display_name]));
  }
  return {
    playerId: ownProfile.player_id,
    friends: friendProfiles.map(row => profileToClient(row, user.id)),
    ranking: (ranks || []).map(row => profileToClient(row, user.id)),
    gifts: (gifts || []).map(row => giftToClient({ ...row, sender_name: senderNames.get(row.sender_key) }))
  };
}
async function addFriend(supabase, user, playerId) {
  const cleanId = text(playerId, 16).toUpperCase();
  if (!/^MF-[A-Z0-9]{8}$/.test(cleanId)) throw Object.assign(new Error('プレイヤーIDの形式が正しくありません。'), { status: 400 });
  const { data: target, error } = await supabase.from('mofumori_profiles').select('user_key,player_id').eq('player_id', cleanId).maybeSingle();
  if (error) throw error;
  if (!target) throw Object.assign(new Error('そのプレイヤーはまだ見つかりません。'), { status: 404 });
  if (target.user_key === user.id) throw Object.assign(new Error('自分自身は追加できません。'), { status: 400 });
  const { error: insertError } = await supabase.from('mofumori_friendships').upsert([
    { owner_key: user.id, friend_key: target.user_key }, { owner_key: target.user_key, friend_key: user.id }
  ], { onConflict: 'owner_key,friend_key', ignoreDuplicates: true });
  if (insertError) throw insertError;
}
async function sendGift(supabase, user, payload) {
  const playerId = text(payload.playerId, 16).toUpperCase(), itemCode = text(payload.itemCode, 40), quantity = integer(payload.quantity, 1, 5, 1);
  if (!ITEM_CODES.has(itemCode)) throw Object.assign(new Error('送れないアイテムです。'), { status: 400 });
  const { data: target, error } = await supabase.from('mofumori_profiles').select('user_key').eq('player_id', playerId).maybeSingle();
  if (error) throw error; if (!target) throw Object.assign(new Error('フレンドが見つかりません。'), { status: 404 });
  const { data, error: rpcError } = await supabase.rpc('mofumori_send_gift', { p_sender: user.id, p_recipient: target.user_key, p_item: itemCode, p_quantity: quantity });
  if (rpcError) throw Object.assign(new Error(rpcError.message.includes('not_friends') ? 'フレンドだけに仕送りできます。' : rpcError.message.includes('not_enough') ? 'アイテムが足りません。' : '仕送りに失敗しました。'), { status: 400 });
  return data;
}
async function claimGift(supabase, user, giftId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(giftId || ''))) throw Object.assign(new Error('仕送り情報が不正です。'), { status: 400 });
  const { data, error } = await supabase.rpc('mofumori_claim_gift', { p_recipient: user.id, p_gift: giftId });
  if (error) throw Object.assign(new Error(error.message.includes('already_claimed') ? 'この仕送りは受け取り済みです。' : '仕送りを受け取れませんでした。'), { status: 400 });
  return data;
}

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    requireSameOrigin(req);
    const user = await requireUser(req);
    if (!configured()) return json(res, 503, { ok: false, configured: false, message: 'オンライン機能は準備中です。端末モードで遊べます。' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const action = text(body.action, 30, 'dashboard'), payload = body.payload && typeof body.payload === 'object' ? body.payload : {};
    const supabase = getSupabase(), ownProfile = await syncProfile(supabase, user, body.snapshot);
    let gameState = null;
    if (action === 'addFriend') await addFriend(supabase, user, payload.playerId);
    else if (action === 'sendGift') { const record = await sendGift(supabase, user, payload); gameState = record?.data || null; }
    else if (action === 'claimGift') { const record = await claimGift(supabase, user, payload.giftId); gameState = record?.data || null; }
    else if (action !== 'dashboard') throw Object.assign(new Error('未対応の操作です。'), { status: 400 });
    json(res, 200, { ok: true, data: await dashboard(supabase, user, ownProfile), gameState });
  } catch (error) { json(res, error.status || 400, { ok: false, message: error.message || 'オンライン機能の処理に失敗しました。' }); }
};
