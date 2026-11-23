"use client"

import { useMutation } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import { createStripeCheckoutSession } from "@/features/checkout/services/checkout.service"
import type { ShippingAddressInput, StripeCheckoutResponse } from "@/features/checkout/schemas/checkout.schema"
import { showToast } from "@/store/toast-store"

type StripeCheckoutVariables = { cartId: string; shippingAddress: ShippingAddressInput }

export function useCreateStripeCheckout() {
  return useMutation<StripeCheckoutResponse, AxiosError<ApiError>, StripeCheckoutVariables>({
    mutationFn: ({ cartId, shippingAddress }) => createStripeCheckoutSession(cartId, shippingAddress),
    onSuccess: () => showToast("Redirecting to secure Stripe checkout."),
    onError: () => showToast("We couldn’t start online payment. Please try again.", "error"),
  })
}
