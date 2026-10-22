import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MOCK_IN_PRODUCTION } from './services';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(MOCK_IN_PRODUCTION ? (
  <div className="kp-authpage"><div className="kp-authcard text-center"><img src="/logo-horizontal.png" alt="KonstanPay" height="40" />
    <h1 className="h4 mt-4">Service unavailable</h1><p className="text-secondary">This build is not connected to the KonstanPay API. Set VITE_API_MODE=live and VITE_API_BASE_URL, then rebuild.</p></div></div>
) : (
  <React.StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></React.StrictMode>
));
