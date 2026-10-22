import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { TYPE_LABELS, money, shortDate } from '../utils/format';

/** Icon field: label above value, optional leading icon, optional password toggle. */
export function Field({ id, label, icon, error, hint, ok, type = 'text', right, ...props }) {
  const [show, setShow] = useState(false);
  const pw = type === 'password';
  return (
    <div className="kp-mb">
      <div className={`kp-field ${error ? 'invalid' : ''}`}>
        {icon && <Icon name={icon} className="lead-ico" />}
        <div className="body"><label htmlFor={id}>{label}</label>
          <input id={id} type={pw && show ? 'text' : type} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} {...props} /></div>
        {pw && <button type="button" className="trail" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}><Icon name={show ? 'eyeoff' : 'eye'} /></button>}
        {right}
      </div>
      {error && <div className="kp-err" id={`${id}-e`} role="alert">{error}</div>}
      {!error && ok && <div className="kp-ok">{ok}</div>}
      {!error && !ok && hint && <div className="kp-hint">{hint}</div>}
    </div>
  );
}

export function Select({ id, label, icon, value, onChange, options, error }) {
  return (
    <div className="kp-mb">
      <div className={`kp-field ${error ? 'invalid' : ''}`}>
        {icon && <Icon name={icon} className="lead-ico" />}
        <div className="body"><label htmlFor={id}>{label}</label>
          <select id={id} value={value} onChange={onChange}>{options.map((o) => (typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}</select></div>
        <Icon name="chevdown" className="lead-ico" size={18} />
      </div>
      {error && <div className="kp-err" role="alert">{error}</div>}
    </div>
  );
}

const TONE = { completed: 'ok', pending: 'warn', processing: 'info', failed: 'err', cancelled: 'mute', open: 'warn', approved: 'ok', rejected: 'err', active: 'ok', suspended: 'err' };
export const StatusBadge = ({ status }) => <span className={`kp-pill ${TONE[status] || 'mute'}`}>{status}</span>;
export const Change = ({ pct }) => pct == null ? <span className="text-secondary">—</span> : <span className={`kp-pill ${pct >= 0 ? 'ok' : 'err'}`}>{pct >= 0 ? '+' : ''}{Number(pct).toFixed(1)}%</span>;

export function Async({ state, children }) {
  if (state.loading) return <div aria-busy="true">{[1, 2, 3].map((i) => <div key={i} className="kp-skel" style={{ width: `${100 - i * 15}%` }} />)}</div>;
  if (state.error) return <div className="alert alert-danger" role="alert">{state.error.message}<div><button className="btn btn-alt btn-sm mt-2" onClick={state.reload}>Try again</button></div></div>;
  return children(state.data);
}

const TX_ICON = { conversion: 'convert', swap: 'swap', purchase: 'card', deposit: 'arrowdown', crypto_withdrawal: 'arrowup', bank_withdrawal: 'withdraw', airtime: 'mobile', data: 'data', electricity: 'bolt', cable: 'tv' };
export function TxList({ items, compact }) {
  if (!items.length) return (
    <div className="kp-card text-center"><Icon name="history" size={32} className="text-secondary" /><p className="fw-semibold mt-2 mb-1">No transactions yet</p>
      <p className="text-secondary small mb-3">Convert, swap or pay a bill to see your activity here.</p><Link className="btn btn-primary btn-sm" to="/convert">Make a conversion</Link></div>
  );
  return (
    <div className="kp-card py-1">{items.map((t) => (
      <Link to={`/transactions/${t.id}`} className="kp-row text-white" key={t.id}>
        <div className="d-flex align-items-center gap-3 min-w-0"><div className="kp-ico"><Icon name={TX_ICON[t.type] || 'history'} size={20} /></div>
          <div className="min-w-0"><div className="fw-semibold text-truncate">{TYPE_LABELS[t.type] || t.type}</div><div className="small text-secondary text-truncate">{shortDate(t.createdAt)}</div></div></div>
        <div className="text-end flex-shrink-0"><div className="mono fw-semibold kp-num">{money(t.amount)}</div><StatusBadge status={t.status} /></div>
      </Link>))}{compact}</div>
  );
}

export function ReviewCard({ rows, onConfirm, busy, msg, label = 'Confirm', note }) {
  return (
    <div className="kp-card mt-3" aria-live="polite"><h2 className="h5">Review</h2>
      {rows.map(([k, v]) => <div className="kp-row" key={k}><span className="text-secondary">{k}</span><b className="mono text-end text-break">{v}</b></div>)}
      {note && <p className="small text-secondary mt-2">{note}</p>}
      {msg && <div className="alert alert-danger py-2" role="alert">{msg}</div>}
      <button className="btn btn-primary w-100 mt-2" onClick={onConfirm} disabled={busy}>{busy ? 'Processing…' : label}</button>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="kp-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div><div className="d-flex justify-content-between align-items-center mb-2"><h2 className="h5 m-0">{title}</h2><button className="btn btn-alt btn-sm" onClick={onClose} aria-label="Close">✕</button></div>{children}</div>
    </div>
  );
}

export const PageHead = ({ title, sub }) => <div className="mb-3"><h1 className="h3 mb-1">{title}</h1>{sub && <p className="text-secondary mb-0">{sub}</p>}</div>;
