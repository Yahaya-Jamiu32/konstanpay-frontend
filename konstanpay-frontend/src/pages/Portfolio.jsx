import { Link } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async } from '../components/ui';
import { ngn } from '../utils/format';

export default function Portfolio() {
  const state = useApi(() => api.dashboard.get(), []);
  return (
    <>
      <h1 className="h3">Portfolio</h1>
      <Async state={state}>{(d) => {
        const total = Number(d.totalNgn) || 1; // display maths only (percent bars)
        const rows = [...d.assets.map((a) => ({ key: a.symbol, name: a.name, to: `/assets/${a.symbol}`, value: a.valueNgn })), { key: 'NGN', name: 'Naira', to: '/wallet', value: d.ngnAvailable }];
        return (
          <>
            <div className="card card-body mb-3"><span className="text-secondary">Total value</span><div className="kp-big mono">{ngn(d.totalNgn)}</div></div>
            <div className="card card-body mb-3"><h2 className="h5">Allocation</h2>
              {rows.map((r) => { const pc = (Number(r.value) / total) * 100; return (
                <div className="my-2" key={r.key}><div className="d-flex justify-content-between"><Link to={r.to}>{r.name} ({r.key})</Link><span className="mono small">{pc.toFixed(1)}% · {ngn(r.value)}</span></div>
                  <div className="progress" role="progressbar" aria-label={`${r.key} allocation`} aria-valuenow={Math.round(pc)} aria-valuemin="0" aria-valuemax="100" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${pc}%` }} /></div></div>); })}
            </div>
          </>
        );
      }}</Async>
    </>
  );
}
