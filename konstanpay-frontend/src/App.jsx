import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/Layout';

const p = (name) => lazy(() => import(`./pages/${name}.jsx`));
const Welcome = p('Welcome'), Login = p('Login'), Register = p('Register'), VerifyPhone = p('VerifyPhone'), Forgot = p('ForgotPassword'), Legal = p('Legal');
const Dashboard = p('Dashboard'), Convert = p('Convert'), Swap = p('Swap'), Wallet = p('Wallet'), Pay = p('Pay');
const History = p('History'), TxDetail = p('TxDetail'), Notifications = p('Notifications'), Profile = p('Profile'), Admin = p('Admin') ;
const Portfolio = p('Portfolio'), AssetDetail = p('AssetDetail'), Buy = p('Buy'), Withdraw = p('Withdraw'), BankAccounts = p('BankAccounts'), Kyc = p('Kyc'), Support = p('Support'), Security = p('Security'), Reset = p('ResetPassword');
const AdminUsers = p('AdminUsers'), AdminTx = p('AdminTransactions'), AdminAudit = p('AdminAudit'), AdminKyc = p('AdminKyc');

export default function App() {
  return (
    <Suspense fallback={<div className="kp-auth" aria-busy="true"><div className="kp-skel" /></div>}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password" element={<Reset />} />
        <Route path="/terms" element={<Legal page="terms" />} />
        <Route path="/privacy" element={<Legal page="privacy" />} />
        <Route path="/help" element={<Legal page="help" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/assets/:symbol" element={<AssetDetail />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/bank-accounts" element={<BankAccounts />} />
          <Route path="/verification" element={<Kyc />} />
          <Route path="/support" element={<Support />} />
          <Route path="/security" element={<Security />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/transactions" element={<History />} />
          <Route path="/transactions/:id" element={<TxDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}><Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/kyc" element={<AdminKyc />} />
          <Route path="/admin/transactions" element={<AdminTx />} />
          <Route path="/admin/audit" element={<AdminAudit />} /></Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
