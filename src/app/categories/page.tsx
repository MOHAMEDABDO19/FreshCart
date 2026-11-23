import type { Metadata } from "next"
import { CategoriesPage } from "@/features/catalog/components/catalog-pages"

export const metadata: Metadata = {
  title: "Categories | FreshCart",
  description: "Explore product categories at FreshCart.",
}

export default function Page() {
  return <CategoriesPage />
}
