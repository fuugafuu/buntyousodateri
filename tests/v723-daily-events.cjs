const assert=require('node:assert/strict');
const fs=require('node:fs');

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const pets=fs.readFileSync('api/pets.js','utf8');
const daily=fs.readFileSync('server/daily-event-api.cjs','utf8');
const client=fs.readFileSync('daily-events.js','utf8');
const css=fs.readFileSync('daily-events.css','utf8');
const admin=fs.readFileSync('server/admin-api.cjs','utf8');
const helper=fs.readFileSync('server/admin.cjs','utf8');
const petUi=fs.readFileSync('pet-system.js','utf8');
const arena=fs.readFileSync('api/arena.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const vercel=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const sql=fs.readFileSync('supabase/mofumori_v7_2_3_daily_events.sql','utf8');

assert.ok(/^7\.2\.[3-9][0-9]*$/.test(pkg.version),'current release must remain compatible with v7.2.3+ guards');
assert.ok(/window\.MOFUMORI_BUILD='7\.2\.[3-9][0-9]*'/.test(html));
assert.ok(/daily-events\.css\?v=7\.2\.[3-9][0-9]*/.test(html)&&/daily-events\.js\?v=7\.2\.[3-9][0-9]*/.test(html));
assert.ok(/mofumori-shell-v7\.2\.[3-9][0-9]*/.test(sw)&&/\/daily-events\.js\?v=7\.2\.[3-9][0-9]*/.test(sw));
assert.ok(!fs.existsSync('api/daily-event.js'),'daily event must not consume an extra Vercel function');
assert.ok(vercel.rewrites.some(r=>r.source==='/api/daily-event'&&r.destination.includes('__route=daily-event')));
assert.ok(pets.includes("dailyEventApiHandler")&&pets.includes("route==='daily-event'"));

assert.ok(daily.includes("Array.from({length:19}")&&daily.includes("within===19"),'19 normal days + fixed boss day per 20-day block required');
assert.ok(daily.includes("const BOSSES=[")&&daily.includes("夜のフクロウ王"));
assert.ok(daily.includes("mofumori_daily_event_players"));
assert.ok(daily.includes("submitNormal")&&daily.includes("submitBoss")&&daily.includes("claim"));
assert.ok(daily.includes("dodges+hitsTaken!==18"),'boss result validation required');
assert.ok(daily.includes("boss_hp_remaining"),'boss HP must persist server-side');
assert.ok(daily.includes("mofumori_claim_daily_event_reward"),'reward must be awarded server-side');

for(const fn of ['forageGame','rhythmGame','careGame','exploreGame','memoryGame','startBoss'])assert.ok(client.includes('function '+fn),fn+' missing');
assert.ok(client.includes("round>=18")&&client.includes("bossSubmit"),'18-round boss battle missing');
assert.ok(client.includes("claimReward")&&client.includes("post('claim')"),'reward claim UI missing');
assert.ok(css.includes('.v723-boss-field')&&css.includes('.v723-event-card')&&css.includes('@media(max-width:700px)'));

assert.ok(helper.includes('admin_bird_enabled'));
assert.ok(admin.includes("action==='summonBird'")&&admin.includes('adminBirdEnabled'));
assert.ok(petUi.includes('restoreAdminBird')&&petUi.includes("adminApi('summonBird')"));

assert.ok(arena.includes("skill=.40+r()*.30")&&arena.includes("skill=.40+r()*.32"),'bot difficulty must remain human-range');
assert.ok(sql.includes('mofumori_daily_event_players')&&sql.includes('grant execute on function public.mofumori_claim_daily_event_reward'));
console.log('v7.2.3 daily events: rotation, five minigames, persistent boss, rewards, admin bird and bot balance guards OK');
