import { REGENT_URL, STORE_URL } from '@/config/sites'

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

// When the storefront is served from this same app (the normal deployment) the
// chat link stays on this origin, so the browser keeps the same session and the
// same saved shopping list. Only a separately hosted store needs REGENT_URL.
const STORE_SHARES_ORIGIN = !/^https?:\/\//i.test(STORE_URL)

/** Prefill a draft. Passing { send: true } hands the draft straight to Reggie. */
export function chatHref(message?: string, options?: { send?: boolean }): string {
  const base = STORE_SHARES_ORIGIN ? '' : REGENT_URL
  const params = new URLSearchParams()
  if (message) params.set('message', message)
  if (options?.send) params.set('send', '1')
  const query = params.toString()
  return base + '/chat' + (query ? '?' + query : '')
}
