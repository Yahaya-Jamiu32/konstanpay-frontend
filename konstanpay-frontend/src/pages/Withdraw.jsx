import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Field, ReviewCard, Select } from '../components/ui';
import { isAmount } from '../utils/validation';
import { money } from '../utils/format';

const NETS = { BTC: ['Bitcoin'], ETH: ['Ethereum (ERC-20)'], USDT: ['Tron (TRC-20)', 'Ethereum (ERC-20)'], SOL: ['Solana'] };

function useQuoted(createFn) {
  const nav = useNavigate(); const idem = useRef(null);
  const [q, setQ] = useState(null); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const [errs, setErrs] = useState({});
  return {
    q, busy, msg, errs, setErrs,
    async quote(fn) { setBusy(true); setMsg(''); setErrs({}); try { setQ(await fn()); idem.current = crypto.randomUUID(); } catch (x) { setErrs(x.fields || {}); setMsg(Object.keys(x.fields || {}).length ? '' : x.message); } setBusy(false); },
    async confirm() { if (busy) return; setBusy(true); setMsg(''); try { const tx = await createFn({ quoteId: q.id }, idem.current); nav(`/transactions/${tx.id}`); } catch (x) { setMsg(x.message); setBusy(false); } },
    reset: () => setQ(null),
  };
}

function BankForm() {
  const accts = useApi(() => api.bankAccounts.list(), []);
  const w = useQuoted(api.bankWithdrawals.create);
  const [f, setF] = useState({ bankAccountId: '', amount: '' });
  return (
    <Async state={accts}>{({ items }) => !items.length ? (
      <div className="card card-body text-center"><p>Add a bank account first.</p><div><Link className="btn btn-primary" to="/bank-accounts">Add bank account</Link></div></div>
    ) : (
      <>
        <form className="card card-body" noValidate onSubmit={(e) => { e.preventDefault(); if (!isAmount(f.amount)) return w.setErrs({ amount: 'Enter a valid amount.' }); w.quote(() => api.bankWithdrawals.quote({ ...f, bankAccountId: f.bankAccountId || items[0].id })); }}>
          <Select id="acct" label="To account" value={f.bankAccountId || items[0].id} onChange={(e) => { setF({ ...f, bankAccountId: e.target.value }); w.reset(); }} options={items.map((a) => ({ value: a.id, label: `${a.bankName} ${a.accountNumberMasked} · ${a.accountName}` }))} />
          <Field id="amount" label="Amount (₦)" inputMode="decimal" value={f.amount} onChange={(e) => { setF({ ...f, amount: e.target.value }); w.reset(); }} error={w.errs.amount} />
          {w.msg && !w.q && <div className="alert alert-danger py-2">{w.msg}</div>}
          <button className="btn btn-primary" disabled={w.busy}>{w.busy && !w.q ? 'Checking…' : 'Review'}</button>
        </form>
        {w.q && <ReviewCard busy={w.busy} msg={w.msg} onConfirm={w.confirm} label="Confirm withdrawal" rows={[['To', w.q.account], ['Account name', w.q.accountName], ['Amount', money(w.q.amount)], ['Fee', money(w.q.fee)], ['You receive', money(w.q.receive)]]} note="Your withdrawal shows as completed once the transfer is confirmed." />}
      </>
    )}</Async>
  );
}

function CryptoForm() {
  const w = useQuoted(api.cryptoWithdrawals.create);
  const [f, setF] = useState({ asset: 'USDT', network: NETS.USDT[0], address: '', amount: '' });
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); w.reset(); };
  return (
    <>
      <form className="card card-body" noValidate onSubmit={(e) => { e.preventDefault(); if (!isAmount(f.amount)) return w.setErrs({ amount: 'Enter a valid amount.' }); if (f.address.trim().length < 20) return w.setErrs({ address: 'Enter the destination address.' }); w.quote(() => api.cryptoWithdrawals.quote({ ...f, address: f.address.trim() })); }}>
        <Select id="asset" label="Asset" value={f.asset} onChange={(e) => { setF({ ...f, asset: e.target.value, network: NETS[e.target.value][0] }); w.reset(); }} options={Object.keys(NETS)} />
        <Select id="network" label="Network" value={f.network} onChange={set('network')} options={NETS[f.asset]} error={w.errs.network} />
        <Field id="address" label="Destination address" autoComplete="off" spellCheck="false" value={f.address} onChange={set('address')} error={w.errs.address} />
        <Field id="amount" label="Amount" inputMode="decimal" value={f.amount} onChange={set('amount')} error={w.errs.amount} />
        <p className="small text-secondary">Never share seed phrases or private keys. Double-check the address and network: transfers cannot be reversed.</p>
        {w.msg && !w.q && <div className="alert alert-danger py-2">{w.msg}</div>}
        <button className="btn btn-primary" disabled={w.busy}>{w.busy && !w.q ? 'Checking…' : 'Review'}</button>
      </form>
      {w.q && <ReviewCard busy={w.busy} msg={w.msg} onConfirm={w.confirm} label="Confirm withdrawal" rows={[['Asset / network', `${w.q.asset} · ${w.q.network}`], ['Address', w.q.address], ['Amount', money(w.q.amount)], ['Network fee', money(w.q.networkFee)], ['Service fee', money(w.q.serviceFee)], ['Recipient gets', money(w.q.receive)]]} note="For your security you may be asked to confirm this withdrawal." />}
    </>
  );
}

export default function Withdraw() {
  const [tab, setTab] = useState('bank');
  return (
    <>
      <h1 className="h3">Withdraw</h1>
      <div className="d-flex gap-2 mb-3">{[['bank', 'Bank (NGN)'], ['crypto', 'Crypto']].map(([k, l]) => <button key={k} className={`btn btn-sm rounded-pill ${tab === k ? 'btn-primary' : 'btn-alt'}`} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'bank' ? <BankForm /> : <CryptoForm />}
    </>
  );
}
