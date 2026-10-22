import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async, Change, TxList } from '../components/ui';
import { Coin, Spark } from '../components/Visuals';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { ngn } from '../utils/format';

const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const ACTIONS = [['/buy', 'card', 'Buy Crypto'], ['/convert', 'convert', 'Convert'], ['/swap', 'swap', 'Swap'], ['/withdraw', 'withdraw', 'Withdraw']];

export default function Dashboard() {
  const { user } = useAuth();
  const state = useApi(() => api.dashboard.get(), []);
  const [range, setRange] = useState('1W'); const [hide, setHide] = useState(false);
  return (
    <>
      <div className="mb-3"><h1 className="h3 mb-1">{greet()}, {user.name.split(' ')[0]} 👋</h1><p className="text-secondary mb-0 d-lg-none">Your financial journey, simplified.</p><p className="text-secondary mb-0 d-none d-lg-block">Here's what's happening with your account today.</p></div>
      <Async state={state}>{(d) => {
        const series = d.portfolio.series; const rows = [...d.assets, { symbol: 'NGN', name: 'Naira', available: d.ngnAvailable, valueNgn: d.ngnAvailable, changePct: null, ngn: true }];
        return (
          <>
            <div className="kp-stats">
              <div className="kp-card mb-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="min-w-0"><div className="text-secondary small d-flex align-items-center gap-2">Total Portfolio Value
                  <button className="btn btn-link text-secondary p-0" style={{ minHeight: 0 }} onClick={() => setHide(!hide)} aria-label={hide ? 'Show balance' : 'Hide balance'}><Icon name={hide ? 'eyeoff' : 'eye'} size={16} /></button></div>
                  <div className="kp-big mono">{hide ? '₦ ••••••' : ngn(d.totalNgn)}</div>
                  <span className={`kp-pill ${d.portfolio.changePct7d >= 0 ? 'ok' : 'err'} mt-1`}>{d.portfolio.changePct7d >= 0 ? '+' : ''}{d.portfolio.changePct7d}% (7d)</span></div>
                <div style={{ flex: '1 1 90px', minWidth: 90, maxWidth: 160 }}><Spark data={series['1W']} /></div>
              </div>
              <div className="kp-card mb-0 d-none d-lg-block"><div className="text-secondary small">Naira Balance</div><div className="kp-big mono fs-4 mt-1">{hide ? '₦ ••••••' : ngn(d.ngnAvailable)}</div><div className="text-secondary small">Available</div></div>
              <div className="kp-card mb-0 d-none d-lg-block"><div className="text-secondary small">Crypto Balance</div><div className="kp-big mono fs-4 mt-1">{hide ? '₦ ••••••' : ngn(d.cryptoValueNgn)}</div><div className="text-secondary small">Available</div></div>
              <div className="kp-card mb-0 d-none d-lg-block"><div className="kp-seg mb-1" role="tablist" aria-label="Chart range">{Object.keys(series).map((r) => <button key={r} role="tab" aria-selected={range === r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>)}</div><Spark data={series[range]} h={70} /></div>
            </div>
            <h2 className="kp-title text-uppercase d-lg-none">Quick Actions</h2>
            <div className="kp-tiles mb-3">{[...ACTIONS, ['/pay', 'bills', 'Pay Bills']].map(([to, i, l], k) => (
              <Link key={to} to={to} className={`kp-tile ${k === 4 ? 'd-none d-lg-flex' : ''}`}><Icon name={i} size={26} className="ti" />{l}</Link>))}</div>
            <div className="kp-two">
              <section aria-label="My assets"><div className="d-flex justify-content-between align-items-center"><h2 className="kp-title">My Assets</h2><Link to="/portfolio" className="small">View All</Link></div>
                <div className="kp-card py-2"><div className="kp-ahead"><span>Asset</span><span>Amount</span><span>Value (NGN)</span><span>Change</span></div>
                  {rows.map((a) => (
                    <div className="kp-arow" key={a.symbol}>
                      {a.ngn ? <div className="n"><Coin symbol="NGN" /><div><div className="fw-semibold">Naira /</div><div className="small text-secondary">NGN</div></div></div>
                        : <Link className="n" to={`/assets/${a.symbol}`}><Coin symbol={a.symbol} /><div><div className="fw-semibold">{a.name}<span className="text-secondary"> /</span></div><div className="small text-secondary">{a.symbol}</div></div></Link>}
                      <div className="a mono">{a.ngn ? 'NGN' : `${a.available} ${a.symbol}`}</div><div className="v mono">{hide ? '••••' : ngn(a.valueNgn)}</div>
                      <div className="c text-end text-lg-start"><Change pct={a.changePct} /></div>
                    </div>))}
                </div></section>
              <section aria-label="Recent activity"><div className="d-flex justify-content-between align-items-center"><h2 className="kp-title">Recent Activity</h2><Link to="/transactions" className="small">View All</Link></div><TxList items={d.recent} /></section>
            </div>
          </>
        );
      }}</Async>
    </>
  );
}
