"use client"

import type { ReactNode, RefObject } from "react"
import { Dialog } from "radix-ui"
import { cn } from "@/lib/utils"

type ModalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  titleId: string
  descriptionId: string
  children: ReactNode
  className?: string
  returnFocusRef?: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
}

export function ModalDialog({
  open,
  onOpenChange,
  titleId,
  descriptionId,
  children,
  className,
  returnFocusRef,
  initialFocusRef,
}: ModalDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <Dialog.Overlay className="motion-confirm-overlay absolute inset-0 z-0 bg-slate-950/50 backdrop-blur-sm" />
          <Dialog.Content
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onOpenAutoFocus={(event) => {
              if (!initialFocusRef) return
              event.preventDefault()
              initialFocusRef.current?.focus()
            }}
            onCloseAutoFocus={(event) => {
              if (!returnFocusRef) return
              event.preventDefault()
              window.requestAnimationFrame(() => returnFocusRef.current?.focus())
            }}
            className={cn(
              "motion-confirm-dialog relative z-10 my-auto max-h-[min(90dvh,760px)] w-full max-w-[420px] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-5 text-slate-800 shadow-xl outline-none sm:p-6",
              className,
            )}
          >
            {children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
