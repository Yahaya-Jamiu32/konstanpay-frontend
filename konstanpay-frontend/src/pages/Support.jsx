import { useState } from 'react';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Field, Select, StatusBadge } from '../components/ui';
import { dateTime } from '../utils/format';

const FAQ = [['Why is my transaction pending?', 'Providers must confirm it first. A completed receipt is issued only after confirmation.'], ['How long do deposits take?', 'It depends on the network confirmations required for the asset.'], ['How do I verify my identity?', 'Open Profile → Identity verification and submit your details. A reviewer will approve or reject it.']];

export default function Support() {
  const list = useApi(() => api.support.list(), []);
  const [f, setF] = useState({ subject: '', category: 'Account', message: '' }); const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false); const [ok, setOk] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setErrs({}); setOk(false);
    try { await api.support.create(f); setF({ subject: '', category: 'Account', message: '' }); setOk(true); list.reload(); } catch (x) { setErrs(x.fields || { message: x.message }); }
    setBusy(false);
  }
  return (
    <>
      <h1 className="h3">Support</h1>
      <form className="card card-body mb-3" onSubmit={submit} noValidate><h2 className="h5">New ticket</h2>
        <Field id="subject" label="Subject" value={f.subject} onChange={set('subject')} error={errs.subject} />
        <Select id="category" label="Category" value={f.category} onChange={set('category')} options={['Account', 'Deposit', 'Withdrawal', 'Bill payment', 'Other']} />
        <div className="mb-3"><label htmlFor="message" className="form-label text-secondary small">Message</label><textarea id="message" rows="4" className={`form-control ${errs.message ? 'is-invalid' : ''}`} value={f.message} onChange={set('message')} /><div className="invalid-feedback">{errs.message}</div></div>
        {ok && <div className="alert alert-success py-2">Ticket submitted.</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit ticket'}</button></form>
      <h2 className="h5">Your tickets</h2>
      <Async state={list}>{({ items }) => <div className="card card-body py-1 mb-3">{items.length ? items.map((t) => (
        <div className="kp-row" key={t.id}><div><b>{t.subject}</b><div className="small text-secondary">{t.category} · {dateTime(t.createdAt)}</div></div><StatusBadge status={t.status === 'open' ? 'pending' : t.status} /></div>)) : <p className="text-secondary my-3">No tickets yet.</p>}</div>}</Async>
      <h2 className="h5">FAQ</h2>
      <div className="accordion" id="faq">{FAQ.map(([q, a], i) => (<details className="card card-body mb-2" key={i}><summary className="fw-semibold">{q}</summary><p className="text-secondary mb-0 mt-2">{a}</p></details>))}</div>
    </>
  );
}
