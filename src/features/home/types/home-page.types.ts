export type HeaderLink = {
  label: string
  href: string
}

export type HeaderData = {
  announcements: string[]
  email: string
  navigation: HeaderLink[]
}

export type HeroData = {
  title: string
  description: string
  imageSrc?: string
  primaryAction: HeaderLink
  secondaryAction: HeaderLink
}

export type BenefitData = {
  title: string
  description: string
  icon: "truck" | "shield" | "return" | "support"
  tone: "blue" | "green" | "orange" | "purple"
}

export type PromotionData = {
  badge: string
  icon: "flame" | "sparkles"
  title: string
  description: string
  offer: string
  code: string
  action: HeaderLink
  tone: "green" | "orange"
}

export type NewsletterData = {
  subscriberCount: string
  title: string
  description: string
  benefits: string[]
  mobileTitle: string
  mobileDescription: string
  appDownloads: string
}

export type FooterColumn = {
  title: string
  links: HeaderLink[]
}

export type FooterData = {
  description: string
  email: string
  address: string
  columns: FooterColumn[]
  copyright: string
  paymentMethods: string[]
}

export type HomePageData = {
  header: HeaderData
  hero: HeroData
  topBenefits: BenefitData[]
  categoryTitle: string
  promotions: PromotionData[]
  productsTitle: string
  newsletter: NewsletterData
  bottomBenefits: BenefitData[]
  footer: FooterData
}
