/** Set both public origins before building the two production deployments. */
function regentOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_REGENT_URL
  if (configured) return configured
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (host) return 'https://' + host.replace(/^https?:\/\//, '')
  return 'http://localhost:3002'
}

export const REGENT_URL = regentOrigin().replace(/\/+$/, '')
// The storefront lives inside this same app at /store, so the link is just a
// page. Set NEXT_PUBLIC_STORE_URL only if you deploy it as its own site.
export const STORE_URL = (process.env.NEXT_PUBLIC_STORE_URL || '/store').replace(/\/+$/, '')
export const WALRUS_MEMORY_URL = 'https://memory.walrus.xyz'
