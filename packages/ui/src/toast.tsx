'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cx } from './cx';

type Tone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

type ShowToast = (toast: { message: string; tone?: Tone }) => void;

const ToastContext = createContext<ShowToast>(() => {});

// Shows the result of an action. Use the same verb as the button that caused
// it: "Remove member" leads to "… was removed."
export function useToast(): ShowToast {
  return useContext(ToastContext);
}

const VISIBLE_MS = 6000;
const MAX_TOASTS = 3;

// Bottom-left on wide screens, bottom-centre on phones. Successes leave after
// six seconds unless hovered or focused; errors stay until dismissed. Both
// live regions are always mounted so screen readers announce new toasts.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback<ShowToast>(({ message, tone = 'success' }) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), { id, message, tone }]);
  }, []);

  const region = (tones: Tone[]) =>
    toasts
      .filter((toast) => tones.includes(toast.tone))
      .map((toast) => <Toast key={toast.id} toast={toast} onDismiss={dismiss} />);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 md:right-auto md:left-(--ff-toast-inset) md:items-start">
        <div role="status" aria-live="polite" className="contents">
          {region(['success', 'info'])}
        </div>
        <div role="alert" className="contents">
          {region(['error'])}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

const GLYPH_TONE: Record<Tone, string> = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-info',
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (toast.tone === 'error' || paused) return;
    const timer = setTimeout(() => onDismiss(toast.id), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast, paused, onDismiss]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="ff-toast glass-strong pointer-events-auto flex w-full max-w-100 items-center gap-3 rounded-lg py-2.5 pr-2 pl-4 text-body text-fg shadow-menu"
    >
      {/* The lifecycle dot: done is filled, a problem is an open ring. */}
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className={cx('flex-none', GLYPH_TONE[toast.tone])}>
        {toast.tone === 'success' ? (
          <circle cx="6" cy="6" r="4.25" fill="currentColor" />
        ) : (
          <circle cx="6" cy="6" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        )}
      </svg>
      <p className="min-w-0 flex-1">{toast.message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-fg-muted hover:bg-glass-hover hover:text-fg pointer-coarse:h-11 pointer-coarse:w-11"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
