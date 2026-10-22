import { useState } from 'react';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Modal } from '../components/ui';
import { dateTime } from '../utils/format';

export default function AdminKyc() {
  const state = useApi(() => api.admin.kycQueue(), []);
  const [rej, setRej] = useState(null); const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function decide(item, decision, why) {
    setBusy(true); setErr('');
    try { await api.admin.kycDecision(item.id, { decision, reason: why }); setRej(null); setReason(''); state.reload(); } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  return (
    <>
      <h1 className="h3 mb-1">KYC Verification</h1><p className="text-secondary">Review submissions. Every decision is recorded in the audit log.</p>
      {err && <div className="alert alert-danger">{err}</div>}
      <Async state={state}>{({ items }) => !items.length ? <div className="kp-card text-center text-secondary">No pending reviews.</div> : (
        <div className="kp-card py-1">{items.map((k) => (
          <div className="kp-row flex-wrap" key={k.id}><div className="d-flex align-items-center gap-3"><div className="kp-ico">{k.name[0]}</div><div><div className="fw-semibold">{k.name}</div><div className="small text-secondary">{k.idType} · submitted {dateTime(k.submittedAt)}</div></div></div>
            <div className="d-flex gap-2"><button className="btn btn-alt btn-sm" disabled={busy} onClick={() => { setRej(k); setReason(''); }}>Reject</button><button className="btn btn-primary btn-sm" disabled={busy} onClick={() => decide(k, 'approve')}>Approve</button></div></div>))}</div>)}</Async>
      {rej && <Modal title={`Reject ${rej.name}`} onClose={() => setRej(null)}>
        <label htmlFor="why" className="form-label text-secondary small">Reason shown to the user</label><textarea id="why" rows="3" className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button className="btn btn-primary w-100 mt-3" disabled={busy || reason.trim().length < 5} onClick={() => decide(rej, 'reject', reason.trim())}>{busy ? 'Saving…' : 'Confirm rejection'}</button></Modal>}
    </>
  );
}
