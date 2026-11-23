import { z } from "zod"
import {
  ProductBrandSchema,
  ProductCategorySchema,
  ProductSubCategorySchema,
} from "@/features/products/schemas/product.schema"

export const CartProductSchema = z.object({
  subcategory: z.array(ProductSubCategorySchema),
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  quantity: z.number(),
  imageCover: z.string().url(),
  category: ProductCategorySchema,
  brand: ProductBrandSchema,
  ratingsAverage: z.number(),
  id: z.string(),
})

export const CartLineSchema = z.object({
  count: z.number().int().positive(),
  _id: z.string(),
  price: z.number(),
  product: CartProductSchema,
})

export const CartDataSchema = z.object({
  _id: z.string().optional(),
  cartOwner: z.string().optional(),
  products: z.array(CartLineSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  __v: z.number().optional(),
  totalCartPrice: z.number(),
})

export const CartResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  numOfCartItems: z.number().int().nonnegative(),
  cartId: z.string().nullable(),
  data: CartDataSchema,
})

export const AddToCartRequestSchema = z.object({ productId: z.string().min(1) })
export const SetCartQuantityRequestSchema = z.object({ count: z.number().int().positive() })
export const ApplyCouponRequestSchema = z.object({ couponName: z.string().min(1) })

export type CartProduct = z.infer<typeof CartProductSchema>
export type CartLine = z.infer<typeof CartLineSchema>
export type CartData = z.infer<typeof CartDataSchema>
export type CartResponse = z.infer<typeof CartResponseSchema>
export type AddToCartRequest = z.infer<typeof AddToCartRequestSchema>
export type SetCartQuantityRequest = z.infer<typeof SetCartQuantityRequestSchema>
export type ApplyCouponRequest = z.infer<typeof ApplyCouponRequestSchema>
