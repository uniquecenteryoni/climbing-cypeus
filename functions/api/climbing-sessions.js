import { json, passwordMatches, validateSession } from '../_lib/climbing-sessions.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, 403);
  if (!env.CLIMBING_SESSIONS || !env.CLIMBING_ADMIN_PASSWORD) return json({ error: 'Short links are not configured' }, 503);
  if (Number(request.headers.get('Content-Length')) > 2048) return json({ error: 'Request too large' }, 413);
  let data;
  try {
    const body = await request.text();
    if (body.length > 2048) return json({ error: 'Request too large' }, 413);
    data = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!await passwordMatches(data?.password, env.CLIMBING_ADMIN_PASSWORD)) return json({ error: 'Invalid password' }, 401);
  const session = validateSession(data);
  if (!session) return json({ error: 'Invalid activity details' }, 400);
  try {
    // 96 random bits; activity details cannot be decoded from this identifier.
    const code = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(12))))
      .replace(/\+/g, '-').replace(/\//g, '_');
    // No expiry: sent customer links must survive future site deployments.
    await env.CLIMBING_SESSIONS.put(code, JSON.stringify(session));
    return json({ code, url: new URL(`/s/${code}`, request.url).href }, 201);
  } catch {
    return json({ error: 'Could not save activity' }, 503);
  }
}
