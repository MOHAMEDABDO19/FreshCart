import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { AddAddressSchema } from "@/features/addresses/schemas/address.schema"

export async function GET() {
  try {
    const response = await apiClient.get<unknown>("/addresses")
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid address request body" }, { status: 400 })
  }

  const parsed = AddAddressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid address request body" }, { status: 400 })
  }

  try {
    const response = await apiClient.post<unknown>("/addresses", parsed.data)
    if (response.status === 204 || response.data === undefined) return new NextResponse(null, { status: response.status })
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
