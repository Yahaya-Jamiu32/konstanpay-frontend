import { useState } from 'react';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Field, Select } from '../components/ui';

const LABEL = { not_started: ['secondary', 'Not started'], pending: ['warning', 'Pending review'], approved: ['success', 'Approved'], rejected: ['danger', 'Rejected'] };

export default function Kyc() {
  const state = useApi(() => api.kyc.get(), []);
  const [f, setF] = useState({ fullName: '', dob: '', idType: 'NIN', idNumber: '' }); const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setErrs({}); setMsg('');
    try { await api.kyc.submit(f); state.reload(); } catch (x) { setErrs(x.fields || {}); setMsg(Object.keys(x.fields || {}).length ? '' : x.message); }
    setBusy(false);
  }
  return (
    <>
      <h1 className="h3">Identity verification</h1>
      <Async state={state}>{(k) => (
        <>
          <div className="card card-body mb-3">Status: <span className={`badge text-bg-${LABEL[k.status][0]} align-self-start mt-1`}>{LABEL[k.status][1]}</span>
            {k.status === 'pending' && <p className="small text-secondary mt-2 mb-0">A reviewer must approve your submission. It is never auto-approved.</p>}
            {k.status === 'rejected' && <p className="small text-danger mt-2 mb-0">{k.reason || 'Your submission was rejected. Please resubmit.'}</p>}</div>
          {(k.status === 'not_started' || k.status === 'rejected') && (
            <form className="card card-body" onSubmit={submit} noValidate>
              <Field id="fullName" label="Full legal name" value={f.fullName} onChange={set('fullName')} error={errs.fullName} />
              <Field id="dob" label="Date of birth" type="date" value={f.dob} onChange={set('dob')} error={errs.dob} />
              <Select id="idType" label="ID type" value={f.idType} onChange={set('idType')} options={['NIN', 'Passport', 'Driver licence', 'Voter card']} />
              <Field id="idNumber" label="ID number" value={f.idNumber} onChange={set('idNumber')} error={errs.idNumber} />
              {msg && <div className="alert alert-danger py-2">{msg}</div>}
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit for review'}</button>
            </form>)}
        </>
      )}</Async>
    </>
  );
}
