import { apiClient } from "@/api/client"
import {
  SubCategoriesResponseSchema,
  SubCategoryResponseSchema,
} from "@/features/subcategories/schemas/subcategory.schema"

export type GetSubCategoriesParams = {
  limit?: number
  /** ASSUMPTION: the API accepts a page query parameter. */
  page?: number
}

export async function getSubCategories(params?: GetSubCategoriesParams) {
  const response = await apiClient.get<unknown>("/subcategories", { params })
  return SubCategoriesResponseSchema.parse(response.data)
}

export async function getSubCategoryById(id: string) {
  const response = await apiClient.get<unknown>(`/subcategories/${encodeURIComponent(id)}`)
  return SubCategoryResponseSchema.parse(response.data)
}

export async function getSubCategoriesByCategory(categoryId: string) {
  const response = await apiClient.get<unknown>(
    `/categories/${encodeURIComponent(categoryId)}/subcategories`,
  )
  return SubCategoriesResponseSchema.parse(response.data)
}

export async function getAllSubCategories() {
  type SubCategoriesPage = Awaited<ReturnType<typeof getSubCategories>>
  let firstPage: SubCategoriesPage

  try {
    firstPage = await getSubCategories({ limit: 100 })
  } catch {
    // Fallback in case this API caps or rejects a large `limit` value.
    firstPage = await getSubCategories({ limit: 40, page: 1 })
  }

  const collected = new Map(firstPage.data.map((subcategory) => [subcategory._id, subcategory]))
  const totalPages = Math.max(
    firstPage.metadata.numberOfPages,
    Math.ceil(firstPage.results / firstPage.metadata.limit),
  )

  for (let page = firstPage.metadata.currentPage + 1; page <= totalPages; page += 1) {
    const response = await getSubCategories({ limit: firstPage.metadata.limit, page })
    response.data.forEach((subcategory) => collected.set(subcategory._id, subcategory))
  }

  return Array.from(collected.values())
}
