import { z } from "zod"
import {
  createApiListResponseSchema,
  createApiSingleResponseSchema,
} from "@/schemas/api.schema"

export const BrandSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().url(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  __v: z.number().optional(),
})

export const BrandsResponseSchema = createApiListResponseSchema(BrandSchema)
export const BrandResponseSchema = createApiSingleResponseSchema(BrandSchema)

export type Brand = z.infer<typeof BrandSchema>
export type BrandsResponse = z.infer<typeof BrandsResponseSchema>
