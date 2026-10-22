// DEMO adapter: simulates the backend in the browser (localStorage). Same shapes as live.js / API_CONTRACT.md.
// NOT secure and NOT authoritative. Passwords are plaintext here ONLY because this is a throwaway demo.
import { ApiError } from './http';

const KEY = 'kp_mock_v3';
const PRICE = { BTC: 150000000, ETH: 5200000, USDT: 1550, SOL: 240000 };
const NAME = { BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether', SOL: 'Solana' };
const FEE = 0.01;
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const iso = (t = Date.now()) => new Date(t).toISOString();
const bad = (fields, message = 'Please correct the highlighted fields.') => new ApiError(422, 'VALIDATION_ERROR', message, fields);

const seed = () => ({
  session: null,
  users: [
    { id: 'u1', name: 'Muhammad', email: 'muhammad@gmail.com', phone: '08012345678', password: 'md2442', role: 'user', phoneVerified: true, kycStatus: 'not_started' },
    { id: 'u2', name: 'Admin Demo', email: 'admin@konstanpay.demo', phone: '08099999999', password: 'Admin@1234', role: 'admin', phoneVerified: true, kycStatus: 'approved' },
  ],
  bal: { NGN: '85000.00', BTC: '0.0075', ETH: '0.12', USDT: '420', SOL: '3.5' },
  tx: [
    { id: 't4', reference: 'KP-TX-0004', type: 'swap', status: 'completed', createdAt: iso(Date.now() - 864e5), amount: { value: '0.5', currency: 'SOL' }, description: 'Swap SOL → USDT', fee: { value: '0.05', currency: 'USDT' }, providerReference: null, simulated: true },
    { id: 't3', reference: 'KP-TX-0003', type: 'airtime', status: 'completed', createdAt: iso(Date.now() - 2 * 864e5), amount: { value: '2000.00', currency: 'NGN' }, description: 'MTN airtime · 08012345678', fee: { value: '0.00', currency: 'NGN' }, providerReference: null, simulated: true },
    { id: 't2', reference: 'KP-TX-0002', type: 'conversion', status: 'completed', createdAt: iso(Date.now() - 5 * 864e5), amount: { value: '150000.00', currency: 'NGN' }, description: 'Convert BTC → NGN', fee: { value: '1500.00', currency: 'NGN' }, providerReference: null, simulated: true },
    { id: 't1', reference: 'KP-TX-0001', type: 'deposit', status: 'pending', createdAt: iso(Date.now() - 6 * 864e5), amount: { value: '100', currency: 'USDT' }, description: 'USDT deposit awaiting confirmations', fee: null, providerReference: null, simulated: true },
  ],
  notes: [{ id: 'n1', title: 'Welcome to KonstanPay', createdAt: iso(Date.now() - 36e5), read: false }],
  quotes: {}, idem: {},
});
let db;
try { db = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { db = seed(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignore */ } };
const cur = () => db.users.find((u) => u.id === db.session);
const pub = ({ password, ...u }) => u;
const needUser = () => { const u = cur(); if (!u) throw new ApiError(401, 'UNAUTHENTICATED', 'Please log in.'); return u; };
const n = (v) => Number(v);
const assetsView = () => Object.keys(PRICE).map((s) => ({ symbol: s, name: NAME[s], available: db.bal[s], priceNgn: String(PRICE[s]), valueNgn: (n(db.bal[s]) * PRICE[s]).toFixed(2) }));
const addTx = (type, amount, description, fee) => {
  const seq = db.tx.length + 1;
  const tx = { id: 't' + Date.now(), reference: 'KP-TX-' + String(seq).padStart(4, '0'), type, status: 'completed', createdAt: iso(), amount, description, fee, providerReference: null, simulated: true };
  db.tx.unshift(tx);
  db.notes.unshift({ id: 'n' + Date.now(), title: `${description} completed`, createdAt: iso(), read: false });
  return tx;
};

const api = {
  auth: {
    async me() { await wait(150); return pub(needUser()); },
    async login({ identifier, password }) {
      await wait();
      const u = db.users.find((x) => (x.email === String(identifier).toLowerCase() || x.phone === identifier) && x.password === password && x.status !== 'suspended');
      if (!u) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials.');
      db.session = u.id; save(); return pub(u);
    },
    async register({ name, email, phone, password }) {
      await wait();
      if (db.users.some((x) => x.email === email.toLowerCase())) throw bad({ email: 'Registration could not be completed. Try logging in.' });
      const u = { id: 'u' + Date.now(), name, email: email.toLowerCase(), phone, password, role: 'user', phoneVerified: false, kycStatus: 'not_started' };
      db.users.push(u); db.session = u.id;
      db.bal = { NGN: '0.00', BTC: '0', ETH: '0', USDT: '0', SOL: '0' }; db.tx = []; db.notes = []; save(); return pub(u);
    },
    async logout() { await wait(100); db.session = null; save(); return null; },
    async verifyPhone({ code }) {
      await wait(); const u = needUser();
      if (code !== '123456') throw new ApiError(422, 'INVALID_OTP', 'Invalid or expired code.');
      u.phoneVerified = true; save(); return pub(u);
    },
    async resendOtp() { await wait(); return {}; },
    async forgotPassword() { await wait(); return { accepted: true }; }, // always generic
    async resetPassword() { await wait(); return {}; },
  },
  dashboard: {
    async get() {
      await wait(); needUser(); const assets = assetsView();
      return { totalNgn: (assets.reduce((t, a) => t + n(a.valueNgn), 0) + n(db.bal.NGN)).toFixed(2), ngnAvailable: db.bal.NGN, assets, recent: db.tx.slice(0, 4), pricesSimulated: true };
    },
  },
  wallet: {
    async get() { await wait(); needUser(); return { ngn: { available: db.bal.NGN }, assets: assetsView(), simulated: true }; },
    async depositInstructions({ asset, network }) {
      await wait(); needUser();
      return { asset, network, available: false, address: null, reason: 'Deposit addresses for this asset are temporarily unavailable. Please try again later.', simulated: true };
    },
  },
  quotes: {
    async create(kind, { from, to, amount }) {
      await wait(); needUser();
      if (!PRICE[from] || (kind === 'swap' ? !PRICE[to] : to !== 'NGN')) throw bad({ from: 'Unsupported asset pair.' });
      if (from === to) throw bad({ to: 'Choose two different assets.' });
      if (!(n(amount) > 0)) throw bad({ amount: 'Enter a valid amount.' });
      if (n(amount) > n(db.bal[from])) throw bad({ amount: 'Insufficient balance.' });
      const gross = n(amount) * PRICE[from], fee = gross * FEE, net = gross - fee;
      const swap = kind === 'swap';
      const q = {
        id: 'q' + Date.now(), kind, from, to, amount, expiresAt: iso(Date.now() + 30000),
        rate: swap ? { value: (PRICE[from] / PRICE[to]).toFixed(8), label: `1 ${from} = ${(PRICE[from] / PRICE[to]).toFixed(6)} ${to}` } : { value: String(PRICE[from]), label: `1 ${from} = ₦${PRICE[from].toLocaleString()}` },
        fee: swap ? { value: (fee / PRICE[to]).toFixed(8), currency: to } : { value: fee.toFixed(2), currency: 'NGN' },
        receive: swap ? { value: (net / PRICE[to]).toFixed(8), currency: to } : { value: net.toFixed(2), currency: 'NGN' },
        simulated: true,
      };
      if (!swap && net < 1000) throw bad({ amount: 'Below minimum of ₦1,000.' });
      db.quotes[q.id] = q; save(); return q;
    },
  },
  conversions: { create: (b, k) => settle(b, k, 'conversion') },
  swaps: { create: (b, k) => settle(b, k, 'swap') },
  transactions: {
    async list({ q = '', status = '', page = 1 } = {}) {
      await wait(); needUser();
      const items = db.tx.filter((t) => (!status || t.status === status) && `${t.reference} ${t.type} ${t.description}`.toLowerCase().includes(q.toLowerCase()));
      const size = 10; return { items: items.slice((page - 1) * size, page * size), page: Number(page), pageCount: Math.max(1, Math.ceil(items.length / size)) };
    },
    async get(id) { await wait(); needUser(); const t = db.tx.find((x) => x.id === id); if (!t) throw new ApiError(404, 'NOT_FOUND', 'Transaction not found.'); return t; },
  },
  utilities: {
    async providers(service) {
      await wait(200); needUser();
      const m = { airtime: ['MTN', 'Airtel', 'Glo', '9mobile'], data: ['MTN', 'Airtel', 'Glo', '9mobile'], electricity: ['Ikeja Electric', 'Eko DisCo', 'Abuja DisCo'], cable: ['DStv', 'GOtv', 'StarTimes'] };
      return { service, providers: (m[service] || []).map((p) => ({ id: p.toLowerCase().replace(/\s/g, '-'), name: p })), plans: [], simulated: true };
    },
    async quote({ service, provider, recipient, amount }) {
      await wait(); needUser();
      if (!(n(amount) >= 50)) throw bad({ amount: 'Minimum amount is ₦50.' });
      if (n(amount) > n(db.bal.NGN)) throw bad({ amount: 'Insufficient NGN balance.' });
      const q = { id: 'uq' + Date.now(), service, provider, recipient, amount: { value: n(amount).toFixed(2), currency: 'NGN' }, fee: { value: '0.00', currency: 'NGN' }, total: { value: n(amount).toFixed(2), currency: 'NGN' }, customerName: null, simulated: true };
      db.quotes[q.id] = q; save(); return q;
    },
    async pay({ quoteId }, key) {
      await wait(900); needUser(); if (db.idem[key]) return db.idem[key];
      const q = db.quotes[quoteId]; if (!q) throw new ApiError(404, 'NOT_FOUND', 'Quote not found.');
      db.bal.NGN = (n(db.bal.NGN) - n(q.total.value)).toFixed(2);
      const tx = addTx(q.service, q.total, `${q.provider} ${q.service} · ${q.recipient}`, q.fee);
      db.idem[key] = tx; save(); return tx;
    },
  },
  notifications: {
    async list() { await wait(); needUser(); return { items: db.notes }; },
    async markAllRead() { await wait(100); db.notes.forEach((x) => (x.read = true)); save(); return null; },
  },
  admin: {
    async overview() {
      await wait(); const u = needUser();
      if (u.role !== 'admin') throw new ApiError(403, 'FORBIDDEN', 'Administrator permission required.');
      return { users: db.users.length, verifiedUsers: 0, pendingTx: db.tx.filter((t) => t.status === 'pending').length, failedTx: db.tx.filter((t) => t.status === 'failed').length, simulated: true,
        providers: ['Prices & quotes', 'Custody / deposits', 'Fiat collection', 'Bank payouts & name enquiry', 'Airtime / data / bills', 'SMS & email', 'Identity verification'].map((name) => ({ name, status: 'not_configured' })) };
    },
  },
};

async function settle({ quoteId }, key, kind) {
  await wait(1000); needUser();
  if (db.idem[key]) return db.idem[key]; // idempotent replay
  const q = db.quotes[quoteId];
  if (!q || q.kind !== kind) throw new ApiError(404, 'NOT_FOUND', 'Quote not found.');
  if (Date.now() > Date.parse(q.expiresAt)) throw new ApiError(409, 'QUOTE_EXPIRED', 'This quote has expired. Please request a new one.');
  db.bal[q.from] = (n(db.bal[q.from]) - n(q.amount)).toString();
  if (kind === 'swap') db.bal[q.to] = (n(db.bal[q.to]) + n(q.receive.value)).toString();
  else db.bal.NGN = (n(db.bal.NGN) + n(q.receive.value)).toFixed(2);
  const tx = addTx(kind, q.receive, kind === 'swap' ? `Swap ${q.from} → ${q.to}` : `Convert ${q.from} → NGN`, q.fee);
  db.idem[key] = tx; save(); return tx;
}

/* ---------------- extended screens (demo) ---------------- */
const BANK_LIST = ['Access Bank', 'Zenith Bank', 'GTBank', 'UBA', 'First Bank', 'Kuda', 'Moniepoint', 'OPay'];
const NETS = { BTC: ['Bitcoin'], ETH: ['Ethereum (ERC-20)'], USDT: ['Tron (TRC-20)', 'Ethereum (ERC-20)'], SOL: ['Solana'] };
const ADDR = { Bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,60}$/, 'Ethereum (ERC-20)': /^0x[a-fA-F0-9]{40}$/, 'Tron (TRC-20)': /^T[1-9A-HJ-NP-Za-km-z]{33}$/, Solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/ };
const NET_FEE = { BTC: '0.0001', ETH: '0.002', USDT: '1', SOL: '0.01' };
const ensure = () => { db.banks ||= []; db.tickets ||= []; db.audit ||= []; db.kyc ||= { status: 'not_started' }; };
const addPending = (type, amount, description, fee) => {
  const tx = { id: 't' + Date.now(), reference: 'KP-TX-' + String(db.tx.length + 1).padStart(4, '0'), type, status: 'pending', createdAt: iso(), amount, description: description + '', fee, providerReference: null, simulated: true };
  db.tx.unshift(tx); db.notes.unshift({ id: 'n' + Date.now(), title: `${description} is pending`, createdAt: iso(), read: false }); return tx;
};
const keep = (q) => { db.quotes[q.id] = q; save(); return q; };
const getQuote = (id) => { const q = db.quotes[id]; if (!q) throw new ApiError(404, 'NOT_FOUND', 'Quote not found.'); if (Date.now() > Date.parse(q.expiresAt)) throw new ApiError(409, 'QUOTE_EXPIRED', 'This quote has expired. Please review again.'); return q; };
const once = (key, fn) => { if (db.idem[key]) return db.idem[key]; const r = fn(); db.idem[key] = r; save(); return r; };

Object.assign(api, {
  assets: {
    async get(symbol) {
      await wait(); needUser();
      const a = assetsView().find((x) => x.symbol === symbol);
      if (!a) throw new ApiError(404, 'NOT_FOUND', 'Unsupported asset.');
      const history = Array.from({ length: 30 }, (_, i) => (PRICE[symbol] * (1 + Math.sin(i / 4) * 0.03 + i * 0.001)).toFixed(2));
      return { ...a, history, historySimulated: true, pricesSimulated: true, recent: db.tx.filter((t) => t.description.includes(symbol) || t.amount.currency === symbol).slice(0, 5) };
    },
  },
  purchases: {
    async quote({ asset, amountNgn }) {
      await wait(); needUser();
      if (!PRICE[asset]) throw bad({ asset: 'Unsupported asset.' });
      if (!(n(amountNgn) >= 1000)) throw bad({ amountNgn: 'Minimum purchase is ₦1,000.' });
      const fee = n(amountNgn) * FEE;
      return keep({ id: 'pq' + Date.now(), asset, pay: { value: n(amountNgn).toFixed(2), currency: 'NGN' }, fee: { value: fee.toFixed(2), currency: 'NGN' }, receive: { value: ((n(amountNgn) - fee) / PRICE[asset]).toFixed(8), currency: asset }, rate: { label: `1 ${asset} = ₦${PRICE[asset].toLocaleString()}` }, paymentMethod: 'Bank transfer', eta: 'Usually within 15 minutes', expiresAt: iso(Date.now() + 60000), simulated: true });
    },
    async create({ quoteId }, key) {
      await wait(800); needUser();
      return once(key, () => { const q = getQuote(quoteId); return addPending('purchase', q.pay, `Buy ${q.asset}`, q.fee); });
    },
  },
  bankAccounts: {
    async banks() { await wait(100); return { items: BANK_LIST.map((n2) => ({ code: n2.toLowerCase().replace(/\s/g, '-'), name: n2 })) }; },
    async list() { await wait(); needUser(); ensure(); return { items: db.banks }; },
    async verify({ bankCode, accountNumber }) {
      await wait(700); needUser();
      if (!/^\d{10}$/.test(accountNumber)) throw bad({ accountNumber: 'Enter a 10-digit account number.' });
      return { bankCode, accountNumberMasked: '••••••' + accountNumber.slice(-4), accountName: needUser().name.toUpperCase() };
    },
    async create({ bankCode, accountNumber }) {
      await wait(); needUser(); ensure();
      if (!/^\d{10}$/.test(accountNumber)) throw bad({ accountNumber: 'Enter a 10-digit account number.' });
      const a = { id: 'b' + Date.now(), bankCode, bankName: BANK_LIST.find((x) => x.toLowerCase().replace(/\s/g, '-') === bankCode) || bankCode, accountNumberMasked: '••••••' + accountNumber.slice(-4), accountName: needUser().name.toUpperCase(), verified: true };
      db.banks.push(a); save(); return a;
    },
  },
  bankWithdrawals: {
    async quote({ bankAccountId, amount }) {
      await wait(); needUser(); ensure();
      const acct = db.banks.find((b) => b.id === bankAccountId); if (!acct) throw bad({ bankAccountId: 'Select a saved account.' });
      if (!(n(amount) >= 1000)) throw bad({ amount: 'Minimum withdrawal is ₦1,000.' });
      if (n(amount) + 50 > n(db.bal.NGN)) throw bad({ amount: 'Insufficient balance.' });
      return keep({ id: 'bq' + Date.now(), bankAccountId, account: `${acct.bankName} ${acct.accountNumberMasked}`, accountName: acct.accountName, amount: { value: n(amount).toFixed(2), currency: 'NGN' }, fee: { value: '50.00', currency: 'NGN' }, receive: { value: n(amount).toFixed(2), currency: 'NGN' }, expiresAt: iso(Date.now() + 120000), simulated: true });
    },
    async create({ quoteId }, key) {
      await wait(800); needUser();
      return once(key, () => { const q = getQuote(quoteId); db.bal.NGN = (n(db.bal.NGN) - n(q.amount.value) - n(q.fee.value)).toFixed(2); return addPending('bank_withdrawal', q.amount, `Withdraw to ${q.account}`, q.fee); });
    },
  },
  cryptoWithdrawals: {
    async quote({ asset, network, address, amount }) {
      await wait(); needUser();
      if (!NETS[asset]?.includes(network)) throw bad({ network: 'Unsupported network for this asset.' });
      if (!ADDR[network].test(address || '')) throw bad({ address: `This is not a valid ${network} address.` });
      if (!(n(amount) > 0)) throw bad({ amount: 'Enter a valid amount.' });
      if (n(amount) > n(db.bal[asset])) throw bad({ amount: 'Insufficient balance.' });
      const nf = NET_FEE[asset], recv = n(amount) - n(nf); if (recv <= 0) throw bad({ amount: 'Amount must exceed the network fee.' });
      return keep({ id: 'cq' + Date.now(), asset, network, address, amount: { value: String(amount), currency: asset }, networkFee: { value: nf, currency: asset }, serviceFee: { value: '0', currency: asset }, receive: { value: recv.toString(), currency: asset }, expiresAt: iso(Date.now() + 120000), simulated: true });
    },
    async create({ quoteId }, key) {
      await wait(800); needUser();
      return once(key, () => { const q = getQuote(quoteId); db.bal[q.asset] = (n(db.bal[q.asset]) - n(q.amount.value)).toString(); return addPending('crypto_withdrawal', q.amount, `Withdraw ${q.asset} to ${q.address.slice(0, 6)}…`, q.networkFee); });
    },
  },
  kyc: {
    async get() { await wait(200); needUser(); ensure(); return db.kyc; },
    async submit(b) {
      await wait(600); needUser(); ensure();
      const f = {}; if ((b.fullName || '').trim().length < 3) f.fullName = 'Enter your legal name.'; if (!b.dob) f.dob = 'Required.'; if ((b.idNumber || '').trim().length < 6) f.idNumber = 'Enter a valid ID number.';
      if (Object.keys(f).length) throw bad(f);
      db.kyc = { status: 'pending', submittedAt: iso() }; save(); return db.kyc; // never auto-approved
    },
  },
  support: {
    async list() { await wait(); needUser(); ensure(); return { items: db.tickets }; },
    async create({ subject, category, message }) {
      await wait(); needUser(); ensure(); const f = {};
      if ((subject || '').trim().length < 4) f.subject = 'Enter a subject.'; if ((message || '').trim().length < 10) f.message = 'Please describe the issue (10+ characters).';
      if (Object.keys(f).length) throw bad(f);
      const t = { id: 's' + Date.now(), subject: subject.trim(), category, status: 'open', createdAt: iso() }; db.tickets.unshift(t); save(); return t;
    },
  },
  security: {
    async get() { await wait(); needUser(); return { twoFactorAvailable: false, twoFactorEnabled: false, sessions: [{ id: 'cur', device: 'This browser (demo)', lastActive: iso(), current: true }], loginHistory: [] }; },
    async changePassword({ current, next }) {
      await wait(); const u = needUser();
      if (u.password !== current) throw bad({ current: 'Current password is incorrect.' });
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(next)) throw bad({ next: 'Use 8+ characters with upper, lower case and a number.' });
      u.password = next; save(); return {};
    },
  },
});
const needAdmin = () => { const u = needUser(); if (u.role !== 'admin') throw new ApiError(403, 'FORBIDDEN', 'Administrator permission required.'); return u; };
api.admin = {
  ...api.admin,
  async users({ q = '' } = {}) { await wait(); needAdmin(); return { items: db.users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())).map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status || 'active', kycStatus: u.kycStatus })) }; },
  async setUserStatus(id, status) {
    await wait(); const a = needAdmin(); ensure(); const u = db.users.find((x) => x.id === id);
    if (!u || u.role === 'admin') throw new ApiError(404, 'NOT_FOUND', 'User not found.');
    u.status = status; db.audit.unshift({ id: 'a' + Date.now(), actor: a.email, action: status === 'suspended' ? 'user.suspend' : 'user.reactivate', record: u.email, createdAt: iso() }); save(); return { id, status };
  },
  async transactions({ q = '', status = '' } = {}) { await wait(); needAdmin(); return { items: db.tx.filter((t) => (!status || t.status === status) && `${t.reference} ${t.description}`.toLowerCase().includes(q.toLowerCase())) }; },
  async audit() { await wait(); needAdmin(); ensure(); return { items: db.audit }; },
};

/* ---------------- screens added with the redesign ---------------- */
const CHG = { BTC: 2.4, ETH: 1.8, USDT: 0.1, SOL: -0.6 };
const wave = (len, base, amp, drift) => Array.from({ length: len }, (_, i) => (base * (1 + Math.sin(i / 3) * amp + i * drift)).toFixed(2));
const queue = () => { db.kycQueue ||= [
  { id: 'k1', name: 'Amara Okafor', idType: 'National ID', submittedAt: iso(Date.now() - 2 * 36e5) },
  { id: 'k2', name: 'David Mensah', idType: 'Passport', submittedAt: iso(Date.now() - 4 * 36e5) },
  { id: 'k3', name: 'Blessing Alao', idType: "Driver licence", submittedAt: iso(Date.now() - 864e5) }]; return db.kycQueue; };

api.auth.google = async () => { await wait(300); throw new ApiError(503, 'UNAVAILABLE', 'Google sign-in is currently unavailable.'); };
api.dashboard = {
  async get() {
    await wait(); needUser();
    const assets = assetsView().map((a) => ({ ...a, changePct: CHG[a.symbol] }));
    const crypto = assets.reduce((t, a) => t + n(a.valueNgn), 0), total = crypto + n(db.bal.NGN);
    return { totalNgn: total.toFixed(2), ngnAvailable: db.bal.NGN, cryptoValueNgn: crypto.toFixed(2), assets, recent: db.tx.slice(0, 4),
      portfolio: { changePct7d: 12.5, series: { '1D': wave(24, total, 0.01, 0.0004), '1W': wave(28, total, 0.03, 0.003), '1M': wave(30, total, 0.05, 0.004), '1Y': wave(36, total, 0.1, 0.01) } } };
  },
};
const origQuote = api.quotes.create;
api.quotes.create = async (kind, body) => {
  const q = await origQuote(kind, body);
  if (kind === 'swap') {
    const fee = 1.2 * PRICE.USDT / PRICE[q.to], recv = n(q.receive.value) - fee;
    if (recv <= 0) throw bad({ amount: 'Amount is too small to cover fees.' });
    q.networkFee = { value: '1.2', currency: 'USDT' }; q.receive = { value: recv.toFixed(8), currency: q.to }; save();
  }
  return q;
};
const origList = api.transactions.list;
api.transactions.list = async ({ q = '', status = '', page = 1, types = '' } = {}) => {
  if (!types) return origList({ q, status, page });
  await wait(); needUser(); const set = types.split(',');
  const items = db.tx.filter((t) => set.includes(t.type) && (!status || t.status === status)); return { items: items.slice(0, 10), page: 1, pageCount: 1 };
};
const origProviders = api.utilities.providers;
api.utilities.providers = async (service) => ({ ...(await origProviders(service)), limits: { min: service === 'airtime' ? '50' : '100', max: '1000000' } });
api.utilities.validate = async ({ recipient }) => { await wait(500); const u = needUser(); if (!/^\d{8,13}$/.test(recipient)) throw bad({ recipient: 'Enter a valid number.' }); return { customerName: u.name }; };
const origKyc = api.kyc.submit;
api.kyc.submit = async (b) => { const r = await origKyc(b); const u = needUser(); queue().push({ id: 'k' + Date.now(), userId: u.id, name: u.name, idType: b.idType, submittedAt: iso() }); save(); return r; };
api.admin.overview = async ({ range = '7d' } = {}) => {
  await wait(); const u = needUser(); if (u.role !== 'admin') throw new ApiError(403, 'FORBIDDEN', 'Administrator permission required.');
  const verified = db.users.filter((x) => x.kycStatus === 'approved').length, days = range === '30d' ? 30 : 7;
  const labels = days === 7 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
  return { users: { total: 12458, deltaPct: 12.2 }, verified: { total: 8742 + verified, rate: 88.4 }, volume: { valueNgn: '48250000.00', deltaPct: 15.2 }, pending: { kyc: queue().length, disputed: db.tx.filter((t) => t.status === 'failed').length + 12 },
    trend: { labels, volume: ['1000000', '4500000', '3200000', '6200000', '3000000', '5500000', '1200000'], registrations: ['2200000', '3000000', '2800000', '3400000', '3900000', '3600000', '4100000'] },
    kycQueue: queue(), status: [{ name: 'Gateway Hub', state: 'online' }, { name: 'KYC Provider', state: 'online' }, { name: 'API Status', state: 'operational', detail: '99.98% Operational' }],
    recent: db.tx.slice(0, 5).map((t) => ({ ...t, userEmail: 'muhammad@gmail.com' })) };
};
api.admin.kycQueue = async () => { await wait(); needAdmin(); return { items: queue() }; };
api.admin.kycDecision = async (id, { decision, reason }) => {
  await wait(); const a = needAdmin(); ensure(); const i = queue().findIndex((k) => k.id === id); if (i < 0) throw new ApiError(404, 'NOT_FOUND', 'Submission not found.');
  const [k] = db.kycQueue.splice(i, 1); const status = decision === 'approve' ? 'approved' : 'rejected';
  if (k.userId) { const usr = db.users.find((x) => x.id === k.userId); if (usr) usr.kycStatus = status; if (db.session === k.userId) db.kyc = { status, reason }; }
  db.audit.unshift({ id: 'a' + Date.now(), actor: a.email, action: `kyc.${decision}`, record: k.name, createdAt: iso() }); save(); return { id, status };
};
export default api;
