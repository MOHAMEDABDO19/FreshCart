"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Camera, CreditCard, Mail, MapPin, Play, ShoppingCart, UsersRound } from "lucide-react"
import Link from "next/link"
import type { FooterData } from "@/features/home/types/home-page.types"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useAuthStore } from "@/store/auth-store"
import { categoryPath, ROUTES, loginRedirectPath } from "@/constants/routes"
import { SOCIAL_LINKS, STORE_LINKS } from "@/constants/links"
import { NavItem } from "@/components/shared/nav-item"
import { NewsletterEmailSchema } from "@/schemas/newsletter.schema"
import { FOOTER_NEWSLETTER_UNAVAILABLE } from "@/constants/footer"

const categoryLabels = new Set(["electronics", "men's fashion", "women's fashion"])
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "").trim()

export function SiteFooter({ data }: { data: FooterData }) {
  const categories = useCategories()
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterTouched, setNewsletterTouched] = useState(false)
  const [newsletterNotice, setNewsletterNotice] = useState("")
  const newsletterValidation = NewsletterEmailSchema.safeParse(newsletterEmail)
  const shopAndAccountColumns = data.columns.filter((column) => column.title === "Shop" || column.title === "Account")
  const supportColumn = data.columns.find((column) => column.title === "Support")
  const legalColumn = data.columns.find((column) => column.title === "Legal")

  const resolveHref = (label: string, fallback: string) => {
    if (categoryLabels.has(label.toLowerCase())) {
      const target = (categories.data?.data ?? []).find((category) =>
        normalize(category.name) === normalize(label) || normalize(category.slug) === normalize(label),
      )
      return target ? categoryPath(target._id) : ROUTES.products
    }
    if (label === "Wishlist") return authReady && user ? ROUTES.wishlist : loginRedirectPath(ROUTES.wishlist)
    if (label === "Shopping Cart") return authReady && user ? ROUTES.cart : loginRedirectPath(ROUTES.cart)
    if (label === "My Account") return authReady && user ? ROUTES.accountProfile : loginRedirectPath(ROUTES.accountProfile)
    if (label === "Addresses") return authReady && user ? ROUTES.accountAddresses : loginRedirectPath(ROUTES.accountAddresses)
    if (label === "Settings") return authReady && user ? ROUTES.accountSettings : loginRedirectPath(ROUTES.accountSettings)
    if (label === "Order History") return authReady && user ? ROUTES.orders : loginRedirectPath(ROUTES.orders)
    if (label === "Checkout") return authReady && user ? ROUTES.checkout : loginRedirectPath(ROUTES.checkout)
    if (label === "Sign In") return user ? ROUTES.accountProfile : ROUTES.login
    if (label === "Create Account") return user ? null : ROUTES.register
    return fallback || null
  }

  return (
    <footer id="footer" className="bg-slate-900 text-white">
      <Container className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))] lg:gap-7 lg:py-14">
        <ScrollReveal className="col-span-2 md:col-span-1">
          <div>
            <Link href={ROUTES.home} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xl font-bold tracking-tight text-slate-800" aria-label="FreshCart home"><ShoppingCart className="size-5 text-brand" aria-hidden="true" />FreshCart</Link>
            <p className="mt-4 max-w-sm text-[13px] leading-5 text-slate-400">{data.description}</p>
            <ul className="mt-4 space-y-1.5 text-[13px] text-slate-400">
              <li><a aria-label={`Email FreshCart support at ${data.email}`} className="inline-flex min-h-8 items-center gap-2 break-all transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" href={`mailto:${data.email}`}><Mail className="size-3.5 shrink-0 text-brand" aria-hidden="true" />{data.email}</a></li>
              <li className="inline-flex items-center gap-2"><MapPin className="size-3.5 shrink-0 text-brand" aria-hidden="true" />{data.address}</li>
            </ul>
            <nav className="mt-4 flex gap-2" aria-label="Social links">
              {([
                ["facebook", UsersRound, "FreshCart on Facebook"],
                ["instagram", Camera, "FreshCart on Instagram"],
                ["youtube", Play, "FreshCart on YouTube"],
              ] as const).map(([key, Icon, label]) => {
                const url = SOCIAL_LINKS[key]
                if (!/^https:\/\//i.test(url)) return null
                return <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex size-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><Icon className="size-4" aria-hidden="true" /></a>
              })}
            </nav>
            <div className="mt-4 grid max-w-[340px] grid-cols-2 gap-2" aria-label="Download the FreshCart app">
              <a href={STORE_LINKS.appStore} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" className="flex min-h-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-2 text-center text-[11px] font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">App Store</a>
              <a href={STORE_LINKS.googlePlay} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" className="flex min-h-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-2 text-center text-[11px] font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Google Play</a>
            </div>
          </div>
        </ScrollReveal>
        {shopAndAccountColumns.map((column) => (
          <ScrollReveal key={column.title}>
            <nav aria-label={column.title}>
              <h2 className="mb-3 text-sm font-semibold">{column.title}</h2>
              <ul className="space-y-1">
                {column.links.map((link) => {
                  const href = resolveHref(link.label, link.href)
                  const isEmail = href?.startsWith("mailto:") ?? false
                  return <li key={link.label}>
                    {href && isEmail ? <a href={href} className="inline-flex min-h-8 items-center text-xs text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{link.label}</a>
                      : <NavItem href={href}>{link.label}</NavItem>}
                  </li>
                })}
              </ul>
            </nav>
          </ScrollReveal>
        ))}
        <ScrollReveal>
          <nav aria-label="Support and legal">
            {supportColumn ? <><h2 className="mb-3 text-sm font-semibold">{supportColumn.title}</h2><ul className="space-y-1">{supportColumn.links.map((link) => { const href = resolveHref(link.label, link.href); return <li key={link.label}>{href?.startsWith("mailto:") ? <a href={href} className="inline-flex min-h-8 items-center text-xs text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{link.label}</a> : <NavItem href={href}>{link.label}</NavItem>}</li> })}</ul></> : null}
            {legalColumn ? <><h2 className="mb-2 mt-5 text-sm font-semibold">{legalColumn.title}</h2><ul className="space-y-1">{legalColumn.links.map((link) => <li key={link.label}><NavItem href={resolveHref(link.label, link.href)}>{link.label}</NavItem></li>)}</ul></> : null}
          </nav>
        </ScrollReveal>
        <ScrollReveal className="col-span-2 md:col-span-1">
          <section aria-labelledby="footer-newsletter-title">
            <h2 id="footer-newsletter-title" className="text-sm font-semibold">Newsletter</h2>
            <p className="mt-2 text-xs leading-5 text-slate-400">Get updates from FreshCart. Subscription is not connected yet.</p>
            <form className="mt-3 space-y-2" noValidate onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setNewsletterTouched(true); if (newsletterValidation.success) setNewsletterNotice(FOOTER_NEWSLETTER_UNAVAILABLE) }}>
              <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
              <input id="footer-newsletter-email" type="email" value={newsletterEmail} onChange={(event) => { setNewsletterEmail(event.target.value); setNewsletterNotice("") }} onBlur={() => setNewsletterTouched(true)} maxLength={254} autoComplete="email" placeholder="you@example.com" aria-invalid={newsletterTouched && !newsletterValidation.success} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs text-white outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-brand aria-[invalid=true]:border-red-400" />
              <button type="submit" disabled={!newsletterValidation.success} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">Subscribe <ArrowRight className="size-3.5" aria-hidden="true" /></button>
            </form>
            {newsletterNotice ? <p role="status" className="mt-2 text-xs text-slate-400">{newsletterNotice}</p> : newsletterTouched && !newsletterValidation.success ? <p role="status" className="mt-2 text-xs text-red-300">Enter a valid email address.</p> : <p className="mt-2 text-[10px] text-slate-500">No email is sent or saved.</p>}
          </section>
        </ScrollReveal>
      </Container>
      <div className="border-t border-slate-800">
        <Container className="flex flex-col items-start justify-between gap-3 py-4 text-[11px] text-slate-500 sm:flex-row sm:items-center">
          <p>{data.copyright.replace(/(©\s*)\d{4}/, `$1${new Date().getFullYear()}`)}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><ul className="flex gap-3">{data.paymentMethods.map((method) => <li key={method} className="inline-flex items-center gap-1"><CreditCard className="size-3.5" aria-hidden="true" />{method}</li>)}</ul><nav aria-label="Legal links" className="flex flex-wrap gap-x-4 gap-y-1"><Link href={ROUTES.privacy} className="transition hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Privacy</Link><Link href={ROUTES.terms} className="transition hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Terms</Link></nav></div>
        </Container>
      </div>
    </footer>
  )
}
