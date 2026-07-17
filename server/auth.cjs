const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1027705662725-bn7tbc4rrflvv5sk0redv6043nnmajld.apps.googleusercontent.com';
const COOKIE_NAME = 'mofumori_google_id_token';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

function parseCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return index < 0 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

async function verifyCredential(credential) {
  if (typeof credential !== 'string' || credential.length < 100 || credential.length > 10000) throw Object.assign(new Error('Googleログイン情報が不正です。'), { status: 400 });
  const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.exp) throw Object.assign(new Error('Googleログイン情報を確認できませんでした。'), { status: 401 });
  return { id: payload.sub, email: payload.email || '', name: payload.name || payload.email || 'Googleユーザー', picture: payload.picture || '', expiresAt: payload.exp * 1000 };
}

async function requireUser(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) throw Object.assign(new Error('Googleログインが必要です。'), { status: 401 });
  return verifyCredential(token);
}

function requireSameOrigin(req) {
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

module.exports = { GOOGLE_CLIENT_ID, COOKIE_NAME, json, allowMethods, verifyCredential, requireUser, requireSameOrigin };
