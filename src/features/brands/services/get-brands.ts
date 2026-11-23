import { apiClient } from "@/api/client"
import {
  BrandResponseSchema,
  BrandsResponseSchema,
} from "@/features/brands/schemas/brand.schema"

export type GetBrandsParams = {
  limit?: number
  // ASSUMPTION: the API accepts `page`; docs mention pagination only indirectly via metadata.nextPage.
  page?: number
  keyword?: string
}

export async function getBrands(params?: GetBrandsParams) {
  const response = await apiClient.get<unknown>("/brands", { params })
  return BrandsResponseSchema.parse(response.data)
}

export async function getAllBrands() {
  const firstPage = await getBrands()
  const brands = new Map(firstPage.data.map((brand) => [brand._id, brand]))
  let currentPage = firstPage.metadata.currentPage

  while (currentPage < firstPage.metadata.numberOfPages) {
    const nextPage = firstPage.metadata.nextPage ?? currentPage + 1
    if (nextPage <= currentPage) break

    const page = await getBrands({ limit: firstPage.metadata.limit, page: nextPage })
    if (page.metadata.currentPage <= currentPage) break

    page.data.forEach((brand) => brands.set(brand._id, brand))
    currentPage = page.metadata.currentPage
  }

  return { ...firstPage, data: [...brands.values()] }
}

export async function getBrandById(id: string) {
  const response = await apiClient.get<unknown>(
    `/brands/${encodeURIComponent(id)}`,
  )
  return BrandResponseSchema.parse(response.data)
}
