import { NextResponse } from "next/server"

export async function POST() {
  const response = new NextResponse(null, { status: 204 })
  response.cookies.set("freshcart_auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
