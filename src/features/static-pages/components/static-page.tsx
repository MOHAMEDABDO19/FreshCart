import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight, Mail } from "lucide-react"
import { Container } from "@/components/layout/container"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { homePageData } from "@/features/home/data/home-page.data"
import { PRODUCT_DETAILS_COPY, SUPPORT_EMAIL } from "@/constants/freshcart"
import { ROUTES } from "@/constants/routes"

export function StaticPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <><SiteHeader data={homePageData.header} /><main id="main-content" className="min-h-[55vh] py-8 sm:py-12"><Container>
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-slate-500"><Link href={ROUTES.home} className="hover:text-brand">Home</Link><ChevronRight className="size-4" aria-hidden="true" /><span aria-current="page" className="font-medium text-slate-800">{title}</span></nav>
    <ScrollReveal className="mx-auto max-w-3xl"><header className="border-b border-slate-100 pb-6"><h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></header><div className="prose prose-slate mt-7 max-w-none space-y-6 text-sm leading-7 text-slate-600">{children}</div></ScrollReveal>
  </Container></main><SiteFooter data={homePageData.footer} /></>
}

export function ContactPageContent() {
  const subject = encodeURIComponent("FreshCart support request")
  const body = encodeURIComponent("Hello FreshCart Support,\n\nHow can you help me?\n\n")
  return <StaticPage title="Contact" description="How can we help? Reach the FreshCart support team using the contact details below.">
    <section className="grid gap-4 sm:grid-cols-2" aria-label="Contact methods">
      <a aria-label={`Email FreshCart support at ${SUPPORT_EMAIL}`} href={`mailto:${SUPPORT_EMAIL}`} className="flex min-h-20 items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-brand/40 hover:bg-emerald-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><Mail className="size-5 shrink-0 text-brand" aria-hidden="true" /><span className="min-w-0 break-all"><span className="block font-semibold text-slate-900">Email</span><span className="text-sm">{SUPPORT_EMAIL}</span></span></a>
    </section>
    <a aria-label={`Email FreshCart support at ${SUPPORT_EMAIL}`} href={`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`} className="motion-button inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">Email support <ArrowRight className="size-4" aria-hidden="true" /></a>
  </StaticPage>
}

const faqItems = [
  { question: "How do I place an order?", answer: "Add products to your cart, continue to checkout, enter a shipping address, choose a payment method, and submit the order." },
  { question: "Which payment methods are available?", answer: "Checkout currently offers Cash on Delivery and online card payment through Stripe." },
  { question: "Can I manage saved addresses?", answer: "Sign in and open Account → Addresses to add or remove saved delivery addresses." },
  { question: "How does the wishlist work?", answer: "Sign in to add or remove products from your wishlist. Your wishlist is available from the header." },
  { question: "Where can I find return information?", answer: "The product information currently displays the design text “30 Days Return” and “Money back”. Detailed return conditions are not provided in this app." },
]

export function FaqPageContent() {
  return <StaticPage title="Frequently Asked Questions" description="Answers about the ordering and account features available in FreshCart.">
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-4 sm:px-6">{faqItems.map(({ question, answer }) => <details key={question} className="group py-4"><summary className="cursor-pointer list-none font-semibold text-slate-900 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{question}<span aria-hidden="true" className="float-right text-brand transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 pr-6 text-slate-600">{answer}</p></details>)}</div>
  </StaticPage>
}

export function ShippingReturnsPageContent() {
  return <StaticPage title="Shipping & Returns" description="The service information shown in the FreshCart product design.">
    <ul className="grid gap-4 sm:grid-cols-3">{PRODUCT_DETAILS_COPY.shippingTabDetails.map(({ title, description }) => <li key={title} className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1">{description}</p></li>)}</ul>
  </StaticPage>
}

export function LegalTemplatePage({ kind }: { kind: "privacy" | "terms" }) {
  const title = kind === "privacy" ? "Privacy Policy" : "Terms of Service"
  return <StaticPage title={title} description="A short sample template based on features currently present in this app.">
    <p role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 font-medium text-amber-900">Sample text, to be reviewed before launch.</p>
    {kind === "privacy" ? <><section><h2 className="font-semibold text-slate-900">Account and session</h2><p>The app uses account information needed to sign in and maintain a session. The session token is handled through an HttpOnly cookie by the app’s server routes.</p></section><section><h2 className="font-semibold text-slate-900">Local browser data</h2><p>The app stores limited client preferences in browser storage. No analytics or advertising tracking has been added by this app.</p></section></> : <><section><h2 className="font-semibold text-slate-900">Using the store</h2><p>You can browse products, manage a cart and wishlist, and submit orders using the checkout options displayed in the app.</p></section><section><h2 className="font-semibold text-slate-900">Payments and delivery</h2><p>Available payment methods and delivery information are shown during checkout and in the product details. These sample terms do not add policies or guarantees beyond what the app displays.</p></section></>}
  </StaticPage>
}
