"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  getAllSubCategories,
  type GetSubCategoriesParams,
} from "@/features/subcategories/services/get-subcategories"

export const subCategoryQueryKeys = {
  all: ["subcategories"] as const,
  lists: () => [...subCategoryQueryKeys.all, "list"] as const,
  list: (params?: GetSubCategoriesParams) =>
    [...subCategoryQueryKeys.lists(), params] as const,
  details: () => [...subCategoryQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...subCategoryQueryKeys.details(), id] as const,
  byCategory: (categoryId: string) =>
    [...subCategoryQueryKeys.all, "category", categoryId] as const,
  allItems: () => [...subCategoryQueryKeys.all, "all-items"] as const,
}

export function useSubCategories(params?: GetSubCategoriesParams) {
  return useQuery({
    queryKey: subCategoryQueryKeys.list(params),
    queryFn: () => getSubCategories(params),
  })
}

export function useSubCategoryById(id: string) {
  return useQuery({
    queryKey: subCategoryQueryKeys.detail(id),
    queryFn: () => getSubCategoryById(id),
    enabled: id.length > 0,
  })
}

export function useSubCategoriesByCategory(categoryId: string) {
  return useQuery({
    queryKey: subCategoryQueryKeys.byCategory(categoryId),
    queryFn: () => getSubCategoriesByCategory(categoryId),
    enabled: categoryId.length > 0,
  })
}

export function useAllSubCategories(enabled = true) {
  return useQuery({
    queryKey: subCategoryQueryKeys.allItems(),
    queryFn: getAllSubCategories,
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}
