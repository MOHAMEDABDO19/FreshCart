import { create } from "zustand"

export type ToastKind = "success" | "error" | "info"
export type ToastItem = { id: number; message: string; kind: ToastKind }

type ToastState = {
  toasts: ToastItem[]
  push: (message: string, kind?: ToastKind) => void
  dismiss: (id: number) => void
}

let nextToastId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = "success") => set((state) => ({
    toasts: [...state.toasts.slice(-2), { id: ++nextToastId, message, kind }],
  })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

export function showToast(message: string, kind: ToastKind = "success") {
  useToastStore.getState().push(message, kind)
}
