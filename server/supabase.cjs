const { createClient } = require('@supabase/supabase-js');

let client = null;
function configured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
function getSupabase() {
  if (!configured()) return null;
  if (!client) client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
module.exports = { configured, getSupabase };
