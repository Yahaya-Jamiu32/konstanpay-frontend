import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/Layout';

const Welcome = lazy(() => import('./pages/Welcome.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const VerifyPhone = lazy(() => import('./pages/VerifyPhone.jsx'));
const Forgot = lazy(() => import('./pages/ForgotPassword.jsx'));
const Legal = lazy(() => import('./pages/Legal.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Convert = lazy(() => import('./pages/Convert.jsx'));
const Swap = lazy(() => import('./pages/Swap.jsx'));
const Wallet = lazy(() => import('./pages/Wallet.jsx'));
const Pay = lazy(() => import('./pages/Pay.jsx'));
const History = lazy(() => import('./pages/History.jsx'));
const TxDetail = lazy(() => import('./pages/TxDetail.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Portfolio = lazy(() => import('./pages/Portfolio.jsx'));
const AssetDetail = lazy(() => import('./pages/AssetDetail.jsx'));
const Buy = lazy(() => import('./pages/Buy.jsx'));
const Withdraw = lazy(() => import('./pages/Withdraw.jsx'));
const BankAccounts = lazy(() => import('./pages/BankAccounts.jsx'));
const Kyc = lazy(() => import('./pages/Kyc.jsx'));
const Support = lazy(() => import('./pages/Support.jsx'));
const Security = lazy(() => import('./pages/Security.jsx'));
const Reset = lazy(() => import('./pages/ResetPassword.jsx'));
const AdminUsers = lazy(() => import('./pages/AdminUsers.jsx'));
const AdminTx = lazy(() => import('./pages/AdminTransactions.jsx'));
const AdminAudit = lazy(() => import('./pages/AdminAudit.jsx'));
const AdminKyc = lazy(() => import('./pages/AdminKyc.jsx'));

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
