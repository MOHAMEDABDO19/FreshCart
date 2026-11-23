"use client"

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react"
import { MOTION } from "@/constants/motion"

type RevealTag = "div" | "span" | "main" | "aside" | "section" | "h1" | "h2" | "h3" | "p" | "article" | "li"

type ScrollRevealProps<T extends RevealTag> = {
  as?: T
  children: ReactNode
  delayMs?: number
  direction?: "up" | "left" | "right" | "none"
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">

const revealElements = new Map<Element, number>()
let revealObserver: IntersectionObserver | undefined

function getRevealObserver() {
  if (revealObserver || typeof IntersectionObserver === "undefined") return revealObserver
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const element = entry.target as HTMLElement
      window.clearTimeout(revealElements.get(element))
      element.classList.remove("reveal-pending")
      element.classList.add("is-revealed")
      revealObserver?.unobserve(element)
      revealElements.delete(element)
    })
  }, { threshold: MOTION.observerThreshold, rootMargin: MOTION.observerRootMargin })
  return revealObserver
}

export function ScrollReveal<T extends RevealTag = "div">({
  as,
  children,
  delayMs = 0,
  direction = "right",
  className,
  ...props
}: ScrollRevealProps<T>) {
  const elementRef = useRef<HTMLElement | null>(null)
  const Tag = (as ?? "div") as ElementType

  useEffect(() => {
    const element = elementRef.current
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const observer = getRevealObserver()
    if (!observer) return

    // Keep server-rendered content visible until this effect runs.
    if (element.getBoundingClientRect().top < window.innerHeight) {
      element.classList.add("is-revealed")
      return
    }

    element.style.setProperty("--reveal-delay", `${delayMs}ms`)
    element.dataset.revealDirection = direction
    element.classList.add("reveal-pending")
    revealElements.set(element, window.setTimeout(() => {
      element.classList.remove("reveal-pending")
      element.classList.add("is-revealed")
      observer.unobserve(element)
      revealElements.delete(element)
    }, MOTION.revealFallbackMs))
    observer.observe(element)

    return () => {
      window.clearTimeout(revealElements.get(element))
      revealElements.delete(element)
      observer.unobserve(element)
    }
  }, [delayMs, direction])

  return <Tag ref={elementRef as never} className={className} data-motion-reveal {...props}>{children}</Tag>
}

