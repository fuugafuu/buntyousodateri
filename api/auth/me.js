const { allowMethods, json, requireUser } = require('../../server/auth.cjs');

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  try { json(res, 200, { ok: true, data: await requireUser(req) }); }
  catch (error) {
    if ((error.status || 401) === 401) return json(res, 200, { ok: true, authenticated: false, data: null });
    json(res, error.status || 500, { ok: false, message: error.message || 'ログイン状態を確認できませんでした。' });
  }
};
