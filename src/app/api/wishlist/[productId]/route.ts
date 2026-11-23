import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { isMongoObjectId } from "@/api/route-id"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params
  if (!isMongoObjectId(productId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid product id" }, { status: 400 })
  try {
    const response = await apiClient.delete<unknown>(
      `/wishlist/${encodeURIComponent(productId)}`,
    )
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
