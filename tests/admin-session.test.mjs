import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createAdminCookie, hasAdminSession, SESSION_SECONDS } from '../functions/_lib/admin-auth.js';
import { onRequest } from '../functions/api/admin-session.js';

const origin = 'https://climbing-cyprus.com';
const env = { CLIMBING_ADMIN_PASSWORD: 'test-password' };
const request = (cookie = '') => new Request(`${origin}/api/admin-session`, { headers: { Cookie: cookie } });
const login = (password, site = origin) => new Request(`${origin}/api/admin-session`, { method: 'POST', headers: { Origin: site }, body: JSON.stringify({ password }) });

test('normal login remembers this browser without saving credentials in JavaScript', async () => {
  const response = await onRequest({ request: login('test-password'), env });
  assert.equal(response.status, 200);
  const cookie = response.headers.get('Set-Cookie');
  assert(cookie.startsWith('__Host-ccAdmin='));
  for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', `Max-Age=${SESSION_SECONDS}`]) assert(cookie.includes(attribute));
  assert(!cookie.includes('test-password'));
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const restored = await onRequest({ request: request(cookie.split(';')[0]), env });
  assert.equal(restored.status, 200);
  assert.equal((await restored.json()).authenticated, true);
  assert.equal((await onRequest({ request: request(), env })).status, 401);
});

test('rejects wrong password, cross-origin login and unavailable authentication', async () => {
  assert.equal((await onRequest({ request: login('wrong'), env })).status, 401);
  assert.equal((await onRequest({ request: login('test-password', 'https://other.example'), env })).status, 403);
  assert.equal((await onRequest({ request: login('test-password'), env: {} })).status, 503);
  assert.equal((await onRequest({ request: new Request(origin + '/api/admin-session', { method: 'DELETE' }), env })).status, 405);
});

test('rejects expired, forged and malformed sessions and invalidates sessions on password change', async () => {
  const now = 1800000000000;
  const cookie = (await createAdminCookie('test-password', now)).split(';')[0];
  assert.equal(await hasAdminSession(request(cookie), 'test-password', now), true);
  assert.equal(await hasAdminSession(request(cookie), 'test-password', now + SESSION_SECONDS * 1000), false);
  assert.equal(await hasAdminSession(request(cookie), 'different-password', now), false);
  assert.equal(await hasAdminSession(request(cookie.slice(0, -1) + (cookie.endsWith('a') ? 'b' : 'a')), 'test-password', now), false);
  for (const value of ['', '__Host-ccAdmin=broken', '__Host-ccAdmin=NaN.bad.token', '__Host-ccAdmin=<script>']) {
    assert.equal(await hasAdminSession(request(value), 'test-password', now), false);
  }
});

function panelLogin(fetch) {
  const html = readFileSync(new URL('../admin/dashboard.html', import.meta.url), 'utf8');
  const code = html.slice(html.indexOf('const showAdmin='), html.indexOf('\n</script>', html.indexOf('const showAdmin=')));
  const fields = Object.fromEntries(['loginGate', 'loginError', 'app', 'adminPassword', 'loginForm'].map(id => [id, { value: '', textContent: '', classList: { hidden: id === 'app', add() { this.hidden = true; }, remove() { this.hidden = false; } } }]));
  const button = {};
  fields.loginForm.querySelector = () => button;
  const context = vm.createContext({ $: id => fields[id], fetch, AbortSignal, sessionStorage: { removeItem() {} } });
  vm.runInContext(code, context);
  return { context, fields, button };
}

test('panel restores remembered login on page load and uses only normal login when needed', async () => {
  const restored = panelLogin(async () => new Response('{}', { status: 200 }));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(restored.fields.loginGate.classList.hidden, true);
  assert.equal(restored.fields.app.classList.hidden, false);
  const calls = [];
  const fresh = panelLogin(async (url, options) => {
    calls.push({ url, options });
    return new Response('{}', { status: options.method === 'POST' ? 200 : 401 });
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fresh.fields.loginGate.classList.hidden, false);
  fresh.fields.adminPassword.value = 'test-password';
  await fresh.fields.loginForm.onsubmit({ preventDefault() {} });
  assert.equal(fresh.fields.loginGate.classList.hidden, true);
  assert.equal(fresh.fields.adminPassword.value, '');
  assert.equal(calls[1].url, '/api/admin-session');
  assert.equal(calls[1].options.credentials, 'same-origin');
  assert.equal(fresh.button.disabled, false);
});
