import { z } from "zod"

export const SignUpRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  rePassword: z.string(),
  phone: z.string(),
})

export const SignInRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
})

export const ForgotPasswordRequestSchema = z.object({
  email: z.string(),
})

export const VerifyResetCodeRequestSchema = z.object({
  resetCode: z.string(),
})

export const ResetPasswordRequestSchema = z.object({
  email: z.string(),
  newPassword: z.string(),
})

const AuthUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.string(),
})

// Signup and signin currently have matching documented shapes, but remain
// separate schemas so either endpoint can evolve independently.
export const SignUpResponseSchema = z.object({
  message: z.literal("success"),
  user: AuthUserSchema,
  token: z.string().min(1),
})

export const SignInResponseSchema = z.object({
  message: z.literal("success"),
  user: AuthUserSchema,
  token: z.string().min(1),
})

export const VerifyTokenResponseSchema = z.object({
  message: z.literal("verified"),
  decoded: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    iat: z.number(),
    exp: z.number(),
  }),
})

export const SignUpClientResponseSchema = SignUpResponseSchema.omit({ token: true })
export const SignInClientResponseSchema = SignInResponseSchema.omit({ token: true })

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>
export type SignInRequest = z.infer<typeof SignInRequestSchema>
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>
export type VerifyResetCodeRequest = z.infer<
  typeof VerifyResetCodeRequestSchema
>
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>
export type SignUpResponse = z.infer<typeof SignUpResponseSchema>
export type SignInResponse = z.infer<typeof SignInResponseSchema>
export type VerifyTokenResponse = z.infer<typeof VerifyTokenResponseSchema>
export type SignUpClientResponse = z.infer<typeof SignUpClientResponseSchema>
export type SignInClientResponse = z.infer<typeof SignInClientResponseSchema>
