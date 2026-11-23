import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { ROUTES } from "@/constants/routes"

export default function NotFound() {
  return <ScrollReveal as="main" id="main-content" className="flex min-h-[60vh] items-center bg-slate-50/60 py-16"><Container><div className="mx-auto max-w-lg rounded-2xl border border-slate-100 bg-white px-6 py-12 text-center shadow-sm"><SearchX className="mx-auto size-12 text-brand" aria-hidden="true" /><p className="mt-5 text-sm font-semibold uppercase tracking-widest text-brand">404</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1><p className="mt-2 text-sm text-slate-500">The page you are looking for is not available.</p><Link href={ROUTES.home} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><ArrowLeft className="size-4" aria-hidden="true" />Back to Home</Link></div></Container></ScrollReveal>
}
