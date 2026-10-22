import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Field, Modal, ReviewCard, Select } from '../components/ui';
import Icon from '../components/Icon';
import { NG_PHONE, isAmount } from '../utils/validation';
import { money, ngn, TYPE_LABELS } from '../utils/format';

const SERVICES = [['airtime', 'mobile', 'Airtime', 'Instant top-up'], ['data', 'data', 'Mobile Data', 'Data bundles'], ['electricity', 'bolt', 'Electricity', 'Power & utility tokens'], ['cable', 'tv', 'Cable TV', 'Subscription renewal']];
const LABEL = { airtime: 'Phone Number', data: 'Phone Number', electricity: 'Meter Number / Identifier', cable: 'Smartcard Number' };

export default function Pay() {
  const nav = useNavigate(); const idem = useRef(null);
  const [service, setService] = useState('electricity');
  const prov = useApi(() => api.utilities.providers(service), [service]);
  const wallet = useApi(() => api.wallet.get(), []);
  const recent = useApi(() => api.transactions.list({ types: 'airtime,data,electricity,cable', page: 1 }), []);
  const [f, setF] = useState({ provider: '', recipient: '', amount: '' });
  const [quote, setQuote] = useState(null); const [customer, setCustomer] = useState(''); const [err, setErr] = useState({}); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const providers = prov.data?.providers || []; const provider = f.provider || providers[0]?.id || '';
  const limits = prov.data?.limits || { min: '100', max: '1000000' };
  const phone = service === 'airtime' || service === 'data';
  const recOk = phone ? NG_PHONE.test(f.recipient) : /^\d{8,13}$/.test(f.recipient);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pick = (s) => { setService(s); setF({ provider: '', recipient: '', amount: '' }); setQuote(null); setCustomer(''); setErr({}); };

  useEffect(() => { // verify customer for meter / smartcard
    setCustomer(''); if (phone || !recOk || !provider) return undefined;
    let live = true; api.utilities.validate({ service, provider, recipient: f.recipient }).then((r) => live && setCustomer(r.customerName || '')).catch((e) => live && setErr((x) => ({ ...x, recipient: e.fields?.recipient || e.message })));
    return () => { live = false; };
  }, [service, provider, f.recipient, recOk, phone]);
  useEffect(() => { // debounce quote
    setQuote(null); const x = {};
    if (f.recipient && !recOk) x.recipient = `Enter a valid ${LABEL[service].toLowerCase()}.`;
    if (f.amount && (!isAmount(f.amount) || Number(f.amount) < Number(limits.min) || Number(f.amount) > Number(limits.max))) x.amount = `Enter an amount between ${ngn(limits.min)} and ${ngn(limits.max)}.`;
    setErr(x); if (!recOk || !isAmount(f.amount) || x.amount || !provider) return undefined;
    const t = setTimeout(() => api.utilities.quote({ service, provider, recipient: f.recipient, amount: f.amount }).then((q) => { setQuote(q); idem.current = crypto.randomUUID(); }).catch((e) => setErr({ amount: e.fields?.amount || e.message })), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, provider, f.recipient, f.amount, recOk]);

  async function pay() { if (busy) return; setBusy(true); setMsg(''); try { const tx = await api.utilities.pay({ quoteId: quote.id }, idem.current); nav(`/transactions/${tx.id}`); } catch (e) { setMsg(e.message); setBusy(false); } }
  const pname = providers.find((p) => p.id === provider)?.name;
  return (
    <>
      <div className="mb-3"><h1 className="h3 mb-1">Pay Bills</h1><p className="text-secondary mb-0">Quick, easy and secure bill payments.</p></div>
      <div className="kp-two" style={{ gridTemplateColumns: undefined }}>
        <section className="kp-card" aria-label="Pay your everyday bills"><h2 className="kp-title">Pay Your Everyday Bills</h2>
          <div className="row g-2 mb-3" role="tablist">{SERVICES.map(([k, i, l, s]) => (
            <div className="col-6 col-md-3" key={k}><button role="tab" aria-selected={service === k} className={`kp-tile w-100 ${service === k ? 'sel' : ''}`} onClick={() => pick(k)}><Icon name={i} size={26} className="ti" /><span className="fw-semibold">{l}</span><span className="small text-secondary" style={{ fontSize: '.7rem' }}>{s}</span></button></div>))}</div>
          <Async state={prov}>{() => (
            <>
              <Select id="provider" icon="bills" label="Service Provider" value={provider} onChange={set('provider')} options={providers.map((p) => ({ value: p.id, label: p.name }))} />
              <Field id="recipient" icon={phone ? 'phone' : 'bolt'} label={LABEL[service]} inputMode="numeric" placeholder={phone ? '08012345678' : 'Enter number'} value={f.recipient} onChange={set('recipient')} error={err.recipient} ok={customer && `Verified: ${customer}`} />
              <Field id="amount" icon="card" label="Amount (NGN)" inputMode="decimal" placeholder="0.00" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^\d.]/g, '') })} error={err.amount} hint={`Min: ${ngn(limits.min)}  Max: ${ngn(limits.max)}`} />
              <Select id="from" icon="wallet" label="Pay From" value="ngn" onChange={() => {}} options={[{ value: 'ngn', label: `Naira Wallet (${ngn(wallet.data?.ngn.available || 0)} Available)` }]} />
            </>)}</Async>
        </section>
        <aside>
          <div className="kp-card"><h2 className="kp-title">Transaction Summary</h2>
            <div className="fw-semibold mb-1">{pname ? `${pname}` : '—'}</div>
            {[[LABEL[service].split(' /')[0], f.recipient || '—'], ['Amount', quote ? money(quote.amount) : '—'], ['Service Fee', quote ? money(quote.fee) : '—']].map(([k, v]) => <div className="kp-row" key={k}><span className="text-secondary">{k}</span><span className="mono">{v}</span></div>)}
            <div className="kp-row"><b>Total Pay:</b><b className="mono fs-5">{quote ? money(quote.total) : '—'}</b></div>
            <button className="btn btn-primary w-100 mt-2" disabled={!quote} onClick={() => { setMsg(''); setOpen(true); }}>{quote ? `Proceed to Pay ${money(quote.total)}` : 'Proceed to Pay'}</button></div>
          <div className="kp-card"><div className="d-flex justify-content-between"><h2 className="kp-title m-0">Recent Bill Payments</h2><Link to="/transactions" className="small">View All</Link></div>
            <Async state={recent}>{({ items }) => items.length ? items.slice(0, 4).map((t) => (
              <Link to={`/transactions/${t.id}`} className="kp-row text-white" key={t.id}><div className="min-w-0"><div className="fw-semibold text-truncate small">{TYPE_LABELS[t.type]}</div><div className="small text-secondary text-truncate">{t.description}</div></div><div className="text-end"><div className="mono small kp-num">{money(t.amount)}</div><span className={`kp-pill ${t.status === 'completed' ? 'ok' : 'warn'}`}>{t.status}</span></div></Link>)) : <p className="text-secondary small mt-2 mb-0">No bill payments yet.</p>}</Async></div>
        </aside>
      </div>
      {open && quote && <Modal title="Review payment" onClose={() => !busy && setOpen(false)}>
        <ReviewCard busy={busy} msg={msg} onConfirm={pay} label="Confirm Payment" rows={[['Service', TYPE_LABELS[service]], ['Provider', pname], [LABEL[service].split(' /')[0], f.recipient], ...(customer ? [['Customer', customer]] : []), ['Amount', money(quote.amount)], ['Fee', money(quote.fee)], ['Total', money(quote.total)]]} /></Modal>}
    </>
  );
}
