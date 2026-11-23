"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { type AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import {
  addToWishlist,
  getLoggedUserWishlist,
  removeFromWishlist,
} from "@/features/wishlist/services/wishlist.service"
import type {
  AddToWishlistResponse,
  RemoveFromWishlistResponse,
  WishlistProduct,
  WishlistResponse,
} from "@/features/wishlist/schemas/wishlist.schema"

type ApiRequestError = AxiosError<ApiError>

export const wishlistQueryKeys = {
  all: ["wishlist"] as const,
  lists: () => [...wishlistQueryKeys.all, "list"] as const,
  list: () => [...wishlistQueryKeys.lists()] as const,
}

type WishlistMutationVariables = {
  productId: string
}
type AddWishlistVariables = WishlistMutationVariables & { product?: WishlistProduct }
type WishlistMutationContext = { previous?: WishlistResponse }

export function isDuplicateWishlistError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 409
}

export function useWishlist(enabled = true) {
  return useQuery<WishlistResponse, ApiRequestError>({
    queryKey: wishlistQueryKeys.list(),
    queryFn: getLoggedUserWishlist,
    enabled,
    staleTime: 30 * 1000,
  })
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()

  return useMutation<
    AddToWishlistResponse,
    ApiRequestError,
    AddWishlistVariables,
    WishlistMutationContext
  >({
    mutationFn: ({ productId }) => addToWishlist(productId),
    onMutate: async ({ productId, product }) => {
      const queryKey = wishlistQueryKeys.list()
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<WishlistResponse>(queryKey)
      if (previous && product && !previous.data.some((item) => item._id === productId)) {
        const data = [...previous.data, product]
        queryClient.setQueryData<WishlistResponse>(queryKey, {
          ...previous,
          count: data.length,
          data,
        })
      }
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (!isDuplicateWishlistError(error) && context?.previous) {
        queryClient.setQueryData(wishlistQueryKeys.list(), context.previous)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.list() }),
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()

  return useMutation<
    RemoveFromWishlistResponse,
    ApiRequestError,
    WishlistMutationVariables,
    WishlistMutationContext
  >({
    mutationFn: ({ productId }) => removeFromWishlist(productId),
    onMutate: async ({ productId }) => {
      const queryKey = wishlistQueryKeys.list()
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<WishlistResponse>(queryKey)
      if (previous) {
        const data = previous.data.filter((item) => item._id !== productId)
        queryClient.setQueryData<WishlistResponse>(queryKey, {
          ...previous,
          count: data.length,
          data,
        })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(wishlistQueryKeys.list(), context.previous)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.list() }),
  })
}
