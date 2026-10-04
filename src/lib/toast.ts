// Tiny pub/sub for non-blocking notifications, replacing window.alert().
// Same window-event pattern as lib/sound.ts, so any module can raise a toast
// without threading React context through the tree.

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
  durationMs: number;
}

export const TOAST_EVENT = 'cyber-toast';

let nextId = 1;

export function showToast(text: string, kind: ToastKind = 'info', durationMs: number = 4000): void {
  const detail: ToastMessage = { id: nextId++, kind, text, durationMs };
  window.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT, { detail }));
}
