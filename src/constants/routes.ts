import { SUBCATEGORY_FILTER_SUPPORTED } from "@/constants/catalog"

export const ROUTES = {
  home: "/",
  products: "/products",
  categories: "/categories",
  brands: "/brands",
  cart: "/cart",
  wishlist: "/wishlist",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  verifyResetCode: "/verify-reset-code",
  resetPassword: "/reset-password",
  search: "/search",
  account: "/account",
  accountProfile: "/account/profile",
  accountAddresses: "/account/addresses",
  accountSettings: "/account/settings",
  orders: "/orders",
  checkout: "/checkout",
  contact: "/contact",
  faq: "/faq",
  shippingReturns: "/shipping-returns",
  privacy: "/privacy",
  terms: "/terms",
} as const

export const productPath = (id: string) => `${ROUTES.products}/${encodeURIComponent(id)}`
export const categoryPath = (id: string) => `${ROUTES.products}?category=${encodeURIComponent(id)}`
export const brandPath = (id: string) => `${ROUTES.products}?brand=${encodeURIComponent(id)}`
export const subcategoryPath = (id: string) => `${ROUTES.products}?subcategory=${encodeURIComponent(id)}`
export const subcategoryBrowsePath = (id: string, parentCategoryId: string) =>
  SUBCATEGORY_FILTER_SUPPORTED ? subcategoryPath(id) : categoryPath(parentCategoryId)
export const subcategoriesPath = (categoryId: string) => `${ROUTES.categories}/${encodeURIComponent(categoryId)}/subcategories`
export const loginRedirectPath = (path: string) => `${ROUTES.login}?redirect=${encodeURIComponent(path)}`
export const keywordPath = (keyword: string) => `${ROUTES.products}?keyword=${encodeURIComponent(keyword)}`

