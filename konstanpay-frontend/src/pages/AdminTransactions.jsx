import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, StatusBadge } from '../components/ui';
import { TYPE_LABELS, dateTime, money } from '../utils/format';

export default function AdminTransactions() {
  const [params] = useSearchParams(); const [q, setQ] = useState(params.get('q') || ''); const [status, setStatus] = useState('');
  const state = useApi(() => api.admin.transactions({ q, status }), [q, status]);
  return (
    <>
      <h1 className="h3">Transactions</h1>
      <div className="row g-2 mb-3"><div className="col-md-8"><input className="form-control" aria-label="Search" placeholder="Reference or description" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="col-md-4"><select className="form-select" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{['pending', 'processing', 'completed', 'failed'].map((s) => <option key={s}>{s}</option>)}</select></div></div>
      <Async state={state}>{({ items }) => (
        <div className="card card-body"><div className="table-responsive"><table className="table mb-0 text-nowrap"><thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>Status</th><th>Provider ref</th><th>Date</th></tr></thead>
          <tbody>{items.map((t) => <tr key={t.id}><td>{t.reference}</td><td>{TYPE_LABELS[t.type] || t.type}</td><td>{money(t.amount)}</td><td><StatusBadge status={t.status} /></td><td>{t.providerReference || '—'}</td><td>{dateTime(t.createdAt)}</td></tr>)}</tbody></table></div>
          <p className="small text-secondary mt-2 mb-0">Read-only. Admins cannot edit balances or mark transactions successful from this UI.</p></div>
      )}</Async>
    </>
  );
}
