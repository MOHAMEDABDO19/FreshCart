import type {
  Product,
  ProductBrand,
  ProductCategory,
  ProductProjection,
  ProductSubCategory,
} from "@/features/products/schemas/product.schema"
import type { ApiListResponse } from "@/types/api"

export type {
  Product,
  ProductBrand,
  ProductCategory,
  ProductProjection,
  ProductSubCategory,
}
export type ProductListResponse = ApiListResponse<Product>
export type ProductProjectionListResponse = ApiListResponse<ProductProjection>
