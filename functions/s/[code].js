import { CODE_PATTERN, validateSession } from '../_lib/climbing-sessions.js';

function errorPage(status) {
  const missing = status === 404;
  return new Response(`<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Climbing Cyprus</title><body style="font:18px/1.6 Arial,sans-serif;max-width:640px;margin:60px auto;padding:24px"><h1>${missing ? 'הקישור לא נמצא' : 'לא ניתן לטעון כרגע את פרטי הפעילות'}</h1><p>${missing ? 'בדקו שהעתקתם את הקישור המלא, או צרו איתי קשר לקבלת קישור חדש.' : 'נסו לרענן בעוד כמה רגעים. אם הבעיה נמשכת, צרו איתי קשר.'}</p><section lang="en" dir="ltr"><h2>${missing ? 'Activity link not found' : 'Activity details are temporarily unavailable'}</h2><p>${missing ? 'Please check that you copied the full link, or contact me for a new link.' : 'Please refresh in a moment. If the problem continues, contact me.'}</p></section><a href="https://wa.me/972504443328">WhatsApp</a></body></html>`, {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' }
  });
}

export async function onRequestGet({ request, env, params }) {
  const code = params.code;
  if (typeof code !== 'string' || !CODE_PATTERN.test(code)) return errorPage(404);
  if (!env.CLIMBING_SESSIONS) return errorPage(503);
  try {
    const stored = await env.CLIMBING_SESSIONS.get(code, 'json');
    if (!stored) return errorPage(404);
    const session = validateSession(stored);
    if (!session) return errorPage(503);
    const url = new URL(request.url);
    const language = url.searchParams.get('lang');
    if (language === 'en' || language === 'he') session.language = language;
    const base = session.language === 'en' ? '/en/' : '/';
    const assetUrl = new URL(`${base}climbing-day`, url.origin);
    const template = await env.ASSETS.fetch(new Request(assetUrl));
    if (!template.ok) return errorPage(503);
    // The normal activity page is served at the short URL, without a redirect.
    const settings = JSON.stringify({ ...session, code }).replace(/</g, '\\u003c');
    const response = new HTMLRewriter()
      .on('head', { element(head) {
        head.prepend(`<base href="${base}"><script id="climbingDaySettings" type="application/json">${settings}</script>`, { html: true });
      } })
      .on('meta[property="og:url"]', { element(meta) { meta.setAttribute('content', url.origin + url.pathname + (language ? `?lang=${session.language}` : '')); } })
      .transform(template);
    const result = new Response(response.body, response);
    result.headers.set('Cache-Control', 'no-store');
    result.headers.set('X-Robots-Tag', 'noindex, nofollow');
    result.headers.set('Referrer-Policy', 'no-referrer');
    return result;
  } catch {
    return errorPage(503);
  }
}
