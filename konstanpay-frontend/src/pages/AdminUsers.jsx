import { useState } from 'react';
import api from '../services';
import useApi from '../hooks/useApi';
import { Async } from '../components/ui';

export default function AdminUsers() {
  const [q, setQ] = useState('');
  const state = useApi(() => api.admin.users({ q }), [q]);
  const [err, setErr] = useState('');
  async function toggle(u) {
    const next = u.status === 'suspended' ? 'active' : 'suspended';
    if (!window.confirm(`${next === 'suspended' ? 'Suspend' : 'Reactivate'} ${u.email}? This is recorded in the audit log.`)) return;
    try { await api.admin.setUserStatus(u.id, next); state.reload(); } catch (x) { setErr(x.message); }
  }
  return (
    <>
      <h1 className="h3">Users</h1>
      <input className="form-control mb-3" aria-label="Search users" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      {err && <div className="alert alert-danger">{err}</div>}
      <Async state={state}>{({ items }) => (
        <div className="card card-body"><div className="table-responsive"><table className="table mb-0"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>KYC</th><th>Status</th><th /></tr></thead>
          <tbody>{items.map((u) => (<tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.kycStatus}</td><td><span className={`badge text-bg-${u.status === 'active' ? 'success' : 'danger'}`}>{u.status}</span></td>
            <td>{u.role !== 'admin' && <button className="btn btn-alt btn-sm" onClick={() => toggle(u)}>{u.status === 'suspended' ? 'Reactivate' : 'Suspend'}</button>}</td></tr>))}</tbody></table></div></div>
      )}</Async>
    </>
  );
}
