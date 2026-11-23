import type { MetadataRoute } from "next"
import { ROUTES } from "@/constants/routes"

const publicRoutes = [
  ROUTES.home,
  ROUTES.products,
  ROUTES.categories,
  ROUTES.brands,
  ROUTES.contact,
  ROUTES.faq,
  ROUTES.shippingReturns,
  ROUTES.privacy,
  ROUTES.terms,
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://freshcart-route.vercel.app"
  return publicRoutes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    changeFrequency: route === ROUTES.home ? "daily" : "weekly",
    priority: route === ROUTES.home ? 1 : 0.7,
  }))
}
