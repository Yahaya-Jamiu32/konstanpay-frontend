import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services';
import { Field, ReviewCard, Select } from '../components/ui';
import { isAmount } from '../utils/validation';
import { money } from '../utils/format';

export default function Buy() {
  const nav = useNavigate(); const idem = useRef(null);
  const [f, setF] = useState({ asset: 'BTC', amountNgn: '' }); const [errs, setErrs] = useState({}); const [q, setQ] = useState(null); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setQ(null); };
  async function quote(e) {
    e.preventDefault(); if (!isAmount(f.amountNgn)) return setErrs({ amountNgn: 'Enter a valid amount.' });
    setBusy(true); setErrs({}); setMsg('');
    try { setQ(await api.purchases.quote(f)); idem.current = crypto.randomUUID(); } catch (x) { setErrs(x.fields || {}); setMsg(Object.keys(x.fields || {}).length ? '' : x.message); }
    setBusy(false);
  }
  async function confirm() {
    if (busy) return; setBusy(true); setMsg('');
    try { const tx = await api.purchases.create({ quoteId: q.id }, idem.current); nav(`/transactions/${tx.id}`); } catch (x) { setMsg(x.message); setBusy(false); }
  }
  return (
    <>
      <h1 className="h3">Buy crypto</h1>
      <form className="card card-body" onSubmit={quote} noValidate>
        <Select id="asset" label="Asset" value={f.asset} onChange={set('asset')} options={['BTC', 'ETH', 'USDT', 'SOL']} />
        <Field id="amountNgn" label="Amount to spend (₦)" inputMode="decimal" value={f.amountNgn} onChange={set('amountNgn')} error={errs.amountNgn} />
        {msg && !q && <div className="alert alert-danger py-2">{msg}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy && !q ? 'Getting quote…' : 'Get quote'}</button>
      </form>
      {q && <ReviewCard busy={busy} msg={msg} onConfirm={confirm} label="Place order"
        rows={[['You pay', money(q.pay)], ['Rate', q.rate.label], ['Service fee', money(q.fee)], [`Estimated ${q.asset}`, money(q.receive)], ['Payment method', q.paymentMethod], ['Processing time', q.eta]]}
        note="Your order is completed once your payment is confirmed. Until then it stays Pending." />}
    </>
  );
}
