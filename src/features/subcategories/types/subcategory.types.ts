import type { SubCategory } from "@/features/subcategories/schemas/subcategory.schema"
import type { ApiListResponse, ApiSingleResponse } from "@/types/api"

export type { SubCategory }
export type SubCategoryListResponse = ApiListResponse<SubCategory>
export type SubCategoryResponse = ApiSingleResponse<SubCategory>
