import { useState } from 'react';
import { NavLink, Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import api from '../services';
import Icon from './Icon';

const SIDE = [['/dashboard', 'home', 'Dashboard'], ['/wallet', 'wallet', 'Wallet'], ['/buy', 'card', 'Buy Crypto'], ['/convert', 'convert', 'Convert'], ['/swap', 'swap', 'Swap'], ['/withdraw', 'withdraw', 'Withdraw'], ['/pay', 'bills', 'Pay Bills'], ['/transactions', 'history', 'Transaction History'], ['/profile', 'settings', 'Settings']];
const TABS = [['/dashboard', 'home', 'Home'], ['/swap', 'swap', 'Swap'], ['/wallet', 'wallet', 'Wallet'], ['/pay', 'bills', 'Pay Bills'], ['/profile', 'user', 'Profile']];
const ADMIN = [['/admin', 'home', 'Overview'], ['/admin/users', 'users', 'Users'], ['/admin/kyc', 'kyc', 'KYC Verification'], ['/admin/transactions', 'swap', 'Transactions'], ['/admin/audit', 'audit', 'Audit Logs']];

export function ProtectedRoute({ role }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="kp-authpage" aria-busy="true"><div className="kp-skel" style={{ width: 200 }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.phoneVerified) return <Navigate to="/verify-phone" replace />;
  if (role && user.role !== role) return <div className="kp-authpage"><div className="alert alert-danger">Access denied. Administrator permission required.</div></div>;
  return <Layout admin={role === 'admin'} />;
}

const Avatar = ({ user }) => <div className="kp-ico" aria-hidden="true">{user.name[0]}<span className="kp-dot" /></div>;

function Layout({ admin }) {
  const { user, logout } = useAuth(); const nav = useNavigate();
  const [menu, setMenu] = useState(false); const [q, setQ] = useState('');
  const notes = useApi(() => api.notifications.list(), []);
  const unread = notes.data?.items.filter((n) => !n.read).length || 0;
  const links = admin ? ADMIN : SIDE;
  const bell = <Link to="/notifications" className="text-white position-relative" aria-label={`Notifications, ${unread} unread`}><Icon name="bell" />{unread > 0 && <span className="position-absolute rounded-circle" style={{ width: 9, height: 9, background: 'var(--kp-err)', top: 0, right: 0 }} />}</Link>;
  return (
    <>
      <nav className="kp-side" aria-label="Main navigation">
        <img className="logo" src="/logo-horizontal.png" alt="KonstanPay" /><div className="tag">{admin ? 'Administration' : 'Secure. Swift. Konstan.'}</div>
        <div className="kp-nav flex-grow-1">{links.map(([to, i, l]) => <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => (isActive ? 'active' : '')}><Icon name={i} size={20} />{l}</NavLink>)}</div>
        {!admin && user.role === 'admin' && <Link to="/admin" className="btn btn-alt btn-sm mb-2">Admin console</Link>}
        <Link to="/profile" className="d-flex align-items-center gap-2 text-white p-2 rounded-3" style={{ background: 'rgba(20,43,73,.5)' }}><Avatar user={user} />
          <div className="min-w-0"><div className="fw-semibold small text-truncate">{user.name}</div><div className="small text-secondary">{user.kycStatus === 'approved' ? 'Verified User' : 'Unverified'}</div></div></Link>
      </nav>
      <div className="kp-shell">
        <header className="kp-mtop"><div><img src="/logo-horizontal.png" alt="KonstanPay" /><div className="kp-mtag">Secure. Swift. Konstan.</div></div><div className="d-flex align-items-center gap-3">{bell}<Link to="/profile" aria-label="Profile"><Avatar user={user} /></Link></div></header>
        <header className="kp-dtop">
          <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); nav(`${admin ? '/admin/transactions' : '/transactions'}?q=${encodeURIComponent(q)}`); }}>
            <div className="kp-field" style={{ minHeight: 44, padding: '6px 14px' }}><Icon name="search" className="lead-ico" size={18} /><div className="body"><input aria-label="Search" placeholder={admin ? 'Search users, transactions, audits...' : 'Search anything...'} value={q} onChange={(e) => setQ(e.target.value)} /></div></div></form>
          <div className="ms-auto d-flex align-items-center gap-3 position-relative">{bell}
            <button className="btn btn-link text-white d-flex align-items-center gap-2 p-0" style={{ minHeight: 0 }} onClick={() => setMenu(!menu)} aria-expanded={menu}><Avatar user={user} /><span>{user.name}</span><Icon name="chevdown" size={16} /></button>
            {menu && <div className="kp-card position-absolute end-0 p-2" style={{ top: 52, width: 200, zIndex: 40 }} onClick={() => setMenu(false)}>
              <Link className="d-block p-2 text-white" to="/profile">Profile</Link><Link className="d-block p-2 text-white" to="/security">Security</Link>
              <button className="btn btn-link text-white p-2 w-100 text-start" style={{ minHeight: 0 }} onClick={async () => { await logout(); nav('/'); }}>Log out</button></div>}
          </div>
        </header>
        <main className="kp-main"><Outlet /></main>
      </div>
      <nav className="kp-tab" aria-label="Main navigation">{(admin ? ADMIN.slice(0, 5) : TABS).map(([to, i, l]) => <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => (isActive ? 'active' : '')}><Icon name={i} size={22} />{l.replace('Transaction ', '')}</NavLink>)}</nav>
    </>
  );
}
