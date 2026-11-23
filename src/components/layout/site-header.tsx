"use client"

import {
  ChevronDown,
  MapPin,
  Settings,
  UserRound,
  Heart,
  ShoppingCart,
  Gift,
  Headset,
  LogIn,
  LogOut,
  Mail,
  Menu,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { HeaderData } from "@/features/home/types/home-page.types"
import { Container } from "@/components/layout/container"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CloseButton } from "@/components/shared/close-button"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useAllSubCategories } from "@/features/subcategories/hooks/use-subcategories"
import type { SubCategory } from "@/features/subcategories/schemas/subcategory.schema"
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist"
import { useAuthStore } from "@/store/auth-store"
import { showToast } from "@/store/toast-store"
import { useCart } from "@/features/cart/hooks/use-cart"
import { ROUTES, categoryPath, loginRedirectPath, subcategoryBrowsePath } from "@/constants/routes"
import type { Category } from "@/features/categories/schemas/category.schema"

const signedInAccountLinks = [
  { label: "My Profile", href: ROUTES.accountProfile, icon: UserRound },
  { label: "My Wishlist", href: ROUTES.wishlist, icon: Heart },
  { label: "My Orders", href: ROUTES.orders, icon: PackageCheck },
  { label: "Addresses", href: ROUTES.accountAddresses, icon: MapPin },
  { label: "Settings", href: ROUTES.accountSettings, icon: Settings },
  { label: "Cart", href: ROUTES.cart, icon: ShoppingCart },
] as const

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U"
}

function CategoryMenuRows({ categories, groupedSubcategories, expandedId, onExpand, onChoose, mobile = false }: {
  categories: Category[]
  groupedSubcategories: Map<string, SubCategory[]>
  expandedId: string | null
  onExpand: (id: string) => void
  onChoose: () => void
  mobile?: boolean
}) {
  return <ul aria-label="Categories" className="space-y-0.5">
    {categories.slice(0, 4).map((category) => {
      const expanded = expandedId === category._id
      const subcategories = groupedSubcategories.get(category._id) ?? []
      const hasSubcategories = subcategories.length > 0
      const subcategoryListId = `category-subcategories-${category._id}`
      return <li key={category._id} className="min-w-0">
        <div className="flex min-w-0 items-center gap-1">
          <Link data-category-menu-item href={categoryPath(category._id)} onClick={onChoose} className={`flex ${mobile ? "min-h-11 text-sm" : "min-h-9 text-[13px]"} min-w-0 flex-1 items-center truncate rounded-md px-2 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`} title={category.name}>{category.name}</Link>
          {hasSubcategories ? <button type="button" data-category-menu-item aria-label={`${expanded ? "Collapse" : "Expand"} ${category.name} subcategories`} aria-expanded={expanded} aria-controls={subcategoryListId} onClick={() => onExpand(category._id)} className={`flex ${mobile ? "size-11" : "size-9"} shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`}><ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : "-rotate-90"}`} aria-hidden="true" /></button> : null}
        </div>
        {hasSubcategories ? <div id={subcategoryListId} hidden={!expanded} className="mb-1 ml-3"><ul className="border-l border-slate-200 pl-3" aria-label={`${category.name} subcategories`}>{subcategories.length ? subcategories.map((subcategory) => <li key={subcategory._id}><Link data-category-menu-item href={subcategoryBrowsePath(subcategory._id, subcategory.category)} onClick={onChoose} className={`flex ${mobile ? "min-h-11 text-sm" : "min-h-9 text-xs"} items-center truncate rounded-md px-2 py-2 text-slate-600 transition-colors hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`} title={subcategory.name}>{subcategory.name}</Link></li>) : <li className="py-2 text-xs text-slate-500">No subcategories yet.</li>}</ul></div> : null}
      </li>
    })}
  </ul>
}

export function SiteHeader({ data }: { data: HeaderData }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [subcategoriesRequested, setSubcategoriesRequested] = useState(false)
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const logout = useAuthStore((state) => state.logout)
  const wishlist = useWishlist(authReady && Boolean(user))
  const wishlistCount = wishlist.data?.data.length ?? 0
  const cart = useCart(authReady && Boolean(user))
  const cartCount = cart.data?.numOfCartItems ?? 0
  const categories = useCategories()
  const allSubcategories = useAllSubCategories(subcategoriesRequested)
  const groupedSubcategories = useMemo(() => {
    const grouped = new Map<string, SubCategory[]>()
    allSubcategories.data?.forEach((subcategory) => {
      const categoryItems = grouped.get(subcategory.category) ?? []
      categoryItems.push(subcategory)
      grouped.set(subcategory.category, categoryItems)
    })
    return grouped
  }, [allSubcategories.data])
  const router = useRouter()
  const pathname = usePathname()
  const accountTriggerRef = useRef<HTMLButtonElement>(null)
  const accountRootRef = useRef<HTMLDivElement>(null)
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const homeLinkRef = useRef<HTMLAnchorElement>(null)
  const signOutTriggerRef = useRef<HTMLElement | null>(null)
  const categoryTriggerRef = useRef<HTMLButtonElement>(null)
  const categoryPanelRef = useRef<HTMLDivElement>(null)
  const categoryRootRef = useRef<HTMLDivElement>(null)

  const requestSignOut = (trigger: HTMLButtonElement) => {
    signOutTriggerRef.current = trigger
    setConfirmSignOutOpen(true)
  }

  const confirmSignOut = async () => {
    signOutTriggerRef.current = homeLinkRef.current
    setAccountOpen(false)
    setMenuOpen(false)
    await logout()
    showToast("Successfully logged out.")
    router.replace(ROUTES.home)
  }

  const closeMobileMenu = (returnFocus = true) => {
    setMenuOpen(false)
    if (returnFocus) window.requestAnimationFrame(() => mobileMenuTriggerRef.current?.focus())
  }

  const closeCategories = () => {
    setCategoriesOpen(false)
    setMobileCategoriesOpen(false)
    setExpandedCategoryId(null)
  }

  const toggleDesktopCategories = () => {
    setAccountOpen(false)
    setMenuOpen(false)
    setMobileCategoriesOpen(false)
    setSubcategoriesRequested(true)
    setCategoriesOpen((open) => !open)
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAccountOpen(false)
      setCategoriesOpen(false)
      setMobileCategoriesOpen(false)
      setExpandedCategoryId(null)
      setMenuOpen(false)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>("#mobile-navigation a[href], #mobile-navigation button:not([disabled]), #mobile-navigation input:not([disabled])")?.focus())
    const closeOnEscape = (event: KeyboardEvent) => {
      const menu = document.getElementById("mobile-navigation")
      const focusable = menu?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])')
      if (event.key === "Escape") {
        setMenuOpen(false)
        window.requestAnimationFrame(() => mobileMenuTriggerRef.current?.focus())
      } else if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!accountOpen) return
    requestAnimationFrame(() => accountRootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus())
    const closeOutside = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && !accountRootRef.current?.contains(target)) {
        setAccountOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false)
        accountTriggerRef.current?.focus()
      }
    }
    document.addEventListener("keydown", closeOnEscape)
    document.addEventListener("pointerdown", closeOutside)
    return () => {
      document.removeEventListener("keydown", closeOnEscape)
      document.removeEventListener("pointerdown", closeOutside)
    }
  }, [accountOpen])

  useEffect(() => {
    if (!categoriesOpen) return
    const closeOutside = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && !categoryRootRef.current?.contains(target)) closeCategories()
    }
    document.addEventListener("pointerdown", closeOutside)
    return () => document.removeEventListener("pointerdown", closeOutside)
  }, [categoriesOpen])

  const categoryMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      closeCategories()
      categoryTriggerRef.current?.focus()
      return
    }
    if (["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      event.preventDefault()
      const items = categoryPanelRef.current?.querySelectorAll<HTMLElement>("[data-category-menu-item]")
      if (!items?.length) return
      const activeIndex = Array.from(items).indexOf(document.activeElement as HTMLElement)
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : ["ArrowDown", "ArrowRight"].includes(event.key)
        ? (activeIndex + 1) % items.length
        : (activeIndex <= 0 ? items.length - 1 : activeIndex - 1)
      items[next]?.focus()
    }
  }

  const accountMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setAccountOpen(false)
      accountTriggerRef.current?.focus()
      return
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const items = accountRootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')
    if (!items?.length) return
    const activeIndex = Array.from(items).indexOf(document.activeElement as HTMLElement)
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown"
      ? (activeIndex + 1) % items.length
      : (activeIndex <= 0 ? items.length - 1 : activeIndex - 1)
    items[next]?.focus()
  }

  useEffect(() => {
    const updateCompact = () => setCompact(window.scrollY > 40)
    updateCompact()
    window.addEventListener("scroll", updateCompact, { passive: true })
    return () => window.removeEventListener("scroll", updateCompact)
  }, [])

  return (
    <>
      <div className="hidden border-b border-slate-100 lg:block">
        <Container className="flex h-9 items-center justify-between gap-4 whitespace-nowrap text-[11px] text-slate-500 xl:text-xs">
          <div className="flex min-w-0 items-center gap-5 xl:gap-7">
            <span className="inline-flex items-center gap-2"><Truck className="size-3.5 shrink-0 text-brand" aria-hidden="true" />{data.announcements[0]}</span>
            <span className="inline-flex items-center gap-2"><Gift className="size-3.5 shrink-0 text-brand" aria-hidden="true" />{data.announcements[1]}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3 xl:gap-5">
            <a aria-label={`Email FreshCart support at ${data.email}`} className="inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-brand" href={`mailto:${data.email}`}><Mail className="size-3 shrink-0" aria-hidden="true" /><span className="max-w-52 truncate xl:max-w-none">{data.email}</span></a>
            {authReady ? user ? <><span className="inline-flex max-w-28 items-center gap-1 truncate"><UserRound className="size-3 shrink-0" aria-hidden="true" />{user.name}</span><button type="button" onClick={(event) => requestSignOut(event.currentTarget)} className="inline-flex items-center gap-1 text-red-600 transition-colors hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><LogOut className="size-3" aria-hidden="true" />Sign Out</button></> : <><Link className="inline-flex items-center gap-1 transition-colors hover:text-brand" href={ROUTES.login}><LogIn className="size-3" aria-hidden="true" />Sign In</Link><Link className="inline-flex items-center gap-1 transition-colors hover:text-brand" href={ROUTES.register}><UserRound className="size-3" aria-hidden="true" />Sign Up</Link></> : <span className="inline-flex h-5 w-[132px] items-center gap-3" aria-label="Loading account"><span className="loading-skeleton h-3 w-14 rounded" /><span className="loading-skeleton h-3 w-14 rounded" /></span>}
          </div>
        </Container>
      </div>

      <header className={`sticky top-0 z-50 h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 ${compact ? "shadow-[0_2px_14px_rgba(15,23,42,0.08)]" : "shadow-[0_2px_14px_rgba(15,23,42,0.04)]"}`}>
      <Container className={`motion-navbar-inner flex items-center gap-3 sm:gap-4 lg:flex-nowrap lg:gap-5 ${compact ? "h-14" : "h-16"}`}>
        <Link ref={homeLinkRef} className="flex shrink-0 items-center gap-1.5 text-xl font-bold tracking-tight text-slate-800 sm:text-2xl lg:text-[25px]" href={ROUTES.home} aria-label="FreshCart home">
          <ShoppingCart className="size-6 text-brand" strokeWidth={2.2} aria-hidden="true" />
          <span>FreshCart</span>
        </Link>

        <form action={ROUTES.products} className="relative hidden min-w-0 flex-1 sm:block" role="search">
          <label className="sr-only" htmlFor="site-search">Search products, brands and more</label>
          <input id="site-search" name="keyword" type="search" placeholder="Search for products, brands and more..." className="h-11 w-full rounded-full border border-slate-200 bg-slate-50/60 pl-5 pr-14 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition-shadow focus-visible:border-brand/50 focus-visible:ring-4 focus-visible:ring-brand/10" />
          <button type="submit" aria-label="Search" className="motion-button absolute right-1 top-1.5 flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:scale-105 hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
            <Search className="size-4" aria-hidden="true" />
          </button>
        </form>

        <nav aria-label="Main navigation" className="hidden items-center gap-3 text-sm font-medium text-slate-700 lg:flex xl:gap-4 2xl:gap-6">
          {data.navigation.map((item) => item.label === "Categories" ? (
            <div key={item.label} ref={categoryRootRef} className="relative">
              <button ref={categoryTriggerRef} type="button" aria-haspopup="true" aria-expanded={categoriesOpen} aria-controls="desktop-category-menu" onClick={toggleDesktopCategories} onKeyDown={(event) => { if (event.key === "Escape") closeCategories(); if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setSubcategoriesRequested(true); setCategoriesOpen(true); requestAnimationFrame(() => { const items = categoryPanelRef.current?.querySelectorAll<HTMLElement>("[data-category-menu-item]"); (event.key === "ArrowUp" ? items?.[items.length - 1] : items?.[0])?.focus() }) } }} className={`group relative inline-flex items-center gap-1 py-2 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${pathname.startsWith(ROUTES.categories) ? "text-brand" : ""}`}>
                Categories <ChevronDown className={`size-3.5 transition-transform duration-150 ${categoriesOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-brand transition-transform duration-200 group-hover:scale-x-100" />
              </button>
              {categoriesOpen ? <div id="desktop-category-menu" ref={categoryPanelRef} role="region" aria-label="Browse categories" onKeyDown={categoryMenuKeyDown} className="motion-menu menu-scrollbar absolute right-0 top-full z-[70] mt-2 max-h-[70vh] w-[min(280px,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-100 bg-white p-2 shadow-lg">
                <div className="mb-1 border-b border-slate-100 px-2 pb-2 pt-1 text-xs font-semibold text-slate-800">Categories</div>
                {categories.isPending ? <ul role="status" aria-label="Loading categories" className="space-y-1 p-1">{Array.from({ length: 7 }, (_, index) => <li key={index} className="py-2"><span className="loading-skeleton block h-3.5 w-4/5 rounded" /></li>)}</ul> : categories.isError ? <div role="alert" className="px-2 py-3 text-xs text-red-600">Categories could not be loaded.<button type="button" onClick={() => void categories.refetch()} className="ml-1 font-semibold underline">Retry</button></div> : categories.data.data.length === 0 ? <p className="px-2 py-3 text-xs text-slate-500">No categories available.</p> : <CategoryMenuRows categories={categories.data.data} groupedSubcategories={groupedSubcategories} expandedId={expandedCategoryId} onExpand={(id) => setExpandedCategoryId((current) => current === id ? null : id)} onChoose={closeCategories} />}
                {allSubcategories.isPending ? <div className="px-2 pb-2" role="status" aria-label="Loading subcategories"><span className="loading-skeleton block h-3.5 w-2/3 rounded" /></div> : null}
                {allSubcategories.isError ? <div role="alert" className="px-2 pb-2 text-xs text-red-600">Subcategories could not be loaded.<button type="button" onClick={() => void allSubcategories.refetch()} className="ml-1 font-semibold underline">Retry</button></div> : null}
                <Link href={ROUTES.categories} onClick={closeCategories} className="mt-1 flex min-h-9 items-center rounded-md border-t border-slate-100 px-2 pt-1 text-xs font-semibold text-brand hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">View all categories</Link>
              </div> : null}
            </div>
          ) : (
            <Link key={item.label} href={item.href} aria-current={pathname === item.href || (item.href !== ROUTES.home && pathname.startsWith(item.href)) ? "page" : undefined} className={`group relative inline-flex items-center gap-1 py-2 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${pathname === item.href || (item.href !== ROUTES.home && pathname.startsWith(item.href)) ? "text-brand" : ""}`}>
              {item.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-brand transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <a aria-label={`Email FreshCart support at ${data.email}`} href={`mailto:${data.email}`} className="hidden items-center gap-2 border-r border-slate-200 pr-4 text-xs text-slate-500 2xl:flex">
          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-brand"><Headset className="size-4" aria-hidden="true" /></span>
          <span className="max-w-40 break-all">{data.email}<br /><strong className="font-semibold text-slate-700">24/7 Help</strong></span>
        </a>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 text-slate-500 sm:gap-3">
          {authReady && user ? <Link href={ROUTES.wishlist} aria-label={`Wishlist${wishlist.isSuccess ? `, ${wishlistCount} items` : ""}`} className="relative rounded-full p-2 transition hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><Heart className="size-5" aria-hidden="true" />{wishlist.isSuccess ? <span key={wishlistCount} className="motion-badge-bounce absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">{wishlistCount}</span> : wishlist.isPending ? <span className="loading-skeleton absolute -right-0.5 -top-0.5 size-4 rounded-full" aria-hidden="true" /> : null}</Link> : <Link href={loginRedirectPath(ROUTES.wishlist)} aria-label="Wishlist, sign in to view" className="relative rounded-full p-2 transition hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><Heart className="size-5" aria-hidden="true" />{!authReady ? <span className="loading-skeleton absolute -right-0.5 -top-0.5 size-4 rounded-full" aria-hidden="true" /> : null}</Link>}
          {authReady && user ? <Link href={ROUTES.cart} aria-label={`Shopping cart, ${cart.isSuccess ? cartCount : "loading"} items`} className="relative rounded-full p-2 transition hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><ShoppingCart className="size-5" aria-hidden="true" />{cart.isSuccess ? <span key={cartCount} className="motion-badge-bounce absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-4 text-white">{cartCount}</span> : cart.isPending ? <span className="loading-skeleton absolute -right-0.5 -top-0.5 size-4 rounded-full" aria-hidden="true" /> : null}</Link> : <Link href={loginRedirectPath(ROUTES.cart)} aria-label="Shopping cart, sign in to view" className="relative rounded-full p-2 transition hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><ShoppingCart className="size-5" aria-hidden="true" />{!authReady ? <span className="loading-skeleton absolute -right-0.5 -top-0.5 size-4 rounded-full" aria-hidden="true" /> : null}</Link>}
          {authReady ? user ? <div ref={accountRootRef} className="relative hidden lg:block"><button ref={accountTriggerRef} type="button" aria-label={`Account menu for ${user.name}`} aria-expanded={accountOpen} aria-haspopup="menu" onClick={() => { closeCategories(); setMenuOpen(false); setAccountOpen((open) => !open) }} className="flex size-10 items-center justify-center rounded-full bg-emerald-50 font-semibold text-brand transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" title={user.name}>{initials(user.name)}</button>{accountOpen ? <div role="menu" aria-label="Account menu" onKeyDown={accountMenuKeyDown} className="motion-menu absolute right-0 top-full z-[70] mt-3 w-[min(19rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-slate-100 bg-white p-2 text-sm text-slate-700 shadow-xl"><div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3"><span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-brand">{initials(user.name)}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{user.name}</p><p className="truncate text-slate-500">{user.email}</p></div></div>{signedInAccountLinks.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} role="menuitem" aria-current={pathname === item.href ? "page" : undefined} onClick={() => setAccountOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${pathname === item.href ? "bg-emerald-50 font-semibold text-brand" : "text-slate-700"}`}><Icon className="size-4 text-slate-400" aria-hidden="true" />{item.label}</Link> })}<button type="button" role="menuitem" onClick={(event) => requestSignOut(event.currentTarget)} className="flex min-h-11 w-full items-center gap-3 border-t border-slate-100 px-3 py-3 text-left text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><LogOut className="size-4" aria-hidden="true" />Sign Out</button></div> : null}</div> : <Link href={ROUTES.login} className="hidden h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:inline-flex"><UserRound className="size-4" aria-hidden="true" />Sign In</Link> : <span className="loading-skeleton hidden h-10 w-[108px] rounded-full lg:block" aria-label="Loading account" />}
          <CloseButton ref={mobileMenuTriggerRef} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" icon={menuOpen ? undefined : Menu} onClick={() => { if (menuOpen) closeMobileMenu(); else { setAccountOpen(false); closeCategories(); setMenuOpen(true) } }} className={menuOpen ? "lg:hidden" : "lg:hidden bg-brand text-white hover:bg-brand-dark focus-visible:ring-offset-2"} />
        </div>
      </Container>
      </header>

      <div className={`fixed inset-0 top-0 z-[60] lg:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!menuOpen}>
         <button type="button" tabIndex={menuOpen ? 0 : -1} aria-label="Close navigation menu" onClick={() => closeMobileMenu()} className={`absolute inset-0 bg-slate-950/35 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`} />
        <aside id="mobile-navigation" aria-label="Mobile navigation" aria-modal="true" aria-hidden={!menuOpen} inert={!menuOpen} role="dialog" className={`motion-menu absolute right-0 top-0 flex h-dvh w-[min(88vw,360px)] origin-top-right flex-col overflow-y-auto bg-white shadow-2xl ${menuOpen ? "visible scale-100 opacity-100" : "invisible scale-[0.96] opacity-0"}`}>
          <div className="flex h-[70px] items-center justify-between border-b border-slate-100 px-5">
            <Link href={ROUTES.home} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-800"><ShoppingCart className="size-7 text-brand" aria-hidden="true" />FreshCart</Link>
            <CloseButton onClick={() => closeMobileMenu()} aria-label="Close navigation menu" />
          </div>
          <form action={ROUTES.products} className="relative border-b border-slate-100 px-4 py-4" role="search">
            <label className="sr-only" htmlFor="mobile-site-search">Search products</label>
            <input id="mobile-site-search" name="keyword" type="search" placeholder="Search products..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10" />
            <button type="submit" aria-label="Search" className="motion-button absolute right-5 top-[21px] flex size-8 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-brand-dark"><Search className="size-4" aria-hidden="true" /></button>
          </form>
          <nav className="px-4 py-3" aria-label="Mobile main navigation">
            {data.navigation.map((item) => item.label === "Categories" ? <div key={item.label}>
              <button type="button" id="mobile-categories-trigger" aria-expanded={mobileCategoriesOpen} aria-controls="mobile-categories-panel" onClick={() => { setSubcategoriesRequested(true); setMobileCategoriesOpen((open) => !open) }} className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${pathname.startsWith(ROUTES.categories) ? "bg-emerald-50 font-semibold text-brand" : "text-slate-700"}`}>Categories<ChevronDown className={`size-4 transition-transform ${mobileCategoriesOpen ? "rotate-180" : ""}`} aria-hidden="true" /></button>
              {mobileCategoriesOpen ? <div id="mobile-categories-panel" role="region" aria-labelledby="mobile-categories-trigger" className="motion-menu menu-scrollbar max-h-[55vh] overflow-y-auto py-1 pl-2">{categories.isPending ? <ul role="status" aria-label="Loading categories" className="space-y-1 p-2">{Array.from({ length: 6 }, (_, index) => <li key={index}><span className="loading-skeleton block h-11 rounded" /></li>)}</ul> : categories.isError ? <div role="alert" className="p-2 text-xs text-red-600">Categories could not be loaded.<button type="button" onClick={() => void categories.refetch()} className="ml-1 underline">Retry</button></div> : categories.data.data.length === 0 ? <p className="p-2 text-xs text-slate-500">No categories available.</p> : <CategoryMenuRows categories={categories.data.data} groupedSubcategories={groupedSubcategories} expandedId={expandedCategoryId} onExpand={(id) => setExpandedCategoryId((current) => current === id ? null : id)} onChoose={() => { closeCategories(); setMenuOpen(false) }} mobile />}{allSubcategories.isPending ? <div className="px-2 pb-2" role="status" aria-label="Loading subcategories"><span className="loading-skeleton block h-8 w-2/3 rounded" /></div> : null}{allSubcategories.isError ? <div role="alert" className="p-2 text-xs text-red-600">Subcategories could not be loaded.<button type="button" onClick={() => void allSubcategories.refetch()} className="ml-1 underline">Retry</button></div> : null}<Link href={ROUTES.categories} onClick={() => { closeCategories(); setMenuOpen(false) }} className="flex min-h-11 items-center rounded-md border-t border-slate-100 px-2 text-xs font-semibold text-brand">View all categories</Link></div> : null}
            </div> : <Link key={item.label} href={item.href} aria-current={pathname === item.href || (item.href !== ROUTES.home && pathname.startsWith(item.href)) ? "page" : undefined} onClick={() => setMenuOpen(false)} className={`flex min-h-12 items-center rounded-lg px-3 text-[15px] transition hover:translate-x-1 hover:bg-emerald-50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${pathname === item.href || (item.href !== ROUTES.home && pathname.startsWith(item.href)) ? "bg-emerald-50 font-semibold text-brand" : "text-slate-700"}`}>{item.label}</Link>)}
          </nav>
          <div className="mx-4 border-t border-slate-100 pt-3">
            {authReady && user ? <Link href={ROUTES.wishlist} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-slate-700 transition hover:bg-emerald-50 hover:text-brand"><Heart className="size-5 text-rose-500" aria-hidden="true" />Wishlist{wishlist.isSuccess ? <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">{wishlistCount}</span> : null}</Link> : <Link href={loginRedirectPath(ROUTES.wishlist)} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-slate-700 transition hover:bg-emerald-50 hover:text-brand"><Heart className="size-5 text-rose-500" aria-hidden="true" />Wishlist</Link>}
            {authReady && user ? <Link href={ROUTES.cart} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-slate-700 transition hover:bg-emerald-50 hover:text-brand"><ShoppingCart className="size-5 text-brand" aria-hidden="true" />Cart{cart.isSuccess ? <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">{cartCount}</span> : null}</Link> : <Link href={loginRedirectPath(ROUTES.cart)} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-slate-700 transition hover:bg-emerald-50 hover:text-brand"><ShoppingCart className="size-5 text-brand" aria-hidden="true" />Cart</Link>}
          </div>
          {authReady ? user ? <div className="mx-4 mt-3 space-y-1 border-t border-slate-100 pt-4"><div className="mb-2 flex items-center gap-3 px-3 py-2"><span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-brand">{initials(user.name)}</span><p className="min-w-0 text-sm font-medium text-slate-700"><span className="block truncate">{user.name}</span><span className="block truncate font-normal text-slate-500">{user.email}</span></p></div>{signedInAccountLinks.filter((item) => item.label !== "My Wishlist" && item.label !== "Cart").map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMenuOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-emerald-50 hover:text-brand ${pathname === item.href ? "bg-emerald-50 font-semibold text-brand" : "text-slate-700"}`}><Icon className="size-4 text-slate-400" aria-hidden="true" />{item.label}</Link> })}<button type="button" onClick={(event) => requestSignOut(event.currentTarget)} className="flex min-h-11 w-full items-center gap-3 rounded-lg border-t border-slate-100 px-3 text-left text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><LogOut className="size-5" aria-hidden="true" />Sign Out</button></div> : <div className="mx-4 mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5"><Link href={ROUTES.login} onClick={() => setMenuOpen(false)} className="flex h-12 items-center justify-center rounded-xl bg-brand font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md">Sign In</Link><Link href={ROUTES.register} onClick={() => setMenuOpen(false)} className="flex h-12 items-center justify-center rounded-xl border border-brand font-semibold text-brand transition hover:bg-emerald-50">Sign Up</Link></div> : <div className="mx-4 mt-3 space-y-3 border-t border-slate-100 pt-5" role="status" aria-label="Loading account"><span className="loading-skeleton block h-11 w-full rounded-xl" /><span className="loading-skeleton block h-11 w-full rounded-xl" /><span className="loading-skeleton block h-10 w-2/3 rounded-xl" /></div>}
          <a aria-label={`Email FreshCart support at ${data.email}`} href={`mailto:${data.email}`} onClick={() => setMenuOpen(false)} className="m-4 mt-6 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm transition hover:border-emerald-200">
            <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-brand"><Headset className="size-5" aria-hidden="true" /></span>
            <span className="text-slate-700">Need Help?<span className="block text-brand">Contact Support</span></span>
          </a>
        </aside>
      </div>
      <ConfirmDialog
        open={confirmSignOutOpen}
        onOpenChange={setConfirmSignOutOpen}
        title="Sign out?"
        description="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmSignOut}
        returnFocusRef={signOutTriggerRef}
      />
    </>
  )
}

