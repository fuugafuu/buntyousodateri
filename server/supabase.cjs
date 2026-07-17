const { createClient } = require('@supabase/supabase-js');

let client = null;
function getUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}
function configured() {
  return Boolean(getUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
function getSupabase() {
  if (!configured()) return null;
  if (!client) client = createClient(getUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
module.exports = { configured, getSupabase };
