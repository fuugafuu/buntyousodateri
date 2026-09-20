const assert=require('node:assert/strict');
const fs=require('node:fs');

const pets=fs.readFileSync('api/pets.js','utf8');
const arena=fs.readFileSync('api/arena.js','utf8');
const admin=fs.readFileSync('api/admin.js','utf8');
const adminHelper=fs.readFileSync('server/admin.cjs','utf8');
const petUi=fs.readFileSync('pet-system.js','utf8');
const arenaUi=fs.readFileSync('v6-ui.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('v7-ui.css','utf8');
const health=fs.readFileSync('api/health.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pkg=require('../package.json');

assert.ok(!/\.rpc\([^;\n]+\)\.catch\(/.test(pets),'pets API must not call .catch() directly on Supabase RPC builders');
assert.ok(!/\.rpc\([^;\n]+\)\.catch\(/.test(arena),'arena API must not call .catch() directly on Supabase RPC builders');
assert.ok(pets.includes('bestEffortRpc'),'gacha/progression best-effort RPC wrapper missing');

assert.ok(admin.includes("requireAdmin(sb,user)"),'admin API must authorize server-side');
assert.ok(adminHelper.includes("mofumori_admins"),'admin authorization must be backed by admin table');
assert.ok(admin.includes("setGachaConfig")&&admin.includes("adjustCurrency")&&admin.includes("diagnostics"),'admin actions missing');
assert.ok(admin.includes("rateSum-100"),'gacha rate sum validation missing');
assert.ok(admin.includes("mofumori_admin_adjust_currency"),'server-authoritative currency adjustment missing');
assert.ok(petUi.includes("ADMIN_BIRD_CODE"),'admin bird summon entry missing');
assert.ok(petUi.includes("adminApi('status')"),'admin bird must verify server authorization');
assert.ok(!petUi.includes("N.admin={role:'owner'"),'client summon string must not create local admin authority');

assert.ok(pets.includes("mofumori_game_config"),'server gacha must load managed config');
assert.ok(pets.includes("payload.bannerId"),'selected gacha banner must be passed to server');
assert.ok(pets.includes("'beaver'"),'beaver must remain a valid gacha species');
assert.ok(petUi.includes("gachaBannerSelect"),'multi-banner selector missing');
assert.ok(petUi.includes("新ガチャ"),'admin new-banner UI missing');

assert.ok(arena.includes("mofumori_arena_touch"),'arena heartbeat RPC missing');
assert.ok(arena.includes("p1_last_seen_at")&&arena.includes("p2_last_seen_at"),'arena presence timestamps missing');
assert.ok(arenaUi.includes("arena('heartbeat'"),'client heartbeat missing');
assert.ok(arenaUi.includes("id=\"v721ExitBattle\""),'visible leave-battle button missing');
assert.ok(arenaUi.includes("id=\"fUp\"")&&arenaUi.includes("id=\"fDown\""),'vertical flight controls missing');
assert.ok(arenaUi.includes("y:y*2-1"),'flight vertical position must sync online');
assert.ok(css.includes('v721-flight-2d')&&css.includes('v721-exit-battle'),'v7.2.1 battle UI styles missing');

assert.ok(html.includes('maxlength="72"'),'friend field must accept the admin-bird summon string');
assert.ok(health.includes("version: '7.2.1'"),'health endpoint version mismatch');
assert.ok(sw.includes("mofumori-shell-v7.2.1"),'service worker cache version mismatch');
assert.equal(pkg.version,'7.2.1');

console.log('v7.2.1 hotfix: gacha RPC safety, authenticated admin mode, heartbeat timeout, battle exit and 2D flight guards OK');
