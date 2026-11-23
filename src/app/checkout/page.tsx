import type { Metadata } from "next"
import { CheckoutPage } from "@/features/checkout/components/checkout-page"

export const metadata: Metadata = { title: "Checkout | FreshCart", robots: { index: false, follow: false } }

export default function Page() {
  return <CheckoutPage />
}
