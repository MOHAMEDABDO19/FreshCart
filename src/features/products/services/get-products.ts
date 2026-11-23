import { apiClient } from "@/api/client"
import { SUBCATEGORY_FILTER_SUPPORTED } from "@/constants/catalog"
import {
  ProductProjectionResponseSchema,
  ProductsResponseSchema,
} from "@/features/products/schemas/product.schema"

export type GetProductsParams = {
  limit?: number
  sort?: string
  fields?: string
  keyword?: string
  brand?: string
  page?: number
  "price[gte]"?: number
  "price[lte]"?: number
  // ASSUMPTION: arrays use repeated `category[in]` query keys.
  "category[in]"?: string | string[]
  subcategory?: string
}

export async function getProducts(params?: GetProductsParams) {
  const requestParams = { ...params }
  if (!SUBCATEGORY_FILTER_SUPPORTED) delete requestParams.subcategory

  const response = await apiClient.get<unknown>("/products", {
    params: requestParams,
    paramsSerializer: {
      indexes: null,
      encode: (value) => encodeURIComponent(value),
    },
  })

  if (requestParams.fields) {
    return ProductProjectionResponseSchema.parse(response.data)
  }

  return ProductsResponseSchema.parse(response.data)
}
