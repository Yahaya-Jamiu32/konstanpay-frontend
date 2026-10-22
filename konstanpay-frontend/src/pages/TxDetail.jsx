import { Link, useParams } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, StatusBadge } from '../components/ui';
import { TYPE_LABELS, dateTime, money } from '../utils/format';

export default function TxDetail() {
  const { id } = useParams();
  const state = useApi(() => api.transactions.get(id), [id]);
  return (
    <Async state={state}>{(t) => (
      <>
        <div className="card card-body">
          <img src="/logo-full.png" alt="KonstanPay" style={{ width: 150 }} />
          <h1 className="h4 mt-2">{TYPE_LABELS[t.type] || t.type} {t.status === 'completed' ? 'receipt' : 'details'}</h1>
          {[['Amount', money(t.amount)], ['Fee', t.fee ? money(t.fee) : '—'], ['Description', t.description], ['Reference', t.reference], ['Provider reference', t.providerReference || 'None'], ['Date', dateTime(t.createdAt)]].map(([k, v]) => (
            <div className="kp-row" key={k}><span className="text-secondary">{k}</span><span className="mono text-end">{v}</span></div>))}
          <div className="kp-row"><span className="text-secondary">Status</span><StatusBadge status={t.status} /></div>
          {t.status !== 'completed' && <p className="small text-secondary mt-2 mb-0">A final receipt is issued only once the transaction is completed by the provider.</p>}
          {t.status === 'completed' && <button className="btn btn-alt mt-3 no-print" onClick={() => window.print()}>Print receipt</button>}
        </div>
        <Link to="/transactions" className="d-inline-block mt-3 no-print">← Back to history</Link>
      </>
    )}</Async>
  );
}
