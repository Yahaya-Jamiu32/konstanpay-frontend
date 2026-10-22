import api from '../services';
import useApi from '../hooks/useApi';
import { Async } from '../components/ui';
import { dateTime } from '../utils/format';

export default function Notifications() {
  const state = useApi(() => api.notifications.list(), []);
  return (
    <>
      <h1 className="h3">Notifications</h1>
      <Async state={state}>{({ items }) => (
        <>
          <div className="card card-body py-1 mb-3">{items.length ? items.map((n) => (
            <div className="kp-row" key={n.id}><span>{!n.read && <span aria-label="Unread">● </span>}{n.title}</span><span className="small text-secondary text-nowrap">{dateTime(n.createdAt)}</span></div>
          )) : <p className="text-secondary my-3">You're all caught up.</p>}</div>
          <button className="btn btn-alt" disabled={!items.some((n) => !n.read)} onClick={async () => { await api.notifications.markAllRead(); state.reload(); }}>Mark all as read</button>
        </>
      )}</Async>
    </>
  );
}
