const assert=require('node:assert/strict');
const fs=require('node:fs');

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const pets=fs.readFileSync('api/pets.js','utf8');
const petUi=fs.readFileSync('pet-system.js','utf8');
const petCss=fs.readFileSync('pet-system.css','utf8');
const arena=fs.readFileSync('api/arena.js','utf8');
const arenaUi=fs.readFileSync('v6-ui.js','utf8');
const sql=fs.readFileSync('supabase/mofumori_v7_2_4_fusion_rewards.sql','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert.ok(/^7\./.test(pkg.version),'v7 release required');
assert.ok(html.includes(`window.MOFUMORI_BUILD='${pkg.version}'`));
assert.ok(sw.includes(`mofumori-shell-v${pkg.version}`));

assert.ok(pets.includes("action === 'fusePets'"),'fusion action missing');
assert.ok(pets.includes("custom_named: true"),'renaming must permanently protect a pet from fusion');
assert.ok(pets.includes('fusionLevel: Number(row.fusion_level||0)'),'fusion level must reach client');
assert.ok(pets.includes("mofumori_fuse_pets"),'fusion must execute server-side');
assert.ok(petUi.includes('function fusionUi()')&&(petUi.includes('function fuseGroup(')||petUi.includes('function fuseManual(')),'fusion UI missing');
assert.ok(petUi.includes('!p.customNamed'),'renamed pets must be excluded from fusion groups');
assert.ok(petUi.includes("String(p.id)!==String(G.activePetId)"),'active pet must not be consumed');
assert.ok(petUi.includes('名前変更済み')&&petUi.includes('素材'),'protection copy missing');
assert.ok(petCss.includes('.fusion-group')&&petCss.includes('.fusion-open-btn'));

assert.ok(sql.includes('fusion_level smallint')&&sql.includes('custom_named boolean'));
assert.ok(sql.includes("set search_path=''"),'security definer functions must lock search_path');
assert.ok(sql.includes('material_invalid_or_protected'));
assert.ok(sql.includes("opponent_key like 'bot:arena:%'"));
assert.ok(sql.includes('coins_gain:=80')&&sql.includes('coins_gain:=150'),'bot/human reward split missing');
assert.ok(sql.includes('reward_awarded_at'),'match reward must be persisted');
assert.ok(sql.includes('revoke execute on function public.mofumori_fuse_pets'));
assert.ok(sql.includes('grant execute on function public.mofumori_fuse_pets')&&sql.includes('to service_role'));

assert.ok(arena.includes('reward_coins')&&arena.includes('reward_awarded_at'),'arena API must expose persisted reward');
assert.ok(arena.includes('currentCoins'),'arena API must return authoritative post-win coin total');
assert.ok(arenaUi.includes('v724-win-reward')&&arenaUi.includes('勝利報酬'),'win reward UI missing');
assert.ok(arenaUi.includes('reward.currentCoins'),'client must sync authoritative coin balance');
console.log('v7.2.4 fusion/reward guards: protected fusion + persistent online win rewards OK');
