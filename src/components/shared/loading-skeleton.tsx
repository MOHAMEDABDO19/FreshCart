import { MOTION } from "@/constants/motion"
import { LoaderCircle } from "lucide-react"
import type { CSSProperties } from "react"

type LoadingSkeletonProps = {
  kind: "categories" | "products"
}

function Block({ className = "" }: { className?: string }) {
  return <span className={`loading-skeleton block rounded-md ${className}`} aria-hidden="true" />
}

export function LoadingSkeleton({ kind }: LoadingSkeletonProps) {
  const count = kind === "categories" ? 10 : 10
  return (
    <div
      className={kind === "categories"
        ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-5 lg:gap-6"
        : "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 2xl:grid-cols-5"}
      role="status"
      aria-label={kind === "categories" ? "Loading categories" : "Loading products"}
      style={{ "--skeleton-duration": `${MOTION.skeletonDurationMs}ms` } as CSSProperties}
    >
      {Array.from({ length: count }, (_, index) => kind === "categories" ? (
        <div key={index} className="flex min-h-[190px] flex-col items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 sm:min-h-[220px] sm:p-4">
          <Block className="aspect-square w-full rounded-xl" />
          <Block className="h-4 w-3/5" />
        </div>
      ) : (
        <div key={index} className="flex h-full min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3">
          <Block className="aspect-square w-full rounded-none" />
          <div className="mt-auto space-y-2 pt-2">
            <Block className="h-3 w-1/3" />
            <Block className="h-4 w-4/5" />
            <Block className="h-4 w-1/2" />
          </div>
        </div>
      ))}
      <span className="col-span-full flex items-center justify-center py-2 text-brand" aria-hidden="true">
        <LoaderCircle className="size-5 animate-spin" />
        <span className="sr-only">Loading…</span>
      </span>
    </div>
  )
}
