import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';
export type Toast = { id: string; message: string; variant: ToastVariant };

type ToastState = {
  toasts: Toast[];
  showToast: (toast: { message: string; variant?: ToastVariant }) => void;
  dismissToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: ({ message, variant = 'info' }) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));