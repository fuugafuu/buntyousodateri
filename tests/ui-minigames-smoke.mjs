import { chromium } from 'file:///C:/Users/fuuga/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1180, height: 760 } });
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://127.0.0.1:3101', { waitUntil: 'networkidle' });
await page.waitForSelector('#loadingOverlay.hide', { timeout: 10_000 });
const ids = await page.evaluate(() => minigames.map(game => game.id));
assert.equal(ids.length, 14);
const results = [];
for (const id of ids) {
  const state = await page.evaluate(async gameId => {
    G.coins = 100000;
    togglePanel('minigame');
    if (!document.getElementById('minigamePanel').classList.contains('show')) togglePanel('minigame');
    selectMinigame(gameId);
    startCurrentMinigame();
    await new Promise(resolve => setTimeout(resolve, 120));
    const result = { id: gameId, active: mgActive, current: currentMg?.id, content: document.getElementById('mgContent').childElementCount, target: getComputedStyle(document.getElementById('mgTarget')).display };
    endMinigame();
    backToMinigameList();
    return result;
  }, id);
  assert.equal(state.active, true, `${id} did not start`);
  assert.equal(state.current, id);
  assert.ok(state.content > 0 || state.target !== 'none', `${id} rendered no play UI`);
  results.push(state);
}
assert.deepEqual(errors, []);
console.log(`Minigame smoke: ${results.map(row => row.id).join(', ')} OK`);
await browser.close();
