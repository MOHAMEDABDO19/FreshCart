"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ApiError } from "@/schemas/api-error.schema"
import {
  addAddress,
  getAddressById,
  getLoggedUserAddresses,
  removeAddress,
} from "@/features/addresses/services/addresses.service"
import type {
  AddAddressInput,
  AddressListResponse,
  AddressSingleResponse,
} from "@/features/addresses/schemas/address.schema"
import { showToast } from "@/store/toast-store"

type ApiRequestError = AxiosError<ApiError>

export const addressQueryKeys = {
  all: ["addresses"] as const,
  lists: () => [...addressQueryKeys.all, "list"] as const,
  list: () => [...addressQueryKeys.lists()] as const,
  details: () => [...addressQueryKeys.all, "detail"] as const,
  detail: (addressId: string) => [...addressQueryKeys.details(), addressId] as const,
}

export function useAddresses() {
  return useQuery<AddressListResponse, ApiRequestError>({
    queryKey: addressQueryKeys.list(),
    queryFn: getLoggedUserAddresses,
    staleTime: 60 * 1000,
  })
}

export function useAddressById(addressId: string) {
  return useQuery<AddressSingleResponse, ApiRequestError>({
    queryKey: addressQueryKeys.detail(addressId),
    queryFn: () => getAddressById(addressId),
    enabled: addressId.length > 0,
    staleTime: 60 * 1000,
  })
}

export function useAddAddress() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    ApiRequestError,
    AddAddressInput
  >({
    mutationFn: addAddress,
    onSuccess: async () => {
      showToast("Address added successfully.")
      await queryClient.refetchQueries({ queryKey: addressQueryKeys.lists(), type: "active" })
    },
    onError: () => showToast("We couldn’t save your address. Please try again.", "error"),
  })
}

export function useRemoveAddress() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    ApiRequestError,
    string
  >({
    mutationFn: removeAddress,
    onSuccess: async () => {
      showToast("Address removed successfully.")
      await queryClient.refetchQueries({ queryKey: addressQueryKeys.lists(), type: "active" })
    },
    onError: () => showToast("We couldn’t remove your address. Please try again.", "error"),
  })
}
