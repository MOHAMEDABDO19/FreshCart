import { LoaderCircle } from "lucide-react"

type LoadingSpinnerProps = {
  label?: string
  className?: string
}

export function LoadingSpinner({
  label = "Loading",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex min-h-40 items-center justify-center py-16 ${className}`}
      role="status"
      aria-label={label}
    >
      <LoaderCircle className="size-8 animate-spin text-brand" aria-hidden="true" />
    </div>
  )
}
