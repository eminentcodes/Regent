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

const regentUrl = siteOrigin('NEXT_PUBLIC_REGENT_URL', 'http://localhost:3002');
const storeUrl = siteOrigin('NEXT_PUBLIC_STORE_URL', 'http://localhost:3003');
if (regentUrl === storeUrl) throw new Error('Regent and Regency Stores need different site origins.');

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
