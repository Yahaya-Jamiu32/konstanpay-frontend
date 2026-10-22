import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, TxList } from '../components/ui';

export default function History() {
  const [params] = useSearchParams(); const [q, setQ] = useState(params.get('q') || ''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const state = useApi(() => api.transactions.list({ q, status, page }), [q, status, page]);
  return (
    <>
      <h1 className="h3">Transaction history</h1>
      <div className="card card-body mb-3"><div className="row g-2">
        <div className="col-md-8"><label htmlFor="q" className="form-label small text-secondary">Search</label><input id="q" className="form-control" placeholder="Reference or description" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        <div className="col-md-4"><label htmlFor="st" className="form-label small text-secondary">Status</label>
          <select id="st" className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>{['pending', 'processing', 'completed', 'failed', 'cancelled'].map((s) => <option key={s}>{s}</option>)}</select></div>
      </div></div>
      <Async state={state}>{(d) => (
        <>
          <TxList items={d.items} />
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-alt btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="small text-secondary">Page {d.page} of {d.pageCount}</span>
            <button className="btn btn-alt btn-sm" disabled={page >= d.pageCount} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}</Async>
    </>
  );
}
