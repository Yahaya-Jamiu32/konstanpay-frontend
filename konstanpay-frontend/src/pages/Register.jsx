import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services';
import AuthShell from '../components/AuthShell';
import { GoogleG } from '../components/Icon';
import { Field } from '../components/ui';
import { NG_PHONE, STRENGTH, isEmail, passwordScore } from '../utils/validation';

export default function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [v, setV] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false });
  const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); if (busy) return;
    const x = {};
    if (v.name.trim().length < 3) x.name = 'Enter your full name.';
    if (!isEmail(v.email)) x.email = 'Enter a valid email address.';
    if (!NG_PHONE.test(v.phone.replace(/\s/g, ''))) x.phone = 'Enter a valid Nigerian phone number.';
    if (passwordScore(v.password) < 4) x.password = 'Use 8+ characters with upper, lower case and a number.';
    if (v.confirm !== v.password) x.confirm = 'Passwords do not match.';
    if (!v.terms) x.terms = 'Please accept the Terms of Service and Privacy Policy.';
    setErrs(x); setMsg(''); if (Object.keys(x).length) return;
    setBusy(true);
    try { await register({ name: v.name.trim(), email: v.email.trim(), phone: v.phone.replace(/\s/g, ''), password: v.password }); nav('/verify-phone'); }
    catch (err) { setErrs(err.fields || {}); setMsg(Object.keys(err.fields || {}).length ? '' : err.message); setBusy(false); }
  }
  async function google() { try { await api.auth.google(); } catch (x) { setMsg(x.message); } }
  return (
    <AuthShell to="/">
      <h1 className="h2 fw-bold">Create your account</h1><p className="text-secondary mb-4">Start your financial journey with KonstanPay.</p>
      <form onSubmit={submit} noValidate>
        <Field id="name" icon="user" label="Full Name" placeholder="Enter your full name" autoComplete="name" value={v.name} onChange={set('name')} error={errs.name} />
        <Field id="email" icon="mail" label="Email Address" type="email" placeholder="you@example.com" autoComplete="email" value={v.email} onChange={set('email')} error={errs.email} />
        <Field id="phone" icon="phone" label="Phone Number" type="tel" placeholder="+234 801 234 5678" autoComplete="tel" value={v.phone} onChange={set('phone')} error={errs.phone} />
        <Field id="password" icon="lock" type="password" label="Password" placeholder="Create a strong password" autoComplete="new-password" value={v.password} onChange={set('password')} error={errs.password} hint={v.password && `Strength: ${STRENGTH[passwordScore(v.password)]}`} />
        <Field id="confirm" icon="lock" type="password" label="Confirm Password" placeholder="Confirm your password" autoComplete="new-password" value={v.confirm} onChange={set('confirm')} error={errs.confirm} />
        <div className="form-check mb-3"><input id="terms" type="checkbox" className="form-check-input" checked={v.terms} onChange={(e) => setV({ ...v, terms: e.target.checked })} />
          <label htmlFor="terms" className="form-check-label">I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</label>
          {errs.terms && <div className="kp-err">{errs.terms}</div>}</div>
        {msg && <div className="alert alert-danger py-2" role="alert">{msg}</div>}
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
      </form>
      <div className="kp-or">OR</div>
      <button className="btn btn-alt w-100 d-flex align-items-center justify-content-center gap-2" onClick={google}><GoogleG /> Continue with Google</button>
      <p className="text-center text-secondary mt-4">Already have an account? <Link to="/login">Log In</Link></p>
    </AuthShell>
  );
}
