import { useState } from 'react';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Field, Select } from '../components/ui';

export default function BankAccounts() {
  const list = useApi(() => api.bankAccounts.list(), []);
  const banks = useApi(() => api.bankAccounts.banks(), []);
  const [f, setF] = useState({ bankCode: '', accountNumber: '' }); const [v, setV] = useState(null); const [err, setErr] = useState({}); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const code = (items) => f.bankCode || items[0].code;
  const reset = () => setV(null);
  async function verify(e, items) {
    e.preventDefault(); if (!/^\d{10}$/.test(f.accountNumber)) return setErr({ accountNumber: 'Enter a 10-digit account number.' });
    setBusy(true); setErr({}); setMsg('');
    try { setV(await api.bankAccounts.verify({ bankCode: code(items), accountNumber: f.accountNumber })); } catch (x) { setErr(x.fields || {}); setMsg(Object.keys(x.fields || {}).length ? '' : x.message); }
    setBusy(false);
  }
  async function save() {
    setBusy(true);
    try { await api.bankAccounts.create({ bankCode: v.bankCode, accountNumber: f.accountNumber }); setF({ bankCode: '', accountNumber: '' }); setV(null); list.reload(); } catch (x) { setMsg(x.message); }
    setBusy(false);
  }
  return (
    <>
      <h1 className="h3">Bank accounts</h1>
      <Async state={list}>{({ items }) => (
        <div className="card card-body py-1 mb-3">{items.length ? items.map((a) => (
          <div className="kp-row" key={a.id}><div><b>{a.bankName}</b> {a.accountNumberMasked}<div className="small text-secondary">{a.accountName}</div></div>
            <span className={`kp-pill ${a.verified ? 'ok' : 'warn'}`}>{a.verified ? 'Verified' : 'Unverified'}</span></div>)) : <p className="text-secondary my-3">No saved accounts.</p>}</div>
      )}</Async>
      <Async state={banks}>{({ items }) => (
        <form className="card card-body" onSubmit={(e) => verify(e, items)} noValidate><h2 className="h5">Add account</h2>
          <Select id="bank" label="Bank" value={code(items)} onChange={(e) => { setF({ ...f, bankCode: e.target.value }); reset(); }} options={items.map((b) => ({ value: b.code, label: b.name }))} />
          <Field id="acc" label="Account number (10 digits)" inputMode="numeric" maxLength={10} value={f.accountNumber} onChange={(e) => { setF({ ...f, accountNumber: e.target.value.replace(/\D/g, '') }); reset(); }} error={err.accountNumber} />
          {msg && <div className="alert alert-danger py-2">{msg}</div>}
          {v ? (<>
            <div className="kp-row"><span className="text-secondary">Account name</span><b>{v.accountName}</b></div>
            <button type="button" className="btn btn-primary mt-2" onClick={save} disabled={busy}>Save account</button></>
          ) : <button className="btn btn-primary" disabled={busy}>{busy ? 'Verifying…' : 'Verify account'}</button>}
        </form>
      )}</Async>
    </>
  );
}
