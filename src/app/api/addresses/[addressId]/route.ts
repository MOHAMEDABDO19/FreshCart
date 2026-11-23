import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { isMongoObjectId } from "@/api/route-id"

type RouteContext = { params: Promise<{ addressId: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  const { addressId } = await params
  if (!isMongoObjectId(addressId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid address id" }, { status: 400 })
  try {
    const response = await apiClient.get<unknown>(`/addresses/${encodeURIComponent(addressId)}`)
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { addressId } = await params
  if (!isMongoObjectId(addressId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid address id" }, { status: 400 })
  try {
    const response = await apiClient.delete<unknown>(`/addresses/${encodeURIComponent(addressId)}`)
    if (response.status === 204 || response.data === undefined) return new NextResponse(null, { status: response.status })
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
