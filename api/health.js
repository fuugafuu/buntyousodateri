const { allowMethods, json } = require('../server/auth.cjs');
const { configured, getSupabase } = require('../server/supabase.cjs');

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  const cloudConfigured = configured();
  let schemaReady = false;
  let breedingReady = false;
  if (cloudConfigured) {
    try {
      const sb=getSupabase();
      const [{error:baseError},{error:breedError}]=await Promise.all([
        sb.from('mofumori_saves').select('user_key',{head:true,count:'exact'}),
        sb.from('mofumori_breeding_jobs').select('id',{head:true,count:'exact'})
      ]);
      breedingReady=!breedError;schemaReady=!baseError&&breedingReady;
    } catch (error) { schemaReady = false; }
  }
  json(res, 200, { ok: true, version: '7.3.2', cloudConfigured, schemaReady, breedingReady, localModeAvailable: true });
};
