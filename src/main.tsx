import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against Firebase Auth internal popup race condition assertion errors and interruptions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const message = (event?.message || event?.error?.message || '');
    if (
      message.includes('Pending promise was never set') ||
      message.includes('INTERNAL ASSERTION FAILED') ||
      message.includes('auth/network-request-failed') ||
      message.includes('auth/popup-closed-by-user') ||
      message.includes('auth/cancelled-popup-request')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = typeof reason === 'string' ? reason : reason?.message || '';
    const code = reason?.code || '';
    if (
      message.includes('Pending promise was never set') ||
      message.includes('INTERNAL ASSERTION FAILED') ||
      message.includes('network-request-failed') ||
      code === 'auth/network-request-failed' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
