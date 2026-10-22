// Single HTTP client. All network access goes through here.
const BASE = import.meta.env.VITE_API_BASE_URL || '/api';
export const API_BASE = BASE;

export class ApiError extends Error {
  constructor(status, code, message, fields = {}) { super(message); this.status = status; this.code = code; this.fields = fields; }
}
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export async function http(method, path, { body, query, idempotencyKey } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  if (query) Object.entries(query).forEach(([k, v]) => v != null && v !== '' && url.searchParams.set(k, v));
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  // Double-submit CSRF token (cookie -> header). See docs/API_CONTRACT.md.
  const csrf = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  if (csrf && method !== 'GET') headers['X-CSRF-Token'] = decodeURIComponent(csrf[1]);
  let res;
  try {
    // credentials:'include' -> session is an httpOnly cookie set by the backend (no tokens in JS storage).
    res = await fetch(url, { method, headers, credentials: 'include', body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach KonstanPay servers. Check your connection and try again.');
  }
  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }
  if (!res.ok || json?.success === false) {
    if (res.status === 401) onUnauthorized();
    const e = json?.error || {};
    throw new ApiError(res.status, e.code || 'UNKNOWN', e.message || 'Something went wrong. Please try again.', e.fields);
  }
  return json?.data ?? null;
}
