export const MOTION = {
  revealDurationMs: 600,
  revealDistancePx: 24,
  subtitleDelayMs: 100,
  cardStaggerMs: 70,
  maxStaggeredCards: 8,
  countUpDurationMs: 800,
  menuDurationMs: 150,
  navbarDurationMs: 180,
  heroFadeDurationMs: 1000,
  heroTextStaggerMs: 100,
  observerThreshold: 0.12,
  observerRootMargin: "0px 0px -32px 0px",
  revealFallbackMs: 2400,
  skeletonDurationMs: 1400,
  cartValueDurationMs: 220,
  cartRemoveDurationMs: 180,
  reviewDeleteDurationMs: 180,
  reviewNewDurationMs: 320,
} as const

export function getRevealDelay(index: number) {
  return Math.min(index, MOTION.maxStaggeredCards - 1) * MOTION.cardStaggerMs
}
