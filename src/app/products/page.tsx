import type { Metadata } from "next"
import { Suspense } from "react"
import { ProductsPage } from "@/features/catalog/components/catalog-pages"

export const metadata: Metadata = {
  title: "Shop Products | FreshCart",
  description: "Discover products available at FreshCart.",
}

export default function Page() {
  return <Suspense fallback={<main aria-busy="true" />}><ProductsPage /></Suspense>
}
