import { z } from "zod"

export const ShippingAddressSchema = z.object({
  details: z.string().trim().min(1, "Enter your address details."),
  phone: z.string().trim().min(1, "Enter a phone number."),
  city: z.string().trim().min(1, "Enter your city."),
  postalCode: z.string().trim().min(1, "Enter your postal code."),
})

export const CashOrderRequestSchema = z.object({
  shippingAddress: ShippingAddressSchema,
})

export const StripeCheckoutResponseSchema = z.object({
  status: z.literal("success"),
  session: z.object({ url: z.string().url() }),
})

export type ShippingAddressInput = z.infer<typeof ShippingAddressSchema>
export type CashOrderRequest = z.infer<typeof CashOrderRequestSchema>
export type StripeCheckoutResponse = z.infer<typeof StripeCheckoutResponseSchema>
