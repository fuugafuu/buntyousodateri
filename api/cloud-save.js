const { allowMethods, json, requireUser, requireSameOrigin } = require('../server/auth.cjs');
const { configured, getSupabase } = require('../server/supabase.cjs');

function cleanRecord(input) {
  if (!input || typeof input !== 'object' || !input.data || typeof input.data !== 'object') throw Object.assign(new Error('セーブデータが不正です。'), { status: 400 });
  const jsonText = JSON.stringify(input);
  if (jsonText.length > 500000) throw Object.assign(new Error('セーブデータが大きすぎます。'), { status: 413 });
  const record = JSON.parse(jsonText);
  delete record.data.chatApiKey;
  delete record.data.chatApiDraft;
  delete record.data.chatApiEnabled;
  record.version = '4.0.0';
  record.savedAt = new Date().toISOString();
  return record;
}

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'PUT'])) return;
  try {
    if (req.method === 'PUT') requireSameOrigin(req);
    const user = await requireUser(req);
    if (!configured()) return json(res, 503, { ok: false, configured: false, message: 'クラウド保存は準備中です。' });
    const supabase = getSupabase();
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('mofumori_saves').select('state,saved_at').eq('user_key', user.id).maybeSingle();
      if (error) throw error;
      return json(res, 200, { ok: true, configured: true, data: data ? { ...data.state, savedAt: data.saved_at } : null });
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const record = cleanRecord(body);
    const { error } = await supabase.from('mofumori_saves').upsert({ user_key: user.id, state: record, saved_at: record.savedAt }, { onConflict: 'user_key' });
    if (error) throw error;
    json(res, 200, { ok: true, configured: true, savedAt: record.savedAt });
  } catch (error) { json(res, error.status || 400, { ok: false, message: error.message || 'クラウド保存に失敗しました。' }); }
};
