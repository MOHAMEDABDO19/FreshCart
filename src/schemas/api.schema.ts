import { z } from "zod"

export const ApiListMetadataSchema = z.object({
  currentPage: z.number(),
  numberOfPages: z.number(),
  limit: z.number(),
  nextPage: z.number().optional(),
  prevPage: z.number().optional(),
})

export function createApiListResponseSchema<TItem extends z.ZodType>(
  itemSchema: TItem,
) {
  return z.object({
    results: z.number(),
    metadata: ApiListMetadataSchema,
    data: z.array(itemSchema),
  })
}

export function createApiSingleResponseSchema<TItem extends z.ZodType>(
  itemSchema: TItem,
) {
  return z.object({
    data: itemSchema,
  })
}
