import { apiClient } from "@/api/client"
import {
  AddAddressSchema,
  AddressListResponseSchema,
  AddressSingleResponseSchema,
  type AddAddressInput,
} from "@/features/addresses/schemas/address.schema"

function addressesProxyUrl(addressId?: string) {
  if (typeof window === "undefined") {
    throw new Error("Address requests are only available in the browser")
  }
  const suffix = addressId ? `/${encodeURIComponent(addressId)}` : ""
  return new URL(`/api/addresses${suffix}`, window.location.origin).toString()
}

export async function addAddress(data: AddAddressInput): Promise<void> {
  const body = AddAddressSchema.parse(data)
  await apiClient.post<unknown>(addressesProxyUrl(), body, {
    headers: { "Content-Type": "application/json" },
  })
}

export async function removeAddress(addressId: string): Promise<void> {
  await apiClient.delete<unknown>(addressesProxyUrl(addressId))
}

export async function getAddressById(addressId: string) {
  const response = await apiClient.get<unknown>(
    addressesProxyUrl(addressId),
  )

  return AddressSingleResponseSchema.parse(response.data)
}

export async function getLoggedUserAddresses() {
  const response = await apiClient.get<unknown>(addressesProxyUrl())

  return AddressListResponseSchema.parse(response.data)
}
