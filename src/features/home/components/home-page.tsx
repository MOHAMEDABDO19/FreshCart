import { homePageData } from "@/features/home/data/home-page.data"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSection } from "@/features/home/components/hero-section"
import { ServiceBenefits } from "@/features/home/components/service-benefits"
import { CategoriesSection } from "@/features/home/components/categories-section"
import { PromotionalBanners } from "@/features/home/components/promotional-banners"
import { FeaturedProducts } from "@/features/home/components/featured-products"
import { NewsletterAppPromo } from "@/features/home/components/newsletter-app-promo"
import { SiteFooter } from "@/components/layout/site-footer"

export function HomePage() {
  const data = homePageData

  return (
    <>
      <SiteHeader data={data.header} />
      <main id="main-content">
        <HeroSection data={data.hero} />
        <ServiceBenefits items={data.topBenefits} variant="cards" />
        <CategoriesSection title={data.categoryTitle} />
        <PromotionalBanners items={data.promotions} />
        <FeaturedProducts title={data.productsTitle} />
        <NewsletterAppPromo data={data.newsletter} />
      </main>
      <ServiceBenefits items={data.bottomBenefits} variant="strip" />
      <SiteFooter data={data.footer} />
    </>
  )
}
