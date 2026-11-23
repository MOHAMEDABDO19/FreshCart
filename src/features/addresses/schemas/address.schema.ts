import { z } from "zod"

export const AddressSchema = z.object({
  _id: z.string(),
  name: z.string(),
  details: z.string(),
  phone: z.string(),
  city: z.string(),
})

export const AddAddressSchema = z.object({
  name: z.string(),
  details: z.string(),
  phone: z.string(),
  city: z.string(),
})

export const AddressListResponseSchema = z.object({
  status: z.string(),
  results: z.number().optional(),
  data: z.array(AddressSchema),
})

export const AddressMutationResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(AddressSchema),
})

export const AddressSingleResponseSchema = z.object({
  status: z.string(),
  data: AddressSchema.nullable(),
})

export type Address = z.infer<typeof AddressSchema>
export type AddAddressInput = z.infer<typeof AddAddressSchema>
export type AddressListResponse = z.infer<typeof AddressListResponseSchema>
export type AddressMutationResponse = z.infer<
  typeof AddressMutationResponseSchema
>
export type AddressSingleResponse = z.infer<typeof AddressSingleResponseSchema>
