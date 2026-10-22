import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Modal, ReviewCard } from './ui';
import { Coin } from './Visuals';
import Icon from './Icon';
import { isAmount } from '../utils/validation';
import { money } from '../utils/format';

function AssetBox({ title, symbol, assets, onSymbol, children, foot }) {
  return (
    <div className="kp-card mb-0"><div className="text-secondary mb-2">{title}</div>
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div className="kp-asel"><Coin symbol={symbol} />{assets ? <select aria-label={`${title} asset`} value={symbol} onChange={(e) => onSymbol(e.target.value)}>{assets.map((a) => <option key={a}>{a}</option>)}</select> : <b>{symbol}</b>}</div>
        <div style={{ minWidth: 0, flex: 1 }}>{children}</div></div>
      <div className="text-end small text-secondary mt-1">{foot}</div>
    </div>
  );
}

/** Shared Swap / Convert flow. Server owns rates, fees, limits and balances; the client sends only a quoteId. */
export default function QuoteFlow({ kind }) {
  const swap = kind === 'swap'; const nav = useNavigate();
  const wallet = useApi(() => api.wallet.get(), []);
  const [f, setF] = useState({ from: swap ? 'USDT' : 'BTC', to: swap ? 'BTC' : 'NGN', amount: '' });
  const [quote, setQuote] = useState(null); const [left, setLeft] = useState(0); const [quoting, setQuoting] = useState(false);
  const [err, setErr] = useState(''); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const idem = useRef(null);
  const assets = wallet.data?.assets || []; const symbols = assets.map((a) => a.symbol);
  const avail = assets.find((a) => a.symbol === f.from)?.available;
  const valid = isAmount(f.amount) && f.from !== f.to;

  const fetchQuote = () => {
    setQuoting(true);
    api.quotes.create(kind, f).then((q) => { setQuote(q); setErr(''); idem.current = crypto.randomUUID(); })
      .catch((e) => { setQuote(null); setErr(e.fields?.amount || e.fields?.to || e.fields?.from || e.message); }).finally(() => setQuoting(false));
  };
  useEffect(() => { // debounce quote when inputs change
    setQuote(null); setErr('');
    if (!f.amount) return undefined; if (!valid) { setErr(f.from === f.to ? 'Choose two different assets.' : 'Enter a valid amount.'); return undefined; }
    if (avail != null && Number(f.amount) > Number(avail)) { setErr('Insufficient balance.'); return undefined; }
    const t = setTimeout(fetchQuote, 450); return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.from, f.to, f.amount, avail]);
  useEffect(() => {
    if (!quote) return undefined;
    const tick = () => setLeft(Math.max(0, Math.round((Date.parse(quote.expiresAt) - Date.now()) / 1000)));
    tick(); const t = setInterval(tick, 500); return () => clearInterval(t);
  }, [quote]);
  useEffect(() => { if (quote && left === 0 && !open && !quoting) fetchQuote(); /* auto-refresh expired quote */ // eslint-disable-next-line
  }, [left]);

  async function confirm() {
    if (busy || left <= 0) return; setBusy(true); setMsg('');
    try { const tx = await (swap ? api.swaps : api.conversions).create({ quoteId: quote.id }, idem.current); nav(`/transactions/${tx.id}`); }
    catch (e) { setMsg(e.message); if (e.code === 'QUOTE_EXPIRED') { setOpen(false); fetchQuote(); } setBusy(false); }
  }
  const pct = quote ? Math.min(100, (left / 30) * 100) : 0;
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 className="h3 mb-1">{swap ? 'Swap Crypto' : 'Convert to Naira'}</h1>
      <p className="text-secondary">{swap ? 'Exchange one cryptocurrency for another quickly and securely.' : 'Sell your crypto and receive Naira in your wallet.'}</p>
      <Async state={wallet}>{() => (
        <>
          <AssetBox title="You pay" symbol={f.from} assets={symbols} onSymbol={(s) => setF({ ...f, from: s })} foot={`Balance: ${avail} ${f.from}`}>
            <input className="kp-amt" inputMode="decimal" placeholder="0.00" aria-label="Amount to pay" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^\d.]/g, '') })} /></AssetBox>
          {swap ? <button className="kp-swapbtn" onClick={() => setF({ ...f, from: f.to, to: f.from })} aria-label="Reverse direction"><Icon name="swap" size={20} style={{ transform: 'rotate(90deg)' }} /></button> : <div style={{ height: 12 }} />}
          <AssetBox title="You receive" symbol={f.to} assets={swap ? symbols : null} onSymbol={(s) => setF({ ...f, to: s })}
            foot={swap ? `Balance: ${assets.find((a) => a.symbol === f.to)?.available} ${f.to}` : `Balance: ${wallet.data.ngn.available} NGN`}>
            <div className="kp-amt" aria-live="polite">{quoting ? '…' : quote ? quote.receive.value : '0.00'}</div></AssetBox>
          {err && <div className="kp-err mt-2" role="alert">{err}</div>}
          <div className="kp-card mt-3 py-1">
            <div className="kp-row"><span className="text-secondary d-flex gap-2"><Icon name="fee" size={18} />Exchange rate</span><span className="mono small text-end">{quote ? quote.rate.label : '—'} <button className="btn btn-link p-0 ms-1" style={{ minHeight: 0 }} onClick={fetchQuote} disabled={!valid || quoting} aria-label="Refresh rate"><Icon name="refresh" size={16} /></button></span></div>
            <div className="kp-row"><span className="text-secondary d-flex gap-2"><Icon name="tag" size={18} />Service fee</span><span className="mono">{quote ? money(quote.fee) : '—'}</span></div>
            {swap && <div className="kp-row"><span className="text-secondary d-flex gap-2"><Icon name="fee" size={18} />Network fee</span><span className="mono">{quote?.networkFee ? money(quote.networkFee) : '—'}</span></div>}
            <div className="kp-row"><span className="text-secondary d-flex gap-2"><Icon name="wallet" size={18} />Estimated Amount Received</span><b className="mono">{quote ? money(quote.receive) : '—'}</b></div>
            <div className="kp-row"><span className="text-secondary d-flex gap-2"><Icon name="clock" size={18} />Quote expires in {quote ? `${left}s` : '—'}</span>
              <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: '50%', background: `conic-gradient(var(--kp-lblue) ${pct}%, var(--kp-border) 0)` }} /></div>
          </div>
          <button className="btn btn-primary w-100" disabled={!quote || left <= 0 || quoting} onClick={() => { setMsg(''); setOpen(true); }}>{swap ? 'Preview Swap' : 'Preview Conversion'}</button>
        </>
      )}</Async>
      {open && quote && (
        <Modal title={swap ? 'Review swap' : 'Review conversion'} onClose={() => !busy && setOpen(false)}>
          <ReviewCard busy={busy} msg={msg} onConfirm={confirm} label={swap ? 'Confirm Swap' : 'Confirm Conversion'}
            rows={[['You pay', `${quote.amount} ${quote.from}`], ['Rate', quote.rate.label], ['Service fee', money(quote.fee)], ...(quote.networkFee ? [['Network fee', money(quote.networkFee)]] : []), ['You receive', money(quote.receive)], ['Quote expires', `${left}s`]]} />
        </Modal>)}
    </div>
  );
}
