const assert=require('node:assert/strict');
const fs=require('node:fs');

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const vercel=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const main=fs.readFileSync('main.js','utf8');
const pets=fs.readFileSync('api/pets.js','utf8');
const v7=fs.readFileSync('v7-ui.js','utf8');
const health=fs.readFileSync('api/health.js','utf8');
const migration=fs.readFileSync('supabase/mofumori_v7_3_3_server_latency.sql','utf8');

assert.ok(/^7\.3\.[0-9]+$/.test(pkg.version));
assert.deepEqual(vercel.regions,['hnd1'],'API functions must run beside Tokyo Supabase');
assert.ok(main.includes('cloudSaveInFlight=false')&&main.includes('cloudSavePendingRecord=null'),'cloud save serialization state missing');
assert.ok(main.includes('setTimeout(()=>flushCloudSave(userId),7000)'),'cloud saves must be debounced');
assert.ok(main.includes('if(cloudSaveInFlight)return'),'cloud save requests must not overlap');
assert.ok(pets.includes('gachaConfigCacheAt<30000'),'gacha config warm cache missing');
assert.ok(pets.includes('loadDashboard(supabase, user, ensuredProfile=null)'),'dashboard should reuse ensured profile');
assert.ok(pets.includes('ensureHiddenReward(supabase,user,pets||[])'),'hidden reward must reuse already loaded pet list');
assert.ok(v7.includes('},60000)'),'passive progression polling should be 60s');
assert.ok(health.includes("version: '7.3.3'")&&health.includes('process.env.VERCEL_REGION'),'health must expose release and runtime region');
assert.ok(migration.includes('mofumori_friend_requests_pending_sender_recipient_idx'));
assert.ok(migration.includes('mofumori_visits_active_host_expires_idx'));
console.log('v7.3.x server latency guards: Tokyo region, request serialization, fewer DB roundtrips, indexes OK');
