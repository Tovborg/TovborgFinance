import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import TransactionsPage from './pages/Transactions.jsx';
import NordigenBankUI from './pages/NordigenBankUI.jsx';
import BankRedirect from './pages/BankRedirect.jsx';
import ProcessAccountConnection from './pages/ProcessAccountConnection.jsx';
import OpenBankingSuccess from './pages/OpenBankingSuccess.jsx';
import OpenBankingError from './pages/OpenBankingError.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId='673478819395-02je7e2as4g14p6e7jffr2m6ojajrvqg.apps.googleusercontent.com'>
    <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<App />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/accounts-page' element={<AccountsPage />} />
            <Route path='/account' element={<AccountPage />} />
            <Route path='/transactions' element={<TransactionsPage />} />
            <Route path='/select-bank' element={<NordigenBankUI />} />
            <Route path='/bank-connect/:institutionId' element={<BankRedirect />} />
            <Route path='/process-account-connection' element={<ProcessAccountConnection />} />
            {/* Open Banking status routes */}
            <Route path='/open-banking-success' element={<OpenBankingSuccess />} />
            <Route path='/open-banking-error' element={<OpenBankingError />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>
  </GoogleOAuthProvider>
)
