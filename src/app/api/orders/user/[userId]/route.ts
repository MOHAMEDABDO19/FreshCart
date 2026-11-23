import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { apiClient } from "@/api/client"
import { AUTH_TOKEN_COOKIE } from "@/api/server-auth-interceptor"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { isMongoObjectId } from "@/api/route-id"

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  if (!isMongoObjectId(userId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid user ID." }, { status: 400 })
  if (!(await cookies()).has(AUTH_TOKEN_COOKIE)) return NextResponse.json({ statusMsg: "fail", message: "Sign in to view your orders." }, { status: 401 })

  try {
    const response = await apiClient.get<unknown>(`/orders/user/${encodeURIComponent(userId)}`)
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
