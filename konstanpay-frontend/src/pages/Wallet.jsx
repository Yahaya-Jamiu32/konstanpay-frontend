import { useState } from 'react';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async } from '../components/ui';
import { ngn } from '../utils/format';

const NETWORKS = { BTC: ['Bitcoin'], ETH: ['Ethereum (ERC-20)'], USDT: ['Tron (TRC-20)', 'Ethereum (ERC-20)'], SOL: ['Solana'] };

export default function Wallet() {
  const state = useApi(() => api.wallet.get(), []);
  const [asset, setAsset] = useState('USDT'); const [network, setNetwork] = useState(NETWORKS.USDT[0]);
  const dep = useApi(() => api.wallet.depositInstructions({ asset, network }), [asset, network]);
  return (
    <>
      <h1 className="h3">Wallet</h1>
      <Async state={state}>{(w) => (
        <>
          <div className="card card-body mb-3"><span className="text-secondary">NGN balance</span><div className="kp-big mono">{ngn(w.ngn.available)}</div></div>
          <div className="card card-body py-1 mb-3">{w.assets.map((a) => <div className="kp-row" key={a.symbol}><b>{a.symbol}</b><span className="mono">{a.available}</span></div>)}</div>
        </>
      )}</Async>
      <div className="card card-body">
        <h2 className="h5">Deposit</h2>
        <label htmlFor="asset" className="form-label text-secondary small">Asset</label>
        <select id="asset" className="form-select mb-2" value={asset} onChange={(e) => { setAsset(e.target.value); setNetwork(NETWORKS[e.target.value][0]); }}>{Object.keys(NETWORKS).map((a) => <option key={a}>{a}</option>)}</select>
        <label htmlFor="net" className="form-label text-secondary small">Network</label>
        <select id="net" className="form-select mb-3" value={network} onChange={(e) => setNetwork(e.target.value)}>{NETWORKS[asset].map((n) => <option key={n}>{n}</option>)}</select>
        <Async state={dep}>{(d) => d.available && d.address ? (
          <div><div className="small text-secondary">Send only {d.asset} on {d.network} to:</div><code className="d-block p-2 bg-black rounded text-break">{d.address}</code>
            {d.minimum && <div className="small text-secondary mt-2">Minimum deposit: {d.minimum} · Confirmations required: {d.confirmations}</div>}</div>
        ) : <div className="alert alert-warning mb-0">{d.reason || 'Deposits are unavailable.'}</div>}</Async>
      </div>
    </>
  );
}
