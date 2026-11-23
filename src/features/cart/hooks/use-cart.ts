"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import {
  addToCart,
  applyCoupon,
  clearCart,
  getCart,
  removeFromCart,
  setCartQuantity,
} from "@/features/cart/services/cart.service"
import type { CartResponse } from "@/features/cart/schemas/cart.schema"
import { showToast } from "@/store/toast-store"

type ApiRequestError = AxiosError<ApiError>

export const cartQueryKeys = {
  all: ["cart"] as const,
  detail: () => [...cartQueryKeys.all, "detail"] as const,
}

export function useCart(enabled = true) {
  return useQuery<CartResponse | null, ApiRequestError>({
    queryKey: cartQueryKeys.detail(),
    queryFn: getCart,
    enabled,
    staleTime: 30 * 1000,
    retry: (failureCount, error) => error.response?.status !== 401 && failureCount < 2,
  })
}

function useCartMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<CartResponse>, successMessage = "Cart updated successfully.") {
  const queryClient = useQueryClient()
  return useMutation<CartResponse, ApiRequestError, TVariables>({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKeys.detail(), cart)
      showToast(successMessage)
    },
    onError: () => showToast("We couldn’t update your cart. Please try again.", "error"),
  })
}

export function useAddToCart() {
  return useCartMutation(({ productId }: { productId: string }) => addToCart(productId), "Product added to cart successfully.")
}

export function useSetCartQuantity() {
  return useCartMutation(({ productId, count }: { productId: string; count: number }) => setCartQuantity(productId, count))
}

export function useRemoveFromCart() {
  return useCartMutation(({ productId }: { productId: string }) => removeFromCart(productId))
}

export function useClearCart() {
  return useCartMutation<void>(() => clearCart())
}

export function useApplyCartCoupon() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiRequestError, { couponName: string }>({
    mutationFn: ({ couponName }) => applyCoupon(couponName),
    onSuccess: async () => {
      await queryClient.fetchQuery({ queryKey: cartQueryKeys.detail(), queryFn: getCart })
      showToast("Coupon applied successfully.")
    },
    onError: () => showToast("We couldn’t apply that coupon.", "error"),
  })
}
