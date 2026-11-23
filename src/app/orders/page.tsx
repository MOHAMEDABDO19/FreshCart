import type { Metadata } from "next"
import { OrdersPage } from "@/features/orders/components/orders-page"

export const metadata: Metadata = { title: "My Orders | FreshCart", robots: { index: false, follow: false } }

export default function Page() {
  return <OrdersPage />
}
