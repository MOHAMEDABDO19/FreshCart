import type { Metadata } from "next"
import { AccountLayout } from "@/features/account/components/account-layout"
import { AccountSettings } from "@/features/account/components/account-settings"

export const metadata: Metadata = { title: "Account Settings | FreshCart", robots: { index: false, follow: false } }

export default function AccountSettingsPage() {
  return <AccountLayout title="Settings"><AccountSettings /></AccountLayout>
}
