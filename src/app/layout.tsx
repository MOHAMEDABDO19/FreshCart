import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Providers } from "@/providers"
import { ScrollControls } from "@/components/shared/scroll-controls"
import { ToastViewport } from "@/components/shared/toast-viewport"
import NextLink from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "FreshCart | Shop Fresh, Live Better",
  description: "Shop quality products across FreshCart categories.",
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08a950",
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans text-slate-800">
        <Providers>
          <ScrollControls />
          <ToastViewport />
          <NextLink href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-slate-900 focus:shadow-lg">Skip to main content</NextLink>
          {children}
        </Providers>
      </body>
    </html>
  )
}
