"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, TriangleAlert } from "lucide-react"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { ApiErrorSchema } from "@/schemas/api-error.schema"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { getRevealDelay } from "@/constants/motion"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { categoryPath, ROUTES } from "@/constants/routes"

export function CategoriesSection({ title }: { title: string }) {
  const { data, isPending, isError, error, refetch } = useCategories()

  return (
    <section id="categories" aria-labelledby="categories-heading" className="py-10 md:py-12 lg:py-14">
      <Container>
      <div className="mb-6 flex flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <ScrollReveal as="h2" id="categories-heading" className="motion-accent relative pl-3 text-xl font-bold tracking-tight text-slate-800 before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:origin-bottom before:scale-y-100 before:rounded-full before:bg-brand sm:text-2xl lg:text-[27px]">
          {title.split("Category")[0]}<span className="text-brand">Category</span>
        </ScrollReveal>
        <Link href={ROUTES.categories} className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-brand hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:text-sm">
          View All Categories <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {isPending ? <LoadingSkeleton kind="categories" /> : null}

      {isError ? (
        <div role="alert" className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-slate-100 bg-slate-50 text-center">
          <TriangleAlert className="size-5 text-brand" aria-hidden="true" />
          <p className="text-sm text-slate-600">{getCategoryErrorMessage(error)}</p>
          <button type="button" onClick={() => void refetch()} className="rounded-md px-3 py-1.5 text-sm font-semibold text-brand hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Try again</button>
        </div>
      ) : null}

      {!isPending && !isError && data?.data.length === 0 ? (
        <p className="rounded-xl border border-slate-100 bg-slate-50 py-12 text-center text-sm text-slate-500">No categories available.</p>
      ) : null}

      {!isPending && !isError && data?.data.length ? (
        <ul className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-6 md:grid-cols-5 lg:grid-cols-6 lg:gap-x-6 lg:gap-y-8">
          {data.data.map((category, index) => (
            <ScrollReveal as="li" key={category._id} delayMs={getRevealDelay(index)} className="h-full">
              <Link href={categoryPath(category._id)} className="group block h-full rounded-xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              <article className="category-card flex h-full flex-col items-center gap-2 rounded-xl px-1 py-1">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-slate-50 shadow-sm ring-1 ring-slate-100 sm:size-20 lg:size-24">
                  <Image src={category.image} alt={category.name} fill sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px" className="motion-card-image object-cover" />
                </div>
                <h3 className="line-clamp-2 min-h-8 text-center text-xs font-semibold leading-tight text-slate-700 group-hover:text-brand sm:text-sm">{category.name}</h3>
              </article>
              </Link>
            </ScrollReveal>
          ))}
        </ul>
      ) : null}
      </Container>
    </section>
  )
}

function getCategoryErrorMessage(error: Error) {
  if ("response" in error && typeof error.response === "object" && error.response !== null && "data" in error.response) {
    const parsed = ApiErrorSchema.safeParse(error.response.data)
    if (parsed.success) return parsed.data.message
  }

  return "Categories could not be loaded."
}
