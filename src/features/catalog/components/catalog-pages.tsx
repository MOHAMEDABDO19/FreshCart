"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import { Container } from "@/components/layout/container"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { getRevealDelay, MOTION } from "@/constants/motion"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { homePageData } from "@/features/home/data/home-page.data"
import { ServiceBenefits } from "@/features/home/components/service-benefits"
import { ProductCard } from "@/features/home/components/featured-products"
import { useBrands } from "@/features/brands/hooks/use-brands"
import { useCategories, useCategoryById } from "@/features/categories/hooks/use-categories"
import { useProducts } from "@/features/products/hooks/use-products"
import { useAllSubCategories } from "@/features/subcategories/hooks/use-subcategories"
import { SUBCATEGORY_FILTER_SUPPORTED } from "@/constants/catalog"
import { brandPath, categoryPath, productPath, ROUTES, subcategoriesPath, subcategoryBrowsePath } from "@/constants/routes"

function CatalogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = homePageData
  return <><SiteHeader data={data.header} /><main id="main-content">{children}</main><ServiceBenefits items={data.bottomBenefits} variant="strip" /><SiteFooter data={data.footer} /></>
}

function CatalogHero({ title, description, tone = "green" }: { title: string; description: string; tone?: "green" | "purple" }) {
  return <section className={`bg-gradient-to-r ${tone === "green" ? "from-emerald-600 to-green-400" : "from-violet-600 to-purple-400"} py-7 text-white md:py-9`}><Container><p className="text-sm text-white/80"><Link href={ROUTES.home}>Home</Link><span className="mx-2">/</span>{title}</p><ScrollReveal as="h1" className="mt-3 text-2xl font-bold md:text-3xl">{title}</ScrollReveal><ScrollReveal as="p" delayMs={MOTION.subtitleDelayMs} className="mt-1.5 text-sm md:text-base">{description}</ScrollReveal></Container></section>
}

function QueryState({ pending, error, empty }: { pending: boolean; error: boolean; empty: boolean }) {
  if (pending) return <LoadingSpinner />
  if (error) return <p className="py-16 text-center text-sm text-slate-500" role="alert">Could not load this content.</p>
  if (empty) return <p className="py-16 text-center text-sm text-slate-500">No items available.</p>
  return null
}

export function CategoriesPage() {
  const query = useCategories()
  const categories = query.data?.data ?? []
  return <CatalogLayout><CatalogHero title="Categories" description="Browse our wide range of product categories" /><Container><Link href={ROUTES.home} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><ArrowLeft className="size-4" aria-hidden="true" />Back to Home</Link><QueryState pending={query.isPending} error={query.isError} empty={!query.isPending && !query.isError && categories.length === 0} />{!query.isPending && !query.isError && <div className="grid grid-cols-2 items-stretch gap-3 py-6 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">{categories.map((category, index) => <ScrollReveal key={category._id} delayMs={getRevealDelay(index)} className="h-full"><article className="motion-card group flex h-full min-w-0 flex-col rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm sm:p-4"><Link href={categoryPath(category._id)} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50"><Image src={category.image} alt={category.name} fill sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 220px" className="motion-card-image object-cover" /></div><h2 className="mt-3 line-clamp-2 min-h-10 font-semibold text-sm text-slate-800 sm:min-h-12 sm:text-base">{category.name}</h2></Link><Link href={subcategoriesPath(category._id)} className="mt-auto inline-flex min-h-9 items-center justify-center pt-1 text-xs text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">View Subcategories →</Link></article></ScrollReveal>)}</div>}</Container></CatalogLayout>
}

export function SubcategoriesPage({ categoryId }: { categoryId: string }) {
  const categoryQuery = useCategoryById(categoryId)
  const subcategoriesQuery = useAllSubCategories()
  const category = categoryQuery.data?.data
  const items = subcategoriesQuery.data?.filter((item) => item.category === categoryId) ?? []
  const categoryNotFound = axios.isAxiosError(categoryQuery.error) && categoryQuery.error.response?.status === 404
  const categoryUnavailable = categoryQuery.isError && !categoryNotFound
  const subcategoriesUnavailable = subcategoriesQuery.isError
  return <CatalogLayout><CatalogHero title={category?.name ? `${category.name} Subcategories` : "Subcategories"} description={category?.name ? `Browse subcategories in ${category.name}` : "Browse subcategories"} /><Container><div className="mx-auto max-w-5xl py-6 md:py-8">
    <Link href={ROUTES.categories} className="mb-4 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><ArrowLeft className="size-4" aria-hidden="true" />Back to Categories</Link><nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500"><Link className="hover:text-brand" href={ROUTES.home}>Home</Link><span aria-hidden="true">/</span><Link className="hover:text-brand" href={ROUTES.categories}>Categories</Link>{category ? <><span aria-hidden="true">/</span><span aria-current="page" className="text-slate-700">{category.name}</span></> : null}</nav>
    {categoryQuery.isPending ? <div className="mb-5 h-14 animate-pulse rounded-xl bg-slate-100" aria-label="Loading category" role="status" /> : null}
    {categoryNotFound ? <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-7"><h2 className="text-lg font-semibold text-slate-800">Category not found</h2><p className="mt-2 text-sm text-slate-500">This category may have been removed or the link may be invalid.</p><Link href={ROUTES.categories} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">Back to Categories</Link></div> : null}
    {categoryUnavailable ? <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center sm:p-7" role="alert"><p className="text-sm text-slate-600">Could not load this category.</p><button type="button" onClick={() => void categoryQuery.refetch()} className="mt-3 min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Retry</button></div> : null}
    {!categoryQuery.isPending && !categoryQuery.isError && (subcategoriesUnavailable ? <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center sm:p-7" role="alert"><p className="text-sm text-slate-600">Could not load subcategories.</p><button type="button" onClick={() => void subcategoriesQuery.refetch()} className="mt-3 min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Retry</button></div> : subcategoriesQuery.isPending ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" role="status" aria-label="Loading subcategories" />)}</div> : items.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-7"><h2 className="text-lg font-semibold text-slate-800">No subcategories yet</h2><p className="mt-2 text-sm text-slate-500">Browse products in {category?.name ?? "this category"} instead.</p><Link href={categoryPath(categoryId)} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">Browse Category Products</Link></div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">{items.map((item, index) => <ScrollReveal key={item._id} delayMs={getRevealDelay(index)} className="h-full"><Link href={subcategoryBrowsePath(item._id, categoryId)} title={`Browse ${item.name}`} className="group flex min-h-14 h-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-brand hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:min-h-16 sm:px-4 sm:text-base">{item.name}</Link></ScrollReveal>)}</div>)}
  </div></Container></CatalogLayout>
}

export function BrandsPage() {
  const query = useBrands()
  const brands = query.data?.data ?? []
  return <CatalogLayout><CatalogHero title="Top Brands" description="Shop from your favorite brands" tone="purple" /><Container><QueryState pending={query.isPending} error={query.isError} empty={!query.isPending && !query.isError && brands.length === 0} />{!query.isPending && !query.isError && <div className="grid grid-cols-2 items-stretch gap-3 py-6 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">{brands.map((brand, index) => <ScrollReveal key={brand._id} delayMs={getRevealDelay(index)} className="h-full"><Link href={brandPath(brand._id)} className="group flex h-full min-w-0 flex-col rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-4"><div className="relative aspect-square w-full rounded-xl bg-slate-50 p-4 sm:p-6"><Image src={brand.image} alt={brand.name} fill sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 180px" className="object-contain p-6 transition-transform duration-300 group-hover:scale-105" /></div><h2 className="mt-3 line-clamp-2 min-h-10 font-medium text-sm text-slate-800 sm:text-base">{brand.name}</h2></Link></ScrollReveal>)}</div>}</Container></CatalogLayout>
}

function ProductsGrid({ params }: { params?: Parameters<typeof useProducts>[0] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = useProducts(params)
  const products = query.data?.data ?? []
  const pageCount = query.data?.metadata.numberOfPages ?? 0
  const currentPage = query.data?.metadata.currentPage ?? 1
  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams.toString())
    next.set("page", String(page))
    router.push(`${pathname}?${next.toString()}`)
  }
  return <><QueryState pending={query.isPending} error={query.isError} empty={!query.isPending && !query.isError && products.length === 0} />{!query.isPending && !query.isError && products.length > 0 ? <><div className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">{products.map((product) => <ProductCard key={product._id} product={product} productHref={product._id ? productPath(product._id) : undefined} />)}</div>{pageCount > 1 ? <nav aria-label="Product pages" className="flex justify-center gap-2 pb-8"><button type="button" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)} className="rounded-md border border-slate-200 px-3 py-2 disabled:opacity-40">Previous</button><span className="px-3 py-2" aria-current="page">{currentPage} / {pageCount}</span><button type="button" disabled={currentPage >= pageCount} onClick={() => goToPage(currentPage + 1)} className="rounded-md border border-slate-200 px-3 py-2 disabled:opacity-40">Next</button></nav> : null}</> : null}</>
}

export function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const brand = searchParams.get("brand")
  const category = searchParams.get("category")
  const subcategory = searchParams.get("subcategory")
  const keyword = searchParams.get("keyword")
  const min = searchParams.get("min")
  const max = searchParams.get("max")
  const sort = searchParams.get("sort")
  const page = Number(searchParams.get("page") || 1)
  const params = {
    limit: 40,
    ...(Number.isInteger(page) && page > 0 ? { page } : {}),
    ...(keyword ? { keyword } : {}),
    ...(sort ? { sort } : {}),
    ...(brand ? { brand } : {}),
    ...(category ? { "category[in]": category } : {}),
    ...(SUBCATEGORY_FILTER_SUPPORTED && subcategory ? { subcategory } : {}),
    ...(min ? { "price[gte]": Number(min) } : {}),
    ...(max ? { "price[lte]": Number(max) } : {}),
  }
  const categories = useCategories()
  const brands = useBrands()
  const currentCategory = category ?? ""
  const currentBrand = brand ?? ""
  const currentMin = min ?? ""
  const currentMax = max ?? ""
  const currentKeyword = keyword ?? ""
  const currentSort = sort ?? ""
  return <CatalogLayout><CatalogHero title={keyword ? "Search Results" : "All Products"} description={keyword ? `Products matching “${keyword}”` : "Explore our complete product collection"} /><Container><div className="grid gap-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)]"><ScrollReveal as="aside" className="h-fit rounded-xl border border-slate-100 p-5"><form action={ROUTES.products} className="space-y-5">{SUBCATEGORY_FILTER_SUPPORTED && subcategory ? <input type="hidden" name="subcategory" value={subcategory} /> : null}<label className="block text-sm font-medium">Search products<input name="keyword" defaultValue={currentKeyword} placeholder="Search products..." className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3" /></label><fieldset><legend className="mb-3 font-semibold">Categories</legend><select name="category" defaultValue={currentCategory} className="h-10 w-full rounded-lg border border-slate-200 px-3"><option value="">All categories</option>{(categories.data?.data ?? []).map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></fieldset><fieldset><legend className="mb-3 font-semibold">Price Range</legend><label className="sr-only" htmlFor="min">Min (EGP)</label><input id="min" name="min" type="number" min="0" defaultValue={currentMin} placeholder="Min (EGP)" className="mb-2 h-10 w-full rounded-lg border border-slate-200 px-3" /><label className="sr-only" htmlFor="max">Max (EGP)</label><input id="max" name="max" type="number" min="0" defaultValue={currentMax} placeholder="Max (EGP)" className="h-10 w-full rounded-lg border border-slate-200 px-3" /></fieldset><fieldset><legend className="mb-3 font-semibold">Brands</legend><select name="brand" defaultValue={currentBrand} className="h-10 w-full rounded-lg border border-slate-200 px-3"><option value="">All brands</option>{(brands.data?.data ?? []).map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></fieldset><button className="motion-button w-full rounded-lg bg-brand px-4 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Apply Filters</button></form></ScrollReveal><section aria-label="Product results"><div className="mb-4 flex justify-end"><label className="flex items-center gap-2 text-sm text-slate-500">Sort by:<select aria-label="Sort products" value={currentSort} onChange={(event) => { const next = new URLSearchParams(searchParams.toString()); if (event.target.value) next.set("sort", event.target.value); else next.delete("sort"); next.delete("page"); router.push(`${ROUTES.products}?${next.toString()}`) }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-700"><option value="">Relevance</option><option value="price">Price: low to high</option><option value="-price">Price: high to low</option></select></label></div><ProductsGrid params={params} /></section></div></Container></CatalogLayout>
}
