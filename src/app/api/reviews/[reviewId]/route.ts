import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { ReviewRequestSchema } from "@/features/reviews/schemas/review.schema"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { isMongoObjectId } from "@/api/route-id"

type RouteContext = { params: Promise<{ reviewId: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
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

  const { reviewId } = await params
  if (!isMongoObjectId(reviewId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid review id" }, { status: 400 })
  try {
    const response = await apiClient.put<unknown>(`/reviews/${encodeURIComponent(reviewId)}`, parsed.data)
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { reviewId } = await params
  if (!isMongoObjectId(reviewId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid review id" }, { status: 400 })
  try {
    const response = await apiClient.delete<unknown>(`/reviews/${encodeURIComponent(reviewId)}`)
    if (response.status === 204 || response.data === undefined) return new NextResponse(null, { status: response.status })
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
