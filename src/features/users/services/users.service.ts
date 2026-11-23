import { apiClient } from "@/api/client"
import type {
  ChangeMyPasswordRequest,
  GetUsersParams,
  UpdateMeRequest,
} from "@/features/users/schemas/user-request.schema"
import { ChangeMyPasswordRequestSchema, UpdateMeRequestSchema } from "@/features/users/schemas/user-request.schema"

function usersProxyUrl(endpoint: string): string {
  if (typeof window === "undefined") throw new Error("User requests are only available in the browser")
  return new URL(`/api/users/${endpoint}`, window.location.origin).toString()
}

// Success response shapes are pending real API examples.
export async function changeMyPassword(
  body: ChangeMyPasswordRequest,
): Promise<void> {
  const payload = ChangeMyPasswordRequestSchema.parse(body)
  await apiClient.put<unknown>(usersProxyUrl("changeMyPassword"), payload, {
    headers: { "Content-Type": "application/json" },
  })
}

export async function updateMe(
  body: UpdateMeRequest,
): Promise<void> {
  const payload = UpdateMeRequestSchema.parse(body)
  await apiClient.put<unknown>(usersProxyUrl("updateMe"), payload, {
    headers: { "Content-Type": "application/json" },
  })
}

export async function getUsers(params?: GetUsersParams): Promise<unknown> {
  const response = await apiClient.get<unknown>("/users", {
    params,
    paramsSerializer: {
      encode: (value) => encodeURIComponent(value),
    },
  })
  return response.data
}
