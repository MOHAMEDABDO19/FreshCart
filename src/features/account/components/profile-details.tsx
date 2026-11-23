"use client"

import { Mail, ShieldCheck, UserRound } from "lucide-react"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { useAuthStore } from "@/store/auth-store"

export function ProfileDetails() {
  const user = useAuthStore((state) => state.user)
  if (!user) return null

  const fields = [
    { label: "Name", value: user.name, icon: UserRound },
    { label: "Email", value: user.email, icon: Mail },
    { label: "Role", value: user.role, icon: ShieldCheck },
  ]

  return <div className="grid gap-4 sm:grid-cols-2">{fields.map(({ label, value, icon: Icon }, index) => <ScrollReveal key={label} delayMs={index * 70}><section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-brand"><Icon className="size-5" aria-hidden="true" /></span><div className="min-w-0"><h2 className="text-xs font-medium text-slate-500">{label}</h2><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p></div></div></section></ScrollReveal>)}</div>
}
