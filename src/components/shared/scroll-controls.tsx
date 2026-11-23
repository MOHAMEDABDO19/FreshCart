"use client"

import { ArrowUp } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function ScrollControls() {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  const progressRef = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
        setShowTop((current) => {
          const next = window.scrollY > 400
          return current === next ? current : next
        })
      })
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    if (window.location.hash) return
    const frame = window.requestAnimationFrame(() => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      window.scrollTo({ top: 0, behavior })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    const handleHomeLinkClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>("a[href]")
      if (!link) return
      const destination = new URL(link.href, window.location.href)
      if (destination.origin !== window.location.origin || destination.pathname !== "/" || pathname !== "/") return
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior }))
    }
    document.addEventListener("click", handleHomeLinkClick)
    return () => document.removeEventListener("click", handleHomeLinkClick)
  }, [pathname])

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 bg-transparent">
        <div ref={progressRef} className="scroll-progress h-full bg-brand" />
      </div>
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`motion-button fixed bottom-5 right-5 z-40 flex size-11 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${showTop ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp className="size-5" aria-hidden="true" />
      </button>
    </>
  )
}
