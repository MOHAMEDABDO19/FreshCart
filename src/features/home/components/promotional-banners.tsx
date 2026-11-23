import { ArrowRight, Flame, Sparkles } from "lucide-react"
import Link from "next/link"
import type { PromotionData } from "@/features/home/types/home-page.types"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { getRevealDelay } from "@/constants/motion"

export function PromotionalBanners({ items }: { items: PromotionData[] }) {
  return (
    <section id="deals" aria-label="Current promotions" className="py-10 md:py-12 lg:py-14">
      <Container className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      {items.map((item, index) => (
        <ScrollReveal key={item.title} direction={index % 2 === 0 ? "left" : "right"} delayMs={getRevealDelay(index)} className="h-full">
        <article className={`motion-card group relative min-h-[200px] overflow-hidden rounded-2xl p-4 text-white md:min-h-[215px] md:p-6 ${item.tone === "green" ? "bg-[linear-gradient(115deg,#08b876,#007b58)]" : "bg-[linear-gradient(115deg,#ff8500,#ff205e)]"}`}>
          <Link href={item.action.href} aria-label={`${item.action.label}: ${item.title}`} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70" />
          <span className="absolute -right-7 -top-10 size-28 rounded-full bg-white/10 md:size-32" aria-hidden="true" />
          <span className="absolute -bottom-10 -left-7 size-20 rounded-full bg-white/10 md:size-24" aria-hidden="true" />
          <div className="pointer-events-none relative z-20">
            <span className="promo-float inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{item.icon === "flame" ? <Flame className="mr-1.5 size-3.5" aria-hidden="true" /> : <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" />}{item.badge}</span>
            <h2 className="mt-2 text-xl font-bold tracking-tight md:mt-3 md:text-3xl">{item.title}</h2>
            <p className="mt-1.5 line-clamp-2 text-xs text-white/90 md:text-sm">{item.description}</p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 md:mt-4 md:gap-x-4"><strong className="text-2xl font-bold md:text-3xl">{item.offer}</strong><span className="text-[11px] text-white/85 md:text-xs">Use code: <b className="text-white">{item.code}</b></span></div>
            <Link href={item.action.href} className="motion-button pointer-events-auto relative z-30 mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-brand shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand md:mt-4 md:min-h-11 md:px-5 md:text-sm">{item.action.label}<ArrowRight className="motion-arrow size-4" aria-hidden="true" /></Link>
          </div>
        </article>
        </ScrollReveal>
      ))}
      </Container>
    </section>
  )
}
