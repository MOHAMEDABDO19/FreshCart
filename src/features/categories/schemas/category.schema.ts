import { z } from "zod"
import { createApiListResponseSchema, createApiSingleResponseSchema } from "@/schemas/api.schema"

export const CategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CategoriesResponseSchema =
  createApiListResponseSchema(CategorySchema)

export const CategoryDetailsSchema = CategorySchema.extend({
  __v: z.number().optional(),
})

export const CategoryResponseSchema = createApiSingleResponseSchema(CategoryDetailsSchema)

export type Category = z.infer<typeof CategorySchema>
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>
export type CategoryDetails = z.infer<typeof CategoryDetailsSchema>
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>
