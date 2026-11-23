import { useQuery } from "@tanstack/react-query"
import { getCategories, getCategoryById, type GetCategoriesParams } from "@/features/categories/services/get-categories"

export const categoryQueryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryQueryKeys.all, "list"] as const,
  list: (params?: GetCategoriesParams) => [...categoryQueryKeys.lists(), params] as const,
  details: () => [...categoryQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryQueryKeys.details(), id] as const,
}

export function useCategories(params?: GetCategoriesParams) {
  return useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => getCategories(params),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCategoryById(id: string) {
  return useQuery({
    queryKey: categoryQueryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: id.length > 0,
  })
}
