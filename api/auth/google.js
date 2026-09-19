const { allowMethods, json, verifyCredential, requireSameOrigin, sessionCookie, LEGACY_GOOGLE_COOKIE } = require('../../server/auth.cjs');

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    requireSameOrigin(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const user = await verifyCredential(body.credential);
    res.setHeader('set-cookie', [
      sessionCookie(user),
      `${LEGACY_GOOGLE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    ]);
    json(res, 200, { ok: true, data: { ...user, expiresAt: Date.now() + 30 * 86400 * 1000 } });
  } catch (error) {
    json(res, error.status || 401, { ok: false, message: error.message || 'Googleログインに失敗しました。' });
  }
};
