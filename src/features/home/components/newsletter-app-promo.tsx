"use client"

import { useState, type FormEvent } from "react"
import { Apple, ArrowRight, Leaf, Mail, Play, Sparkles, Star, Tag, Truck } from "lucide-react"
import type { NewsletterData } from "@/features/home/types/home-page.types"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { NewsletterEmailSchema } from "@/schemas/newsletter.schema"
import { FOOTER_NEWSLETTER_UNAVAILABLE } from "@/constants/footer"
import { STORE_LINKS } from "@/constants/links"

const perkIcons = [Leaf, Truck, Tag]

export function NewsletterAppPromo({ data }: { data: NewsletterData }) {
  const [email, setEmail] = useState("")
  const [touched, setTouched] = useState(false)
  const [notice, setNotice] = useState("")
  const validation = NewsletterEmailSchema.safeParse(email)
  const emailError = !validation.success
    ? validation.error.issues[0]?.message ?? "Enter a valid email address"
    : ""

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(true)
    if (!NewsletterEmailSchema.safeParse(email).success) return
    setNotice(FOOTER_NEWSLETTER_UNAVAILABLE)
  }

  return (
    <section aria-label="Newsletter and mobile app" className="bg-slate-50 py-10 md:py-14 lg:py-16">
      <Container>
      <ScrollReveal className="grid gap-6 rounded-[28px] border border-emerald-100 bg-[linear-gradient(120deg,#f8fafc_0%,#fff_55%,#fff4f4_100%)] p-4 shadow-sm sm:gap-7 sm:p-6 lg:grid-cols-[1.55fr_0.85fr] lg:gap-8 lg:p-8">
        <div className="min-w-0 border-b border-emerald-100 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20"><Mail className="size-5" aria-hidden="true" /></span>
            <span><strong className="block text-xs font-semibold uppercase tracking-wide text-brand">Newsletter</strong><span className="text-xs text-slate-500">{data.subscriberCount}</span></span>
          </div>
          <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[27px]">{data.title.split("Delivered")[0]}<span className="text-brand">Delivered</span> {data.title.split("Delivered")[1]}</h2>
          <p className="mt-2 text-sm text-slate-500">{data.description}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {data.benefits.map((benefit, index) => {
              const Icon = perkIcons[index % perkIcons.length]
              return <li key={benefit} className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-sm"><Icon className="size-3.5 text-brand" aria-hidden="true" />{benefit}</li>
            })}
          </ul>
          <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={submitNewsletter} noValidate>
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setNotice("") }} onBlur={() => setTouched(true)} maxLength={254} autoComplete="email" inputMode="email" aria-invalid={touched && Boolean(emailError)} aria-describedby={touched && emailError ? "newsletter-email-hint" : undefined} placeholder="you@example.com" className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand/30 aria-[invalid=true]:border-red-400" />
            <button type="submit" disabled={!validation.success} aria-disabled={!validation.success} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition ${validation.success ? "bg-brand shadow-md shadow-brand/20 hover:bg-brand-dark" : "cursor-not-allowed bg-slate-300"}`}>Subscribe <ArrowRight className="size-4" aria-hidden="true" /></button>
          </form>
          {touched && emailError ? <p id="newsletter-email-hint" className="mt-2 text-xs text-red-600" role="status">{emailError}</p> : null}
          {notice ? <p className="mt-2 text-xs text-slate-500" role="status">{notice}</p> : <p className="mt-2 inline-flex items-center gap-1 text-[10px] text-slate-400"><Sparkles className="size-3 text-amber-400" aria-hidden="true" />No email is sent or saved.</p>}
        </div>

        <aside className="flex min-h-[250px] flex-col justify-center rounded-[24px] bg-[radial-gradient(circle_at_85%_18%,rgba(0,177,111,.22),transparent_32%),linear-gradient(135deg,#111827,#1e293b)] p-5 text-white sm:min-h-[270px] sm:p-7">
          <span className="inline-flex w-fit rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">Mobile App</span>
          <h3 className="mt-4 text-xl font-bold">{data.mobileTitle}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-300">{data.mobileDescription}</p>
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <a href={STORE_LINKS.appStore} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" title="Temporary link to the App Store home page" className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><Apple className="size-5 shrink-0" aria-hidden="true" /><span><small className="block text-[9px] uppercase tracking-wide text-slate-400">Download on the</small><strong>App Store</strong></span></a>
            <a href={STORE_LINKS.googlePlay} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" title="Temporary link to Google Play home page" className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><Play className="size-5 shrink-0" aria-hidden="true" /><span><small className="block text-[9px] uppercase tracking-wide text-slate-400">Get it on</small><strong>Google Play</strong></span></a>
          </div>
          <div className="mt-4 flex items-center gap-0.5 text-xs text-slate-400"><span className="inline-flex text-amber-400" aria-label="5 stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-3 fill-current" />)}</span><span className="ml-1.5">{data.appDownloads}</span></div>
        </aside>
      </ScrollReveal>
      </Container>
    </section>
  )
}
