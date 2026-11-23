import type { Metadata } from "next"
import { AccountLayout } from "@/features/account/components/account-layout"
import { AccountAddresses } from "@/features/account/components/account-addresses"

export const metadata: Metadata = { title: "My Addresses | FreshCart", robots: { index: false, follow: false } }

export default function AccountAddressesPage() {
  return <AccountLayout title="Addresses"><AccountAddresses /></AccountLayout>
}
