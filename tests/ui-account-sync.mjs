import { chromium } from 'file:///C:/Users/fuuga/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
const page = await context.newPage();
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', error => errors.push(error.message));
let ready = false;
for (let attempt = 0; attempt < 3 && !ready; attempt++) {
  await page.goto(`http://127.0.0.1:3101/?sync-test=${attempt}`, { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('#loadingOverlay.hide', { state: 'attached', timeout: 10_000 });
    ready = true;
  } catch (error) {
    if (attempt === 2) throw error;
  }
}
errors.length = 0;

const result = await page.evaluate(async () => {
  const guestState = normalizeGameState({ ...G, coins: 321, gems: 7, level: 3 });
  identityUser = null;
  activeSaveUserId = null;
  cloudSyncSuspended = true;
  G = guestState;
  await save();
  await pendingSave;

  const remoteState = normalizeGameState({ ...G, coins: 9876, gems: 42, level: 19, inv: { ...G.inv, seeds: 77 } });
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (url, options = {}) => {
    if (String(url) === '/api/cloud-save') {
      if ((options.method || 'GET') === 'GET') {
        return new Response(JSON.stringify({ ok: true, configured: true, data: { version: '4.0.0', savedAt: '2026-07-17T05:00:00.000Z', data: remoteState } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true, configured: true, savedAt: '2026-07-17T05:00:01.000Z' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return nativeFetch(url, options);
  };

  identityUser = { id: 'google-user-one', name: '同期テスト' };
  const synced = await pullCloudSave();
  const guestAfterLogin = await saveDbGet(SAVE_RECORD);
  const accountAfterLogin = await saveDbGet(accountSaveRecordKey(identityUser.id));

  cloudSyncSuspended = true;
  G.coins = 12345;
  await save();
  await pendingSave;
  const guestAfterAccountSave = await saveDbGet(SAVE_RECORD);
  const accountAfterAccountSave = await saveDbGet(accountSaveRecordKey(identityUser.id));

  return {
    synced,
    visibleCoins: document.getElementById('coins').textContent,
    loadedCoins: accountAfterLogin.data.coins,
    loadedGems: accountAfterLogin.data.gems,
    loadedSeeds: accountAfterLogin.data.inv.seeds,
    guestCoins: guestAfterLogin.data.coins,
    guestCoinsAfterAccountSave: guestAfterAccountSave.data.coins,
    accountCoinsAfterSave: accountAfterAccountSave.data.coins
  };
});

assert.equal(result.synced, true);
assert.equal(result.visibleCoins, '9876');
assert.equal(result.loadedCoins, 9876);
assert.equal(result.loadedGems, 42);
assert.equal(result.loadedSeeds, 77);
assert.equal(result.guestCoins, 321);
assert.equal(result.guestCoinsAfterAccountSave, 321);
assert.equal(result.accountCoinsAfterSave, 12345);
assert.deepEqual(errors, []);
await page.waitForTimeout(900);
await page.screenshot({ path: 'output/account-sync-mobile.png', fullPage: false });
console.log('UI account sync: remote coins/items loaded and guest/account saves remain separate');
await browser.close();
