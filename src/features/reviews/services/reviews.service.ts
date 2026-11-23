import { apiClient } from "@/api/client"
import { REVIEW_API_ASSUMPTIONS } from "@/constants/reviews"
import {
  CreateReviewResponseSchema,
  ProductReviewsResponseSchema,
  ReviewRequestSchema,
  UpdateReviewResponseSchema,
  type ReviewRequest,
} from "@/features/reviews/schemas/review.schema"

function productReviewsProxyUrl(productId: string) {
  if (typeof window === "undefined") throw new Error("Review mutations are only available in the browser")
  return new URL(`/api/products/${encodeURIComponent(productId)}/reviews`, window.location.origin).toString()
}

function reviewProxyUrl(reviewId: string) {
  if (typeof window === "undefined") throw new Error("Review mutations are only available in the browser")
  return new URL(`/api/reviews/${encodeURIComponent(reviewId)}`, window.location.origin).toString()
}

export async function getProductReviews(productId: string, page = 1) {
  const response = await apiClient.get<unknown>(`/products/${encodeURIComponent(productId)}/reviews`, { params: { [REVIEW_API_ASSUMPTIONS.pageQueryParameter]: page } })
  return ProductReviewsResponseSchema.parse(response.data)
}

export async function createProductReview(productId: string, input: ReviewRequest) {
  const body = ReviewRequestSchema.parse(input)
  const response = await apiClient.post<unknown>(productReviewsProxyUrl(productId), body, {
    headers: { "Content-Type": "application/json" },
  })
  return CreateReviewResponseSchema.parse(response.data)
}

export async function updateReview(reviewId: string, input: ReviewRequest) {
  const body = ReviewRequestSchema.parse(input)
  const response = await apiClient.put<unknown>(reviewProxyUrl(reviewId), body, {
    headers: { "Content-Type": "application/json" },
  })
  return UpdateReviewResponseSchema.parse(response.data)
}

export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete<unknown>(reviewProxyUrl(reviewId))
}
