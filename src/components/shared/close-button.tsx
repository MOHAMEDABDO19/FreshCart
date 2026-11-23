import type { ButtonHTMLAttributes, Ref } from "react"
import { X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type CloseButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>
  icon?: LucideIcon
}

export function CloseButton({
  ref,
  className = "",
  icon: Icon = X,
  "aria-label": ariaLabel = "Close",
  ...props
}: CloseButtonProps) {
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className={`close-button flex size-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`}
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </button>
  )
}
