"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import type { UpdateMeError } from "@/features/users/schemas/user-request.schema"
import {
  changeMyPassword,
  getUsers,
  updateMe,
} from "@/features/users/services/users.service"
import type {
  ChangeMyPasswordRequest,
  GetUsersParams,
  UpdateMeRequest,
} from "@/features/users/schemas/user-request.schema"

type ApiRequestError = AxiosError<ApiError | UpdateMeError>

export const usersQueryKeys = {
  all: ["users"] as const,
  lists: () => [...usersQueryKeys.all, "list"] as const,
  list: (params?: GetUsersParams) => [...usersQueryKeys.lists(), params] as const,
}

export function useUsers(params?: GetUsersParams) {
  return useQuery<unknown, ApiRequestError>({
    queryKey: usersQueryKeys.list(params),
    queryFn: () => getUsers(params),
  })
}

export function useChangeMyPassword() {
  return useMutation<void, ApiRequestError, ChangeMyPasswordRequest>({
    mutationFn: changeMyPassword,
  })
}

export function useUpdateMe() {
  return useMutation<void, ApiRequestError, UpdateMeRequest>({
    mutationFn: updateMe,
  })
}
