/**
 * Middleware for protecting admin routes
 * Ensures only authenticated users can access admin areas
 * Role/capability checks are handled in individual page components
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './src/lib/auth'

export function middleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow access to studio (content editors need this)
  if (request.nextUrl.pathname.startsWith('/admin/studio')) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Verify token
  const payload = verifyToken(token)
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
  ],
}
