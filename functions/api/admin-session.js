import { createAdminCookie, hasAdminSession } from '../_lib/admin-auth.js';
import { json, passwordMatches } from '../_lib/climbing-sessions.js';

export async function onRequest({ request, env }) {
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
  if (!env.CLIMBING_ADMIN_PASSWORD) return json({ error: 'Panel authentication is not configured' }, 503);
  if (request.method === 'GET') {
    const authenticated = await hasAdminSession(request, env.CLIMBING_ADMIN_PASSWORD);
    return json({ authenticated }, authenticated ? 200 : 401);
  }
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, 403);
  if (Number(request.headers.get('Content-Length')) > 1024) return json({ error: 'Request too large' }, 413);
  let data;
  try {
    const body = await request.text();
    if (body.length > 1024) return json({ error: 'Request too large' }, 413);
    data = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!await passwordMatches(data?.password, env.CLIMBING_ADMIN_PASSWORD)) return json({ error: 'Invalid password' }, 401);
  const response = json({ authenticated: true });
  response.headers.set('Set-Cookie', await createAdminCookie(env.CLIMBING_ADMIN_PASSWORD));
  return response;
}
