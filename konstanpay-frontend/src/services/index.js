import live from './live';
import mock from './mock';
export const MODE = import.meta.env.VITE_API_MODE === 'live' ? 'live' : 'mock';
/** A production build must never run on the in-browser mock data layer. */
export const MOCK_IN_PRODUCTION = import.meta.env.PROD && MODE === 'mock';
const api = MODE === 'live' ? live : mock;
export default api;
