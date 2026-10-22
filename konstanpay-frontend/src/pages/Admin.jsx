import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, StatusBadge } from '../components/ui';
import { TrendChart } from '../components/Visuals';
import Icon from '../components/Icon';
import { TYPE_LABELS, dateTime, money, ngn } from '../utils/format';

const Delta = ({ pct }) => pct != null && <span className={`kp-pill ${pct >= 0 ? 'ok' : 'err'} ms-2`}>{pct >= 0 ? '+' : ''}{pct}% this week</span>;
const ago = (iso) => { const m = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60000)); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`; };

function exportCsv(rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = ['Reference,User,Type,Amount,Status,Date', ...rows.map((t) => [t.reference, t.userEmail, t.type, `${t.amount.value} ${t.amount.currency}`, t.status, t.createdAt].map(esc).join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'konstanpay-transactions.csv'; a.click(); URL.revokeObjectURL(a.href);
}

export default function Admin() {
  const [range, setRange] = useState('7d');
  const state = useApi(() => api.admin.overview({ range }), [range]);
  return (
    <>
      <nav className="small mb-2" aria-label="Breadcrumb"><Link to="/dashboard">Home</Link> <span className="text-secondary">/ Admin Overview</span></nav>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div><h1 className="h3 mb-1">Administration Overview</h1><p className="text-secondary mb-0">System performance and key metrics</p></div>
        <div className="d-flex gap-2 align-items-center">
          <div className="kp-field" style={{ minHeight: 40, padding: '4px 12px' }}><Icon name="calendar" size={18} className="lead-ico" /><div className="body"><select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></div></div>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" disabled={!state.data} onClick={() => exportCsv(state.data.recent)}><Icon name="export" size={16} /> Export</button>
        </div>
      </div>
      <Async state={state}>{(d) => (
        <>
          <div className="row g-3 mb-3">
            {[['Total Users', d.users.total.toLocaleString(), 'Active accounts', <Delta pct={d.users.deltaPct} />], ['Verified Users', d.verified.total.toLocaleString(), `${d.verified.rate}% Completion Rate`, null], ['Total Transactions', ngn(d.volume.valueNgn).replace('.00', ''), 'Processed volume', <Delta pct={d.volume.deltaPct} />], ['Pending Reviews', d.pending.kyc + d.pending.disputed, `${d.pending.kyc} KYC • ${d.pending.disputed} Disputed Tx`, null]].map(([l, v, s, x]) => (
              <div className="col-6 col-lg-3" key={l}><div className="kp-card mb-0 h-100"><div className="text-secondary small">{l}</div><div className="kp-kpi mono">{v}{x}</div><div className="small text-secondary">{s}</div></div></div>))}
          </div>
          <div className="kp-two" style={{ gridTemplateColumns: undefined }}>
            <div>
              <div className="kp-card"><div className="d-flex justify-content-between flex-wrap"><h2 className="kp-title m-0">Platform Activity Trend</h2><div className="small text-secondary"><span style={{ color: '#4d8bff' }}>━</span> Transaction Volume (₦) &nbsp;<span style={{ color: '#20c997' }}>┅</span> User Registrations</div></div><TrendChart labels={d.trend.labels} a={d.trend.volume} b={d.trend.registrations} /></div>
              <div className="kp-card"><div className="d-flex justify-content-between"><h2 className="kp-title m-0">Recent Transactions</h2><Link to="/admin/transactions" className="small">View all</Link></div>
                <div className="table-responsive mt-2"><table className="table align-middle mb-0 text-nowrap"><thead><tr><th>Tx ID</th><th>User / Email</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>{d.recent.map((t) => <tr key={t.id}><td className="text-primary">{t.reference}</td><td>{t.userEmail}</td><td>{TYPE_LABELS[t.type] || t.type}</td><td className="mono">{money(t.amount)}</td><td><StatusBadge status={t.status} /></td><td>{dateTime(t.createdAt)}</td></tr>)}</tbody></table></div></div>
            </div>
            <div>
              <div className="kp-card"><h2 className="kp-title">KYC Review Queue</h2>
                {d.kycQueue.length ? d.kycQueue.slice(0, 3).map((k) => (
                  <div className="kp-row" key={k.id}><div className="d-flex align-items-center gap-2 min-w-0"><div className="kp-ico">{k.name[0]}</div><div className="min-w-0"><div className="fw-semibold text-truncate">{k.name}</div><div className="small text-secondary">{k.idType} · {ago(k.submittedAt)}</div></div></div>
                    <Link className="btn btn-primary btn-sm" to="/admin/kyc">Review</Link></div>)) : <p className="text-secondary small mb-0">No pending reviews.</p>}</div>
              <div className="kp-card"><h2 className="kp-title">System Status</h2>
                {d.status.map((s) => <div className="kp-row" key={s.name}><span>{s.name}</span><span className={s.state === 'online' || s.state === 'operational' ? 'text-success' : 'text-warning'}>{s.state === 'operational' ? s.detail : '● ' + s.state[0].toUpperCase() + s.state.slice(1)}</span></div>)}</div>
              <Link className="btn btn-alt w-100" to="/admin/audit">Audit Log Archive</Link>
            </div>
          </div>
        </>
      )}</Async>
    </>
  );
}
