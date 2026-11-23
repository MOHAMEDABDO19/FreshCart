import type { Category, CategoryDetails, CategoryResponse } from "@/features/categories/schemas/category.schema"
import type { ApiListResponse } from "@/types/api"

export type { Category, CategoryDetails, CategoryResponse }
export type CategoryListResponse = ApiListResponse<Category>
