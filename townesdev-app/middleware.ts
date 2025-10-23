/**
 * Middleware for protecting admin and portal routes
 * Ensures only authenticated users can access protected areas
 * Role/capability checks are handled in individual page components and layouts
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default-secret',
    )
    const { payload } = await jwtVerify(token, secret)
    const { id, email, name } = payload as {
      id: string
      email: string
      name: string
    }
    return { id, email, name }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect admin and portal routes
  const isProtectedRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/app')

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Allow access to studio (content editors need this)
  if (pathname.startsWith('/admin/studio')) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Verify token (use WebCrypto-friendly jose in Edge runtime)
  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Add user info to headers for downstream use
  const response = NextResponse.next()
  response.headers.set('x-user-id', payload.id)
  response.headers.set('x-user-email', payload.email)
  response.headers.set('x-user-name', payload.name)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/admin/:path*',
    '/app/:path*',
  ],
}
