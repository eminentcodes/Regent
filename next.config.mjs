const isStore = process.env.REGENT_SITE === 'store';

function siteOrigin(name, fallback) {
  const value = process.env[name] || fallback;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute http(s) site URL.`);
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an http(s) origin without a path, credentials, query, or fragment.`);
  }
  return url.origin;
}

/**
 * The storefront is a page inside this app at /store, so its link is normally a
 * path. It only needs an absolute origin when it is deployed as its own site.
 */
function storeTarget(name, fallback) {
  const value = process.env[name] || fallback;
  if (value.startsWith('//')) throw new Error(`${name} must not be a protocol-relative URL.`);
  if (value.startsWith('/')) return value.replace(/\/+$/, '') || '/';
  return siteOrigin(name, value);
}

/**
 * When NEXT_PUBLIC_REGENT_URL is not set, fall back to the deployment's own
 * host instead of localhost so links keep working on Vercel.
 */
function defaultRegentUrl() {
  const host =
    (process.env.VERCEL_ENV === 'production' ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL) ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  return host ? 'https://' + host.replace(/^https?:\/\//, '') : 'http://localhost:3002';
}

const regentUrl = siteOrigin('NEXT_PUBLIC_REGENT_URL', defaultRegentUrl());
const storeUrl = storeTarget('NEXT_PUBLIC_STORE_URL', '/store');
if (storeUrl.startsWith('http') && storeUrl === regentUrl) {
  throw new Error('Regent and Regency Stores need different site origins.');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  distDir: isStore ? '.next-store' : '.next',
  // These non-secret values are fixed per build, including in the routing proxy.
  env: {
    REGENT_SITE: isStore ? 'store' : 'app',
    NEXT_PUBLIC_REGENT_URL: regentUrl,
    NEXT_PUBLIC_STORE_URL: storeUrl,
  },
};

export default nextConfig;