import type { Metadata } from "next"
import { SubcategoriesPage } from "@/features/catalog/components/catalog-pages"

export const metadata: Metadata = {
  title: "Subcategories | FreshCart",
  description: "Browse products by subcategory at FreshCart.",
}

export default async function Page({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params
  return <SubcategoriesPage categoryId={categoryId} />
}
