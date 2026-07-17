import { chromium } from 'file:///C:/Users/fuuga/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';

const context = await chromium.launchPersistentContext('output/ai-browser-profile', { headless: true, viewport: { width: 1180, height: 760 } });
const page = context.pages()[0] || await context.newPage();
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://127.0.0.1:3101', { waitUntil: 'networkidle' });
await page.click('#chatOpenBtn');
await page.click('.ai-chat-title button');
await page.check('#aiTerms');
await page.setInputFiles('#aiModelFile', 'E:/qwen2.5-1.5b-instruct-q4_k_m.gguf');
let ready = false;
for (let elapsed = 10; elapsed <= 600; elapsed += 10) {
  await page.waitForTimeout(10_000);
  const state = await page.evaluate(() => ({ status: aiStatus, bytes: aiModelBytes, text: document.getElementById('aiStatusText')?.textContent, progress: document.getElementById('aiLoadProgress')?.value }));
  console.log(`${elapsed}s ${JSON.stringify(state)}`);
  if (state.status === 'error') throw new Error(state.text || 'model_load_error');
  if (state.status === 'ready' && state.bytes > 1_000_000_000) { ready = true; break; }
}
assert.ok(ready, '実モデルが10分以内に起動しませんでした');
await page.waitForFunction(() => aiStatus === 'ready' && !aiBusy, null, { timeout: 180_000 });
const before = await page.evaluate(() => G.chatHistory.length);
const inferenceBefore = await page.evaluate(() => aiInferenceCount);
await page.fill('#chatInput', '今の気持ちと、してほしいことを教えて');
await page.click('.chat-send');
await page.waitForFunction(count => G.chatHistory.length >= count + 2 && G.chatHistory.at(-1)?.role === 'ai', before, { timeout: 180_000 });
await page.waitForFunction(count => aiInferenceCount > count && aiStatus === 'ready', inferenceBefore, { timeout: 180_000 });
const result = await page.evaluate(() => ({
  reply: G.chatHistory.at(-1)?.text,
  status: aiStatus,
  bytes: aiModelBytes,
  emotion: aiEmotion,
  request: aiRequest,
  inferences: aiInferenceCount,
  classes: [...document.getElementById('birdSvg').classList]
}));
assert.ok(result.reply && result.reply.length >= 2);
assert.equal(result.status, 'ready');
assert.ok(result.bytes > 1_000_000_000);
assert.ok(result.inferences > inferenceBefore);
assert.ok(result.classes.some(name => name.startsWith('ai-')));
assert.deepEqual(errors, []);
await page.screenshot({ path: 'output/ai-real-model.png', fullPage: false });
console.log(JSON.stringify(result));
await context.close();
