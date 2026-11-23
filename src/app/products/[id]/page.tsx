import type { Metadata } from "next"
import { ProductDetailsPage } from "@/features/products/components/product-details-page"
import { getProductById } from "@/features/products/services/get-product-by-id"

type ProductPageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const { data: product } = await getProductById(id)
    return {
      title: `${product.title} | FreshCart`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: `${product.title} | FreshCart`,
        description: product.description.slice(0, 160),
        images: [product.imageCover],
      },
    }
  } catch {
    return { title: "Product | FreshCart" }
  }
}

export default async function Page({ params }: ProductPageProps) {
  const { id } = await params
  return <ProductDetailsPage productId={id} />
}
