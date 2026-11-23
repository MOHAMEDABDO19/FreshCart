import type { Metadata } from "next"
import { VerifyResetCodeScreen } from "@/features/auth/components/auth-screens"

export const metadata: Metadata = { title: "Verify Reset Code | FreshCart", robots: { index: false, follow: false } }

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams
  return <VerifyResetCodeScreen email={email} />
}
