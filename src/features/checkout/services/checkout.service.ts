import { apiClient } from "@/api/client"
import {
  CashOrderRequestSchema,
  StripeCheckoutResponseSchema,
  type ShippingAddressInput,
  type StripeCheckoutResponse,
} from "@/features/checkout/schemas/checkout.schema"

function cashOrderProxyUrl(cartId: string) {
  if (typeof window === "undefined") throw new Error("Cash orders are only available in the browser")
  return new URL(`/api/orders/${encodeURIComponent(cartId)}`, window.location.origin).toString()
}

export async function placeCashOrder(cartId: string, shippingAddress: ShippingAddressInput): Promise<void> {
  const body = CashOrderRequestSchema.parse({ shippingAddress })
  await apiClient.post<unknown>(cashOrderProxyUrl(cartId), body, {
    headers: { "Content-Type": "application/json" },
  })
}

function stripeCheckoutProxyUrl(cartId: string) {
  if (typeof window === "undefined") throw new Error("Online checkout is only available in the browser")
  return new URL(`/api/orders/checkout-session/${encodeURIComponent(cartId)}`, window.location.origin).toString()
}

export async function createStripeCheckoutSession(cartId: string, shippingAddress: ShippingAddressInput): Promise<StripeCheckoutResponse> {
  const body = CashOrderRequestSchema.parse({ shippingAddress })
  const response = await apiClient.post<unknown>(stripeCheckoutProxyUrl(cartId), body, {
    headers: { "Content-Type": "application/json" },
  })
  return StripeCheckoutResponseSchema.parse(response.data)
}
