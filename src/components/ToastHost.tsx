import React, { useEffect, useState } from 'react';
import { X, Info, CheckCircle2, AlertTriangle, OctagonAlert } from 'lucide-react';
import { TOAST_EVENT } from '../lib/toast';
import type { ToastMessage, ToastKind } from '../lib/toast';

const KIND_STYLES: Record<ToastKind, { border: string; text: string; Icon: React.FC<{ className?: string }> }> = {
  info: { border: 'border-[var(--neon-cyan)]', text: 'text-[var(--neon-cyan)]', Icon: Info },
  success: { border: 'border-[var(--neon-green)]', text: 'text-[var(--neon-green)]', Icon: CheckCircle2 },
  warning: { border: 'border-[var(--neon-amber)]', text: 'text-[var(--neon-amber)]', Icon: AlertTriangle },
  error: { border: 'border-[var(--neon-magenta)]', text: 'text-[var(--neon-magenta)]', Icon: OctagonAlert },
};

/** Renders toasts raised through showToast(). Mount once, near the root. */
export const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const timers = new Map<number, ReturnType<typeof setTimeout>>();
    const handler = (e: Event) => {
      const toast = (e as CustomEvent<ToastMessage>).detail;
      setToasts((list) => [...list.slice(-3), toast]);
      timers.set(
        toast.id,
        setTimeout(() => {
          setToasts((list) => list.filter((t) => t.id !== toast.id));
          timers.delete(toast.id);
        }, toast.durationMs)
      );
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => {
      window.removeEventListener(TOAST_EVENT, handler);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 right-5 z-[70] flex flex-col gap-2 w-[min(22rem,calc(100vw-2.5rem))] pointer-events-none"
    >
      {toasts.map((toast) => {
        const { border, text, Icon } = KIND_STYLES[toast.kind];
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-[var(--bg-panel)] border-2 ${border} shadow-lg font-mono text-xs text-[var(--ink-light)] animate-fade-in`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${text}`} />
            <span className="flex-1 leading-relaxed">{toast.text}</span>
            <button
              onClick={() => setToasts((list) => list.filter((t) => t.id !== toast.id))}
              className="p-0.5 text-[var(--ink-muted)] hover:text-[var(--ink-light)] transition-colors cursor-pointer shrink-0"
              aria-label="×"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
