const { allowMethods, json, requireUser } = require('../../server/auth.cjs');

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  try { json(res, 200, { ok: true, data: await requireUser(req) }); }
  catch (error) { json(res, error.status || 401, { ok: false, message: error.message || '未ログインです。' }); }
};
