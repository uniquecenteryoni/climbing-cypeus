export const ADMIN_COOKIE = '__Host-ccAdmin';
export const SESSION_SECONDS = 30 * 24 * 60 * 60;

async function signingKey(password) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createAdminCookie(password, now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const payload = `${expires}.${nonce}`;
  const signature = await crypto.subtle.sign('HMAC', await signingKey(password), new TextEncoder().encode(`cc-admin-v1:${payload}`));
  const encoded = Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
  return `${ADMIN_COOKIE}=${payload}.${encoded}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export async function hasAdminSession(request, password, now = Date.now()) {
  if (!password) return false;
  const cookie = (request.headers.get('Cookie') || '').split(';').map(value => value.trim())
    .find(value => value.startsWith(`${ADMIN_COOKIE}=`));
  const token = cookie?.slice(ADMIN_COOKIE.length + 1);
  if (!token || !/^\d{10,12}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, nonce, signature] = token.split('.');
  const seconds = Math.floor(now / 1000);
  if (Number(expires) <= seconds || Number(expires) > seconds + SESSION_SECONDS) return false;
  const bytes = Uint8Array.from(signature.match(/../g), byte => parseInt(byte, 16));
  return crypto.subtle.verify('HMAC', await signingKey(password), bytes,
    new TextEncoder().encode(`cc-admin-v1:${expires}.${nonce}`));
}
