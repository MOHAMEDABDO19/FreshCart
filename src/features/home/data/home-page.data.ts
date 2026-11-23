import type { HomePageData } from "@/features/home/types/home-page.types"

import { FRESHCART_ANNOUNCEMENTS, HOME_PROMOTIONS, SUPPORT_EMAIL } from "@/constants/freshcart"
import { keywordPath, ROUTES } from "@/constants/routes"

export const homePageData = {
  header: {
    announcements: [...FRESHCART_ANNOUNCEMENTS],
    email: SUPPORT_EMAIL,
    navigation: [
      { label: "Home", href: ROUTES.home },
      { label: "Shop", href: ROUTES.products },
      { label: "Categories", href: ROUTES.categories },
      { label: "Brands", href: ROUTES.brands },
    ],
  },
  hero: {
    title: "Fresh Products Delivered to your Door",
    description: "Get 20% off your first order",
    primaryAction: { label: "Shop Now", href: ROUTES.products },
    secondaryAction: { label: "View Deals", href: ROUTES.products },
  },
  topBenefits: [
    { title: "Free Shipping", description: "On orders over 500 EGP", icon: "truck", tone: "blue" },
    { title: "Secure Payment", description: "100% secure transactions", icon: "shield", tone: "green" },
    { title: "Easy Returns", description: "14-day return policy", icon: "return", tone: "orange" },
    { title: "24/7 Support", description: "Dedicated support team", icon: "support", tone: "purple" },
  ],
  categoryTitle: "Shop By Category",
  promotions: [
    {
      badge: HOME_PROMOTIONS[0].badge,
      icon: "flame",
      title: HOME_PROMOTIONS[0].title,
      description: HOME_PROMOTIONS[0].description,
      offer: HOME_PROMOTIONS[0].offer,
      code: HOME_PROMOTIONS[0].code,
      action: { label: HOME_PROMOTIONS[0].actionLabel, href: keywordPath(HOME_PROMOTIONS[0].searchTerm) },
      tone: "green",
    },
    {
      badge: HOME_PROMOTIONS[1].badge,
      icon: "sparkles",
      title: HOME_PROMOTIONS[1].title,
      description: HOME_PROMOTIONS[1].description,
      offer: HOME_PROMOTIONS[1].offer,
      code: HOME_PROMOTIONS[1].code,
      action: { label: HOME_PROMOTIONS[1].actionLabel, href: keywordPath(HOME_PROMOTIONS[1].searchTerm) },
      tone: "orange",
    },
  ],
  productsTitle: "Featured Products",
  newsletter: {
    subscriberCount: "50,000+ subscribers",
    title: "Get the Freshest Updates Delivered Free",
    description: "Weekly recipes, seasonal offers & exclusive member perks.",
    benefits: ["Fresh Picks Weekly", "Free Delivery Codes", "Members-Only Deals"],
    mobileTitle: "Shop Faster on Our App",
    mobileDescription: "Get app-exclusive deals & 15% off your first order.",
    appDownloads: "4.9 · 100K+ downloads",
  },
  bottomBenefits: [
    { title: "Free Shipping", description: "On orders over 500 EGP", icon: "truck", tone: "green" },
    { title: "Easy Returns", description: "14-day return policy", icon: "return", tone: "green" },
    { title: "Secure Payment", description: "100% secure checkout", icon: "shield", tone: "green" },
    { title: "24/7 Support", description: "Contact us anytime", icon: "support", tone: "green" },
  ],
  footer: {
    description: "FreshCart is your one-stop destination for quality products. From fashion to electronics, we bring you the best brands at competitive prices with a seamless shopping experience.",
    email: SUPPORT_EMAIL,
    address: "123 Commerce Street, New York, NY 10001",
    columns: [
      { title: "Shop", links: [{ label: "All Products", href: ROUTES.products }, { label: "Categories", href: ROUTES.categories }, { label: "Brands", href: ROUTES.brands }, { label: "Electronics", href: ROUTES.products }, { label: "Men's Fashion", href: ROUTES.products }, { label: "Women's Fashion", href: ROUTES.products }] },
      { title: "Account", links: [{ label: "My Account", href: ROUTES.accountProfile }, { label: "Order History", href: ROUTES.orders }, { label: "Wishlist", href: ROUTES.wishlist }, { label: "Shopping Cart", href: ROUTES.cart }, { label: "Checkout", href: ROUTES.checkout }, { label: "Addresses", href: ROUTES.accountAddresses }, { label: "Settings", href: ROUTES.accountSettings }, { label: "Sign In", href: ROUTES.login }, { label: "Create Account", href: ROUTES.register }] },
      { title: "Support", links: [{ label: "Contact Us", href: ROUTES.contact }, { label: "Help Center", href: ROUTES.faq }, { label: "Shipping Info", href: ROUTES.shippingReturns }, { label: "Returns & Refunds", href: ROUTES.shippingReturns }, { label: "Track Order", href: "" }] },
      { title: "Legal", links: [{ label: "Privacy Policy", href: ROUTES.privacy }, { label: "Terms of Service", href: ROUTES.terms }] },
    ],
    copyright: "© 2026 FreshCart. All rights reserved.",
    paymentMethods: ["Visa", "Mastercard", "PayPal"],
  },
} satisfies HomePageData
