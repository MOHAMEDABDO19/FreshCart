import type { Brand } from "@/features/brands/schemas/brand.schema"
import type { ApiListResponse, ApiSingleResponse } from "@/types/api"

export type { Brand }
export type BrandListResponse = ApiListResponse<Brand>
export type BrandResponse = ApiSingleResponse<Brand>
