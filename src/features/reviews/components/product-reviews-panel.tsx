"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, RefObject } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Check, LoaderCircle, Pencil, Star, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { loginRedirectPath, productPath } from "@/constants/routes"
import { REVIEW_COPY } from "@/constants/reviews"
import { MOTION, getRevealDelay } from "@/constants/motion"
import { useAuthStore } from "@/store/auth-store"
import { getApiErrorMessage } from "@/lib/api-error"
import { ReviewRequestSchema, type ProductReview, type ReviewRequest } from "@/features/reviews/schemas/review.schema"
import { useAllProductReviews, useCreateProductReview, useDeleteReview, useUpdateReview } from "@/features/reviews/hooks/use-reviews"
import type { useProductReviews } from "@/features/reviews/hooks/use-reviews"

type ReviewsQuery = ReturnType<typeof useProductReviews>
type SummaryQuery = ReturnType<typeof useAllProductReviews>

function ReviewSkeleton() {
  return <div className="space-y-4" role="status" aria-label={REVIEW_COPY.loading}>
    {Array.from({ length: 3 }, (_, index) => <div key={index} className="rounded-xl border border-slate-100 p-4"><div className="flex items-center gap-3"><span className="loading-skeleton size-10 rounded-full" /><span className="loading-skeleton h-4 w-32 rounded" /></div><span className="loading-skeleton mt-4 block h-4 w-28 rounded" /><span className="loading-skeleton mt-3 block h-16 rounded" /></div>)}
  </div>
}

function ReviewStars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return <span className="inline-flex gap-0.5 text-amber-400" aria-label={REVIEW_COPY.starsOutOf.replace("{rating}", rating.toFixed(1))}>
    {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" style={{ "--star-index": index } as CSSProperties} className={`${size} product-star ${index < Math.round(rating) ? "fill-current" : "fill-none"}`} />)}
  </span>
}

function CountUpAverage({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const currentValue = useRef(0)
  const hasEntered = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    let animationFrame = 0
    let observer: IntersectionObserver | undefined
    const animate = () => {
      hasEntered.current = true
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        currentValue.current = value
        setDisplay(value)
        return
      }
      const start = performance.now()
      const from = currentValue.current
      const tick = (now: number) => {
        const progress = Math.min((now - start) / MOTION.countUpDurationMs, 1)
        const next = from + (value - from) * progress
        currentValue.current = next
        setDisplay(next)
        if (progress < 1) animationFrame = window.requestAnimationFrame(tick)
      }
      animationFrame = window.requestAnimationFrame(tick)
    }
    if (hasEntered.current) animate()
    else {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return
        observer?.disconnect()
        animate()
      }, { threshold: 0.25 })
      observer.observe(element)
    }
    return () => {
      observer?.disconnect()
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [value])

  return <span ref={ref} className="review-average-tick inline-block w-[4ch] tabular-nums">{display.toFixed(1)}</span>
}

function StarDistribution({ ratings }: { ratings: ProductReview[] }) {
  const all = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((item) => Math.min(Math.max(Math.round(item.rating), 1), 5) === star).length,
  }))
  const denominator = ratings.length

  return <div className="space-y-2.5">
    {all.map(({ star, count }, index) => {
      const percent = denominator ? Math.round((count / denominator) * 100) : 0
      return <ScrollReveal key={star} delayMs={getRevealDelay(index)} className="grid grid-cols-[48px_minmax(0,1fr)_40px] items-center gap-3 text-sm">
        <span className="text-slate-600">{star} {REVIEW_COPY.star}</span>
        <span className="h-2.5 overflow-hidden rounded-full bg-slate-200"><span className="review-bar-fill block h-full rounded-full bg-amber-400" style={{ "--review-progress": String(percent / 100) } as CSSProperties} /></span>
        <span className="text-right text-slate-500">{percent}%</span>
      </ScrollReveal>
    })}
  </div>
}

function relativeDate(dateValue: string) {
  const seconds = Math.round((new Date(dateValue).getTime() - Date.now()) / 1000)
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1],
  ]
  const [unit, interval] = units.find(([, size]) => Math.abs(seconds) >= size) ?? units.at(-1)!
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(Math.round(seconds / interval), unit)
}

function exactDate(dateValue: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateValue))
}

function reviewerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => Array.from(part)[0] ?? "").join("").toLocaleUpperCase()
}

function StarPicker({ value, onChange, errorId, invalid, firstButtonRef }: { value: number; onChange: (rating: number) => void; errorId: string; invalid: boolean; firstButtonRef: (element: HTMLButtonElement | null) => void }) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, rating: number) => {
    let next = rating
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(rating + 1, 5)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(rating - 1, 1)
    else if (/^[1-5]$/.test(event.key)) next = Number(event.key)
    else return
    event.preventDefault()
    onChange(next)
    buttons.current[next - 1]?.focus()
  }
  return <div role="radiogroup" aria-label={REVIEW_COPY.ratingLabel} aria-invalid={invalid} aria-describedby={invalid ? errorId : undefined} className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, index) => {
      const rating = index + 1
      return <button key={rating} ref={(element) => { buttons.current[index] = element; if (index === 0) firstButtonRef(element) }} type="button" role="radio" aria-checked={value === rating} aria-label={REVIEW_COPY.ratingOption.replace("{rating}", String(rating))} tabIndex={value === rating || (value === 0 && index === 0) ? 0 : -1} onClick={() => onChange(rating)} onKeyDown={(event) => handleKeyDown(event, rating)} className="review-star-choice motion-button rounded-sm p-0.5 text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
        <Star aria-hidden="true" className={`size-7 ${rating <= value ? "fill-current" : "fill-none"}`} />
      </button>
    })}
  </div>
}

function ReviewEditor({
  initialValues,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
  onSaved,
}: {
  initialValues?: ReviewRequest
  submitLabel: string
  pending: boolean
  onSubmit: (values: ReviewRequest) => Promise<void>
  onCancel?: () => void
  onSaved?: () => void
}) {
  const form = useForm<ReviewRequest>({
    resolver: zodResolver(ReviewRequestSchema),
    defaultValues: initialValues ?? { review: "", rating: 0 },
    shouldFocusError: true,
  })
  const [serverError, setServerError] = useState("")
  const reviewErrorId = "review-text-error"
  const ratingErrorId = "review-rating-error"
  const reviewError = form.formState.errors.review?.message
  const ratingError = form.formState.errors.rating?.message
  const reviewValue = useWatch({ control: form.control, name: "review" }) ?? ""

  const save = async (values: ReviewRequest) => {
    setServerError("")
    try {
      await onSubmit(values)
      form.reset({ review: "", rating: 0 })
      onSaved?.()
    } catch (error) {
      setServerError(getApiErrorMessage(error, REVIEW_COPY.submitError))
    }
  }

  return <form onSubmit={form.handleSubmit(save)} className="space-y-4" noValidate>
    {serverError ? <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{serverError}</p> : null}
    <div>
      <span className="mb-2 block text-sm font-medium text-slate-700">{REVIEW_COPY.ratingLabel}</span>
      <Controller control={form.control} name="rating" render={({ field }) => <StarPicker value={field.value} onChange={field.onChange} errorId={ratingErrorId} invalid={Boolean(ratingError)} firstButtonRef={field.ref} />} />
      {ratingError ? <p className="mt-1 text-sm text-red-600" id={ratingErrorId}>{ratingError}</p> : null}
    </div>
    <div>
      <label htmlFor="review-text" className="mb-2 block text-sm font-medium text-slate-700">{REVIEW_COPY.reviewLabel}</label>
      <textarea id="review-text" dir="auto" rows={4} maxLength={1000} placeholder={REVIEW_COPY.reviewPlaceholder} aria-invalid={Boolean(reviewError)} aria-describedby={reviewError ? reviewErrorId : undefined} {...form.register("review")} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15 aria-[invalid=true]:border-red-400" />
      <div className="mt-1 flex items-start justify-between gap-3"><span id={reviewErrorId} className="text-sm text-red-600">{reviewError ?? ""}</span><span className="shrink-0 text-xs text-slate-500">{reviewValue.length}/1000 {REVIEW_COPY.characters}</span></div>
    </div>
    <div className="flex flex-wrap gap-2">
      {onCancel ? <button type="button" onClick={onCancel} disabled={pending} className="motion-button min-h-10 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">{REVIEW_COPY.cancel}</button> : null}
      <button type="submit" disabled={pending} className="motion-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">{pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}{submitLabel}</button>
    </div>
  </form>
}

function ReviewCard({
  review,
  index,
  isNew,
  canManage,
  editing,
  deleting,
  pending,
  onEdit,
  onDelete,
  onUpdate,
  onCancel,
}: {
  review: ProductReview
  index: number
  isNew: boolean
  canManage: boolean
  editing: boolean
  deleting: boolean
  pending: boolean
  onEdit: () => void
  onDelete: (trigger: HTMLButtonElement) => void
  onUpdate: (values: ReviewRequest) => Promise<void>
  onCancel: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const name = review.user.name || REVIEW_COPY.noName
  const initials = reviewerInitials(name) || "?"
  return <div className={isNew ? "review-new-enter" : ""}><ScrollReveal className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5" delayMs={getRevealDelay(index)}>
    {editing ? <div className="space-y-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">{REVIEW_COPY.editReview}</h3><ReviewStars rating={review.rating} /></div><ReviewEditor initialValues={{ review: review.review, rating: Number.isInteger(review.rating) ? review.rating : 0 }} submitLabel={REVIEW_COPY.save} pending={pending} onSubmit={onUpdate} onCancel={onCancel} /></div> : <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">{initials}</span>
          <div className="min-w-0"><h3 className="truncate font-semibold text-slate-900">{name}</h3><time className="text-xs text-slate-500" dateTime={review.createdAt} title={exactDate(review.createdAt)}>{relativeDate(review.createdAt)}</time></div>
        </div>
        <ReviewStars rating={review.rating} />
      </div>
      <div className="mt-3">
        <p dir="auto" className={`break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere] ${expanded ? "" : "line-clamp-4"}`}>{review.review}</p>
        {review.review.length > 240 ? <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="mt-1 text-sm font-medium text-brand hover:underline">{expanded ? REVIEW_COPY.showLess : REVIEW_COPY.readMore}</button> : null}
      </div>
      {canManage ? <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={onEdit} className="motion-button inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand"><Pencil className="size-4" aria-hidden="true" />{REVIEW_COPY.edit}</button>
        <button type="button" disabled={deleting} onClick={(event) => onDelete(event.currentTarget)} className="motion-button inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" />{REVIEW_COPY.delete}</button>
      </div> : null}
    </>}
  </ScrollReveal></div>
}

export function ProductReviewsPanel({ productId, reviewsQuery, summaryQuery }: { productId: string; reviewsQuery: ReviewsQuery; summaryQuery: SummaryQuery }) {
  const user = useAuthStore((state) => state.user)
  const userId = useAuthStore((state) => state.userId)
  const authReady = useAuthStore((state) => state.authReady)
  const createMutation = useCreateProductReview()
  const updateMutation = useUpdateReview(productId)
  const deleteMutation = useDeleteReview(productId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductReview | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newReviewId, setNewReviewId] = useState<string | null>(null)
  const [serverError, setServerError] = useState("")
  const listHeadingRef = useRef<HTMLHeadingElement>(null)
  const deleteTriggerRef = useRef<HTMLButtonElement>(null) as RefObject<HTMLElement | null>

  const visibleReviews = useMemo(() => reviewsQuery.data?.pages.flatMap((page) => page.data) ?? [], [reviewsQuery.data])
  const allReviews = useMemo(() => summaryQuery.data?.pages.flatMap((page) => page.data) ?? [], [summaryQuery.data])
  const ownedReview = userId ? allReviews.find((review) => review.user._id === userId) : undefined
  const reviewsToShow = ownedReview && !visibleReviews.some((review) => review._id === ownedReview._id)
    ? [...visibleReviews, ownedReview]
    : visibleReviews
  const average = allReviews.length ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length : 0
  const total = summaryQuery.data?.results ?? reviewsQuery.data?.pages[0]?.results ?? 0
  const nextPageError = reviewsQuery.isFetchNextPageError
    ? getApiErrorMessage(reviewsQuery.error, REVIEW_COPY.loadError)
    : ""
  const signInHref = loginRedirectPath(typeof window === "undefined" ? productPath(productId) : `${window.location.pathname}${window.location.search}`)

  const writeReview = async (input: ReviewRequest) => {
    if (!authReady) throw new Error(REVIEW_COPY.submitError)
    const created = await createMutation.mutateAsync({ productId, input })
    setNewReviewId(created.data._id)
    window.setTimeout(() => setNewReviewId((current) => current === created.data._id ? null : current), MOTION.reviewNewDurationMs)
  }
  const editReview = (reviewId: string) => async (input: ReviewRequest) => {
    await updateMutation.mutateAsync({ reviewId, input })
    setEditingId(null)
    window.requestAnimationFrame(() => listHeadingRef.current?.focus())
  }
  const handleDelete = async () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setServerError("")
    setDeletingId(target._id)
    await new Promise((resolve) => window.setTimeout(resolve, MOTION.reviewDeleteDurationMs))
    try {
      await deleteMutation.mutateAsync({ reviewId: target._id })
      setDeleteTarget(null)
      setDeletingId(null)
      deleteTriggerRef.current = listHeadingRef.current
      window.requestAnimationFrame(() => listHeadingRef.current?.focus())
    } catch (error) {
      setServerError(getApiErrorMessage(error, REVIEW_COPY.submitError))
      setDeletingId(null)
      deleteTriggerRef.current = null
    }
  }

  return <div className="space-y-7" style={{ "--motion-review-delete-duration": `${MOTION.reviewDeleteDurationMs}ms`, "--motion-review-new-duration": `${MOTION.reviewNewDurationMs}ms`, "--motion-count-up-duration": `${MOTION.countUpDurationMs}ms` } as CSSProperties}>
    <section aria-label={REVIEW_COPY.summary} className="grid gap-6 border-b border-slate-200 pb-7 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
      <div className="text-center">
        {summaryQuery.isPending ? <span className="loading-skeleton mx-auto block h-14 w-24 rounded" aria-label={REVIEW_COPY.loading} /> : summaryQuery.isError ? <p className="text-sm text-red-600" role="alert">{REVIEW_COPY.loadError}</p> : <>
          <p className="text-5xl font-bold tracking-tight text-slate-900"><CountUpAverage value={average} /></p>
          <ScrollReveal className="mt-2 flex justify-center"><ReviewStars rating={average} size="size-6" /></ScrollReveal>
          <p className="mt-2 text-sm text-slate-500">{REVIEW_COPY.basedOn} {total} {REVIEW_COPY.reviews}</p>
        </>}
        {summaryQuery.isError ? <button type="button" onClick={() => void summaryQuery.refetch()} className="mt-2 text-sm font-medium text-brand hover:underline">{REVIEW_COPY.retry}</button> : null}
      </div>
      {summaryQuery.isPending ? <div className="space-y-3" role="status" aria-label={REVIEW_COPY.loading}>{[0, 1, 2, 3, 4].map((item) => <span key={item} className="loading-skeleton block h-3 rounded-full" />)}</div> : summaryQuery.isSuccess ? <StarDistribution ratings={allReviews} /> : <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{REVIEW_COPY.loadError}</div>}
    </section>

    {!authReady ? <div className="loading-skeleton h-24 rounded-xl" role="status" aria-label={REVIEW_COPY.loading} /> : !user ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><Link href={signInHref} className="font-semibold text-brand hover:underline">{REVIEW_COPY.signInToReview}</Link></p> : !userId || summaryQuery.isPending ? <div className="loading-skeleton h-24 rounded-xl" role="status" aria-label={REVIEW_COPY.loading} /> : userId && !ownedReview && editingId === null && summaryQuery.isSuccess ? <section className="rounded-xl bg-slate-50 p-4 sm:p-5" aria-labelledby="write-review-heading"><h2 id="write-review-heading" className="mb-4 text-lg font-semibold text-slate-900">{REVIEW_COPY.writeReview}</h2><ReviewEditor submitLabel={REVIEW_COPY.submit} pending={createMutation.isPending} onSubmit={writeReview} onSaved={() => window.requestAnimationFrame(() => listHeadingRef.current?.focus())} /></section> : null}

    {serverError ? <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{serverError}</p> : null}
    <section aria-labelledby="product-review-list-heading" className="space-y-4">
      <h2 id="product-review-list-heading" ref={listHeadingRef} tabIndex={-1} className="text-lg font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-brand">{REVIEW_COPY.heading}</h2>
      {reviewsQuery.isPending ? <ReviewSkeleton /> : reviewsQuery.isError ? <div className="rounded-xl bg-slate-50 p-6 text-center" role="alert"><p className="text-sm text-slate-600">{getApiErrorMessage(reviewsQuery.error, REVIEW_COPY.loadError)}</p><button type="button" onClick={() => void reviewsQuery.refetch()} className="mt-3 font-medium text-brand hover:underline">{REVIEW_COPY.retry}</button></div> : total === 0 ? <div className="rounded-xl bg-slate-50 px-4 py-10 text-center text-slate-500">{REVIEW_COPY.beFirst}</div> : <>
        <div className="space-y-3" aria-label={REVIEW_COPY.reviewList}>
          {reviewsToShow.map((review, index) => <div key={review._id} className={deletingId === review._id ? "review-delete-exit" : ""}>
            <ReviewCard review={review} index={index} isNew={newReviewId === review._id} canManage={Boolean(userId && review.user._id === userId) || user?.role === "admin"} editing={editingId === review._id} deleting={deletingId === review._id} pending={updateMutation.isPending} onEdit={() => { setServerError(""); setEditingId(review._id) }} onDelete={(trigger) => { deleteTriggerRef.current = trigger; setDeleteTarget(review) }} onUpdate={editReview(review._id)} onCancel={() => setEditingId(null)} />
          </div>)}
        </div>
        {nextPageError ? <p className="text-center text-sm text-red-600" role="alert">{nextPageError}</p> : null}
        {reviewsQuery.hasNextPage ? <div className="pt-2 text-center"><button type="button" disabled={reviewsQuery.isFetchingNextPage} onClick={() => void reviewsQuery.fetchNextPage()} className="motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand disabled:opacity-60">{reviewsQuery.isFetchingNextPage ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{reviewsQuery.isFetchingNextPage ? REVIEW_COPY.loadingMore : REVIEW_COPY.loadMore}</button></div> : null}
      </>}
    </section>

    <ConfirmDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !deleteMutation.isPending) setDeleteTarget(null) }} title={REVIEW_COPY.deleteTitle} description={REVIEW_COPY.deleteDescription} confirmLabel={deleteMutation.isPending ? REVIEW_COPY.loadingMore : REVIEW_COPY.deleteConfirm} cancelLabel={REVIEW_COPY.cancel} variant="destructive" onConfirm={handleDelete} returnFocusRef={deleteTriggerRef} />
  </div>
}
