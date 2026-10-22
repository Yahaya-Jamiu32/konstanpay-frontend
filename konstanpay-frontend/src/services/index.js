import live from './live';
import mock from './mock';
export const MODE = import.meta.env.VITE_API_MODE === 'live' ? 'live' : 'mock';
/** A production build must never run on the in-browser mock data layer. */
/** Staging-only escape hatch (set for Vercel *Preview* env only, never Production). */
const ALLOW_MOCK = import.meta.env.VITE_ALLOW_MOCK === 'true';
export const MOCK_IN_PRODUCTION = import.meta.env.PROD && MODE === 'mock' && !ALLOW_MOCK;
const api = MODE === 'live' ? live : mock;
export default api;
