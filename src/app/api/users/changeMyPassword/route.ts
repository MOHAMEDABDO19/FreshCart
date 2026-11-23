import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { ChangeMyPasswordRequestSchema } from "@/features/users/schemas/user-request.schema"

export async function PUT(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid password request body" }, { status: 400 })
  }

  const parsed = ChangeMyPasswordRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid password request body" }, { status: 400 })
  }

  try {
    const response = await apiClient.put<unknown>("/users/changeMyPassword", parsed.data)
    return new NextResponse(null, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
