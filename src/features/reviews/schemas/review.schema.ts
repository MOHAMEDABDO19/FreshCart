import { z } from "zod"
import { createApiListResponseSchema } from "@/schemas/api.schema"
import { REVIEW_COPY, REVIEW_FORM_ASSUMPTIONS } from "@/constants/reviews"

const ReviewFields = {
  _id: z.string(),
  review: z.string(),
  rating: z.number(),
  product: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}

export const ProductReviewSchema = z.object({
  ...ReviewFields,
  user: z.object({ _id: z.string(), name: z.string() }),
})

export const CreateReviewResponseItemSchema = z.object({
  ...ReviewFields,
  user: z.string(),
  __v: z.number(),
})

export const UpdateReviewResponseItemSchema = z.object({
  ...ReviewFields,
  user: z.object({ _id: z.string(), name: z.string() }),
  __v: z.number(),
})

export const ProductReviewsResponseSchema = createApiListResponseSchema(ProductReviewSchema)
export const CreateReviewResponseSchema = z.object({ data: CreateReviewResponseItemSchema })
export const UpdateReviewResponseSchema = z.object({ data: UpdateReviewResponseItemSchema })

export const ReviewRequestSchema = z.object({
  review: z.string().min(REVIEW_FORM_ASSUMPTIONS.minimumCharacters, REVIEW_COPY.reviewMin)
    .max(REVIEW_FORM_ASSUMPTIONS.maximumCharacters, REVIEW_COPY.reviewMax),
  rating: z.number().int(REVIEW_COPY.ratingRequired).min(1, REVIEW_COPY.ratingRequired).max(5, REVIEW_COPY.ratingRequired),
})

export type ProductReview = z.infer<typeof ProductReviewSchema>
export type ProductReviewsResponse = z.infer<typeof ProductReviewsResponseSchema>
export type ReviewRequest = z.infer<typeof ReviewRequestSchema>
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>
export type UpdateReviewResponse = z.infer<typeof UpdateReviewResponseSchema>
