"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"
import { ArrowLeft, Banknote, Building2, Check, CheckCircle2, CreditCard, LoaderCircle, MapPin, Phone, ShieldCheck, Truck } from "lucide-react"
import { Container } from "@/components/layout/container"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ProtectedRoute } from "@/components/shared/protected-route"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { homePageData } from "@/features/home/data/home-page.data"
import { useCart } from "@/features/cart/hooks/use-cart"
import { formatMoney } from "@/features/cart/utils/format-money"
import { ShippingAddressSchema, type ShippingAddressInput } from "@/features/checkout/schemas/checkout.schema"
import { usePlaceCashOrder } from "@/features/checkout/hooks/use-place-cash-order"
import { useCreateStripeCheckout } from "@/features/checkout/hooks/use-create-stripe-checkout"
import { useAddresses } from "@/features/addresses/hooks/use-addresses"
import { getApiErrorMessage } from "@/lib/api-error"
import { ROUTES } from "@/constants/routes"

function CheckoutField({
  id,
  label,
  registration,
  error,
  placeholder,
  autoComplete,
}: {
  id: keyof ShippingAddressInput
  label: string
  registration: UseFormRegisterReturn
  error?: string
  placeholder: string
  autoComplete?: string
}) {
  const FieldIcon = id === "details" || id === "postalCode" ? MapPin : id === "phone" ? Phone : Building2
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <FieldIcon className={id === "details" ? "pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400" : "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"} aria-hidden="true" />
        {id === "details" ? (
          <textarea id={id} rows={3} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...registration} className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand/60 focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-red-400" />
        ) : (
          <input id={id} type={id === "phone" ? "tel" : "text"} inputMode={id === "phone" ? "tel" : undefined} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...registration} className="h-12 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand/60 focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-red-400" />
        )}
      </div>
      {error ? <p id={`${id}-error`} className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

function CheckoutContent() {
  const cartQuery = useCart()
  const orderMutation = usePlaceCashOrder()
  const stripeMutation = useCreateStripeCheckout()
  const addressesQuery = useAddresses()
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash")
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const form = useForm<ShippingAddressInput>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: { details: "", phone: "", city: "", postalCode: "" },
    shouldFocusError: true,
  })
  const cart = cartQuery.data

  const submit = form.handleSubmit(async (shippingAddress) => {
    if (!cart?.cartId) return
    setOrderPlaced(false)
    try {
      if (paymentMethod === "online") {
        const session = await stripeMutation.mutateAsync({ cartId: cart.cartId, shippingAddress })
        window.location.assign(session.session.url)
      } else {
        await orderMutation.mutateAsync({ cartId: cart.cartId, shippingAddress })
        setOrderPlaced(true)
      }
    } catch {
      setOrderPlaced(false)
    }
  })

  return (
    <main id="main-content" className="min-h-[55vh] bg-slate-50/70 py-6 sm:py-9">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-slate-500"><Link href={ROUTES.home} className="hover:text-brand">Home</Link><span aria-hidden="true">/</span><Link href={ROUTES.cart} className="hover:text-brand">Shopping Cart</Link><span aria-hidden="true">/</span><span aria-current="page" className="font-medium text-slate-800">Checkout</span></nav>
        <ScrollReveal className="mb-6 flex items-center gap-3 sm:mb-8"><span className="flex size-12 items-center justify-center rounded-xl bg-brand text-white shadow-sm"><CreditCard className="size-6" aria-hidden="true" /></span><div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Checkout</h1><p className="mt-1 text-sm text-slate-500">Enter your shipping address and place a cash order.</p></div></ScrollReveal>

        {cartQuery.isPending ? <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12" aria-label="Loading checkout" role="status"><div className="loading-skeleton h-[420px] min-w-0 rounded-2xl lg:col-span-8" /><div className="loading-skeleton h-64 min-w-0 rounded-2xl lg:col-span-4" /></div> : null}
        {cartQuery.isError ? <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700" role="alert">{getApiErrorMessage(cartQuery.error, "Your cart could not be loaded.")} <button type="button" onClick={() => void cartQuery.refetch()} className="ml-1 font-semibold underline">Try again</button></div> : null}
        {cartQuery.isSuccess && (!cart || cart.data.products.length === 0) && !orderPlaced ? <ScrollReveal className="rounded-2xl border border-slate-100 bg-white px-5 py-12 text-center shadow-sm"><p className="text-lg font-semibold text-slate-800">Your cart is empty</p><p className="mt-2 text-sm text-slate-500">Add products before proceeding to checkout.</p><Link href={ROUTES.products} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-dark">Continue shopping</Link></ScrollReveal> : null}

        {orderPlaced ? <ScrollReveal className="mx-auto max-w-xl rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-brand"><CheckCircle2 className="size-9" aria-hidden="true" /></span><h2 className="mt-4 text-2xl font-bold text-slate-900">Order placed</h2><p className="mt-2 text-sm text-slate-500">Your cash order was submitted successfully.</p><Link href={ROUTES.products} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 font-semibold text-white transition hover:bg-brand-dark">Continue shopping</Link></ScrollReveal> : null}

        {cartQuery.isSuccess && cart && cart.data.products.length > 0 && !orderPlaced ? <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-7">
          <ScrollReveal className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-8">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-brand"><MapPin className="size-5" aria-hidden="true" /></span><div><h2 className="font-semibold text-slate-900">Shipping address</h2><p className="text-xs text-slate-500">Where should we deliver your order?</p></div></div>
            <form onSubmit={submit} noValidate className="space-y-4">
              {addressesQuery.isPending ? <div className="space-y-3" role="status" aria-label="Loading saved addresses"><span className="loading-skeleton block h-5 w-36 rounded" /><span className="loading-skeleton block h-20 rounded-xl" /></div> : null}
              {addressesQuery.isError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Saved addresses could not be loaded. You can still enter a new address. <button type="button" onClick={() => void addressesQuery.refetch()} className="font-semibold underline">Try again</button></div> : null}
              {addressesQuery.isSuccess && addressesQuery.data.data.length > 0 ? <section aria-labelledby="saved-addresses-title" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 id="saved-addresses-title" className="text-sm font-semibold text-slate-800">Saved addresses</h3><Link href={ROUTES.accountAddresses} className="text-xs font-semibold text-brand hover:text-brand-dark">Manage addresses</Link></div>
                <div className="space-y-2" role="radiogroup" aria-labelledby="saved-addresses-title">
                  {addressesQuery.data.data.map((address) => <button key={address._id} type="button" role="radio" aria-checked={selectedAddressId === address._id} onClick={() => {
                    setSelectedAddressId(address._id)
                    form.setValue("details", address.details, { shouldDirty: true, shouldValidate: true })
                    form.setValue("phone", address.phone, { shouldDirty: true, shouldValidate: true })
                    form.setValue("city", address.city, { shouldDirty: true, shouldValidate: true })
                  }} className={`flex min-h-[76px] w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition sm:p-4 ${selectedAddressId === address._id ? "border-brand bg-emerald-50/80" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
                    <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${selectedAddressId === address._id ? "border-[6px] border-brand bg-white" : "border-2 border-slate-300"}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{address.name}</span><span className="mt-1 block text-sm text-slate-600">{address.details}</span><span className="mt-1 block text-xs text-slate-500">{address.phone} · {address.city}</span></span>
                  </button>)}
                  <button type="button" role="radio" aria-checked={selectedAddressId === "new"} onClick={() => {
                    setSelectedAddressId("new")
                    form.setValue("details", "", { shouldDirty: true, shouldValidate: true })
                    form.setValue("phone", "", { shouldDirty: true, shouldValidate: true })
                    form.setValue("city", "", { shouldDirty: true, shouldValidate: true })
                  }} className={`flex min-h-[60px] w-full items-center gap-3 rounded-xl border-2 border-dashed p-3 text-left transition sm:p-4 ${selectedAddressId === "new" ? "border-brand bg-emerald-50/80" : "border-slate-300 bg-white hover:border-emerald-300"}`}>
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${selectedAddressId === "new" ? "border-[6px] border-brand bg-white" : "border-2 border-slate-300"}`} aria-hidden="true" /><span className="text-sm font-semibold text-slate-800">Use a new address</span>
                  </button>
                </div>
              </section> : null}
              <CheckoutField id="details" label="Address details" registration={form.register("details")} error={form.formState.errors.details?.message} placeholder="Test address" autoComplete="street-address" />
              <div className="grid gap-4 sm:grid-cols-2">
                <CheckoutField id="phone" label="Phone number" registration={form.register("phone")} error={form.formState.errors.phone?.message} placeholder="Enter your phone number" autoComplete="tel" />
                <CheckoutField id="city" label="City" registration={form.register("city")} error={form.formState.errors.city?.message} placeholder="Cairo" autoComplete="address-level2" />
              </div>
              <CheckoutField id="postalCode" label="Postal code" registration={form.register("postalCode")} error={form.formState.errors.postalCode?.message} placeholder="12345" autoComplete="postal-code" />
              <section aria-labelledby="payment-method-title" className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="bg-gradient-to-r from-brand to-emerald-700 px-4 py-3 text-white sm:px-5">
                  <h3 id="payment-method-title" className="flex items-center gap-2 font-semibold"><CreditCard className="size-4" aria-hidden="true" />Payment method</h3>
                  <p className="mt-1 text-xs text-white/85">Choose how you&apos;d like to pay</p>
                </div>
                <div className="space-y-3 p-3 sm:p-4" role="radiogroup" aria-label="Choose a payment method">
                  <button type="button" role="radio" aria-checked={paymentMethod === "cash"} disabled={orderMutation.isPending || stripeMutation.isPending} onClick={() => { setPaymentMethod("cash"); stripeMutation.reset() }} className={`flex min-h-[76px] w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition sm:p-4 ${paymentMethod === "cash" ? "border-brand bg-emerald-50/80" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm"><Banknote className="size-5" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-emerald-900">Cash on Delivery</span><span className="mt-1 block text-xs text-slate-500">Pay when your order arrives at your doorstep</span></span>
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${paymentMethod === "cash" ? "bg-brand text-white" : "border border-slate-300 text-transparent"}`}><Check className="size-4" aria-hidden="true" /></span>
                  </button>
                  <button type="button" role="radio" aria-checked={paymentMethod === "online"} disabled={orderMutation.isPending || stripeMutation.isPending} onClick={() => { setPaymentMethod("online"); orderMutation.reset() }} className={`flex min-h-[76px] w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition sm:p-4 ${paymentMethod === "online" ? "border-brand bg-emerald-50/80" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${paymentMethod === "online" ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}><CreditCard className="size-5" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">Pay Online</span><span className="mt-1 block text-xs text-slate-500">Secure payment by credit or debit card via Stripe</span><span className="mt-2 flex items-center gap-1.5" aria-label="Accepted cards"><span className="rounded bg-blue-700 px-1.5 py-0.5 text-[9px] font-bold text-white">VISA</span><span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-white">MC</span><span className="rounded bg-sky-700 px-1.5 py-0.5 text-[9px] font-bold text-white">AMEX</span></span></span>
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${paymentMethod === "online" ? "bg-brand text-white" : "border border-slate-300 text-transparent"}`}><Check className="size-4" aria-hidden="true" /></span>
                  </button>
                  <p className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-800"><ShieldCheck className="size-4 shrink-0 text-brand" aria-hidden="true" />{paymentMethod === "online" ? "You’ll continue to Stripe’s secure payment page." : "Pay securely when your order is delivered."}</p>
                </div>
              </section>
              {orderMutation.isError || stripeMutation.isError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{orderMutation.isError ? getApiErrorMessage(orderMutation.error, "Your order could not be placed. Please try again.") : getApiErrorMessage(stripeMutation.error, "Online checkout could not be started. Please try again.")}</p> : null}
              <button type="submit" disabled={orderMutation.isPending || stripeMutation.isPending || !cart.cartId} className="motion-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{orderMutation.isPending || stripeMutation.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}{orderMutation.isPending || stripeMutation.isPending ? (paymentMethod === "online" ? "Connecting to Stripe…" : "Placing order…") : (paymentMethod === "online" ? "Continue to Payment" : "Place Cash Order")}</button>
            </form>
          </ScrollReveal>

          <ScrollReveal className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm lg:sticky lg:top-20 lg:col-span-4">
            <div className="rounded-t-2xl bg-gradient-to-r from-brand to-emerald-700 px-5 py-4 text-white"><h2 className="flex items-center gap-2 text-lg font-bold"><Truck className="size-5" aria-hidden="true" />Order summary</h2><p className="mt-1 text-xs text-white/80">{cart.numOfCartItems} {cart.numOfCartItems === 1 ? "item" : "items"}</p></div>
            <div className="space-y-4 p-5">
              <ul className="max-h-64 space-y-3 overflow-y-auto">{cart.data.products.map((line) => <li key={line._id} className="flex justify-between gap-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium text-slate-700">{line.product.title}</span><span className="text-xs text-slate-400">Qty {line.count}</span></span><span className="shrink-0 font-medium text-slate-700">{formatMoney(line.price * line.count)}</span></li>)}</ul>
              <div className="flex justify-between border-t border-slate-100 pt-4 text-base font-bold text-slate-900"><span>Total</span><span>{formatMoney(cart.data.totalCartPrice)}</span></div>
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800"><ShieldCheck className="size-4 shrink-0 text-brand" aria-hidden="true" />{paymentMethod === "online" ? "Secure online payment via Stripe" : "Cash payment on delivery"}</p>
              <Link href={ROUTES.cart} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"><ArrowLeft className="size-4" aria-hidden="true" />Back to cart</Link>
            </div>
          </ScrollReveal>
        </div> : null}
      </Container>
    </main>
  )
}

export function CheckoutPage() {
  return <><SiteHeader data={homePageData.header} /><ProtectedRoute><CheckoutContent /></ProtectedRoute><SiteFooter data={homePageData.footer} /></>
}
