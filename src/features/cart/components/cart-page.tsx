"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { ArrowLeft, CircleAlert, LockKeyhole, Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from "lucide-react"
import { Container } from "@/components/layout/container"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ServiceBenefits } from "@/features/home/components/service-benefits"
import { homePageData } from "@/features/home/data/home-page.data"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ProtectedRoute } from "@/components/shared/protected-route"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { getRevealDelay, MOTION } from "@/constants/motion"
import { getApiErrorMessage } from "@/lib/api-error"
import { productPath, ROUTES } from "@/constants/routes"
import {
  useApplyCartCoupon,
  useCart,
  useClearCart,
  useRemoveFromCart,
  useSetCartQuantity,
} from "@/features/cart/hooks/use-cart"
import { formatMoney } from "@/features/cart/utils/format-money"
import type { CartLine } from "@/features/cart/schemas/cart.schema"

function CartSkeleton() {
  return (
    <div className="grid gap-5 py-7 lg:grid-cols-[minmax(0,1fr)_380px]" role="status" aria-label="Loading cart">
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><span className="loading-skeleton size-24 shrink-0 rounded-xl sm:size-28" /><div className="flex-1 space-y-3"><span className="loading-skeleton block h-5 w-2/3 rounded" /><span className="loading-skeleton block h-4 w-1/3 rounded" /><span className="loading-skeleton block h-9 w-36 rounded-xl" /></div></div>)}
      </div>
      <div className="loading-skeleton hidden h-96 rounded-2xl lg:block" />
      <span className="sr-only">Loading cart…</span>
    </div>
  )
}

function CartSummary({
  cart,
  couponValue,
  onCouponValueChange,
  onCouponSubmit,
  couponError,
  couponNotice,
  isCouponPending,
}: {
  cart: NonNullable<ReturnType<typeof useCart>["data"]>
  couponValue: string
  onCouponValueChange: (value: string) => void
  onCouponSubmit: (event: FormEvent<HTMLFormElement>) => void
  couponError: string
  couponNotice: string
  isCouponPending: boolean
}) {
  const lines = cart?.data.products ?? []
  const unitCount = lines.reduce((sum, line) => sum + line.count, 0)
  const subtotal = cart?.data.totalCartPrice ?? 0
  return (
    <section aria-labelledby="cart-summary-title" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-brand to-emerald-700 px-5 py-4 text-white sm:px-6">
        <h2 id="cart-summary-title" className="flex items-center gap-2 text-lg font-bold"><LockKeyhole className="size-4" aria-hidden="true" />Order Summary</h2>
        <p className="mt-1 text-sm text-white/90">{cart?.numOfCartItems ?? 0} {cart?.numOfCartItems === 1 ? "item" : "items"} in your cart</p>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100"><Truck className="size-5" aria-hidden="true" /></span>
          <div><p className="font-semibold">Items in your cart</p><p className="text-sm">{unitCount} {unitCount === 1 ? "unit" : "units"}</p></div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 text-slate-600"><span>Items</span><span key={cart.numOfCartItems} className="cart-value-tick">{cart.numOfCartItems}</span></div>
          <div className="flex justify-between gap-4 text-slate-600"><span>Subtotal</span><span key={subtotal} className="cart-value-tick font-medium text-slate-800">{formatMoney(subtotal)}</span></div>
          <div className="border-t border-dashed border-slate-200 pt-4"><div className="flex items-center justify-between gap-4 text-base font-semibold text-slate-900"><span>Total</span><span key={`total-${subtotal}`} className="cart-value-tick">{formatMoney(subtotal)}</span></div></div>
        </div>
        <form onSubmit={onCouponSubmit} className="space-y-3 rounded-2xl bg-slate-900 p-4 text-white shadow-inner sm:p-5">
          <div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-emerald-300"><Tag className="size-4" aria-hidden="true" /></span><label htmlFor="cart-coupon" className="text-sm font-semibold">Apply a coupon</label></div>
          <div className="flex gap-2">
            <input id="cart-coupon" value={couponValue} onChange={(event) => onCouponValueChange(event.target.value)} placeholder="Enter promo code" disabled={isCouponPending || lines.length === 0} className="h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60" />
            <button type="submit" disabled={isCouponPending || lines.length === 0 || !couponValue.trim()} className="motion-button h-11 shrink-0 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none">{isCouponPending ? "Applying…" : "Apply"}</button>
          </div>
          {couponError ? <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">{couponError}</p> : null}
          {couponNotice ? <p className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200" role="status">{couponNotice}</p> : null}
          <p className="text-xs leading-5 text-slate-400">Coupon confirmation details are pending from the API.</p>
        </form>
        <Link href={ROUTES.checkout} className="motion-button flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><LockKeyhole className="size-4" aria-hidden="true" />Checkout</Link>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><LockKeyhole className="size-3.5 text-brand" aria-hidden="true" />Secure session</span><span aria-hidden="true" className="h-4 w-px bg-slate-200" /><span>Cart updates are saved</span></div>
        <Link href={ROUTES.products} className="flex min-h-10 items-center justify-center gap-2 text-sm font-medium text-brand transition hover:text-brand-dark"><ArrowLeft className="size-4" aria-hidden="true" />Continue shopping</Link>
      </div>
    </section>
  )
}

function CartLineCard({
  line,
  index,
  busy,
  leaving = false,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  line: CartLine
  index: number
  busy: boolean
  leaving?: boolean
  onDecrease: () => void
  onIncrease: () => void
  onRemove: (trigger: HTMLButtonElement) => void
}) {
  const { product } = line
  const stock = product.quantity
  const atLimit = line.count >= stock
  return (
    <ScrollReveal delayMs={getRevealDelay(index)}>
      <article className={`motion-card grid min-w-0 grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5 sm:p-5 ${leaving ? "cart-line-exit" : ""}`}>
        <Link href={productPath(product._id)} aria-label={`View ${product.title}`} className="relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          <Image src={product.imageCover} alt={product.title} fill sizes="112px" className="motion-card-image object-contain p-2" />
        </Link>
        <div className="flex min-w-0 flex-col">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={productPath(product._id)} className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800 hover:text-brand sm:text-base">{product.title}</Link>
              <div className="mt-2 flex flex-wrap gap-1.5"><span className="max-w-full truncate rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">{product.category.name}</span><span className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{product.brand.name}</span></div>
            </div>
            <button type="button" aria-label={`Remove ${product.title} from cart`} disabled={busy} onClick={(event) => onRemove(event.currentTarget)} className="motion-button flex size-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" /></button>
          </div>
          <p className="mt-2 text-sm font-bold text-brand sm:text-base">{formatMoney(line.price)} <span className="text-xs font-normal text-slate-400">per unit</span></p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
            <div>
              <div className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white p-1">
                <button type="button" aria-label={`Decrease ${product.title} quantity`} disabled={busy || line.count <= 1} onClick={onDecrease} className="motion-button flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"><Minus className="size-4" aria-hidden="true" /></button>
                <span key={line.count} className="cart-value-tick min-w-8 text-center text-sm font-semibold text-slate-800" aria-live="polite">{line.count}</span>
                <button type="button" aria-label={`Increase ${product.title} quantity`} disabled={busy || atLimit || stock < 1} onClick={onIncrease} className="motion-button flex size-8 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-300"><Plus className="size-4" aria-hidden="true" /></button>
              </div>
              <p className={`mt-1 text-[11px] ${stock < 1 ? "text-red-600" : atLimit ? "text-amber-600" : "text-slate-400"}`}>{stock < 1 ? "Out of stock" : atLimit ? `Maximum stock: ${stock}` : `${stock} available`}</p>
            </div>
            <div className="text-right"><p className="text-xs text-slate-400">Line total</p><p key={`${line.price * line.count}-${line.count}`} className="cart-value-tick text-base font-bold text-slate-900 sm:text-lg">{formatMoney(line.price * line.count)}</p></div>
          </div>
        </div>
      </article>
    </ScrollReveal>
  )
}

function CartContent() {
  const query = useCart()
  const quantityMutation = useSetCartQuantity()
  const removeMutation = useRemoveFromCart()
  const clearMutation = useClearCart()
  const couponMutation = useApplyCartCoupon()
  const [couponValue, setCouponValue] = useState("")
  const [couponNotice, setCouponNotice] = useState("")
  const [couponError, setCouponError] = useState("")
  const [removeTarget, setRemoveTarget] = useState<CartLine | null>(null)
  const [exitingLine, setExitingLine] = useState<CartLine | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [pageError, setPageError] = useState("")
  const removeTriggerRef = useRef<HTMLElement | null>(null)
  const clearTriggerRef = useRef<HTMLElement | null>(null)
  const cart = query.data
  const lines = cart?.data.products ?? []
  const visibleLines = exitingLine && !lines.some((line) => line.product._id === exitingLine.product._id)
    ? [...lines, exitingLine]
    : lines
  const subtotal = cart?.data.totalCartPrice ?? 0
  const anyMutationPending = quantityMutation.isPending || removeMutation.isPending || clearMutation.isPending

  useEffect(() => {
    if (!exitingLine) return
    const timeout = window.setTimeout(() => setExitingLine(null), MOTION.cartRemoveDurationMs)
    return () => window.clearTimeout(timeout)
  }, [exitingLine])

  const submitCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCouponError("")
    setCouponNotice("")
    couponMutation.mutate({ couponName: couponValue.trim() }, {
      onSuccess: () => setCouponNotice("Coupon request completed. The cart has been refreshed."),
      onError: (error) => setCouponError(getApiErrorMessage(error, "The coupon could not be applied.")),
    })
  }

  const confirmRemove = async () => {
    if (!removeTarget) return
    setPageError("")
    try {
      await removeMutation.mutateAsync({ productId: removeTarget.product._id })
      setExitingLine(removeTarget)
      setRemoveTarget(null)
    } catch (error) {
      setPageError(getApiErrorMessage(error, "This item could not be removed."))
      throw error
    }
  }

  const confirmClear = async () => {
    setPageError("")
    try {
      await clearMutation.mutateAsync()
      setClearDialogOpen(false)
    } catch (error) {
      setPageError(getApiErrorMessage(error, "The cart could not be cleared."))
      throw error
    }
  }

  return (
    <>
      <main id="main-content" className="min-h-[55vh] bg-slate-50/70 pb-24 pt-1 sm:pb-10">
        <Container>
          <div className="pt-6 text-sm text-slate-500"><Link href={ROUTES.home} className="hover:text-brand">Home</Link><span className="mx-2">/</span><span className="text-slate-800">Shopping Cart</span></div>
          <ScrollReveal className="flex flex-wrap items-center justify-between gap-4 py-5 sm:py-7">
            <div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-xl bg-brand text-white shadow-sm"><ShoppingBag className="size-6" aria-hidden="true" /></span><div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Shopping Cart</h1><p className="mt-1 text-sm text-slate-500">{query.isSuccess ? `${cart?.numOfCartItems ?? 0} items in your cart` : "Review your items"}</p></div></div>
            {lines.length > 0 ? <button ref={(element) => { clearTriggerRef.current = element }} type="button" disabled={anyMutationPending} onClick={() => setClearDialogOpen(true)} className="motion-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-100 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" />Clear cart</button> : null}
          </ScrollReveal>

          {query.isPending ? <CartSkeleton /> : null}
          {query.isError ? <div className="my-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center" role="alert"><CircleAlert className="mx-auto size-8 text-red-500" aria-hidden="true" /><p className="mt-3 text-sm text-red-700">{getApiErrorMessage(query.error, "Your cart could not be loaded.")}</p><button type="button" onClick={() => void query.refetch()} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Try again</button></div> : null}

          {pageError ? <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{pageError}</p> : null}
          {query.isSuccess && lines.length === 0 ? <ScrollReveal><div className="my-5 rounded-2xl border border-slate-100 bg-white px-5 py-16 text-center shadow-sm"><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-brand"><ShoppingBag className="size-8" aria-hidden="true" /></span><h2 className="mt-5 text-xl font-semibold text-slate-800">Your cart is empty</h2><p className="mt-2 text-sm text-slate-500">Add something you love and it will appear here.</p><Link href={ROUTES.products} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white shadow-sm transition hover:bg-brand-dark"><ArrowLeft className="size-4" aria-hidden="true" />Continue shopping</Link></div></ScrollReveal> : null}

          {query.isSuccess && cart && visibleLines.length > 0 ? <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8"><section aria-label="Cart items" className="min-w-0 space-y-4">{visibleLines.map((line, index) => <CartLineCard key={line._id} line={line} index={index} leaving={exitingLine?.product._id === line.product._id && !lines.some((current) => current.product._id === line.product._id)} busy={quantityMutation.isPending && quantityMutation.variables?.productId === line.product._id || removeMutation.isPending && removeMutation.variables?.productId === line.product._id} onDecrease={() => quantityMutation.mutate({ productId: line.product._id, count: line.count - 1 })} onIncrease={() => quantityMutation.mutate({ productId: line.product._id, count: line.count + 1 })} onRemove={(trigger) => { removeTriggerRef.current = trigger; setRemoveTarget(line) }} />)}</section><div className="lg:sticky lg:top-20"><ScrollReveal><CartSummary cart={cart} couponValue={couponValue} onCouponValueChange={setCouponValue} onCouponSubmit={submitCoupon} couponError={couponError} couponNotice={couponNotice} isCouponPending={couponMutation.isPending} /></ScrollReveal></div></div> : null}

          {query.isSuccess && lines.length > 0 ? <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4"><Link href={ROUTES.products} className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"><ArrowLeft className="size-4" aria-hidden="true" />Continue shopping</Link><button type="button" disabled={anyMutationPending} onClick={(event) => { clearTriggerRef.current = event.currentTarget; setClearDialogOpen(true) }} className="text-sm text-slate-400 transition hover:text-red-600 disabled:opacity-50"><Trash2 className="mr-1 inline size-4" aria-hidden="true" />Clear all items</button></div> : null}
        </Container>
      </main>

      {query.isSuccess && lines.length > 0 ? <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"><div className="mx-auto flex max-w-[1344px] items-center justify-between gap-3"><div><p className="text-[11px] text-slate-500">Total</p><p className="text-base font-bold text-slate-900">{formatMoney(subtotal)}</p></div><Link href={ROUTES.checkout} className="motion-button flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white"><LockKeyhole className="size-4" aria-hidden="true" />Checkout</Link></div></div> : null}
      <ServiceBenefits items={homePageData.bottomBenefits} variant="strip" />
      <ConfirmDialog open={Boolean(removeTarget)} onOpenChange={(open) => { if (!open) setRemoveTarget(null) }} title="Remove item?" description={`Remove ${removeTarget?.product.title ?? "this item"} from your cart?`} confirmLabel={removeMutation.isPending ? "Removing…" : "Remove item"} cancelLabel="Keep item" variant="destructive" onConfirm={confirmRemove} returnFocusRef={removeTriggerRef} />
      <ConfirmDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen} title="Clear cart?" description="Remove every item from your cart? This cannot be undone." confirmLabel={clearMutation.isPending ? "Clearing…" : "Clear cart"} cancelLabel="Keep items" variant="destructive" onConfirm={confirmClear} returnFocusRef={clearTriggerRef} />
    </>
  )
}

export function CartPage() {
  return <><SiteHeader data={homePageData.header} /><ProtectedRoute><CartContent /></ProtectedRoute><SiteFooter data={homePageData.footer} /></>
}
