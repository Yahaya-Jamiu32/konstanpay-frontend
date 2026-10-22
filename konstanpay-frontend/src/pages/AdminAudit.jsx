import api from '../services';
import useApi from '../hooks/useApi';
import { Async } from '../components/ui';
import { dateTime } from '../utils/format';

export default function AdminAudit() {
  const state = useApi(() => api.admin.audit(), []);
  return (
    <>
      <h1 className="h3">Audit log</h1>
      <Async state={state}>{({ items }) => (
        <div className="card card-body"><div className="table-responsive"><table className="table mb-0 text-nowrap"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Record</th></tr></thead>
          <tbody>{items.length ? items.map((a) => <tr key={a.id}><td>{dateTime(a.createdAt)}</td><td>{a.actor}</td><td>{a.action}</td><td>{a.record}</td></tr>) : <tr><td colSpan="4" className="text-secondary">No entries yet.</td></tr>}</tbody></table></div></div>
      )}</Async>
    </>
  );
}
