import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { AUTH_TOKEN_COOKIE } from "@/api/server-auth-interceptor"

// TODO: the API success response shape has not been provided; keep it unvalidated.
export async function GET() {
  const token = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value
  if (!token) return new NextResponse(null, { status: 204 })

  try {
    const upstream = await apiClient.get<unknown>("/auth/verifyToken")
    return NextResponse.json(upstream.data, { status: upstream.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
