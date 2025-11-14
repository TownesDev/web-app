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
      process.env.JWT_SECRET || 'default-secret'
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

  // Onboarding/billing gating for portal routes, with path exceptions
  if (pathname.startsWith('/app')) {
    // Allow access to onboarding flow without subscription check
    const exemptPaths = ['/app/onboarding']
    const isExempt = exemptPaths.some((p) => pathname.startsWith(p))

    if (!isExempt) {
      try {
        const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
        const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
        const apiVersion =
          process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
        const sanityToken = process.env.SANITY_READ_TOKEN

        if (projectId && sanityToken) {
          const query = encodeURIComponent(
            '*[_type=="client" && user._ref==$userId][0]{onboardingStatus,hasActiveSubscription}'
          )
          const url = `https://${projectId}.api.sanity.io/${apiVersion}/data/query/${dataset}?query=${query}&%24userId=${encodeURIComponent(
            payload.id
          )}`
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${sanityToken}` },
            // Edge runtime safe
            cache: 'no-store',
          })
          if (res.ok) {
            const json = (await res.json()) as {
              result?: {
                onboardingStatus?: string
                hasActiveSubscription?: boolean
              }
            }
            const client = json.result
            // If client doesn't exist or onboarding not completed, redirect to onboarding
            if (!client || client.onboardingStatus !== 'completed') {
              return NextResponse.redirect(
                new URL('/app/onboarding', request.url)
              )
            }
            // If onboarding is complete but no active subscription, redirect to pricing
            // Only redirect if hasActiveSubscription is explicitly false (graceful degradation)
            if (
              client.onboardingStatus === 'completed' &&
              client.hasActiveSubscription === false
            ) {
              return NextResponse.redirect(new URL('/pricing', request.url))
            }
          }
        }
      } catch {
        // Fail open to avoid accidental loops or hard blocks when CMS is unavailable
      }
    }
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
