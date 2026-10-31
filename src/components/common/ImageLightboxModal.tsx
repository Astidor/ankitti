import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, Sparkles } from 'lucide-react';
import { KittyBow } from './KittyIllustrations';

interface ImageLightboxModalProps {
  isOpen: boolean;
  src: string | null;
  alt?: string;
  title?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  src,
  alt = 'Flashcard Attachment Preview',
  title = 'Image Attachment Preview',
  onClose,
}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    link.download = `ankitti-card-attachment-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-[var(--c-scrim)] backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[var(--c-paper)] rounded-[28px] overflow-hidden shadow-2xl border border-[var(--c-line)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--c-line)] bg-[var(--c-paper)] backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <KittyBow size={20} />
            <span className="font-extrabold text-sm text-[var(--c-ink)] tracking-tight">{title}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-1.5 rounded-full hover:bg-[var(--c-hover)] text-[var(--c-ink-soft)] hover:text-[var(--c-pink)] transition-colors ios-btn"
              title={isZoomed ? 'Fit to Screen' : 'Zoom 100%'}
            >
              {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-full hover:bg-[var(--c-hover)] text-[var(--c-ink-soft)] hover:text-[var(--c-pink)] transition-colors ios-btn"
              title="Download Image"
            >
              <Download size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[var(--c-pink-soft)] hover:bg-[var(--c-lilac)] text-[var(--c-ink)] hover:text-[var(--c-ink)] transition-colors ios-btn ml-1"
              title="Close Preview (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image Content Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-[var(--c-ground)] min-h-[300px]">
          <img
            src={src}
            alt={alt}
            onClick={() => setIsZoomed(!isZoomed)}
            className={`transition-all duration-200 rounded-2xl shadow-md border border-[var(--c-line)] cursor-pointer ${
              isZoomed 
                ? 'max-w-none scale-125 my-8' 
                : 'max-h-[74vh] max-w-full object-contain'
            }`}
            title="Click to toggle zoom"
          />
        </div>

        {/* Footer info pill */}
        <div className="px-5 py-2.5 bg-[var(--c-ground)] border-t border-[var(--c-line)] flex items-center justify-between text-[11px] text-[var(--c-ink-soft)] font-semibold">
          <span className="flex items-center space-x-1.5">
            <Sparkles size={12} className="text-[var(--c-pink)]" />
            <span>High-Resolution Diagram / Screenshot</span>
          </span>
          <span className="text-[var(--c-ink-soft)]">Press Esc or click outside to close</span>
        </div>
      </div>
    </div>
  );
};
