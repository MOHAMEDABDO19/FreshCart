import { z } from "zod"
import {
  createApiListResponseSchema,
  createApiSingleResponseSchema,
} from "@/schemas/api.schema"

export const SubCategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  __v: z.number().optional(),
})

export const SubCategoryResponseSchema =
  createApiSingleResponseSchema(SubCategorySchema)

export const SubCategoriesResponseSchema =
  createApiListResponseSchema(SubCategorySchema)

export type SubCategory = z.infer<typeof SubCategorySchema>
export type SubCategoriesResponse = z.infer<typeof SubCategoriesResponseSchema>
