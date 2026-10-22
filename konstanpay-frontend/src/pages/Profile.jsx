import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  return (
    <>
      <h1 className="h3">Profile</h1>
      <div className="card card-body mb-3">
        <div className="d-flex align-items-center gap-3"><div className="kp-ico">{user.name[0]}</div><div><b>{user.name}</b><div className="small text-secondary">{user.email} · {user.phone}</div></div></div>
        <p className="mt-3 mb-0">Identity verification: <span className="badge text-bg-warning">{user.kycStatus.replace('_', ' ')}</span></p>
      </div>
      <div className="card card-body py-1 mb-3">{[['/security', 'Security & password'], ['/verification', 'Identity verification'], ['/bank-accounts', 'Bank accounts'], ['/notifications', 'Notifications'], ['/support', 'Support']].map(([to, l]) => <div className="kp-row" key={to}><Link to={to}>{l}</Link><span aria-hidden="true">›</span></div>)}</div>
      <button className="btn btn-alt" onClick={async () => { await logout(); nav('/'); }}>Log out</button>
    </>
  );
}
