// Ankitti 🎀 Service Worker Registration Helper

export interface ServiceWorkerHooks {
  onSuccess?: () => void;
  onUpdate?: () => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export function registerServiceWorker(hooks?: ServiceWorkerHooks) {
  if (typeof window === 'undefined') return;

  // Listen to network status events
  window.addEventListener('online', () => {
    console.log('[Ankitti] Network restored! Back online 🌐');
    if (hooks?.onOnline) hooks.onOnline();
  });

  window.addEventListener('offline', () => {
    console.log('[Ankitti] Network lost. Running in full offline mode 📡');
    if (hooks?.onOffline) hooks.onOffline();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // In production or when hosted on custom domain (ankitti.com)
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[Ankitti SW] Active with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[Ankitti SW] New version downloaded and ready to activate.');
                  if (hooks?.onUpdate) hooks.onUpdate();
                } else {
                  console.log('[Ankitti SW] Content cached for offline use 🎀');
                  if (hooks?.onSuccess) hooks.onSuccess();
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[Ankitti SW] Service Worker registration failed:', error);
        });
    });
  }
}
