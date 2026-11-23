"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Eye, LoaderCircle, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { ModalDialog } from "@/components/shared/modal-dialog"
import { CloseButton } from "@/components/shared/close-button"
import { WishlistToggleButton } from "@/features/wishlist/components/wishlist-toggle-button"
import { useAuthStore } from "@/store/auth-store"
import { useAddToCart } from "@/features/cart/hooks/use-cart"
import { getApiErrorMessage } from "@/lib/api-error"
import { loginRedirectPath, productPath } from "@/constants/routes"
import { formatMoney } from "@/features/cart/utils/format-money"
import type { Product, ProductProjection } from "@/features/products/schemas/product.schema"

export function QuickViewTrigger({ product }: { product: Product | ProductProjection }) {
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState(product.imageCover ?? "")
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState("")
  const triggerRef = useRef<HTMLButtonElement>(null)
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const mutation = useAddToCart()
  const router = useRouter()
  const pathname = usePathname()
  const stock = product.quantity ?? 0
  const currentPrice = product.priceAfterDiscount ?? product.price
  const images = Array.from(new Set([product.imageCover, ...(product.images ?? [])].filter((src): src is string => Boolean(src))))
  const inStock = stock > 0

  const addSelectedQuantity = async () => {
    if (!product._id || !authReady || mutation.isPending || !inStock) return
    if (!user) {
      router.push(loginRedirectPath(`${pathname}${window.location.search}`))
      return
    }
    setError("")
    try {
      for (let index = 0; index < quantity; index += 1) {
        await mutation.mutateAsync({ productId: product._id })
      }
      setOpen(false)
    } catch (cause) {
      setError(getApiErrorMessage(cause, "This product could not be added to your cart."))
    }
  }

  return <>
    <button ref={triggerRef} type="button" aria-label={`Quick view ${product.title ?? "product"}`} onClick={() => setOpen(true)} className="motion-button flex size-7 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-sm transition-transform hover:scale-105 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:size-8"><Eye className="size-3.5" aria-hidden="true" /></button>
    <ModalDialog open={open} onOpenChange={setOpen} titleId="quick-view-title" descriptionId="quick-view-description" returnFocusRef={triggerRef} className="max-w-[720px] p-0">
      <div className="grid max-h-[min(90dvh,760px)] overflow-y-auto sm:grid-cols-2">
        <div className="relative min-h-64 bg-slate-50 sm:min-h-[420px]">
          {image ? <Image src={image} alt={product.title ?? "Product"} fill sizes="(max-width: 640px) 92vw, 360px" className="object-contain p-5" /> : null}
          {images.length > 1 ? <div className="absolute inset-x-3 bottom-3 flex justify-center gap-2">{images.slice(0, 5).map((src, index) => <button key={`${src}-${index}`} type="button" aria-label={`Show product image ${index + 1}`} aria-pressed={image === src} onClick={() => setImage(src)} className={`relative size-12 overflow-hidden rounded-lg border bg-white ${image === src ? "border-brand ring-2 ring-brand/30" : "border-slate-200"}`}><Image src={src} alt="" fill sizes="48px" className="object-contain p-1" /></button>)}</div> : null}
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><p id="quick-view-description" className="text-xs text-slate-500">{product.category?.name ?? ""}{product.brand?.name ? ` · ${product.brand.name}` : ""}</p><h2 id="quick-view-title" className="mt-1 text-xl font-bold text-slate-900">{product.title}</h2></div><CloseButton className="size-9" onClick={() => setOpen(false)} /></div>
          <p className="flex items-center gap-2 text-sm text-slate-500"><span className="inline-flex items-center text-amber-400" aria-label={`${product.ratingsAverage ?? 0} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < Math.round(product.ratingsAverage ?? 0) ? "fill-current" : "fill-none"}`} aria-hidden="true" />)}</span>{product.ratingsAverage?.toFixed(1) ?? ""} ({product.ratingsQuantity ?? 0})</p>
          <p className="text-sm leading-6 text-slate-600 line-clamp-4">{product.description}</p>
          <p className="text-xl font-bold text-brand">{currentPrice === undefined ? "" : formatMoney(currentPrice)}{product.priceAfterDiscount !== undefined && product.price !== undefined ? <del className="ml-2 text-sm font-normal text-slate-400">{formatMoney(product.price)}</del> : null}</p>
          <p className={`text-sm font-medium ${inStock ? "text-emerald-700" : "text-red-600"}`}>{inStock ? `In Stock · ${stock} available` : "Out of stock"}</p>
          {inStock ? <div className="flex items-center gap-3"><span className="text-sm font-medium text-slate-700">Quantity</span><div className="inline-flex h-10 items-center rounded-lg border border-slate-200 p-1"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex size-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"><Minus className="size-4" /></button><span className="min-w-8 text-center text-sm">{quantity}</span><button type="button" aria-label="Increase quantity" disabled={quantity >= stock} onClick={() => setQuantity((value) => Math.min(stock, value + 1))} className="flex size-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"><Plus className="size-4" /></button></div></div> : null}
          {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap gap-2"><button type="button" disabled={!inStock || mutation.isPending || !authReady} onClick={() => void addSelectedQuantity()} className="motion-button inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">{mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}Add to Cart</button><WishlistToggleButton product={product} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand hover:text-brand" iconClassName="size-5" /></div>
          {product._id ? <Link href={productPath(product._id)} onClick={() => setOpen(false)} className="inline-flex min-h-10 items-center text-sm font-semibold text-brand hover:text-brand-dark">View full details <Plus className="ml-1 size-4" aria-hidden="true" /></Link> : null}
        </div>
      </div>
    </ModalDialog>
  </>
}
