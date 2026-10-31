import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import './studio.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** One plain sentence under the title saying what this dialog is for. */
  description?: React.ReactNode;
  /** Pastel behind the header, so each kind of dialog is recognisable. */
  tint?: string;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
  /** Block closing (e.g. while an import is running). */
  busy?: boolean;
  children: React.ReactNode;
}

/** The one dialog shell every studio dialog uses: centred on desktop, a bottom sheet on phones. */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  tint = '#ffd2e5',
  size = 'md',
  footer,
  busy = false,
  children,
}) => {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the first field, or the dialog itself.
    const focusTimer = setTimeout(() => {
      const panel = panelRef.current;
      if (panel?.contains(document.activeElement)) return; // a dialog chose its own field
      const first = panel?.querySelector<HTMLElement>('input:not([type=hidden]), textarea, select');
      (first ?? panel)?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busyRef.current) {
        e.stopPropagation();
        closeRef.current();
      }
      // Keep Tab inside the dialog.
      if (e.key === 'Tab' && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="st st-dialog-back" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div
        ref={panelRef}
        className={`st-dialog st-dialog-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
      >
        <header className="st-dialog-head" style={{ background: tint }}>
          <div>
            <h2 id={titleId} className="st-display">{title}</h2>
            {description && <p id={descId}>{description}</p>}
          </div>
          <button className="st-icon-btn" onClick={onClose} disabled={busy} aria-label="Close">
            <X size={20} strokeWidth={2.75} />
          </button>
        </header>
        <div className="st-dialog-body">{children}</div>
        {footer && <footer className="st-dialog-foot">{footer}</footer>}
      </div>
    </div>
  );
};

/** A labelled form field with an optional hint tied to the input. */
export const Field: React.FC<{
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
}> = ({ label, hint, htmlFor, children }) => (
  <div className="st-field">
    <label htmlFor={htmlFor}>{label}</label>
    {children}
    {hint && <p className="st-field-hint">{hint}</p>}
  </div>
);
