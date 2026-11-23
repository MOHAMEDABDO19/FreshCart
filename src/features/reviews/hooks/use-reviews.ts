"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import { productQueryKeys } from "@/features/products/hooks/use-products"
import {
  createProductReview,
  deleteReview,
  getProductReviews,
  updateReview,
} from "@/features/reviews/services/reviews.service"
import type { ProductReviewsResponse, ReviewRequest } from "@/features/reviews/schemas/review.schema"

type ApiRequestError = AxiosError<ApiError>

export const reviewQueryKeys = {
  all: ["reviews"] as const,
  product: (productId: string) => [...reviewQueryKeys.all, "product", productId] as const,
  productSummary: (productId: string) => [...reviewQueryKeys.product(productId), "summary"] as const,
}

type ProductReviewsSummary = { results: number; pages: ProductReviewsResponse[] }

export function useProductReviews(productId: string, enabled = true) {
  const queryClient = useQueryClient()
  return useInfiniteQuery<ProductReviewsResponse, ApiRequestError, { pages: ProductReviewsResponse[]; pageParams: number[] }, ReturnType<typeof reviewQueryKeys.product>, number>({
    queryKey: reviewQueryKeys.product(productId),
    queryFn: ({ pageParam }) => {
      const cachedPage = queryClient.getQueryData<ProductReviewsSummary>(reviewQueryKeys.productSummary(productId))
        ?.pages.find((page) => page.metadata.currentPage === pageParam)
      return cachedPage ?? getProductReviews(productId, pageParam)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.metadata.nextPage
      ?? (lastPage.metadata.currentPage < lastPage.metadata.numberOfPages ? lastPage.metadata.currentPage + 1 : undefined),
    enabled: enabled && productId.length > 0,
    retry: 1,
    staleTime: 30 * 1000,
  })
}

export function useAllProductReviews(productId: string, firstPage?: ProductReviewsResponse, enabled = true) {
  return useQuery<ProductReviewsSummary, ApiRequestError>({
    queryKey: reviewQueryKeys.productSummary(productId),
    enabled: enabled && Boolean(firstPage) && productId.length > 0,
    queryFn: async () => {
      if (!firstPage) throw new Error("The first reviews page is not available")
      const pages = [firstPage]
      let currentPage = firstPage.metadata.currentPage
      while (currentPage < firstPage.metadata.numberOfPages) {
        const nextPage = pages.at(-1)?.metadata.nextPage ?? currentPage + 1
        const page = await getProductReviews(productId, nextPage)
        if (page.metadata.currentPage <= currentPage) break
        pages.push(page)
        currentPage = page.metadata.currentPage
      }
      return { results: firstPage.results, pages }
    },
    retry: 1,
    staleTime: 30 * 1000,
  })
}

function invalidateReviewData(productId: string, queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.product(productId) }),
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.productSummary(productId) }),
    queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(productId) }),
  ])
}

export function useCreateProductReview() {
  const queryClient = useQueryClient()
  return useMutation<Awaited<ReturnType<typeof createProductReview>>, ApiRequestError, { productId: string; input: ReviewRequest }>({
    mutationFn: ({ productId, input }) => createProductReview(productId, input),
    onSuccess: (_result, { productId }) => invalidateReviewData(productId, queryClient),
  })
}

export function useUpdateReview(productId: string) {
  const queryClient = useQueryClient()
  return useMutation<Awaited<ReturnType<typeof updateReview>>, ApiRequestError, { reviewId: string; input: ReviewRequest }>({
    mutationFn: ({ reviewId, input }) => updateReview(reviewId, input),
    onSuccess: () => invalidateReviewData(productId, queryClient),
  })
}

export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient()
  return useMutation<void, ApiRequestError, { reviewId: string }>({
    mutationFn: ({ reviewId }) => deleteReview(reviewId),
    onSuccess: () => invalidateReviewData(productId, queryClient),
  })
}
