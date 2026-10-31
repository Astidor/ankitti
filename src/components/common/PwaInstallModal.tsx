import React from 'react';
import { Download, MoreVertical, PlusSquare, Share } from 'lucide-react';
import { Dialog } from '../studio/Dialog';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  installPrompt: any | null;
  onInstallSuccess?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose, installPrompt, onInstallSuccess }) => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      onInstallSuccess?.();
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="sm"
      tint="#ffdcc4"
      title="Put Ankitti on your home screen"
      description="It opens like an app, full screen, and keeps working without internet. No app store needed."
      footer={
        installPrompt && !isIOS ? (
          <>
            <button className="st-btn st-btn-secondary" onClick={onClose}>Not now</button>
            <button className="st-btn st-btn-primary" onClick={install}><Download size={18} /> Install</button>
          </>
        ) : (
          <button className="st-btn st-btn-primary" onClick={onClose}>Got it</button>
        )
      }
    >
      {isIOS ? (
        <ol className="st-steps">
          <li>
            In Safari, tap the Share button <Share size={16} style={{ display: 'inline', verticalAlign: '-2px' }} aria-label="Share" /> at the bottom of the screen.
          </li>
          <li>
            Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={16} style={{ display: 'inline', verticalAlign: '-2px' }} aria-hidden="true" />.
          </li>
          <li>Tap <strong>Add</strong>. Ankitti appears with your other apps.</li>
        </ol>
      ) : installPrompt ? (
        <p style={{ margin: 0, fontWeight: 600 }}>Press <strong>Install</strong> and confirm. It takes a second.</p>
      ) : isAndroid ? (
        <ol className="st-steps">
          <li>
            Tap the menu <MoreVertical size={16} style={{ display: 'inline', verticalAlign: '-2px' }} aria-label="three dots" /> in the top corner of Chrome.
          </li>
          <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
        </ol>
      ) : (
        <ol className="st-steps">
          <li>In Chrome or Edge, look for the install icon at the right end of the address bar.</li>
          <li>Click it, then click <strong>Install</strong>.</li>
          <li>On a phone, open ankitti.com there and add it to your home screen.</li>
        </ol>
      )}
      <p className="st-muted" style={{ margin: 0, fontWeight: 600 }}>
        Reviews you do offline are saved on the device and sync when you’re back online.
      </p>
    </Dialog>
  );
};
