import { apiClient } from "@/api/client"
import type {
  SignInClientResponse,
  SignUpClientResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SignInRequest,
  SignUpRequest,
  VerifyResetCodeRequest,
  VerifyTokenResponse,
} from "@/features/auth/schemas/auth-request.schema"
import {
  SignInClientResponseSchema,
  SignUpClientResponseSchema,
  VerifyTokenResponseSchema,
} from "@/features/auth/schemas/auth-request.schema"

function authProxyUrl(endpoint: string): string {
  if (typeof window === "undefined") {
    throw new Error("Auth proxy requests are only available in the browser")
  }

  return new URL(`/api/auth/${endpoint}`, window.location.origin).toString()
}

export async function signUp(body: SignUpRequest): Promise<SignUpClientResponse> {
  const response = await apiClient.post<SignUpClientResponse>(authProxyUrl("signup"), body, {
    headers: { "Content-Type": "application/json" },
  })
  return SignUpClientResponseSchema.parse(response.data)
}

export async function signIn(body: SignInRequest): Promise<SignInClientResponse> {
  const response = await apiClient.post<SignInClientResponse>(authProxyUrl("signin"), body, {
    headers: { "Content-Type": "application/json" },
  })
  return SignInClientResponseSchema.parse(response.data)
}

export async function forgotPassword(
  body: ForgotPasswordRequest,
): Promise<unknown> {
  const response = await apiClient.post<unknown>(
    "/auth/forgotPasswords",
    body,
    { headers: { "Content-Type": "application/json" } },
  )
  return response.data
}

export async function verifyResetCode(
  body: VerifyResetCodeRequest,
): Promise<unknown> {
  const response = await apiClient.post<unknown>(
    "/auth/verifyResetCode",
    body,
    { headers: { "Content-Type": "application/json" } },
  )
  return response.data
}

export async function resetPassword(
  body: ResetPasswordRequest,
): Promise<unknown> {
  const response = await apiClient.put<unknown>("/auth/resetPassword", body, {
    headers: { "Content-Type": "application/json" },
  })
  return response.data
}

export async function verifyToken(): Promise<VerifyTokenResponse> {
  const response = await apiClient.get<unknown>(authProxyUrl("verify-token"))
  return VerifyTokenResponseSchema.parse(response.data)
}
