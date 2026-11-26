const SITES = ['grecophatra', 'dierizos', 'koratzi', 'alikou'];
export const CODE_PATTERN = /^[A-Za-z0-9_-]{16}$/;

export function validateSession(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const { language, site, date, time, duration, price } = data;
  if (!['he', 'en'].includes(language) || !SITES.includes(site)) return null;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) return null;
  if (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  if (typeof duration !== 'number' || duration < 0.5 || duration > 24 || !Number.isInteger(duration * 2)) return null;
  if (price !== '' && (typeof price !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(price) || Number(price) > 1000000)) return null;
  return { language, site, date, time, duration, price };
}

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function passwordMatches(supplied, expected) {
  if (typeof supplied !== 'string' || !supplied || supplied.length > 256) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([supplied, expected].map(value =>
    crypto.subtle.digest('SHA-256', encoder.encode(value))));
  const a = new Uint8Array(left), b = new Uint8Array(right);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}
