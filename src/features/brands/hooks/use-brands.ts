"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getBrandById,
  getAllBrands,
  getBrands,
  type GetBrandsParams,
} from "@/features/brands/services/get-brands"

export const brandQueryKeys = {
  all: ["brands"] as const,
  lists: () => [...brandQueryKeys.all, "list"] as const,
  list: (params?: GetBrandsParams) => [...brandQueryKeys.lists(), params] as const,
  details: () => [...brandQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...brandQueryKeys.details(), id] as const,
}

export function useBrands(params?: GetBrandsParams) {
  return useQuery({
    queryKey: brandQueryKeys.list(params),
    queryFn: () => params ? getBrands(params) : getAllBrands(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useBrandById(id: string) {
  return useQuery({
    queryKey: brandQueryKeys.detail(id),
    queryFn: () => getBrandById(id),
    enabled: id.length > 0,
  })
}
