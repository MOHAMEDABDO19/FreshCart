"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, type KeyboardEvent } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { HeroData } from "@/features/home/types/home-page.types"
import { Container } from "@/components/layout/container"
import { ROUTES } from "@/constants/routes"
import { HOME_HERO_IMAGE, HOME_HERO_SLIDES } from "@/constants/hero"

export function HeroSection({ data }: { data: HeroData }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const slide = HOME_HERO_SLIDES[activeSlide]
  const move = (direction: -1 | 1) => setActiveSlide((current) => (current + direction + HOME_HERO_SLIDES.length) % HOME_HERO_SLIDES.length)
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1) }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1) }
  }

  return (
    <section tabIndex={0} onKeyDown={onKeyDown} aria-label={`${data.title}. Use left and right arrow keys to change slides.`} className="relative flex h-[280px] items-center overflow-hidden bg-[linear-gradient(105deg,#08bd58_0%,#05a84e_52%,#087c50_100%)] text-white sm:h-[320px] lg:h-[360px] focus-visible:outline-none">
      {!heroImageFailed ? <Image src={HOME_HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" onError={() => setHeroImageFailed(true)} /> : null}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-800/65 to-emerald-600/40" aria-hidden="true" />
      <Container className="relative z-10 py-12 sm:py-14 lg:py-16">
        <div key={activeSlide} className="relative z-10 max-w-[560px] px-12 sm:px-16 md:px-20 lg:px-24">
          <h1 className="hero-slide-title text-2xl font-bold leading-[1.12] tracking-tight sm:text-3xl lg:text-[28px]">{slide.title}</h1>
          <p className="hero-slide-subtitle mt-4 text-sm sm:text-base">{slide.description}</p>
          <div className="hero-slide-actions mt-6 flex flex-wrap gap-3">
            <Link href={ROUTES.products} className="motion-button whitespace-nowrap rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand">{slide.primary}</Link>
            <Link href={ROUTES.products} className="motion-button whitespace-nowrap rounded-lg border border-white/60 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{slide.secondary}</Link>
          </div>
        </div>
      </Container>
      <button type="button" aria-label="Previous slide" onClick={() => move(-1)} className="motion-button absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4 sm:size-11"><ChevronLeft className="size-4 sm:size-5" aria-hidden="true" /></button>
      <button type="button" aria-label="Next slide" onClick={() => move(1)} className="motion-button absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:size-11"><ChevronRight className="size-4 sm:size-5" aria-hidden="true" /></button>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2" aria-label="Choose a slide">
        {HOME_HERO_SLIDES.map((item, index) => <button key={item.title} type="button" aria-label={`Go to slide ${index + 1}`} aria-pressed={activeSlide === index} onClick={() => setActiveSlide(index)} className={`rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${activeSlide === index ? "h-2.5 w-7 bg-white" : "size-2.5 bg-white/50"}`} />)}
      </div>
      <span className="sr-only" aria-live="off">Slide {activeSlide + 1} of {HOME_HERO_SLIDES.length}: {slide.title}</span>
    </section>
  )
}
