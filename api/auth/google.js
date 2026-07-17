const { COOKIE_NAME, allowMethods, json, verifyCredential, requireSameOrigin } = require('../../server/auth.cjs');

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    requireSameOrigin(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const user = await verifyCredential(body.credential);
    const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader('set-cookie', `${COOKIE_NAME}=${encodeURIComponent(body.credential)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(60, Math.floor((user.expiresAt - Date.now()) / 1000))}${secure}`);
    json(res, 200, { ok: true, data: user });
  } catch (error) {
    json(res, error.status || 401, { ok: false, message: error.message || 'Googleログインに失敗しました。' });
  }
};
