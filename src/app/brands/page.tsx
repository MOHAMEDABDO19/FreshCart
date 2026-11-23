import type { Metadata } from "next"
import { BrandsPage } from "@/features/catalog/components/catalog-pages"

export const metadata: Metadata = {
  title: "Brands | FreshCart",
  description: "Browse the brands available at FreshCart.",
}

export default function Page() {
  return <BrandsPage />
}
