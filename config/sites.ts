/** Set both public origins before building the two production deployments. */
export const REGENT_URL = (process.env.NEXT_PUBLIC_REGENT_URL || 'http://localhost:3002').replace(/\/+$/, '')
// The storefront lives inside this same app at /store, so the link is just a
// page. Set NEXT_PUBLIC_STORE_URL only if you deploy it as its own site.
export const STORE_URL = (process.env.NEXT_PUBLIC_STORE_URL || '/store').replace(/\/+$/, '')
export const WALRUS_MEMORY_URL = 'https://memory.walrus.xyz'
