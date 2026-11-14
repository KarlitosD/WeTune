import { create } from "zustand";
import { nanoid } from "nanoid/non-secure";

// Toasts globales con Zustand.
// Renderizado por <Toasts /> en el layout raíz.

export type ToastType = "success" | "error" | "info" | "loading";

export type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastStore = {
  toasts: ToastItem[];
  push: (type: ToastType, title: string, description?: string) => string;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],
  push: (type, title, description) => {
    const id = nanoid(8);
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, type, title, description }] }));
    if (type !== "loading") {
      setTimeout(() => useToastStore.getState().dismiss(id), 3500);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// API: toast.success("..."), toast.error("..."), ...
export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().push("success", title, description),
  error: (title: string, description?: string) => useToastStore.getState().push("error", title, description),
  info: (title: string, description?: string) => useToastStore.getState().push("info", title, description),
  loading: (title: string, description?: string) => useToastStore.getState().push("loading", title, description),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
