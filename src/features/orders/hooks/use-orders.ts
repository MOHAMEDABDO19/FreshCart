"use client"

import { useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import { getUserOrders } from "@/features/orders/services/orders.service"

export const orderQueryKeys = {
  all: ["orders"] as const,
  user: (userId: string) => [...orderQueryKeys.all, "user", userId] as const,
}

export function useUserOrders(userId: string | null) {
  return useQuery({
    queryKey: orderQueryKeys.user(userId ?? ""),
    queryFn: () => getUserOrders(userId ?? ""),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
    retry: (failureCount, error: AxiosError<ApiError>) => error.response?.status !== 401 && failureCount < 2,
  })
}
