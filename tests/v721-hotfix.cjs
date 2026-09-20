const assert=require('node:assert/strict');
const fs=require('node:fs');

const pets=fs.readFileSync('api/pets.js','utf8');
const arena=fs.readFileSync('api/arena.js','utf8');
const ui=fs.readFileSync('v6-ui.js','utf8');
const petUi=fs.readFileSync('pet-system.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const admin=fs.readFileSync('api/admin.js','utf8');
const config=fs.readFileSync('api/config.js','utf8');
const helper=fs.readFileSync('server/admin.cjs','utf8');
const css=fs.readFileSync('v7-ui.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const vercel=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const timeoutSql=fs.readFileSync('supabase/mofumori_v7_2_1_arena_timeout_priority.sql','utf8');
const auditSql=fs.readFileSync('supabase/mofumori_v7_2_1_admin_audit.sql','utf8');

assert.equal(pkg.version,'7.2.1');
assert.ok(html.includes("window.MOFUMORI_BUILD='7.2.1'"));
assert.ok(html.includes('id="friendIdInput" maxlength="72"'));

assert.ok(!/\.rpc\([^;\n]+\)\.catch/.test(pets),'pets API must not call .catch directly on Supabase RPC builders');
assert.ok(!/\.rpc\([^;\n]+\)\.catch/.test(arena),'arena API must not call .catch directly on Supabase RPC builders');
assert.ok(pets.includes("bestEffortRpc(supabase,'mofumori_progress_event'"),'gacha progression must use safe RPC helper');

assert.ok(helper.includes("from('mofumori_admins')"),'admin authorization must be server-side');
assert.ok(admin.includes("await requireAdmin(sb,user)"),'admin API must verify current session');
assert.ok(admin.includes("setGachaConfig")&&admin.includes("adjustCurrency")&&admin.includes("diagnostics"));
assert.ok(admin.includes("Math.abs(rateSum-100)"),'admin gacha rates must total 100 percent');
assert.ok(config.includes("mofumori_game_config"),'public gacha configuration endpoint missing');

assert.ok(petUi.includes("ADMIN_BIRD_CODE='MF::M0FUM0RI-ADMIN::BIRD-7Z2::OWNER'"));
assert.ok(petUi.includes("await adminApi('status')"),'admin bird must verify authorization before appearing');
assert.ok(petUi.includes("data-admin-open"),'admin bird button missing');
assert.ok(petUi.includes("setGachaConfig")&&petUi.includes("adjustCurrency"),'admin controls missing');
assert.ok(petUi.includes("bannerId:banner.id"),'selected gacha banner must be sent to server');

assert.ok(arena.includes("action==='heartbeat'"),'arena heartbeat action missing');
assert.ok(arena.includes("p1_last_seen_at")&&arena.includes("p2_last_seen_at"),'arena last-seen tracking missing');
assert.ok(ui.includes('id="v721ExitBattle"'),'visible exit-battle control missing');
assert.ok(ui.includes('id="fUp"')&&ui.includes('id="fDown"'),'2D flight vertical controls missing');
assert.ok(ui.includes('y:y*2-1'),'flight vertical progress must sync online');
assert.ok(css.includes('.v721-flight-2d')&&css.includes('.v721-admin-modal'));
assert.equal(vercel.git.deploymentEnabled.main,true);
assert.equal(vercel.git.deploymentEnabled['*'],false);
assert.ok(timeoutSql.indexOf("now_ts>deadline")<timeoutSql.indexOf("m.status='ready'"),'hard timeout must be evaluated before ready-state handling');
assert.ok(timeoutSql.includes("interval '2 seconds'"),'ready presence freshness must be strict');
assert.ok(auditSql.includes('mofumori_admin_audit'),'admin audit migration missing');
assert.ok(auditSql.includes('mofumori_admin_log'),'admin audit RPC must be committed with the schema');
assert.ok(auditSql.includes('grant execute on function public.mofumori_admin_log'),'admin audit RPC must be service-role only');
assert.ok(admin.includes("await audit(sb,user,'set_gacha_config'"));
assert.ok(admin.includes("await audit(sb,user,'adjust_currency'"));

console.log('v7.2.1 hotfix regression: gacha RPC, authenticated admin mode, heartbeat, timeout UX and 2D flight guards OK');
