const { allowMethods, json, requireUser } = require('../server/auth.cjs');
const { configured, getSupabase } = require('../server/supabase.cjs');

const BOARDS = new Set(['total', 'collection', 'social', 'explorer']);

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  try {
    const user = await requireUser(req);
    if (!configured()) return json(res, 503, { ok: false, configured: false, message: 'オンラインランキングは準備中です。' });
    const boardRaw = String(req.query?.board || 'total').toLowerCase();
    const board = BOARDS.has(boardRaw) ? boardRaw : 'total';
    const limit = Math.max(1, Math.min(100, Number.parseInt(req.query?.limit, 10) || 100));
    const supabase = getSupabase();
    const { data: profile, error: profileError } = await supabase.from('mofumori_profiles').select('user_key').eq('user_key', user.id).maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return json(res, 200, { ok: true, configured: true, data: { board, authoritative: true, rows: [], me: null } });
    const { data, error } = await supabase.rpc('mofumori_get_leaderboard', { p_user: user.id, p_board: board, p_limit: limit });
    if (error) throw error;
    return json(res, 200, { ok: true, configured: true, data });
  } catch (error) {
    return json(res, error.status || 400, { ok: false, message: error.message || 'ランキングの取得に失敗しました。' });
  }
};
