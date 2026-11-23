"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import {
  forgotPassword,
  resetPassword,
  signIn,
  signUp,
  verifyResetCode,
  verifyToken,
} from "@/features/auth/services/auth.service"
import type {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SignInRequest,
  SignUpRequest,
  VerifyResetCodeRequest,
} from "@/features/auth/schemas/auth-request.schema"
import type { SignInClientResponse, SignUpClientResponse, VerifyTokenResponse } from "@/features/auth/schemas/auth-request.schema"
import { useAuthStore } from "@/store/auth-store"
import { showToast } from "@/store/toast-store"

type ApiRequestError = AxiosError<ApiError>

export const authQueryKeys = {
  all: ["auth"] as const,
  verifyToken: () => [...authQueryKeys.all, "verify-token"] as const,
}

export function useSignUp() {
  const queryClient = useQueryClient()
  return useMutation<SignUpClientResponse, ApiRequestError, SignUpRequest>({
    mutationFn: signUp,
    onSuccess: async ({ user }) => {
      useAuthStore.getState().setUser(user)
      showToast("Your account was created successfully.")
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.verifyToken() })
    },
    onError: () => showToast("We couldn’t create your account. Please try again.", "error"),
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation<SignInClientResponse, ApiRequestError, SignInRequest>({
    mutationFn: signIn,
    onSuccess: async ({ user }) => {
      useAuthStore.getState().setUser(user)
      showToast("Successfully logged in.")
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.verifyToken() })
    },
    onError: () => showToast("We couldn’t sign you in. Check your details and try again.", "error"),
  })
}

export function useForgotPassword() {
  return useMutation<unknown, ApiRequestError, ForgotPasswordRequest>({ mutationFn: forgotPassword })
}

export function useVerifyResetCode() {
  return useMutation<unknown, ApiRequestError, VerifyResetCodeRequest>({ mutationFn: verifyResetCode })
}

export function useResetPassword() {
  return useMutation<unknown, ApiRequestError, ResetPasswordRequest>({ mutationFn: resetPassword })
}

export function useVerifyToken(enabled = true) {
  return useQuery<VerifyTokenResponse, ApiRequestError>({
    queryKey: authQueryKeys.verifyToken(),
    queryFn: verifyToken,
    enabled,
    retry: false,
    gcTime: Infinity,
  })
}
