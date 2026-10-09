import { REGENT_URL } from '@/config/sites'

export type StoreProduct = {
  id: string
  name: string
  title: string
  size: string
  price: number
  category: string
  image: string
  imageAlt: string
}

export type StoreCategory = {
  id: string
  label: string
  count: number
}

export const STORE_LOCATION = 'Lagos, Nigeria'

export function formatNaira(amount: number): string {
  return '₦' + new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(amount)
}

/** Prefill a draft. Visiting a product link never sends a message. */
export function chatHref(message?: string): string {
  return REGENT_URL + (message ? '/chat?message=' + encodeURIComponent(message) : '/chat')
}
