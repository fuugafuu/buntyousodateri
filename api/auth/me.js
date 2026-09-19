const { allowMethods, json, requireUser, parseCookies, COOKIE_NAME, LEGACY_GOOGLE_COOKIE, verifyCredential, sessionCookie } = require('../../server/auth.cjs');

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  try {
    const cookies = parseCookies(req);
    let user = await requireUser(req);
    if (!cookies[COOKIE_NAME] && cookies[LEGACY_GOOGLE_COOKIE]) {
      user = await verifyCredential(cookies[LEGACY_GOOGLE_COOKIE]);
      res.setHeader('set-cookie', sessionCookie(user));
    }
    json(res, 200, { ok: true, authenticated: true, data: user });
  } catch (error) {
    if ((error.status || 401) === 401) return json(res, 200, { ok: true, authenticated: false, data: null });
    json(res, error.status || 500, { ok: false, message: error.message || 'ログイン状態を確認できませんでした。' });
  }
};
