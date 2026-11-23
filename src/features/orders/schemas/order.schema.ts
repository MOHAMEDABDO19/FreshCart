import { z } from "zod"
import { ShippingAddressSchema } from "@/features/checkout/schemas/checkout.schema"

export const OrderShippingAddressSchema = ShippingAddressSchema.extend({
  postalCode: z.string().nullish().transform((postalCode) => postalCode ?? ""),
})

// The API contract names these order fields. Line items use the cart's
// populated product shape, narrowed to the fields rendered in this page.
export const OrderLineSchema = z.object({
  _id: z.string().optional(),
  count: z.number().int().positive(),
  price: z.number(),
  product: z.object({
    _id: z.string(),
    title: z.string(),
    imageCover: z.string().url(),
  }).passthrough(),
}).passthrough()

export const OrderSchema = z.object({
  _id: z.string(),
  cartItems: z.array(OrderLineSchema),
  shippingAddress: OrderShippingAddressSchema,
  totalOrderPrice: z.number(),
  paymentMethodType: z.string(),
  isPaid: z.boolean(),
  isDelivered: z.boolean(),
  createdAt: z.string().datetime(),
}).passthrough()

// The provided response contract describes a raw array of orders.
export const UserOrdersResponseSchema = z.array(OrderSchema)

export type Order = z.infer<typeof OrderSchema>
export type OrderLine = z.infer<typeof OrderLineSchema>
export type UserOrdersResponse = z.infer<typeof UserOrdersResponseSchema>
