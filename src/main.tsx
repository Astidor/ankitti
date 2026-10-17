import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './services/serviceWorkerRegistration'

// Register PWA Service Worker for complete offline phone & desktop support
registerServiceWorker({
  onSuccess: () => {
    console.log('[Ankitti] App is ready for offline study! 🎀');
  },
  onUpdate: () => {
    console.log('[Ankitti] Fresh update downloaded! Ready on next load.');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
