"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react"
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, CircleAlert, LoaderCircle, LockKeyhole,
  Minus, Plus, RotateCcw, Share2, ShieldCheck, ShoppingCart, Star, Truck,
} from "lucide-react"
import { Container } from "@/components/layout/container"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { homePageData } from "@/features/home/data/home-page.data"
import { ServiceBenefits } from "@/features/home/components/service-benefits"
import { ProductCard } from "@/features/home/components/featured-products"
import { WishlistToggleButton } from "@/features/wishlist/components/wishlist-toggle-button"
import { useProducts, useProduct } from "@/features/products/hooks/use-products"
import { useAddToCart, useCart, useSetCartQuantity } from "@/features/cart/hooks/use-cart"
import { useAuthStore } from "@/store/auth-store"
import { getApiErrorMessage } from "@/lib/api-error"
import { categoryPath, loginRedirectPath, productPath, ROUTES } from "@/constants/routes"
import { formatMoney } from "@/features/cart/utils/format-money"
import { PRODUCT_DETAILS_COPY as COPY } from "@/constants/freshcart"
import { getRevealDelay } from "@/constants/motion"
import { ProductReviewsPanel } from "@/features/reviews/components/product-reviews-panel"
import { useAllProductReviews, useProductReviews } from "@/features/reviews/hooks/use-reviews"
import type { Product, ProductDetails } from "@/features/products/schemas/product.schema"

function DetailsSkeleton() {
  return (
    <div className="grid gap-5 py-6 lg:grid-cols-[380px_minmax(0,1fr)]" role="status" aria-label={COPY.loading}>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="loading-skeleton aspect-[3/4] rounded-xl" />
        <div className="mt-3 grid grid-cols-4 gap-2"><span className="loading-skeleton aspect-square rounded-lg" /><span className="loading-skeleton aspect-square rounded-lg" /><span className="loading-skeleton aspect-square rounded-lg" /><span className="loading-skeleton aspect-square rounded-lg" /></div>
      </div>
      <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8"><span className="loading-skeleton block h-7 w-44 rounded-full" /><span className="loading-skeleton block h-9 w-2/3 rounded" /><span className="loading-skeleton block h-7 w-32 rounded" /><span className="loading-skeleton block h-24 rounded-xl" /><span className="loading-skeleton block h-12 rounded-xl" /></div>
    </div>
  )
}

function Stars({ rating, size = "size-5" }: { rating: number; size?: string }) {
  return <span className="inline-flex items-center text-amber-400" aria-label={COPY.ratingLabel.replace("{rating}", rating.toFixed(1))}>
    {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`${size} product-star ${index < Math.round(rating) ? "fill-current" : "fill-none"}`} style={{ "--star-index": index } as CSSProperties} aria-hidden="true" />)}
  </span>
}

function ProductFeatureStrip() {
  const features = [
    { title: COPY.deliveryTitle, description: COPY.deliveryDescription, icon: Truck },
    { title: COPY.returnsTitle, description: COPY.returnsDescription, icon: RotateCcw },
    { title: COPY.paymentTitle, description: COPY.paymentDescription, icon: ShieldCheck },
  ]
  return <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
    {features.map(({ title, description, icon: Icon }, index) => <ScrollReveal key={title} delayMs={getRevealDelay(index)} className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-brand"><Icon className="size-5" aria-hidden="true" /></span>
      <span><strong className="block text-sm font-semibold text-slate-900">{title}</strong><span className="text-xs text-slate-500">{description}</span></span>
    </ScrollReveal>)}
  </div>
}

function RelatedProducts({ product }: { product: ProductDetails }) {
  const query = useProducts({ limit: 12, "category[in]": product.category._id })
  const listRef = useRef<HTMLDivElement>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  // The category[in] API filter has not been verified. Keep this explicit client-side guard until it is confirmed.
  const related = (query.data?.data ?? []).filter((item): item is Product => Boolean(
    item._id && item.category && item._id !== product._id && item.category._id === product.category._id,
  ))

  const updateArrows = useCallback(() => {
    const element = listRef.current
    if (!element) return
    setCanGoBack(element.scrollLeft > 2)
    setCanGoForward(element.scrollLeft + element.clientWidth < element.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const element = listRef.current
    if (!element) return
    updateArrows()
    const observer = new ResizeObserver(updateArrows)
    observer.observe(element)
    return () => observer.disconnect()
  }, [related.length, updateArrows])

  const move = (direction: -1 | 1) => {
    const element = listRef.current
    if (!element) return
    const card = element.querySelector<HTMLElement>("[data-related-card]")
    const distance = card ? card.offsetWidth + 16 : element.clientWidth * 0.8
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    element.scrollBy({ left: direction * distance, behavior: reduceMotion ? "auto" : "smooth" })
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1) }
    else if (event.key === "ArrowRight") { event.preventDefault(); move(1) }
    else if (event.key === "Home") { event.preventDefault(); listRef.current?.scrollTo({ left: 0 }) }
    else if (event.key === "End") { event.preventDefault(); listRef.current?.scrollTo({ left: listRef.current.scrollWidth }) }
  }

  if (query.isPending || query.isError || related.length === 0) return null
  const titleWords = COPY.relatedTitle.split(" ")
  const titleAccent = titleWords.pop() ?? ""
  return <section className="py-8 sm:py-10 lg:py-12" aria-labelledby="related-products-title"><Container>
    <div className="mb-5 flex items-center justify-between gap-4">
      <ScrollReveal as="h2" id="related-products-title" className="motion-accent relative pl-3 text-xl font-bold tracking-tight text-slate-800 before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:origin-bottom before:rounded-full before:bg-brand sm:text-2xl">{titleWords.join(" ")} <span className="text-brand">{titleAccent}</span></ScrollReveal>
      {canGoBack || canGoForward ? <div className="flex gap-2"><button type="button" aria-label={COPY.relatedPrevious} onClick={() => move(-1)} disabled={!canGoBack} className="motion-button flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-emerald-50 hover:text-brand disabled:opacity-40"><ChevronLeft className="size-5" aria-hidden="true" /></button><button type="button" aria-label={COPY.relatedNext} onClick={() => move(1)} disabled={!canGoForward} className="motion-button flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-emerald-50 hover:text-brand disabled:opacity-40"><ChevronRight className="size-5" aria-hidden="true" /></button></div> : null}
    </div>
    <div ref={listRef} tabIndex={0} role="region" aria-label={COPY.relatedRegion} onScroll={updateArrows} onKeyDown={handleKeyDown} className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {related.map((item, index) => <div data-related-card key={item._id} className="w-[78vw] max-w-[280px] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] sm:max-w-none lg:w-[calc((100%-3rem)/4)]"><ProductCard product={item} delayMs={getRevealDelay(index)} productHref={productPath(item._id)} /></div>)}
    </div>
  </Container></section>
}

function ProductTabs({ product }: { product: ProductDetails }) {
  const [activeTab, setActiveTab] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const tabs = COPY.tabs
  const reviewsQuery = useProductReviews(product._id, activeTab === 1)
  const firstReviewPage = reviewsQuery.data?.pages[0]
  const summaryQuery = useAllProductReviews(product._id, firstReviewPage, activeTab === 1)
  const reviewCount = firstReviewPage?.results
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, current: number) => {
    let next = current
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length
    else if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = tabs.length - 1
    else return
    event.preventDefault()
    setActiveTab(next)
    tabRefs.current[next]?.focus()
  }

  return <section className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:mt-10" aria-label={COPY.productInformationRegion}>
    <div role="tablist" aria-label={COPY.productInformationTabs} className="relative grid grid-cols-3 border-b border-slate-200">
      {tabs.map((tab, index) => <button key={tab} ref={(element) => { tabRefs.current[index] = element }} id={`product-tab-${index}`} type="button" role="tab" aria-selected={activeTab === index} aria-controls="product-tab-panel" tabIndex={activeTab === index ? 0 : -1} onClick={() => setActiveTab(index)} onKeyDown={(event) => onTabKeyDown(event, index)} className={`min-h-14 px-2 py-3 text-center text-xs font-medium transition-colors sm:min-h-16 sm:px-4 sm:text-sm ${activeTab === index ? "bg-emerald-50/60 text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-brand"}`}>
        {index === 0 ? <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2"><ShoppingCart className="size-3.5 sm:size-4" aria-hidden="true" />{tab}</span> : index === 1 ? <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2"><Star className="size-3.5 fill-current sm:size-4" aria-hidden="true" />{tab}{reviewCount === undefined ? "" : ` (${reviewCount})`}</span> : <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2"><Truck className="size-3.5 sm:size-4" aria-hidden="true" />{tab}</span>}
      </button>)}
      <span aria-hidden="true" className="product-tab-underline absolute bottom-0 left-0 h-0.5 w-1/3 bg-brand" style={{ transform: `translateX(${activeTab * 100}%)` }} />
    </div>
    <div id="product-tab-panel" role="tabpanel" aria-labelledby={`product-tab-${activeTab}`} tabIndex={0} className="min-h-[280px] p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:p-7 lg:p-8">
      {activeTab === 0 ? <div className="space-y-6">
        <div><h2 className="text-lg font-semibold text-slate-900">{COPY.description}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{product.description}</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 sm:p-5"><h3 className="mb-3 font-medium text-slate-900">{COPY.productInformation}</h3><dl className="space-y-2.5 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">{COPY.category}</dt><dd className="text-right font-medium text-slate-800">{product.category.name}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">{COPY.subcategory}</dt><dd className="text-right font-medium text-slate-800">{product.subcategory.map((item) => item.name).join(", ") || "—"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">{COPY.brand}</dt><dd className="text-right font-medium text-slate-800">{product.brand.name}</dd></div>{product.availableColors?.length ? <div className="flex justify-between gap-3"><dt className="text-slate-500">{COPY.availableColors}</dt><dd className="text-right font-medium text-slate-800">{product.availableColors.join(", ")}</dd></div> : null}</dl></div>
          <div className="rounded-xl bg-slate-50 p-4 sm:p-5"><h3 className="mb-3 font-medium text-slate-900">{COPY.featureHeading}</h3><ul className="space-y-2.5 text-sm text-slate-600">{COPY.keyFeatures.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />{feature}</li>)}</ul></div>
        </div>
      </div> : activeTab === 1 ? <ProductReviewsPanel productId={product._id} reviewsQuery={reviewsQuery} summaryQuery={summaryQuery} /> : <div className="grid gap-4 py-2 sm:grid-cols-3">{COPY.shippingTabDetails.map((item, index) => { const Icon = index === 0 ? Truck : index === 1 ? RotateCcw : ShieldCheck; return <div key={item.title} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-brand"><Icon className="size-5" aria-hidden="true" /></span><span><strong className="block text-sm text-slate-900">{item.title}</strong><span className="text-sm text-slate-500">{item.description}</span></span></div> })}</div>}
    </div>
  </section>
}

function ProductContent({ product }: { product: ProductDetails }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const cartQuery = useCart(authReady && Boolean(user))
  const addMutation = useAddToCart()
  const quantityMutation = useSetCartQuantity()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "success">("idle")
  const [actionError, setActionError] = useState("")
  const [copied, setCopied] = useState(false)
  const primaryActionRef = useRef<HTMLDivElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const stock = product.quantity
  const safeQuantity = stock > 0 ? Math.min(Math.max(quantity, 1), stock) : 0
  const images = useMemo(() => Array.from(new Set([product.imageCover, ...product.images])), [product.imageCover, product.images])
  const discounted = product.priceAfterDiscount !== undefined
  const currentPrice = product.priceAfterDiscount ?? product.price
  const totalPrice = currentPrice * safeQuantity
  const pending = addMutation.isPending || quantityMutation.isPending || actionStatus === "loading"

  useEffect(() => {
    const element = primaryActionRef.current
    if (!element || stock <= 0) return
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [stock])
  useEffect(() => {
    if (actionStatus !== "success") return
    const timeout = window.setTimeout(() => setActionStatus("idle"), 1500)
    return () => window.clearTimeout(timeout)
  }, [actionStatus])

  const addSelectedQuantity = async (buyNow = false) => {
    if (!authReady || stock < 1 || pending) return
    if (!user) {
      const currentPath = `${pathname}${window.location.search}`
      router.push(loginRedirectPath(currentPath))
      return
    }
    setActionError("")
    setActionStatus("loading")
    try {
      let currentCart = cartQuery.data
      if (!cartQuery.isSuccess) {
        const result = await cartQuery.refetch()
        if (result.isError) throw result.error
        currentCart = result.data
      }
      const existingLine = currentCart?.data.products.find((line) => line.product._id === product._id)
      const targetCount = (existingLine?.count ?? 0) + safeQuantity
      if (targetCount > stock) throw new Error(COPY.stockLimitMessage.replace("{count}", String(Math.max(stock - (existingLine?.count ?? 0), 0))))
      if (existingLine) await quantityMutation.mutateAsync({ productId: product._id, count: targetCount })
      else {
        const added = await addMutation.mutateAsync({ productId: product._id })
        const addedLine = added.data.products.find((line) => line.product._id === product._id)
        if (!addedLine) throw new Error(COPY.missingCartLine)
        const countAfterAdd = addedLine.count + safeQuantity - 1
        if (countAfterAdd !== addedLine.count) await quantityMutation.mutateAsync({ productId: product._id, count: countAfterAdd })
      }
      setActionStatus("success")
      if (buyNow) router.push(ROUTES.cart)
    } catch (error) {
      setActionStatus("idle")
      setActionError(getApiErrorMessage(error, COPY.cartAddError))
    }
  }

  const shareProduct = async () => {
    const url = window.location.href
    setCopied(false)
    try {
      if (navigator.share) await navigator.share({ title: product.title, text: product.description, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      } catch {
        setActionError(COPY.copiedLinkError)
      }
    }
  }

  const addButtonLabel = actionStatus === "loading" ? COPY.addingToCart : actionStatus === "success" ? COPY.addedToCart : COPY.addToCart
  return <>
    <main id="main-content" className="bg-white py-5 sm:py-7"><Container>
      <Link href={categoryPath(product.category._id)} className="mb-3 inline-flex min-h-9 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><ArrowLeft className="size-4" aria-hidden="true" />Back to {product.category.name}</Link><nav aria-label={COPY.breadcrumb} className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm"><Link href={ROUTES.home} className="hover:text-brand">{COPY.homeBreadcrumb}</Link><ChevronRight className="size-3.5 text-slate-400" aria-hidden="true" /><Link href={categoryPath(product.category._id)} className="hover:text-brand">{product.category.name}</Link>{product.subcategory[0] ? <><ChevronRight className="size-3.5 text-slate-400" aria-hidden="true" /><span>{product.subcategory[0].name}</span></> : null}<ChevronRight className="size-3.5 text-slate-400" aria-hidden="true" /><span className="font-medium text-slate-900" aria-current="page">{product.title}</span></nav>
      <section className="grid items-start gap-5 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] xl:gap-7" aria-label={product.title}>
        <ScrollReveal className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
          <div className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-50"><Image key={images[activeImage]} src={images[activeImage]} alt={COPY.imageAlt.replace("{title}", product.title).replace("{index}", String(activeImage + 1))} fill priority sizes="(max-width: 1024px) 100vw, 380px" className="product-main-image object-contain" /></div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-label={COPY.productImages}>{images.slice(0, 4).map((src, index) => <button key={src} type="button" aria-label={COPY.showImage.replace("{index}", String(index + 1))} aria-pressed={activeImage === index} onClick={() => setActiveImage(index)} className={`relative aspect-square overflow-hidden rounded-lg bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${activeImage === index ? "ring-2 ring-brand ring-offset-1" : "border border-slate-100 hover:border-brand/50"}`}><Image src={src} alt="" fill sizes="(max-width: 640px) 20vw, 86px" className="object-contain p-1.5" /></button>)}</div>
        </ScrollReveal>
        <ScrollReveal className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-wrap gap-2 text-xs font-medium"><Link href={categoryPath(product.category._id)} className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-100">{product.category.name}</Link><span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{product.brand.name}</span></div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2"><Stars rating={product.ratingsAverage} /><span className="text-sm text-slate-600">{product.ratingsAverage.toFixed(1)} ({product.ratingsQuantity} {COPY.reviews})</span></div>
          <div className="mt-4 flex flex-wrap items-center gap-3"><p className="text-2xl font-bold text-slate-900 sm:text-3xl">{formatMoney(currentPrice)}</p>{discounted ? <><del className="text-base text-slate-400">{formatMoney(product.price)}</del><span className="rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white">-{Math.round((1 - currentPrice / product.price) * 100)}%</span></> : null}</div>
          <p className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}><span className={`size-2 rounded-full ${stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />{stock > 0 ? COPY.stockIn : COPY.stockOut}</p>
          <p className="mt-5 whitespace-pre-line border-t border-slate-100 pt-5 text-sm leading-7 text-slate-600">{product.description}</p>
          <div className="mt-5"><label className="mb-2 block text-sm font-medium text-slate-700">{COPY.quantity}</label><div className="flex flex-wrap items-center gap-3"><div className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white p-1"><button type="button" aria-label={COPY.decreaseQuantity} disabled={stock < 1 || safeQuantity <= 1} onClick={() => setQuantity((value) => Math.max(value - 1, 1))} className="motion-button flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><Minus className="size-4" aria-hidden="true" /></button><span key={safeQuantity} className="cart-value-tick min-w-10 text-center text-sm font-semibold text-slate-900" aria-live="polite">{safeQuantity}</span><button type="button" aria-label={COPY.increaseQuantity} disabled={stock < 1 || safeQuantity >= stock} onClick={() => setQuantity((value) => Math.min(value + 1, stock))} className="motion-button flex size-9 items-center justify-center rounded-lg bg-slate-50 text-slate-700 transition hover:bg-emerald-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"><Plus className="size-4" aria-hidden="true" /></button></div><span className="text-sm text-slate-500">{stock} {COPY.availableSuffix}</span></div></div>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm text-slate-600">{COPY.totalPrice}</span><span key={totalPrice} className="cart-value-tick text-lg font-bold text-brand sm:text-xl">{formatMoney(totalPrice)}</span></div>
          {actionError ? <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{actionError}</p> : null}
          <div ref={primaryActionRef} className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" disabled={stock < 1 || pending || !authReady} onClick={() => void addSelectedQuantity()} className="motion-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-semibold text-white shadow-[0_6px_16px_rgba(8,169,80,0.18)] transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-300"><ShoppingCart className="size-4" aria-hidden="true" />{pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : actionStatus === "success" ? <Check className="size-4" aria-hidden="true" /> : null}{addButtonLabel}</button><button type="button" disabled={stock < 1 || pending || !authReady} onClick={() => void addSelectedQuantity(true)} className="motion-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"><LockKeyhole className="size-4" aria-hidden="true" />{COPY.buyNow}</button></div>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_48px] gap-2"><WishlistToggleButton product={product} className="motion-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-wait disabled:opacity-60" iconClassName="size-5" /><button type="button" onClick={() => void shareProduct()} aria-label={COPY.share} className="motion-button relative flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><Share2 className="size-5" aria-hidden="true" /><span className="sr-only">{copied ? COPY.copied : COPY.share}</span></button></div>
          {copied ? <p className="mt-2 text-right text-xs text-brand" role="status">{COPY.copied}</p> : null}
          <div className="mt-6"><ProductFeatureStrip /></div>
        </ScrollReveal>
      </section>
      <ScrollReveal><ProductTabs product={product} /></ScrollReveal>
    </Container></main>
    {showStickyBar && stock > 0 ? <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"><div className="mx-auto flex max-w-[1344px] items-center justify-between gap-3"><div><p className="text-[11px] text-slate-500">{COPY.totalPrice}</p><p className="text-base font-bold text-slate-900">{formatMoney(totalPrice)}</p></div><button type="button" disabled={pending || !authReady} onClick={() => void addSelectedQuantity()} className="motion-button flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:bg-slate-300">{pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : actionStatus === "success" ? <Check className="size-4" aria-hidden="true" /> : <ShoppingCart className="size-4" aria-hidden="true" />}{addButtonLabel}</button></div></div> : null}
    <RelatedProducts product={product} />
    <ServiceBenefits items={homePageData.bottomBenefits} variant="strip" />
  </>
}

export function ProductDetailsPage({ productId }: { productId: string }) {
  const query = useProduct(productId)
  return <><SiteHeader data={homePageData.header} />
    {query.isPending ? <main className="min-h-[55vh] bg-slate-50/60 py-5"><Container><DetailsSkeleton /></Container></main> : null}
    {query.isNotFound ? <main className="min-h-[55vh] bg-slate-50/60 py-8"><Container><div className="mx-auto my-8 max-w-xl rounded-2xl border border-slate-100 bg-white px-5 py-14 text-center shadow-sm"><CircleAlert className="mx-auto size-12 text-slate-300" aria-hidden="true" /><h1 className="mt-4 text-xl font-bold text-slate-900">{COPY.notFoundTitle}</h1><p className="mt-2 text-sm text-slate-500">{COPY.notFoundDescription}</p><Link href={ROUTES.products} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white transition hover:bg-brand-dark"><ArrowLeft className="size-4" aria-hidden="true" />{COPY.shop}</Link></div></Container></main> : null}
    {query.isError && !query.isNotFound ? <main className="min-h-[55vh] bg-slate-50/60 py-8"><Container><div className="mx-auto my-8 max-w-xl rounded-2xl border border-red-100 bg-red-50 px-5 py-10 text-center" role="alert"><CircleAlert className="mx-auto size-10 text-red-500" aria-hidden="true" /><h1 className="mt-4 text-lg font-semibold text-red-800">{COPY.unavailableTitle}</h1><p className="mt-2 text-sm text-red-700">{getApiErrorMessage(query.error, COPY.unavailableDescription)}</p><button type="button" onClick={() => void query.refetch()} className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">{COPY.retry}</button></div></Container></main> : null}
    {query.data?.data ? <ProductContent key={query.data.data._id} product={query.data.data} /> : null}
    <SiteFooter data={homePageData.footer} />
  </>
}
