"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { Container } from "@/components/layout/container"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ProtectedRoute } from "@/components/shared/protected-route"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { homePageData } from "@/features/home/data/home-page.data"
import { useUserOrders } from "@/features/orders/hooks/use-orders"
import { formatMoney } from "@/features/cart/utils/format-money"
import { getApiErrorMessage } from "@/lib/api-error"
import { ROUTES } from "@/constants/routes"
import { CalendarDays, ChevronDown, MapPin, PackageCheck, RefreshCw, Wallet } from "lucide-react"

function OrdersContent() {
  const userId = useAuthStore((state) => state.userId)
  const ordersQuery = useUserOrders(userId)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const orders = ordersQuery.data ?? []

  return <main id="main-content" className="min-h-[55vh] bg-slate-50/60 py-6 sm:py-9"><Container>
    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-slate-500"><Link href={ROUTES.home} className="transition hover:text-brand">Home</Link><span aria-hidden="true">/</span><span aria-current="page" className="font-medium text-slate-800">My Orders</span></nav>
    <ScrollReveal className="mb-7 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
      <div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-emerald-700/15"><PackageCheck className="size-6" aria-hidden="true" /></span><div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Orders</h1><p className="mt-1 text-sm text-slate-500">Track and manage your {ordersQuery.isSuccess ? orders.length : ""} {orders.length === 1 ? "order" : "orders"}</p></div></div>
      <Link href={ROUTES.products} className="min-h-11 content-center rounded-lg px-3 text-sm font-medium text-brand transition hover:bg-emerald-50">Continue Shopping</Link>
    </ScrollReveal>
    {ordersQuery.isPending ? <div role="status" aria-label="Loading orders" className="space-y-4">{[0,1,2].map((item) => <div key={item} className="loading-skeleton h-40 rounded-2xl" />)}</div> : null}
    {ordersQuery.isError ? <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{getApiErrorMessage(ordersQuery.error, "Your orders could not be loaded. The response did not match the documented order fields.")}<button type="button" onClick={() => void ordersQuery.refetch()} className="ml-2 inline-flex items-center gap-1 font-semibold underline"><RefreshCw className="size-3" aria-hidden="true" />Try again</button></div> : null}
    {ordersQuery.isSuccess && orders.length === 0 ? <ScrollReveal className="rounded-2xl border border-slate-100 bg-white px-5 py-12 text-center shadow-sm"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-brand"><PackageCheck className="size-7" aria-hidden="true" /></span><h2 className="mt-4 text-lg font-semibold text-slate-900">No orders yet</h2><p className="mt-1 text-sm text-slate-500">Your orders will appear here after checkout.</p><Link href={ROUTES.products} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark">Start Shopping</Link></ScrollReveal> : null}
    <div className="space-y-4">{orders.map((order, index) => {
      const expanded = expandedId === order._id
      const itemCount = order.cartItems.reduce((total, line) => total + line.count, 0)
      const status = order.isDelivered ? "Delivered" : "Processing"
      const postalCode = order.shippingAddress.postalCode || ""
      const firstItem = order.cartItems[0]
      return <ScrollReveal key={order._id} delayMs={Math.min(index, 7) * 65}>
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
          <div className="flex items-start gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white sm:size-24">{firstItem ? <Image src={firstItem.product.imageCover} alt={firstItem.product.title} fill sizes="96px" className="object-contain p-2" /> : null}</div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${order.isDelivered ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><span className={`size-1.5 rounded-full ${order.isDelivered ? "bg-emerald-500" : "bg-amber-500"}`} />{status}</span><span className="text-xs text-slate-400">{order.isPaid ? "Paid" : "Payment due"}</span></div>
              <h2 className="truncate text-base font-bold text-slate-900">Order #{order._id}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-slate-400" aria-hidden="true" />{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span><span>{itemCount} {itemCount === 1 ? "item" : "items"}</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-slate-400" aria-hidden="true" />{order.shippingAddress.city}</span></div>
              <p className="mt-3 text-lg font-bold text-slate-900">{formatMoney(order.totalOrderPrice)}</p>
            </div>
            <span className="hidden size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 sm:flex" aria-label={`Payment: ${order.paymentMethodType}`} title={order.paymentMethodType}><Wallet className="size-4" aria-hidden="true" /></span>
          </div>
          <div className="mt-4 flex justify-end border-t border-slate-100 pt-3"><button type="button" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : order._id)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Details<ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" /></button></div>
          {expanded ? <div className="mt-3 space-y-3 border-t border-slate-100 pt-4">
            <ul className="space-y-3">{order.cartItems.map((line) => <li key={line._id ?? line.product._id} className="flex items-center gap-3"><span className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white"> <Image src={line.product.imageCover} alt={line.product.title} fill sizes="48px" className="object-contain p-1" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{line.product.title}</span><span className="text-xs text-slate-500">{line.count} × {formatMoney(line.price)}</span></span><span className="text-sm font-semibold text-slate-800">{formatMoney(line.count * line.price)}</span></li>)}</ul>
            <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">Payment method: </span><span className="font-medium capitalize text-slate-800">{order.paymentMethodType}</span></p><p><span className="text-slate-500">Delivery address: </span><span className="font-medium text-slate-800">{order.shippingAddress.details}, {order.shippingAddress.city}{postalCode ? `, ${postalCode}` : ""}</span></p></div>
          </div> : null}
        </article>
      </ScrollReveal>
    })}</div>
  </Container></main>
}

export function OrdersPage() {
  return <><SiteHeader data={homePageData.header} /><ProtectedRoute><OrdersContent /></ProtectedRoute><SiteFooter data={homePageData.footer} /></>
}
