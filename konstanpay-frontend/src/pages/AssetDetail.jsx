import { Link, useParams } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, TxList } from '../components/ui';
import { ngn } from '../utils/format';

function Chart({ points }) {
  const v = points.map(Number), mn = Math.min(...v), mx = Math.max(...v) || 1;
  const d = v.map((x, i) => `${(i / (v.length - 1)) * 290},${60 - ((x - mn) / (mx - mn || 1)) * 55}`).join(' ');
  return <svg viewBox="0 0 290 62" width="100%" role="img" aria-label="Price chart"><polyline points={d} fill="none" stroke="#4d8bff" strokeWidth="2" /></svg>;
}

export default function AssetDetail() {
  const { symbol } = useParams();
  const state = useApi(() => api.assets.get(symbol), [symbol]);
  return (
    <Async state={state}>{(a) => (
      <>
        <h1 className="h3">{a.name} ({a.symbol})</h1>
        <div className="card card-body mb-3"><div className="kp-big mono">{ngn(a.priceNgn)}</div>
          <Chart points={a.history} /></div>
        <div className="card card-body py-1 mb-3"><div className="kp-row"><span className="text-secondary">Your balance</span><b className="mono">{a.available} {a.symbol}</b></div><div className="kp-row"><span className="text-secondary">Estimated value</span><b className="mono">{ngn(a.valueNgn)}</b></div></div>
        <div className="row g-2 mb-3">{[['/buy', 'Buy'], ['/convert', 'Convert'], ['/swap', 'Swap'], ['/withdraw', 'Withdraw']].map(([to, l]) => <div className="col-6 col-md-3" key={to}><Link className="kp-action" to={to}>{l}</Link></div>)}</div>
        <h2 className="h5">Recent activity</h2><TxList items={a.recent} />
      </>
    )}</Async>
  );
}
