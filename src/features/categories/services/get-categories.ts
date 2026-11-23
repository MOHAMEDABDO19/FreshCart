import { apiClient } from "@/api/client"
import { CategoriesResponseSchema, CategoryResponseSchema } from "@/features/categories/schemas/category.schema"

export type GetCategoriesParams = {
  limit?: number
  page?: number
  keyword?: string
}

export async function getCategories(params?: GetCategoriesParams) {
  const response = await apiClient.get<unknown>("/categories", { params })
  return CategoriesResponseSchema.parse(response.data)
}

export async function getCategoryById(id: string) {
  const response = await apiClient.get<unknown>(`/categories/${encodeURIComponent(id)}`)
  return CategoryResponseSchema.parse(response.data)
}
