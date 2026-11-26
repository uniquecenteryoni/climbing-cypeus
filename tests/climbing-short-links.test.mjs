import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createAdminCookie } from '../functions/_lib/admin-auth.js';
import { onRequest } from '../functions/api/climbing-sessions.js';
import { onRequestGet } from '../functions/s/[code].js';
import { validateSession } from '../functions/_lib/climbing-sessions.js';

const activity = { language: 'en', site: 'alikou', date: '2026-12-05', time: '09:30', duration: 3.5, price: '250' };
const origin = 'https://climbing-cyprus.com';
const cookie = (await createAdminCookie('test-password')).split(';')[0];
const request = (data, headers = {}) => new Request(`${origin}/api/climbing-sessions`, { method: 'POST', headers: { Origin: origin, Cookie: cookie, ...headers }, body: JSON.stringify(data) });
const storage = () => {
  const records = new Map();
  return { records, async put(code, value) { records.set(code, value); }, async get(code) { return records.has(code) ? JSON.parse(records.get(code)) : null; } };
};

test('creates durable opaque links for both languages, every cliff, and optional/zero prices', async () => {
  const kv = storage(), env = { CLIMBING_SESSIONS: kv, CLIMBING_ADMIN_PASSWORD: 'test-password' };
  for (const language of ['en', 'he']) for (const site of ['grecophatra', 'dierizos', 'koratzi', 'alikou']) for (const price of ['', '0', '250.50']) {
    const data = { ...activity, language, site, price };
    const response = await onRequest({ request: request(data), env });
    assert.equal(response.status, 201);
    const { code, url } = await response.json();
    assert.match(code, /^[A-Za-z0-9_-]{16}$/);
    assert.equal(url, `${origin}/s/${code}`);
    assert.deepEqual(await kv.get(code), data);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
  assert.equal(kv.records.size, 24);
});

test('rejects wrong credentials, other origins and malformed details without storing anything', async () => {
  const kv = storage(), env = { CLIMBING_SESSIONS: kv, CLIMBING_ADMIN_PASSWORD: 'test-password' };
  assert.equal((await onRequest({ request: request(activity, { Cookie: 'invalid' }), env })).status, 401);
  assert.equal((await onRequest({ request: request(activity, { Origin: 'https://other.example' }), env })).status, 403);
  assert.equal((await onRequest({ request: new Request(`${origin}/api/climbing-sessions`), env })).status, 405);
  assert.equal((await onRequest({ request: request(activity), env: {} })).status, 503);
  for (const invalid of [{ date: '2026-02-30' }, { site: '__proto__' }, { language: 'fr' }, { time: '25:00' }, { duration: 3.2 }, { duration: 0 }, { price: '-1' }, { price: '1e3' }, { price: '<script>' }, { price: null }]) {
    assert.equal(validateSession({ ...activity, ...invalid }), null);
    assert.equal((await onRequest({ request: request({ ...activity, ...invalid }), env })).status, 400);
  }
  assert.equal((await onRequest({ request: request({ padding: 'x'.repeat(2100) }), env })).status, 413);
  assert.equal((await onRequest({ request: new Request(`${origin}/api/climbing-sessions`, { method: 'POST', headers: { Origin: origin, Cookie: cookie }, body: 'broken json' }), env })).status, 400);
  assert.equal(kv.records.size, 0);
});

test('storage failures and unknown links show explicit errors rather than default activity details', async () => {
  const env = { CLIMBING_ADMIN_PASSWORD: 'test-password', CLIMBING_SESSIONS: { async put() { throw Error('offline'); }, async get() { throw Error('offline'); } } };
  assert.equal((await onRequest({ request: request(activity), env })).status, 503);
  const read = (code, settings = env) => onRequestGet({ request: new Request(`${origin}/s/${code}`), params: { code }, env: settings });
  assert.equal((await read('not-a-code')).status, 404);
  assert.equal((await read('abcdefghijklmnop')).status, 503);
  const missing = await read('abcdefghijklmnop', { CLIMBING_SESSIONS: storage() });
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('Cache-Control'), 'no-store');
  assert((await missing.text()).includes('Activity link not found'));
});

function dashboardContext(fetch) {
  const html = readFileSync(new URL('../admin/dashboard.html', import.meta.url), 'utf8');
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  const ids = ['climbingLinkLanguage', 'climbingLinkSite', 'climbingLinkPrice', 'climbingLinkTime', 'climbingLinkDate', 'climbingLinkDuration', 'loginGate', 'loginError', 'adminPassword', 'generateClimbingLink', 'generatedClimbingMessage', 'copyClimbingMessage', 'openClimbingLink', 'climbingLinkStatus', 'climbingLinkBuilder'];
  const fields = Object.fromEntries(ids.map(id => [id, { value: '', reportValidity: () => true, classList: { add() {}, remove() {} }, removeAttribute(name) { delete this[name]; }, select() {}, focus() {}, addEventListener(type, fn) { this[type] = fn; } }]));
  Object.entries({ climbingLinkLanguage: 'en', climbingLinkSite: 'alikou', climbingLinkPrice: '250', climbingLinkTime: '09:30', climbingLinkDate: '2026-12-05', climbingLinkDuration: '3.5' }).forEach(([id, value]) => fields[id].value = value);
  const context = vm.createContext({ $: id => fields[id], fetch, URL, location: { origin }, AbortController, setTimeout, clearTimeout, navigator: { clipboard: { async writeText(value) { context.copied = value; } } } });
  vm.runInContext(html.slice(html.indexOf('let climbingMessageVersion='), html.indexOf('const resetWorkspace=')), context);
  return { context, fields };
}

test('dashboard copies full localized message with the short link and no activity query', async () => {
  const { context, fields } = dashboardContext(async () => Response.json({ url: `${origin}/s/abcdefghijklmnop` }, { status: 201 }));
  assert(!readFileSync(new URL('../admin/dashboard.html', import.meta.url), 'utf8').includes('climbingLinkPassword'));
  for (const language of ['en', 'he']) {
    fields.climbingLinkLanguage.value = language;
    await context.generateClimbingLink();
    assert(fields.generatedClimbingMessage.value.startsWith(language === 'en' ? 'Hi! 😊' : 'היי! 😊'));
    assert(fields.generatedClimbingMessage.value.includes(`${origin}/s/abcdefghijklmnop`));
    assert(!fields.generatedClimbingMessage.value.includes('price='));
    assert.equal(fields.generatedClimbingMessage.lang, language);
    await context.copyClimbingMessage();
    assert.equal(context.copied, fields.generatedClimbingMessage.value);
  }
});

test('dashboard handles failed saves and discards responses for changed activity details', async () => {
  let resolve;
  const { context, fields } = dashboardContext(() => new Promise(done => resolve = done));
  const pending = context.generateClimbingLink();
  fields.climbingLinkBuilder.input({ target: { matches: () => true } });
  resolve(Response.json({ url: `${origin}/s/abcdefghijklmnop` }, { status: 201 }));
  await pending;
  assert.equal(fields.generatedClimbingMessage.value, '');
  assert.equal(fields.copyClimbingMessage.disabled, true);
  context.fetch = async () => new Response('', { status: 503 });
  await context.generateClimbingLink();
  assert.equal(fields.generatedClimbingMessage.value, '');
  assert.equal(fields.copyClimbingMessage.disabled, true);
  assert.equal(fields.generateClimbingLink.disabled, false);
});
