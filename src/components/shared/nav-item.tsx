import type { ReactNode } from "react"
import Link from "next/link"

const sharedClasses = "inline-flex min-h-8 items-center text-xs text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"

type NavItemProps = {
  href?: string | null
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export function NavItem({ href, children, className = "", ariaLabel }: NavItemProps) {
  const classes = `${sharedClasses} ${className}`
  if (href) return <Link href={href} aria-label={ariaLabel} className={classes}>{children}</Link>
  return <span role="link" tabIndex={0} aria-label={ariaLabel} aria-disabled="true" className={`${sharedClasses} ${className} cursor-default hover:text-slate-400`}>
    {children}
  </span>
}
