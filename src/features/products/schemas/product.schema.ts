import { z } from "zod"
import {
  createApiListResponseSchema,
  createApiSingleResponseSchema,
} from "@/schemas/api.schema"

export const ProductSubCategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string(),
})

export const ProductCategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().url(),
})

export const ProductBrandSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().url(),
})

export const ProductSchema = z.object({
  sold: z.number(),
  images: z.array(z.string().url()),
  subcategory: z.array(ProductSubCategorySchema),
  ratingsQuantity: z.number(),
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  quantity: z.number(),
  price: z.number(),
  priceAfterDiscount: z.number().optional(),
  imageCover: z.string().url(),
  category: ProductCategorySchema,
  brand: ProductBrandSchema,
  ratingsAverage: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  id: z.string().optional(),
})

export const ProductDetailsReviewSchema = z.object({
  _id: z.string(),
  review: z.string(),
  rating: z.number(),
  product: z.string(),
  user: z.object({ _id: z.string(), name: z.string() }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  __v: z.number().optional(),
})

export const ProductDetailsSchema = ProductSchema.extend({
  reviews: z.array(ProductDetailsReviewSchema),
  __v: z.number().optional(),
  priceAfterDiscount: z.number().optional(),
  availableColors: z.array(z.string()).optional(),
})

export const ProductsResponseSchema = createApiListResponseSchema(ProductSchema)
export const ProductDetailsResponseSchema =
  createApiSingleResponseSchema(ProductDetailsSchema)
export const ProductProjectionSchema = ProductSchema.partial()
export const ProductProjectionResponseSchema = createApiListResponseSchema(
  ProductProjectionSchema,
)

export type ProductSubCategory = z.infer<typeof ProductSubCategorySchema>
export type ProductCategory = z.infer<typeof ProductCategorySchema>
export type ProductBrand = z.infer<typeof ProductBrandSchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductDetailsReview = z.infer<typeof ProductDetailsReviewSchema>
export type ProductDetails = z.infer<typeof ProductDetailsSchema>
export type ProductDetailsResponse = z.infer<typeof ProductDetailsResponseSchema>
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>
export type ProductProjection = z.infer<typeof ProductProjectionSchema>
export type ProductProjectionResponse = z.infer<
  typeof ProductProjectionResponseSchema
>
