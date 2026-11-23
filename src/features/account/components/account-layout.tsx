"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, UserRound } from "lucide-react"
import type { ReactNode } from "react"
import { Container } from "@/components/layout/container"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { ProtectedRoute } from "@/components/shared/protected-route"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { homePageData } from "@/features/home/data/home-page.data"
import { useAuthStore } from "@/store/auth-store"
import { ROUTES } from "@/constants/routes"

const accountNavigation = [
  { label: "Profile", href: ROUTES.accountProfile },
  { label: "Wishlist", href: ROUTES.wishlist },
  { label: "Addresses", href: ROUTES.accountAddresses },
  { label: "Settings", href: ROUTES.accountSettings },
] as const

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

export function AccountLayout({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  return (
    <>
      <SiteHeader data={homePageData.header} />
      <main id="main-content" className="min-h-[55vh] bg-slate-50/60 py-6 sm:py-8">
        <ProtectedRoute>
          <Container>
            <ScrollReveal className="mb-6 sm:mb-8">
              <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Link href={ROUTES.home} className="transition hover:text-brand">Home</Link>
                <ChevronRight className="size-4" aria-hidden="true" />
                <Link href={ROUTES.accountProfile} className="transition hover:text-brand">Account</Link>
                <ChevronRight className="size-4" aria-hidden="true" />
                <span className="font-medium text-slate-800" aria-current="page">{title}</span>
              </nav>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            </ScrollReveal>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
              <ScrollReveal as="aside" className="h-fit rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex min-w-0 items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-brand" aria-hidden="true">{user ? getInitials(user.name) : <UserRound className="size-5" />}</span>
                  <span className="min-w-0"><strong className="block truncate text-sm text-slate-800">{user?.name}</strong><span className="block truncate text-xs text-slate-500">{user?.email}</span></span>
                </div>
                <nav aria-label="Account navigation" className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  {accountNavigation.map((item) => {
                    const current = pathname === item.href || (item.href === ROUTES.accountProfile && pathname === ROUTES.account)
                    return <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined} className={`shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${current ? "bg-emerald-50 text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{item.label}</Link>
                  })}
                </nav>
              </ScrollReveal>
              <section aria-label={`${title} details`} className="min-w-0 space-y-5">{children}</section>
            </div>
          </Container>
        </ProtectedRoute>
      </main>
      <SiteFooter data={homePageData.footer} />
    </>
  )
}
