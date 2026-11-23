import { z } from "zod"

export const ChangeMyPasswordRequestSchema = z.object({
  currentPassword: z.string(),
  password: z.string(),
  rePassword: z.string(),
})

export const UpdateMeRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
})

export const UpdateMeErrorSchema = z.object({
  message: z.string(),
  errors: z.object({
    value: z.string(),
    msg: z.string(),
    param: z.string(),
    location: z.string(),
  }),
})

export type ChangeMyPasswordRequest = z.infer<
  typeof ChangeMyPasswordRequestSchema
>
export type UpdateMeRequest = z.infer<typeof UpdateMeRequestSchema>
export type UpdateMeError = z.infer<typeof UpdateMeErrorSchema>

export type GetUsersParams = {
  limit?: number
  keyword?: string
}
