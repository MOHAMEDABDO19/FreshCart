import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import { SignUpRequestSchema, SignUpResponseSchema } from "@/features/auth/schemas/auth-request.schema"
import { forwardAuthApiError, setAuthTokenCookie } from "@/features/auth/services/auth-route.utils"

export async function POST(request: Request) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid sign-up request body" }, { status: 400 })
  }
  const parsedBody = SignUpRequestSchema.safeParse(rawBody)
  if (!parsedBody.success) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid sign-up request body" }, { status: 400 })
  }
  const body = parsedBody.data

  try {
    const upstream = await apiClient.post<unknown>("/auth/signup", body)
    const result = SignUpResponseSchema.parse(upstream.data)
    const response = NextResponse.json({ message: result.message, user: result.user }, { status: upstream.status })
    setAuthTokenCookie(response, result.token)
    return response
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
