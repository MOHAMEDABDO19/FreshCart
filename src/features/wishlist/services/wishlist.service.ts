import { apiClient } from "@/api/client"
import {
  AddToWishlistRequestSchema,
  AddToWishlistResponseSchema,
  RemoveFromWishlistResponseSchema,
  WishlistResponseSchema,
  type AddToWishlistRequest,
} from "@/features/wishlist/schemas/wishlist.schema"

function wishlistProxyUrl(productId?: string) {
  if (typeof window === "undefined") {
    throw new Error("Wishlist requests are only available in the browser")
  }
  const suffix = productId ? `/${encodeURIComponent(productId)}` : ""
  return new URL(`/api/wishlist${suffix}`, window.location.origin).toString()
}

export async function getLoggedUserWishlist() {
  const response = await apiClient.get<unknown>(wishlistProxyUrl())

  return WishlistResponseSchema.parse(response.data)
}

export async function addToWishlist(productId: string) {
  const body: AddToWishlistRequest = AddToWishlistRequestSchema.parse({
    productId,
  })
  const response = await apiClient.post<unknown>(wishlistProxyUrl(), body, {
    headers: { "Content-Type": "application/json" },
  })

  return AddToWishlistResponseSchema.parse(response.data)
}

export async function removeFromWishlist(productId: string) {
  const response = await apiClient.delete<unknown>(
    wishlistProxyUrl(productId),
  )

  return RemoveFromWishlistResponseSchema.parse(response.data)
}
