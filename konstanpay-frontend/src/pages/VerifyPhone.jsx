import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import Icon from '../components/Icon';
import { ShieldArt } from '../components/Visuals';

export default function VerifyPhone() {
  const { user, ready, refresh } = useAuth(); const nav = useNavigate();
  const [d, setD] = useState(Array(6).fill('')); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [wait, setWait] = useState(60); const refs = useRef([]);
  useEffect(() => { if (wait <= 0) return undefined; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.phoneVerified) return <Navigate to="/dashboard" replace />;
  const code = d.join('');
  const put = (i, val) => { const n = [...d]; n[i] = val; setD(n); setErr(''); };
  const onChange = (i, e) => { const v = e.target.value.replace(/\D/g, '').slice(-1); put(i, v); if (v && i < 5) refs.current[i + 1].focus(); };
  const onKey = (i, e) => { if (e.key === 'Backspace' && !d[i] && i > 0) refs.current[i - 1].focus(); };
  const onPaste = (e) => { const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (!t) return; e.preventDefault(); setD([...t.padEnd(6, ' ').split('').map((c) => c.trim())]); refs.current[Math.min(t.length, 5)].focus(); };
  async function submit(e) {
    e.preventDefault(); if (busy || code.length !== 6) return; setBusy(true); setErr('');
    try { await api.auth.verifyPhone({ code }); await refresh(); nav('/dashboard'); } catch (x) { setErr(x.message); setBusy(false); }
  }
  async function resend() { setErr(''); try { await api.auth.resendOtp(); setWait(60); setD(Array(6).fill('')); refs.current[0]?.focus(); } catch (x) { setErr(x.message); } }
  const mm = String(Math.floor(wait / 60)).padStart(2, '0'), ss = String(wait % 60).padStart(2, '0');
  return (
    <AuthShell to="/login">
      <div className="text-center"><ShieldArt />
        <h1 className="h2 fw-bold mt-3">Verify Your Account</h1><p className="text-secondary">Enter the 6-digit verification code sent to {user.phone}.</p></div>
      <form onSubmit={submit}>
        <div className={`kp-otp my-4 ${err ? 'invalid' : ''}`} onPaste={onPaste} role="group" aria-label="Verification code">
          {d.map((c, i) => <input key={i} ref={(el) => (refs.current[i] = el)} value={c} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={1} aria-label={`Digit ${i + 1}`} onChange={(e) => onChange(i, e)} onKeyDown={(e) => onKey(i, e)} autoFocus={i === 0} />)}
        </div>
        {err && <div className="kp-err text-center mb-2" role="alert">{err}</div>}
        <p className="text-center text-secondary">Didn't receive the code? <button type="button" className="btn btn-link p-0 align-baseline" style={{ minHeight: 0 }} disabled={wait > 0} onClick={resend}>Resend Code</button> {wait > 0 && `(${mm}:${ss})`}</p>
        <button className="btn btn-primary w-100 mt-4" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify & Continue'}</button>
      </form>
      <p className="text-center small text-secondary mt-3"><Icon name="lock" size={14} /> Your security matters to us.</p>
    </AuthShell>
  );
}
