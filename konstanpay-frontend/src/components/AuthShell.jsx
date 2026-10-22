import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
export default function AuthShell({ children, back = true, to }) {
  const nav = useNavigate();
  return (
    <div className="kp-authpage"><div className="kp-authcard">
      <div className="kp-authhead">
        {back && <button className="back btn btn-link" onClick={() => (to ? nav(to) : nav(-1))} aria-label="Go back"><Icon name="back" /></button>}
        <Link to="/"><img src="/logo-horizontal.png" alt="KonstanPay" /></Link>
      </div>{children}
    </div></div>
  );
}
