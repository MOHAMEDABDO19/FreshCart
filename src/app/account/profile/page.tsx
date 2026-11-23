import type { Metadata } from "next"
import { ArrowRight, MapPin, Settings, Heart } from "lucide-react"
import Link from "next/link"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { AccountLayout } from "@/features/account/components/account-layout"
import { ROUTES } from "@/constants/routes"
import { ProfileDetails } from "@/features/account/components/profile-details"

export const metadata: Metadata = { title: "My Profile | FreshCart", robots: { index: false, follow: false } }

export default function AccountProfilePage() {
  return <AccountLayout title="My Profile"><ProfileDetails /><div className="grid gap-3 sm:grid-cols-3">{[
    { label: "My Wishlist", href: ROUTES.wishlist, icon: Heart },
    { label: "My Addresses", href: ROUTES.accountAddresses, icon: MapPin },
    { label: "Account Settings", href: ROUTES.accountSettings, icon: Settings },
  ].map(({ label, href, icon: Icon }, index) => <ScrollReveal key={href} delayMs={index * 70}><Link href={href} className="motion-card flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-brand"><Icon className="size-5" aria-hidden="true" /></span>{label}</span><ArrowRight className="size-4" aria-hidden="true" /></Link></ScrollReveal>)}</div></AccountLayout>
}
