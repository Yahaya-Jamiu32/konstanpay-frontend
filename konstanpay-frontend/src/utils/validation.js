// UX-only validation. The backend MUST re-validate everything.
export const NG_PHONE = /^(0|\+?234)[789][01]\d{8}$/;
export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
export const isAmount = (v) => /^\d+(\.\d{1,8})?$/.test(v) && Number(v) > 0;
export const passwordScore = (p) => [/.{8,}/, /[a-z]/, /[A-Z]/, /\d/, /[^\w]/].reduce((s, r) => s + r.test(p), 0);
export const STRENGTH = ['Very weak', 'Weak', 'Weak', 'Fair', 'Good', 'Strong'];
