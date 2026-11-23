import type { Metadata } from "next"
import { CartPage } from "@/features/cart/components/cart-page"

export const metadata: Metadata = { title: "Shopping Cart | FreshCart", robots: { index: false, follow: false } }

export default function Page() {
  return <CartPage />
}
