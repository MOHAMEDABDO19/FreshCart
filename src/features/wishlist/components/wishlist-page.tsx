"use client"

import Link from "next/link"
import { Heart, Home, Trash2 } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/protected-route"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { Container } from "@/components/layout/container"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ServiceBenefits } from "@/features/home/components/service-benefits"
import { homePageData } from "@/features/home/data/home-page.data"
import { ProductCard } from "@/features/home/components/featured-products"
import { getRevealDelay } from "@/constants/motion"
import { getApiErrorMessage } from "@/lib/api-error"
import { useRemoveFromWishlist, useWishlist } from "@/features/wishlist/hooks/use-wishlist"
import { productPath, ROUTES } from "@/constants/routes"

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5" role="status" aria-label="Loading wishlist">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-white p-3">
          <span className="loading-skeleton block aspect-square rounded-md" aria-hidden="true" />
          <span className="loading-skeleton mt-4 block h-4 w-2/3 rounded" aria-hidden="true" />
          <span className="loading-skeleton mt-2 block h-4 w-1/2 rounded" aria-hidden="true" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}

function WishlistContent() {
  const query = useWishlist()
  const removeMutation = useRemoveFromWishlist()
  const products = query.data?.data ?? []
  const count = query.data?.count && query.data.count > 0 ? query.data.count : products.length

  return (
    <>
      <Container>
        <div className="pt-7 text-sm text-slate-500">
          <Link href={ROUTES.home} className="hover:text-brand">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">Wishlist</span>
        </div>
        <ScrollReveal className="py-5 sm:py-7">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-white shadow-sm"><Heart className="size-6 fill-current" aria-hidden="true" /></span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Wishlist</h1>
              <p className="mt-1 text-sm text-slate-500">{query.isSuccess ? `${count} saved ${count === 1 ? "item" : "items"}` : "Your saved products"}</p>
            </div>
          </div>
        </ScrollReveal>

        {query.isPending ? <WishlistSkeleton /> : null}

        {query.isError ? (
          <div className="my-8 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center text-sm text-red-700" role="alert">
            {getApiErrorMessage(query.error, "Your wishlist could not be loaded.")}
            <button type="button" onClick={() => void query.refetch()} className="ml-2 font-semibold underline underline-offset-2">Try again</button>
          </div>
        ) : null}

        {!query.isPending && query.isSuccess && products.length === 0 ? (
          <ScrollReveal className="my-6 rounded-2xl border border-slate-100 bg-white px-5 py-16 text-center shadow-sm">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-brand"><Heart className="size-8" aria-hidden="true" /></span>
            <h2 className="mt-5 text-xl font-semibold text-slate-800">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-slate-500">Save products you like and find them here later.</p>
            <Link href={ROUTES.products} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><Home className="size-4" aria-hidden="true" />Continue shopping</Link>
          </ScrollReveal>
        ) : null}

        {query.isSuccess && products.length > 0 ? (
          <>
            {removeMutation.isError ? <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{getApiErrorMessage(removeMutation.error, "The product could not be removed.")}</p> : null}
            <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {products.map((product, index) => (
                <div key={product._id} className="flex min-w-0 flex-col">
                  <ProductCard product={product} delayMs={getRevealDelay(index)} productHref={productPath(product._id)} />
                  <button
                    type="button"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate({ productId: product._id })}
                    aria-label={`Remove ${product.title} from wishlist`}
                    className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Container>
      <ServiceBenefits items={homePageData.bottomBenefits} variant="strip" />
    </>
  )
}

export function WishlistPage() {
  return (
    <>
      <SiteHeader data={homePageData.header} />
      <main id="main-content" className="min-h-[55vh] bg-slate-50/60 py-1">
        <ProtectedRoute><WishlistContent /></ProtectedRoute>
      </main>
      <SiteFooter data={homePageData.footer} />
    </>
  )
}
