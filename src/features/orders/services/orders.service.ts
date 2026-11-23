import { apiClient } from "@/api/client"
import { UserOrdersResponseSchema, type UserOrdersResponse } from "@/features/orders/schemas/order.schema"

function ordersProxyUrl(userId: string) {
  if (typeof window === "undefined") throw new Error("Orders are only available in the browser")
  return new URL(`/api/orders/user/${encodeURIComponent(userId)}`, window.location.origin).toString()
}

export async function getUserOrders(userId: string): Promise<UserOrdersResponse> {
  const response = await apiClient.get<unknown>(ordersProxyUrl(userId))
  return UserOrdersResponseSchema.parse(response.data)
}
