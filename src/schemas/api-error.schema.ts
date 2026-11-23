import { z } from "zod"

export const ApiErrorSchema = z.object({
  statusMsg: z.enum(["fail", "error"]),
  message: z.string(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>
