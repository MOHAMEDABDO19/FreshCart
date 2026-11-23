import axios from "axios"
import { apiClient } from "@/api/client"
import {
  AddToCartRequestSchema,
  ApplyCouponRequestSchema,
  CartResponseSchema,
  SetCartQuantityRequestSchema,
  type CartResponse,
} from "@/features/cart/schemas/cart.schema"

function cartProxyUrl(suffix = "") {
  if (typeof window === "undefined") throw new Error("Cart requests are only available in the browser")
  return new URL(`/api/cart${suffix}`, window.location.origin).toString()
}

export async function getCart(): Promise<CartResponse | null> {
  try {
    const response = await apiClient.get<unknown>(cartProxyUrl())
    return CartResponseSchema.parse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function addToCart(productId: string): Promise<CartResponse> {
  const body = AddToCartRequestSchema.parse({ productId })
  const response = await apiClient.post<unknown>(cartProxyUrl(), body)
  return CartResponseSchema.parse(response.data)
}

export async function setCartQuantity(productId: string, count: number): Promise<CartResponse> {
  const body = SetCartQuantityRequestSchema.parse({ count })
  const response = await apiClient.put<unknown>(cartProxyUrl(`/${encodeURIComponent(productId)}`), body)
  return CartResponseSchema.parse(response.data)
}

export async function removeFromCart(productId: string): Promise<CartResponse> {
  const response = await apiClient.delete<unknown>(cartProxyUrl(`/${encodeURIComponent(productId)}`))
  return CartResponseSchema.parse(response.data)
}

export async function clearCart(): Promise<CartResponse> {
  const response = await apiClient.delete<unknown>(cartProxyUrl())
  return CartResponseSchema.parse(response.data)
}

export async function applyCoupon(couponName: string): Promise<void> {
  const body = ApplyCouponRequestSchema.parse({ couponName })
  await apiClient.put<unknown>(cartProxyUrl("/applyCoupon"), body)
}
