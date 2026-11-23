import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { ReviewRequestSchema } from "@/features/reviews/schemas/review.schema"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { isMongoObjectId } from "@/api/route-id"

type RouteContext = { params: Promise<{ productId: string }> }

export async function POST(request: Request, { params }: RouteContext) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid review request body" }, { status: 400 })
  }
  const parsed = ReviewRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid review request body" }, { status: 400 })
  }

  const { productId } = await params
  if (!isMongoObjectId(productId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid product id" }, { status: 400 })
  try {
    const response = await apiClient.post<unknown>(`/products/${encodeURIComponent(productId)}/reviews`, parsed.data)
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
