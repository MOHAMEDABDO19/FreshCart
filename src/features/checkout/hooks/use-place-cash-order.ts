"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import { placeCashOrder } from "@/features/checkout/services/checkout.service"
import type { ShippingAddressInput } from "@/features/checkout/schemas/checkout.schema"
import { cartQueryKeys } from "@/features/cart/hooks/use-cart"
import { showToast } from "@/store/toast-store"

type PlaceCashOrderVariables = {
  cartId: string
  shippingAddress: ShippingAddressInput
}

export function usePlaceCashOrder() {
  const queryClient = useQueryClient()
  return useMutation<void, AxiosError<ApiError>, PlaceCashOrderVariables>({
    mutationFn: ({ cartId, shippingAddress }) => placeCashOrder(cartId, shippingAddress),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartQueryKeys.detail() })
      showToast("Order placed successfully.")
    },
    onError: () => showToast("We couldn’t place your order. Please try again.", "error"),
  })
}
