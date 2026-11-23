"use client"

import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { ROUTES } from "@/constants/routes"

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ScrollReveal as="main" id="main-content" className="flex min-h-[60vh] items-center bg-slate-50/60 py-16"><Container><div className="mx-auto max-w-lg rounded-2xl border border-slate-100 bg-white px-6 py-12 text-center shadow-sm"><AlertTriangle className="mx-auto size-12 text-amber-500" aria-hidden="true" /><h1 className="mt-5 text-2xl font-bold text-slate-900">Something went wrong</h1><p className="mt-2 text-sm text-slate-500">We could not load this page. Please try again.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => reset()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><RefreshCw className="size-4" aria-hidden="true" />Try again</button><Link href={ROUTES.home} className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-5 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Back to Home</Link></div></div></Container></ScrollReveal>
}
