import React from 'react';
import { 
  X, 
  Download, 
  Share, 
  PlusSquare, 
  Smartphone, 
  WifiOff, 
  Sparkles, 
  CheckCircle2,
  Zap
} from 'lucide-react';
import { KittyBow } from './KittyIllustrations';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  installPrompt: any | null;
  onInstallSuccess?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  installPrompt,
  onInstallSuccess,
}) => {
  if (!isOpen) return null;

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md shadow-2xl border border-pink-200 overflow-hidden ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden bg-pink-50/50">
          <div className="w-10 h-1 bg-pink-200 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-pink-100 bg-gradient-to-r from-pink-50/80 via-white to-pink-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-400 to-[#ff3366] text-white flex items-center justify-center shadow-sm">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center space-x-1.5">
                <span>Install Ankitti App</span>
                <KittyBow size={16} />
              </h3>
              <p className="text-[11px] text-pink-600 font-medium">Use offline on your phone anytime</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-100/70 hover:bg-pink-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Offline Benefits Pill */}
          <div className="bg-pink-50/60 rounded-2xl p-4 border border-pink-200/80 space-y-2.5">
            <div className="font-extrabold text-pink-900 text-xs flex items-center space-x-1.5">
              <Zap size={14} className="text-[#ff3366]" />
              <span>Full Offline Superpowers:</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={13} className="text-pink-500 shrink-0" />
                <span>Works on flights, subways, or without cellular data</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={13} className="text-pink-500 shrink-0" />
                <span>Zero browser bars — immersive full-screen study</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={13} className="text-pink-500 shrink-0" />
                <span>All card reviews save locally and auto-sync when online</span>
              </div>
            </div>
          </div>

          {/* Conditional Instructions based on device */}
          {isIOS ? (
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-800">
                How to install on iPhone &amp; iPad:
              </div>

              <div className="space-y-2.5">
                {/* Step 1 */}
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-pink-100 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">
                      Tap the <strong className="text-pink-600">Share</strong> button in Safari's bottom toolbar
                    </p>
                    <div className="mt-1 flex items-center space-x-1.5 text-slate-500 text-[11px]">
                      <Share size={14} className="text-pink-500" />
                      <span>The square icon with an upward arrow</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-pink-100 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">
                      Scroll down and tap <strong className="text-pink-600">Add to Home Screen</strong>
                    </p>
                    <div className="mt-1 flex items-center space-x-1.5 text-slate-500 text-[11px]">
                      <PlusSquare size={14} className="text-pink-500" />
                      <span>Ankitti 🎀 will appear right on your home screen!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : installPrompt ? (
            <div className="space-y-3 pt-2">
              <p className="text-slate-600 leading-relaxed">
                Click below to install Ankitti directly onto your phone or desktop. It takes only a second and requires no app store account!
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-[#ff3366] text-white font-black text-xs shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download size={16} />
                <span>Install Ankitti App Now 🎀</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-800">
                To install on Android Chrome:
              </div>
              <p className="text-slate-600 leading-relaxed">
                Tap the three dots menu <strong className="text-slate-800">(⋮)</strong> in your browser and select <strong className="text-pink-600">"Install app"</strong> or <strong className="text-pink-600">"Add to Home screen"</strong>.
              </p>
            </div>
          )}

          {/* Close button for iOS / manual */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold transition-colors cursor-pointer"
            >
              Got it, let's study! 🌸
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
