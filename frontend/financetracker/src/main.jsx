import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId='673478819395-02je7e2as4g14p6e7jffr2m6ojajrvqg.apps.googleusercontent.com'>
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  </GoogleOAuthProvider>
)
