import { NextResponse, type NextRequest } from 'next/server'
import { REGENT_URL } from './config/sites'

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (process.env.REGENT_SITE === 'store') {
    // The independent storefront does not serve account or memory APIs.
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const destination = new URL(REGENT_URL)
    destination.pathname = pathname
    destination.search = search
    return NextResponse.redirect(destination)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/store/:path*', '/chat/:path*', '/memory/:path*', '/shared/:path*', '/admin/:path*', '/login', '/register', '/api/:path*'],
}
