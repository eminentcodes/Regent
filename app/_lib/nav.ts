/** Only same-site, single-slash paths are accepted as post-sign-in destinations. */
export function safeNextPath(value: string | undefined | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return '/chat'
  try {
    const url = new URL(value, 'https://regent.invalid')
    if (url.origin !== 'https://regent.invalid') return '/chat'
    return url.pathname + url.search + url.hash
  } catch {
    return '/chat'
  }
}
