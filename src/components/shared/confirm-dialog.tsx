"use client"

import { useRef, useState } from "react"
import type { RefObject } from "react"
import { LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  variant?: "default" | "destructive"
  icon?: LucideIcon
  error?: string
  onConfirm: () => void | Promise<void>
  returnFocusRef: RefObject<HTMLElement | null>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  icon: Icon = LogOut,
  error,
  onConfirm,
  returnFocusRef,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [confirming, setConfirming] = useState(false)
  const confirmButtonClassName = variant === "destructive"
    ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
    : "bg-brand hover:bg-brand-dark focus-visible:ring-brand"

  const confirm = async () => {
    if (confirming) return
    setConfirming(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("The confirmation action failed.", error)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        aria-label={`${title} confirmation`}
        onOverlayClick={() => {
          if (!confirming) onOpenChange(false)
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          cancelRef.current?.focus()
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          window.requestAnimationFrame(() => returnFocusRef.current?.focus())
        }}
        onEscapeKeyDown={(event) => {
          event.preventDefault()
          if (!confirming) onOpenChange(false)
        }}
        className="font-sans"
      >
        <AlertDialogHeader className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 text-left">
          <AlertDialogMedia className="row-span-2 mb-0 size-12 rounded-full bg-red-50 text-red-600 [&_svg]:size-5">
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-lg font-semibold text-slate-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-6 text-slate-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <AlertDialogFooter className="mt-2 flex-row justify-end border-0 bg-transparent p-0">
          <AlertDialogCancel
            ref={cancelRef}
            disabled={confirming}
            className="motion-button min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <button
            type="button"
            disabled={confirming}
            onClick={() => void confirm()}
            className={`motion-button min-h-11 rounded-xl px-4 font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${confirmButtonClassName}`}
          >
            {confirming ? "Please wait…" : confirmLabel}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
