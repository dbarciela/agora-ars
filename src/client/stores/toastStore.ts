import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastMessage[]>([]);
  let counter = 0;

  function show(message: string, type: ToastType = 'info', duration = 3000) {
    const id = ++counter;
    update((toasts) => [...toasts, { id, message, type }]);
    setTimeout(() => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    }, duration);
  }

  return {
    subscribe,
    success: (msg: string, duration?: number) => show(msg, 'success', duration),
    error: (msg: string, duration?: number) => show(msg, 'error', duration),
    info: (msg: string, duration?: number) => show(msg, 'info', duration),
    warning: (msg: string, duration?: number) => show(msg, 'warning', duration),
  };
}

export const toastStore = createToastStore();
