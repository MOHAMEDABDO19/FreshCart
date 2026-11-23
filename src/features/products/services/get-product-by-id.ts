import { apiClient } from "@/api/client"
import {
  ProductDetailsResponseSchema,
  type ProductDetailsResponse,
} from "@/features/products/schemas/product.schema"

export async function getProductById(id: string): Promise<ProductDetailsResponse> {
  const response = await apiClient.get<unknown>(`/products/${encodeURIComponent(id)}`)
  return ProductDetailsResponseSchema.parse(response.data)
}
