import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Orbit } from '../components/Visuals';
import Icon from '../components/Icon';

const SLIDES = [
  ['Your Money, Your Control.', 'Manage crypto, convert to naira, and pay everyday bills securely from one place.'],
  ['Convert to Naira with clarity.', 'See the rate and every fee before you confirm. No surprises.'],
  ['Pay bills in a few taps.', 'Airtime, data, electricity and cable TV straight from your wallet.'],
];
/** Single-screen welcome: the illustration flexes to whatever height is left, so nothing scrolls. */
export default function Welcome() {
  const { user } = useAuth(); const [i, setI] = useState(0);
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="kp-welcome">
      <img className="logo" src="/logo-horizontal.png" alt="KonstanPay" />
      <div className="kp-bar" />
      <p className="kp-tagline">Secure. Swift. Konstan.</p>
      <div className="art"><Orbit /></div>
      <h1 aria-live="polite">{SLIDES[i][0]}</h1>
      <p className="text-secondary d">{SLIDES[i][1]}</p>
      <div className="kp-dots" role="tablist" aria-label="Introduction slides">{SLIDES.map((_, k) => <button key={k} role="tab" aria-selected={k === i} aria-label={`Slide ${k + 1}`} className="btn p-0 border-0" style={{ minHeight: 0, background: 'none' }} onClick={() => setI(k)}><i className={k === i ? 'on' : ''} /></button>)}</div>
      <Link className="btn btn-primary w-100 mb-2" to="/register">Get Started</Link>
      <Link className="btn btn-alt w-100 mb-2" to="/login">I Already Have an Account</Link>
      <p className="small text-secondary m-0"><Icon name="lock" size={14} /> Secured with bank-grade encryption. · <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link></p>
    </div>
  );
}
