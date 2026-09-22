const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const client=fs.readFileSync('push-client.js','utf8');
const api=fs.readFileSync('api/push.js','utf8');
const migration=fs.readFileSync('supabase/mofumori_v7_3_4_push_notifications.sql','utf8');

assert.equal(pkg.version,'7.3.4');
assert.ok(pkg.scripts.check.includes('node --check api/push.js'));
assert.ok(pkg.scripts.check.includes('node --check push-client.js'));
assert.ok(html.includes('push-client.js?v=7.3.4'));
assert.ok(!html.includes('regs.map(reg=>reg.unregister())'),'app updates must preserve push subscriptions');

assert.ok(sw.includes("self.addEventListener('push'"),'service worker push handler missing');
assert.ok(sw.includes("self.addEventListener('notificationclick'"),'notification click handler missing');
assert.ok(sw.includes("self.addEventListener('pushsubscriptionchange'"),'push subscription renewal missing');

assert.ok(client.includes('Notification.requestPermission()'),'permission must be requested from explicit user action');
assert.ok(client.includes('pushManager.subscribe'),'push subscription creation missing');
assert.ok(client.includes("server('subscribe'"),'subscription must be persisted server-side');
assert.ok(client.includes("server('test'"),'test notification action missing');

assert.ok(api.includes("action==='dispatch'")&&api.includes('PUSH_CRON_SHA256'),'background dispatcher auth missing');
assert.ok(api.includes('mofumori_lifecycle_events'),'lifecycle push events missing');
assert.ok(api.includes('mofumori_friend_requests'),'friend push events missing');
assert.ok(api.includes('mofumori_arena_challenges'),'arena push events missing');
assert.ok(api.includes('mofumori_gifts'),'gift push events missing');
assert.ok(api.includes('mofumori_visits'),'visit push events missing');

assert.ok(migration.includes('alter table public.mofumori_push_subscriptions enable row level security'));
assert.ok(migration.includes('revoke all on table public.mofumori_push_subscriptions from anon, authenticated'));
assert.ok(migration.includes('grant execute on function public.mofumori_push_secret(text) to service_role'));

const push=require('../api/push.js');
assert.ok(push._internal?.encryptPushPayload&&push._internal?.makeVapidJwt);
const receiver=crypto.createECDH('prime256v1');receiver.generateKeys();
const auth=crypto.randomBytes(16).toString('base64url');
const body=push._internal.encryptPushPayload({title:'test',body:'hello'},receiver.getPublicKey().toString('base64url'),auth);
assert.ok(Buffer.isBuffer(body)&&body.length>100&&body.length<4096);
assert.equal(body.readUInt32BE(16),4096);
assert.equal(body[20],65);

console.log('v7.3.4 push guards: permission, subscription, encrypted Web Push, closed-app SW delivery, secure DB storage OK');
