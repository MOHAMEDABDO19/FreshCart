import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react"
import type { BenefitData } from "@/features/home/types/home-page.types"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { getRevealDelay } from "@/constants/motion"

const icons = {
  truck: Truck,
  shield: ShieldCheck,
  return: RotateCcw,
  support: Headphones,
}

const tones = {
  blue: "bg-blue-50 text-blue-500",
  green: "bg-emerald-50 text-emerald-500",
  orange: "bg-orange-50 text-orange-500",
  purple: "bg-purple-50 text-purple-500",
}

export function ServiceBenefits({ items, variant }: { items: BenefitData[]; variant: "cards" | "strip" }) {
  if (variant === "strip") {
    return (
      <section aria-label="Store benefits" className="border-y border-emerald-100 bg-emerald-50/70">
        <Container className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-2 md:gap-5 lg:py-6 xl:grid-cols-4">
          {items.map((item, index) => {
            const Icon = icons[item.icon]
            return <ScrollReveal as="div" key={item.title} delayMs={getRevealDelay(index)} className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-brand"><Icon className="size-4" aria-hidden="true" /></span><span><strong className="block text-xs font-semibold text-slate-800">{item.title}</strong><span className="text-[11px] text-slate-500">{item.description}</span></span></ScrollReveal>
          })}
        </Container>
      </section>
    )
  }

  return (
    <section aria-label="Store benefits" className="bg-slate-50 py-6 md:py-8 lg:py-9">
      <Container className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-4">
        {items.map((item, index) => {
          const Icon = icons[item.icon]
          return <ScrollReveal as="article" key={item.title} delayMs={getRevealDelay(index)} className="motion-card flex min-h-[80px] items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 shadow-sm sm:min-h-[84px] sm:px-5">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tones[item.tone]}`}><Icon className="size-5" aria-hidden="true" /></span>
            <span><strong className="block text-sm font-semibold text-slate-800">{item.title}</strong><span className="text-xs text-slate-500">{item.description}</span></span>
          </ScrollReveal>
        })}
      </Container>
    </section>
  )
}
