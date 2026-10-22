import { useState } from 'react';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Field } from '../components/ui';
import { STRENGTH, passwordScore } from '../utils/validation';
import { dateTime } from '../utils/format';

export default function Security() {
  const state = useApi(() => api.security.get(), []);
  const [f, setF] = useState({ current: '', next: '', confirm: '' }); const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false); const [ok, setOk] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); if (busy) return; setOk(false);
    const x = {}; if (passwordScore(f.next) < 4) x.next = 'Use 8+ characters with upper, lower case and a number.'; if (f.confirm !== f.next) x.confirm = 'Passwords do not match.';
    setErrs(x); if (Object.keys(x).length) return;
    setBusy(true);
    try { await api.security.changePassword({ current: f.current, next: f.next }); setF({ current: '', next: '', confirm: '' }); setOk(true); } catch (err) { setErrs(err.fields || { current: err.message }); }
    setBusy(false);
  }
  return (
    <>
      <h1 className="h3">Security</h1>
      <form className="card card-body mb-3" onSubmit={submit} noValidate><h2 className="h5">Change password</h2>
        <Field id="current" label="Current password" type="password" autoComplete="current-password" value={f.current} onChange={set('current')} error={errs.current} />
        <Field id="next" label="New password" type="password" autoComplete="new-password" value={f.next} onChange={set('next')} error={errs.next} hint={f.next && `Strength: ${STRENGTH[passwordScore(f.next)]}`} />
        <Field id="confirm" label="Confirm new password" type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} error={errs.confirm} />
        {ok && <div className="alert alert-success py-2">Password updated.</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form>
      <Async state={state}>{(s) => (
        <>
          <div className="card card-body mb-3"><h2 className="h5">Two-factor authentication</h2>
            <p className="small text-secondary mb-0">{s.twoFactorAvailable ? (s.twoFactorEnabled ? 'Enabled.' : 'Available — not enabled.') : 'Coming soon.'}</p></div>
          <div className="card card-body py-1"><h2 className="h5 mt-2">Active sessions</h2>{s.sessions.map((x) => (
            <div className="kp-row" key={x.id}><div>{x.device}<div className="small text-secondary">Last active {dateTime(x.lastActive)}</div></div>{x.current && <span className="badge text-bg-success">Current</span>}</div>))}</div>
        </>
      )}</Async>
    </>
  );
}
