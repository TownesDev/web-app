import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirect') || '/'

  // Build absolute URL for redirect (middleware/NextResponse requires absolute)
  const absolute = new URL(redirectTo, request.url).toString()

  const res = NextResponse.redirect(absolute)
  // Set a short-lived bypass cookie for testers (Path=/ so site reads it)
  // Cookie expires in 7 days
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  res.cookies.set('maintenance-bypass', 'allow', {
    httpOnly: false,
    path: '/',
    expires: expiry,
  })

  return res
}
