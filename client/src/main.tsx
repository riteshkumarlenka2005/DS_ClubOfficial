import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Remove native splash screen after React mounts
const splash = document.getElementById('splash-screen');
if (splash) {
  splash.style.transition = 'opacity 0.3s ease';
  splash.style.opacity = '0';
  setTimeout(() => splash.remove(), 300);
}
