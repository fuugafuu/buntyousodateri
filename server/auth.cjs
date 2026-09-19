const crypto = require('node:crypto');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1027705662725-bn7tbc4rrflvv5sk0redv6043nnmajld.apps.googleusercontent.com';
const COOKIE_NAME = 'mofumori_session';
const LEGACY_GOOGLE_COOKIE = 'mofumori_google_id_token';
const SESSION_DAYS = 30;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

function parseCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return index < 0 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}
function sessionSecret() {
  const secret = process.env.MOFUMORI_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!secret && (process.env.VERCEL || process.env.NODE_ENV === 'production')) throw Object.assign(new Error('セッション設定が不足しています。'), { status: 503 });
  return secret || 'mofumori-local-dev-session-secret';
}
function b64(value) { return Buffer.from(value).toString('base64url'); }
function unb64(value) { return Buffer.from(value, 'base64url').toString('utf8'); }
function sign(value) { return crypto.createHmac('sha256', sessionSecret()).update(value).digest('base64url'); }
function safeEqual(a, b) {
  const aa = Buffer.from(String(a)), bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function createSessionToken(user, ttlSeconds = SESSION_DAYS * 86400) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: String(user.id),
    email: String(user.email || ''),
    name: String(user.name || 'Mofumoriユーザー').slice(0, 80),
    picture: String(user.picture || '').slice(0, 1000),
    provider: String(user.provider || 'mofumori'),
    iat: now,
    exp: now + Math.max(3600, Math.min(ttlSeconds, 90 * 86400))
  };
  const body = b64(JSON.stringify(payload));
  return body + '.' + sign(body);
}
function verifySessionToken(token) {
  const [body, signature] = String(token || '').split('.');
  if (!body || !signature || !safeEqual(sign(body), signature)) throw Object.assign(new Error('ログイン状態を確認できませんでした。'), { status: 401 });
  let payload;
  try { payload = JSON.parse(unb64(body)); } catch { throw Object.assign(new Error('ログイン状態が壊れています。'), { status: 401 }); }
  if (!payload?.id || !payload.exp || payload.exp * 1000 <= Date.now()) throw Object.assign(new Error('ログインの有効期限が切れました。'), { status: 401 });
  return { id: String(payload.id), email: payload.email || '', name: payload.name || 'Mofumoriユーザー', picture: payload.picture || '', provider: payload.provider || 'mofumori', expiresAt: payload.exp * 1000 };
}
function sessionCookie(user, ttlSeconds = SESSION_DAYS * 86400) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(createSessionToken(user, ttlSeconds))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttlSeconds}${secure}`;
}
function clearSessionCookies() {
  return [
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    `${LEGACY_GOOGLE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  ];
}
async function verifyCredential(credential) {
  if (typeof credential !== 'string' || credential.length < 100 || credential.length > 10000) throw Object.assign(new Error('Googleログイン情報が不正です。'), { status: 400 });
  const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.exp) throw Object.assign(new Error('Googleログイン情報を確認できませんでした。'), { status: 401 });
  return { id: payload.sub, email: payload.email || '', name: payload.name || payload.email || 'Googleユーザー', picture: payload.picture || '', provider: 'google', googleExpiresAt: payload.exp * 1000 };
}
async function requireUser(req) {
  const cookies = parseCookies(req);
  if (cookies[COOKIE_NAME]) return verifySessionToken(cookies[COOKIE_NAME]);
  if (cookies[LEGACY_GOOGLE_COOKIE]) return verifyCredential(cookies[LEGACY_GOOGLE_COOKIE]);
  throw Object.assign(new Error('ログインが必要です。'), { status: 401 });
}
function requireSameOrigin(req) {
  const fetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();
  if (fetchSite === 'cross-site') throw Object.assign(new Error('この送信元からの操作は許可されていません。'), { status: 403 });
  const origin = String(req.headers.origin || '');
  if (!origin) return true;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const proto = String(req.headers['x-forwarded-proto'] || (process.env.VERCEL ? 'https' : 'http')).split(',')[0].trim();
  const allowed = new Set([host ? `${proto}://${host}` : '', process.env.APP_ORIGIN || ''].filter(Boolean));
  if (!allowed.has(origin)) throw Object.assign(new Error('この送信元からの操作は許可されていません。'), { status: 403 });
  return true;
}
function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}
function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('allow', methods.join(', '));
  json(res, 405, { ok: false, message: '許可されていない操作です。' });
  return false;
}

module.exports = {
  GOOGLE_CLIENT_ID, COOKIE_NAME, LEGACY_GOOGLE_COOKIE, SESSION_DAYS,
  json, allowMethods, verifyCredential, requireUser, requireSameOrigin,
  createSessionToken, verifySessionToken, sessionCookie, clearSessionCookies, parseCookies
};
