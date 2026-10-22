// REAL backend adapter. Every call maps 1:1 to docs/API_CONTRACT.md.
import { http, API_BASE } from './http';
const get = (path, query) => http('GET', path, { query });
const post = (path, body, idempotencyKey) => http('POST', path, { body, idempotencyKey });

const api = {
  auth: {
    me: () => get('/auth/me'),
    login: (b) => post('/auth/login', b),
    register: (b) => post('/auth/register', b),
    logout: () => post('/auth/logout'),
    verifyPhone: (b) => post('/auth/verify-phone', b),
    resendOtp: () => post('/auth/resend-otp'),
    forgotPassword: (b) => post('/auth/forgot-password', b),
    resetPassword: (b) => post('/auth/reset-password', b),
  },
  dashboard: { get: () => get('/dashboard') },
  wallet: { get: () => get('/wallet'), depositInstructions: (q) => get('/wallet/deposit-instructions', q) },
  quotes: { create: (kind, b) => post(kind === 'swap' ? '/swaps/quote' : '/conversions/quote', b) },
  conversions: { create: (b, key) => post('/conversions', b, key) },
  swaps: { create: (b, key) => post('/swaps', b, key) },
  transactions: { list: (q) => get('/transactions', q), get: (id) => get('/transactions/' + encodeURIComponent(id)) },
  utilities: {
    providers: (service) => get('/utilities/providers', { service }),
    quote: (b) => post('/utilities/quote', b),
    pay: (b, key) => post('/utilities/payments', b, key),
  },
  notifications: { list: () => get('/notifications'), markAllRead: () => http('PATCH', '/notifications/read-all') },
  admin: { overview: (q) => get('/admin/overview', q) },
};

Object.assign(api, {
  assets: { get: (symbol) => get('/assets/' + encodeURIComponent(symbol)) },
  purchases: { quote: (b) => post('/purchases/quote', b), create: (b, k) => post('/purchases', b, k) },
  bankAccounts: { banks: () => get('/bank-accounts/banks'), list: () => get('/bank-accounts'), verify: (b) => post('/bank-accounts/verify', b), create: (b) => post('/bank-accounts', b) },
  bankWithdrawals: { quote: (b) => post('/bank-withdrawals/quote', b), create: (b, k) => post('/bank-withdrawals', b, k) },
  cryptoWithdrawals: { quote: (b) => post('/crypto-withdrawals/quote', b), create: (b, k) => post('/crypto-withdrawals', b, k) },
  kyc: { get: () => get('/kyc'), submit: (b) => post('/kyc', b) },
  support: { list: () => get('/support/tickets'), create: (b) => post('/support/tickets', b) },
  security: { get: () => get('/user/security'), changePassword: (b) => post('/user/change-password', b) },
});
api.auth.google = () => { window.location.assign(API_BASE + '/auth/google'); return new Promise(() => {}); };
api.utilities.validate = (b) => post('/utilities/validate-customer', b);
api.admin = {
  ...api.admin,
  kycQueue: () => get('/admin/kyc'),
  kycDecision: (id, b) => post(`/admin/kyc/${encodeURIComponent(id)}/decision`, b),
  users: (q) => get('/admin/users', q),
  setUserStatus: (id, status) => http('PATCH', `/admin/users/${encodeURIComponent(id)}/status`, { body: { status } }),
  transactions: (q) => get('/admin/transactions', q),
  audit: () => get('/admin/audit-logs'),
};
export default api;
