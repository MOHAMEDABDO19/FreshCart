"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import {
  getProducts,
  type GetProductsParams,
} from "@/features/products/services/get-products"
import { getProductById } from "@/features/products/services/get-product-by-id"
import type { ProductDetailsResponse } from "@/features/products/schemas/product.schema"

type ApiRequestError = AxiosError<ApiError>

export const productQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (params?: GetProductsParams) =>
    [...productQueryKeys.lists(), params] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
}

export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getProducts(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string) {
  const query = useQuery<ProductDetailsResponse, ApiRequestError>({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: id.length > 0,
  })

  const message = query.error?.response?.data.message ?? ""
  const isNotFound = query.isError && (
    query.error.response?.status === 404 || message.startsWith("No document for this id")
  )

  return { ...query, isNotFound }
}
