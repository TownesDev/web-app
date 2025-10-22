import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirect') || '/'

  const res = NextResponse.redirect(redirectTo)
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
