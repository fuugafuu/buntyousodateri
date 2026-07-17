const { allowMethods, json } = require('../server/auth.cjs');
const { configured, getSupabase } = require('../server/supabase.cjs');

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  const cloudConfigured = configured();
  let schemaReady = false;
  if (cloudConfigured) {
    try {
      const { error } = await getSupabase().from('mofumori_saves').select('user_key', { head: true, count: 'exact' });
      schemaReady = !error;
    } catch (error) { schemaReady = false; }
  }
  json(res, 200, { ok: true, version: '4.0.0', cloudConfigured, schemaReady, localModeAvailable: true });
};
