import type { Metadata } from "next"
import { ResetPasswordScreen } from "@/features/auth/components/auth-screens"

export const metadata: Metadata = { title: "Reset Password | FreshCart", robots: { index: false, follow: false } }

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams
  return <ResetPasswordScreen email={email} />
}
