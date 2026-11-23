import type { Metadata } from "next"
import { SignInScreen } from "@/features/auth/components/auth-screens"

export const metadata: Metadata = { title: "Sign In | FreshCart", robots: { index: false, follow: false } }

export default function LoginPage() {
  return <SignInScreen />
}
