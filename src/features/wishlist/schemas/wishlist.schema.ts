import { z } from "zod"
import { ProductSchema } from "@/features/products/schemas/product.schema"

export const AddToWishlistRequestSchema = z.object({
  productId: z.string().min(1),
})

// Wishlist API image entries are file names, unlike the full image URLs in Products API responses.
export const WishlistProductSchema = ProductSchema.extend({
  images: z.array(z.string()),
})

export const WishlistResponseSchema = z.object({
  status: z.literal("success"),
  // ASSUMPTION: an empty wishlist can omit count or return zero; data is authoritative.
  count: z.number().optional(),
  data: z.array(WishlistProductSchema),
})

export const AddToWishlistResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.array(z.string()),
})

export const RemoveFromWishlistResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.array(z.string()),
})

export type AddToWishlistRequest = z.infer<
  typeof AddToWishlistRequestSchema
>
export type WishlistProduct = z.infer<typeof WishlistProductSchema>
export type WishlistResponse = z.infer<typeof WishlistResponseSchema>
export type AddToWishlistResponse = z.infer<typeof AddToWishlistResponseSchema>
export type RemoveFromWishlistResponse = z.infer<
  typeof RemoveFromWishlistResponseSchema
>
