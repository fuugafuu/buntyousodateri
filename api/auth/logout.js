const { allowMethods, json, requireSameOrigin, clearSessionCookies } = require('../../server/auth.cjs');

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  try { requireSameOrigin(req); } catch (error) { return json(res, error.status || 403, { ok: false, message: error.message }); }
  res.setHeader('set-cookie', clearSessionCookies());
  json(res, 200, { ok: true });
};
