import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services';
import AuthShell from '../components/AuthShell';
import Icon, { GoogleG } from '../components/Icon';
import { Field } from '../components/ui';

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [v, setV] = useState({ identifier: '', password: '', remember: true });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); if (busy) return; setErr(''); setBusy(true);
    try { const u = await login(v); nav(!u.phoneVerified ? '/verify-phone' : u.role === 'admin' ? '/admin' : '/dashboard'); }
    catch (x) { setErr(x.message); setBusy(false); }
  }
  async function google() { try { await api.auth.google(); } catch (x) { setErr(x.message); } }
  return (
    <AuthShell to="/">
      <h1 className="h2 fw-bold">Welcome Back</h1><p className="text-secondary mb-4">Log in to manage your money securely.</p>
      <form onSubmit={submit} noValidate>
        <Field id="identifier" icon="mail" label="Email or Phone Number" placeholder="you@example.com" autoComplete="username" value={v.identifier} onChange={(e) => setV({ ...v, identifier: e.target.value })} />
        <Field id="password" icon="lock" type="password" label="Password" placeholder="Enter your password" autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check"><input id="rem" type="checkbox" className="form-check-input" checked={v.remember} onChange={(e) => setV({ ...v, remember: e.target.checked })} /><label htmlFor="rem" className="form-check-label">Remember me</label></div>
          <Link to="/forgot-password">Forgot Password?</Link></div>
        {err && <div className="alert alert-danger py-2" role="alert">{err}</div>}
        <button className="btn btn-primary w-100" disabled={busy || !v.identifier || !v.password}>{busy ? 'Signing in…' : 'Log In'}</button>
      </form>
      <div className="kp-or">or</div>
      <button className="btn btn-alt w-100 d-flex align-items-center justify-content-center gap-2" onClick={google}><GoogleG /> Continue with Google</button>
      <p className="text-center text-secondary mt-4">New to KonstanPay? <Link to="/register">Create Account</Link></p>
      <p className="text-center small text-secondary"><Icon name="shield" size={14} /> Secured &amp; Encrypted</p>
    </AuthShell>
  );
}
