import "server-only"

import { cookies } from "next/headers"
import { apiClient } from "@/api/client"

export const AUTH_TOKEN_COOKIE = "freshcart_auth_token"

// Route handlers import this module before calling the shared API client.
apiClient.interceptors.request.use(async (config) => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value

  if (token) {
    config.headers.set("token", token)
  }

  return config
})
