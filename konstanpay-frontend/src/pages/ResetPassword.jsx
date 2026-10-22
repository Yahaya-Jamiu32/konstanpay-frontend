import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services';
import { Field } from '../components/ui';
import { STRENGTH, passwordScore } from '../utils/validation';

export default function ResetPassword() {
  const [params] = useSearchParams(); const token = params.get('token') || '';
  const [f, setF] = useState({ password: '', confirm: '' }); const [errs, setErrs] = useState({}); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); const x = {};
    if (passwordScore(f.password) < 4) x.password = 'Use 8+ characters with upper, lower case and a number.'; if (f.confirm !== f.password) x.confirm = 'Passwords do not match.';
    setErrs(x); if (Object.keys(x).length) return;
    setBusy(true);
    try { await api.auth.resetPassword({ token, password: f.password }); setDone(true); } catch (err) { setErrs({ password: err.message }); }
    setBusy(false);
  }
  if (!token) return <div className="kp-auth"><div className="alert alert-danger">This reset link is invalid or has expired.</div><Link to="/forgot-password">Request a new link</Link></div>;
  return (
    <div className="kp-auth"><h1 className="h3">Set a new password</h1>
      {done ? <><div className="alert alert-success">Password updated.</div><Link className="btn btn-primary w-100" to="/login">Log in</Link></> : (
        <form onSubmit={submit} noValidate>
          <Field id="password" label="New password" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={errs.password} hint={f.password && `Strength: ${STRENGTH[passwordScore(f.password)]}`} />
          <Field id="confirm" label="Confirm password" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} error={errs.confirm} />
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Saving…' : 'Reset password'}</button></form>)}
    </div>
  );
}
