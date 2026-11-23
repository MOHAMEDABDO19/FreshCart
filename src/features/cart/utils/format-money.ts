export const CART_CURRENCY = "EGP"

export function formatMoney(amount: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount)} ${CART_CURRENCY}`
}
