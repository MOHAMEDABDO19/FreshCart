"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { useToastStore, type ToastItem } from "@/store/toast-store"
import { CloseButton } from "@/components/shared/close-button"

function ToastCard({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((state) => state.dismiss)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const exit = window.setTimeout(() => setLeaving(true), 4200)
    const remove = window.setTimeout(() => dismiss(toast.id), 4500)
    return () => { window.clearTimeout(exit); window.clearTimeout(remove) }
  }, [dismiss, toast.id])

  const close = () => {
    setLeaving(true)
    window.setTimeout(() => dismiss(toast.id), 180)
  }

  const Icon = toast.kind === "error" ? AlertCircle : toast.kind === "info" ? Info : CheckCircle2
  const tone = toast.kind === "error"
    ? "border-red-200 bg-white text-red-800"
    : toast.kind === "info"
      ? "border-sky-200 bg-white text-sky-800"
      : "border-emerald-200 bg-white text-emerald-800"

  return (
    <div dir="ltr" role={toast.kind === "error" ? "alert" : "status"} className={`toast-enter pointer-events-auto flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${tone} ${leaving ? "toast-exit" : ""}`}>
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm font-medium leading-5">{toast.message}</p>
      <CloseButton aria-label="Close notification" onClick={close} className="text-slate-400 hover:text-slate-700" />
    </div>
  )
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  return <div aria-label="Notifications" className="pointer-events-none fixed left-4 top-4 z-[9999] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">{toasts.map((toast) => <ToastCard key={toast.id} toast={toast} />)}</div>
}
