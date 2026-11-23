"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, Star } from "lucide-react"
import { useProducts } from "@/features/products/hooks/use-products"
import type { Product, ProductProjection } from "@/features/products/schemas/product.schema"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { getRevealDelay } from "@/constants/motion"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { WishlistToggleButton } from "@/features/wishlist/components/wishlist-toggle-button"
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button"
import { productPath } from "@/constants/routes"
import { CartToggleButton } from "@/features/products/components/cart-toggle-button"
import { QuickViewTrigger } from "@/features/products/components/quick-view-trigger"

export function FeaturedProducts({ title }: { title: string }) {
  const { data, isPending, isError } = useProducts({ limit: 40 })
  const products = data?.data ?? []
  return (
    <section id="products" aria-labelledby="products-heading" className="py-10 md:py-12 lg:py-14">
      <Container>
      <ScrollReveal as="h2" id="products-heading" className="motion-accent relative mb-6 pl-3 text-xl font-bold tracking-tight text-slate-800 before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:origin-bottom before:scale-y-100 before:rounded-full before:bg-brand sm:mb-8 sm:text-2xl lg:text-[27px]">{title.split(" ")[0]} <span className="text-brand">{title.split(" ").slice(1).join(" ")}</span></ScrollReveal>
      {isPending ? <LoadingSkeleton kind="products" /> : null}
      {isError ? <div className="py-8 text-center text-sm text-slate-500" role="alert">Products could not be loaded.</div> : null}
      {!isPending && !isError && products.length === 0 ? <div className="py-8 text-center text-sm text-slate-500">No products available.</div> : null}
      {!isPending && !isError && products.length > 0 ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">{products.map((product, index) => <ProductCard key={product._id} product={product} delayMs={getRevealDelay(index)} productHref={product._id ? productPath(product._id) : undefined} />)}</div> : null}
      </Container>
    </section>
  )
}

export function ProductCard({ product, delayMs = 0, productHref }: { product: Product | ProductProjection; delayMs?: number; productHref?: string }) {
  const title = product.title ?? ""
  const currentPrice = product.priceAfterDiscount !== undefined && product.price !== undefined && product.priceAfterDiscount < product.price
    ? product.priceAfterDiscount
    : product.price
  const originalPrice = currentPrice !== product.price ? product.price : undefined
  const discount = originalPrice !== undefined && originalPrice > 0 && currentPrice !== undefined
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : undefined
  const filledStars = Math.round(product.ratingsAverage ?? 0)
  const stars = Array.from({ length: 5 }, (_, index) => index + 1)

  return (
    <ScrollReveal as="div" delayMs={delayMs} className="h-full">
    <article className="motion-card group relative flex h-full min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-2.5">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white sm:aspect-square">
        {product.imageCover ? productHref ? <Link href={productHref} aria-label={`View ${title}`} className="absolute inset-0"><Image src={product.imageCover} alt={title} fill sizes="(max-width: 640px) 48vw, (max-width: 1280px) 25vw, 240px" className="motion-card-image object-contain" /></Link> : <Image src={product.imageCover} alt={title} fill sizes="(max-width: 640px) 48vw, (max-width: 1280px) 25vw, 240px" className="motion-card-image object-contain" /> : null}
        {discount ? <span className="absolute left-0 top-0 z-10 rounded-br-md rounded-tl-md bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">-{discount}%</span> : null}
        <div className="absolute right-0 top-0 z-10 flex flex-col items-end gap-1.5">
          <WishlistToggleButton product={product} className="motion-button flex size-7 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-sm transition-transform hover:scale-105 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-wait disabled:opacity-70 sm:size-8" iconClassName="size-3.5" />
          <CartToggleButton product={product} />
          {productHref ? <QuickViewTrigger product={product} /> : <button type="button" aria-label={`Quick view ${title}`} className="motion-button flex size-7 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-sm transition-transform hover:scale-105 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:size-8"><Eye className="size-3.5" aria-hidden="true" /></button>}
        </div>
      </div>
      <div className="mt-auto pt-2">
        <p className="text-[10px] text-slate-400">{product.category?.name}</p>
        <h3 className="mt-1 line-clamp-2 min-h-9 text-xs font-medium leading-4 text-slate-700 sm:text-sm">{productHref ? <Link href={productHref} className="hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{title}</Link> : title}</h3>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500" aria-label={`${product.ratingsAverage ?? 0} out of 5 stars, ${product.ratingsQuantity ?? 0} reviews`}>
          <span className="flex text-amber-400" aria-hidden="true">{stars.map((star) => <Star key={star} className={`size-2.5 sm:size-3 ${star <= filledStars ? "fill-current" : "fill-none"}`} />)}</span><span>{product.ratingsAverage?.toFixed(1) ?? ""} ({product.ratingsQuantity ?? ""})</span>
        </div>
        <div className="mt-2 flex min-h-8 items-center justify-between gap-1">
          <p className="flex flex-wrap items-baseline gap-x-1 text-xs font-bold text-slate-800 sm:text-sm"><span className={discount ? "text-brand" : ""}>{currentPrice ?? ""}{currentPrice !== undefined ? " EGP" : ""}</span>{originalPrice !== undefined ? <del className="text-[9px] font-normal text-slate-400 sm:text-[10px]">{originalPrice} EGP</del> : null}</p>
          <AddToCartButton productId={product._id ?? ""} productTitle={title} disabled={!product._id} iconOnly className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark sm:size-8" />
        </div>
      </div>
    </article>
    </ScrollReveal>
  )
}
