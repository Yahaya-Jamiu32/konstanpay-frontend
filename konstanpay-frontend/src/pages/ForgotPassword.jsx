import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services';
import { Field } from '../components/ui';
import { isEmail } from '../utils/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState(''); const [err, setErr] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); if (!isEmail(email)) return setErr('Enter a valid email address.');
    setBusy(true); setErr('');
    try { await api.auth.forgotPassword({ email }); setDone(true); } catch (x) { setErr(x.message); }
    setBusy(false);
  }
  return (
    <div className="kp-auth">
      <h1 className="h3">Reset password</h1>
      {done ? <div className="alert alert-success">If an account exists for that email, a reset link has been sent.</div> : (
        <form onSubmit={submit} noValidate><Field id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={err} />
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button></form>
      )}
      <p className="mt-3"><Link to="/login">Back to login</Link></p>
    </div>
  );
}
