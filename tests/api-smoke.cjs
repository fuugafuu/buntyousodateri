const assert = require('node:assert/strict');

function invoke(handler, { method = 'GET', headers = {}, body = undefined } = {}) {
  return new Promise((resolve, reject) => {
    const responseHeaders = {};
    const res = {
      statusCode: 200,
      setHeader(name, value) { responseHeaders[String(name).toLowerCase()] = value; },
      end(value = '') {
        try { resolve({ status: this.statusCode, headers: responseHeaders, body: value ? JSON.parse(value) : null }); }
        catch (error) { reject(error); }
      }
    };
    Promise.resolve(handler({ method, headers, body }, res)).catch(reject);
  });
}

(async () => {
  const me = await invoke(require('../api/auth/me.js'));
  assert.equal(me.status, 401);
  const cloud = await invoke(require('../api/cloud-save.js'));
  assert.equal(cloud.status, 401);
  const social = await invoke(require('../api/social.js'), { method: 'POST', body: { action: 'dashboard' } });
  assert.equal(social.status, 401);
  const badGoogle = await invoke(require('../api/auth/google.js'), { method: 'POST', body: { credential: 'bad' } });
  assert.equal(badGoogle.status, 400);
  const crossOrigin = await invoke(require('../api/auth/google.js'), { method: 'POST', headers: { origin: 'https://evil.example', host: 'buntyousodateri.vercel.app', 'x-forwarded-proto': 'https' }, body: { credential: 'bad' } });
  assert.equal(crossOrigin.status, 403);
  const logout = await invoke(require('../api/auth/logout.js'), { method: 'POST' });
  assert.equal(logout.status, 200);
  assert.match(String(logout.headers['set-cookie']), /Max-Age=0/);
  console.log('API smoke: auth guards, invalid credential, logout cookie OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
